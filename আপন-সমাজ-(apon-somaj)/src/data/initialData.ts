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
  PrivacySettings
} from '../types';

export const demoUsers: User[] = [
  {
    id: 'user-1',
    name: 'Tanvir Hossain',
    bnName: 'তানভীর হোসেন',
    username: 'tanvir_bd',
    email: 'tanvir@aponsomaj.com',
    phone: '01711223344',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    bio: 'টেকপ্রেমী ও সামাজিক কর্মী | ঠাকুরগাঁওয়ের মাটির সুবাস ভালোবাসি 🌾',
    hometown: 'Thakurgaon Sadar',
    currentDistrict: 'Thakurgaon',
    divisionId: 'div-7',
    districtId: 'dis-thakurgaon',
    upazilaId: 'up-thakurgaon-sadar',
    unionId: 'un-thakurgaon-pourashava',
    wardId: 'w-tgp-5',
    role: 'admin',
    isVerified: true,
    joinedDate: 'জানুয়ারি ২০২৪',
    occupation: 'সফটওয়্যার ডেভেলপার ও সমাজকর্মী',
    education: 'কম্পিউটার সায়েন্স, রাজশাহী বিশ্ববিদ্যালয়',
    followersCount: 1420,
    followingCount: 380,
    friendsCount: 520,
  },
  {
    id: 'user-2',
    name: 'Nusrat Jahan',
    bnName: 'নুসরাত জাহান',
    username: 'nusrat_jahan',
    email: 'nusrat@gmail.com',
    phone: '01811223344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1000&auto=format&fit=crop&q=80',
    bio: 'গ্রাফিক ডিজাইনার ও কন্টেন্ট ক্রিয়েটর 🎨 ঢাকা ধানমন্ডি',
    hometown: 'Dhanmondi, Dhaka',
    currentDistrict: 'Dhaka',
    divisionId: 'div-1',
    districtId: 'dis-dhaka',
    upazilaId: 'up-dhanmondi',
    unionId: 'un-dhanmondi-r-a',
    wardId: 'w-dhn-15',
    role: 'user',
    isVerified: true,
    joinedDate: 'মার্চ ২০২৪',
    occupation: 'ইউআই/ইউএক্স ডিজাইনার',
    education: 'চারুকলা অনুষদ, ঢাকা বিশ্ববিদ্যালয়',
    followersCount: 2350,
    followingCount: 420,
    friendsCount: 680,
  },
  {
    id: 'user-3',
    name: 'Rafiqul Islam',
    bnName: 'রফিকুল ইসলাম',
    username: 'rafiq_ctg',
    email: 'rafiq@ctg.com',
    phone: '01911223344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80',
    bio: 'পাহাড় ও সমুদ্রের শহর চট্টগ্রামের উদ্যোক্তা 🚢 পরিবেশ সচেতন নাগরিক',
    hometown: 'Panchlaish, Chattogram',
    currentDistrict: 'Chattogram',
    divisionId: 'div-2',
    districtId: 'dis-chattogram',
    upazilaId: 'up-panchlaish',
    unionId: 'un-nasirabad',
    role: 'moderator',
    isVerified: true,
    joinedDate: 'ফেব্রুয়ারি ২০২৪',
    occupation: 'উদ্যোক্তা (অর্গানিক ফুড সাপ্লাই)',
    education: 'বিবিএ, চট্টগ্রাম বিশ্ববিদ্যালয়',
    followersCount: 890,
    followingCount: 310,
    friendsCount: 430,
  },
  {
    id: 'user-4',
    name: 'Mahbub Alam',
    bnName: 'মাহবুব আলম',
    username: 'mahbub_singia',
    email: 'mahbub@singia.com',
    phone: '01611223344',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
    bio: 'কৃষি উদ্যোক্তা ও সমাজসেবক | সিঙ্গিয়া ইউনিয়ন, ঠাকুরগাঁও সদর 🌱',
    hometown: 'Singia, Thakurgaon',
    currentDistrict: 'Thakurgaon',
    divisionId: 'div-7',
    districtId: 'dis-thakurgaon',
    upazilaId: 'up-thakurgaon-sadar',
    unionId: 'un-singia',
    wardId: 'w-sng-5',
    role: 'user',
    isVerified: false,
    joinedDate: 'এপ্রিল ২০২৪',
    occupation: 'কৃষি গবেষক ও কৃষক সমবায় পরিচালক',
    education: 'বিএসসি ইন এগ্রিকালচার',
    followersCount: 410,
    followingCount: 150,
    friendsCount: 290,
  },
  {
    id: 'user-5',
    name: 'Farhana Akter',
    bnName: 'ফারহানা আক্তার',
    username: 'farhana_sylhet',
    email: 'farhana@sylhet.com',
    phone: '01511223344',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
    bio: 'চা বাগানের স্নিগ্ধতা আর বইয়ের পাতা নিয়ে বসবাস ☕ শিক্ষিকা ও সাহিত্যপ্রেমী',
    hometown: 'Sylhet Sadar',
    currentDistrict: 'Sylhet',
    divisionId: 'div-6',
    districtId: 'dis-sylhet',
    upazilaId: 'up-sylhet-sadar',
    role: 'user',
    isVerified: true,
    joinedDate: 'মে ২০২৪',
    occupation: 'সহকারী প্রধান শিক্ষিকা',
    education: 'এমএ (বাংলা), শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়',
    followersCount: 940,
    followingCount: 220,
    friendsCount: 310,
  }
];

