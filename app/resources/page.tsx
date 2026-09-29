'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ShieldCheck, RefreshCw } from 'lucide-react';
import { Resource, ResourceCategory } from '@/lib/types';
import { searchResources, ScoredResource } from '@/tools/resources';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceDetailModal } from '@/components/resources/ResourceDetailModal';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as ResourceCategory) || 'all';
  const initialQuery = searchParams.get('q') || '';

  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [resources, setResources] = useState<ScoredResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories: { key: ResourceCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Resources' },
    { key: 'utility_assistance', label: t.categories.utility_assistance },
    { key: 'food_assistance', label: t.categories.food_assistance },
    { key: 'housing', label: t.categories.housing },
    { key: 'healthcare', label: t.categories.healthcare },
    { key: 'jobs', label: t.categories.jobs },
    { key: 'transportation', label: t.categories.transportation },
    { key: 'childcare', label: t.categories.childcare },
    { key: 'other', label: t.categories.other },
  ];

  const performSearch = () => {
    startTransition(async () => {
      const results = await searchResources({
        query: searchQuery,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        language,
        maxResults: 20,
      });
      setResources(results);
    });
  };

  useEffect(() => {
    performSearch();
  }, [selectedCategory, language]);

  const handleSaveToPlan = (resource: Resource) => {
    try {
      const savedRaw = localStorage.getItem('nv_nexus_saved_plan_resources');
      const saved: string[] = savedRaw ? JSON.parse(savedRaw) : [];
      if (!saved.includes(resource.id)) {
        saved.push(resource.id);
        localStorage.setItem('nv_nexus_saved_plan_resources', JSON.stringify(saved));
      }
    } catch {
      // Storage unavailable
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Resource Directory
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified NV-04
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Authoritative, verified programs serving North Las Vegas and Clark County residents.
          </p>
        </div>

        {/* Search bar inside resources */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch();
          }}
          className="flex items-center gap-2 max-w-md w-full"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by program, service or zip..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-600 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold bg-civic-700 hover:bg-civic-800 text-white rounded-xl transition shadow-xs flex-shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat.key
                ? 'bg-civic-700 text-white border-civic-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Resource Results Grid */}
      {isPending ? (
        <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-civic-700" />
          <span className="text-xs font-medium">Filtering verified resources...</span>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onSelect={(res) => setSelectedResource(res)}
              onSaveToPlan={handleSaveToPlan}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-base font-semibold text-slate-700">No resources match your current filter.</p>
          <p className="text-xs text-slate-500">
            Try clearing your search query or selecting &quot;All Resources&quot; to see available North Las Vegas services.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-civic-700 text-white text-xs font-semibold rounded-lg hover:bg-civic-800 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onAddToActionPlan={handleSaveToPlan}
      />
    </div>
  );
}
