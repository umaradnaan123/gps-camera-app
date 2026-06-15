import React from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, ShieldCheck, Download, Layers, Sparkles, Navigation, CheckCircle2, ChevronRight, Upload } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: 'dashboard' | 'camera' | 'upload' | 'gallery', pathSlug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-805 dark:text-slate-100 overflow-x-hidden relative transition-colors duration-300">
      
      {/* MAP GRID BACKGROUND DECORATION */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* FLOATING DECORATIVE GLOWS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-550/15 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-550/15 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-slow delay-1000" />

      {/* HEADER NAVBAR */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <span className="font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-violet-650 to-brand-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-brand-300">GeoTag Pro</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              window.open("https://www.effectivecpmnetwork.com/x946vg2zs4?key=247400cdfbed66491d3f84b3f3652bc6", "_blank");
              onNavigate("dashboard", "/dashboard");
            }}
            className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold rounded-xl shadow-lg transition duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            Launch Console <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* HERO TEXT (7 columns) */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-50/80 dark:bg-brand-950/20 text-brand-655 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30 backdrop-blur"
          >
            <Sparkles size={12} className="animate-spin-slow" />
            <span>SaaS Geo-Verification platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white"
          >
            GeoTag Pro – Capture Photos with <span className="bg-gradient-to-r from-violet-600 via-brand-500 to-emerald-500 bg-clip-text text-transparent">GPS Coordinates, Address, Timestamp, Google Maps Link & EXIF Metadata</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed"
          >
            Verify location evidence, scan embedded EXIF files, overlay coordinate timestamps on JPEG photos, and download structured CSV/JSON audit spreadsheets—completely client-side and offline-friendly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center lg:justify-start gap-4"
          >
            <button
              onClick={() => onNavigate('camera', '/gps-camera-app')}
              className="px-6 py-3.5 bg-brand-500 hover:bg-brand-650 text-white rounded-xl shadow-xl shadow-brand-500/25 transition duration-150 font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Camera size={16} /> Start Capturing Geotags
            </button>
            <button
              onClick={() => onNavigate('upload', '/exif-metadata-editor')}
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm transition duration-150 font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Upload size={16} /> Drag & Drop EXIF Image
            </button>
          </motion.div>

          {/* Core assurances checklist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/50 dark:border-slate-800/50 max-w-md mx-auto lg:mx-0 text-left"
          >
            {[
              { text: '100% Client-side' },
              { text: 'No API Keys required' },
              { text: 'Offline Friendly' },
            ].map((check, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{check.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* HERO MOCKUPS (5 columns) */}
        <div className="lg:col-span-5 flex justify-center relative">
          
          {/* Animated floating location marker pin */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-12 -left-6 z-20 p-3 bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white shadow-md shadow-violet-550/20">
              <MapPin size={16} />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Coordinates</div>
              <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">17.1234, 82.3456</div>
            </div>
          </motion.div>

          {/* Animated GPS Satellite tracker overlay card */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-12 -right-8 z-20 p-3 bg-white/90 dark:bg-slate-900/95 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Navigation size={16} className="rotate-45" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Accuracy</div>
              <div className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">±3.5 meters</div>
            </div>
          </motion.div>

          {/* Interactive Phone mockup frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
            className="w-72 h-[480px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-850 relative overflow-hidden"
          >
            {/* Camera Viewfinder Mockup */}
            <div className="w-full h-full rounded-[24px] bg-slate-950 overflow-hidden relative flex flex-col justify-between p-4">
              {/* Header bar */}
              <div className="flex justify-between items-center z-10">
                <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur">
                  Live Viewfinder
                </span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  GPS ACTIVE
                </span>
              </div>

              {/* Mock camera lines crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-48 h-0.5 bg-white" />
                <div className="h-48 w-0.5 bg-white absolute" />
              </div>

              {/* Lower HUD Overlay data box */}
              <div className="bg-black/70 border border-white/10 p-3 rounded-xl backdrop-blur-md z-10 space-y-1 text-[9px] font-semibold text-white/90">
                <div className="text-[8px] text-violet-400 font-bold uppercase tracking-wider">Stamp preview</div>
                <div className="font-mono">Lat: 17.123456 | Lon: 82.345678</div>
                <div>Address: 100 Main St, Kakinada, AP</div>
                <div className="font-mono text-white/60">Time Taken: {new Date().toISOString().split('T')[0]} 12:00</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATISTICS METRICS GRID CARDS */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 dark:border-slate-850/50 z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Photos Cataloged', val: '14,250+', desc: 'Secure location reports' },
            { label: 'Geocodes Verified', val: '430,000+', desc: 'Reverse geocode requests' },
            { label: 'Exported Reports', val: '8,400+', desc: 'Spreadsheet audit files' },
            { label: 'Active Surveyors', val: '12,900+', desc: 'Field users globally' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/80 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 shadow-sm backdrop-blur"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{metric.label}</span>
              <span className="text-2xl font-black block text-slate-900 dark:text-white mt-1">{metric.val}</span>
              <span className="text-[10px] text-slate-450 mt-0.5 block">{metric.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURE CARDS (Scroll animations) */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold text-violet-550 uppercase tracking-widest block">Capabilities</span>
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed for Surveyors & Inspectors
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 max-w-md mx-auto">
            Everything you need to capture location evidence, organize inspections, and share verifiable reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Live GPS Photo Stamp',
              desc: 'Interface directly with camera hardware to capture high-resolution photos and stamp coordinate metadata overlays instantly.',
              icon: Camera,
              color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20 border-violet-100/50 dark:border-violet-900/30',
              tab: 'camera' as const,
              path: '/gps-camera-app'
            },
            {
              title: 'Automatic EXIF Extraction',
              desc: 'Upload photo assets to automatically scan EXIF metadata fields. Extract longitude, latitude, accuracy, dates, and camera hardware tags.',
              icon: Layers,
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30',
              tab: 'upload' as const,
              path: '/exif-metadata-editor'
            },
            {
              title: 'Interactive Leaflet Maps',
              desc: 'Verify locations visually. Relocate pins, click to update coordinates, or search using reverse geocoding integrations.',
              icon: MapPin,
              color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20 border-brand-100/50 dark:border-brand-900/30',
              tab: 'dashboard' as const,
              path: '/photo-location-tracker'
            },
            {
              title: 'Canvas Stamp Generator',
              desc: 'Apply visual overlay plates to export photos with stamped GPS points, date-times, watermarks, and project descriptions.',
              icon: Sparkles,
              color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30',
              tab: 'gallery' as const,
              path: '/field-inspection-photo-app'
            },
            {
              title: '100% Client-Side DB',
              desc: 'Store photos as local Blobs in browser IndexedDB. Query your logs, tag assets, and filter entries completely offline.',
              icon: ShieldCheck,
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30',
              tab: 'gallery' as const,
              path: '/field-inspection-photo-app'
            },
            {
              title: 'Batch CSV & JSON Exports',
              desc: 'Select logs to compile files. Download aggregated CSV spreadsheets or raw JSON files for location database audits.',
              icon: Download,
              color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30',
              tab: 'gallery' as const,
              path: '/field-inspection-photo-app'
            }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => {
                window.open("https://www.effectivecpmnetwork.com/y64k0hg8e?key=b6e031570e1ac4dcce264194b1bf0101", "_blank");
                onNavigate(feat.tab, feat.path);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-800 transition duration-300 cursor-pointer"
            >
              <div className="space-y-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${feat.color}`}>
                  <feat.icon size={20} />
                </div>
                <h4 className="font-extrabold text-slate-850 dark:text-slate-100">{feat.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-[11px] font-bold text-brand-655 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Try Feature</span>
                <ChevronRight size={12} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA CLOSING BOX */}
      <section className="relative max-w-5xl mx-auto px-6 py-16 mb-24 z-10">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-violet-650 to-indigo-700 text-white rounded-3xl p-8 md:p-12 shadow-2xl text-center relative overflow-hidden border border-violet-500/20"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-5 pointer-events-none" />
          
          <div className="relative z-10 max-w-md mx-auto space-y-6">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">Ready to Audit Field Geotags?</h3>
            <p className="text-xs text-violet-100 leading-relaxed font-medium">
              Start a guest session inside your browser. No sign-ups or subscription licenses required—all assets process locally in your device sandbox.
            </p>
            <button
              onClick={() => {
                window.open("https://www.effectivecpmnetwork.com/hgz53fwb?key=604f09908fc20874955621b88a9c8ca6", "_blank");
                onNavigate("dashboard", "/dashboard");
              }}
              className="mx-auto px-6 py-3.5 bg-white hover:bg-slate-105 text-indigo-700 rounded-xl text-xs font-bold shadow-2xl transition duration-150 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              Start Free Guest Session <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="font-extrabold uppercase tracking-wider text-slate-850 dark:text-slate-300">GeoTag Pro</span>
          </div>
          <p>© {new Date().getFullYear()} GeoTag Pro. Licensed under Open Source GPL.</p>
        </div>
      </footer>

    </div>
  );
};
