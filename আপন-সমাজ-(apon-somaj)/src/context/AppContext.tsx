import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  Comment,
  Friendship,
  Message,
  Notification,
  Group,
  Page,
  Job,
  MatrimonyProfile,
  MarketplaceListing,
  Report,
  PrivacySettings,
  Division,
  District,
  Upazila,
  Union,
  Ward,
  ReactionType,
  LocationTag,
  Story,
  LabourCategory,
  LabourSkill,
  LabourProfile,
  LabourJobPost,
  LabourContactRequest,
  LabourUserType,
} from '../types';
import {
  initialDivisions,
  initialDistricts,
  initialUpazilas,
  initialUnions,
  initialWards
} from '../data/bangladeshLocations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { resolvePlayableMediaUrl } from '../services/mediaStorageService';
import { fetchDivisions, fetchDistricts } from '../services/locationDatabaseService';
import {
  getCurrentSupabaseUser,
  fetchProfileFromDb,
  updateProfileInDb,
  syncUserProfileFromAuth,
  isValidUUID,
  fetchPostsFromDb,
  createPostInDb,
  deletePostInDb,
  toggleReactionInDb,
  addCommentInDb,
  toggleFollowInDb,
  sendFriendRequestInDb,
  respondFriendRequestInDb,
  sendDirectMessageInDb,
  savePostInDb,
  unsavePostInDb,
  createReportInDb,
  fetchGroupsFromDb,
  fetchPagesFromDb,
  fetchJobsFromDb,
  fetchMarketplaceFromDb,
  fetchMatrimonyFromDb,
  fetchNotificationsFromDb,
  markNotificationAsReadInDb,
  fetchStoriesFromDb,
  createStoryInDb,
  deleteStoryInDb,
  fetchVideoPostsFromDb,
  fetchLabourCategoriesFromDb,
  fetchLabourSkillsFromDb,
  fetchLabourProfilesFromDb,
  fetchLabourJobPostsFromDb,
  upsertLabourProfileInDb,
  createLabourJobPostInDb,
  createLabourContactRequestInDb,
  submitLabourReportInDb,
} from '../services/supabaseDataService';
import {
  demoUsers,
  initialPosts,
  initialComments,
  initialGroups,
  initialPages,
  initialJobs,
  initialMarketplaceListings,
  initialMatrimonyProfiles,
  initialFriendships,
  initialMessages,
  initialNotifications,
  initialReports,
  initialPrivacySettings
} from '../data/initialData';
import {
  initialLabourCategories,
  initialLabourSkills,
  initialLabourProfiles,
  initialLabourJobPosts,
} from '../data/labourData';

export type ActiveView =
  | 'feed'
  | 'location_hub'
  | 'friends'
  | 'chat'
  | 'groups'
  | 'group_detail'
  | 'pages'
  | 'page_detail'
  | 'jobs'
  | 'marketplace'
  | 'matrimony'
  | 'labour'
  | 'profile'
  | 'saved'
  | 'admin'
  | 'settings'
  | 'reels'
  | 'videos';

export interface LocationFilter {
  divisionId?: string;
  divisionName?: string;
  districtId?: string;
  districtName?: string;
  upazilaId?: string;
  upazilaName?: string;
  unionId?: string;
  unionName?: string;
  wardId?: string;
  wardName?: string;
}