export const initialPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    content: 'শুভ সকাল আপন সমাজের বন্ধুরা! 🌸 ঠাকুরগাঁও শহরের স্টেশন রোড ও কলেজ পাড়ায় আজ সকাল থেকেই চমৎকার আবহাওয়া। আমাদের নিজস্ব মাটির মানুষগুলোকে একই ডিজিটাল প্ল্যাটফর্মে সংযুক্ত দেখে খুব গর্ব হচ্ছে। কেমন কাটছে আপনাদের এলাকা?',
    mediaUrls: [
      'https://images.unsplash.com/photo-1609137144822-094ec60183b1?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur',
      districtId: 'dis-thakurgaon',
      districtName: 'Thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar',
      unionId: 'un-thakurgaon-pourashava',
      unionName: 'Thakurgaon Paurashava',
      wardId: 'w-tgp-5',
      wardName: 'Ward 5 (Station Road)'
    },
    feeling: 'অনুভূতি: আনন্দিত ও গর্বিত 🌟',
    reactions: {
      like: ['user-2', 'user-3', 'user-4'],
      love: ['user-2', 'user-5'],
      care: ['user-4'],
      haha: [],
      wow: ['user-3'],
      sad: [],
      angry: []
    },
    commentCount: 4,
    shareCount: 6,
    visibility: 'public',
    createdAt: '১০ মিনিট আগে'
  },
  {
    id: 'post-2',
    authorId: 'user-4',
    content: 'ঠাকুরগাঁও সদর উপজেলার সিঙ্গিয়া ইউনিয়নের ৫ নং ওয়ার্ডে আমাদের স্থানীয় কৃষকদের সমন্বয়ে আমন ধানের উচ্চফলনশীল নতুন জাত প্রদর্শনী ও মাঠ দিবস অনুষ্ঠিত হলো। স্থানীয় কৃষি কর্মকর্তা উপস্থিত ছিলেন। আসুন আমরা এলাকার উৎপাদিত পুষ্টিকর খাদ্য খাই।',
    mediaUrls: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur',
      districtId: 'dis-thakurgaon',
      districtName: 'Thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar',
      unionId: 'un-singia',
      unionName: 'Singia Union',
      wardId: 'w-sng-5',
      wardName: 'Ward 5 (Singia Bazar)'
    },
    poll: {
      question: 'আপনার এলাকায় এবার আমন ফসলের অবস্থা কেমন?',
      options: [
        { id: 'opt-1', text: 'খুবই ভালো (বাম্পার ফলন)', votes: ['user-1', 'user-4'] },
        { id: 'opt-2', text: 'মোটামুটি ভালো', votes: ['user-3'] },
        { id: 'opt-3', text: 'বৃষ্টির অভাবে সমস্যা হচ্ছে', votes: ['user-5'] }
      ],
      totalVotes: 4
    },
    reactions: {
      like: ['user-1', 'user-3'],
      love: ['user-1'],
      care: ['user-2', 'user-5'],
      haha: [],
      wow: ['user-2'],
      sad: [],
      angry: []
    },
    commentCount: 2,
    shareCount: 8,
    visibility: 'public',
    createdAt: '৪৫ মিনিট আগে'
  },
  {
    id: 'post-3',
    authorId: 'user-2',
    content: 'আজকে ধানমন্ডি লেকের পাড়ে বসে আপন সমাজের জন্য নতুন ইউজার এক্সপেরিয়েন্স ডিজাইন রিভিউ করছিলাম। আমাদের লোকাল মার্কেটপ্লেস আর জব ডিরেক্টরি এখন আরও সহজে যে কোনো উপজেলা ও ইউনিয়নের ভিত্তিতে ফিল্টার করা যাচ্ছে! সবাই একবার চেক করে মতামত দিন তো! 💡',
    mediaUrls: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    location: {
      divisionId: 'div-1',
      divisionName: 'Dhaka',
      districtId: 'dis-dhaka',
      districtName: 'Dhaka',
      upazilaId: 'up-dhanmondi',
      upazilaName: 'Dhanmondi Thana',
      unionId: 'un-dhanmondi-r-a',
      unionName: 'Dhanmondi Residential Area',
      wardId: 'w-dhn-15',
      wardName: 'Ward 15 (Road 2-8A)'
    },
    reactions: {
      like: ['user-1', 'user-4', 'user-5'],
      love: ['user-1', 'user-3'],
      care: [],
      haha: [],
      wow: ['user-4'],
      sad: [],
      angry: []
    },
    commentCount: 5,
    shareCount: 12,
    visibility: 'public',
    createdAt: '২ ঘণ্টা আগে'
  },
  {
    id: 'post-4',
    authorId: 'user-3',
    content: 'চট্টগ্রাম বন্দর ও কর্ণফুলী নদীর মোহনায় চমৎকার একটি বিকেল। আপন সমাজের চট্টগ্রাম কমিউনিটি আগামী শুক্রবার পতেঙ্গায় বৃক্ষরোপণ কর্মসূচি আয়োজন করছে। এলাকার সকলকে অংশগ্রহণের আমন্ত্রণ জানাচ্ছি। 🌳🌊',
    mediaUrls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    location: {
      divisionId: 'div-2',
      divisionName: 'Chattogram',
      districtId: 'dis-chattogram',
      districtName: 'Chattogram',
      upazilaId: 'up-panchlaish',
      upazilaName: 'Panchlaish Thana'
    },
    reactions: {
      like: ['user-1', 'user-2'],
      love: ['user-2', 'user-5'],
      care: ['user-1'],
      haha: [],
      wow: [],
      sad: [],
      angry: []
    },
    commentCount: 3,
    shareCount: 9,
    visibility: 'public',
    createdAt: '৫ ঘণ্টা আগে'
  },
  {
    id: 'post-5',
    authorId: 'user-5',
    content: 'সিলেট শহরের মালনীছড়া চা বাগানের সবুজ সতেজতা মন জুড়িয়ে দেয়। যারা এখনো আসেননি, ঘুরে যাওয়ার নিমন্ত্রণ রইল। আমাদের আপন সমাজে সিলেটের পর্যটন বিষয়ক একটি আলাদা আলোচনা শুরু করার প্রস্তাব করছি। 🍃',
    mediaUrls: [
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'image',
    location: {
      divisionId: 'div-6',
      divisionName: 'Sylhet',
      districtId: 'dis-sylhet',
      districtName: 'Sylhet',
      upazilaId: 'up-sylhet-sadar',
      upazilaName: 'Sylhet Sadar'
    },
    reactions: {
      like: ['user-1', 'user-2', 'user-3'],
      love: ['user-1', 'user-4'],
      care: [],
      haha: [],
      wow: ['user-2'],
      sad: [],
      angry: []
    },
    commentCount: 2,
    shareCount: 4,
    visibility: 'public',
    createdAt: '১ দিন আগে'
  },
  {
    id: 'post-video-1',
    authorId: 'user-1',
    content: 'নদীর বুকে নৌকা ভ্রমণ ও দোতারা গানের সুর। আপন সমাজে আমাদের মাটির ঐতিহ্য ও আবহমান বাংলার মুহূর্ত তুলে ধরছি। #AponSomaj #Reels 🛶🎶',
    postType: 'reel',
    mediaType: 'video',
    mediaUrls: [
      'https://vjs.zencdn.net/v/oceans.mp4'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    duration: 15,
    reelDuration: 15,
    musicTitle: 'মন মাঝি রে (Acoustic Dotara)',
    musicArtist: 'গ্রামবাংলা সুরকার দল',
    downloadEnabled: true,
    commentsEnabled: true,
    visibility: 'public',
    createdAt: '১৫ মিনিট আগে',
    reactions: {
      like: ['user-2', 'user-3'],
      love: ['user-4'],
      care: [],
      haha: [],
      wow: ['user-2'],
      sad: [],
      angry: []
    },
    commentCount: 2,
    shareCount: 5
  },
  {
    id: 'post-video-2',
    authorId: 'user-3',
    content: 'গ্রামবাংলায় আধুনিক কৃষি ও মাটির উর্বরতা রক্ষার সুন্দর তথ্যচিত্র। আমাদের তরুণ উদ্যোক্তা ও কৃষকদের অনুপ্রেরণা দিতে ভিডিওটি শেয়ার করলাম। 🌾📹',
    postType: 'standard',
    mediaType: 'video',
    mediaUrls: [
      'https://www.w3schools.com/html/mov_bbb.mp4'
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    duration: 60,
    downloadEnabled: true,
    commentsEnabled: true,
    visibility: 'public',
    createdAt: '২ ঘণ্টা আগে',
    reactions: {
      like: ['user-1', 'user-4'],
      love: ['user-2'],
      care: [],
      haha: [],
      wow: [],
      sad: [],
      angry: []
    },
    commentCount: 3,
    shareCount: 7
  }
];

export const initialComments: Comment[] = [
  {
    id: 'com-1',
    postId: 'post-1',
    authorId: 'user-2',
    content: 'মাশাআল্লাহ! ঠাকুরগাঁওয়ের সকাল সত্যিই দারুণ। খুব শীঘ্রই উত্তরবঙ্গে ঘুরতে যাওয়ার পরিকল্পনা আছে!',
    createdAt: '৮ মিনিট আগে',
    reactions: { like: ['user-1'] }
  },
  {
    id: 'com-2',
    postId: 'post-1',
    authorId: 'user-4',
    content: 'তানভীর ভাই, স্টেশন রোডের মোড়ে আসলে সিঙ্গিয়া ইউনিয়নের সুস্বাদু গরম জিলাপি নিয়ে যাব!',
    createdAt: '৫ মিনিট আগে',
    reactions: { like: ['user-1'], love: ['user-1'] }
  },
  {
    id: 'com-3',
    postId: 'post-1',
    authorId: 'user-1',
    content: 'অবশ্যই মাহবুব ভাই, আপনার সাথে দেখা করার অপেক্ষায় রইলাম!',
    parentId: 'com-2',
    createdAt: '৩ মিনিট আগে',
    reactions: { like: ['user-4'] }
  },
  {
    id: 'com-4',
    postId: 'post-2',
    authorId: 'user-1',
    content: 'অসাধারণ উদ্যোগ! ঠাকুরগাঁও সদর উপজেলার প্রতিটি ইউনিয়নে এই ধরনের প্রদর্শনী ছড়িয়ে দেওয়া প্রয়োজন।',
    createdAt: '৩০ মিনিট আগে',
    reactions: { like: ['user-4'] }
  }
];

export const initialGroups: Group[] = [
  {
    id: 'grp-1',
    name: 'Thakurgaon Sadar Community',
    bnName: 'ঠাকুরগাঁও সদর কমিউনিটি',
    description: 'ঠাকুরগাঁও সদর উপজেলা ও এর সকল ইউনিয়ন-পৌরসভার বাসিন্দাদের মিলনমেলা, পারস্পরিক সাহায্য ও তথ্যের ফোরাম।',
    coverPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&auto=format&fit=crop&q=80',
    category: 'Local Community',
    privacy: 'public',
    location: {
      divisionId: 'div-7',
      districtId: 'dis-thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar'
    },
    memberIds: ['user-1', 'user-4'],
    adminIds: ['user-1'],
    rules: [
      'পরস্পরের প্রতি শ্রদ্ধাশীল থাকুন',
      'কোনো প্রকার বিভ্রান্তিকর খবর ছড়াবেন না',
      'এলাকার গঠনমূলক উন্নয়নে পোস্ট করুন'
    ],
    announcement: 'আগামী মাসের ১৫ তারিখে ঠাকুরগাঁও সদর পাবলিক লাইব্রেরিতে উন্মুক্ত বই পড়া উৎসব অনুষ্ঠিত হবে।',
    createdAt: 'জানুয়ারি ২০২৪'
  },
  {
    id: 'grp-2',
    name: 'Rangpur Division Students',
    bnName: 'রংপুর বিভাগীয় শিক্ষার্থী ফোরাম',
    description: 'রংপুর বিভাগের ৮টি জেলার স্কুল, কলেজ ও বিশ্ববিদ্যালয়ের শিক্ষার্থীদের শিক্ষামূলক সংযোগ।',
    coverPhoto: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&auto=format&fit=crop&q=80',
    category: 'Education & Students',
    privacy: 'public',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur'
    },
    memberIds: ['user-1', 'user-2', 'user-4'],
    adminIds: ['user-1'],
    rules: ['পড়াশোনা সংক্রান্ত আলোচনা', 'বৃত্তি ও ক্যারিয়ার সহায়তা'],
    createdAt: 'ফেব্রুয়ারি ২০২৪'
  },
  {
    id: 'grp-3',
    name: 'Singia Community & Agriculture',
    bnName: 'সিঙ্গিয়া ইউনিয়ন সমাজ ও কৃষি',
    description: 'ঠাকুরগাঁও সদর উপজেলার সিঙ্গিয়া ইউনিয়নের সার্বিক উন্নয়ন ও কৃষিবান্ধব উদ্যোক্তাদের ফোরাম।',
    coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop&q=80',
    category: 'Agriculture & Village',
    privacy: 'public',
    location: {
      divisionId: 'div-7',
      districtId: 'dis-thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      unionId: 'un-singia',
      unionName: 'Singia Union'
    },
    memberIds: ['user-1', 'user-4'],
    adminIds: ['user-4'],
    rules: ['গ্রামের কৃষক ও যুবকদের সহায়তা', 'কৃষি তথ্য আদান-প্রদান'],
    createdAt: 'মার্চ ২০২৪'
  },
  {
    id: 'grp-4',
    name: 'Dhaka IT & Freelancers Hub',
    bnName: 'ঢাকা আইটি ও ফ্রিল্যান্সার হাব',
    description: 'ঢাকার তরুণ প্রযুক্তিবিদ ও রিমোট কর্মীদের সহযোগিতামূলক প্ল্যাটফর্ম।',
    coverPhoto: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&auto=format&fit=crop&q=80',
    category: 'Technology & Business',
    privacy: 'public',
    location: {
      divisionId: 'div-1',
      districtId: 'dis-dhaka',
      districtName: 'Dhaka'
    },
    memberIds: ['user-1', 'user-2', 'user-3'],
    adminIds: ['user-2'],
    rules: ['চাকরি ও প্রজেক্ট সুযোগ', 'নো স্প্যাম'],
    createdAt: 'ফেব্রুয়ারি ২০২৪'
  }
];

export const initialPages: Page[] = [
  {
    id: 'page-1',
    name: 'Thakurgaon Govt College',
    bnName: 'ঠাকুরগাঁও সরকারি কলেজ',
    category: 'School / College',
    description: 'উত্তরবঙ্গের ঐতিহ্যবাহী বিদ্যাপীঠ ঠাকুরগাঁও সরকারি কলেজের অফিসিয়াল সামাজিক পাতা।',
    coverPhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80',
    location: {
      divisionId: 'div-7',
      districtId: 'dis-thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar'
    },
    followerIds: ['user-1', 'user-4', 'user-5'],
    contactPhone: '01711000000',
    contactEmail: 'info@thakurgaongovtcollege.edu.bd',
    website: 'https://thakurgaongovtcollege.edu.bd',
    rating: 4.8,
    reviewCount: 94,
    verified: true,
    createdAt: 'জানুয়ারি ২০২৪'
  },
  {
    id: 'page-2',
    name: 'Sonar Bangla Handcrafts & Agro',
    bnName: 'সোনার বাংলা হস্তশিল্প ও এগ্রো',
    category: 'Local Business',
    description: 'বাংলাদেশের খাঁটি দেশি হস্তশিল্প, খাঁটি সরিষার তেল ও পাহাড়ি মধু সরবরাহের নির্ভরযোগ্য প্রতিষ্ঠান।',
    coverPhoto: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=200&auto=format&fit=crop&q=80',
    location: {
      divisionId: 'div-1',
      districtId: 'dis-dhaka',
      upazilaId: 'up-dhanmondi'
    },
    followerIds: ['user-1', 'user-2', 'user-3'],
    contactPhone: '01811998877',
    contactEmail: 'contact@sonarbanglaagro.com',
    rating: 4.9,
    reviewCount: 142,
    verified: true,
    createdAt: 'মার্চ ২০২৪'
  }
];

export const initialJobs: Job[] = [
  {
    id: 'job-1',
    title: 'ফিল্ড এগ্রিকালচার অফিসার ও ট্রেইনার',
    companyName: 'নর্থবেঙ্গল এগ্রো ডেভেলপমেন্ট লিমিটেড',
    companyLogo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format&fit=crop&q=80',
    category: 'কৃষি ও খামার',
    employmentType: 'Full-time',
    salaryRange: '৳ ২৫,০০০ - ৩৫,০০০ / মাস',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur',
      districtId: 'dis-thakurgaon',
      districtName: 'Thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar'
    },
    description: 'ঠাকুরগাঁও সদর এবং আশপাশের ইউনিয়নগুলোতে আধুনিক কৃষি পদ্ধতি ও জৈব সার ব্যবহারের উপর স্থানীয় কৃষকদের হাতে-কলমে প্রশিক্ষণ দিতে হবে।',
    requirements: [
      'কৃষি ডিপ্লোমা অথবা বিএসসি ইন এগ্রিকালচার',
      'মোটরসাইকেল ড্রাইভিং দক্ষতা',
      'স্থানীয় কৃষকদের সাথে সুসম্পর্ক গড়ে তোলার মানসিকতা'
    ],
    contactEmail: 'hr@northbengal-agro.com',
    posterId: 'user-4',
    applicantsCount: 12,
    createdAt: '২ দিন আগে'
  },
  {
    id: 'job-2',
    title: 'সিনিয়র ফুল-স্ট্যাক সফটওয়্যার ইঞ্জিনিয়ার (React + Node)',
    companyName: 'আপন টেক সলিউশনস',
    companyLogo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&auto=format&fit=crop&q=80',
    category: 'আইটি ও সফটওয়্যার',
    employmentType: 'Remote',
    salaryRange: '৳ ৬০,০০০ - ৯০,০০০ / মাস',
    location: {
      divisionId: 'div-1',
      divisionName: 'Dhaka',
      districtId: 'dis-dhaka',
      districtName: 'Dhaka',
      upazilaId: 'up-dhanmondi',
      upazilaName: 'Dhanmondi Thana'
    },
    description: 'বাংলাদেশের পরবর্তী প্রজন্মের হাইপার-লোকাল প্ল্যাটফর্মের জন্য স্কেলেবল আর্কিটেকচার ও এপিআই নির্মাণে কাজ করতে আগ্রহী ইঞ্জিনিয়ার আবশ্যক।',
    requirements: [
      'React, TypeScript ও Node.js-এ ৩+ বছরের অভিজ্ঞতা',
      'উচ্চ পারফরম্যান্স ও ডেটাবেজ অপ্টিমাইজেশন জ্ঞান',
      'রিমোট কাজের শৃঙ্খলা'
    ],
    contactEmail: 'career@aponsomaj.com',
    posterId: 'user-1',
    applicantsCount: 28,
    createdAt: '৩ দিন আগে'
  },
  {
    id: 'job-3',
    title: 'অফিস এক্সিকিউটিভ ও কাস্টমার সাপোর্ট',
    companyName: 'কর্ণফুলী লজিস্টিকস',
    companyLogo: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=100&auto=format&fit=crop&q=80',
    category: 'গ্রাহক সেবা ও লজিস্টিকস',
    employmentType: 'Full-time',
    salaryRange: '৳ ২০,০০০ - ২৮,০০০ / মাস',
    location: {
      divisionId: 'div-2',
      divisionName: 'Chattogram',
      districtId: 'dis-chattogram',
      districtName: 'Chattogram',
      upazilaId: 'up-panchlaish',
      upazilaName: 'Panchlaish Thana'
    },
    description: 'চট্টগ্রাম ব্রাঞ্চে গ্রাহকদের পার্সেল ট্র্যাকিং ও বিলিং সংক্রান্ত সহায়তার জন্য দায়িত্বশীল প্রার্থী কাম্য।',
    requirements: [
      'স্নাতক পাস',
      'কম্পিউটার ও বাংলা টাইপিংয়ে ভালো দক্ষতা',
      'ধৈর্যশীল ও বিনয়ী আচরণ'
    ],
    contactEmail: 'jobs@karnafuli-log.com',
    posterId: 'user-3',
    applicantsCount: 19,
    createdAt: '৪ দিন আগে'
  }
];

