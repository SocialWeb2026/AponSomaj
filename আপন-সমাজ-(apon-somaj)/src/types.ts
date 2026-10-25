export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface LocationTag {
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
  customText?: string;
}

export interface Division {
  id: string;
  name: string;
  bnName: string;
  active: boolean;
}

export interface District {
  id: string;
  divisionId: string;
  name: string;
  bnName: string;
  active: boolean;
}

export interface Upazila {
  id: string;
  districtId: string;
  name: string;
  bnName: string;
  active: boolean;
}

export interface Union {
  id: string;
  upazilaId: string;
  name: string;
  bnName: string;
  active: boolean;
}

export interface Ward {
  id: string;
  unionId: string;
  number: number;
  name: string;
  bnName: string;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  bnName?: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  coverPhoto: string;
  bio: string;
  hometown: string;
  currentDistrict: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  wardId?: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  joinedDate: string;
  occupation?: string;
  education?: string;
  website?: string;
  work?: string;
  bloodGroup?: string;
  isBanned?: boolean;
  password?: string;
  createdAt?: string;
  following?: string[];
  followersCount: number;
  followingCount: number;
  friendsCount: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // User IDs
}

export interface PollData {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
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
  linkUrl?: string;
  linkTitle?: string;
  location?: LocationTag;
  feeling?: string;
  poll?: PollData;
  reactions: Record<ReactionType, string[]>; // array of user IDs
  commentCount: number;
  shareCount: number;
  visibility: 'public' | 'friends' | 'only_me';
  createdAt: string;
  groupId?: string;
  pageId?: string;
  storagePath?: string;
  bucket?: string;
  editingMetadata?: Record<string, unknown>;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  genre: 'folk' | 'traditional' | 'festive' | 'ambient' | 'lofi' | 'instrumental' | 'custom';
  licenseType: string;
  audioUrl: string;
  coverUrl?: string;
  isActive: boolean;
}

export interface OverlayItem {
  id: string;
  type: 'text' | 'emoji' | 'sticker';
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number;
  color?: string;
  fontSize?: number;
  rotation?: number;
}

export interface DrawingPath {
  id: string;
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
}

export interface ImageEditState {
  brightness: number; // -100 to 100, default 0
  contrast: number; // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  blur: number; // 0 to 20, default 0
  filter: 'none' | 'monochrome' | 'warm' | 'vintage' | 'sepia' | 'vivid' | 'cool' | 'dramatic';
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  cropAspect?: 'free' | '1:1' | '4:5' | '16:9' | '9:16';
  overlays: OverlayItem[];
  drawings: DrawingPath[];
}

export interface VideoClipItem {
  id: string;
  file?: File;
  url: string;
  name: string;
  size: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  speed: number;
  volume: number;
  isMuted: boolean;
}

export interface VideoEditState {
  clips: VideoClipItem[];
  selectedDurationLimit: 15 | 30 | 60 | 90 | 180;
  trimStart: number;
  trimEnd: number;
  speed: number;
  volume: number;
  isMuted: boolean;
  musicTrack?: MusicTrack;
  musicVolume: number;
  musicStart: number;
  filter: 'none' | 'monochrome' | 'warm' | 'vintage' | 'sepia' | 'vivid' | 'cool';
  brightness: number;
  contrast: number;
  coverTime: number;
  coverDataUrl?: string;
  overlays: OverlayItem[];
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  content?: string;
  backgroundStyle?: string;
  privacy: 'public' | 'friends';
  locationName?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  createdAt: string;
  expiresAt: string;
  isArchived: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  parentId?: string; // For nested replies
  reactions: Record<string, string[]>;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // user ID or groupId
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'file' | 'voice';
  voiceDuration?: number;
  createdAt: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string; // recipient
  actorId: string;
  type:
    | 'friend_request'
    | 'friend_accepted'
    | 'reaction'
    | 'comment'
    | 'comment_reply'
    | 'share'
    | 'mention'
    | 'follow'
    | 'message'
    | 'group'
    | 'marketplace'
    | 'job'
    | 'labour'
    | 'matrimony'
    | 'system';
  title: string;
  content: string;
  linkUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  bnName?: string;
  description: string;
  coverPhoto: string;
  avatar: string;
  category: string;
  privacy: 'public' | 'private';
  location?: LocationTag;
  memberIds: string[];
  adminIds: string[];
  rules: string[];
  announcement?: string;
  createdAt: string;
}

