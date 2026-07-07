import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Star, Tag } from "lucide-react";

export default function DocumentFilters({ filters, onFilterChange, onClearFilters, userPlan = "free" }) {
  const documentTypes = [
    { value: "", label: "כל הסוגים" },
    { value: "employment_contract", label: "חוזה עבודה" },
    { value: "rental_agreement", label: "הסכם שכירות" },
    { value: "pay_slip", label: "תלוש שכר" },
    { value: "insurance_policy", label: "פוליסת ביטוח" },
    { value: "loan_agreement", label: "הסכם הלוואה" },
    { value: "purchase_agreement", label: "הסכם רכישה" },
    { value: "other", label: "אחר" }
  ];

  const statusOptions = [
    { value: "", label: "כל הסטטוסים" },
    { value: "uploaded", label: "הועלה" },
    { value: "analyzing", label: "מנתח" },
    { value: "analyzed", label: "נותח" },
    { value: "lawyer_requested", label: "נשלח לעו\"ד" },
    { value: "completed", label: "הושלם" }
  ];

  const sortOptions = [
    { value: "-created_date", label: "תאריך (חדש לישן)" },
    { value: "created_date", label: "תאריך (ישן לחדש)" },
    { value: "title", label: "שם (א-ת)" },
    { value: "-title", label: "שם (ת-א)" }
  ];

  const hasActiveFilters = filters.type || filters.status || filters.search || filters.favorites || filters.tag || filters.contentSearch;

  return (
    <div className="bg-white border border-[#E3E6EB] rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-[#2E6BDE]" />
        <h3 className="font-bold text-[#1A1F36]">סינון ומיון</h3>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="mr-auto text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
          >
            <X className="w-4 h-4 ml-1" />
            נקה סינונים
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* First Row - Main Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="חיפוש לפי שם..."
              className="pr-10"
            />
          </div>

        {/* Document Type */}
        <select
          value={filters.type || ""}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="h-10 px-3 bg-white border border-[#E3E6EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BDE]"
        >
          {documentTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="h-10 px-3 bg-white border border-[#E3E6EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BDE]"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

          {/* Sort */}
          <select
            value={filters.sort || "-created_date"}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="h-10 px-3 bg-white border border-[#E3E6EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BDE]"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Second Row - Advanced Filters - Pro & Business Only */}
        {(userPlan === "pro" || userPlan === "business" || userPlan === "beginner") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Content Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                value={filters.contentSearch || ""}
                onChange={(e) => onFilterChange({ ...filters, contentSearch: e.target.value })}
                placeholder="חיפוש בתוכן המסמך..."
                className="pr-10"
              />
            </div>

            {/* Tag Filter */}
            <Input
              value={filters.tag || ""}
              onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
              placeholder="סנן לפי תגית..."
              className="pr-10"
            />

            {/* Favorites Toggle */}
            <Button
              variant={filters.favorites ? "default" : "outline"}
              onClick={() => onFilterChange({ ...filters, favorites: !filters.favorites })}
              className={filters.favorites ? "bg-[#F59E0B] hover:bg-[#D97706] text-white" : "border-[#E3E6EB]"}
            >
              <Star className={`w-4 h-4 ml-2 ${filters.favorites ? 'fill-current' : ''}`} />
              מועדפים בלבד
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}