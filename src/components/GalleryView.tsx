import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Heart, Calendar, MapPin, Tag, ArrowUpDown, Download, CheckSquare, Square, Trash2, FileSpreadsheet, Loader } from 'lucide-react';
import { type GeotaggedPhoto, getAllPhotos, toggleFavorite, deletePhoto } from '../utils/db';

interface GalleryViewProps {
  onEditPhoto: (photo: GeotaggedPhoto) => void;
}

type ViewMode = 'grid' | 'list';
type SortField = 'date-desc' | 'date-asc' | 'city' | 'country' | 'favorite';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export const GalleryView: React.FC<GalleryViewProps> = ({ onEditPhoto }) => {
  const [photos, setPhotos] = useState<GeotaggedPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GeotaggedPhoto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date-desc');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // Batch processing
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Runtime Blob URLs cache
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  const loadPhotos = async () => {
    try {
      const data = await getAllPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // Generate blob URLs when photos change to avoid rebuilding them constantly
  useEffect(() => {
    const urls: Record<string, string> = {};
    photos.forEach((photo) => {
      urls[photo.id] = URL.createObjectURL(photo.imageBlob);
    });
    setBlobUrls(urls);

    return () => {
      // Clean up previous urls to prevent memory leaks
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // Apply filters and searches
  useEffect(() => {
    let result = [...photos];

    // Search query query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchNotes = p.notes?.toLowerCase().includes(query);
        const matchAddress = p.address?.toLowerCase().includes(query);
        const matchCity = p.city?.toLowerCase().includes(query);
        const matchCountry = p.country?.toLowerCase().includes(query);
        const matchLat = p.latitude.toString().includes(query);
        const matchLon = p.longitude.toString().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        return matchNotes || matchAddress || matchCity || matchCountry || matchLat || matchLon || matchTags;
      });
    }

    // Favorites Filter
    if (onlyFavorites) {
      result = result.filter((p) => p.isFavorite);
    }

    // Date range Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter((p) => {
        const photoDate = new Date(p.date);
        if (isNaN(photoDate.getTime())) return false;
        
        const diffTime = Math.abs(now.getTime() - photoDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') return diffDays <= 1;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortField === 'date-desc') {
        return new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime();
      }
      if (sortField === 'date-asc') {
        return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
      }
      if (sortField === 'city') {
        return (a.city || '').localeCompare(b.city || '');
      }
      if (sortField === 'country') {
        return (a.country || '').localeCompare(b.country || '');
      }
      if (sortField === 'favorite') {
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
      }
      return 0;
    });

    setFilteredPhotos(result);
  }, [photos, searchQuery, sortField, dateFilter, onlyFavorites, selectedTag]);

  // Aggregate all tags for filter dropdown
  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags)));

  const handleFavoriteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await toggleFavorite(id);
      loadPhotos();
    } catch (err) {
      console.error(err);
    }
  };

  // Batch Select Logic
  const handleSelectPhoto = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPhotos.map((p) => p.id));
    }
  };

  // Batch Export CSV
  const handleExportCSV = () => {
    const targets = photos.filter((p) => selectedIds.includes(p.id));
    if (targets.length === 0) return;

    // Headers
    const headers = ['ID', 'Latitude', 'Longitude', 'Accuracy', 'Address', 'City', 'State', 'Country', 'PostalCode', 'Date', 'Time', 'Notes', 'Tags', 'MapsURL'];
    
    // Rows
    const rows = targets.map((p) => [
      p.id,
      p.latitude,
      p.longitude,
      p.accuracy || '',
      `"${(p.address || '').replace(/"/g, '""')}"`,
      `"${(p.city || '').replace(/"/g, '""')}"`,
      `"${(p.state || '').replace(/"/g, '""')}"`,
      `"${(p.country || '').replace(/"/g, '""')}"`,
      p.postalCode || '',
      p.date,
      p.time,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${p.tags.join(', ')}"`,
      p.mapsUrl,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `geotags_export_${Date.now()}.csv`);
    link.click();
  };

  // Batch Export JSON
  const handleExportJSON = () => {
    const targets = photos.filter((p) => selectedIds.includes(p.id));
    if (targets.length === 0) return;

    const sanitized = targets.map(({ imageBlob, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `geotags_export_${Date.now()}.json`);
    link.click();
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) {
      try {
        for (const id of selectedIds) {
          await deletePhoto(id);
        }
        setSelectedIds([]);
        setIsBatchMode(false);
        loadPhotos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Row 1: Search and Grid/List toggles */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search by address, tags, notes, coordinates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold py-3 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'border-brand-500 bg-brand-50 text-brand-655 dark:bg-brand-950/20 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl border transition-all ${
                viewMode === 'list'
                  ? 'border-brand-500 bg-brand-50 text-brand-655 dark:bg-brand-950/20 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Row 2: Filtering pill items */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Filter Date Preset */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
              <Calendar size={12} className="text-violet-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-305 outline-none border-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Filter tags dropdown */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                <Tag size={12} className="text-violet-500" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-305 outline-none border-none cursor-pointer"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort fields dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
              <ArrowUpDown size={12} className="text-violet-500" />
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-305 outline-none border-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="city">City Name</option>
                <option value="country">Country</option>
                <option value="favorite">Favorites First</option>
              </select>
            </div>

            {/* Toggle Only Favorites */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                onlyFavorites
                  ? 'border-red-200 bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Heart size={12} className={onlyFavorites ? 'fill-red-500 text-red-500' : ''} />
              <span>Favorites Only</span>
            </button>
          </div>

          {/* Batch Processing Toggle */}
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                isBatchMode
                  ? 'border-brand-500 bg-brand-50 text-brand-655 dark:bg-brand-950/20 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              {isBatchMode ? 'Cancel Batch' : 'Batch Select'}
            </button>
          </div>
        </div>

        {/* Row 3: Batch Actions panel (only if batch mode is active) */}
        {isBatchMode && (
          <div className="bg-brand-50/50 dark:bg-slate-950 border border-brand-100 dark:border-brand-900/30 rounded-xl p-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 hover:text-brand-600 transition"
              >
                {selectedIds.length === filteredPhotos.length ? (
                  <CheckSquare size={16} className="text-violet-500" />
                ) : (
                  <Square size={16} />
                )}
                <span>Select All ({selectedIds.length} of {filteredPhotos.length})</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={selectedIds.length === 0}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet size={13} className="text-emerald-500" />
                <span>Export CSV</span>
              </button>
              
              <button
                onClick={handleExportJSON}
                disabled={selectedIds.length === 0}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-[11px] font-bold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition"
              >
                <Download size={13} className="text-violet-500" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.length === 0}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 disabled:opacity-50 text-[11px] font-bold text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-1.5 transition"
              >
                <Trash2 size={13} />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid or List of Geotagged Photos */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-md mx-auto">
          <MapPin size={48} className="text-slate-300 dark:text-slate-650 mx-auto mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Geotag Records Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-405 mt-2">
            Try adjusting your search queries or filter categories, or start capturing new geotagged photos using the camera!
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => !isBatchMode && onEditPhoto(photo)}
              className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col relative ${
                isBatchMode && selectedIds.includes(photo.id)
                  ? 'border-brand-500 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Image section */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-850">
                {blobUrls[photo.id] ? (
                  <img
                    src={blobUrls[photo.id]}
                    alt={photo.notes || 'Geotagged image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Loader className="w-6 h-6 animate-spin" />
                  </div>
                )}

                {/* Batch selection checkbox overlay */}
                {isBatchMode && (
                  <button
                    onClick={(e) => handleSelectPhoto(e, photo.id)}
                    className="absolute top-2.5 left-2.5 z-20 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg shadow-md border border-slate-200/50 dark:border-slate-800"
                  >
                    {selectedIds.includes(photo.id) ? (
                      <CheckSquare size={16} className="text-violet-500" />
                    ) : (
                      <Square size={16} className="text-slate-400" />
                    )}
                  </button>
                )}

                {/* Favorite toggle overlay */}
                <button
                  type="button"
                  onClick={(e) => handleFavoriteClick(e, photo.id)}
                  className="absolute top-2.5 right-2.5 z-20 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full shadow-md border border-slate-200/50 dark:border-slate-800 hover:scale-110 active:scale-95 transition"
                >
                  <Heart
                    size={14}
                    className={photo.isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500'}
                  />
                </button>

                {/* Latitude / longitude tag HUD */}
                <div className="absolute bottom-2 left-2 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-[9px] font-mono font-semibold text-white">
                  {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </div>
              </div>

              {/* Data attributes section */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>{photo.date}</span>
                    <span>{photo.time}</span>
                  </div>
                  
                  {/* Address Location detail */}
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate flex items-center gap-1">
                    <MapPin size={12} className="text-violet-500 flex-shrink-0" />
                    <span>{photo.city || photo.country ? `${photo.city || 'Coordinates'}, ${photo.country || ''}` : 'No resolved address'}</span>
                  </h4>

                  {/* Notes Description snippet */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 italic">
                    {photo.notes || 'No description notes saved.'}
                  </p>
                </div>

                {/* Tags collection */}
                {photo.tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-1">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850"
                      >
                        {tag}
                      </span>
                    ))}
                    {photo.tags.length > 3 && (
                      <span className="text-[8px] font-black bg-slate-50 dark:bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                        +{photo.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List layout mode */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => !isBatchMode && onEditPhoto(photo)}
              className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${
                isBatchMode && selectedIds.includes(photo.id)
                  ? 'bg-brand-50/20 dark:bg-brand-950/10'
                  : ''
              }`}
            >
              {/* Checkbox (if batch mode) */}
              {isBatchMode && (
                <button
                  onClick={(e) => handleSelectPhoto(e, photo.id)}
                  className="p-1 text-slate-400 hover:text-brand-500"
                >
                  {selectedIds.includes(photo.id) ? (
                    <CheckSquare size={18} className="text-violet-500" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              )}

              {/* Mini photo preview */}
              <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-200/50 dark:border-slate-800">
                {blobUrls[photo.id] && (
                  <img src={blobUrls[photo.id]} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Data parameters */}
              <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate flex items-center gap-1">
                    <MapPin size={12} className="text-violet-550 flex-shrink-0" />
                    <span className="truncate">{photo.address || `${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`}</span>
                  </h4>
                  <p className="text-[10px] text-slate-455 truncate italic mt-0.5">{photo.notes || 'No description notes.'}</p>
                </div>
                
                <div className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  <span>{photo.date} {photo.time}</span>
                </div>

                {/* Tags list */}
                <div className="flex flex-wrap gap-1">
                  {photo.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[8px] font-bold bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-850"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Favorite button */}
              <button
                type="button"
                onClick={(e) => handleFavoriteClick(e, photo.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-all hover:scale-105 active:scale-95"
              >
                <Heart size={14} className={photo.isFavorite ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
