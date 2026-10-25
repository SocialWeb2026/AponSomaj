import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolvePlayableMediaUrl, isLikelyVideoUrl } from './mediaStorageService';
import {
  User,
  Post,
  Comment,
  Friendship,
  Message,
  Notification,
  ReactionType,
  LocationTag,
  Group,
  Page,
  Job,
  MarketplaceListing,
  MatrimonyProfile,
  Story,
  LabourCategory,
  LabourSkill,
  LabourProfile,
  LabourJobPost,
  LabourApplication,
  LabourContactRequest,
  LabourReport,
} from '../types';

/**
 * ============================================================================
 * Apon Somaj — Supabase Data Service
 * Safe, type-mapped integration between Supabase PostgreSQL and Frontend State
 * ============================================================================
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

// ----------------------------------------------------------------------------
// 1. Auth & Profiles
// ----------------------------------------------------------------------------

export async function getCurrentSupabaseUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session.user;
}

export async function syncUserProfileFromAuth(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  phone?: string;
}): Promise<User> {
  const existingProfile = await fetchProfileFromDb(authUser.id);
  if (existingProfile) {
    return existingProfile;
  }

  const meta = authUser.user_metadata || {};
  const name = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'সদস্য';
  const username = meta.username || `user_${authUser.id.slice(0, 8)}`;
  const phone = meta.phone || authUser.phone || '';

  const synthesized: User = {
    id: authUser.id,
    name,
    bnName: meta.bn_name || name,
    username,
    email: authUser.email || '',
    phone,
    avatar: meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    coverPhoto: meta.cover_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    bio: 'আপন সমাজে নতুন সদস্য 🌿',
    hometown: 'ঢাকা',
    currentDistrict: 'ঢাকা',
    role: 'user',
    isVerified: false,
    joinedDate: 'আজ',
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
  };

  updateProfileInDb(authUser.id, synthesized).catch(() => {});
  return synthesized;
}

export async function fetchProfileFromDb(userId: string): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return null;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) return null;

    // Fetch user location if available
    const { data: locData } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    const primaryLoc = locData && locData.length > 0 ? locData[0] : null;

    return {
      id: profile.id,
      name: profile.full_name || 'সদস্য',
      bnName: profile.bn_name || profile.full_name,
      username: profile.username || `user_${profile.id.slice(0, 8)}`,
      email: '',
      phone: profile.phone || '',
      avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      coverPhoto: profile.cover_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
      bio: profile.bio || '',
      work: profile.work || '',
      education: profile.education || '',
      bloodGroup: profile.blood_group || '',
      hometown: profile.hometown || '',
      currentDistrict: profile.current_district || '',
      divisionId: primaryLoc?.division_id || undefined,
      districtId: primaryLoc?.district_id || undefined,
      upazilaId: primaryLoc?.upazila_id || undefined,
      unionId: primaryLoc?.union_id || undefined,
      wardId: primaryLoc?.ward_id || undefined,
      website: profile.website || '',
      role: (profile.role as 'user' | 'moderator' | 'admin') || 'user',
      isVerified: profile.is_verified || false,
      isBanned: profile.is_banned || false,
      joinedDate: new Date(profile.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' }),
      createdAt: profile.created_at,
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
    };
  } catch (e) {
    console.warn('fetchProfileFromDb exception:', e);
    return null;
  }
}

export async function updateProfileInDb(userId: string, data: Partial<User>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return false;
  try {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    if (data.name !== undefined) updates.full_name = data.name;
    if (data.bnName !== undefined) updates.bn_name = data.bnName;
    if (data.avatar !== undefined) updates.avatar_url = data.avatar;
    if (data.coverPhoto !== undefined) updates.cover_url = data.coverPhoto;
    if (data.bio !== undefined) updates.bio = data.bio;
    if (data.work !== undefined) updates.work = data.work;
    if (data.education !== undefined) updates.education = data.education;
    if (data.bloodGroup !== undefined) updates.blood_group = data.bloodGroup;
    if (data.hometown !== undefined) updates.hometown = data.hometown;
    if (data.currentDistrict !== undefined) updates.current_district = data.currentDistrict;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.website !== undefined) updates.website = data.website;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.warn('updateProfileInDb error:', error.message);
      return false;
    }

    // Update or insert location
    if (data.divisionId || data.districtId || data.upazilaId || data.unionId || data.wardId) {
      await supabase.from('user_locations').upsert({
        user_id: userId,
        location_type: 'permanent',
        division_id: data.divisionId || null,
        district_id: data.districtId || null,
        upazila_id: data.upazilaId || null,
        union_id: data.unionId || null,
        ward_id: data.wardId || null,
        is_primary: true
      }, { onConflict: 'user_id,location_type' });
    }

    return true;
  } catch (e) {
    console.warn('updateProfileInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 2. Posts & Media
// ----------------------------------------------------------------------------

interface PostMetadataEnvelope {
  postType?: 'standard' | 'reel';
  mediaType?: 'image' | 'video';
  thumbnailUrl?: string;
  coverUrl?: string;
  category?: string;
  tags?: string[];
  duration?: number;
  reelDuration?: 15 | 30 | 60 | 90 | 180;
  musicId?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  originalAudio?: boolean;
  originalAudioVolume?: number;
  musicVolume?: number;
  audioStart?: number;
  audioDuration?: number;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  processingStatus?: 'uploading' | 'processing' | 'generating_thumbnail' | 'ready' | 'failed';
  editingMetadata?: Record<string, unknown>;
  feeling?: string;
  location?: LocationTag;
}

function extractPostMetadata(rawContent: string): { cleanContent: string; metadata: PostMetadataEnvelope } {
  if (!rawContent) return { cleanContent: '', metadata: {} };
  const match = rawContent.match(/\n?<!--apon_meta:([\s\S]*?)-->$/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      const cleanContent = rawContent.replace(/\n?<!--apon_meta:[\s\S]*?-->$/, '').trim();
      return { cleanContent, metadata: parsed };
    } catch {
      return { cleanContent: rawContent, metadata: {} };
    }
  }
  return { cleanContent: rawContent, metadata: {} };
}

export async function fetchPostsFromDb(options?: {
  limit?: number;
}): Promise<Post[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        visibility,
        created_at,
        updated_at,
        post_media (
          id,
          media_url,
          media_type,
          thumbnail_url
        ),
        reactions (
          user_id,
          reaction_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(options?.limit || 30);

    const { data: dbPosts, error } = await query;
    if (error || !dbPosts) {
      console.warn('fetchPostsFromDb error:', error?.message);
      return [];
    }

    return dbPosts.map((p: any): Post => {
      // Group reactions by type
      const reactionsMap: Record<ReactionType, string[]> = {
        like: [], love: [], care: [], haha: [], wow: [], sad: [], angry: []
      };

      if (Array.isArray(p.reactions)) {
        for (const r of p.reactions) {
          const type = r.reaction_type as ReactionType;
          if (reactionsMap[type]) {
            reactionsMap[type].push(r.user_id);
          } else {
            reactionsMap.like.push(r.user_id);
          }
        }
      }

      // Media URLs
      const mediaList: string[] = [];
      let mediaType: 'image' | 'video' | undefined = undefined;
      let firstThumb: string | undefined = undefined;

      if (Array.isArray(p.post_media) && p.post_media.length > 0) {
        for (const m of p.post_media) {
          if (m.media_url) {
            const isVid = m.media_type === 'video' || isLikelyVideoUrl(m.media_url);
            const resolved = resolvePlayableMediaUrl(m.media_url, isVid ? 'post-videos' : 'post-images');
            if (resolved.url) mediaList.push(resolved.url);
            if (!firstThumb && m.thumbnail_url) {
              const resThumb = resolvePlayableMediaUrl(m.thumbnail_url, 'thumbnails');
              if (resThumb.url) firstThumb = resThumb.url;
            }
            if (isVid) {
              mediaType = 'video';
            } else if (!mediaType) {
              mediaType = 'image';
            }
          }
        }
      }

      // Check direct columns or meta envelope if post_media was empty
      if (mediaList.length === 0) {
        if (p.media_url) {
          const isVid = isLikelyVideoUrl(p.media_url);
          mediaList.push(resolvePlayableMediaUrl(p.media_url, isVid ? 'post-videos' : 'post-images').url);
        }
        if (Array.isArray(p.media_urls)) {
          for (const u of p.media_urls) {
            if (u) {
              const isVid = isLikelyVideoUrl(u);
              const resUrl = resolvePlayableMediaUrl(u, isVid ? 'post-videos' : 'post-images').url;
              if (!mediaList.includes(resUrl)) mediaList.push(resUrl);
            }
          }
        }
      }

      // Extract metadata envelope
      const { cleanContent, metadata: meta } = extractPostMetadata(p.content || '');

      const visibility = p.visibility === 'private' ? 'only_me' : (p.visibility === 'friends' ? 'friends' : 'public');

      return {
        id: p.id,
        authorId: p.user_id,
        content: cleanContent,
        mediaUrls: mediaList,
        mediaType: meta.mediaType || p.media_type || mediaType,
        postType: meta.postType || p.post_type || (meta.reelDuration ? 'reel' : 'standard'),
        thumbnailUrl: meta.thumbnailUrl || p.thumbnail_url || firstThumb || undefined,
        coverUrl: meta.coverUrl || p.cover_url || undefined,
        category: meta.category || p.category,
        tags: meta.tags || p.tags,
        duration: meta.duration || p.duration,
        reelDuration: meta.reelDuration || p.reel_duration,
        musicId: meta.musicId || p.music_id,
        musicTitle: meta.musicTitle || p.music_title,
        musicArtist: meta.musicArtist || p.music_artist,
        musicUrl: meta.musicUrl || p.music_url,
        originalAudio: meta.originalAudio !== false,
        originalAudioVolume: meta.originalAudioVolume ?? p.original_audio_volume ?? 1.0,
        musicVolume: meta.musicVolume ?? p.music_volume ?? 0.8,
        audioStart: meta.audioStart ?? p.audio_start ?? 0,
        audioDuration: meta.audioDuration ?? p.audio_duration ?? 0,
        downloadEnabled: meta.downloadEnabled !== false,
        commentsEnabled: meta.commentsEnabled !== false,
        processingStatus: meta.processingStatus || p.processing_status || 'ready',
        location: meta.location,
        feeling: meta.feeling,
        reactions: reactionsMap,
        commentCount: 0,
        shareCount: 0,
        visibility,
        createdAt: p.created_at,
      };
    });
  } catch (e) {
    console.warn('fetchPostsFromDb exception:', e);
    return [];
  }
}

export async function createPostInDb(post: {
  authorId: string;
  content: string;
  visibility?: 'public' | 'friends' | 'only_me';
  feeling?: string;
  location?: LocationTag;
  mediaUrls?: string[];
  mediaType?: 'image' | 'video';
  postType?: 'standard' | 'reel';
  thumbnailUrl?: string;
  coverUrl?: string;
  category?: string;
  tags?: string[];
  duration?: number;
  reelDuration?: 15 | 30 | 60 | 90 | 180;
  musicId?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  originalAudio?: boolean;
  originalAudioVolume?: number;
  musicVolume?: number;
  audioStart?: number;
  audioDuration?: number;
  downloadEnabled?: boolean;
  commentsEnabled?: boolean;
  processingStatus?: 'uploading' | 'processing' | 'generating_thumbnail' | 'ready' | 'failed';
  storagePath?: string;
  bucket?: string;
  editingMetadata?: Record<string, unknown>;
}): Promise<Post | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    // 5. CHECK AUTH SESSION: Verify user, user.id, and session exist
    const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
    console.log('[Auth Session Check]', {
      'user exists': Boolean(authUser),
      'user.id exists': Boolean(authUser?.id),
      'current session exists': Boolean(authUser),
      userId: authUser?.id,
      error: authErr?.message,
    });

    if (!authUser?.id) {
      const errStr = authErr?.message || 'সুপাবেজ অথেন্টিকেশন সেশন পাওয়া যায়নি। অনুগ্রহ করে লগইন করুন।';
      console.error('[Authentication Error]:', errStr);
      throw new Error(`[Authentication Error] ${errStr}`);
    }
    const effectiveUserId = authUser.id;

    const visibility = post.visibility === 'only_me' ? 'private' : (post.visibility || 'public');

    // 2. CHECK DATABASE SAVE: Log all required fields immediately before createPostInDb
    console.log('[createPostInDb] Before INSERT:', {
      'post payload': post,
      'media type': post.mediaType || (post.mediaUrls && post.mediaUrls.length > 0 ? (isLikelyVideoUrl(post.mediaUrls[0]) ? 'video' : 'image') : undefined),
      'media URL': post.mediaUrls?.[0],
      'storage path': post.storagePath,
      'bucket': post.bucket,
      'caption': post.content,
      'location': post.location,
      'category': post.category || 'general',
      'post type': post.postType || 'standard',
      'authenticated user ID': effectiveUserId,
    });

    // Build metadata envelope to preserve all rich reel/video/audio properties (live fallback)
    const meta: PostMetadataEnvelope = {
      postType: post.postType || 'standard',
      mediaType: post.mediaType || (post.mediaUrls && post.mediaUrls.length > 0 ? (isLikelyVideoUrl(post.mediaUrls[0]) ? 'video' : 'image') : undefined),
      thumbnailUrl: post.thumbnailUrl,
      coverUrl: post.coverUrl,
      category: post.category,
      tags: post.tags,
      duration: post.duration,
      reelDuration: post.reelDuration,
      musicId: post.musicId,
      musicTitle: post.musicTitle,
      musicArtist: post.musicArtist,
      musicUrl: post.musicUrl,
      originalAudio: post.originalAudio !== false,
      originalAudioVolume: post.originalAudioVolume ?? 1.0,
      musicVolume: post.musicVolume ?? 0.8,
      audioStart: post.audioStart ?? 0,
      audioDuration: post.audioDuration ?? 0,
      downloadEnabled: post.downloadEnabled !== false,
      commentsEnabled: post.commentsEnabled !== false,
      processingStatus: post.processingStatus || 'ready',
      editingMetadata: post.editingMetadata,
      feeling: post.feeling,
      location: post.location,
    };

    const storedContent = post.content + '\n<!--apon_meta:' + JSON.stringify(meta) + '-->';

    const baseInsertData: Record<string, unknown> = {
      user_id: effectiveUserId,
      content: storedContent,
      visibility,
    };

    const richInsertData: Record<string, unknown> = {
      ...baseInsertData,
      post_type: post.postType || 'standard',
      media_type: post.mediaType || (post.mediaUrls && post.mediaUrls.length > 0 ? (isLikelyVideoUrl(post.mediaUrls[0]) ? 'video' : 'image') : null),
      media_url: post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0] : null,
      media_urls: post.mediaUrls || [],
      thumbnail_url: post.thumbnailUrl || null,
      cover_url: post.coverUrl || post.thumbnailUrl || null,
      category: post.category || 'general',
      tags: post.tags || [],
      duration: post.duration || null,
      reel_duration: post.reelDuration || 30,
      music_id: post.musicId || null,
      music_title: post.musicTitle || null,
      music_artist: post.musicArtist || null,
      music_url: post.musicUrl || null,
      original_audio: post.originalAudio !== false,
      original_audio_volume: post.originalAudioVolume ?? 1.0,
      music_volume: post.musicVolume ?? 0.8,
      audio_start: post.audioStart ?? 0,
      audio_duration: post.audioDuration ?? 0,
      download_enabled: post.downloadEnabled !== false,
      comments_enabled: post.commentsEnabled !== false,
      processing_status: post.processingStatus || 'ready',
    };

    let newPost: any = null;
    let postInsertError: any = null;

    // Try rich insert first
    const { data: richPost, error: richError } = await supabase
      .from('posts')
      .insert(richInsertData)
      .select()
      .single();

    if (!richError && richPost) {
      newPost = richPost;
    } else {
      // Live schema fallback: posts table contains (id, user_id, content, visibility, created_at, updated_at)
      const { data: fallbackPost, error: fallbackError } = await supabase
        .from('posts')
        .insert(baseInsertData)
        .select()
        .single();

      if (fallbackError || !fallbackPost) {
        postInsertError = fallbackError || richError;
      } else {
        newPost = fallbackPost;
      }
    }

    console.log('[posts INSERT Result]', {
      'returned data': newPost,
      'returned error': postInsertError?.message || null,
      'inserted ID': newPost?.id || null,
    });

    if (postInsertError || !newPost) {
      console.error('[Posts Insert Error]', postInsertError);
      throw new Error(`[Posts Insert Error]: ${postInsertError?.message || 'Failed to insert post into database'}`);
    }

    // 6. VERIFY post_media INSERT: Insert into post_media using newly returned post ID
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      const mediaInserts = post.mediaUrls.map((url, idx) => ({
        post_id: newPost.id,
        media_url: url,
        media_type: post.mediaType || (isLikelyVideoUrl(url) ? 'video' : 'image'),
        thumbnail_url: idx === 0 ? (post.thumbnailUrl || null) : null,
      }));

      console.log('[post_media INSERT Payload]', mediaInserts);

      const { data: mediaData, error: mediaError } = await supabase
        .from('post_media')
        .insert(mediaInserts)
        .select();

      console.log('[post_media INSERT Result]', {
        'returned data': mediaData,
        'returned error': mediaError?.message || null,
        'inserted ID': mediaData?.map((m: any) => m.id) || null,
      });

      if (mediaError) {
        console.error('[post_media Query Error]', mediaError);
        throw new Error(`[post_media Query Error]: ${mediaError.message}`);
      }
    }

    return {
      id: newPost.id,
      authorId: newPost.user_id,
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      mediaType: post.mediaType || (post.mediaUrls && post.mediaUrls.length > 0 ? (isLikelyVideoUrl(post.mediaUrls[0]) ? 'video' : 'image') : undefined),
      postType: post.postType || 'standard',
      thumbnailUrl: post.thumbnailUrl,
      coverUrl: post.coverUrl,
      category: post.category,
      tags: post.tags,
      duration: post.duration,
      reelDuration: post.reelDuration,
      musicId: post.musicId,
      musicTitle: post.musicTitle,
      musicArtist: post.musicArtist,
      musicUrl: post.musicUrl,
      originalAudio: post.originalAudio !== false,
      originalAudioVolume: post.originalAudioVolume ?? 1.0,
      musicVolume: post.musicVolume ?? 0.8,
      audioStart: post.audioStart ?? 0,
      audioDuration: post.audioDuration ?? 0,
      downloadEnabled: post.downloadEnabled !== false,
      commentsEnabled: post.commentsEnabled !== false,
      processingStatus: post.processingStatus || 'ready',
      location: post.location,
      feeling: post.feeling,
      reactions: {
        like: [], love: [], care: [], haha: [], wow: [], sad: [], angry: []
      },
      commentCount: 0,
      shareCount: 0,
      visibility: post.visibility || 'public',
      createdAt: newPost.created_at || 'এখন মাত্র',
    };
  } catch (e) {
    console.error('[createPostInDb Exception]', e);
    throw e;
  }
}

export async function deletePostInDb(postId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return false;
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);
    return !error;
  } catch (e) {
    console.warn('deletePostInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 3. Reactions
// ----------------------------------------------------------------------------

export async function toggleReactionInDb(
  postId: string,
  userId: string,
  reactionType: ReactionType
): Promise<{ added: boolean; reactionType: ReactionType }> {
  if (!isSupabaseConfigured || !supabase) {
    return { added: true, reactionType };
  }
  try {
    let effectiveUserId = userId;
    if (!isValidUUID(effectiveUserId)) {
      const current = await getCurrentSupabaseUser();
      if (current?.id) {
        effectiveUserId = current.id;
      } else {
        return { added: true, reactionType };
      }
    }

    // Check if existing reaction
    const { data: existing } = await supabase
      .from('reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', effectiveUserId)
      .maybeSingle();

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // Remove reaction
        await supabase.from('reactions').delete().eq('id', existing.id);
        return { added: false, reactionType };
      } else {
        // Update reaction type
        await supabase
          .from('reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existing.id);
        return { added: true, reactionType };
      }
    } else {
      // Insert new reaction
      await supabase.from('reactions').insert({
        post_id: postId,
        user_id: effectiveUserId,
        reaction_type: reactionType,
      });
      return { added: true, reactionType };
    }
  } catch (e) {
    console.warn('toggleReactionInDb exception:', e);
    return { added: true, reactionType };
  }
}

// ----------------------------------------------------------------------------
// 4. Comments
// ----------------------------------------------------------------------------

export async function fetchCommentsFromDb(postId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('id, post_id, user_id, content, parent_comment_id, created_at, updated_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((c): Comment => ({
      id: c.id,
      postId: c.post_id,
      authorId: c.user_id,
      content: c.content,
      parentId: c.parent_comment_id || undefined,
      createdAt: c.created_at,
      reactions: {},
    }));
  } catch (e) {
    console.warn('fetchCommentsFromDb exception:', e);
    return [];
  }
}

export async function addCommentInDb(
  postId: string,
  authorId: string,
  content: string,
  parentId?: string
): Promise<Comment | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let effectiveUserId = authorId;
    if (!isValidUUID(effectiveUserId)) {
      const current = await getCurrentSupabaseUser();
      if (current?.id) {
        effectiveUserId = current.id;
      } else {
        return null;
      }
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: effectiveUserId,
        content,
        parent_comment_id: parentId || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('addCommentInDb error:', error?.message);
      return null;
    }

    return {
      id: data.id,
      postId: data.post_id,
      authorId: data.user_id,
      content: data.content,
      parentId: data.parent_comment_id || undefined,
      createdAt: data.created_at,
      reactions: {},
    };
  } catch (e) {
    console.warn('addCommentInDb exception:', e);
    return null;
  }
}

export async function deleteCommentInDb(commentId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return false;
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    return !error;
  } catch (e) {
    console.warn('deleteCommentInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 5. Friendships & Follows
// ----------------------------------------------------------------------------

export async function fetchFriendshipsFromDb(userId: string): Promise<Friendship[]> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return [];
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester_id, receiver_id, status, created_at')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error || !data) return [];

    return data.map((f): Friendship => ({
      id: f.id,
      requesterId: f.requester_id,
      receiverId: f.receiver_id,
      status: f.status as 'pending' | 'accepted' | 'declined' | 'blocked',
      createdAt: f.created_at,
    }));
  } catch (e) {
    console.warn('fetchFriendshipsFromDb exception:', e);
    return [];
  }
}

export async function sendFriendRequestInDb(requesterId: string, receiverId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(requesterId) || !isValidUUID(receiverId)) return false;
  try {
    const { error } = await supabase.from('friendships').insert({
      requester_id: requesterId,
      receiver_id: receiverId,
      status: 'pending',
    });
    return !error;
  } catch (e) {
    console.warn('sendFriendRequestInDb exception:', e);
    return false;
  }
}

export async function respondFriendRequestInDb(friendshipId: string, status: 'accepted' | 'declined'): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);
    return !error;
  } catch (e) {
    console.warn('respondFriendRequestInDb exception:', e);
    return false;
  }
}

export async function toggleFollowInDb(followerId: string, followingId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(followerId) || !isValidUUID(followingId)) return true;
  try {
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existing) {
      await supabase.from('follows').delete().eq('id', existing.id);
      return false; // unfollowed
    } else {
      await supabase.from('follows').insert({
        follower_id: followerId,
        following_id: followingId,
      });
      return true; // followed
    }
  } catch (e) {
    console.warn('toggleFollowInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 6. Notifications
// ----------------------------------------------------------------------------

export async function fetchNotificationsFromDb(userId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let effectiveUserId = userId;
    if (!isValidUUID(effectiveUserId)) {
      const current = await getCurrentSupabaseUser();
      if (current?.id) effectiveUserId = current.id;
      else return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, user_id, actor_id, message, is_read, created_at')
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    return data.map((n, idx): Notification => ({
      id: n.id || `notif-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      userId: n.user_id,
      actorId: n.actor_id || '',
      type: 'mention',
      title: 'নোটিফিকেশন',
      content: n.message || '',
      read: n.is_read ?? false,
      createdAt: n.created_at,
    }));
  } catch (e) {
    console.warn('fetchNotificationsFromDb exception:', e);
    return [];
  }
}

export async function markNotificationAsReadInDb(notificationId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return true;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return !error;
  } catch (e) {
    console.warn('markNotificationAsReadInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 7. Chat & Messages
// ----------------------------------------------------------------------------

export async function getOrCreateDirectConversation(userId1: string, userId2: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId1) || !isValidUUID(userId2)) return null;
  try {
    const { data: convMembers, error: findError } = await supabase
      .from('conversation_members')
      .select('conversation_id, user_id')
      .in('user_id', [userId1, userId2]);

    if (!findError && convMembers) {
      const convMap: Record<string, string[]> = {};
      convMembers.forEach(cm => {
        if (!convMap[cm.conversation_id]) convMap[cm.conversation_id] = [];
        convMap[cm.conversation_id].push(cm.user_id);
      });
      for (const [convId, members] of Object.entries(convMap)) {
        if (members.includes(userId1) && members.includes(userId2)) {
          return convId;
        }
      }
    }

    // Create new direct conversation
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({ title: 'Direct Chat' })
      .select('id')
      .single();

    if (convError || !newConv) {
      console.warn('Could not create conversation:', convError?.message);
      return null;
    }

    // Add both members
    await supabase.from('conversation_members').insert([
      { conversation_id: newConv.id, user_id: userId1 },
      { conversation_id: newConv.id, user_id: userId2 },
    ]);

    return newConv.id;
  } catch (e) {
    console.warn('getOrCreateDirectConversation error:', e);
    return null;
  }
}

export async function fetchMessagesFromDb(conversationId: string): Promise<Message[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, media_url, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    return data.map((m): Message => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.conversation_id,
      content: m.content,
      mediaUrl: m.media_url || undefined,
      createdAt: m.created_at,
      read: true,
    }));
  } catch (e) {
    console.warn('fetchMessagesFromDb exception:', e);
    return [];
  }
}

export async function sendMessageInDb(
  conversationId: string,
  senderId: string,
  content: string,
  mediaUrl?: string
): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(senderId)) return null;
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        media_url: mediaUrl || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('sendMessageInDb error:', error?.message);
      return null;
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.conversation_id,
      content: data.content,
      mediaUrl: data.media_url || undefined,
      createdAt: data.created_at,
      read: true,
    };
  } catch (e) {
    console.warn('sendMessageInDb exception:', e);
    return null;
  }
}

export async function sendDirectMessageInDb(
  senderId: string,
  receiverId: string,
  content: string,
  mediaUrl?: string
): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const convId = await getOrCreateDirectConversation(senderId, receiverId);
    if (!convId) return null;
    return await sendMessageInDb(convId, senderId, content, mediaUrl);
  } catch (e) {
    console.warn('sendDirectMessageInDb error:', e);
    return null;
  }
}

// ----------------------------------------------------------------------------
// 8. Saved Posts & Reports
// ----------------------------------------------------------------------------

export async function savePostInDb(userId: string, postId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return true;
  try {
    const { error } = await supabase.from('saved_posts').insert({
      user_id: userId,
      post_id: postId,
    });
    return !error;
  } catch (e) {
    console.warn('savePostInDb exception:', e);
    return false;
  }
}

export async function unsavePostInDb(userId: string, postId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(userId)) return true;
  try {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);
    return !error;
  } catch (e) {
    console.warn('unsavePostInDb exception:', e);
    return false;
  }
}

export async function createReportInDb(report: {
  reporterId: string;
  targetType: 'post' | 'comment' | 'user' | 'group' | 'page' | 'job' | 'marketplace';
  targetId: string;
  reason: string;
  details?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(report.reporterId)) return true;
  try {
    const { error } = await supabase.from('reports').insert({
      reporter_id: report.reporterId,
      target_type: report.targetType,
      target_id: report.targetId,
      reason: report.reason,
      details: report.details || null,
    });
    return !error;
  } catch (e) {
    console.warn('createReportInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 9. Community Modules (Groups, Pages, Jobs, Marketplace, Matrimony)
// ----------------------------------------------------------------------------

export async function fetchGroupsFromDb(): Promise<Group[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, description, privacy, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((g): Group => ({
      id: g.id,
      name: g.name,
      description: g.description || '',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&auto=format&fit=crop&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      category: 'কমিউনিটি',
      privacy: (g.privacy as 'public' | 'private') || 'public',
      memberIds: [],
      adminIds: [],
      rules: ['সকলের প্রতি শ্রদ্ধাশীল থাকুন'],
      createdAt: g.created_at,
    }));
  } catch (e) {
    console.warn('fetchGroupsFromDb exception:', e);
    return [];
  }
}

export async function fetchPagesFromDb(): Promise<Page[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('id, name, category, description, cover_url, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((p): Page => ({
      id: p.id,
      name: p.name,
      category: p.category || 'কমিউনিটি পেজ',
      avatar: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=150&auto=format&fit=crop&q=80',
      coverPhoto: p.cover_url || 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&auto=format&fit=crop&q=80',
      description: p.description || '',
      followerIds: [],
      rating: 5,
      reviewCount: 1,
      verified: true,
      createdAt: p.created_at,
    }));
  } catch (e) {
    console.warn('fetchPagesFromDb exception:', e);
    return [];
  }
}

export async function fetchJobsFromDb(): Promise<Job[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, description, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((j): Job => ({
      id: j.id,
      title: j.title,
      companyName: j.company_name,
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
      category: 'সাধারণ চাকরি',
      employmentType: 'Full-time',
      salaryRange: 'আলোচনা সাপেক্ষে',
      location: { districtName: 'বাংলাদেশ' },
      description: j.description || '',
      requirements: ['অভিজ্ঞতা প্রয়োজন'],
      contactEmail: 'career@aponsomaj.com',
      posterId: '',
      applicantsCount: 0,
      createdAt: j.created_at,
    }));
  } catch (e) {
    console.warn('fetchJobsFromDb exception:', e);
    return [];
  }
}

export async function fetchMarketplaceFromDb(): Promise<MarketplaceListing[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('id, seller_id, title, price, category, condition, description, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((m): MarketplaceListing => ({
      id: m.id,
      sellerId: m.seller_id,
      title: m.title,
      price: Number(m.price) || 0,
      category: m.category || 'অন্যান্য',
      location: { districtName: 'বাংলাদেশ' },
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
      description: m.description || '',
      condition: 'used',
      status: 'available',
      createdAt: m.created_at,
    }));
  } catch (e) {
    console.warn('fetchMarketplaceFromDb exception:', e);
    return [];
  }
}

export async function fetchMatrimonyFromDb(): Promise<MatrimonyProfile[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('matrimony_profiles')
      .select('id, user_id, gender, date_of_birth, religion, occupation, education, marital_status, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((mp): MatrimonyProfile => {
      const birthYear = mp.date_of_birth ? new Date(mp.date_of_birth).getFullYear() : 1998;
      const calculatedAge = Math.max(18, new Date().getFullYear() - birthYear);

      return {
        id: mp.id,
        userId: mp.user_id,
        fullName: 'জীবনসঙ্গী প্রার্থী',
        gender: mp.gender === 'female' ? 'female' : 'male',
        age: calculatedAge,
        height: '5 ফুট 5 ইঞ্চি',
        religion: mp.religion || 'ইসলাম',
        religiousPractice: 'নিয়মিত নামাজ আদায়কারী',
        education: mp.education || 'স্নাতক',
        profession: mp.occupation || 'কর্মজীবী',
        location: { districtName: 'বাংলাদেশ' },
        familyDetails: 'মধ্যবিত্ত পরিবার',
        partnerPreferences: 'পরহেজগার, মার্জিত ও পারিবারিক মনোভাবাপন্ন জীবনসঙ্গী প্রত্যাশী।',
        photoUrl: mp.gender === 'female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        privacyLevel: 'public',
        isVerified: true,
        createdAt: mp.created_at,
      };
    });
  } catch (e) {
    console.warn('fetchMatrimonyFromDb exception:', e);
    return [];
  }
}

// ----------------------------------------------------------------------------
// 12. Stories Architecture & 24h Expiration
// ----------------------------------------------------------------------------

export async function fetchStoriesFromDb(): Promise<Story[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('stories')
      .select('id, user_id, media_url, media_type, content, background_style, privacy, location_name, division_id, district_id, upazila_id, created_at, expires_at, is_archived')
      .gt('expires_at', nowIso)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error && error.code !== 'PGRST205') {
        console.warn('fetchStoriesFromDb error:', error.message);
      }
      return [];
    }

    return data.map((s): Story => ({
      id: s.id,
      userId: s.user_id,
      mediaUrl: s.media_url || undefined,
      mediaType: s.media_type || 'image',
      content: s.content || undefined,
      backgroundStyle: s.background_style || undefined,
      privacy: s.privacy || 'public',
      locationName: s.location_name || undefined,
      divisionId: s.division_id || undefined,
      districtId: s.district_id || undefined,
      upazilaId: s.upazila_id || undefined,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      isArchived: s.is_archived ?? false,
    }));
  } catch (e) {
    console.warn('fetchStoriesFromDb exception:', e);
    return [];
  }
}

export async function createStoryInDb(story: {
  userId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  content?: string;
  backgroundStyle?: string;
  privacy?: 'public' | 'friends';
  locationName?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
}): Promise<Story | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    let effectiveUserId = story.userId;
    if (!isValidUUID(effectiveUserId)) {
      const current = await getCurrentSupabaseUser();
      if (current?.id) {
        effectiveUserId = current.id;
      } else {
        return null;
      }
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: newStory, error } = await supabase
      .from('stories')
      .insert({
        user_id: effectiveUserId,
        media_url: story.mediaUrl || null,
        media_type: story.mediaType || 'image',
        content: story.content || null,
        background_style: story.backgroundStyle || null,
        privacy: story.privacy || 'public',
        location_name: story.locationName || null,
        division_id: story.divisionId || null,
        district_id: story.districtId || null,
        upazila_id: story.upazilaId || null,
        expires_at: expiresAt,
        is_archived: false,
      })
      .select()
      .single();

    if (error || !newStory) {
      console.warn('createStoryInDb error:', error?.message);
      return null;
    }

    return {
      id: newStory.id,
      userId: newStory.user_id,
      mediaUrl: newStory.media_url || undefined,
      mediaType: newStory.media_type || 'image',
      content: newStory.content || undefined,
      backgroundStyle: newStory.background_style || undefined,
      privacy: newStory.privacy || 'public',
      locationName: newStory.location_name || undefined,
      divisionId: newStory.division_id || undefined,
      districtId: newStory.district_id || undefined,
      upazilaId: newStory.upazila_id || undefined,
      createdAt: newStory.created_at,
      expiresAt: newStory.expires_at,
      isArchived: newStory.is_archived ?? false,
    };
  } catch (e) {
    console.warn('createStoryInDb exception:', e);
    return null;
  }
}

export async function deleteStoryInDb(storyId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    let effectiveUserId = userId;
    if (!isValidUUID(effectiveUserId)) {
      const current = await getCurrentSupabaseUser();
      if (current?.id) effectiveUserId = current.id;
      else return false;
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', effectiveUserId);

    return !error;
  } catch (e) {
    console.warn('deleteStoryInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 13. Reels / Videos Real Query (Reusing Posts + Post Media Architecture)
// ----------------------------------------------------------------------------

export async function fetchVideoPostsFromDb(): Promise<Post[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    // 1. Fetch posts joined with post_media
    const { data: mediaPosts, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        visibility,
        created_at,
        post_media (
          id,
          media_type,
          media_url,
          thumbnail_url
        ),
        reactions (
          user_id,
          reaction_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !mediaPosts) {
      return [];
    }

    // Filter to posts that are reels or contain video
    const videoPosts = mediaPosts.filter((p: any) => {
      const { metadata: meta } = extractPostMetadata(p.content || '');
      if (meta.postType === 'reel' || meta.mediaType === 'video' || meta.reelDuration || p.post_type === 'reel' || p.media_type === 'video') return true;
      const hasVideoMedia = p.post_media && Array.isArray(p.post_media) && p.post_media.some((m: any) => m.media_type === 'video' || isLikelyVideoUrl(m.media_url));
      const hasDirectUrl = isLikelyVideoUrl(p.media_url) || (Array.isArray(p.media_urls) && p.media_urls.some(isLikelyVideoUrl));
      return hasVideoMedia || hasDirectUrl;
    });

    return videoPosts.map((p: any): Post => {
      const reactionsMap: Record<ReactionType, string[]> = {
        like: [],
        love: [],
        care: [],
        haha: [],
        wow: [],
        sad: [],
        angry: [],
      };

      if (p.reactions && Array.isArray(p.reactions)) {
        for (const r of p.reactions) {
          const type = (r.reaction_type as ReactionType) || 'like';
          if (reactionsMap[type] && r.user_id) {
            reactionsMap[type].push(r.user_id);
          }
        }
      }

      const mediaList: string[] = [];
      let videoUrl: string | undefined = undefined;
      let firstThumb: string | undefined = undefined;

      if (p.post_media && Array.isArray(p.post_media) && p.post_media.length > 0) {
        for (const m of p.post_media) {
          if (m.media_url) {
            const isVid = m.media_type === 'video' || isLikelyVideoUrl(m.media_url);
            const resolved = resolvePlayableMediaUrl(m.media_url, isVid ? 'post-videos' : 'post-images');
            if (resolved.url) mediaList.push(resolved.url);
            if (!firstThumb && m.thumbnail_url) {
              const resThumb = resolvePlayableMediaUrl(m.thumbnail_url, 'thumbnails');
              if (resThumb.url) firstThumb = resThumb.url;
            }
            if ((isVid || !videoUrl) && resolved.url) {
              videoUrl = resolved.url;
            }
          }
        }
      }

      // Check direct columns if post_media was empty
      if (mediaList.length === 0) {
        if (p.media_url) {
          const resolved = resolvePlayableMediaUrl(p.media_url, 'post-videos');
          mediaList.push(resolved.url);
          if (!videoUrl) videoUrl = resolved.url;
        }
        if (Array.isArray(p.media_urls)) {
          for (const u of p.media_urls) {
            if (u) {
              const resolved = resolvePlayableMediaUrl(u, 'post-videos');
              if (!mediaList.includes(resolved.url)) mediaList.push(resolved.url);
              if (!videoUrl) videoUrl = resolved.url;
            }
          }
        }
      }

      const { cleanContent, metadata: meta } = extractPostMetadata(p.content || '');
      const visibility = p.visibility === 'private' ? 'only_me' : (p.visibility === 'friends' ? 'friends' : 'public');

      return {
        id: p.id,
        authorId: p.user_id,
        content: cleanContent,
        mediaUrls: mediaList,
        mediaType: 'video',
        postType: meta.postType || 'reel',
        thumbnailUrl: meta.thumbnailUrl || firstThumb || undefined,
        coverUrl: meta.coverUrl,
        duration: meta.duration,
        reelDuration: meta.reelDuration,
        musicId: meta.musicId,
        musicTitle: meta.musicTitle,
        musicArtist: meta.musicArtist,
        musicUrl: meta.musicUrl,
        originalAudio: meta.originalAudio !== false,
        originalAudioVolume: meta.originalAudioVolume ?? 1.0,
        musicVolume: meta.musicVolume ?? 0.8,
        downloadEnabled: meta.downloadEnabled !== false,
        commentsEnabled: meta.commentsEnabled !== false,
        linkUrl: videoUrl,
        reactions: reactionsMap,
        commentCount: 0,
        shareCount: 0,
        visibility,
        createdAt: p.created_at,
      };
    });
  } catch (e) {
    console.warn('fetchVideoPostsFromDb exception:', e);
    return [];
  }
}

// ----------------------------------------------------------------------------
// 14. Labour Marketplace (“কাজ চাই / শ্রমিক চাই”) Service
// ----------------------------------------------------------------------------

export async function fetchLabourCategoriesFromDb(): Promise<LabourCategory[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('labour_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map(c => ({
      id: c.id,
      name: c.name,
      bnName: c.bn_name,
      icon: c.icon,
      sortOrder: c.sort_order,
    }));
  } catch (e) {
    console.warn('fetchLabourCategoriesFromDb exception:', e);
    return [];
  }
}

export async function fetchLabourSkillsFromDb(): Promise<LabourSkill[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('labour_skills')
      .select('*')
      .order('name', { ascending: true });
    if (error || !data) return [];
    return data.map(s => ({
      id: s.id,
      categoryId: s.category_id,
      name: s.name,
      bnName: s.bn_name,
    }));
  } catch (e) {
    console.warn('fetchLabourSkillsFromDb exception:', e);
    return [];
  }
}

export async function fetchLabourProfilesFromDb(filter?: {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  wardId?: string;
  categoryId?: string;
  skillId?: string;
  availability?: string;
}): Promise<LabourProfile[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('labour_profiles')
      .select('*')
      .order('rating', { ascending: false });

    if (filter?.divisionId) query = query.eq('division_id', filter.divisionId);
    if (filter?.districtId) query = query.eq('district_id', filter.districtId);
    if (filter?.upazilaId) query = query.eq('upazila_id', filter.upazilaId);
    if (filter?.unionId) query = query.eq('union_id', filter.unionId);
    if (filter?.wardId) query = query.eq('ward_id', filter.wardId);
    if (filter?.categoryId) query = query.eq('category_id', filter.categoryId);
    if (filter?.skillId) query = query.eq('skill_id', filter.skillId);
    if (filter?.availability) query = query.eq('availability', filter.availability);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(lp => ({
      id: lp.id,
      userId: lp.user_id,
      userType: lp.user_type,
      fullName: lp.full_name,
      phone: lp.phone,
      isPhoneVerified: lp.is_phone_verified,
      avatarUrl: lp.avatar_url,
      categoryId: lp.category_id,
      skillId: lp.skill_id,
      specificSkill: lp.specific_skill,
      experienceYears: lp.experience_years,
      experienceLevel: lp.experience_level,
      expectedDailyWage: Number(lp.expected_daily_wage) || 0,
      expectedMonthlyWage: Number(lp.expected_monthly_wage) || 0,
      availability: lp.availability,
      maxTravelDistance: lp.max_travel_distance,
      location: {
        divisionId: lp.division_id,
        districtId: lp.district_id,
        upazilaId: lp.upazila_id,
        unionId: lp.union_id,
        wardId: lp.ward_id,
      },
      locationCustom: lp.location_custom,
      bio: lp.bio,
      workHistory: lp.work_history,
      isVerified: lp.is_verified,
      status: lp.status,
      completedJobsCount: lp.completed_jobs_count || 0,
      rating: Number(lp.rating) || 5.0,
      createdAt: lp.created_at,
      updatedAt: lp.updated_at,
    }));
  } catch (e) {
    console.warn('fetchLabourProfilesFromDb exception:', e);
    return [];
  }
}

export async function fetchLabourJobPostsFromDb(filter?: {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  wardId?: string;
  categoryId?: string;
  skillId?: string;
}): Promise<LabourJobPost[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('labour_job_posts')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (filter?.divisionId) query = query.eq('division_id', filter.divisionId);
    if (filter?.districtId) query = query.eq('district_id', filter.districtId);
    if (filter?.upazilaId) query = query.eq('upazila_id', filter.upazilaId);
    if (filter?.unionId) query = query.eq('union_id', filter.unionId);
    if (filter?.wardId) query = query.eq('ward_id', filter.wardId);
    if (filter?.categoryId) query = query.eq('category_id', filter.categoryId);
    if (filter?.skillId) query = query.eq('skill_id', filter.skillId);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(j => ({
      id: j.id,
      employerId: j.employer_id,
      title: j.title,
      categoryId: j.category_id,
      skillId: j.skill_id,
      specificSkill: j.specific_skill,
      workersNeeded: j.workers_needed,
      description: j.description,
      wageAmount: Number(j.wage_amount) || 0,
      wageType: j.wage_type,
      duration: j.duration,
      workDate: j.work_date,
      requiredAvailability: j.required_availability,
      location: {
        divisionId: j.division_id,
        districtId: j.district_id,
        upazilaId: j.upazila_id,
        unionId: j.union_id,
        wardId: j.ward_id,
      },
      addressDetails: j.address_details,
      contactMethod: j.contact_method,
      expiresAt: j.expires_at,
      status: j.status,
      createdAt: j.created_at,
      updatedAt: j.updated_at,
    }));
  } catch (e) {
    console.warn('fetchLabourJobPostsFromDb exception:', e);
    return [];
  }
}

export async function upsertLabourProfileInDb(
  profileData: Partial<LabourProfile> & { userId: string; fullName: string; phone: string }
): Promise<LabourProfile | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(profileData.userId)) return null;
  try {
    const payload = {
      user_id: profileData.userId,
      user_type: profileData.userType || 'looking_for_work',
      full_name: profileData.fullName,
      phone: profileData.phone,
      is_phone_verified: profileData.isPhoneVerified ?? true,
      avatar_url: profileData.avatarUrl || null,
      category_id: profileData.categoryId || null,
      skill_id: profileData.skillId || null,
      specific_skill: profileData.specificSkill || null,
      experience_years: profileData.experienceYears || 1,
      experience_level: profileData.experienceLevel || 'দক্ষ কারিগর',
      expected_daily_wage: profileData.expectedDailyWage || 700,
      expected_monthly_wage: profileData.expectedMonthlyWage || 18000,
      availability: profileData.availability || 'available_today',
      max_travel_distance: profileData.maxTravelDistance || 'same_upazila',
      division_id: profileData.location?.divisionId || null,
      district_id: profileData.location?.districtId || null,
      upazila_id: profileData.location?.upazilaId || null,
      union_id: profileData.location?.unionId || null,
      ward_id: profileData.location?.wardId || null,
      location_custom: profileData.locationCustom || null,
      bio: profileData.bio || null,
      work_history: profileData.workHistory || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('labour_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error || !data) {
      console.warn('upsertLabourProfileInDb error:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      userType: data.user_type,
      fullName: data.full_name,
      phone: data.phone,
      isPhoneVerified: data.is_phone_verified,
      avatarUrl: data.avatar_url,
      categoryId: data.category_id,
      skillId: data.skill_id,
      specificSkill: data.specific_skill,
      experienceYears: data.experience_years,
      experienceLevel: data.experience_level,
      expectedDailyWage: Number(data.expected_daily_wage) || 0,
      expectedMonthlyWage: Number(data.expected_monthly_wage) || 0,
      availability: data.availability,
      maxTravelDistance: data.max_travel_distance,
      location: {
        divisionId: data.division_id,
        districtId: data.district_id,
        upazilaId: data.upazila_id,
        unionId: data.union_id,
        wardId: data.ward_id,
      },
      locationCustom: data.location_custom,
      bio: data.bio,
      workHistory: data.work_history,
      isVerified: data.is_verified,
      status: data.status,
      completedJobsCount: data.completed_jobs_count || 0,
      rating: Number(data.rating) || 5.0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (e) {
    console.warn('upsertLabourProfileInDb exception:', e);
    return null;
  }
}

export async function createLabourJobPostInDb(
  jobData: Partial<LabourJobPost> & { employerId: string; title: string; description: string; wageAmount: number }
): Promise<LabourJobPost | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(jobData.employerId)) return null;
  try {
    const payload = {
      employer_id: jobData.employerId,
      title: jobData.title,
      category_id: jobData.categoryId || null,
      skill_id: jobData.skillId || null,
      specific_skill: jobData.specificSkill || null,
      workers_needed: jobData.workersNeeded || 1,
      description: jobData.description,
      wage_amount: jobData.wageAmount,
      wage_type: jobData.wageType || 'daily',
      duration: jobData.duration || '১ দিন',
      work_date: jobData.workDate || null,
      required_availability: jobData.requiredAvailability || 'immediate',
      division_id: jobData.location?.divisionId || null,
      district_id: jobData.location?.districtId || null,
      upazila_id: jobData.location?.upazilaId || null,
      union_id: jobData.location?.unionId || null,
      ward_id: jobData.location?.wardId || null,
      address_details: jobData.addressDetails || null,
      contact_method: jobData.contactMethod || 'in_app',
      expires_at: jobData.expiresAt || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'open',
    };

    const { data, error } = await supabase
      .from('labour_job_posts')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      console.warn('createLabourJobPostInDb error:', error);
      return null;
    }

    return {
      id: data.id,
      employerId: data.employer_id,
      title: data.title,
      categoryId: data.category_id,
      skillId: data.skill_id,
      specificSkill: data.specific_skill,
      workersNeeded: data.workers_needed,
      description: data.description,
      wageAmount: Number(data.wage_amount) || 0,
      wageType: data.wage_type,
      duration: data.duration,
      workDate: data.work_date,
      requiredAvailability: data.required_availability,
      location: {
        divisionId: data.division_id,
        districtId: data.district_id,
        upazilaId: data.upazila_id,
        unionId: data.union_id,
        wardId: data.ward_id,
      },
      addressDetails: data.address_details,
      contactMethod: data.contact_method,
      expiresAt: data.expires_at,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (e) {
    console.warn('createLabourJobPostInDb exception:', e);
    return null;
  }
}

export async function createLabourContactRequestInDb(
  req: { senderId: string; receiverId: string; targetType: 'worker' | 'job'; targetId: string; requestType?: string; message?: string }
): Promise<LabourContactRequest | null> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(req.senderId) || !isValidUUID(req.receiverId)) return null;
  try {
    const { data, error } = await supabase
      .from('labour_contact_requests')
      .insert({
        sender_id: req.senderId,
        receiver_id: req.receiverId,
        target_type: req.targetType,
        target_id: req.targetId,
        request_type: req.requestType || 'contact_request',
        message: req.message || null,
        status: 'pending',
        phone_shared: false,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      targetType: data.target_type,
      targetId: data.target_id,
      requestType: data.request_type,
      message: data.message,
      status: data.status,
      phoneShared: data.phone_shared,
      createdAt: data.created_at,
    };
  } catch (e) {
    console.warn('createLabourContactRequestInDb exception:', e);
    return null;
  }
}

export async function submitLabourReportInDb(
  report: { reporterId: string; targetType: string; targetId: string; reason: string; details?: string }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !isValidUUID(report.reporterId)) return true;
  try {
    const { error } = await supabase.from('labour_reports').insert({
      reporter_id: report.reporterId,
      target_type: report.targetType,
      target_id: report.targetId,
      reason: report.reason,
      details: report.details || null,
      status: 'pending',
    });
    return !error;
  } catch (e) {
    console.warn('submitLabourReportInDb exception:', e);
    return false;
  }
}

// ----------------------------------------------------------------------------
// 12. Media Storage & Upload Services (Re-exports & Helper)
// ----------------------------------------------------------------------------

export {
  uploadMediaToStorage,
  generateVideoThumbnail,
  getMediaMetadata,
  processEditedImage,
  downloadMediaFile,
} from './mediaStorageService';
import { uploadMediaToStorage } from './mediaStorageService';

export type { UploadProgressCallback, UploadResult } from './mediaStorageService';

/**
 * High-level helper to upload media to Supabase Storage with automatic auth UID discovery
 */
export async function uploadPostMedia(
  fileOrBlob: File | Blob,
  mediaKind: 'image' | 'video' | 'reel' | 'thumbnail' | 'audio',
  userId?: string,
  onProgress?: (progress: number, stage: 'uploading' | 'processing' | 'generating_thumbnail' | 'ready') => void
) {
  const bucketMap: Record<string, 'post-images' | 'post-videos' | 'reels' | 'thumbnails' | 'audio'> = {
    image: 'post-images',
    video: 'post-videos',
    reel: 'reels',
    thumbnail: 'thumbnails',
    audio: 'audio',
  };
  const bucket = bucketMap[mediaKind] || 'post-images';
  const effectiveUser = userId || (await getCurrentSupabaseUser())?.id || 'anon_user';
  return uploadMediaToStorage(fileOrBlob, bucket, effectiveUser, onProgress);
}

