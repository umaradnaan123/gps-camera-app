import React, { useEffect, useRef, useState } from 'react';
import { Download, Sparkles, CheckSquare, Square } from 'lucide-react';
import { type GeotaggedPhoto } from '../utils/db';
import { writeExifToBlob } from '../utils/exifWriter';

interface OverlayGeneratorProps {
  photo: GeotaggedPhoto;
  onClose: () => void;
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-bottom';
type FontStyle = 'Outfit' | 'Inter' | 'monospace' | 'serif' | 'sans-serif';
type ThemeMode = 'light' | 'dark';

interface OverlayOptions {
  position: Position;
  fontFamily: FontStyle;
  fontSize: number; // base size (relative to 1000px width)
  theme: ThemeMode;
  bgOpacity: number;
  showMap: boolean;
  showCoords: boolean;
  showAddress: boolean;
  showDate: boolean;
  showProject: boolean;
  customWatermark: string;
  borderRadius: number;
}

// Helper to convert lat/lon to OpenStreetMap tile coordinates (zoom level 15)
function getTileCoords(lat: number, lon: number, zoom: number = 15) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export const OverlayGenerator: React.FC<OverlayGeneratorProps> = ({ photo, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mapTileImage, setMapTileImage] = useState<HTMLImageElement | null>(null);

  const [options, setOptions] = useState<OverlayOptions>({
    position: 'bottom-left',
    fontFamily: 'Outfit',
    fontSize: 16,
    theme: 'dark',
    bgOpacity: 0.65,
    showMap: true,
    showCoords: true,
    showAddress: true,
    showDate: true,
    showProject: true,
    customWatermark: 'GEO-VERIFIED RECORD',
    borderRadius: 16,
  });

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load Main Image
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(photo.imageBlob);
    img.src = url;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photo.imageBlob]);

  // Load Map Tile Image
  useEffect(() => {
    const coords = getTileCoords(photo.latitude, photo.longitude, 15);
    const tileUrl = `https://tile.openstreetmap.org/15/${coords.x}/${coords.y}.png`;
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent tainted canvas
    img.src = tileUrl;
    img.onload = () => {
      setMapTileImage(img);
    };
    img.onerror = () => {
      console.warn('Failed to load OpenStreetMap tile image');
    };
  }, [photo.latitude, photo.longitude]);

  // Draw on Canvas
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // 1. Draw base photo
    ctx.drawImage(img, 0, 0);

    // 2. Set theme parameters
    const isDark = options.theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#0f172a';
    const subTextColor = isDark ? '#cbd5e1' : '#475569';
    const bgColor = isDark ? '#000000' : '#ffffff';
    
    // Scale parameters proportionally to image resolution (base = 1000px width)
    const scale = img.naturalWidth / 1000;
    const baseFontSize = options.fontSize * scale;
    const padding = 16 * scale;
    
    // Calculate dimensions of the information box
    const mapWidth = options.showMap && mapTileImage ? 120 * scale : 0;
    const mapHeight = options.showMap && mapTileImage ? 120 * scale : 0;
    const gap = 16 * scale;
    
    // Right side text width & lines
    const textStartOffset = options.showMap && mapTileImage ? mapWidth + gap : 0;
    const textWidth = 420 * scale; 
    const boxWidth = textStartOffset + textWidth + padding * 2;
    
    // Lines construction
    const fontTitle = `800 ${baseFontSize * 1.35}px ${options.fontFamily}`;
    const fontBody = `400 ${baseFontSize * 0.9}px ${options.fontFamily}`;
    const fontLabel = `650 ${baseFontSize * 0.75}px ${options.fontFamily}`;

    // Get time zone string
    let tzString = 'Local Time';
    try {
      tzString = Intl.DateTimeFormat().resolvedOptions().timeZone || 'GMT';
    } catch (e) {}

    // Calculate box height dynamically based on active fields
    const lineSpacing = baseFontSize * 1.3;
    let textLinesCount = 1; // Title
    if (options.showAddress) textLinesCount += 1.5; // Address takes up to 2 lines space
    if (options.showCoords) textLinesCount += 1;
    if (options.showDate) textLinesCount += 1;
    if (options.showProject && (photo.notes || options.customWatermark)) textLinesCount += 1;

    const textHeight = textLinesCount * lineSpacing;
    const boxHeight = Math.max(mapHeight, textHeight) + padding * 2;

    // Calculate position
    const margin = img.naturalWidth * 0.025; // 2.5% margin
    let x = margin;
    let y = margin;

    switch (options.position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-right':
        x = img.naturalWidth - boxWidth - margin;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = img.naturalHeight - boxHeight - margin;
        break;
      case 'bottom-right':
        x = img.naturalWidth - boxWidth - margin;
        y = img.naturalHeight - boxHeight - margin;
        break;
      case 'center-bottom':
        x = (img.naturalWidth - boxWidth) / 2;
        y = img.naturalHeight - boxHeight - margin;
        break;
    }

    // 3. Draw container glass box
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.globalAlpha = options.bgOpacity;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24 * scale;
    ctx.shadowOffsetY = 4 * scale;

    const r = options.borderRadius * scale;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + boxWidth - r, y);
    ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + r);
    ctx.lineTo(x + boxWidth, y + boxHeight - r);
    ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - r, y + boxHeight);
    ctx.lineTo(x + r, y + boxHeight);
    ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw a subtle border on the glass box
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + boxWidth - r, y);
    ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + r);
    ctx.lineTo(x + boxWidth, y + boxHeight - r);
    ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - r, y + boxHeight);
    ctx.lineTo(x + r, y + boxHeight);
    ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 4. Draw Map Thumbnail (Left side)
    if (options.showMap && mapTileImage) {
      const mapX = x + padding;
      const mapY = y + padding + (boxHeight - padding * 2 - mapHeight) / 2;

      ctx.save();
      // Draw rounded mask for the map thumbnail
      const mapRadius = 8 * scale;
      ctx.beginPath();
      ctx.moveTo(mapX + mapRadius, mapY);
      ctx.lineTo(mapX + mapWidth - mapRadius, mapY);
      ctx.quadraticCurveTo(mapX + mapWidth, mapY, mapX + mapWidth, mapY + mapRadius);
      ctx.lineTo(mapX + mapWidth, mapY + mapHeight - mapRadius);
      ctx.quadraticCurveTo(mapX + mapWidth, mapY + mapHeight, mapX + mapWidth - mapRadius, mapY + mapHeight);
      ctx.lineTo(mapX + mapRadius, mapY + mapHeight);
      ctx.quadraticCurveTo(mapX, mapY + mapHeight, mapX, mapY + mapHeight - mapRadius);
      ctx.lineTo(mapX, mapY + mapRadius);
      ctx.quadraticCurveTo(mapX, mapY, mapX + mapRadius, mapY);
      ctx.closePath();
      ctx.clip();

      // Draw tile image
      ctx.drawImage(mapTileImage, mapX, mapY, mapWidth, mapHeight);

      // Restore clip context
      ctx.restore();

      // Draw Marker Pin in the middle of the tile map
      ctx.save();
      const pinX = mapX + mapWidth / 2;
      const pinY = mapY + mapHeight / 2;
      
      // Draw pin outline/shadow
      ctx.fillStyle = '#ef4444'; // Red Pin
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4 * scale;
      ctx.shadowOffsetY = 1 * scale;
      
      ctx.beginPath();
      ctx.arc(pinX, pinY - 10 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pin stem
      ctx.beginPath();
      ctx.moveTo(pinX - 4 * scale, pinY - 9 * scale);
      ctx.lineTo(pinX, pinY);
      ctx.lineTo(pinX + 4 * scale, pinY - 9 * scale);
      ctx.closePath();
      ctx.fill();
      
      // Draw inner pin white dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pinX, pinY - 10 * scale, 1.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Location Metadata Text (Right side)
    ctx.save();
    ctx.textBaseline = 'top';

    const textX = x + padding + textStartOffset;
    let currentY = y + padding;

    // Line 1: Header / Location City Name (Bold & Large)
    ctx.font = fontTitle;
    ctx.fillStyle = textColor;
    const locationTitle = photo.city || photo.state || photo.country || 'Field Survey Position';
    const cityState = photo.city && photo.state ? `${photo.city}, ${photo.state}` : locationTitle;
    ctx.fillText(cityState, textX, currentY);
    currentY += lineSpacing * 1.3;

    // Line 2: Full Address (Smaller wrap)
    if (options.showAddress && photo.address) {
      ctx.font = fontBody;
      ctx.fillStyle = subTextColor;
      
      // Split address text into two lines if it overflows
      const maxCharCount = 42;
      if (photo.address.length > maxCharCount) {
        const line1 = photo.address.substring(0, maxCharCount);
        let line2 = photo.address.substring(maxCharCount);
        if (line2.length > maxCharCount) line2 = line2.substring(0, maxCharCount) + '...';
        ctx.fillText(line1, textX, currentY);
        currentY += lineSpacing * 0.9;
        ctx.fillText(line2, textX, currentY);
        currentY += lineSpacing * 1.0;
      } else {
        ctx.fillText(photo.address, textX, currentY);
        currentY += lineSpacing * 1.1;
      }
    }

    // Line 3: Coordinates & Accuracy
    if (options.showCoords) {
      ctx.font = fontBody;
      ctx.fillStyle = textColor;
      let coordString = `GPS: ${photo.latitude.toFixed(6)}° N, ${photo.longitude.toFixed(6)}° E`;
      if (photo.accuracy) {
        coordString += ` (±${photo.accuracy.toFixed(1)}m)`;
      }
      ctx.fillText(coordString, textX, currentY);
      currentY += lineSpacing;
    }

    // Line 4: Date & Time & Time Zone
    if (options.showDate) {
      ctx.font = fontBody;
      ctx.fillStyle = subTextColor;
      const dateTimeString = `${photo.date}  ${photo.time} (${tzString})`;
      ctx.fillText(dateTimeString, textX, currentY);
      currentY += lineSpacing;
    }

    // Line 5: Project Watermark / Notes
    if (options.showProject && (photo.notes || options.customWatermark)) {
      ctx.font = fontLabel;
      ctx.fillStyle = '#10b981'; // Emerald tag highlight
      const customLabel = options.customWatermark 
        ? `${options.customWatermark}${photo.notes ? ` : ${photo.notes}` : ''}`
        : photo.notes;
      const truncatedLabel = customLabel && customLabel.length > 50 
        ? customLabel.substring(0, 48) + '...'
        : customLabel;
      if (truncatedLabel) {
        ctx.fillText(truncatedLabel.toUpperCase(), textX, currentY);
      }
    }

    ctx.restore();

  }, [imageLoaded, mapTileImage, options, photo]);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const canvasDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    
    const response = await fetch(canvasDataUrl);
    const canvasBlob = await response.blob();
    
    // Inject coordinates as binary EXIF headers
    const updatedBlob = await writeExifToBlob(canvasBlob, photo.latitude, photo.longitude, {
      date: photo.date,
      time: photo.time,
      make: photo.cameraMake,
      model: photo.cameraModel,
    });

    const downloadUrl = URL.createObjectURL(updatedBlob);
    const link = document.createElement('a');
    link.download = `stamped_${photo.id || 'image'}.jpg`;
    link.href = downloadUrl;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const toggleOption = (key: keyof OverlayOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] } as any));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col md:flex-row h-full overflow-hidden">
      {/* Canvas workspace (Left side) */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-6 bg-slate-950 overflow-hidden relative">
        {!imageLoaded ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm text-slate-400 font-semibold">Generating layout preview...</span>
          </div>
        ) : (
          <div className="max-w-full max-h-full flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-[70vh] md:max-h-[85vh] rounded-xl shadow-2xl border border-slate-800 object-contain" />
          </div>
        )}
      </div>

      {/* Control Configuration Panel (Right side) */}
      <div className="w-full md:w-96 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col h-[50vh] md:h-full text-slate-800 dark:text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Stamp GPS Watermark</h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>

        {/* Options Content Scroll area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Position Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stamp Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-bottom'] as Position[]).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, position: pos }))}
                  className={`py-1.5 text-center text-[10px] font-bold rounded-lg border transition-all ${
                    options.position === pos
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overlay Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, theme: mode }))}
                  className={`py-1.5 text-center text-xs font-semibold rounded-lg border transition-all uppercase ${
                    options.theme === mode
                      ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Enabled Fields</label>
            <div className="space-y-2">
              {[
                { label: 'Map Thumbnail', key: 'showMap' },
                { label: 'GPS Coordinates', key: 'showCoords' },
                { label: 'Full Address Details', key: 'showAddress' },
                { label: 'Capture Date & Time', key: 'showDate' },
                { label: 'Project Info Tags', key: 'showProject' },
              ].map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => toggleOption(field.key as any)}
                  className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 w-full text-left"
                >
                  {options[field.key as keyof OverlayOptions] ? (
                    <CheckSquare size={16} className="text-violet-500" />
                  ) : (
                    <Square size={16} className="text-slate-400" />
                  )}
                  <span>{field.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Watermark input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custom Watermark / Logo Text</label>
            <input
              type="text"
              placeholder="e.g. PROPERTY INSPECTION..."
              value={options.customWatermark}
              onChange={(e) => setOptions((prev) => ({ ...prev, customWatermark: e.target.value }))}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Stylings */}
          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
            {/* Font Family */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Font Family</span>
              <select
                value={options.fontFamily}
                onChange={(e) => setOptions((prev) => ({ ...prev, fontFamily: e.target.value as FontStyle }))}
                className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 outline-none text-slate-850 dark:text-slate-200"
              >
                <option value="Outfit">Outfit (Default)</option>
                <option value="Inter">Inter</option>
                <option value="monospace">Monospace</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">System Sans</option>
              </select>
            </div>

            {/* Font Size slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Text Size</span>
                <span className="font-mono text-slate-505">{options.fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="32"
                value={options.fontSize}
                onChange={(e) => setOptions((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-650"
              />
            </div>

            {/* Background Opacity */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Box Opacity</span>
                <span className="font-mono text-slate-505">{Math.round(options.bgOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={options.bgOpacity}
                onChange={(e) => setOptions((prev) => ({ ...prev, bgOpacity: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-655"
              />
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 bg-brand-500 hover:bg-brand-650 text-white rounded-xl shadow-lg transition duration-150 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Download size={14} /> Export Geotagged Photo
          </button>
        </div>
      </div>
    </div>
  );
};
