import { useState, useEffect } from 'react';
import { Camera, Upload, LayoutGrid, Map, Sun, Moon, Award, MapPin, Sparkles, Heart } from 'lucide-react';
import { CameraModule } from './components/CameraModule';
import { ImageUpload } from './components/ImageUpload';
import { MetadataEditor } from './components/MetadataEditor';
import { GalleryView } from './components/GalleryView';
import { MultiMap } from './components/MultiMap';
import { type GeotaggedPhoto, getAllPhotos } from './utils/db';
import { LandingPage } from './components/LandingPage';
import { LandingPageCollection } from './components/LandingPageCollection';
import { BlogSection } from './components/BlogSection';

type AppTab = 'dashboard' | 'camera' | 'upload' | 'gallery';

// Helper component for recent activity items to manage object URL lifecycle
const RecentPhotoItem = ({ photo, onClick }: { photo: GeotaggedPhoto; onClick: () => void }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.imageBlob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photo.imageBlob]);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 p-2 bg-slate-50 dark:bg-slate-950 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 border border-slate-250/20 dark:border-slate-850 rounded-xl cursor-pointer transition"
    >
      <div className="w-14 h-11 bg-slate-200 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-800">
        {url && <img src={url} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate flex items-center gap-1">
          <MapPin size={10} className="text-violet-500" />
          <span>{photo.city || photo.country || 'Coordinates'}</span>
        </h4>
        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{photo.date} {photo.time}</p>
      </div>
    </div>
  );
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check initial preference
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [photosList, setPhotosList] = useState<GeotaggedPhoto[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<Partial<GeotaggedPhoto> & { imageBlob: Blob } | null>(null);
  const [isNewPhoto, setIsNewPhoto] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // POPSTATE router listeners
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO virtual router matching friendly URLs
  useEffect(() => {
    const path = currentPath;
    
    // Update canonical link element dynamically
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}${path}`);

    // Update Meta Title & Description Dynamically based on active path
    let title = 'GeoTag Pro – Free GPS Camera, Geotagged Photo Capture, Location Verification & EXIF Metadata Editor';
    let description = 'Capture photos with GPS coordinates, address, timestamps, Google Maps links, and EXIF metadata. Upload, edit, verify, store, download, and share geotagged images online.';
    
    if (path.startsWith('/blog/')) {
      const slug = path.split('/').pop() || '';
      title = `${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} | GeoTag Pro Blog`;
      description = 'Read expert compliance inspection guides, EXIF analysis, and location auditing tutorials.';
    } else if (path !== '/' && path !== '/dashboard') {
      title = `${path.replace(/\//g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} | GeoTag Pro Platform`;
      description = `Professional client-side utility for ${path.replace(/\//g, '').replace(/-/g, ' ')}. Capture, edit, and export visual metadata logs.`;
    }

    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }

    // Dynamic JSON-LD Schema Injector
    let schemaObj = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "GeoTag Pro",
      "url": `${window.location.origin}${path}`,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "description": description,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    let existingSchema = document.getElementById('seo-schema');
    if (existingSchema) {
      existingSchema.remove();
    }
    const script = document.createElement('script');
    script.id = 'seo-schema';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaObj);
    document.head.appendChild(script);

    const isLandingSlug = [
      '/gps-camera-app', '/geotag-photo-app', '/photo-location-tracker',
      '/gps-image-verification', '/exif-metadata-editor', '/field-inspection-photo-app',
      '/construction-site-photo-reporting', '/real-estate-inspection-photos',
      '/survey-photo-management', '/gps-photo-tracking-software', '/location-verification-platform',
      '/gps-timestamp-camera', '/gps-camera-app-vs-timestamp-camera', '/best-geotagging-software',
      '/gps-location-proof', '/field-inspection-software', '/geotagged-photos',
      '/gps-photo-verification', '/construction-site-photo-documentation', '/survey-photo-app'
    ].includes(path);

    if (isLandingSlug) {
      setShowLanding(false);
      if (path === '/gps-camera-app' || path === '/geotag-photo-app' || path === '/photo-location-tracker') {
        setActiveTab('camera');
      } else if (path === '/gps-image-verification' || path === '/exif-metadata-editor') {
        setActiveTab('upload');
      } else {
        setActiveTab('gallery');
      }
    } else if (path.startsWith('/blog/')) {
      setShowLanding(false);
      setActiveTab('dashboard');
    } else if (path === '/dashboard') {
      setShowLanding(false);
      setActiveTab('dashboard');
    } else if (path === '/') {
      setShowLanding(true);
    }
  }, [currentPath]);

  const navigateTo = (tab: AppTab, pathSlug?: string) => {
    setActiveTab(tab);
    setEditingPhoto(null);
    if (pathSlug) {
      window.history.pushState(null, '', pathSlug);
      setCurrentPath(pathSlug);
    }
  };

  // Sync dark class on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const loadPhotos = async () => {
    const data = await getAllPhotos();
    setPhotosList(data);
  };

  useEffect(() => {
    loadPhotos();
  }, [activeTab, editingPhoto]);

  // Handle Photo captured or uploaded
  const handlePhotoReady = (photoData: Partial<GeotaggedPhoto> & { imageBlob: Blob }) => {
    setEditingPhoto(photoData);
    setIsNewPhoto(true);
  };

  const handleSaveEditor = () => {
    setEditingPhoto(null);
    setIsNewPhoto(false);
    setActiveTab('gallery');
    loadPhotos();
  };

  // Stats calculation
  const totalCount = photosList.length;
  const favCount = photosList.filter((p) => p.isFavorite).length;
  const uniqueCities = Array.from(new Set(photosList.map((p) => p.city).filter(Boolean))).length;
  const uniqueCountries = Array.from(new Set(photosList.map((p) => p.country).filter(Boolean))).length;
  
  const recentPhotos = [...photosList]
    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
    .slice(0, 3);

  const renderWorkspaceContent = () => {
    if (currentPath.startsWith('/blog/')) {
      return <BlogSection onNavigate={(tab, slug) => navigateTo(tab, slug)} />;
    }

    const isLandingSlug = [
      '/gps-camera-app', '/geotag-photo-app', '/photo-location-tracker',
      '/gps-image-verification', '/exif-metadata-editor', '/field-inspection-photo-app',
      '/construction-site-photo-reporting', '/real-estate-inspection-photos',
      '/survey-photo-management', '/gps-photo-tracking-software', '/location-verification-platform',
      '/gps-timestamp-camera', '/gps-camera-app-vs-timestamp-camera', '/best-geotagging-software',
      '/gps-location-proof', '/field-inspection-software', '/geotagged-photos',
      '/gps-photo-verification', '/construction-site-photo-documentation', '/survey-photo-app'
    ].includes(currentPath);

    if (isLandingSlug) {
      return <LandingPageCollection slug={currentPath} onNavigate={(tab, slug) => navigateTo(tab, slug)} />;
    }

    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          {/* Dashboard Hero Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-violet-650 to-indigo-700 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-violet-500/20">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome to GeoTag Pro</h2>
              <p className="text-xs text-violet-100 max-w-md">
                Capture photos live with browser geolocations, read/write embedded EXIF coordinate tags, and manage visual metadata records securely.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => navigateTo('camera', '/gps-camera-app')}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 text-violet-750 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera size={14} /> Capture
              </button>
              <button
                onClick={() => navigateTo('upload', '/exif-metadata-editor')}
                className="flex-1 md:flex-none px-4 py-2.5 bg-violet-500 hover:bg-violet-550 border border-violet-400/30 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2"
              >
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>

          {/* Dashboard stats numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Photos Geotagged', value: totalCount, icon: MapPin, color: 'text-violet-500' },
              { label: 'Favorites Marked', value: favCount, icon: Heart, color: 'text-red-500' },
              { label: 'Cities Cataloged', value: uniqueCities, icon: Sparkles, color: 'text-emerald-500' },
              { label: 'Countries Visited', value: uniqueCountries, icon: LayoutGrid, color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className={`p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl ${stat.color} shadow-sm border border-slate-100 dark:border-slate-850`}>
                  <stat.icon size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{stat.label}</span>
                  <span className="text-lg font-black">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Split visual section: Map pins overview & Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* All maps pin map (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col h-96">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <span>Stored Coordinates Overview</span>
              </h3>
              <div className="flex-1 w-full rounded-xl overflow-hidden relative">
                <MultiMap photos={photosList} onSelectPhoto={(p) => {
                  setEditingPhoto(p);
                  setIsNewPhoto(false);
                }} />
              </div>
            </div>

            {/* Recent uploads gallery log (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3.5">
                  Recent Activity
                </h3>
                {recentPhotos.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <MapPin className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                    <p className="text-xs">No photos stored yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentPhotos.map((photo) => (
                      <RecentPhotoItem
                        key={photo.id}
                        photo={photo}
                        onClick={() => {
                          setEditingPhoto(photo);
                          setIsNewPhoto(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {photosList.length > 3 && (
                <button
                  onClick={() => navigateTo('gallery', '/field-inspection-photo-app')}
                  className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900/60 border border-slate-200/60 dark:border-slate-850 text-slate-600 dark:text-slate-350 text-xs font-bold rounded-xl transition"
                >
                  View Full Photo Log ({photosList.length} total)
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'camera') {
      return (
        <div className="space-y-6">
          <CameraModule
            onPhotoReady={handlePhotoReady}
            onCancel={() => navigateTo('dashboard', '/dashboard')}
          />
        </div>
      );
    }

    if (activeTab === 'upload') {
      return (
        <div className="space-y-6">
          <ImageUpload
            onPhotoReady={handlePhotoReady}
            onCancel={() => navigateTo('dashboard', '/dashboard')}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100">Saved Photo Geotags</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage, filter, search, and export your geotagged photo catalog.
            </p>
          </div>
        </div>
        <GalleryView onEditPhoto={(photo) => {
          setEditingPhoto(photo);
          setIsNewPhoto(false);
        }} />
      </div>
    );
  };

  if (showLanding) {
    return (
      <LandingPage
        onNavigate={(tab, slug) => {
          setShowLanding(false);
          navigateTo(tab, slug);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Branding */}
          <div
            onClick={() => setShowLanding(true)}
            className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            title="Return to Landing Page"
          >
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-brand-500/20">
              📍
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-violet-650 to-brand-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-brand-300">
                GeoTag Pro
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Metadata Platform</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
              { id: 'camera', label: 'Capture Photo', icon: Camera, path: '/gps-camera-app' },
              { id: 'upload', label: 'Upload File', icon: Upload, path: '/exif-metadata-editor' },
              { id: 'gallery', label: 'Photo Log', icon: Map, path: '/field-inspection-photo-app' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id as AppTab, item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
                    activeTab === item.id && !editingPhoto
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 dark:bg-brand-600'
                      : 'text-slate-600 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
          {/* Guest badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-850">
            <Award size={12} className="text-amber-550" />
            <span>Guest Session</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={16} className="text-amber-400 animate-spin-slow" /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* App bar / navbar (Mobile header) */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center z-40">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span className="font-extrabold text-sm uppercase tracking-wider">GeoTag Pro</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-500 dark:text-slate-400 rounded-xl"
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </header>

        {/* Content body wrapper */}
        <div className="flex-grow p-4 md:p-8 overflow-y-auto">
          {editingPhoto ? (
            /* ACTIVE EDITOR FOR NEW/EXISTING GEOTAGS */
            <MetadataEditor
              initialPhoto={editingPhoto}
              isNew={isNewPhoto}
              onSave={handleSaveEditor}
              onCancel={() => {
                setEditingPhoto(null);
                setIsNewPhoto(false);
              }}
            />
          ) : (
            renderWorkspaceContent()
          )}
        </div>
      </main>

    </div>
  );
}

export default App;