interface AppContextType {
  // Current user & Auth
  currentUser: User | null;
  users: User[];
  lastAuthError: string | null;
  clearAuthError: () => void;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: string) => Promise<boolean> | void;
  login: (identifier: string, pass: string) => Promise<boolean> | boolean;
  register: (data: Partial<User>) => Promise<boolean> | boolean;
  logout: () => void | Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  updateUserProfile: (data: Partial<User>) => void;
  toggleUserBan: (userId: string) => void;
  toggleUserVerify: (userId: string) => void;
  changeUserRole: (userId: string, role: 'user' | 'moderator' | 'admin') => void;
  addLocationNode: (type: 'division' | 'district' | 'upazila' | 'union' | 'ward', data: any) => void;

  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  openUserProfile: (userId: string) => void;

  // Bangladesh Location Hierarchy
  divisions: Division[];
  districts: District[];
  upazilas: Upazila[];
  unions: Union[];
  wards: Ward[];
  locationFilter: LocationFilter;
  setLocationFilter: (filter: LocationFilter) => void;
  resetLocationFilter: () => void;
  getLocationString: (loc?: LocationTag) => string;

  // Admin Location Management
  addDivision: (div: Omit<Division, 'id'>) => void;
  updateDivision: (div: Division) => void;
  deleteDivision: (id: string) => boolean;
  toggleDivision: (id: string) => void;

  addDistrict: (dis: Omit<District, 'id'>) => void;
  updateDistrict: (dis: District) => void;
  deleteDistrict: (id: string) => boolean;
  toggleDistrict: (id: string) => void;

  addUpazila: (up: Omit<Upazila, 'id'>) => void;
  updateUpazila: (up: Upazila) => void;
  deleteUpazila: (id: string) => boolean;
  toggleUpazila: (id: string) => void;

  addUnion: (un: Omit<Union, 'id'>) => void;
  updateUnion: (un: Union) => void;
  deleteUnion: (id: string) => boolean;
  toggleUnion: (id: string) => void;

  addWard: (w: Omit<Ward, 'id'>) => void;
  updateWard: (w: Ward) => void;
  deleteWard: (id: string) => boolean;
  toggleWard: (id: string) => void;
  resetLocationsToDefault: () => void;

  // Stories
  stories: Story[];
  addStory: (story: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    content?: string;
    backgroundStyle?: string;
    privacy?: 'public' | 'friends';
    locationName?: string;
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
  }) => Promise<Story | null>;
  deleteStory: (storyId: string) => Promise<boolean>;
  fetchStories: () => Promise<void>;
  createStoryModalOpen: boolean;
  setCreateStoryModalOpen: (open: boolean) => void;

  // Posts & Social
  posts: Post[];
  createPost: (post: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'reactions' | 'commentCount' | 'shareCount'>) => Promise<Post>;
  deletePost: (postId: string) => void;
  reactToPost: (postId: string, type: ReactionType) => void;
  votePoll: (postId: string, optionId: string) => void;
  savedPostIds: string[];
  toggleSavePost: (postId: string) => void;

  // Comments
  comments: Comment[];
  addComment: (postId: string, content: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
  reactToComment: (commentId: string) => void;

  // Friends & Social Graph
  friendships: Friendship[];
  sendFriendRequest: (targetUserId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (targetUserId: string) => void;
  followingIds: string[];
  toggleFollowUser: (targetUserId: string) => void;

  // Messenger / Chat
  messages: Message[];
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;
  sendMessage: (receiverId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'file' | 'voice', voiceDuration?: number) => void;
  deleteMessage: (messageId: string) => void;

  // Groups
  groups: Group[];
  createGroup: (data: Omit<Group, 'id' | 'createdAt' | 'memberIds' | 'adminIds'>) => void;
  toggleJoinGroup: (groupId: string) => void;

  // Pages
  pages: Page[];
  createPage: (data: Omit<Page, 'id' | 'createdAt' | 'followerIds' | 'rating' | 'reviewCount' | 'verified'>) => void;
  toggleFollowPage: (pageId: string) => void;

  // Jobs
  jobs: Job[];
  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'posterId' | 'applicantsCount'>) => void;
  appliedJobIds: string[];
  applyToJob: (jobId: string) => void;
  applyJob: (jobId: string) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;

  // Marketplace
  marketplaceListings: MarketplaceListing[];
  createMarketplaceListing: (data: Omit<MarketplaceListing, 'id' | 'createdAt' | 'sellerId' | 'status'>) => void;
  toggleListingStatus: (listingId: string) => void;
  savedListingIds: string[];
  toggleSaveListing: (listingId: string) => void;

  // Matrimony
  matrimonyProfiles: MatrimonyProfile[];
  createOrUpdateMatrimonyProfile: (data: Omit<MatrimonyProfile, 'id' | 'userId' | 'createdAt'>) => void;
  createMatrimonyProfile: (data: any) => void;
  connectedMatrimonyIds: string[];
  connectMatrimony: (profileId: string) => void;
  expressMatrimonyInterest: (profileId: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;

  // Reports & Safety
  reports: Report[];
  createReport: (targetType: Report['targetType'], targetId: string, reason: string, details: string) => void;
  submitReport: (targetType: Report['targetType'], targetId: string, reason: string, details: string) => void;
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
  dismissReport: (reportId: string) => void;

  // Privacy Settings
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;

  // Labour Marketplace (“কাজ চাই / শ্রমিক চাই”)
  labourCategories: LabourCategory[];
  labourSkills: LabourSkill[];
  labourProfiles: LabourProfile[];
  labourJobPosts: LabourJobPost[];
  labourContactRequests: LabourContactRequest[];
  currentUserLabourProfile: LabourProfile | undefined;
  labourActiveTab: 'workers' | 'jobs' | 'register_worker' | 'post_job';
  setLabourActiveTab: (tab: 'workers' | 'jobs' | 'register_worker' | 'post_job') => void;
  openLabourMarketplace: (tab?: 'workers' | 'jobs' | 'register_worker' | 'post_job') => void;
  upsertLabourProfile: (profileData: Partial<LabourProfile> & { fullName: string; phone: string }) => Promise<LabourProfile | null>;
  createLabourJobPost: (jobData: Partial<LabourJobPost> & { title: string; description: string; wageAmount: number }) => Promise<LabourJobPost | null>;
  sendLabourContactRequest: (targetType: 'worker' | 'job', targetId: string, receiverId: string, requestType?: 'contact_request' | 'call_request' | 'hire_request', message?: string) => Promise<boolean>;
  reportLabourItem: (targetType: 'worker_profile' | 'job_post' | 'contact_request', targetId: string, reason: string, details?: string) => Promise<boolean>;
  refreshLabourData: () => Promise<void>;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  reportModalData: { targetType: Report['targetType']; targetId: string } | null;
  setReportModalData: (data: { targetType: Report['targetType']; targetId: string } | null) => void;
  createPostModalOpen: boolean;
  setCreatePostModalOpen: (open: boolean) => void;
  ecosystemModalOpen: boolean;
  setEcosystemModalOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('as_users');
    return saved ? JSON.parse(saved) : demoUsers;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem('as_current_user_id');
    if (isSupabaseConfigured) {
      return saved && isValidUUID(saved) ? saved : null;
    }
    return saved || 'user-1';
  });

  const [lastAuthError, setLastAuthError] = useState<string | null>(null);
  const clearAuthError = () => setLastAuthError(null);

  const currentUser = users.find(u => u.id === currentUserId) || (isSupabaseConfigured ? null : (users[0] || null));

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window === 'undefined') return 'feed';
    const path = window.location.pathname;
    if (path.startsWith('/reel/') || path === '/reels' || path === '/videos') return 'reels';
    if (path.startsWith('/post/')) return 'feed';
    if (path === '/chat') return 'chat';
    if (path === '/jobs') return 'jobs';
    if (path === '/marketplace') return 'marketplace';
    if (path === '/matrimony') return 'matrimony';
    if (path === '/labour') return 'labour';
    if (path === '/groups') return 'groups';
    if (path === '/pages') return 'pages';
    if (path === '/admin') return 'admin';
    return 'feed';
  });

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (path.startsWith('/reel/')) return path.replace('/reel/', '');
    if (path.startsWith('/post/')) return path.replace('/post/', '');
    return null;
  });

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/reel/')) {
        setActiveView('reels');
        setSelectedEntityId(path.replace('/reel/', ''));
      } else if (path.startsWith('/post/')) {
        setActiveView('feed');
        setSelectedEntityId(path.replace('/post/', ''));
      } else if (path === '/reels' || path === '/videos') {
        setActiveView('reels');
        setSelectedEntityId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Locations state
  const LOCATION_DB_VERSION = 'v3_official_bangladesh_all_hierarchy';

  const [divisions, setDivisions] = useState<Division[]>(() => {
    const savedVer = localStorage.getItem('as_loc_ver');
    const saved = localStorage.getItem('as_divisions');
    if (saved && savedVer === LOCATION_DB_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 8) return parsed;
      } catch (e) {}
    }
    return initialDivisions;
  });
  const [districts, setDistricts] = useState<District[]>(() => {
    const savedVer = localStorage.getItem('as_loc_ver');
    const saved = localStorage.getItem('as_districts');
    if (saved && savedVer === LOCATION_DB_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 64) return parsed;
      } catch (e) {}
    }
    return initialDistricts;
  });
  const [upazilas, setUpazilas] = useState<Upazila[]>(() => {
    const savedVer = localStorage.getItem('as_loc_ver');
    const saved = localStorage.getItem('as_upazilas');
    if (saved && savedVer === LOCATION_DB_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 494) return parsed;
      } catch (e) {}
    }
    return initialUpazilas;
  });
  const [unions, setUnions] = useState<Union[]>(() => {
    const savedVer = localStorage.getItem('as_loc_ver');
    const saved = localStorage.getItem('as_unions');
    if (saved && savedVer === LOCATION_DB_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4000) return parsed;
      } catch (e) {}
    }
    return initialUnions;
  });
  const [wards, setWards] = useState<Ward[]>(() => {
    const savedVer = localStorage.getItem('as_loc_ver');
    const saved = localStorage.getItem('as_wards');
    if (saved && savedVer === LOCATION_DB_VERSION) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      } catch (e) {}
    }
    return initialWards;
  });

  // Dynamic Supabase Database synchronization (Locations, Auth Session, Real Feed)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Sync locations
    async function syncLocationsFromDb() {
      try {
        const [dbDivs, dbDists] = await Promise.all([
          fetchDivisions(),
          fetchDistricts(),
        ]);
        if (dbDivs && dbDivs.length >= 8) setDivisions(dbDivs);
        if (dbDists && dbDists.length >= 64) setDistricts(dbDists);
      } catch (e) {
        console.warn('Could not sync locations from Supabase:', e);
      }
    }
    syncLocationsFromDb();

    // 2. Restore active Supabase session
    async function restoreSession() {
      if (!supabase) return;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && session?.user) {
          const profile = await syncUserProfileFromAuth(session.user);
          setUsers(prev => [profile, ...prev.filter(u => u.id !== profile.id)]);
          setCurrentUserId(profile.id);
          localStorage.setItem('as_current_user_id', profile.id);

          fetchNotificationsFromDb(profile.id).then(dbNotifs => {
            if (dbNotifs && dbNotifs.length > 0) {
              setNotifications(prev => {
                const dbIds = new Set(dbNotifs.map(n => n.id));
                return [...dbNotifs, ...prev.filter(n => !dbIds.has(n.id))];
              });
            }
          }).catch(() => {});
        } else {
          // If no active Supabase session exists, clear any stale mock user-1 ID
          const savedId = localStorage.getItem('as_current_user_id');
          if (savedId && !isValidUUID(savedId)) {
            localStorage.removeItem('as_current_user_id');
            setCurrentUserId(null);
          }
        }
      } catch (err) {
        console.warn('Could not restore Supabase user session:', err);
      }
    }
    restoreSession();

    // 3. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase onAuthStateChange]', event, session?.user?.id);
      if (session?.user) {
        const profile = await syncUserProfileFromAuth(session.user);
        setUsers(prev => [profile, ...prev.filter(u => u.id !== profile.id)]);
        setCurrentUserId(profile.id);
        localStorage.setItem('as_current_user_id', profile.id);

        fetchNotificationsFromDb(profile.id).then(dbNotifs => {
          if (dbNotifs && dbNotifs.length > 0) {
            setNotifications(prev => {
              const dbIds = new Set(dbNotifs.map(n => n.id));
              return [...dbNotifs, ...prev.filter(n => !dbIds.has(n.id))];
            });
          }
        }).catch(() => {});
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        localStorage.removeItem('as_current_user_id');
      }
    });

    // 4. Fetch initial real posts from Supabase database
    fetchPostsFromDb({ limit: 30 }).then(dbPosts => {
      if (dbPosts && dbPosts.length > 0) {
        setPosts(prev => {
          const dbIds = new Set(dbPosts.map(p => p.id));
          const demoRemaining = prev.filter(p => !dbIds.has(p.id));
          return [...dbPosts, ...demoRemaining];
        });
      }
    }).catch(err => {
      console.warn('Could not fetch real posts from Supabase:', err);
    });

    // 5. Fetch community items from Supabase database
    fetchGroupsFromDb().then(dbGroups => {
      if (dbGroups && dbGroups.length > 0) {
        setGroups(prev => {
          const dbIds = new Set(dbGroups.map(g => g.id));
          return [...dbGroups, ...prev.filter(g => !dbIds.has(g.id))];
        });
      }
    }).catch(() => {});

    fetchPagesFromDb().then(dbPages => {
      if (dbPages && dbPages.length > 0) {
        setPages(prev => {
          const dbIds = new Set(dbPages.map(p => p.id));
          return [...dbPages, ...prev.filter(p => !dbIds.has(p.id))];
        });
      }
    }).catch(() => {});

    fetchJobsFromDb().then(dbJobs => {
      if (dbJobs && dbJobs.length > 0) {
        setJobs(prev => {
          const dbIds = new Set(dbJobs.map(j => j.id));
          return [...dbJobs, ...prev.filter(j => !dbIds.has(j.id))];
        });
      }
    }).catch(() => {});

    fetchMarketplaceFromDb().then(dbMarket => {
      if (dbMarket && dbMarket.length > 0) {
        setMarketplaceListings(prev => {
          const dbIds = new Set(dbMarket.map(m => m.id));
          return [...dbMarket, ...prev.filter(m => !dbIds.has(m.id))];
        });
      }
    }).catch(() => {});

    fetchMatrimonyFromDb().then(dbMat => {
      if (dbMat && dbMat.length > 0) {
        setMatrimonyProfiles(prev => {
          const dbIds = new Set(dbMat.map(m => m.id));
          return [...dbMat, ...prev.filter(m => !dbIds.has(m.id))];
        });
      }
    }).catch(() => {});

    fetchStoriesFromDb().then(dbStories => {
      if (dbStories && dbStories.length > 0) {
        setStories(dbStories);
      }
    }).catch(() => {});

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [locationFilter, setLocationFilter] = useState<LocationFilter>({});

  // Social content state
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('as_posts');
    if (saved) {
      try {
        const parsed: Post[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map(p => {
            const storagePath = (p as any).storage_path || (p as any).storagePath || (p.editingMetadata as any)?.storagePath;
            if (p.mediaUrls && p.mediaUrls.length > 0) {
              const updatedUrls = p.mediaUrls.map(u => {
                if (u && typeof u === 'string' && u.startsWith('blob:') && storagePath) {
                  const resolvedPath = resolvePlayableMediaUrl(storagePath, p.postType === 'reel' ? 'reels' : 'post-videos');
                  if (resolvedPath.url) return resolvedPath.url;
                }
                const res = resolvePlayableMediaUrl(u, p.postType === 'reel' ? 'reels' : 'post-videos');
                return res.url || u;
              });
              return { ...p, mediaUrls: updatedUrls };
            }
            return p;
          });
          const savedIds = new Set(normalized.map(p => p.id));
          const missingDefaults = initialPosts.filter(p => !savedIds.has(p.id));
          return [...normalized, ...missingDefaults];
        }
      } catch {}
    }
    return initialPosts;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('as_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          return parsed.filter((s: Story) => new Date(s.expiresAt).getTime() > now);
        }
      } catch {}
    }
    return [];
  });

  const [createStoryModalOpen, setCreateStoryModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('as_stories', JSON.stringify(stories));
  }, [stories]);

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('as_comments');
    return saved ? JSON.parse(saved) : initialComments;
  });

  const [friendships, setFriendships] = useState<Friendship[]>(() => {
    const saved = localStorage.getItem('as_friendships');
    return saved ? JSON.parse(saved) : initialFriendships;
  });

  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('as_following_ids');
    return saved ? JSON.parse(saved) : ['user-2', 'user-3', 'user-4'];
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('as_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);

  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('as_groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });

  const [pages, setPages] = useState<Page[]>(() => {
    const saved = localStorage.getItem('as_pages');
    return saved ? JSON.parse(saved) : initialPages;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('as_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('as_applied_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(() => {
    const saved = localStorage.getItem('as_marketplace');
    return saved ? JSON.parse(saved) : initialMarketplaceListings;
  });

  const [matrimonyProfiles, setMatrimonyProfiles] = useState<MatrimonyProfile[]>(() => {
    const saved = localStorage.getItem('as_matrimony');
    return saved ? JSON.parse(saved) : initialMatrimonyProfiles;
  });

  const [connectedMatrimonyIds, setConnectedMatrimonyIds] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('as_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          return parsed.filter(n => {
            if (!n?.id || seen.has(n.id)) return false;
            seen.add(n.id);
            return true;
          });
        }
      } catch (e) {}
    }
    return initialNotifications;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('as_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('as_privacy');
    return saved ? JSON.parse(saved) : initialPrivacySettings;
  });

  // Labour Marketplace (“কাজ চাই / শ্রমিক চাই”) State
  const [labourCategories, setLabourCategories] = useState<LabourCategory[]>(initialLabourCategories);
  const [labourSkills, setLabourSkills] = useState<LabourSkill[]>(initialLabourSkills);
  const [labourProfiles, setLabourProfiles] = useState<LabourProfile[]>(() => {
    const saved = localStorage.getItem('as_labour_profiles');
    return saved ? JSON.parse(saved) : initialLabourProfiles;
  });
  const [labourJobPosts, setLabourJobPosts] = useState<LabourJobPost[]>(() => {
    const saved = localStorage.getItem('as_labour_jobs');
    return saved ? JSON.parse(saved) : initialLabourJobPosts;
  });
  const [labourContactRequests, setLabourContactRequests] = useState<LabourContactRequest[]>(() => {
    const saved = localStorage.getItem('as_labour_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [labourActiveTab, setLabourActiveTab] = useState<'workers' | 'jobs' | 'register_worker' | 'post_job'>('workers');

  // UI Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [ecosystemModalOpen, setEcosystemModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{ targetType: Report['targetType']; targetId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('as_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem('as_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('as_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('as_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('as_loc_ver', LOCATION_DB_VERSION);
    localStorage.setItem('as_divisions', JSON.stringify(divisions));
    localStorage.setItem('as_districts', JSON.stringify(districts));
    localStorage.setItem('as_upazilas', JSON.stringify(upazilas));
    localStorage.setItem('as_unions', JSON.stringify(unions));
    localStorage.setItem('as_wards', JSON.stringify(wards));
  }, [divisions, districts, upazilas, unions, wards]);

  useEffect(() => {
    localStorage.setItem('as_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('as_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('as_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('as_pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('as_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('as_marketplace', JSON.stringify(marketplaceListings));
  }, [marketplaceListings]);

  useEffect(() => {
    localStorage.setItem('as_labour_profiles', JSON.stringify(labourProfiles));
  }, [labourProfiles]);

  useEffect(() => {
    localStorage.setItem('as_labour_jobs', JSON.stringify(labourJobPosts));
  }, [labourJobPosts]);

  useEffect(() => {
    localStorage.setItem('as_labour_contacts', JSON.stringify(labourContactRequests));
  }, [labourContactRequests]);

  // Auth functions
  const setCurrentUser = (user: User | null) => {
    if (user) {
      setCurrentUserId(user.id);
      localStorage.setItem('as_current_user_id', user.id);
    } else {
      setCurrentUserId(null);
      localStorage.removeItem('as_current_user_id');
    }
  };

  const switchUser = async (userId: string): Promise<boolean> => {
    const target = users.find(u => u.id === userId);
    if (!target) return false;

    if (isSupabaseConfigured && supabase) {
      // Check if current active Supabase session already matches
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id === target.id) {
        setCurrentUserId(target.id);
        localStorage.setItem('as_current_user_id', target.id);
        return true;
      }

      // If switching to a demo/profile account in Supabase mode, attempt real Supabase authentication
      const demoEmail = target.email || `${target.username}@gmail.com`;
      const demoPass = 'AponSomaj@123456';

      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      console.log('[Supabase Auth Debug] switchUser signIn:', {
        'signIn error': signInError ? signInError.message : null,
        'session exists / null': Boolean(authData?.session) ? 'exists' : 'null',
        'session.user.id': authData?.session?.user?.id ?? null,
      });

      const { data: { session: postSession }, error: sessionErr } = await supabase.auth.getSession();
      const { data: { user: postUser }, error: userErr } = await supabase.auth.getUser();

      console.log('[Supabase Auth Debug] switchUser post verification:', {
        'session exists / null': Boolean(postSession) ? 'exists' : 'null',
        'session.user.id': postSession?.user?.id ?? null,
        'session error': sessionErr ? sessionErr.message : null,
        'getUser error': userErr ? userErr.message : null,
        'getUser.id': postUser?.id ?? null,
      });

      if (!signInError && authData?.user && postSession?.user?.id) {
        const profile = await syncUserProfileFromAuth(authData.user);
        setUsers(prev => [profile, ...prev.filter(u => u.id !== profile.id)]);
        setCurrentUserId(authData.user.id);
        localStorage.setItem('as_current_user_id', authData.user.id);
        return true;
      }
      return false;
    }

    // Only set locally if Supabase is unconfigured
    if (!isSupabaseConfigured) {
      setCurrentUserId(target.id);
      localStorage.setItem('as_current_user_id', target.id);
      return true;
    }
    return false;
  };

  const login = async (identifier: string, pass: string): Promise<boolean> => {
    const trimmed = identifier.trim().toLowerCase();

    // 1. Real Supabase Authentication
    if (isSupabaseConfigured && supabase) {
      try {
        const candidateEmails: string[] = [];
        if (trimmed.includes('@')) {
          candidateEmails.push(trimmed);
        } else {
          // Check if a profile exists with this username or phone
          const { data: matchedProfiles } = await supabase
            .from('profiles')
            .select('id, username, phone')
            .or(`username.eq.${trimmed},phone.eq.${trimmed}`)
            .limit(1);

          if (matchedProfiles && matchedProfiles.length > 0) {
            candidateEmails.push(`${matchedProfiles[0].username}@gmail.com`);
          }
          candidateEmails.push(`${trimmed}@gmail.com`);
          candidateEmails.push(`${trimmed}@aponsomaj.com`);
        }

        let authSuccess = false;
        let lastErrorMsg = '';

        for (const email of candidateEmails) {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: pass || 'AponSomaj@123456',
          });

          const { data: { session: postSession }, error: sessionErr } = await supabase.auth.getSession();
          const { data: { user: postUser }, error: userErr } = await supabase.auth.getUser();

          console.log({
            signInSucceeded: !authError,
            sessionExists: !!postSession,
            sessionUserId: postSession?.user?.id ?? null,
            userExists: !!postUser,
            userId: postUser?.id ?? null,
            sessionError: sessionErr?.message ?? null,
            userError: userErr?.message ?? null,
          });

          if (!authError && authData.user && postSession?.user?.id) {
            const profile = await syncUserProfileFromAuth(authData.user);
            setUsers(prev => [profile, ...prev.filter(u => u.id !== profile.id)]);
            setCurrentUserId(authData.user.id);
            localStorage.setItem('as_current_user_id', authData.user.id);
            setLastAuthError(null);
            authSuccess = true;
            break;
          } else if (authError) {
            lastErrorMsg = authError.message;
          }
        }

        if (authSuccess) {
          return true;
        }

        console.warn('[Supabase Login Failed]:', lastErrorMsg);
        setLastAuthError(lastErrorMsg || 'Login failed');
        // Supabase is configured: NEVER fake a login with demo accounts
        return false;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn('Supabase login exception:', e);
        setLastAuthError(msg);
        return false;
      }
    }

    // 2. Only in pure unconfigured local environment
    const found = users.find(
      u =>
        u.email.toLowerCase() === trimmed ||
        u.phone === trimmed ||
        u.username.toLowerCase() === trimmed
    );
    if (found) {
      setCurrentUserId(found.id);
      localStorage.setItem('as_current_user_id', found.id);
      return true;
    }
    return false;
  };

  const register = async (data: Partial<User>): Promise<boolean> => {
    const trimmedPhone = data.phone?.trim();
    const trimmedUsername = data.username?.trim().toLowerCase();
    const existsLocally = users.some(
      u =>
        (trimmedPhone && u.phone === trimmedPhone) ||
        (trimmedUsername && u.username.toLowerCase() === trimmedUsername)
    );
    if (existsLocally) return false;

    // 1. If Supabase is connected, create real Supabase auth user & profile
    if (isSupabaseConfigured && supabase) {
      try {
        const email = data.email?.trim() || `${trimmedUsername || 'user_' + Date.now()}@gmail.com`;
        const pass = data.password || 'AponSomaj@123456';

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              full_name: data.name || 'New Member',
              username: trimmedUsername || `user_${Date.now()}`,
              phone: trimmedPhone || '',
            },
          },
        });

        const { data: { session: postSignUpSession } } = await supabase.auth.getSession();

        if (!authError && authData.user) {
          const userId = authData.user.id;
          await updateProfileInDb(userId, {
            ...data,
            name: data.name,
            bnName: data.bnName,
            username: trimmedUsername,
            phone: trimmedPhone,
          });

          const profile = await syncUserProfileFromAuth(authData.user);
          setUsers(prev => [profile, ...prev.filter(u => u.id !== profile.id)]);

          if (postSignUpSession?.user?.id || authData.session?.user?.id) {
            setCurrentUserId(userId);
            localStorage.setItem('as_current_user_id', userId);
            return true;
          } else {
            console.warn('[Supabase Register]: User created in Supabase Auth, but active session requires confirmation or sign in.');
            return false;
          }
        } else {
          console.warn('[Supabase Register Failed]:', authError?.message);
          return false;
        }
      } catch (e) {
        console.warn('Supabase register error:', e);
        return false;
      }
    }

    // 2. Fallback to local demo registration only when Supabase is not configured
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || 'New Member',
      bnName: data.bnName || data.name,
      username: data.username || `user_${Date.now()}`,
      email: data.email || '',
      phone: data.phone || '',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
      bio: data.bio || 'আপন সমাজে নতুন সদস্য 🌿',
      hometown: data.hometown || 'Dhaka',
      currentDistrict: data.currentDistrict || 'Dhaka',
      divisionId: data.divisionId,
      districtId: data.districtId,
      upazilaId: data.upazilaId,
      unionId: data.unionId,
      wardId: data.wardId,
      role: 'user',
      isVerified: false,
      joinedDate: 'আজ',
      followersCount: 0,
      followingCount: 0,
      friendsCount: 0,
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    localStorage.setItem('as_current_user_id', newUser.id);
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }
    setCurrentUserId(null);
    localStorage.removeItem('as_current_user_id');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, ...data } : u))
    );
    if (isSupabaseConfigured && supabase) {
      updateProfileInDb(currentUser.id, data).catch(err => {
        console.warn('Could not sync profile update to Supabase:', err);
      });
    }
  };

  const openUserProfile = (userId: string) => {
    setSelectedEntityId(userId);
    setActiveView('profile');
  };

  // Location string helper
  const getLocationString = (loc?: LocationTag): string => {
    if (!loc) return 'বাংলাদেশ (Bangladesh)';
    const parts: string[] = [];
    if (loc.wardName) parts.push(loc.wardName);
    if (loc.unionName) parts.push(loc.unionName);
    if (loc.upazilaName) parts.push(loc.upazilaName);
    if (loc.districtName) parts.push(loc.districtName);
    if (loc.divisionName && parts.length < 2) parts.push(loc.divisionName);
    return parts.length > 0 ? parts.join(', ') : 'বাংলাদেশ (Bangladesh)';
  };

  const resetLocationFilter = () => {
    setLocationFilter({});
  };

  // Location Management (Super Admin)
  const addDivision = (div: Omit<Division, 'id'>) => {
    const newDiv: Division = { ...div, id: `div-${Date.now()}` };
    setDivisions(prev => [...prev, newDiv]);
  };
  const updateDivision = (div: Division) => {
    setDivisions(prev => prev.map(d => (d.id === div.id ? div : d)));
  };
  const deleteDivision = (id: string): boolean => {
    const hasDistricts = districts.some(d => d.divisionId === id);
    if (hasDistricts) return false;
    const hasUsers = users.some(u => u.divisionId === id);
    if (hasUsers) return false;
    const hasPosts = posts.some(p => p.location?.divisionId === id);
    if (hasPosts) return false;
    setDivisions(prev => prev.filter(d => d.id !== id));
    return true;
  };
  const toggleDivision = (id: string) => {
    setDivisions(prev => prev.map(d => (d.id === id ? { ...d, active: !d.active } : d)));
  };

  const addDistrict = (dis: Omit<District, 'id'>) => {
    const newDis: District = { ...dis, id: `dis-${Date.now()}` };
    setDistricts(prev => [...prev, newDis]);
  };
  const updateDistrict = (dis: District) => {
    setDistricts(prev => prev.map(d => (d.id === dis.id ? dis : d)));
  };
  const deleteDistrict = (id: string): boolean => {
    const hasUpazilas = upazilas.some(u => u.districtId === id);
    if (hasUpazilas) return false;
    const hasUsers = users.some(u => u.districtId === id);
    if (hasUsers) return false;
    const hasPosts = posts.some(p => p.location?.districtId === id);
    if (hasPosts) return false;
    setDistricts(prev => prev.filter(d => d.id !== id));
    return true;
  };
  const toggleDistrict = (id: string) => {
    setDistricts(prev => prev.map(d => (d.id === id ? { ...d, active: !d.active } : d)));
  };

  const addUpazila = (up: Omit<Upazila, 'id'>) => {
    const newUp: Upazila = { ...up, id: `up-${Date.now()}` };
    setUpazilas(prev => [...prev, newUp]);
  };
  const updateUpazila = (up: Upazila) => {
    setUpazilas(prev => prev.map(u => (u.id === up.id ? up : u)));
  };
  const deleteUpazila = (id: string): boolean => {
    const hasUnions = unions.some(un => un.upazilaId === id);
    if (hasUnions) return false;
    const hasUsers = users.some(u => u.upazilaId === id);
    if (hasUsers) return false;
    const hasPosts = posts.some(p => p.location?.upazilaId === id);
    if (hasPosts) return false;
    setUpazilas(prev => prev.filter(u => u.id !== id));
    return true;
  };
  const toggleUpazila = (id: string) => {
    setUpazilas(prev => prev.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const addUnion = (un: Omit<Union, 'id'>) => {
    const newUn: Union = { ...un, id: `un-${Date.now()}` };
    setUnions(prev => [...prev, newUn]);
  };
  const updateUnion = (un: Union) => {
    setUnions(prev => prev.map(u => (u.id === un.id ? un : u)));
  };
  const deleteUnion = (id: string): boolean => {
    const hasWards = wards.some(w => w.unionId === id);
    if (hasWards) return false;
    const hasUsers = users.some(u => u.unionId === id);
    if (hasUsers) return false;
    const hasPosts = posts.some(p => p.location?.unionId === id);
    if (hasPosts) return false;
    setUnions(prev => prev.filter(u => u.id !== id));
    return true;
  };
  const toggleUnion = (id: string) => {
    setUnions(prev => prev.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const addWard = (w: Omit<Ward, 'id'>) => {
    const newW: Ward = { ...w, id: `w-${Date.now()}` };
    setWards(prev => [...prev, newW]);
  };
  const updateWard = (w: Ward) => {
    setWards(prev => prev.map(item => (item.id === w.id ? w : item)));
  };
  const deleteWard = (id: string): boolean => {
    const hasUsers = users.some(u => u.wardId === id);
    if (hasUsers) return false;
    const hasPosts = posts.some(p => p.location?.wardId === id);
    if (hasPosts) return false;
    setWards(prev => prev.filter(w => w.id !== id));
    return true;
  };
  const toggleWard = (id: string) => {
    setWards(prev => prev.map(w => (w.id === id ? { ...w, active: !w.active } : w)));
  };

  const resetLocationsToDefault = () => {
    setDivisions(initialDivisions);
    setDistricts(initialDistricts);
    setUpazilas(initialUpazilas);
    setUnions(initialUnions);
    setWards(initialWards);
    localStorage.setItem('as_loc_ver', LOCATION_DB_VERSION);
    localStorage.setItem('as_divisions', JSON.stringify(initialDivisions));
    localStorage.setItem('as_districts', JSON.stringify(initialDistricts));
    localStorage.setItem('as_upazilas', JSON.stringify(initialUpazilas));
    localStorage.setItem('as_unions', JSON.stringify(initialUnions));
    localStorage.setItem('as_wards', JSON.stringify(initialWards));
  };

  // Stories & 24h Expiration
  const fetchStories = async () => {
    const dbStories = await fetchStoriesFromDb();
    if (dbStories && dbStories.length > 0) {
      setStories(dbStories);
    }
  };

  const addStory = async (storyData: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    content?: string;
    backgroundStyle?: string;
    privacy?: 'public' | 'friends';
    locationName?: string;
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
  }): Promise<Story | null> => {
    if (!currentUser) return null;
    const dbStory = await createStoryInDb({
      userId: currentUser.id,
      ...storyData,
    });
    if (dbStory) {
      setStories(prev => [dbStory, ...prev.filter(s => s.id !== dbStory.id)]);
      return dbStory;
    }
    const localStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      mediaUrl: storyData.mediaUrl,
      mediaType: storyData.mediaType,
      content: storyData.content,
      backgroundStyle: storyData.backgroundStyle,
      privacy: storyData.privacy || 'public',
      locationName: storyData.locationName,
      divisionId: storyData.divisionId,
      districtId: storyData.districtId,
      upazilaId: storyData.upazilaId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isArchived: false,
    };
    setStories(prev => [localStory, ...prev]);
    return localStory;
  };

  const deleteStory = async (storyId: string): Promise<boolean> => {
    if (!currentUser) return false;
    setStories(prev => prev.filter(s => s.id !== storyId));
    return await deleteStoryInDb(storyId, currentUser.id);
  };

  // Posts
  const createPost = async (postData: Omit<Post, 'id' | 'authorId' | 'createdAt' | 'reactions' | 'commentCount' | 'shareCount'>): Promise<Post> => {
    if (!currentUser) {
      throw new Error('[Authentication Error] ব্যবহারকারী লগইন অবস্থায় নেই।');
    }

    // Real Supabase persistence
    if (isSupabaseConfigured && supabase) {
      const dbPost = await createPostInDb({ ...postData, authorId: currentUser.id });
      if (!dbPost) {
        throw new Error('[Database Save Error] পোস্টটি ডাটাবেজে সংরক্ষণ করা সম্ভব হয়নি।');
      }
      setPosts(prev => [dbPost, ...prev]);
      return dbPost;
    }

    throw new Error('[Database Save Error] সুপাবেজ ডাটাবেজ সংযোগ সক্রিয় নেই। পোস্ট সংরক্ষণ করা যায়নি।');
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (isSupabaseConfigured && supabase && currentUser) {
      deletePostInDb(postId, currentUser.id).catch(err => {
        console.warn('Could not delete post from Supabase:', err);
      });
    }
  };

  const reactToPost = (postId: string, type: ReactionType) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const newReactions = { ...post.reactions };
        const currentlyHas = newReactions[type]?.includes(userId);

        // Remove user from all reaction types on this post
        (Object.keys(newReactions) as ReactionType[]).forEach(k => {
          newReactions[k] = (newReactions[k] || []).filter(id => id !== userId);
        });

        // If wasn't active on this type, add it
        if (!currentlyHas) {
          newReactions[type] = [...(newReactions[type] || []), userId];

          // Notify post author if not self
          if (post.authorId !== userId) {
            const notif: Notification = {
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              userId: post.authorId,
              actorId: userId,
              type: 'reaction',
              title: `${currentUser.name} আপনার পোস্টে প্রতিক্রিয়া জানিয়েছেন`,
              content: post.content.substring(0, 60),
              read: false,
              createdAt: 'এইমাত্র'
            };
            setNotifications(n => [notif, ...n]);
          }
        }

        return { ...post, reactions: newReactions };
      })
    );

    // Real Supabase reaction sync
    if (isSupabaseConfigured && supabase && currentUser) {
      toggleReactionInDb(postId, currentUser.id, type).catch(err => {
        console.warn('Could not sync reaction to Supabase:', err);
      });
    }
  };

  const votePoll = (postId: string, optionId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId || !post.poll) return post;
        const currentOptions = post.poll.options.map(opt => {
          const hasVoted = opt.votes.includes(userId);
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: hasVoted ? opt.votes : [...opt.votes, userId]
            };
          } else {
            return {
              ...opt,
              votes: opt.votes.filter(id => id !== userId)
            };
          }
        });

        const totalVotes = currentOptions.reduce((acc, o) => acc + o.votes.length, 0);

        return {
          ...post,
          poll: {
            ...post.poll,
            options: currentOptions,
            totalVotes
          }
        };
      })
    );
  };

  const toggleSavePost = (postId: string) => {
    const isCurrentlySaved = savedPostIds.includes(postId);
    setSavedPostIds(prev =>
      isCurrentlySaved ? prev.filter(id => id !== postId) : [...prev, postId]
    );

    // Real Supabase save/unsave sync
    if (isSupabaseConfigured && supabase && currentUser) {
      if (isCurrentlySaved) {
        unsavePostInDb(currentUser.id, postId).catch(console.warn);
      } else {
        savePostInDb(currentUser.id, postId).catch(console.warn);
      }
    }
  };

  // Comments
  const addComment = (postId: string, content: string, parentId?: string) => {
    if (!currentUser || !content.trim()) return;
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      postId,
      authorId: currentUser.id,
      content: content.trim(),
      createdAt: 'এখন মাত্র',
      parentId,
      reactions: { like: [] }
    };

    setComments(prev => [...prev, newComment]);
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p))
    );

    // Real Supabase comment sync
    if (isSupabaseConfigured && supabase) {
      addCommentInDb(postId, currentUser.id, content.trim(), parentId).catch(err => {
        console.warn('Could not sync comment to Supabase:', err);
      });
    }

    // Notify post author
    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && targetPost.authorId !== currentUser.id) {
      const notif: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        userId: targetPost.authorId,
        actorId: currentUser.id,
        type: parentId ? 'comment_reply' : 'comment',
        title: `${currentUser.name} আপনার পোস্টে মন্তব্য করেছেন`,
        content: content.trim().substring(0, 70),
        read: false,
        createdAt: 'এইমাত্র'
      };
      setNotifications(n => [notif, ...n]);
    }
  };

  const deleteComment = (commentId: string) => {
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
    setPosts(prev =>
      prev.map(p => (p.id === target.postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p))
    );
  };

  const reactToComment = (commentId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    setComments(prev =>
      prev.map(com => {
        if (com.id !== commentId) return com;
        const hasLiked = com.reactions.like?.includes(userId);
        const newLikes = hasLiked
          ? com.reactions.like.filter(id => id !== userId)
          : [...(com.reactions.like || []), userId];
        return {
          ...com,
          reactions: { ...com.reactions, like: newLikes }
        };
      })
    );
  };

  // Friends & Social Graph
  const sendFriendRequest = (targetUserId: string) => {
    if (!currentUser || currentUser.id === targetUserId) return;
    const newReq: Friendship = {
      id: `f-${Date.now()}`,
      requesterId: currentUser.id,
      receiverId: targetUserId,
      status: 'pending',
      createdAt: 'এইমাত্র'
    };
    setFriendships(prev => [...prev, newReq]);

    // Real Supabase friend request sync
    if (isSupabaseConfigured && supabase) {
      sendFriendRequestInDb(currentUser.id, targetUserId).catch(err => {
        console.warn('Could not send friend request in Supabase:', err);
      });
    }

    // Notification
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: targetUserId,
      actorId: currentUser.id,
      type: 'friend_request',
      title: `${currentUser.name} আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন`,
      content: 'কানেক্ট করার জন্য অনুরোধ করেছেন।',
      read: false,
      createdAt: 'এইমাত্র'
    };
    setNotifications(n => [notif, ...n]);
  };

  const acceptFriendRequest = (requestId: string) => {
    setFriendships(prev =>
      prev.map(f => {
        if (f.id !== requestId) return f;

        // Real Supabase accept sync
        if (isSupabaseConfigured && supabase) {
          respondFriendRequestInDb(requestId, 'accepted').catch(err => {
            console.warn('Could not accept friend request in Supabase:', err);
          });
        }

        // Notify requester
        if (currentUser) {
          const notif: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: f.requesterId,
            actorId: currentUser.id,
            type: 'friend_accepted',
            title: `${currentUser.name} আপনার ফ্রেন্ড রিকোয়েস্ট গ্রহণ করেছেন`,
            content: 'আপনারা এখন আপন সমাজের বন্ধু।',
            read: false,
            createdAt: 'এইমাত্র'
          };
          setNotifications(n => [notif, ...n]);
        }
        return { ...f, status: 'accepted' };
      })
    );
  };

  const rejectFriendRequest = (requestId: string) => {
    setFriendships(prev => prev.filter(f => f.id !== requestId));
    if (isSupabaseConfigured && supabase) {
      respondFriendRequestInDb(requestId, 'declined').catch(err => {
        console.warn('Could not reject friend request in Supabase:', err);
      });
    }
  };

  const removeFriend = (targetUserId: string) => {
    if (!currentUser) return;
    setFriendships(prev =>
      prev.filter(
        f =>
          !(
            (f.requesterId === currentUser.id && f.receiverId === targetUserId) ||
            (f.receiverId === currentUser.id && f.requesterId === targetUserId)
          )
      )
    );
  };

  const toggleFollowUser = (targetUserId: string) => {
    setFollowingIds(prev =>
      prev.includes(targetUserId)
        ? prev.filter(id => id !== targetUserId)
        : [...prev, targetUserId]
    );

    // Real Supabase follow sync
    if (isSupabaseConfigured && supabase && currentUser) {
      toggleFollowInDb(currentUser.id, targetUserId).catch(err => {
        console.warn('Could not toggle follow in Supabase:', err);
      });
    }
  };

  // Messenger / Chat
  const sendMessage = (
    receiverId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'file' | 'voice',
    voiceDuration?: number
  ) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      content,
      mediaUrl,
      mediaType,
      voiceDuration,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setMessages(prev => [...prev, newMsg]);

    // Real Supabase direct message sync
    if (isSupabaseConfigured && supabase) {
      sendDirectMessageInDb(currentUser.id, receiverId, content, mediaUrl).catch((err: unknown) => {
        console.warn('Could not send message in Supabase:', err);
      });
    }

    // Simulated auto-reply for interactive demo feel after 1.5 seconds if sending to an initial demo user
    if (receiverId.startsWith('user-') && receiverId !== currentUser.id) {
      setTimeout(() => {
        const receiver = users.find(u => u.id === receiverId);
        const replies = [
          `ধন্যবাদ বার্তা পাঠানোর জন্য! আপনার এলাকার সাথে যুক্ত থাকতে পেরে ভালো লাগছে। 😊`,
          `হ্যাঁ আমি বার্তা পেয়েছি। আপন সমাজে আপনার কার্যক্রম চমৎকার!`,
          `দারুণ! আমি একটু কাজে আছি, কিছুক্ষণ পর বিস্তারিত কথা বলছি ভাই।`,
          `ইনশাআল্লাহ খুব শীঘ্রই কথা হচ্ছে!`
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: Message = {
          id: `m-${Date.now() + 1}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          content: randomReply,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        setMessages(m => [...m, replyMsg]);
      }, 1400);
    }
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Groups
  const createGroup = (data: Omit<Group, 'id' | 'createdAt' | 'memberIds' | 'adminIds'>) => {
    if (!currentUser) return;
    const newGroup: Group = {
      ...data,
      id: `grp-${Date.now()}`,
      createdAt: 'এইমাত্র',
      memberIds: [currentUser.id],
      adminIds: [currentUser.id],
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const toggleJoinGroup = (groupId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const isMember = g.memberIds.includes(userId);
        return {
          ...g,
          memberIds: isMember ? g.memberIds.filter(id => id !== userId) : [...g.memberIds, userId]
        };
      })
    );
  };

  // Pages
  const createPage = (data: Omit<Page, 'id' | 'createdAt' | 'followerIds' | 'rating' | 'reviewCount' | 'verified'>) => {
    if (!currentUser) return;
    const newPage: Page = {
      ...data,
      id: `page-${Date.now()}`,
      createdAt: 'এইমাত্র',
      followerIds: [currentUser.id],
      rating: 5.0,
      reviewCount: 1,
      verified: false
    };
    setPages(prev => [newPage, ...prev]);
  };

  const toggleFollowPage = (pageId: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    setPages(prev =>
      prev.map(p => {
        if (p.id !== pageId) return p;
        const isFollowing = p.followerIds.includes(userId);
        return {
          ...p,
          followerIds: isFollowing
            ? p.followerIds.filter(id => id !== userId)
            : [...p.followerIds, userId]
        };
      })
    );
  };

  // Jobs
  const createJob = (data: Omit<Job, 'id' | 'createdAt' | 'posterId' | 'applicantsCount'>) => {
    if (!currentUser) return;
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      posterId: currentUser.id,
      applicantsCount: 0,
      createdAt: 'আজ'
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const applyToJob = (jobId: string) => {
    if (appliedJobIds.includes(jobId)) return;
    setAppliedJobIds(prev => [...prev, jobId]);
    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // Marketplace
  const createMarketplaceListing = (
    data: Omit<MarketplaceListing, 'id' | 'createdAt' | 'sellerId' | 'status'>
  ) => {
    if (!currentUser) return;
    const newListing: MarketplaceListing = {
      ...data,
      id: `market-${Date.now()}`,
      sellerId: currentUser.id,
      status: 'available',
      createdAt: 'এইমাত্র'
    };
    setMarketplaceListings(prev => [newListing, ...prev]);
  };

  const toggleListingStatus = (listingId: string) => {
    setMarketplaceListings(prev =>
      prev.map(item =>
        item.id === listingId
          ? { ...item, status: item.status === 'available' ? 'sold' : 'available' }
          : item
      )
    );
  };

  const toggleSaveListing = (listingId: string) => {
    setSavedListingIds(prev =>
      prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );
  };

  // Matrimony
  const createOrUpdateMatrimonyProfile = (
    data: Omit<MatrimonyProfile, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!currentUser) return;
    const existing = matrimonyProfiles.find(m => m.userId === currentUser.id);
    if (existing) {
      setMatrimonyProfiles(prev =>
        prev.map(m => (m.id === existing.id ? { ...m, ...data } : m))
      );
    } else {
      const newProfile: MatrimonyProfile = {
        ...data,
        id: `mat-${Date.now()}`,
        userId: currentUser.id,
        createdAt: 'এইমাত্র'
      };
      setMatrimonyProfiles(prev => [newProfile, ...prev]);
    }
  };

  const connectMatrimony = (profileId: string) => {
    setConnectedMatrimonyIds(prev =>
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    if (isSupabaseConfigured && supabase) {
      markNotificationAsReadInDb(id).catch(err => {
        console.warn('markNotificationAsRead error:', err);
      });
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isSupabaseConfigured && supabase) {
      notifications.filter(n => !n.read).forEach(n => {
        markNotificationAsReadInDb(n.id).catch(() => {});
      });
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Reports
  const createReport = (
    targetType: Report['targetType'],
    targetId: string,
    reason: string,
    details: string
  ) => {
    if (!currentUser) return;
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      targetType,
      targetId,
      reason,
      details,
      status: 'pending',
      createdAt: 'এইমাত্র'
    };
    setReports(prev => [newReport, ...prev]);

    if (isSupabaseConfigured && supabase) {
      createReportInDb({
        reporterId: currentUser.id,
        targetType,
        targetId,
        reason,
        details,
      }).catch(err => {
        console.warn('Could not submit report to Supabase:', err);
      });
    }
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: action } : r))
    );
  };

  // Privacy Settings
  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => ({ ...prev, ...settings }));
  };

  const updateUserProfile = (data: Partial<User>) => {
    updateProfile(data);
  };

  const toggleUserBan = (userId: string) => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
      localStorage.setItem('as_users', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleUserVerify = (userId: string) => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
      localStorage.setItem('as_users', JSON.stringify(updated));
      return updated;
    });
  };

  const changeUserRole = (userId: string, role: 'user' | 'moderator' | 'admin') => {
    setUsers(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, role } : u));
      localStorage.setItem('as_users', JSON.stringify(updated));
      return updated;
    });
  };

  const addLocationNode = (type: 'division' | 'district' | 'upazila' | 'union' | 'ward', data: any) => {
    if (type === 'division') addDivision({ name: data.name, bnName: data.bnName, active: true });
    else if (type === 'district') addDistrict({ divisionId: data.divisionId, name: data.name, bnName: data.bnName, active: true });
    else if (type === 'upazila') addUpazila({ districtId: data.districtId, name: data.name, bnName: data.bnName, active: true });
    else if (type === 'union') addUnion({ upazilaId: data.upazilaId, name: data.name, bnName: data.bnName, active: true });
    else if (type === 'ward') addWard({ unionId: data.unionId, number: data.number || 1, name: data.name, bnName: data.bnName, active: true });
  };

  const applyJob = (jobId: string) => {
    applyToJob(jobId);
  };

  const createMatrimonyProfile = (data: any) => {
    createOrUpdateMatrimonyProfile(data);
  };

  const expressMatrimonyInterest = (profileId: string) => {
    connectMatrimony(profileId);
  };

  const submitReport = (targetType: Report['targetType'], targetId: string, reason: string, details: string) => {
    createReport(targetType, targetId, reason, details);
  };

  const dismissReport = (reportId: string) => {
    resolveReport(reportId, 'dismissed');
  };

  // Labour Marketplace (“কাজ চাই / শ্রমিক চাই”) Handlers
  const currentUserLabourProfile = currentUser
    ? labourProfiles.find(lp => lp.userId === currentUser.id)
    : undefined;

  const openLabourMarketplace = (tab: 'workers' | 'jobs' | 'register_worker' | 'post_job' = 'workers') => {
    setLabourActiveTab(tab);
    setActiveView('labour');
  };

  const refreshLabourData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const [cats, sks, profs, jbs] = await Promise.all([
        fetchLabourCategoriesFromDb(),
        fetchLabourSkillsFromDb(),
        fetchLabourProfilesFromDb(),
        fetchLabourJobPostsFromDb(),
      ]);
      if (cats && cats.length > 0) setLabourCategories(cats);
      if (sks && sks.length > 0) setLabourSkills(sks);
      if (profs && profs.length > 0) {
        setLabourProfiles(prev => {
          const merged = [...profs];
          prev.forEach(p => {
            if (!merged.some(m => m.id === p.id)) merged.push(p);
          });
          return merged;
        });
      }
      if (jbs && jbs.length > 0) {
        setLabourJobPosts(prev => {
          const merged = [...jbs];
          prev.forEach(j => {
            if (!merged.some(m => m.id === j.id)) merged.push(j);
          });
          return merged;
        });
      }
    } catch (e) {
      console.warn('refreshLabourData exception:', e);
    }
  };

  const upsertLabourProfile = async (
    profileData: Partial<LabourProfile> & { fullName: string; phone: string }
  ): Promise<LabourProfile | null> => {
    if (!currentUser) return null;

    const existing = labourProfiles.find(lp => lp.userId === currentUser.id);
    const profileId = existing ? existing.id : `lp-${Date.now()}`;

    const newProfile: LabourProfile = {
      id: profileId,
      userId: currentUser.id,
      userType: profileData.userType || 'looking_for_work',
      fullName: profileData.fullName,
      phone: profileData.phone,
      isPhoneVerified: profileData.isPhoneVerified ?? true,
      avatarUrl: profileData.avatarUrl || currentUser.avatar,
      categoryId: profileData.categoryId || 'construction',
      skillId: profileData.skillId || 'mason',
      specificSkill: profileData.specificSkill || 'রাজমিস্ত্রি',
      experienceYears: profileData.experienceYears ?? 1,
      experienceLevel: profileData.experienceLevel || 'দক্ষ কারিগর',
      expectedDailyWage: profileData.expectedDailyWage ?? 700,
      expectedMonthlyWage: profileData.expectedMonthlyWage ?? 18000,
      availability: profileData.availability || 'available_today',
      maxTravelDistance: profileData.maxTravelDistance || 'same_upazila',
      location: profileData.location || {
        divisionId: currentUser.divisionId,
        districtId: currentUser.districtId,
        upazilaId: currentUser.upazilaId,
        unionId: currentUser.unionId,
        wardId: currentUser.wardId,
      },
      locationCustom: profileData.locationCustom || '',
      bio: profileData.bio || '',
      workHistory: profileData.workHistory || '',
      isVerified: existing ? existing.isVerified : false,
      status: profileData.status || 'active',
      completedJobsCount: existing ? existing.completedJobsCount : 0,
      rating: existing ? existing.rating : 5.0,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLabourProfiles(prev => {
      const idx = prev.findIndex(p => p.userId === currentUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newProfile;
        return copy;
      }
      return [newProfile, ...prev];
    });

    if (isSupabaseConfigured && supabase) {
      upsertLabourProfileInDb({
        ...newProfile,
        userId: currentUser.id,
      }).catch(err => {
        console.warn('upsertLabourProfileInDb error:', err);
      });
    }

    return newProfile;
  };

  const createLabourJobPost = async (
    jobData: Partial<LabourJobPost> & { title: string; description: string; wageAmount: number }
  ): Promise<LabourJobPost | null> => {
    if (!currentUser) return null;

    const newJob: LabourJobPost = {
      id: `ljp-${Date.now()}`,
      employerId: currentUser.id,
      title: jobData.title,
      categoryId: jobData.categoryId,
      skillId: jobData.skillId,
      specificSkill: jobData.specificSkill,
      workersNeeded: jobData.workersNeeded || 1,
      description: jobData.description,
      wageAmount: jobData.wageAmount,
      wageType: jobData.wageType || 'daily',
      duration: jobData.duration || '১ দিন',
      workDate: jobData.workDate || 'জরুরি',
      requiredAvailability: jobData.requiredAvailability || 'immediate',
      location: jobData.location || {
        divisionId: currentUser.divisionId,
        districtId: currentUser.districtId,
        upazilaId: currentUser.upazilaId,
        unionId: currentUser.unionId,
        wardId: currentUser.wardId,
      },
      addressDetails: jobData.addressDetails || '',
      contactMethod: jobData.contactMethod || 'in_app',
      expiresAt: jobData.expiresAt || new Date(Date.now() + 14 * 86400000).toISOString(),
      status: 'open',
      createdAt: new Date().toISOString(),
      applicationsCount: 0,
    };

    setLabourJobPosts(prev => [newJob, ...prev]);

    if (isSupabaseConfigured && supabase) {
      createLabourJobPostInDb({
        ...newJob,
        employerId: currentUser.id,
      }).catch(err => {
        console.warn('createLabourJobPostInDb error:', err);
      });
    }

    return newJob;
  };

  const sendLabourContactRequest = async (
    targetType: 'worker' | 'job',
    targetId: string,
    receiverId: string,
    requestType: 'contact_request' | 'call_request' | 'hire_request' = 'contact_request',
    message?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const newReq: LabourContactRequest = {
      id: `lcr-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      targetType,
      targetId,
      requestType,
      message,
      status: 'pending',
      phoneShared: false,
      createdAt: new Date().toISOString(),
    };

    setLabourContactRequests(prev => [newReq, ...prev]);

    // Send in-app notification to receiver
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      userId: receiverId,
      actorId: currentUser.id,
      type: 'system',
      title: 'কাজ চাই / শ্রমিক চাই: নতুন যোগাযোগ অনুরোধ',
      content: `${currentUser.name} আপনার সাথে শ্রম বাজারে যোগাযোগ করতে চান।`,
      read: false,
      createdAt: 'এইমাত্র',
    };
    setNotifications(prev => [notif, ...prev]);

    if (isSupabaseConfigured && supabase) {
      createLabourContactRequestInDb({
        senderId: currentUser.id,
        receiverId,
        targetType,
        targetId,
        requestType,
        message,
      }).catch(err => {
        console.warn('createLabourContactRequestInDb error:', err);
      });
    }

    return true;
  };

  const reportLabourItem = async (
    targetType: 'worker_profile' | 'job_post' | 'contact_request',
    targetId: string,
    reason: string,
    details?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    createReport(
      'marketplace',
      targetId,
      `[Labour Report - ${targetType}] ${reason}`,
      details || ''
    );

    if (isSupabaseConfigured && supabase) {
      submitLabourReportInDb({
        reporterId: currentUser.id,
        targetType,
        targetId,
        reason,
        details,
      }).catch(err => {
        console.warn('submitLabourReportInDb error:', err);
      });
    }

    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        lastAuthError,
        clearAuthError,
        setCurrentUser,
        switchUser,
        login,
        register,
        logout,
        updateProfile,
        updateUserProfile,
        toggleUserBan,
        toggleUserVerify,
        changeUserRole,
        addLocationNode,

        activeView,
        setActiveView,
        selectedEntityId,
        setSelectedEntityId,
        openUserProfile,

        // Labour Marketplace (“কাজ চাই / শ্রমিক চাই”)
        labourCategories,
        labourSkills,
        labourProfiles,
        labourJobPosts,
        labourContactRequests,
        currentUserLabourProfile,
        labourActiveTab,
        setLabourActiveTab,
        openLabourMarketplace,
        upsertLabourProfile,
        createLabourJobPost,
        sendLabourContactRequest,
        reportLabourItem,
        refreshLabourData,

        divisions,
        districts,
        upazilas,
        unions,
        wards,
        locationFilter,
        setLocationFilter,
        resetLocationFilter,
        getLocationString,

        addDivision,
        updateDivision,
        deleteDivision,
        toggleDivision,
        addDistrict,
        updateDistrict,
        deleteDistrict,
        toggleDistrict,
        addUpazila,
        updateUpazila,
        deleteUpazila,
        toggleUpazila,
        addUnion,
        updateUnion,
        deleteUnion,
        toggleUnion,
        addWard,
        updateWard,
        deleteWard,
        toggleWard,
        resetLocationsToDefault,

        posts,
        createPost,
        deletePost,
        reactToPost,
        votePoll,
        savedPostIds,
        toggleSavePost,

        comments,
        addComment,
        deleteComment,
        reactToComment,

        friendships,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        followingIds,
        toggleFollowUser,

        messages,
        activeChatUserId,
        setActiveChatUserId,
        sendMessage,
        deleteMessage,

        groups,
        createGroup,
        toggleJoinGroup,

        pages,
        createPage,
        toggleFollowPage,

        jobs,
        createJob,
        appliedJobIds,
        applyToJob,
        applyJob,
        savedJobIds,
        toggleSaveJob,

        marketplaceListings,
        createMarketplaceListing,
        toggleListingStatus,
        savedListingIds,
        toggleSaveListing,

        matrimonyProfiles,
        createOrUpdateMatrimonyProfile,
        createMatrimonyProfile,
        connectedMatrimonyIds,
        connectMatrimony,
        expressMatrimonyInterest,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,

        reports,
        createReport,
        submitReport,
        resolveReport,
        dismissReport,

        privacySettings,
        updatePrivacySettings,

        authModalOpen,
        setAuthModalOpen,
        reportModalData,
        setReportModalData,
        createPostModalOpen,
        setCreatePostModalOpen,
        ecosystemModalOpen,
        setEcosystemModalOpen,
        searchQuery,
        setSearchQuery,

        stories,
        addStory,
        deleteStory,
        fetchStories,
        createStoryModalOpen,
        setCreateStoryModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
