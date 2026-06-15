import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { type GeotaggedPhoto } from '../utils/db';

interface MultiMapProps {
  photos: GeotaggedPhoto[];
  onSelectPhoto?: (photo: GeotaggedPhoto) => void;
}

export const MultiMap: React.FC<MultiMapProps> = ({ photos, onSelectPhoto }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});

  // Clean custom Pin icon
  const pinIcon = L.divIcon({
    html: `
      <div class="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white shadow-md border border-white transform transition hover:scale-110">
        <div class="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
      </div>
    `,
    className: 'custom-multi-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Generate blob URLs for popup thumbnails
  useEffect(() => {
    const urls: Record<string, string> = {};
    photos.forEach((p) => {
      urls[p.id] = URL.createObjectURL(p.imageBlob);
    });
    setBlobUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center map around first photo or center [0,0]
    const defaultCenter: L.LatLngExpression = photos.length > 0
      ? [photos[0].latitude, photos[0].longitude]
      : [20, 0];
    const defaultZoom = photos.length > 0 ? 5 : 2;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map pins when photos update
  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    if (photos.length === 0) return;

    const bounds = L.latLngBounds([]);

    photos.forEach((photo) => {
      const marker = L.marker([photo.latitude, photo.longitude], {
        icon: pinIcon,
      });

      // Bind rich popup with image thumbnail preview
      const thumbUrl = blobUrls[photo.id] || '';
      const popupHtml = `
        <div class="p-1 max-w-[140px] text-xs font-sans text-slate-800 dark:text-slate-100">
          ${thumbUrl ? `<img src="${thumbUrl}" class="w-full h-18 object-cover rounded-md mb-1.5 border border-slate-200" />` : ''}
          <div class="font-bold truncate">${photo.city || 'Coordinates'}</div>
          <div class="text-[9px] text-slate-400 mt-0.5 font-semibold">${photo.date}</div>
          <div class="text-[9px] text-slate-500 line-clamp-1 italic mt-1">${photo.notes || ''}</div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        offset: [0, -5],
      });

      if (onSelectPhoto) {
        marker.on('click', () => {
          // Centering target photo
          mapRef.current?.setView([photo.latitude, photo.longitude], 13);
        });
      }

      marker.addTo(layerGroup);
      bounds.extend([photo.latitude, photo.longitude]);
    });

    // Fit bounds if multiple pins
    if (photos.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else if (photos.length === 1) {
      mapRef.current.setView([photos[0].latitude, photos[0].longitude], 10);
    }
  }, [photos, blobUrls]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />
    </div>
  );
};