export const initialMarketplaceListings: MarketplaceListing[] = [
  {
    id: 'market-1',
    title: 'ঠাকুরগাঁওয়ের খাঁটি কাটারিভোগ আতপ চাল (৫০ কেজি বস্তা)',
    price: 3650,
    description: 'ঠাকুরগাঁওয়ের সুগন্ধি ও বিখ্যাত কাটারিভোগ চাল। সম্পূর্ণ নিজস্ব জমিতে উৎপাদিত ও পরিষ্কার করা। পাইকারি ও খুচরা সরবরাহ সম্ভব।',
    condition: 'Brand New',
    category: 'কৃষি ও খাদ্যদ্রব্য',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur',
      districtId: 'dis-thakurgaon',
      districtName: 'Thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar',
      unionId: 'un-singia',
      unionName: 'Singia Union',
      wardId: 'w-sng-5',
      wardName: 'Ward 5 (Singia Bazar)'
    },
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-4',
    status: 'available',
    createdAt: 'আজ দুপুর ১২:০০'
  },
  {
    id: 'market-2',
    title: 'ল্যাপটপ ডেল ল্যাটিচিউড ৭৪২০ (Core i7, 16GB RAM, 512GB SSD)',
    price: 44500,
    description: 'অফিস কাজের জন্য মাত্র ৫ মাস ব্যবহৃত ফ্রেশ কন্ডিশন ল্যাপটপ। অরিজিনাল চার্জার ও ব্যাকপ্যাক সাথে দেওয়া হবে। ব্যাটারি ব্যাকআপ ৫+ ঘণ্টা।',
    condition: 'Used - Good',
    category: 'ইলেকট্রনিক্স ও গ্যাজেট',
    location: {
      divisionId: 'div-1',
      divisionName: 'Dhaka',
      districtId: 'dis-dhaka',
      districtName: 'Dhaka',
      upazilaId: 'up-dhanmondi',
      upazilaName: 'Dhanmondi Thana',
      unionId: 'un-dhanmondi-r-a',
      unionName: 'Dhanmondi Residential Area',
      wardId: 'w-dhn-15',
      wardName: 'Ward 15 (Road 2-8A)'
    },
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-2',
    status: 'available',
    createdAt: 'গতকাল বিকাল'
  },
  {
    id: 'market-3',
    title: 'হাতে বোনা পিওর কটন জামদানি শাড়ি (রয়েল ব্লু ও গোল্ডেন জরি)',
    price: 5200,
    description: 'ঐতিহ্যবাহী নকশার নিখুঁত তাঁতের জামদানি শাড়ি। কোনো ড্যামেজ নেই। বিবাহ ও উৎসবের জন্য একদম উপযুক্ত।',
    condition: 'Brand New',
    category: 'পোশাক ও ফ্যাশন',
    location: {
      divisionId: 'div-2',
      divisionName: 'Chattogram',
      districtId: 'dis-chattogram',
      districtName: 'Chattogram',
      upazilaId: 'up-panchlaish',
      upazilaName: 'Panchlaish Thana'
    },
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-3',
    status: 'available',
    createdAt: '২ দিন আগে'
  }
];

