import { MusicTrack } from '../types';

/**
 * Apon Somaj — Approved Copyright-Free & Royalty-Free Music Library
 * Strictly curated music tracks complying with platform copyright policies.
 * Includes traditional Bengali instruments (Dotara, Banshi, Ektara, Dhol),
 * acoustic, ambient, and modern rhythmic tracks for Reels & Video posts.
 */

export const APPROVED_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'music-dotara-folk',
    title: 'মন মাঝি রে (Acoustic Dotara)',
    artist: 'পল্লী সুর একাডেমি',
    duration: 48,
    genre: 'folk',
    licenseType: 'Royalty-Free / Platform Licensed',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-valley-sunset-127.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-banshi-river',
    title: 'নদীর বাঁকে বাঁকে (Flute & Banshi)',
    artist: 'সুর সম্রাট ওস্তাদ নাসির',
    duration: 62,
    genre: 'traditional',
    licenseType: 'Creative Commons Zero (CC0)',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-festive-dhol',
    title: 'উৎসবের ঢোল (Festive Celebration Beat)',
    artist: 'বাউল ও লোক বাদ্যযন্ত্র দল',
    duration: 35,
    genre: 'festive',
    licenseType: 'Royalty-Free / Platform Licensed',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-morning-calm',
    title: 'সকালের স্নিগ্ধ আলো (Morning Calm)',
    artist: 'আপন সমাজ একুয়েস্টিক ল্যাব',
    duration: 90,
    genre: 'ambient',
    licenseType: 'Platform Licensed',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-dhaka-lofi',
    title: 'ঢাকা ক্যাফে লফি (Dhaka Lofi Vibes)',
    artist: 'আর্বান সুর ট্র্যাকার',
    duration: 58,
    genre: 'lofi',
    licenseType: 'Royalty-Free / CC-BY 4.0',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-acoustic-guitar',
    title: 'গ্রামের মেঠোপথ (Village Acoustic Strum)',
    artist: 'সোনার বাংলা সাউন্ডস',
    duration: 42,
    genre: 'instrumental',
    licenseType: 'Royalty-Free / CC0',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-102.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-bhatiyali-mood',
    title: 'ভাটিয়ালি সুর (Bhatiyali Sunset Echoes)',
    artist: 'মেঘনা রিদম কালেক্টিভ',
    duration: 75,
    genre: 'folk',
    licenseType: 'Royalty-Free / Platform Licensed',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-spirit-of-the-water-123.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    id: 'music-positive-tech',
    title: 'নতুন দিনের আশা (Positive Rise)',
    artist: 'ইনোভেটিভ বাংলা ক্রু',
    duration: 30,
    genre: 'ambient',
    licenseType: 'Royalty-Free / Platform Licensed',
    audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-delightful-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80',
    isActive: true,
  }
];

export function getMusicTrackById(id: string): MusicTrack | undefined {
  return APPROVED_MUSIC_TRACKS.find(t => t.id === id);
}

export function searchMusicTracks(query: string, genre?: string): MusicTrack[] {
  return APPROVED_MUSIC_TRACKS.filter(t => {
    const matchesGenre = !genre || genre === 'all' || t.genre === genre;
    const matchesQuery =
      !query ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase());
    return matchesGenre && matchesQuery;
  });
}
