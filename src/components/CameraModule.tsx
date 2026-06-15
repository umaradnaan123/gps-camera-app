import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { RefreshCw, AlertCircle, Loader, CheckCircle2, ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { reverseGeocode, generateGoogleMapsUrl } from '../utils/geocoding';
import { type GeotaggedPhoto } from '../utils/db';

interface CameraModuleProps {
  onPhotoReady: (photoData: Partial<GeotaggedPhoto> & { imageBlob: Blob }) => void;
  onCancel: () => void;
}

export const CameraModule: React.FC<CameraModuleProps> = ({ onPhotoReady, onCancel }) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
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

  // Check camera access initially
  useEffect(() => {
    console.log('[Camera] Checking device media inputs...');
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        console.log(`[Camera] Found ${videoDevices.length} video inputs.`);
        if (videoDevices.length > 0) {
          // Do not set permission to true yet, let the actual Webcam component trigger it
          if (hasPermission === null) {
            setHasPermission(null); 
          }
        } else {
          setHasPermission(false);
          setErrorMsg('No camera hardware detected on this device.');
        }
      })
      .catch((err) => {
        console.error('[Camera] enumerateDevices error:', err);
        setHasPermission(false);
        setErrorMsg('Camera access is blocked or unavailable on this device.');
      });
  }, []);

  const toggleCamera = () => {
    console.log('[Camera] Toggling camera facing mode...');
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
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
    if (!webcamRef.current) {
      console.warn('[Camera] Shutter triggered but webcamRef is null');
      return;
    }
    
    console.log('[Camera] Capturing screenshot...');
    const screenshot = webcamRef.current.getScreenshot({ width: 1920, height: 1080 });
    if (!screenshot) {
      setErrorMsg('Failed to capture image from camera stream.');
      return;
    }

    setCapturedImage(screenshot);
    await retrieveGeolocation();
  };

  const retrieveGeolocation = async () => {
    if (!navigator.geolocation) {
      console.warn('[Camera] Geolocation API not supported by browser.');
      setLocationStatus('failed');
      setGpsData({ latitude: 0, longitude: 0 });
      return;
    }

    console.log('[Camera] Fetching high accuracy GPS coordinates...');
    setLocationStatus('fetching');

    // Attempt high accuracy first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
        console.log(`[Camera] GPS resolved successfully: ${latitude}, ${longitude}`);
        
        const gps = { 
          latitude, 
          longitude, 
          accuracy, 
          altitude: altitude !== null ? altitude : undefined, 
          speed: speed !== null ? speed : undefined, 
          heading: heading !== null ? heading : undefined 
        };
        
        setGpsData(gps);
        setLocationStatus('success');

        try {
          console.log('[Camera] Resolving address geocode details...');
          const addr = await reverseGeocode(latitude, longitude);
          setResolvedAddress(addr);
        } catch (err) {
          console.warn('[Camera] Geocoding lookup failed, continuing with fallback:', err);
        }
      },
      (error) => {
        console.warn('[Camera] High accuracy GPS failed, trying fallback:', error.message);
        
        // Retry with low accuracy before giving up
        navigator.geolocation.getCurrentPosition(
          async (lowPos) => {
            const { latitude, longitude, accuracy } = lowPos.coords;
            console.log(`[Camera] Fallback low accuracy GPS resolved: ${latitude}, ${longitude}`);
            setGpsData({ latitude, longitude, accuracy });
            setLocationStatus('success');
            try {
              const addr = await reverseGeocode(latitude, longitude);
              setResolvedAddress(addr);
            } catch (err) {
              console.warn('[Camera] Geocoding lookup failed:', err);
            }
          },
          (lowErr) => {
            console.error('[Camera] All GPS attempts failed:', lowErr);
            setLocationStatus('failed');
            setGpsData({ latitude: 0, longitude: 0 });
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleUsePhoto = () => {
    if (!capturedImage) return;

    console.log('[Camera] Handing off photo data to editor...');
    const blob = dataURItoBlob(capturedImage);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const lat = gpsData?.latitude ?? 0;
    const lon = gpsData?.longitude ?? 0;
    const accuracy = gpsData?.accuracy;

    onPhotoReady({
      imageBlob: blob,
      latitude: lat,
      longitude: lon,
      accuracy: accuracy,
      altitude: gpsData?.altitude,
      speed: gpsData?.speed,
      heading: gpsData?.heading,
      address: resolvedAddress?.address ?? '',
      houseNumber: resolvedAddress?.houseNumber ?? '',
      street: resolvedAddress?.street ?? '',
      area: resolvedAddress?.area ?? '',
      locality: resolvedAddress?.locality ?? '',
      city: resolvedAddress?.city ?? '',
      state: resolvedAddress?.state ?? '',
      country: resolvedAddress?.country ?? '',
      postalCode: resolvedAddress?.postalCode ?? '',
      date: dateStr,
      time: timeStr,
      mapsUrl: generateGoogleMapsUrl(lat, lon),
      isFavorite: false,
      tags: [],
      notes: '',
      cameraMake: 'Webcam',
      cameraModel: gpsData && gpsData.latitude !== 0 ? 'Live Camera Capture' : 'Live Camera Capture (No GPS)',
    });
  };

  const handleRetake = () => {
    console.log('[Camera] Resetting capture states for retake...');
    setCapturedImage(null);
    setGpsData(null);
    setLocationStatus('idle');
    setResolvedAddress(null);
    setErrorMsg(null);
  };

  const handleWebcamError = (err: string | DOMException) => {
    console.error('[Camera] Webcam error callback triggered:', err);
    setHasPermission(false);
    setErrorMsg('Camera stream request failed. Please check permissions or release camera.');
  };

  const handleWebcamSuccess = () => {
    console.log('[Camera] Webcam stream connected successfully.');
    setHasPermission(true);
    setErrorMsg(null);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto mt-12">
        <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Camera Access Required</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This app runs on secure origins (HTTPS) and requires browser permissions. Click allow when prompted to capture geotagged photos.
        </p>
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleRetake}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            Retry Camera Connection
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/85 to-transparent flex justify-between items-center">
        <button
          onClick={onCancel}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/20 transition backdrop-blur-md"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider bg-brand-500 text-white px-2.5 py-1 rounded-full shadow-lg">
          {capturedImage ? 'Confirm Photo' : 'Live Capture'}
        </span>
      </div>

      {/* Viewfinder or Confirm Preview */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[420px]">
        {!capturedImage ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            onUserMedia={handleWebcamSuccess}
            onUserMediaError={handleWebcamError}
            videoConstraints={{
              facingMode: facingMode,
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={capturedImage} alt="Captured preview" className="w-full h-full object-cover" />
            
            {/* Geolocation status overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
              {locationStatus === 'fetching' && (
                <div className="flex flex-col items-center">
                  <Loader className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                  <h4 className="text-lg font-bold">Acquiring GPS Satellite Signal...</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Retrieving high-accuracy device location coordinates.
                  </p>
                </div>
              )}
              {locationStatus === 'success' && (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 animate-pulse" />
                  <h4 className="text-lg font-bold">Metadata Prepared</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-1">
                    {gpsData?.latitude.toFixed(6)}, {gpsData?.longitude.toFixed(6)} (±{gpsData?.accuracy?.toFixed(1)}m)
                  </p>
                  {resolvedAddress?.address && (
                    <p className="text-xs text-slate-300 mt-2 max-w-sm px-4 italic line-clamp-2">
                      {resolvedAddress.address}
                    </p>
                  )}
                </div>
              )}
              {locationStatus === 'failed' && (
                <div className="flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 text-amber-500 mb-4 animate-bounce" />
                  <h4 className="text-lg font-bold">GPS Coordinate Failure</h4>
                  <p className="text-xs text-slate-355 mt-1 max-w-xs leading-relaxed">
                    Could not resolve browser location metadata. You can manually adjust the pin inside the editor.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warning notification */}
        {errorMsg && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-xl border border-red-500/30 text-xs flex items-center gap-2.5 backdrop-blur z-40">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Control panel */}
      <div className="bg-slate-950 p-6 flex justify-around items-center z-20 border-t border-slate-900 min-h-[96px]">
        {!capturedImage ? (
          <>
            <button
              onClick={toggleCamera}
              className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-full transition text-slate-300 hover:text-white"
              title="Switch Camera Mode"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center shadow-2xl transition border-4 border-slate-800 hover:scale-105 active:scale-95"
              title="Capture"
            >
              <div className="w-6 h-6 bg-slate-950 rounded-full" />
            </button>
            
            <div className="w-12" /> {/* spacer balance */}
          </>
        ) : (
          <>
            {locationStatus !== 'fetching' && (
              <div className="flex gap-4 w-full px-4 max-w-sm">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw size={14} /> Retake
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <Check size={14} /> Use Photo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
