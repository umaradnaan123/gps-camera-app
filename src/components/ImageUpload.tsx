import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ShieldAlert, Loader } from 'lucide-react';
import exifr from 'exifr';
import { reverseGeocode, generateGoogleMapsUrl } from '../utils/geocoding';
import { type GeotaggedPhoto } from '../utils/db';

interface ImageUploadProps {
  onPhotoReady: (photoData: Partial<GeotaggedPhoto> & { imageBlob: Blob }) => void;
  onCancel: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onPhotoReady, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setStatusText('Reading image file...');

    try {
      // 1. Extract GPS data from EXIF using exifr
      setStatusText('Reading EXIF metadata tags...');
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        const gps = await exifr.gps(file);
        if (gps) {
          latitude = gps.latitude;
          longitude = gps.longitude;
        }
      } catch (exifErr) {
        console.warn('Failed to parse EXIF GPS data:', exifErr);
      }

      // 2. Extract camera make, model, date
      let cameraMake = 'Unknown';
      let cameraModel = 'Unknown';
      let dateStr = new Date().toISOString().split('T')[0];
      let timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
      let resolution = 'Unknown';

      try {
        const metadata = await exifr.parse(file, {
          pick: ['Make', 'Model', 'DateTimeOriginal', 'ExifImageWidth', 'ExifImageHeight'],
        });

        if (metadata) {
          if (metadata.Make) cameraMake = metadata.Make;
          if (metadata.Model) cameraModel = metadata.Model;
          if (metadata.DateTimeOriginal) {
            const d = new Date(metadata.DateTimeOriginal);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().split('T')[0];
              timeStr = d.toTimeString().split(' ')[0].substring(0, 5);
            }
          }
          if (metadata.ExifImageWidth && metadata.ExifImageHeight) {
            resolution = `${metadata.ExifImageWidth} x ${metadata.ExifImageHeight}`;
          }
        }
      } catch (err) {
        console.warn('Failed to parse other EXIF tags:', err);
      }

      // 3. Fallback GPS logic if GPS is not present
      if (latitude === undefined || longitude === undefined) {
        setStatusText('No GPS tags found in photo. Querying device location...');
        
        const getFallbackCoords = (): Promise<{ latitude: number; longitude: number }> => {
          return new Promise((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve({ latitude: 0, longitude: 0 }),
                { enableHighAccuracy: true, timeout: 5000 }
              );
            } else {
              resolve({ latitude: 0, longitude: 0 });
            }
          });
        };

        const fallback = await getFallbackCoords();
        latitude = fallback.latitude;
        longitude = fallback.longitude;
      }

      // 4. Reverse Geocode the location
      setStatusText('Resolving reverse-geocoding address details...');
      const addr = await reverseGeocode(latitude, longitude);

      // Return geotag data
      onPhotoReady({
        imageBlob: file,
        latitude,
        longitude,
        address: addr.address,
        houseNumber: addr.houseNumber,
        street: addr.street,
        area: addr.area,
        locality: addr.locality,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        postalCode: addr.postalCode,
        date: dateStr,
        time: timeStr,
        mapsUrl: generateGoogleMapsUrl(latitude, longitude),
        isFavorite: false,
        tags: [],
        notes: '',
        cameraMake,
        cameraModel,
        resolution,
      });

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'An error occurred while processing the image file.');
    } finally {
      setIsProcessing(false);
    }
  }, [onPhotoReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors duration-200">
      <h3 className="text-xl font-extrabold text-slate-850 dark:text-slate-100 mb-2">Upload Photo</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Drag and drop your JPEG, PNG, or WebP files here. We will read any embedded EXIF location metadata tags automatically.
      </p>

      {/* Drag Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
          isDragActive
            ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 scale-[0.99]'
            : 'border-slate-350 dark:border-slate-800 hover:border-brand-400 hover:bg-slate-50/50 dark:hover:bg-slate-850/50'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader className="w-12 h-12 text-brand-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{statusText}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-violet-50 dark:bg-slate-800 rounded-full text-brand-550 dark:text-brand-400 mb-4 shadow-md">
              <Upload size={32} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              {isDragActive ? 'Drop your image here' : 'Drag & drop image file, or click to browse'}
            </p>
            <p className="text-xs text-slate-400">Supports JPG, JPEG, PNG, WEBP files up to 25MB</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/35 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs flex items-start gap-2.5">
          <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
