import React, { useState, useEffect } from 'react';
import { Save, Trash2, Download, Share2, Calendar, Clock, Tag, Sparkles, FileJson, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type GeotaggedPhoto, savePhoto, deletePhoto } from '../utils/db';
import { InteractiveMap } from './InteractiveMap';
import { reverseGeocode, generateGoogleMapsUrl } from '../utils/geocoding';
import { OverlayGenerator } from './OverlayGenerator';
import { writeExifToBlob } from '../utils/exifWriter';

interface MetadataEditorProps {
  initialPhoto: Partial<GeotaggedPhoto> & { imageBlob: Blob };
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  initialPhoto,
  onSave,
  onCancel,
  isNew = false,
}) => {
  const [photo, setPhoto] = useState<GeotaggedPhoto>({
    id: initialPhoto.id || `photo_${Date.now()}`,
    imageBlob: initialPhoto.imageBlob,
    latitude: initialPhoto.latitude ?? 0,
    longitude: initialPhoto.longitude ?? 0,
    accuracy: initialPhoto.accuracy,
    altitude: initialPhoto.altitude,
    speed: initialPhoto.speed,
    heading: initialPhoto.heading,
    address: initialPhoto.address || '',
    houseNumber: initialPhoto.houseNumber || '',
    street: initialPhoto.street || '',
    area: initialPhoto.area || '',
    locality: initialPhoto.locality || '',
    city: initialPhoto.city || '',
    state: initialPhoto.state || '',
    country: initialPhoto.country || '',
    postalCode: initialPhoto.postalCode || '',
    date: initialPhoto.date || new Date().toISOString().split('T')[0],
    time: initialPhoto.time || new Date().toTimeString().split(' ')[0].substring(0, 5),
    mapsUrl: initialPhoto.mapsUrl || '',
    notes: initialPhoto.notes || '',
    tags: initialPhoto.tags || [],
    isFavorite: initialPhoto.isFavorite || false,
    cameraMake: initialPhoto.cameraMake || 'Unknown',
    cameraModel: initialPhoto.cameraModel || 'Unknown',
    resolution: initialPhoto.resolution || 'Unknown',
  });

  const [imageUrl, setImageUrl] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showStampGenerator, setShowStampGenerator] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate blob URL for rendering
  useEffect(() => {
    const url = URL.createObjectURL(photo.imageBlob);
    setImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photo.imageBlob]);

  // Sync maps url when coords change
  useEffect(() => {
    setPhoto((prev) => ({
      ...prev,
      mapsUrl: generateGoogleMapsUrl(prev.latitude, prev.longitude),
    }));
  }, [photo.latitude, photo.longitude]);

  // Handle map coordinate alterations
  const handleLocationChange = async (lat: number, lon: number) => {
    setPhoto((prev) => ({ ...prev, latitude: lat, longitude: lon }));
    setIsGeocoding(true);
    try {
      const addr = await reverseGeocode(lat, lon);
      setPhoto((prev) => ({
        ...prev,
        address: addr.address,
        houseNumber: addr.houseNumber || '',
        street: addr.street || '',
        area: addr.area || '',
        locality: addr.locality || '',
        city: addr.city || '',
        state: addr.state || '',
        country: addr.country || '',
        postalCode: addr.postalCode || '',
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Inject updated EXIF location tags before saving to DB
      const updatedBlob = await writeExifToBlob(photo.imageBlob, photo.latitude, photo.longitude, {
        date: photo.date,
        time: photo.time,
        make: photo.cameraMake,
        model: photo.cameraModel,
      });

      const photoToSave = {
        ...photo,
        imageBlob: updatedBlob,
      };

      await savePhoto(photoToSave);
      
      // Fire celebration confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.8 },
        colors: ['#8b5cf6', '#c084fc', '#6366f1', '#10b981'],
      });

      onSave();
    } catch (err) {
      alert('Failed to save record.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this record? This cannot be undone.')) {
      try {
        await deletePhoto(photo.id);
        onSave();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Tag list helpers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!photo.tags.includes(newTag.trim())) {
        setPhoto((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()],
        }));
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPhoto((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleDownloadOriginal = async () => {
    try {
      setIsGeocoding(true); // show loader indicator or similar since map tile fetching/canvas drawing is async
      const { generateWatermarkedBlob } = await import('../utils/watermark');
      // Use options to match the requested look: dark theme with bottom information panel
      const stampedBlob = await generateWatermarkedBlob(photo, {
        position: 'center-bottom',
        theme: 'dark',
        bgOpacity: 0.75,
        showMap: true,
        showCoords: true,
        showAddress: true,
        showDate: true,
        showProject: true,
        customWatermark: 'GEO-VERIFIED SURVEY',
        borderRadius: 16,
      });
      const downloadUrl = URL.createObjectURL(stampedBlob);
      const link = document.createElement('a');
      link.download = `geotagged_${photo.id}.${photo.imageBlob.type.split('/')[1] || 'jpg'}`;
      link.href = downloadUrl;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export watermarked image:', err);
      alert('Failed to generate watermarked image.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleExportJSON = () => {
    const metadataCopy = { ...photo };
    // Omit binary blob for JSON textual download
    const { imageBlob, ...jsonMetadata } = metadataCopy;
    const blob = new Blob([JSON.stringify(jsonMetadata, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `metadata_${photo.id}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const file = new File([photo.imageBlob], `geotagged_photo.jpg`, { type: photo.imageBlob.type });
        await navigator.share({
          files: [file],
          title: 'Geotagged Photo',
          text: `Geotagged image at location: ${photo.address}. Maps: ${photo.mapsUrl}`,
        });
      } catch (err) {
        console.warn('Native share failed:', err);
      }
    } else {
      // Fallback copy link to maps
      navigator.clipboard.writeText(photo.mapsUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 transition-all duration-200">
      {/* Stamp Overlay Overlay popup */}
      {showStampGenerator && (
        <OverlayGenerator photo={photo} onClose={() => setShowStampGenerator(false)} />
      )}

      {/* Header breadcrumb bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="text-violet-500" />
            {isNew ? 'New Geotag Record' : 'Review & Manage Details'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Photo ID: <span className="font-mono text-slate-600 dark:text-slate-300">{photo.id}</span>
          </p>
        </div>
        <div className="flex gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition"
          >
            Go Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Workspace Column (Image & Map previews) - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Photo View */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md overflow-hidden">
            <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-150 dark:border-slate-850">
              {imageUrl && (
                <img src={imageUrl} alt="Geotag Preview" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Spec tags */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
              <div>Make: <span className="text-slate-800 dark:text-slate-200">{photo.cameraMake}</span></div>
              <div>Model: <span className="text-slate-800 dark:text-slate-200 text-right block truncate">{photo.cameraModel}</span></div>
              <div>Resolution: <span className="text-slate-800 dark:text-slate-200">{photo.resolution}</span></div>
              <div>Type: <span className="text-slate-800 dark:text-slate-200">{photo.imageBlob.type.replace('image/', '')}</span></div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download size={14} /> Photo
              </button>
              
              <button
                type="button"
                onClick={() => setShowStampGenerator(true)}
                className="flex-1 py-2 px-2.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 border border-brand-100 dark:border-brand-900/50 text-brand-600 dark:text-brand-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles size={14} /> Stamp Map
              </button>
              
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <FileJson size={14} /> EXIF JSON
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Copied Maps!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Interactive Location Pinning Map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Align Pin Position</span>
              {isGeocoding && <span className="text-[10px] text-violet-500 font-semibold animate-pulse">Reverse geocoding...</span>}
            </h4>
            
            <div className="h-64 w-full rounded-xl overflow-hidden relative">
              <InteractiveMap
                latitude={photo.latitude}
                longitude={photo.longitude}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>
        </div>

        {/* Right Form Inputs Column - 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            
            {/* Field Section: Coordinates coordinates */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">GPS Coordinates</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">LATITUDE</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={photo.latitude}
                    onChange={(e) => setPhoto((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">LONGITUDE</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={photo.longitude}
                    onChange={(e) => setPhoto((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Field Section: Geocoded Street details */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolved Address Details</label>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">FULL ADDRESS</span>
                  <textarea
                    rows={2}
                    value={photo.address}
                    onChange={(e) => setPhoto((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. 123 Main St, New York, NY"
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">STREET / ROAD</span>
                    <input
                      type="text"
                      value={photo.street}
                      onChange={(e) => setPhoto((prev) => ({ ...prev, street: e.target.value }))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">CITY / LOCALITY</span>
                    <input
                      type="text"
                      value={photo.city}
                      onChange={(e) => setPhoto((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">STATE / PROVINCE</span>
                    <input
                      type="text"
                      value={photo.state}
                      onChange={(e) => setPhoto((prev) => ({ ...prev, state: e.target.value }))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">ZIP / POSTAL CODE</span>
                    <input
                      type="text"
                      value={photo.postalCode}
                      onChange={(e) => setPhoto((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">COUNTRY</span>
                    <input
                      type="text"
                      value={photo.country}
                      onChange={(e) => setPhoto((prev) => ({ ...prev, country: e.target.value }))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Field Section: Capture Dates */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar size={12} className="text-violet-500" />
                  <span>Date Captured</span>
                </label>
                <input
                  type="date"
                  value={photo.date}
                  onChange={(e) => setPhoto((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock size={12} className="text-violet-500" />
                  <span>Time Captured</span>
                </label>
                <input
                  type="time"
                  value={photo.time}
                  onChange={(e) => setPhoto((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Field Section: Custom description notes */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Inspection Notes & Comments</label>
              <textarea
                rows={3}
                value={photo.notes}
                onChange={(e) => setPhoto((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Write any descriptions, notes, details..."
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
              />
            </div>

            {/* Field Section: Tags */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Search Tags</label>
              
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/20 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-md border border-brand-100 dark:border-brand-900/50"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 font-black text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <Tag size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Press Enter to add tags..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full text-xs font-semibold p-2.5 pl-9 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl outline-none focus:border-brand-500"
                />
              </div>
            </div>
            
            {/* Form actions footer */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 flex gap-3">
              {!isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2.5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-xl transition font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete Record
                </button>
              )}
              
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-brand-500 hover:bg-brand-650 text-white rounded-xl shadow-lg transition duration-150 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Save size={14} /> Save Record & Details
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};