export const initialMatrimonyProfiles: MatrimonyProfile[] = [
  {
    id: 'mat-1',
    userId: 'user-2',
    fullName: 'নুসরাত জাহান',
    gender: 'female',
    age: 26,
    height: "5' 4\"",
    education: 'বিএফএ (অনার্স), চারুকলা অনুষদ, ঢাকা বিশ্ববিদ্যালয়',
    profession: 'ইউআই/ইউএক্স ডিজাইনার (প্রাইভেট সফটওয়্যার ফার্ম)',
    religiousPractice: 'নিয়মিত সালাত আদায় ও শালীন জীবনযাপন',
    location: {
      divisionId: 'div-1',
      divisionName: 'Dhaka',
      districtId: 'dis-dhaka',
      districtName: 'Dhaka',
      upazilaId: 'up-dhanmondi',
      upazilaName: 'Dhanmondi Thana',
      unionId: 'un-dhanmondi-r-a',
      unionName: 'Dhanmondi Residential Area'
    },
    familyDetails: 'পিতা সরকারি কর্মকর্তা (অবসরপ্রাপ্ত), মাতা গৃহিণী। পরিবারে দুই বোন ও এক ভাই। সবাই সুশিক্ষিত ও মার্জিত।',
    partnerPreferences: 'শিক্ষিত, সৎ, নামাজী ও দায়িত্বশীল জীবনসঙ্গী প্রত্যাশা। বয়স ২৭-৩২ বছর। ঢাকা বা বিভাগীয় শহরের স্থায়ী বাসিন্দা অগ্রাধিকার।',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    privacyLevel: 'verified_only',
    isVerified: true,
    createdAt: 'জানুয়ারি ২০২৪'
  },
  {
    id: 'mat-2',
    userId: 'user-1',
    fullName: 'তানভীর হোসেন',
    gender: 'male',
    age: 28,
    height: "5' 9\"",
    education: 'বিএসসি ইন কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং (সিএসই), রাবি',
    profession: 'সফটওয়্যার আর্কিটেক্ট ও টেকনোলজি উদ্যোক্তা',
    religiousPractice: 'ইসলামিক অনুশাসন পালনে সচেষ্ট ও মধ্যপন্থী',
    location: {
      divisionId: 'div-7',
      divisionName: 'Rangpur',
      districtId: 'dis-thakurgaon',
      districtName: 'Thakurgaon',
      upazilaId: 'up-thakurgaon-sadar',
      upazilaName: 'Thakurgaon Sadar'
    },
    familyDetails: 'পিতা বিশিষ্ট ব্যবসায়ী ও স্থানীয় সমাজসেবক। মাতা শিক্ষিকা। স্থায়ী বাড়ি ঠাকুরগাঁও পৌরসভা ও নিজস্ব বাসভবন রয়েছে।',
    partnerPreferences: 'স্নাতক বা সমমান পাস, মার্জিত, পারিবারিক মূল্যবোধসম্পন্ন ও ধার্মিক মনমানসিকতার পাত্রী পছন্দ। বয়স ২২-২৬ বছর।',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    privacyLevel: 'verified_only',
    isVerified: true,
    createdAt: 'ফেব্রুয়ারি ২০২৪'
  }
];