export interface Page {
  id: string;
  name: string;
  bnName?: string;
  category: string;
  description: string;
  coverPhoto: string;
  avatar: string;
  location?: LocationTag;
  followerIds: string[];
  followers?: string[];
  contactPhone?: string;
  phone?: string;
  contactEmail?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogo: string;
  category: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  location: LocationTag;
  description: string;
  requirements: string[];
  contactEmail: string;
  posterId: string;
  applicantsCount: number;
  applicantIds?: string[];
  deadline?: string;
  createdAt: string;
}

export interface MatrimonyProfile {
  id: string;
  userId: string;
  fullName: string;
  gender: 'male' | 'female';
  age: number;
  height: string;
  education: string;
  profession: string;
  religiousPractice: string;
  religion?: string;
  location: LocationTag;
  familyDetails: string;
  partnerPreferences: string;
  photoUrl: string;
  avatar?: string;
  privacyLevel: 'public' | 'verified_only' | 'private';
  isVerified: boolean;
  maritalStatus?: string;
  hometown?: string;
  guardianContact?: string;
  aboutMe?: string;
  interestedUserIds?: string[];
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  description: string;
  condition: 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair' | 'new' | 'used' | 'refurbished';
  category: string;
  location: LocationTag;
  images: string[];
  phone?: string;
  sellerId: string;
  status: 'available' | 'sold';
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'comment' | 'group' | 'page' | 'marketplace';
  targetId: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface PrivacySettings {
  postVisibility: 'public' | 'friends' | 'only_me';
  allowFriendRequests: 'everyone' | 'friends_of_friends' | 'nobody';
  allowFollow: 'everyone' | 'friends' | 'nobody';
  allowMessages: 'everyone' | 'friends' | 'nobody';
  showDetailedLocation: boolean;
}

// ====================================================================
// Labour Marketplace (“কাজ চাই / শ্রমিক চাই”) Types
// ====================================================================

export interface LabourCategory {
  id: string;
  name: string;
  bnName: string;
  icon: string;
  sortOrder: number;
}

export interface LabourSkill {
  id: string;
  categoryId: string;
  name: string;
  bnName: string;
}

export type LabourUserType = 'looking_for_work' | 'hiring_workers' | 'both';
export type LabourAvailability = 'available_today' | 'available_this_week' | 'busy' | 'not_available';
export type LabourStatus = 'active' | 'busy' | 'suspended' | 'temporarily_unavailable';
export type LabourJobStatus = 'open' | 'applications_received' | 'worker_selected' | 'closed' | 'expired';

export interface LabourProfile {
  id: string;
  userId: string;
  userType: LabourUserType;
  fullName: string;
  phone: string;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  categoryId?: string;
  skillId?: string;
  specificSkill?: string;
  experienceYears: number;
  experienceLevel: string; // 'শিক্ষানবিস' | 'দক্ষ কারিগর' | 'ওস্তাদ / ফোরম্যান'
  expectedDailyWage: number;
  expectedMonthlyWage: number;
  availability: LabourAvailability;
  maxTravelDistance: string; // 'same_ward' | 'same_union' | 'same_upazila' | 'same_district' | 'anywhere'
  location: LocationTag;
  locationCustom?: string;
  bio?: string;
  workHistory?: string;
  isVerified: boolean;
  status: LabourStatus;
  completedJobsCount: number;
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

export interface LabourJobPost {
  id: string;
  employerId: string;
  title: string;
  categoryId?: string;
  skillId?: string;
  specificSkill?: string;
  workersNeeded: number;
  description: string;
  wageAmount: number;
  wageType: 'daily' | 'monthly' | 'contract';
  duration: string;
  workDate?: string;
  requiredAvailability: string;
  location: LocationTag;
  addressDetails?: string;
  contactMethod: string;
  expiresAt: string;
  status: LabourJobStatus;
  createdAt: string;
  updatedAt?: string;
  applicationsCount?: number;
}

export interface LabourApplication {
  id: string;
  jobId: string;
  workerId: string;
  proposedWage?: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  workerProfile?: LabourProfile;
}

export interface LabourContactRequest {
  id: string;
  senderId: string;
  receiverId: string;
  targetType: 'worker' | 'job';
  targetId: string;
  requestType: 'contact_request' | 'call_request' | 'hire_request';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  phoneShared: boolean;
  createdAt: string;
}

export interface LabourReport {
  id: string;
  reporterId: string;
  targetType: 'worker_profile' | 'job_post' | 'contact_request';
  targetId: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

