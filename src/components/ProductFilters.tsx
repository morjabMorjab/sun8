import React from "react";
import { Filter, RotateCcw, Search, DollarSign, Shield, ClipboardList } from "lucide-react";

interface FilterState {
  search: string;
  category: string;
  condition: string;
  certifications: string;
  minPrice: string;
  maxPrice: string;
  moq: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({
      search: "",
      category: "all",
      condition: "all",
      certifications: "all",
      minPrice: "",
      maxPrice: "",
      moq: "",
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-sky-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Advanced Filters</h2>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-sky-600 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="space-y-4">
        
        {/* Category Select */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
            <span>Product Type</span>
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          >
            <option value="all">All Supplies & Equipment</option>
            <option value="equipment">Heavy Medical Equipment</option>
            <option value="consumable">Medical Consumables</option>
          </select>
        </div>

        {/* Condition Checkboxes / Select */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Condition</label>
          <div className="flex gap-1.5">
            {["all", "new", "refurbished", "used"].map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => updateFilter("condition", cond)}
                className={`flex-1 rounded-md border py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filters.condition === cond
                    ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Regulatory Certifications */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>Certifications Required</span>
          </label>
          <select
            value={filters.certifications}
            onChange={(e) => updateFilter("certifications", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          >
            <option value="all">Any Accreditation</option>
            <option value="FDA">FDA Registered</option>
            <option value="CE">CE Compliant</option>
            <option value="ISO">ISO Certified</option>
            <option value="NIOSH">NIOSH Approved</option>
          </select>
        </div>

        {/* Maximum Minimum Order Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
            Max MOQ (Qty Constraints)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g. 10 (or lower)"
            value={filters.moq}
            onChange={(e) => updateFilter("moq", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
            <span>Price Range (USD)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
