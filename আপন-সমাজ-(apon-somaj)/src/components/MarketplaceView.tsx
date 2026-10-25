import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Plus,
  MapPin,
  Search,
  MessageCircle,
  ExternalLink,
  Shield,
  Layers,
  Check,
  X,
  Phone
} from 'lucide-react';
import { MarketplaceListing } from '../types';

export const MarketplaceView: React.FC = () => {
  const {
    currentUser,
    marketplaceListings,
    createMarketplaceListing,
    setActiveChatUserId,
    setActiveView,
    setEcosystemModalOpen,
    divisions,
    districts,
    upazilas
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [contactModalListing, setContactModalListing] = useState<MarketplaceListing | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number>(1000);
  const [category, setCategory] = useState('কৃষি ও গবাদিপশু');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [imageUrl, setImageUrl] = useState('');
  const [divId, setDivId] = useState('');
  const [distId, setDistId] = useState('');
  const [upId, setUpId] = useState('');

  const categories = [
    'all',
    'কৃষি ও গবাদিপশু',
    'ইলেকট্রনিক্স ও মোবাইল',
    'যানবাহন ও মোটরসাইকেল',
    'বাড়ি ও জমিজমা',
    'আসবাবপত্র ও গৃহস্থালি'
  ];

  const filteredListings = marketplaceListings.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const div = divisions.find(d => d.id === divId);
    const dist = districts.find(d => d.id === distId);
    const up = upazilas.find(u => u.id === upId);

    createMarketplaceListing({
      title: title.trim(),
      price: Number(price) || 0,
      category,
      condition,
      description: description.trim(),
      phone: phone.trim() || undefined,
      images: imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'],
      location: {
        divisionId: div?.id || 'div-7',
        divisionName: div?.bnName || 'রংপুর',
        districtId: dist?.id || 'dis-47',
        districtName: dist?.bnName || 'ঠাকুরগাঁও',
        upazilaId: up?.id,
        upazilaName: up?.bnName
      }
    });

    setTitle('');
    setDescription('');
    setCreateModalOpen(false);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto space-y-5 pb-16">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 p-5 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-300" />
            <h2 className="text-xl font-bold">আপন কমিউনিটি মার্কেটপ্লেস (Buy & Sell)</h2>
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            এলাকাভিত্তিক ব্যক্তি-থেকে-ব্যক্তি (Peer-to-Peer) কেনাবেচা। বিশ্বস্ত প্রতিবেশী ও স্থানীয় বিক্রেতাদের সাথে সরাসরি লেনদেন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="list-product-btn"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>পণ্য বিক্রির বিজ্ঞাপন দিন</span>
          </button>

          <button
            onClick={() => setEcosystemModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-950/60 border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900"
            title="Apon Bazar E-commerce"
          >
            <Layers className="h-4 w-4" />
            <span>আপন বাজার</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="পণ্য, মূল্য বা এলাকা দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1 font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'সকল পণ্য' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map(item => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <span className="absolute top-2 left-2 rounded-md bg-emerald-600/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  ৳ {item.price.toLocaleString()}
                </span>
                <span className="absolute top-2 right-2 rounded-md bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-xs">
                  {item.condition === 'new' || item.condition === 'Brand New' ? 'নতুন' : 'ব্যবহৃত'}
                </span>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                  <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {[item.location?.upazilaName, item.location?.districtName, item.location?.divisionName]
                      .filter(Boolean)
                      .join(', ') || 'বাংলাদেশ'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{item.createdAt}</span>
              <button
                id={`contact-seller-btn-${item.id}`}
                onClick={() => setContactModalListing(item)}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>যোগাযোগ করুন</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Seller Modal */}
      {contactModalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">বিক্রেতার সাথে যোগাযোগ</h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">{contactModalListing.title}</p>
              </div>
              <button onClick={() => setContactModalListing(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">পণ্যের নির্ধারিত মূল্য:</span>
                <span className="text-base font-black text-emerald-700">৳ {contactModalListing.price.toLocaleString()}</span>
              </div>
              {contactModalListing.phone && (
                <div className="flex items-center gap-2 text-emerald-900 font-bold bg-white p-2 rounded-lg border border-emerald-200">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>সরাসরি কল করুন: {contactModalListing.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setActiveChatUserId(contactModalListing.sellerId);
                  setActiveView('chat');
                  setContactModalListing(null);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>মেসেঞ্জারে চ্যাট শুরু করুন</span>
              </button>
              <button
                onClick={() => setContactModalListing(null)}
                className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">নতুন পণ্য বিক্রির বিজ্ঞাপন দিন</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পণ্যের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ১ মণ দেশি আমন ধান / দেশি গরু"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মূল্য (টাকায়) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">অবস্থা (Condition)</label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                  >
                    <option value="new">একদম নতুন (Brand New)</option>
                    <option value="used">ব্যবহৃত (Used)</option>
                    <option value="refurbished">সারানো (Refurbished)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                >
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ছবির URL (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  placeholder="পণ্য সম্পর্কে বিস্তারিত তথ্য..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">যোগাযোগের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পণ্য বিক্রির এলাকা (Hierarchy)</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={divId}
                    onChange={e => setDivId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">বিভাগ</option>
                    {divisions.map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={distId}
                    onChange={e => setDistId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">জেলা</option>
                    {districts.filter(d => !divId || d.divisionId === divId).map(d => (
                      <option key={d.id} value={d.id}>{d.bnName}</option>
                    ))}
                  </select>
                  <select
                    value={upId}
                    onChange={e => setUpId(e.target.value)}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-800"
                  >
                    <option value="">উপজেলা</option>
                    {upazilas.filter(u => !distId || u.districtId === distId).map(u => (
                      <option key={u.id} value={u.id}>{u.bnName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  বিজ্ঞাপন প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
