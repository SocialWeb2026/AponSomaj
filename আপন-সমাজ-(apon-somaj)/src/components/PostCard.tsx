import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Post, ReactionType, Comment } from '../types';
import { PostMediaRenderer } from './media/PostMediaRenderer';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Trash2,
  Flag,
  Send,
  CornerDownRight,
  ThumbsUp,
  Smile,
  CheckCircle2,
  Lock,
  Globe2,
  Users
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'লাইক', color: 'text-blue-600' },
  love: { emoji: '❤️', label: 'লাভ', color: 'text-rose-600' },
  care: { emoji: '🥰', label: 'কেয়ার', color: 'text-amber-500' },
  haha: { emoji: '😂', label: 'হাহা', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'ওয়াও', color: 'text-amber-600' },
  sad: { emoji: '😢', label: 'স্যাড', color: 'text-blue-500' },
  angry: { emoji: '😡', label: 'অ্যাংরি', color: 'text-orange-600' },
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    users,
    reactToPost,
    deletePost,
    votePoll,
    savedPostIds,
    toggleSavePost,
    comments,
    addComment,
    deleteComment,
    reactToComment,
    openUserProfile,
    setLocationFilter,
    setActiveView,
    setReportModalData
  } = useApp();

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const author = users.find(u => u.id === post.authorId);
  const isSaved = savedPostIds.includes(post.id);
  const isAuthor = currentUser?.id === post.authorId;
  const isAdmin = currentUser?.role === 'admin';

  // Find user's active reaction
  let userReaction: ReactionType | null = null;
  if (currentUser) {
    for (const [type, userIds] of Object.entries(post.reactions)) {
      if (userIds?.includes(currentUser.id)) {
        userReaction = type as ReactionType;
        break;
      }
    }
  }

  // Calculate total reactions
  const totalReactions = Object.values(post.reactions).reduce(
    (acc, ids) => acc + (ids?.length || 0),
    0
  );

  // Comments for this post
  const postComments = comments.filter(c => c.postId === post.id && !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter(c => c.parentId === commentId);

  const handleReaction = (type: ReactionType) => {
    reactToPost(post.id, type);
    setShowReactionPicker(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
    setShowComments(true);
  };

  const handleAddReply = (parentId: string) => {
    if (!replyInput.trim()) return;
    addComment(post.id, replyInput.trim(), parentId);
    setReplyInput('');
    setReplyingToCommentId(null);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${post.postType === 'reel' ? '/reel/' : '/post/'}${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleLocationClick = () => {
    if (post.location) {
      setLocationFilter({
        divisionId: post.location.divisionId,
        districtId: post.location.districtId,
        upazilaId: post.location.upazilaId,
        unionId: post.location.unionId,
        wardId: post.location.wardId,
      });
      setActiveView('feed');
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-shadow hover:shadow-md">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <img
            src={author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt=""
            onClick={() => author && openUserProfile(author.id)}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover cursor-pointer ring-2 ring-emerald-500/10 hover:ring-emerald-500 transition-all"
          />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                onClick={() => author && openUserProfile(author.id)}
                className="font-bold text-slate-900 hover:text-emerald-700 hover:underline cursor-pointer text-sm"
              >
                {author?.name || 'ব্যবহারকারী'}
              </span>
              {author?.isVerified && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
              )}
              {post.feeling && (
                <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  {post.feeling}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              {post.visibility === 'public' && <Globe2 className="h-3 w-3" />}
              {post.visibility === 'friends' && <Users className="h-3 w-3" />}
              {post.visibility === 'only_me' && <Lock className="h-3 w-3" />}

              {/* Hierarchical Location Badge */}
              {post.location && (
                <>
                  <span>•</span>
                  <button
                    onClick={handleLocationClick}
                    className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-200/60"
                    title="এই এলাকার সকল পোস্ট দেখতে ক্লিক করুন"
                  >
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>
                      {[
                        post.location.wardName,
                        post.location.unionName,
                        post.location.upazilaName,
                        post.location.districtName
                      ]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ') || post.location.divisionName}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Post Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-30 text-xs">
              <button
                onClick={() => {
                  toggleSavePost(post.id);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50"
              >
                <Bookmark className="h-4 w-4" />
                <span>{isSaved ? 'সংরক্ষণ বাতিল করুন' : 'পোস্ট সংরক্ষণ করুন'}</span>
              </button>

              {(isAuthor || isAdmin) && (
                <button
                  onClick={() => {
                    if (confirm('আপনি কি এই পোস্টটি মুছে ফেলতে চান?')) {
                      deletePost(post.id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>পোস্ট মুছে ফেলুন</span>
                </button>
              )}

              <button
                onClick={() => {
                  setReportModalData({ targetType: 'post', targetId: post.id });
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-600 hover:bg-slate-50"
              >
                <Flag className="h-4 w-4" />
                <span>রিপোর্ট করুন (Safety)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="mt-3 text-sm leading-relaxed text-slate-800 whitespace-pre-line">
        {post.content}
      </div>

      {/* Rich Media Renderer (Single Photo, Multi-photo Carousel, Custom Video/Reel Player) */}
      <PostMediaRenderer post={post} />

      {/* Poll Section */}
      {post.poll && (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 space-y-2">
          <div className="text-xs font-bold text-emerald-950">📊 {post.poll.question}</div>
          <div className="space-y-1.5">
            {post.poll.options.map(option => {
              const hasVoted = currentUser && option.votes.includes(currentUser.id);
              const percentage =
                post.poll!.totalVotes > 0
                  ? Math.round((option.votes.length / post.poll!.totalVotes) * 100)
                  : 0;

              return (
                <button
                  key={option.id}
                  onClick={() => votePoll(post.id, option.id)}
                  className={`relative flex w-full items-center justify-between overflow-hidden rounded-lg border p-2 text-xs transition-all ${
                    hasVoted
                      ? 'border-emerald-500 bg-emerald-100/70 font-bold text-emerald-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-200/50 -z-0 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  <span className="relative z-10">{option.text}</span>
                  <span className="relative z-10 font-bold text-slate-600">
                    {percentage}% ({option.votes.length})
                  </span>
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 text-right">
            সর্বমোট {post.poll.totalVotes} ভোট সংগৃহীত হয়েছে
          </div>
        </div>
      )}

      {/* Reaction and Comment Counter stats */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {totalReactions > 0 && (
            <div className="flex -space-x-1">
              {Object.entries(post.reactions).map(([type, ids]) => {
                if (ids.length === 0) return null;
                return (
                  <span
                    key={type}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-xs ring-1 ring-slate-100"
                  >
                    {REACTION_EMOJIS[type as ReactionType].emoji}
                  </span>
                );
              })}
            </div>
          )}
          <span>{totalReactions > 0 ? `${totalReactions} প্রতিক্রিয়া` : 'প্রথম প্রতিক্রিয়া দিন'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {post.commentCount} মন্তব্য
          </button>
          <span>•</span>
          <span>{post.shareCount} শেয়ার</span>
        </div>
      </div>

      {/* Action Buttons: Like, Comment, Share, Save */}
      <div className="relative mt-2 flex items-center justify-between border-t border-slate-100 pt-1 text-xs font-semibold">
        {/* Reaction Popover */}
        {showReactionPicker && (
          <div
            onMouseLeave={() => setShowReactionPicker(false)}
            className="absolute -top-12 left-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-100"
          >
            {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => handleReaction(type)}
                className="transform transition-transform hover:scale-130 active:scale-95 text-lg p-1"
                title={REACTION_EMOJIS[type].label}
              >
                {REACTION_EMOJIS[type].emoji}
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <button
          type="button"
          onMouseEnter={() => setShowReactionPicker(true)}
          onClick={() => handleReaction(userReaction ? userReaction : 'like')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 transition-colors ${
            userReaction
              ? `${REACTION_EMOJIS[userReaction].color} bg-slate-50 font-bold`
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {userReaction ? (
            <span className="text-base leading-none">{REACTION_EMOJIS[userReaction].emoji}</span>
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}
          <span>{userReaction ? REACTION_EMOJIS[userReaction].label : 'লাইক'}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>মন্তব্য</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-slate-600 hover:bg-slate-50 transition-colors relative"
        >
          <Share2 className="h-4 w-4" />
          <span>{shareSuccess ? 'লিংক কপি হয়েছে!' : 'শেয়ার'}</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`rounded-lg p-2 transition-colors ${
            isSaved ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'
          }`}
          title="Save Post"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          {/* Add Comment Input or Disabled Notice */}
          {post.commentsEnabled === false ? (
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2.5 text-xs text-slate-600">
              <Lock className="h-4 w-4 text-slate-400 shrink-0" />
              <span>এই পোস্টে স্রষ্টা কর্তৃক মন্তব্য করার সুবিধা বন্ধ রাখা হয়েছে।</span>
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <img
                src={currentUser?.avatar}
                alt=""
                className="h-8 w-8 rounded-full object-cover shrink-0"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="একটি গঠনমূলক মন্তব্য লিখুন..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="absolute right-1.5 top-1 rounded-full p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="mt-3 space-y-3">
            {postComments.map(comment => {
              const commentAuthor = users.find(u => u.id === comment.authorId);
              const replies = getReplies(comment.id);
              const hasLiked = currentUser && comment.reactions?.like?.includes(currentUser.id);

              return (
                <div key={comment.id} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <img
                      src={commentAuthor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt=""
                      onClick={() => commentAuthor && openUserProfile(commentAuthor.id)}
                      className="h-7 w-7 rounded-full object-cover shrink-0 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="inline-block rounded-2xl bg-slate-100 px-3 py-2 text-xs">
                        <div
                          onClick={() => commentAuthor && openUserProfile(commentAuthor.id)}
                          className="font-bold text-slate-900 hover:underline cursor-pointer"
                        >
                          {commentAuthor?.name}
                        </div>
                        <p className="mt-0.5 text-slate-800">{comment.content}</p>
                      </div>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 px-2 mt-1">
                        <span>{comment.createdAt}</span>
                        <button
                          onClick={() => reactToComment(comment.id)}
                          className={`font-semibold hover:underline ${
                            hasLiked ? 'text-emerald-600' : 'text-slate-600'
                          }`}
                        >
                          লাইক {comment.reactions?.like?.length > 0 && `(${comment.reactions.like.length})`}
                        </button>
                        <button
                          onClick={() =>
                            setReplyingToCommentId(
                              replyingToCommentId === comment.id ? null : comment.id
                            )
                          }
                          className="font-semibold text-slate-600 hover:underline"
                        >
                          উত্তর দিন
                        </button>
                        {(currentUser?.id === comment.authorId || isAdmin) && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-rose-500 hover:underline"
                          >
                            মুছুন
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {replies.length > 0 && (
                    <div className="ml-9 space-y-2 border-l-2 border-slate-100 pl-3">
                      {replies.map(reply => {
                        const replyAuthor = users.find(u => u.id === reply.authorId);
                        return (
                          <div key={reply.id} className="flex items-start gap-2">
                            <img
                              src={replyAuthor?.avatar}
                              alt=""
                              onClick={() => replyAuthor && openUserProfile(replyAuthor.id)}
                              className="h-6 w-6 rounded-full object-cover shrink-0 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="inline-block rounded-2xl bg-slate-50 px-2.5 py-1.5 text-xs">
                                <span
                                  onClick={() => replyAuthor && openUserProfile(replyAuthor.id)}
                                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                                >
                                  {replyAuthor?.name}
                                </span>
                                <p className="mt-0.5 text-slate-800">{reply.content}</p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 px-2 mt-0.5">
                                <span>{reply.createdAt}</span>
                                {(currentUser?.id === reply.authorId || isAdmin) && (
                                  <button
                                    onClick={() => deleteComment(reply.id)}
                                    className="text-rose-500 hover:underline"
                                  >
                                    মুছুন
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {replyingToCommentId === comment.id && (
                    <div className="ml-9 flex items-center gap-2 pt-1">
                      <CornerDownRight className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder={`উত্তর লিখুন...`}
                        value={replyInput}
                        onChange={e => setReplyInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddReply(comment.id);
                        }}
                        className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyInput.trim()}
                        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        পাঠান
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
