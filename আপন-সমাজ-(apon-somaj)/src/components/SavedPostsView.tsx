import React from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { Bookmark, ArrowLeft } from 'lucide-react';

export const SavedPostsView: React.FC = () => {
  const { posts, savedPostIds, setActiveView } = useApp();

  const savedPosts = posts.filter(p => savedPostIds.includes(p.id));

  return (
    <div className="flex-1 max-w-2xl mx-auto space-y-4 pb-16">
      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">সংরক্ষিত পোস্ট (Saved Posts)</h2>
            <p className="text-xs text-slate-500">{savedPosts.length} টি পোস্ট সংরক্ষিত আছে</p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('feed')}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>ফিডে ফিরে যান</span>
        </button>
      </div>

      <div className="space-y-4">
        {savedPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
            আপনার কোনো সংরক্ষিত পোস্ট নেই। ফিডের যেকোনো পোস্টের থ্রি-ডট মেনু থেকে সংরক্ষণ করতে পারেন।
          </div>
        ) : (
          savedPosts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
};
