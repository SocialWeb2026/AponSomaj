import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Division, District, Upazila, Union, Ward } from '../types';
import {
  initialDivisions,
  initialDistricts,
  initialUpazilas,
  initialUnions,
  initialWards,
  getUnionsForUpazila,
  getWardsForUnion,
} from '../data/bangladeshLocations';

export interface LocationSearchResult {
  type: 'division' | 'district' | 'upazila' | 'union' | 'ward';
  id: string;
  name: string;
  bnName: string;
  parentName?: string;
  hierarchy: string;
}

/**
 * Loads divisions from Supabase if connected, otherwise returns verified dataset.
 */
export async function fetchDivisions(): Promise<Division[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name, bn_name, active')
        .eq('active', true)
        .order('name');
      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          name: d.name,
          bnName: d.bn_name,
          active: d.active,
        }));
      }
    } catch (e) {
      console.warn('Supabase divisions query failed, using local verified hierarchy:', e);
    }
  }
  return initialDivisions;
}

/**
 * Loads districts from Supabase if connected, otherwise returns verified dataset.
 */
export async function fetchDistricts(divisionId?: string): Promise<District[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('districts')
        .select('id, division_id, name, bn_name, active')
        .eq('active', true);
      if (divisionId) {
        query = query.eq('division_id', divisionId);
      }
      const { data, error } = await query.order('name');
      if (!error && data && data.length > 0) {
        return data.map(d => ({
          id: d.id,
          divisionId: d.division_id,
          name: d.name,
          bnName: d.bn_name,
          active: d.active,
        }));
      }
    } catch (e) {
      console.warn('Supabase districts query failed, using local verified hierarchy:', e);
    }
  }
  return divisionId
    ? initialDistricts.filter(d => d.divisionId === divisionId && d.active)
    : initialDistricts;
}

/**
 * Loads upazilas from Supabase if connected, otherwise returns verified dataset.
 */
export async function fetchUpazilas(districtId?: string): Promise<Upazila[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('upazilas')
        .select('id, district_id, name, bn_name, active')
        .eq('active', true);
      if (districtId) {
        query = query.eq('district_id', districtId);
      }
      const { data, error } = await query.order('name');
      if (!error && data && data.length > 0) {
        return data.map(u => ({
          id: u.id,
          districtId: u.district_id,
          name: u.name,
          bnName: u.bn_name,
          active: u.active,
        }));
      }
    } catch (e) {
      console.warn('Supabase upazilas query failed, using local verified hierarchy:', e);
    }
  }
  return districtId
    ? initialUpazilas.filter(u => u.districtId === districtId && u.active)
    : initialUpazilas;
}

/**
 * Loads unions from Supabase if connected, otherwise returns verified dataset.
 */
export async function fetchUnions(upazilaId?: string): Promise<Union[]> {
  if (isSupabaseConfigured && supabase && upazilaId) {
    try {
      const { data, error } = await supabase
        .from('unions')
        .select('id, upazila_id, name, bn_name, active')
        .eq('upazila_id', upazilaId)
        .eq('active', true)
        .order('name');
      if (!error && data && data.length > 0) {
        return data.map(un => ({
          id: un.id,
          upazilaId: un.upazila_id,
          name: un.name,
          bnName: un.bn_name,
          active: un.active,
        }));
      }
    } catch (e) {
      console.warn('Supabase unions query failed, using local verified hierarchy:', e);
    }
  }
  return upazilaId
    ? getUnionsForUpazila(upazilaId, initialUnions)
    : initialUnions;
}

/**
 * Loads wards from Supabase if connected, otherwise returns verified dataset.
 */
export async function fetchWards(unionId?: string): Promise<Ward[]> {
  if (isSupabaseConfigured && supabase && unionId) {
    try {
      const { data, error } = await supabase
        .from('wards')
        .select('id, union_id, number, name, bn_name, active')
        .eq('union_id', unionId)
        .eq('active', true)
        .order('number');
      if (!error && data && data.length > 0) {
        return data.map(w => ({
          id: w.id,
          unionId: w.union_id,
          number: w.number,
          name: w.name,
          bnName: w.bn_name,
          active: w.active,
        }));
      }
    } catch (e) {
      console.warn('Supabase wards query failed, using local verified hierarchy:', e);
    }
  }
  return unionId
    ? getWardsForUnion(unionId, initialWards)
    : initialWards;
}

/**
 * Efficient bilingual search across all 5 administrative levels.
 */
export function searchLocationsBilingual(query: string, limit = 15): LocationSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: LocationSearchResult[] = [];

  // Match Districts
  for (const d of initialDistricts) {
    if (d.name.toLowerCase().includes(q) || d.bnName.includes(q)) {
      const div = initialDivisions.find(v => v.id === d.divisionId);
      results.push({
        type: 'district',
        id: d.id,
        name: d.name,
        bnName: d.bnName,
        parentName: div ? `${div.bnName} (${div.name})` : undefined,
        hierarchy: `${div?.bnName || ''} → ${d.bnName}`,
      });
      if (results.length >= limit) return results;
    }
  }

  // Match Upazilas
  for (const u of initialUpazilas) {
    if (u.name.toLowerCase().includes(q) || u.bnName.includes(q)) {
      const dist = initialDistricts.find(d => d.id === u.districtId);
      const div = dist ? initialDivisions.find(v => v.id === dist.divisionId) : undefined;
      results.push({
        type: 'upazila',
        id: u.id,
        name: u.name,
        bnName: u.bnName,
        parentName: dist ? `${dist.bnName} (${dist.name})` : undefined,
        hierarchy: `${div?.bnName || ''} → ${dist?.bnName || ''} → ${u.bnName}`,
      });
      if (results.length >= limit) return results;
    }
  }

  // Match Unions
  for (const un of initialUnions) {
    if (un.name.toLowerCase().includes(q) || un.bnName.includes(q)) {
      const up = initialUpazilas.find(u => u.id === un.upazilaId);
      const dist = up ? initialDistricts.find(d => d.id === up.districtId) : undefined;
      results.push({
        type: 'union',
        id: un.id,
        name: un.name,
        bnName: un.bnName,
        parentName: up ? `${up.bnName} (${up.name})` : undefined,
        hierarchy: `${dist?.bnName || ''} → ${up?.bnName || ''} → ${un.bnName}`,
      });
      if (results.length >= limit) return results;
    }
  }

  // Match Divisions
  for (const div of initialDivisions) {
    if (div.name.toLowerCase().includes(q) || div.bnName.includes(q)) {
      results.push({
        type: 'division',
        id: div.id,
        name: div.name,
        bnName: div.bnName,
        hierarchy: `${div.bnName} বিভাগ`,
      });
      if (results.length >= limit) return results;
    }
  }

  return results;
}
