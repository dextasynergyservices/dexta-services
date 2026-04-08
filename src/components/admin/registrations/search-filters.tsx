"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  search: string;
  role: string;
  sort: string;
  roles: string[];
  roleLabel?: string;
  roleValues?: { label: string; value: string }[];
  roleParamName?: string;
}

export function SearchFilters({
  search,
  role,
  sort,
  roles,
  roleLabel = "Role",
  roleValues,
  roleParamName = "role",
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      if (key !== "page") params.delete("page");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams("search", value), 300);
  };

  const items = roleValues ?? roles.map((r) => ({ label: r, value: r }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]" />
        <Input
          placeholder="Search by name or email..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-[#2a2a2a] bg-[#0d0d0d] pl-9 text-white placeholder-[#444]"
          aria-label="Search registrations"
        />
      </div>

      {/* Filter dropdown */}
      <Select
        value={role || "all"}
        onValueChange={(v) => updateParams(roleParamName, v === "all" ? "" : v)}
      >
        <SelectTrigger
          className="w-full border-[#2a2a2a] bg-[#0d0d0d] text-white sm:w-48"
          aria-label={`Filter by ${roleLabel.toLowerCase()}`}
        >
          <SelectValue placeholder={`All ${roleLabel.toLowerCase()}s`} />
        </SelectTrigger>
        <SelectContent className="border-[#2a2a2a] bg-[#111]">
          <SelectItem value="all" className="text-white">
            All {roleLabel.toLowerCase()}s
          </SelectItem>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="text-white"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateParams("sort", sort === "desc" ? "asc" : "desc")}
        className="border-[#2a2a2a] bg-[#0d0d0d] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
        aria-label={`Sort by date ${sort === "desc" ? "ascending" : "descending"}`}
      >
        <ArrowUpDown className="mr-2 h-4 w-4" />
        {sort === "desc" ? "Newest first" : "Oldest first"}
      </Button>

      {/* Export CSV */}
      <Button
        variant="outline"
        size="sm"
        asChild
        className="border-[#2a2a2a] bg-[#0d0d0d] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
      >
        <a
          href={`/admin/registrations/export?${searchParams.toString()}`}
          download
          aria-label="Export registrations as CSV"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </a>
      </Button>
    </div>
  );
}