export const initialFriendships: Friendship[] = [
  { id: 'f-1', requesterId: 'user-1', receiverId: 'user-2', status: 'accepted', createdAt: 'জানুয়ারি ২০২৪' },
  { id: 'f-2', requesterId: 'user-1', receiverId: 'user-4', status: 'accepted', createdAt: 'ফেব্রুয়ারি ২০২৪' },
  { id: 'f-3', requesterId: 'user-3', receiverId: 'user-1', status: 'accepted', createdAt: 'মার্চ ২০২৪' },
  { id: 'f-4', requesterId: 'user-5', receiverId: 'user-1', status: 'pending', createdAt: 'আজ সকাল' }
];

export const initialMessages: Message[] = [
  {
    id: 'm-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content: 'আসসালামু আলাইকুম তানভীর ভাই! আপন সমাজের নতুন আপডেটটা খুব সুন্দর হয়েছে।',
    createdAt: '১০:৩০ AM',
    read: true
  },
  {
    id: 'm-2',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'ওয়ালাইকুম আসসালাম নুসরাত! ধন্যবাদ অনেক। আপনার এলাকার নতুন ডিজাইন ফিডব্যাকও দেখলাম, চমৎকার হয়েছে।',
    createdAt: '১০:৩২ AM',
    read: true
  },
  {
    id: 'm-3',
    senderId: 'user-4',
    receiverId: 'user-1',
    content: 'তানভীর ভাই, ঠাকুরগাঁও সদর গ্রুপের জন্য নতুন একটা কৃষিমেলা আয়োজনের পোস্ট দিয়েছি, একটু দেখে দিন।',
    createdAt: '১১:১৫ AM',
    read: false
  }
];

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    actorId: 'user-2',
    type: 'reaction',
    title: 'নুসরাত জাহান আপনার পোস্টে লাভ রিঅ্যাক্ট দিয়েছেন',
    content: '"শুভ সকাল আপন সমাজের বন্ধুরা! 🌸 ঠাকুরগাঁও শহরের স্টেশন রোড..."',
    read: false,
    createdAt: '৫ মিনিট আগে'
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    actorId: 'user-5',
    type: 'friend_request',
    title: 'ফারহানা আক্তার আপনাকে ফ্রেন্ড রিকোয়েস্ট পাঠিয়েছেন',
    content: 'সিলেট সদর থেকে আপনার সাথে যুক্ত হতে চান।',
    read: false,
    createdAt: '১৫ মিনিট আগে'
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    actorId: 'user-4',
    type: 'comment',
    title: 'মাহবুব আলম আপনার পোস্টে মন্তব্য করেছেন',
    content: '"তানভীর ভাই, স্টেশন রোডের মোড়ে আসলে সিঙ্গিয়া ইউনিয়নের সুস্বাদু গরম জিলাপি নিয়ে যাব!"',
    read: true,
    createdAt: '১ ঘণ্টা আগে'
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    actorId: 'user-3',
    type: 'marketplace',
    title: 'মার্কেটপ্লেস আপডেট',
    content: 'আপনার সংরক্ষিত এলাকা ঠাকুরগাঁও সদরে নতুন কৃষিপণ্যের লিস্টিং যুক্ত হয়েছে।',
    read: true,
    createdAt: '৩ ঘণ্টা আগে'
  }
];

export const initialReports: Report[] = [
  {
    id: 'rep-1',
    reporterId: 'user-3',
    targetType: 'post',
    targetId: 'post-test',
    reason: 'Spam / বিভ্রান্তিকর বিজ্ঞাপন',
    details: 'অননুমোদিত বাণিজ্যিক স্ক্যাম লিংক ছড়ানোর অভিযোগ।',
    status: 'pending',
    createdAt: 'আজ ভোর ০৪:০০'
  }
];

export const initialPrivacySettings: PrivacySettings = {
  postVisibility: 'public',
  allowFriendRequests: 'everyone',
  allowFollow: 'everyone',
  allowMessages: 'everyone',
  showDetailedLocation: true
};
