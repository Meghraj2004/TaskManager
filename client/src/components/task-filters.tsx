import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TaskFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function TaskFilters({ 
  activeFilter, 
  setActiveFilter, 
  searchTerm, 
  setSearchTerm 
}: TaskFiltersProps) {
  const filters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeFilter === filter.id
                  ? "bg-blue-100 text-primary"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
