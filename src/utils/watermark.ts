import { type GeotaggedPhoto } from './db';
import { writeExifToBlob } from './exifWriter';

export interface WatermarkOptions {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-bottom';
  fontFamily: string;
  fontSize: number;
  theme: 'light' | 'dark';
  bgOpacity: number;
  showMap: boolean;
  showCoords: boolean;
  showAddress: boolean;
  showDate: boolean;
  showProject: boolean;
  customWatermark: string;
  borderRadius: number;
}

// Convert coordinates to OpenStreetMap tile zoom level 15
function getTileCoords(lat: number, lon: number) {
  const zoom = 15;
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

// Fetch map tile image with CORS support
async function loadMapTile(lat: number, lon: number): Promise<HTMLImageElement | null> {
  const coords = getTileCoords(lat, lon);
  const tileUrl = `https://tile.openstreetmap.org/15/${coords.x}/${coords.y}.png`;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = tileUrl;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

// Unified Canvas Watermark Renderer
export async function drawWatermark(
  canvas: HTMLCanvasElement,
  photo: GeotaggedPhoto,
  options: WatermarkOptions,
  originalImage: HTMLImageElement,
  mapTile: HTMLImageElement | null
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = originalImage.naturalWidth;
  const h = originalImage.naturalHeight;

  canvas.width = w;
  canvas.height = h;

  // 1. Draw base photo
  ctx.drawImage(originalImage, 0, 0);

  // 2. Set theme parameters
  const isDark = options.theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const subTextColor = isDark ? '#cbd5e1' : '#475569';
  const bgColor = isDark ? '#000000' : '#ffffff';

  // Proportional sizing: base scaling against 1000px image width
  const scale = w / 1000;
  const padding = 20 * scale;

  // Overlay panel height: 20% of image height
  const boxHeight = Math.round(h * 0.20);
  // Overlay panel width: 90% of image width
  const boxWidth = Math.round(w * 0.90);

  // Map dimensions
  const mapWidth = options.showMap && mapTile ? Math.round(boxHeight - padding * 2) : 0;
  const mapHeight = options.showMap && mapTile ? Math.round(boxHeight - padding * 2) : 0;
  const gap = 20 * scale;

  // Position offsets
  const margin = Math.round(w * 0.05); // 5% margins to center the 90% card
  let x = margin;
  let y = h - boxHeight - margin; // default bottom center-bottom

  switch (options.position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = w - boxWidth - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = h - boxHeight - margin;
      break;
    case 'bottom-right':
      x = w - boxWidth - margin;
      y = h - boxHeight - margin;
      break;
    case 'center-bottom':
      x = (w - boxWidth) / 2;
      y = h - boxHeight - margin;
      break;
  }

  // 3. Native Glassmorphism Blur Effect
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = boxWidth;
    tempCanvas.height = boxHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      // Copy background pixels
      tempCtx.drawImage(canvas, x, y, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
      
      // Draw blurred image segment back
      ctx.save();
      ctx.filter = `blur(${15 * scale}px)`;
      ctx.drawImage(tempCanvas, x, y);
      ctx.restore();
    }
  } catch (err) {
    console.warn('Canvas blur effect bypassed:', err);
  }

  // 4. Draw card color plate overlay
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

  // Draw card border
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1.5 * scale;
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

  // 5. Draw Map Thumbnail (Left side)
  if (options.showMap && mapTile) {
    const mapX = x + padding;
    const mapY = y + padding;

    ctx.save();
    // Rounded corners mask
    const mapRadius = 10 * scale;
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

    ctx.drawImage(mapTile, mapX, mapY, mapWidth, mapHeight);
    ctx.restore();

    // Map GPS Pin Icon
    ctx.save();
    const pinX = mapX + mapWidth / 2;
    const pinY = mapY + mapHeight / 2;

    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4 * scale;

    ctx.beginPath();
    ctx.arc(pinX, pinY - 8 * scale, 4.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pinX - 3.5 * scale, pinY - 7.5 * scale);
    ctx.lineTo(pinX, pinY);
    ctx.lineTo(pinX + 3.5 * scale, pinY - 7.5 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pinX, pinY - 8 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 6. Draw details text metadata (Right side)
  ctx.save();
  ctx.textBaseline = 'top';

  const textX = x + padding + (options.showMap && mapTile ? mapWidth + gap : 0);
  const textWidth = boxWidth - padding * 2 - (options.showMap && mapTile ? mapWidth + gap : 0);
  
  // Calculate responsive font sizes based on boxHeight
  const titleSize = Math.max(12, Math.round(boxHeight * 0.16));
  const bodySize = Math.max(9, Math.round(boxHeight * 0.095));
  const lineSpacing = bodySize * 1.35;

  ctx.fillStyle = textColor;
  let currentY = y + padding;

  // Line 1: Bold Location Name
  ctx.font = `800 ${titleSize}px ${options.fontFamily}`;
  const locationTitle = photo.city || photo.state || photo.country || 'Field Survey Record';
  const cityState = photo.city && photo.state ? `${photo.city}, ${photo.state}` : locationTitle;
  ctx.fillText(cityState, textX, currentY);
  currentY += titleSize * 1.35;

  // Helper to split and wrap text
  const drawWrappedText = (text: string, font: string, fill: string) => {
    ctx.font = font;
    ctx.fillStyle = fill;
    
    // Simple wrap by character count proportional to width
    const maxChars = Math.floor(textWidth / (bodySize * 0.55));
    if (text.length > maxChars) {
      const p1 = text.substring(0, maxChars);
      let p2 = text.substring(maxChars);
      if (p2.length > maxChars) p2 = p2.substring(0, maxChars - 3) + '...';
      ctx.fillText(p1, textX, currentY);
      currentY += lineSpacing;
      ctx.fillText(p2, textX, currentY);
      currentY += lineSpacing;
    } else {
      ctx.fillText(text, textX, currentY);
      currentY += lineSpacing;
    }
  };

  // Line 2: Full Address
  if (options.showAddress && photo.address) {
    drawWrappedText(photo.address, `400 ${bodySize}px ${options.fontFamily}`, subTextColor);
  }

  // Line 3: Lat/Lon Coordinates
  if (options.showCoords) {
    let coordsText = `GPS: ${photo.latitude.toFixed(6)}° N, ${photo.longitude.toFixed(6)}° E`;
    if (photo.accuracy) coordsText += ` (Accuracy: ±${photo.accuracy.toFixed(1)}m)`;
    if (photo.altitude) coordsText += ` (Alt: ${photo.altitude.toFixed(1)}m)`;
    
    ctx.font = `500 ${bodySize}px ${options.fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.fillText(coordsText, textX, currentY);
    currentY += lineSpacing;
  }

  // Line 4: Dates & Times
  if (options.showDate) {
    let tzString = 'GMT';
    try {
      tzString = Intl.DateTimeFormat().resolvedOptions().timeZone || 'GMT';
    } catch (e) {}
    
    ctx.font = `400 ${bodySize}px ${options.fontFamily}`;
    ctx.fillStyle = subTextColor;
    ctx.fillText(`${photo.date}  ${photo.time} (${tzString})`, textX, currentY);
    currentY += lineSpacing;
  }

  // Line 5: Project note/watermark
  if (options.showProject && (photo.notes || options.customWatermark)) {
    const projectText = (options.customWatermark
      ? `${options.customWatermark.toUpperCase()}${photo.notes ? ` - ${photo.notes}` : ''}`
      : photo.notes) || '';
    
    ctx.font = `700 ${bodySize * 0.9}px ${options.fontFamily}`;
    ctx.fillStyle = '#10b981'; // Emerald highlight
    
    const maxChars = Math.floor(textWidth / (bodySize * 0.6));
    const finalProjectText = projectText.length > maxChars
      ? projectText.substring(0, maxChars - 3) + '...'
      : projectText;
      
    ctx.fillText(finalProjectText.toUpperCase(), textX, currentY);
  }

  ctx.restore();
}

// Generate the Stamped Image Blob directly in offscreen canvas
export async function generateWatermarkedBlob(
  photo: GeotaggedPhoto,
  options?: Partial<WatermarkOptions>
): Promise<Blob> {
  const defaultOptions: WatermarkOptions = {
    position: 'center-bottom',
    fontFamily: 'Outfit',
    fontSize: 16,
    theme: 'dark',
    bgOpacity: 0.65,
    showMap: true,
    showCoords: true,
    showAddress: true,
    showDate: true,
    showProject: true,
    customWatermark: 'GEO-VERIFIED SURVEY',
    borderRadius: 16,
    ...options,
  };

  return new Promise(async (resolve, reject) => {
    try {
      const originalImg = new Image();
      const imageUrl = URL.createObjectURL(photo.imageBlob);
      originalImg.src = imageUrl;
      
      originalImg.onload = async () => {
        const canvas = document.createElement('canvas');
        
        // Load map tile asynchronously
        let tileImage: HTMLImageElement | null = null;
        if (defaultOptions.showMap) {
          tileImage = await loadMapTile(photo.latitude, photo.longitude);
        }

        // Draw everything
        await drawWatermark(canvas, photo, defaultOptions, originalImg, tileImage);
        
        // Export to Blob
        canvas.toBlob(
          async (blob) => {
            URL.revokeObjectURL(imageUrl);
            if (blob) {
              // Inject binary GPS EXIF coordinates into output blob file
              const geotaggedBlob = await writeExifToBlob(blob, photo.latitude, photo.longitude, {
                date: photo.date,
                time: photo.time,
                make: photo.cameraMake,
                model: photo.cameraModel,
              });
              resolve(geotaggedBlob);
            } else {
              reject(new Error('Failed to generate Canvas blob'));
            }
          },
          'image/jpeg',
          0.95
        );
      };

      originalImg.onerror = (err) => {
        URL.revokeObjectURL(imageUrl);
        reject(err);
      };

    } catch (error) {
      reject(error);
    }
  });
}
