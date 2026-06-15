import React from 'react';
import { Camera, Sparkles, CheckCircle2 } from 'lucide-react';

interface LandingPageCollectionProps {
  slug: string;
  onNavigate: (tab: 'dashboard' | 'camera' | 'upload' | 'gallery', pathSlug: string) => void;
}

export const LandingPageCollection: React.FC<LandingPageCollectionProps> = ({ slug, onNavigate }) => {
  // Select matching metadata & content based on route slug
  const getPageContent = () => {
    switch (slug) {
      case '/gps-camera-app':
        return {
          title: 'GPS Camera App – Free Online GPS Photo Capture Platform',
          h1: 'Free Online GPS Camera App',
          subtitle: 'Capture high-accuracy photos with location metadata embedded instantly.',
          description: 'GeoTag Pro is a professional-grade web-based GPS Camera App that allows you to take pictures directly from your browser, gather real-time latitude, longitude, elevation, and direction information, and embed geotags directly into files without external app stores.',
          useCase: 'Field inspections, land surveys, engineering documentation, and location proofing.',
          keyword: 'GPS Camera App'
        };
      case '/geotag-photo-app':
        return {
          title: 'Geotagged Photo Capture – Overlay Coordinate Metadata',
          h1: 'Live Geotagged Photo Capture Console',
          subtitle: 'Verify field operations with geotagged digital records.',
          description: 'Deploy our browser-based geotagged photo capture solution to stamp coordinates, addresses, and timestamps on JPEG files. Keep files structured, safe, and ready for audit reports.',
          useCase: 'Construction quality assurance, real estate listing verification, and remote field work audits.',
          keyword: 'Geotagged Photo Capture'
        };
      case '/photo-location-tracker':
        return {
          title: 'GPS Photo Location Tracker – Map Inspection Points',
          h1: 'GPS Photo Location Tracker & Map Mapper',
          subtitle: 'Map image directories using embedded metadata tags.',
          description: 'Visualize your entire catalog of location-stamped photos on dynamic interactive maps. Track routes, survey points, and field reports automatically by analyzing EXIF coordinates.',
          useCase: 'Environmental research, logistics tracing, route validation, and asset tracking.',
          keyword: 'Photo Location Tracker'
        };
      case '/gps-image-verification':
        return {
          title: 'GPS Image Verification – Validate Metadata Authenticity',
          h1: 'GPS Image Verification Platform',
          subtitle: 'Confirm coordinate authenticity, detect manipulation, and audit coordinates.',
          description: 'Validate geographical metadata structure in uploaded JPEG and WebP images. Perform deep EXIF header analysis to verify that location records match target inspection points.',
          useCase: 'Insurance claim processing, legal evidence verification, and remote work validation.',
          keyword: 'GPS Image Verification'
        };
      case '/exif-metadata-editor':
        return {
          title: 'Online EXIF Metadata Editor – Edit Coordinates',
          h1: 'Online EXIF Metadata Editor & Viewer',
          subtitle: 'Update, remove, or add GPS tags to your image files.',
          description: 'Read and write image metadata directly from your web sandbox. Change coordinates, camera tags, date-time markers, and notes without sacrificing image quality.',
          useCase: 'Privacy scrubbing, coordinate corrections, and batch file metadata standardisation.',
          keyword: 'EXIF Metadata Editor'
        };
      case '/gps-timestamp-camera':
        return {
          title: 'GPS Timestamp Camera – Overlay Live Date & Time',
          h1: 'GPS Timestamp Camera & Canvas overlay',
          subtitle: 'Generate verifiable photo proofs with custom location labels.',
          description: 'Create beautiful overlay stamps featuring dates, timestamps, elevation indices, and custom project watermarks. Export production-ready proof-of-work images instantly.',
          useCase: 'Security checks, shift reporting, inspection timestamp logs, and audit trails.',
          keyword: 'GPS Timestamp Camera'
        };
      case '/construction-site-photo-reporting':
        return {
          title: 'Construction Site Photo Reporting – Daily Logs',
          h1: 'Construction Site Photo Reporting Tool',
          subtitle: 'Automate build site documentation and daily progress reports.',
          description: 'Track milestones, build structures, and inspector approvals. Take photos, overlay active site locations, and download organized CSV spreadsheets for client reviews.',
          useCase: 'General contracting logs, progress audits, subcontract reviews, and building inspection logs.',
          keyword: 'Construction Site Photo Reporting'
        };
      case '/field-inspection-photo-app':
        return {
          title: 'Field Inspection Photo Documentation – Online Tool',
          h1: 'Field Inspection Photo Documentation App',
          subtitle: 'Equip inspection teams with client-side auditing software.',
          description: 'Standardise visual evidence reporting. Capture geotagged inspection records offline, add customizable tags, filter by date ranges, and export records in bulk.',
          useCase: 'Safety audits, utility pipeline tracking, structural safety checks, and infrastructure logs.',
          keyword: 'Field Inspection Photo Documentation'
        };
      case '/real-estate-inspection-photos':
        return {
          title: 'Real Estate Inspection Photos – Verifiable Listing Assets',
          h1: 'Real Estate Geotagged Photo System',
          subtitle: 'Verify real estate listings, appraisal logs, and property details.',
          description: 'Keep listings transparent. Stamp appraisals, property views, site conditions, and survey marks with certified coordinates for real estate audits.',
          useCase: 'Listing valuations, property appraisal reports, insurance evaluations, and mortgage reviews.',
          keyword: 'Real Estate Inspection Photos'
        };
      case '/survey-photo-management':
        return {
          title: 'Survey Photo Management – Geographic Photo Log',
          h1: 'Survey Photo Management Console',
          subtitle: 'Manage land, layout, and topological survey images.',
          description: 'Organize thousands of topological inspection images with coordinates mapped on Interactive maps. Export structured geographic spreadsheets for GIS integrations.',
          useCase: 'Land development projects, agricultural research, civil surveying, and GIS indexing.',
          keyword: 'Survey Photo Management'
        };
      case '/gps-photo-tracking-software':
        return {
          title: 'GPS Photo Tracking Software – Field Worker Trails',
          h1: 'GPS Photo Tracking Software',
          subtitle: 'Verify employee site visits and daily field routes.',
          description: 'Ensure operational transparency. Audit route logs and verify that on-site representatives visit exact locations by tracking photo coordinates in chronological order.',
          useCase: 'Sales route audits, field technician checks, security rounds, and distribution logs.',
          keyword: 'GPS Photo Tracking Software'
        };
      case '/gps-camera-app-vs-timestamp-camera':
        return {
          title: 'GPS Camera App vs Timestamp Camera: What Is the Difference?',
          h1: 'GPS Camera App vs Timestamp Camera',
          subtitle: 'Compare visual stamp overlays and binary EXIF metadata structures.',
          description: 'While both tools provide evidence of capture times, a GPS Camera App embeds geographic and directional indices inside the image binary headers (EXIF), whereas a Timestamp Camera primarily renders visual pixel text over the canvas. Choose the right tool for your specific field validation checks.',
          useCase: 'Compare reporting standardisations for safety, construction logs, and legal proof files.',
          keyword: 'GPS Camera App vs Timestamp Camera'
        };
      case '/best-geotagging-software':
        return {
          title: 'Best Geotagging Software for Desktop and Mobile',
          h1: 'Best Geotagging Software & Online Tools',
          subtitle: 'Audit, verify, and modify geographic metadata with top geotagging applications.',
          description: 'Discover options to automate image location mapping. This analysis reviews offline-first open-source web apps, CLI exiftool integrations, and map-based GUI catalog managers.',
          useCase: 'Determine options for GIS workflows, database imports, and inspector logs.',
          keyword: 'Best Geotagging Software'
        };
      case '/gps-location-proof':
        return {
          title: 'GPS Location Proof – Verifiable Visual Presence Evidences',
          h1: 'GPS Location Proof & Verification System',
          subtitle: 'Prevent fraud with timestamped, geolocated photo audits.',
          description: 'Establish high-fidelity proof-of-work visual logs using certified device sensors. Export unmodifiable coordinate logs containing compass direction, altitude, and geocoding details.',
          useCase: 'Insurance payouts, regulatory environmental inspections, and delivery confirmations.',
          keyword: 'GPS Location Proof'
        };
      case '/field-inspection-software':
        return {
          title: 'Field Inspection Software – Automated Photo Logs',
          h1: 'Web-Based Field Inspection Software',
          subtitle: 'Empower remote teams to capture location-certified logs.',
          description: 'Track milestones, build structures, and inspector approvals. Take photos, overlay active site locations, and download organized CSV spreadsheets for client reviews.',
          useCase: 'General contracting logs, progress audits, subcontract reviews, and building inspection logs.',
          keyword: 'Field Inspection Software'
        };
      case '/geotagged-photos':
        return {
          title: 'Geotagged Photos – Visual Records with Coordinates',
          h1: 'Managing Geotagged Photos in Audits',
          subtitle: 'Extract, process, and map coordinate metadata tags.',
          description: 'Visual evidence audit trails depend entirely on geotags—embedded geographic markers representing the precise longitude, latitude, altitude, and direction where a camera shutter was triggered.',
          useCase: 'Insurance claim processing, legal evidence verification, and remote work validation.',
          keyword: 'Geotagged Photos'
        };
      case '/gps-photo-verification':
        return {
          title: 'GPS Photo Verification – Authenticate Metadata',
          h1: 'GPS Photo Verification System',
          subtitle: 'Verify geographic signatures and coordinate integrity.',
          description: 'Validate geographical metadata structure in uploaded JPEG and WebP images. Perform deep EXIF header analysis to verify that location records match target inspection points.',
          useCase: 'Insurance claim processing, legal evidence verification, and remote work validation.',
          keyword: 'GPS Photo Verification'
        };
      case '/construction-site-photo-documentation':
        return {
          title: 'Construction Site Photo Documentation – Daily Build Progress',
          h1: 'Construction Site Photo Documentation app',
          subtitle: 'Organize daily build logs, subcontractor milestones, and inspections.',
          description: 'Track milestones, build structures, and inspector approvals. Take photos, overlay active site locations, and download organized CSV spreadsheets for client reviews.',
          useCase: 'General contracting logs, progress audits, subcontract reviews, and building inspection logs.',
          keyword: 'Construction Site Photo Documentation'
        };
      case '/survey-photo-app':
        return {
          title: 'Survey Photo App – Geographic Surveys and Mapping',
          h1: 'Survey Photo App & Geographic Mapper',
          subtitle: 'Collect topological data and coordinate markers.',
          description: 'Organize thousands of topological inspection images with coordinates mapped on Interactive maps. Export structured geographic spreadsheets for GIS integrations.',
          useCase: 'Land development projects, agricultural research, civil surveying, and GIS indexing.',
          keyword: 'Survey Photo App'
        };
      case '/location-verification-platform':
      default:
        return {
          title: 'Location Verification Platform – Fraud Prevention',
          h1: 'Location Verification Platform',
          subtitle: 'Provide verifiable geographic proofs for corporate transactions.',
          description: 'Verify coordinate data authenticity, check coordinates, prevent listing spoofing, and compile legal visual reports directly from browser client instances.',
          useCase: 'Corporate compliance, security verification, legal proof-of-presence, and fraud reduction.',
          keyword: 'Location Verification Platform'
        };
    }
  };

  const content = getPageContent();

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      
      {/* Dynamic Header Section */}
      <div className="bg-gradient-to-r from-violet-650 to-indigo-700 text-white p-8 md:p-12 rounded-3xl shadow-xl border border-violet-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-5 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-violet-200">
            <Sparkles size={12} className="text-amber-400" />
            <span>SEO Landing Page for {content.keyword}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">{content.h1}</h1>
          <p className="text-sm md:text-lg text-violet-100 max-w-2xl">{content.subtitle}</p>
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('camera', '/gps-camera-app')}
              className="px-5 py-3 bg-white hover:bg-slate-100 text-violet-750 font-bold rounded-xl text-xs shadow-lg transition duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Camera size={14} /> Open Live GPS Camera
            </button>
            <button
              onClick={() => onNavigate('upload', '/exif-metadata-editor')}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-550 border border-violet-400/30 text-white font-bold rounded-xl text-xs shadow-lg transition duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Upload size={14} /> Upload & Edit EXIF Tags
            </button>
          </div>
        </div>
      </div>

      {/* SEO Content Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 md:p-8 rounded-2xl shadow-sm">
          <h2 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
            About {content.keyword}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
            {content.description}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
            Modern visual workflows depend heavily on verifiable metadata records. By leveraging browser geolocation APIs and Canvas stamp generation capabilities, our software provides a secure, fully sandboxed, client-side interface that operates without requiring expensive cloud service fees or database exposures.
          </p>
          
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mt-6">Primary Industry Use Cases:</h3>
          <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{content.useCase}</p>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-violet-450">Console Features</h3>
            <ul className="space-y-3 text-[11px] font-semibold text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Immediate browser GPS fetching</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Interactive map checks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>EXIF headers injection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Batch CSV/JSON reporting logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Privacy metadata scrubber tools</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = "https://www.effectivecpmnetwork.com/hgz53fwb?key=604f09908fc20874955621b88a9c8ca6"}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-[10px] transition text-center"
            >
              Start Free Guest Session
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// Helper Upload icon export
const Upload = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
