import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Send,
  User,
  CheckCheck,
  MapPin,
  ArrowLeft,
  Sparkles,
  Phone,
  Video
} from 'lucide-react';

export const ChatMessenger: React.FC = () => {
  const {
    currentUser,
    users,
    messages,
    sendMessage,
    activeChatUserId,
    setActiveChatUserId,
    openUserProfile
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatUserId]);

  const activePartner = users.find(u => u.id === activeChatUserId);

  // Filter messages between current user and active partner
  const currentConversationMessages = messages.filter(
    m =>
      currentUser &&
      activeChatUserId &&
      ((m.senderId === currentUser.id && m.receiverId === activeChatUserId) ||
        (m.senderId === activeChatUserId && m.receiverId === currentUser.id))
  );

  // All users with whom current user has chatted or can chat
  const otherUsers = users.filter(
    u =>
      currentUser &&
      u.id !== currentUser.id &&
      (searchFilter ? u.name.toLowerCase().includes(searchFilter.toLowerCase()) : true)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatUserId) return;
    sendMessage(activeChatUserId, inputText.trim());
    setInputText('');
  };

  const quickReplies = [
    'আসসালামু আলাইকুম!',
    'কেমন আছেন ভাই?',
    'আপনার এলাকার খবর কী?',
    'সব ঠিকঠাক আছে আলহামদুলিল্লাহ।'
  ];

  return (
    <div className="flex-1 max-w-5xl mx-auto h-[calc(100vh-6rem)] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col md:flex-row mb-6">
      {/* Conversation Sidebar (Left) */}
      <div
        className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          activeChatUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-3.5 border-b border-slate-200 bg-white">
          <h3 className="text-base font-bold text-slate-900">মেসেঞ্জার ও চ্যাট</h3>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="মানুষ খুঁজুন..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {otherUsers.map(user => {
            const isSelected = activeChatUserId === user.id;
            const lastMsg = messages
              .filter(
                m =>
                  currentUser &&
                  ((m.senderId === currentUser.id && m.receiverId === user.id) ||
                    (m.senderId === user.id && m.receiverId === currentUser.id))
              )
              .slice(-1)[0];

            return (
              <div
                key={user.id}
                onClick={() => setActiveChatUserId(user.id)}
                className={`flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-emerald-50/70 ${
                  isSelected ? 'bg-emerald-100/60 font-semibold' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{user.name}</h5>
                    {lastMsg && <span className="text-[10px] text-slate-400">{lastMsg.createdAt}</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {lastMsg ? lastMsg.content : user.hometown}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Conversation Area (Right) */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          !activeChatUserId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-3.5 bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveChatUserId(null)}
                  className="md:hidden rounded-full p-1 text-slate-500 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <img
                  src={activePartner.avatar}
                  alt={activePartner.name}
                  onClick={() => openUserProfile(activePartner.id)}
                  className="h-10 w-10 rounded-full object-cover cursor-pointer ring-2 ring-emerald-500/20"
                />
                <div>
                  <h4
                    onClick={() => openUserProfile(activePartner.id)}
                    className="text-sm font-bold text-slate-900 hover:underline cursor-pointer"
                  >
                    {activePartner.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                    <MapPin className="h-3 w-3" />
                    <span>{activePartner.hometown}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openUserProfile(activePartner.id)}
                  className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  প্রোফাইল দেখুন
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {currentConversationMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <Send className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">কথোপকথন শুরু করুন</p>
                  <p className="text-xs max-w-xs mt-1">
                    {activePartner.name}-এর সাথে বার্তা আদান-প্রদান করতে নিচে মেসেজ লিখুন।
                  </p>
                </div>
              ) : (
                currentConversationMessages.map(msg => {
                  const isMine = currentUser && msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                        <span>{msg.createdAt}</span>
                        {isMine && <CheckCheck className="h-3 w-3 text-emerald-600" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-slate-100 overflow-x-auto bg-slate-50/50">
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">দ্রুত বার্তা:</span>
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    sendMessage(activePartner.id, q);
                  }}
                  className="shrink-0 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-emerald-400 hover:text-emerald-700"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="মেসেজ লিখুন..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 shadow-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Send className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">কোনো চ্যাট নির্বাচন করা হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              বাম পাশের তালিকা থেকে যেকোনো ব্যবহারকারীর আইডিতে ক্লিক করে কথোপকথন শুরু করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
