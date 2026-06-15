import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Compass } from 'lucide-react';
import { searchAddress } from '../utils/geocoding';

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lon: number) => void;
  readOnly?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  onLocationChange,
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ lat: number; lon: number; display_name: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Custom styling for the Pin icon using Tailwind CSS classes in an SVG
  const pinIcon = L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white shadow-xl border-2 border-white transform transition-transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    className: 'custom-map-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Leaflet map centered at coordinates
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      zoomControl: !readOnly,
      attributionControl: false,
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add drag marker if editable, otherwise fixed marker
    const marker = L.marker([latitude, longitude], {
      icon: pinIcon,
      draggable: !readOnly,
    }).addTo(map);

    if (!readOnly && onLocationChange) {
      // Coordinate update on drag end
      marker.on('dragend', (e) => {
        const markerTarget = e.target;
        const position = markerTarget.getLatLng();
        onLocationChange(position.lat, position.lng);
      });

      // Coordinate update on map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onLocationChange(lat, lng);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map marker when latitude/longitude coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const currentCenter = mapRef.current.getCenter();
      const newPos: L.LatLngExpression = [latitude, longitude];
      
      markerRef.current.setLatLng(newPos);
      
      // Only fly/pan to if coordinates are significantly different to prevent camera loop during drag
      const latDiff = Math.abs(currentCenter.lat - latitude);
      const lngDiff = Math.abs(currentCenter.lng - longitude);
      if (latDiff > 0.001 || lngDiff > 0.001) {
        mapRef.current.setView(newPos, mapRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  // Handle address searches
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: { lat: number; lon: number }) => {
    if (onLocationChange) {
      onLocationChange(res.lat, res.lon);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
      {/* Map Content Container */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

      {/* Address Search Overlay (if not readOnly) */}
      {!readOnly && (
        <div className="absolute top-3 left-3 right-3 md:left-3 md:right-auto md:w-80 z-20">
          <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/50 dark:border-slate-700/50">
            <input
              type="text"
              placeholder="Search location/address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit();
                }
              }}
              className="w-full py-2 px-3 pr-10 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSearchSubmit();
              }}
              className="absolute right-2 p-1 text-slate-500 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              disabled={isSearching}
            >
              <Search size={16} className={isSearching ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Search Result Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl z-50 divide-y divide-slate-100 dark:divide-slate-850">
              {searchResults.map((res, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2 transition-colors"
                >
                  <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coordinate HUD (Lower HUD indicator) */}
      <div className="absolute bottom-3 left-3 z-20 flex gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-md text-slate-700 dark:text-slate-350 border border-slate-200/40 dark:border-slate-800/40">
          <Compass size={12} className="text-violet-500 animate-pulse" />
          <span>{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
};
