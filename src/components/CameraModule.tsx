import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { RefreshCw, AlertCircle, Loader, CheckCircle2, ArrowLeft } from 'lucide-react';
import { reverseGeocode, generateGoogleMapsUrl } from '../utils/geocoding';
import { type GeotaggedPhoto } from '../utils/db';

interface CameraModuleProps {
  onPhotoReady: (photoData: Partial<GeotaggedPhoto> & { imageBlob: Blob }) => void;
  onCancel: () => void;
}

export const CameraModule: React.FC<CameraModuleProps> = ({ onPhotoReady, onCancel }) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | { exact: 'environment' }>('user');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'failed'>('idle');
  const [resolvedAddress, setResolvedAddress] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check camera permission
  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 0) {
          setHasPermission(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setHasPermission(false);
        setErrorMsg('Camera access was denied or is unavailable on this device.');
      });
  }, []);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? { exact: 'environment' } : 'user'));
  };

  // Convert Base64 DataURI to Blob
  const dataURItoBlob = (dataURI: string): Blob => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const capturePhoto = async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
    if (!screenshot) {
      setErrorMsg('Failed to capture image from camera stream.');
      return;
    }

    setCapturedImage(screenshot);
    await retrieveGeolocation(screenshot);
  };

  const retrieveGeolocation = async (imageSrc: string) => {
    if (!navigator.geolocation) {
      setLocationStatus('failed');
      setErrorMsg('Geolocation is not supported by your browser.');
      proceedWithPhoto(imageSrc, 0, 0, undefined);
      return;
    }

    setLocationStatus('fetching');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
        const gps = { latitude, longitude, accuracy, altitude: altitude || undefined, speed: speed || undefined, heading: heading || undefined };
        
        setGpsData(gps);
        setLocationStatus('success');

        try {
          const addr = await reverseGeocode(latitude, longitude);
          setResolvedAddress(addr);
          
          // Complete and call back
          const blob = dataURItoBlob(imageSrc);
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

          onPhotoReady({
            imageBlob: blob,
            latitude,
            longitude,
            accuracy,
            altitude: altitude || undefined,
            speed: speed || undefined,
            heading: heading || undefined,
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
            cameraMake: 'Webcam',
            cameraModel: 'Live Camera Capture',
          });
        } catch (err) {
          console.error(err);
          fallbackHandoff(imageSrc, latitude, longitude, accuracy);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationStatus('failed');
        // Fallback: Default to center/zero coordinates if permission denied
        fallbackHandoff(imageSrc, 0, 0, undefined);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fallbackHandoff = (imageSrc: string, lat: number, lon: number, accuracy?: number) => {
    const blob = dataURItoBlob(imageSrc);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    onPhotoReady({
      imageBlob: blob,
      latitude: lat,
      longitude: lon,
      accuracy,
      date: dateStr,
      time: timeStr,
      mapsUrl: generateGoogleMapsUrl(lat, lon),
      isFavorite: false,
      tags: [],
      notes: '',
      cameraMake: 'Webcam',
      cameraModel: 'Live Camera Capture (No GPS)',
    });
  };

  const proceedWithPhoto = (imageSrc: string, lat: number, lon: number, accuracy?: number) => {
    fallbackHandoff(imageSrc, lat, lon, accuracy);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto mt-12">
        <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Camera Permission Required</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Please enable camera access in your browser preferences to capture geotagged photos.
        </p>
        <button
          onClick={onCancel}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
        <button
          onClick={onCancel}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/20 transition backdrop-blur-md"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-lg">
          Live Capture
        </span>
      </div>

      {/* Viewfinder or Preview */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[400px]">
        {!capturedImage ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
            
            {/* Geolocation status overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              {locationStatus === 'fetching' && (
                <div className="flex flex-col items-center">
                  <Loader className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                  <h4 className="text-lg font-bold">Acquiring Satellites...</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Retrieving high-accuracy GPS coordinates and looking up address.
                  </p>
                </div>
              )}
              {locationStatus === 'success' && (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 animate-scaleUp" />
                  <h4 className="text-lg font-bold">Geotag Generated!</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    {gpsData?.latitude.toFixed(5)}, {gpsData?.longitude.toFixed(5)} (±{gpsData?.accuracy?.toFixed(1)}m)
                  </p>
                  <p className="text-xs text-slate-300 mt-2 max-w-sm px-4 italic line-clamp-2">
                    {resolvedAddress?.address}
                  </p>
                </div>
              )}
              {locationStatus === 'failed' && (
                <div className="flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
                  <h4 className="text-lg font-bold">GPS Coordinate Failure</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Could not resolve location. You can place a pin manually on the map editor in the next step.
                  </p>
                  <button
                    onClick={() => fallbackHandoff(capturedImage, 0, 0)}
                    className="mt-4 px-4 py-2 bg-amber-550 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Continue Without GPS
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warning notification */}
        {errorMsg && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-650/90 text-white p-3 rounded-xl border border-red-500/30 text-xs flex items-center gap-2.5 backdrop-blur z-40">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Control panel */}
      {!capturedImage && (
        <div className="bg-slate-950 p-6 flex justify-around items-center z-20 border-t border-slate-900">
          <button
            onClick={toggleCamera}
            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full transition-all text-slate-300 hover:text-white"
            title="Switch Camera"
          >
            <RefreshCw size={20} />
          </button>
          
          <button
            onClick={capturePhoto}
            className="w-16 h-16 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center shadow-2xl transition border-4 border-slate-800 relative hover:scale-105 active:scale-95"
            title="Capture"
          >
            <div className="w-6 h-6 bg-slate-950 rounded-full" />
          </button>
          
          <div className="w-12" /> {/* spacer to balance layout */}
        </div>
      )}
    </div>
  );
};
