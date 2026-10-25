import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getUnionsForUpazila, getWardsForUnion } from '../data/bangladeshLocations';
import { MapPin, ChevronDown } from 'lucide-react';

export interface LocationValue {
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

interface BangladeshLocationPickerProps {
  value: LocationValue;
  onChange: (newValue: LocationValue) => void;
  showAllOption?: boolean; // For filtering (e.g. "সব বাংলাদেশ", "সকল জেলা")
  includeWards?: boolean;
  includeUnions?: boolean;
  layout?: 'grid' | 'vertical' | 'horizontal';
  theme?: 'light' | 'emerald' | 'subtle';
  className?: string;
  labels?: boolean;
  compact?: boolean;
}

export const BangladeshLocationPicker: React.FC<BangladeshLocationPickerProps> = ({
  value,
  onChange,
  showAllOption = false,
  includeWards = true,
  includeUnions = true,
  layout = 'grid',
  theme = 'light',
  className = '',
  labels = true,
  compact = false,
}) => {
  const { divisions, districts, upazilas, unions, wards } = useApp();

  const selectedDivId = value.divisionId || '';
  const selectedDistId = value.districtId || '';
  const selectedUpId = value.upazilaId || '';
  const selectedUnId = value.unionId || '';
  const selectedWardId = value.wardId || '';

  // 1. Available Districts: only belonging to selected division
  const availableDistricts = useMemo(() => {
    if (!selectedDivId) return [];
    return districts.filter(d => d.divisionId === selectedDivId && d.active);
  }, [districts, selectedDivId]);

  // 2. Available Upazilas: only belonging to selected district
  const availableUpazilas = useMemo(() => {
    if (!selectedDistId) return [];
    return upazilas.filter(u => u.districtId === selectedDistId && u.active);
  }, [upazilas, selectedDistId]);

  // 3. Available Unions: only belonging to selected upazila
  const availableUnions = useMemo(() => {
    if (!selectedUpId) return [];
    const direct = unions.filter(un => un.upazilaId === selectedUpId && un.active);
    if (direct.length > 0) return direct;
    return getUnionsForUpazila(selectedUpId, unions);
  }, [unions, selectedUpId]);

  // 4. Available Wards: only belonging to selected union
  const availableWards = useMemo(() => {
    if (!selectedUnId) return [];
    const direct = wards.filter(w => w.unionId === selectedUnId && w.active);
    if (direct.length > 0) return direct;
    return getWardsForUnion(selectedUnId, wards);
  }, [wards, selectedUnId]);

  // Handlers enforcing strict parent-child dependency
  const handleDivisionChange = (newDivId: string) => {
    const div = divisions.find(d => d.id === newDivId);
    onChange({
      divisionId: newDivId || undefined,
      divisionName: div ? div.bnName : undefined,
      districtId: undefined,
      districtName: undefined,
      upazilaId: undefined,
      upazilaName: undefined,
      unionId: undefined,
      unionName: undefined,
      wardId: undefined,
      wardName: undefined,
    });
  };

  const handleDistrictChange = (newDistId: string) => {
    const dist = availableDistricts.find(d => d.id === newDistId);
    onChange({
      ...value,
      districtId: newDistId || undefined,
      districtName: dist ? dist.bnName : undefined,
      upazilaId: undefined,
      upazilaName: undefined,
      unionId: undefined,
      unionName: undefined,
      wardId: undefined,
      wardName: undefined,
    });
  };

  const handleUpazilaChange = (newUpId: string) => {
    const up = availableUpazilas.find(u => u.id === newUpId);
    onChange({
      ...value,
      upazilaId: newUpId || undefined,
      upazilaName: up ? up.bnName : undefined,
      unionId: undefined,
      unionName: undefined,
      wardId: undefined,
      wardName: undefined,
    });
  };

  const handleUnionChange = (newUnId: string) => {
    const un = availableUnions.find(u => u.id === newUnId);
    onChange({
      ...value,
      unionId: newUnId || undefined,
      unionName: un ? un.bnName : undefined,
      wardId: undefined,
      wardName: undefined,
    });
  };

  const handleWardChange = (newWardId: string) => {
    const w = availableWards.find(ward => ward.id === newWardId);
    onChange({
      ...value,
      wardId: newWardId || undefined,
      wardName: w ? w.bnName : undefined,
    });
  };

  // Styling based on theme
  const getSelectClasses = (disabled: boolean) => {
    if (theme === 'emerald') {
      return `w-full rounded-xl bg-white/10 border border-white/25 px-2.5 py-1.5 text-white text-xs backdrop-blur-md focus:bg-emerald-900 focus:outline-hidden ${
        disabled ? 'opacity-40 cursor-not-allowed bg-black/10' : 'hover:border-white/40 cursor-pointer'
      }`;
    }
    if (theme === 'subtle') {
      return `w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden ${
        disabled ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed border-slate-100' : 'hover:border-slate-300 cursor-pointer'
      }`;
    }
    // Default light theme
    return `w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
      disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : 'hover:border-emerald-300 cursor-pointer'
    }`;
  };

  const labelClass = theme === 'emerald'
    ? 'text-[11px] font-semibold text-emerald-200 block mb-1'
    : 'text-[11px] font-semibold text-slate-600 block mb-1';

  const gridCols = includeWards
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
    : includeUnions
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div
      className={`${layout === 'grid' ? `grid ${gridCols} gap-2.5` : 'space-y-2.5'} ${className}`}
    >
      {/* 1. Division Dropdown */}
      <div className="flex-1 min-w-0">
        {labels && <label className={labelClass}>বিভাগ (Division)</label>}
        <select
          id="bd-select-division"
          value={selectedDivId}
          onChange={e => handleDivisionChange(e.target.value)}
          className={getSelectClasses(false)}
        >
          <option value="" className="text-slate-800">
            {showAllOption ? 'সব বাংলাদেশ' : '-- বিভাগ নির্বাচন করুন --'}
          </option>
          {divisions.map(d => (
            <option key={d.id} value={d.id} className="text-slate-800">
              {d.bnName} ({d.name})
            </option>
          ))}
        </select>
      </div>

      {/* 2. District Dropdown (dependent on Division) */}
      <div className="flex-1 min-w-0">
        {labels && <label className={labelClass}>জেলা (District)</label>}
        <select
          id="bd-select-district"
          value={selectedDistId}
          disabled={!selectedDivId}
          onChange={e => handleDistrictChange(e.target.value)}
          className={getSelectClasses(!selectedDivId)}
        >
          <option value="" className="text-slate-800">
            {!selectedDivId
              ? 'আগে বিভাগ নির্বাচন করুন'
              : showAllOption
              ? 'সকল জেলা'
              : '-- জেলা নির্বাচন করুন --'}
          </option>
          {availableDistricts.map(d => (
            <option key={d.id} value={d.id} className="text-slate-800">
              {d.bnName} ({d.name})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Upazila Dropdown (dependent on District) */}
      <div className="flex-1 min-w-0">
        {labels && <label className={labelClass}>উপজেলা / থানা (Upazila)</label>}
        <select
          id="bd-select-upazila"
          value={selectedUpId}
          disabled={!selectedDistId}
          onChange={e => handleUpazilaChange(e.target.value)}
          className={getSelectClasses(!selectedDistId)}
        >
          <option value="" className="text-slate-800">
            {!selectedDistId
              ? 'আগে জেলা নির্বাচন করুন'
              : showAllOption
              ? 'সকল উপজেলা / থানা'
              : '-- উপজেলা / থানা নির্বাচন করুন --'}
          </option>
          {availableUpazilas.map(u => (
            <option key={u.id} value={u.id} className="text-slate-800">
              {u.bnName} ({u.name})
            </option>
          ))}
        </select>
      </div>

      {/* 4. Union / Paurashava Dropdown (dependent on Upazila) */}
      {includeUnions && (
        <div className="flex-1 min-w-0">
          {labels && <label className={labelClass}>ইউনিয়ন / পৌরসভা (Union)</label>}
          <select
            id="bd-select-union"
            value={selectedUnId}
            disabled={!selectedUpId}
            onChange={e => handleUnionChange(e.target.value)}
            className={getSelectClasses(!selectedUpId)}
          >
            <option value="" className="text-slate-800">
              {!selectedUpId
                ? 'আগে উপজেলা নির্বাচন করুন'
                : showAllOption
                ? 'সকল ইউনিয়ন / পৌর এলাকা'
                : '-- ইউনিয়ন / পৌরসভা নির্বাচন করুন --'}
            </option>
            {availableUnions.map(un => (
              <option key={un.id} value={un.id} className="text-slate-800">
                {un.bnName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 5. Ward Dropdown (dependent on Union / Paurashava) */}
      {includeWards && (
        <div className="flex-1 min-w-0">
          {labels && <label className={labelClass}>ওয়ার্ড (Ward)</label>}
          <select
            id="bd-select-ward"
            value={selectedWardId}
            disabled={!selectedUnId}
            onChange={e => handleWardChange(e.target.value)}
            className={getSelectClasses(!selectedUnId)}
          >
            <option value="" className="text-slate-800">
              {!selectedUnId
                ? 'আগে ইউনিয়ন নির্বাচন করুন'
                : showAllOption
                ? 'সকল ওয়ার্ড'
                : '-- ওয়ার্ড নির্বাচন করুন --'}
            </option>
            {availableWards.map(w => (
              <option key={w.id} value={w.id} className="text-slate-800">
                {w.bnName} {w.name && w.name !== w.bnName ? `(${w.name})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
