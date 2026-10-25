import { Division, District, Upazila, Union, Ward } from '../types';
import locData from './bangladeshLocationData.json';

// Complete, Official Bangladesh Administrative Hierarchy
export const initialDivisions: Division[] = locData.divisions as Division[];
export const initialDistricts: District[] = locData.districts as District[];
export const initialUpazilas: Upazila[] = locData.upazilas as Upazila[];
export const initialUnions: Union[] = locData.unions as Union[];

export const initialWards: Ward[] = [
  // Thakurgaon Paurashava Wards (1 - 12)
  { id: 'w-tgp-1', unionId: 'un-thakurgaon-pourashava', number: 1, name: 'Ward 1 (College Para)', bnName: '১ নং ওয়ার্ড (কলেজ পাড়া)', active: true },
  { id: 'w-tgp-2', unionId: 'un-thakurgaon-pourashava', number: 2, name: 'Ward 2 (Court Road)', bnName: '২ নং ওয়ার্ড (কোর্ট রোড)', active: true },
  { id: 'w-tgp-3', unionId: 'un-thakurgaon-pourashava', number: 3, name: 'Ward 3 (Hazipara)', bnName: '৩ নং ওয়ার্ড (হাজী পাড়া)', active: true },
  { id: 'w-tgp-4', unionId: 'un-thakurgaon-pourashava', number: 4, name: 'Ward 4 (Gobindanagar)', bnName: '৪ নং ওয়ার্ড (গোবিন্দনগর)', active: true },
  { id: 'w-tgp-5', unionId: 'un-thakurgaon-pourashava', number: 5, name: 'Ward 5 (Station Road)', bnName: '৫ নং ওয়ার্ড (স্টেশন রোড)', active: true },
  { id: 'w-tgp-6', unionId: 'un-thakurgaon-pourashava', number: 6, name: 'Ward 6 (Sardarpara)', bnName: '৬ নং ওয়ার্ড (সরদারপাড়া)', active: true },

  // Singia Union Wards (1 - 9)
  { id: 'w-sng-1', unionId: 'un-singia', number: 1, name: 'Ward 1 (Dakshin Singia)', bnName: '১ নং ওয়ার্ড (দক্ষিণ সিঙ্গিয়া)', active: true },
  { id: 'w-sng-2', unionId: 'un-singia', number: 2, name: 'Ward 2 (Uttar Singia)', bnName: '২ নং ওয়ার্ড (উত্তর সিঙ্গিয়া)', active: true },
  { id: 'w-sng-3', unionId: 'un-singia', number: 3, name: 'Ward 3 (Purba Singia)', bnName: '৩ নং ওয়ার্ড (পূর্ব সিঙ্গিয়া)', active: true },
  { id: 'w-sng-4', unionId: 'un-singia', number: 4, name: 'Ward 4 (Pashchim Singia)', bnName: '৪ নং ওয়ার্ড (পশ্চিম সিঙ্গিয়া)', active: true },
  { id: 'w-sng-5', unionId: 'un-singia', number: 5, name: 'Ward 5 (Singia Bazar)', bnName: '৫ নং ওয়ার্ড (সিঙ্গিয়া বাজার)', active: true },
  { id: 'w-sng-6', unionId: 'un-singia', number: 6, name: 'Ward 6 (Charpara)', bnName: '৬ নং ওয়ার্ড (চরপাড়া)', active: true },
  { id: 'w-sng-7', unionId: 'un-singia', number: 7, name: 'Ward 7 (Mollapara)', bnName: '৭ নং ওয়ার্ড (মোল্লাপাড়া)', active: true },
  { id: 'w-sng-8', unionId: 'un-singia', number: 8, name: 'Ward 8 (Kazi Para)', bnName: '৮ নং ওয়ার্ড (কাজী পাড়া)', active: true },
  { id: 'w-sng-9', unionId: 'un-singia', number: 9, name: 'Ward 9 (Shikderpara)', bnName: '৯ নং ওয়ার্ড (শিকদারপাড়া)', active: true },

  // Dhanmondi Wards
  { id: 'w-dhn-15', unionId: 'un-dhanmondi-r-a', number: 15, name: 'Ward 15 (Road 2-8A)', bnName: '১৫ নং ওয়ার্ড (ধানমন্ডি ২-৮এ)', active: true },
  { id: 'w-dhn-27', unionId: 'un-dhanmondi-r-a', number: 27, name: 'Ward 27 (Road 27 / Shankar)', bnName: '২৭ নং ওয়ার্ড (ধানমন্ডি ২৭/শংকর)', active: true },
  { id: 'w-dhn-32', unionId: 'un-dhanmondi-r-a', number: 32, name: 'Ward 32 (Lake Circus & Road 32)', bnName: '৩২ নং ওয়ার্ড (লেক সার্কাস ও ৩২)', active: true },

  // Mirpur Wards
  { id: 'w-mrp-7', unionId: 'un-mirpur-1', number: 7, name: 'Ward 7 (Mirpur 1 Colony)', bnName: '৭ নং ওয়ার্ড (মিরপুর ১ কলোনি)', active: true },
  { id: 'w-mrp-8', unionId: 'un-mirpur-1', number: 8, name: 'Ward 8 (Mirpur 2 & Botanical Garden)', bnName: '৮ নং ওয়ার্ড (মিরপুর ২)', active: true },
  { id: 'w-mrp-10', unionId: 'un-mirpur-10', number: 10, name: 'Ward 10 (Stadium Area)', bnName: '১০ নং ওয়ার্ড (মিরপুর ১০ স্টেডিয়াম)', active: true },
  { id: 'w-mrp-12', unionId: 'un-mirpur-10', number: 12, name: 'Ward 12 (Mirpur 10 Goalchattor)', bnName: '১২ নং ওয়ার্ড (মিরপুর ১০ গোলচত্বর)', active: true },

  // Gulshan & Banani Wards
  { id: 'w-gln-19', unionId: 'un-gulshan-1', number: 19, name: 'Ward 19 (Gulshan 1 Circle)', bnName: '১৯ নং ওয়ার্ড (গুলশান ১ সার্কেল)', active: true },
  { id: 'w-gln-20', unionId: 'un-gulshan-1', number: 20, name: 'Ward 20 (Gulshan 2 Avenue)', bnName: '২০ নং ওয়ার্ড (গুলশান ২ এভিনিউ)', active: true },
  { id: 'w-bnn-18', unionId: 'un-banani', number: 18, name: 'Ward 18 (Banani Road 11)', bnName: '১৮ নং ওয়ার্ড (বনানী ১১)', active: true },

  // Uttara Wards
  { id: 'w-utt-1', unionId: 'un-uttara-sector-3-7', number: 1, name: 'Ward 1 (Sector 3 & 5)', bnName: '১ নং ওয়ার্ড (সেক্টর ৩ ও ৫)', active: true },
  { id: 'w-utt-51', unionId: 'un-uttara-sector-9-14', number: 51, name: 'Ward 51 (Sector 11-13)', bnName: '৫১ নং ওয়ার্ড (সেক্টর ১১-১৩)', active: true },

  // Savar Paurashava Wards
  { id: 'w-sav-1', unionId: 'un-savar-paurashava', number: 1, name: 'Ward 1 (Bank Colony)', bnName: '১ নং ওয়ার্ড (ব্যাংক কলোনি)', active: true },
  { id: 'w-sav-2', unionId: 'un-savar-paurashava', number: 2, name: 'Ward 2 (Bazar Road)', bnName: '২ নং ওয়ার্ড (সাভার বাজার)', active: true },

  // Chattogram City Wards
  { id: 'w-ctg-15', unionId: 'un-nasirabad', number: 15, name: 'Ward 15 (Bagmoniram & Nasirabad)', bnName: '১৫ নং ওয়ার্ড (নাসিরাবাদ)', active: true },
  { id: 'w-ctg-32', unionId: 'un-andarkilla', number: 32, name: 'Ward 32 (Andarkilla)', bnName: '৩২ নং ওয়ার্ড (আন্দরকিল্লা)', active: true },

  // Cox's Bazar Paurashava Wards
  { id: 'w-cxb-1', unionId: 'un-coxsbazar-pourashava', number: 1, name: 'Ward 1 (Samity Para)', bnName: '১ নং ওয়ার্ড (সমিতি পাড়া)', active: true },
  { id: 'w-cxb-2', unionId: 'un-coxsbazar-pourashava', number: 2, name: 'Ward 2 (Laboni Beach Road)', bnName: '২ নং ওয়ার্ড (লাবণী বিচ রোড)', active: true },
  { id: 'w-cxb-3', unionId: 'un-coxsbazar-pourashava', number: 3, name: 'Ward 3 (Kolatoli)', bnName: '৩ নং ওয়ার্ড (কলাতলী)', active: true },
];

/**
 * Returns available unions for a given Upazila.
 */
export function getUnionsForUpazila(upazilaId: string, customUnions: Union[] = []): Union[] {
  const specific = customUnions.filter(u => u.upazilaId === upazilaId && u.active);
  if (specific.length > 0) return specific;

  return initialUnions.filter(u => u.upazilaId === upazilaId && u.active);
}

/**
 * Returns available wards for a given Union.
 * In Bangladesh, every union standardly comprises 9 administrative wards (Ward 1 to Ward 9).
 */
export function getWardsForUnion(unionId: string, customWards: Ward[] = []): Ward[] {
  const specific = customWards.filter(w => w.unionId === unionId && w.active);
  if (specific.length > 0) return specific;

  const defaultSpecific = initialWards.filter(w => w.unionId === unionId && w.active);
  if (defaultSpecific.length > 0) return defaultSpecific;

  // In Bangladesh, every union standardly comprises 9 administrative wards (Ward 1 to Ward 9)
  const bnDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return bnDigits.map((bnNum, index) => ({
    id: `w-auto-${unionId}-${index + 1}`,
    unionId,
    number: index + 1,
    name: `Ward ${index + 1}`,
    bnName: `${bnNum} নং ওয়ার্ড`,
    active: true
  }));
}
