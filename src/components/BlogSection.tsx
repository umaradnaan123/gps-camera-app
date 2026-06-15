import React, { useState } from 'react';
import { ChevronRight, Calendar, User, Clock, ArrowLeft, HelpCircle } from 'lucide-react';

interface Article {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  content: string[]; // split into paragraphs & sections
  faqs: { q: string; a: string }[];
}

const BLOG_ARTICLES: Article[] = [
  {
    slug: 'how-to-add-gps-coordinates-to-photos',
    title: 'How to Add GPS Coordinates to Photos: A Complete Tutorial',
    category: 'Guides',
    date: 'June 10, 2026',
    readTime: '12 min read',
    summary: 'Learn the step-by-step methods to stamp, write, and verify GPS coordinate metadata directly inside JPEG, WebP, and PNG files using desktop apps, mobile operating systems, and web tools.',
    content: [
      'Visual evidence audit trails depend entirely on geotags—embedded geographic markers representing the precise longitude, latitude, altitude, and direction where a camera shutter was triggered. Whether you are standardising inspection workflows, recording topological survey markers, or saving holiday photos, knowing how to embed location data is an essential digital skill.',
      'Geotagging works by inserting special tags inside an image file structure. This structure is known as Exchangeable Image File Format (EXIF) metadata. Modern devices automatically parse this when the camera app is granted location permission. However, when coordinates are missing, incorrect, or scrubbed, you must manually inject or edit these tags.',
      '### Method 1: Using Online Web Sandbox Tools',
      'The fastest and safest method to insert coordinates into an image is using a browser-based metadata platform such as GeoTag Pro. Since these tools process files directly inside your browser sandbox, they protect your privacy by avoiding cloud uploads. To edit coordinate tags:',
      '1. Open the EXIF Editor console and drop your image file.\n2. The editor will fetch the current GPS headers. If empty, click on the interactive map to place a pin.\n3. Type or search for the address, verify the latitude and longitude numeric inputs, and click Save.\n4. The canvas tool will rebuild the JPEG structure and write updated GPS bytes back into the downloadable file.',
      '### Method 2: Editing EXIF Metadata on Windows & macOS',
      'On desktop operating systems, you can view and change basic properties directly through native file properties. On Windows, right-click the image, select Properties, head to the Details tab, and edit the Latitude and Longitude rows under the GPS section. On macOS, open the image in Preview, hit Command+I, open the Inspector Info panel, select the GPS tab, and view or adjust location properties.',
      '### Key Best Practices for Geotagging',
      'Ensure that your camera is calibrated, keep geolocation services active, and verify that you do not accidentally expose private coordinates when sharing sensitive family photos. For public sharing, consider scrubbing metadata using our platform scrubber.'
    ],
    faqs: [
      { q: 'Can I add geotags to images without GPS hardware?', a: 'Yes. You can manually assign coordinates using our online map editor, which translates the selected map pin into EXIF metadata.' },
      { q: 'Does editing metadata decrease image quality?', a: 'No. Modifying EXIF tags only rewrites the header bytes of the file and does not modify the compressed pixel data.' }
    ]
  },
  {
    slug: 'best-gps-camera-apps',
    title: 'Best GPS Camera Apps for Geotagged Field Inspections',
    category: 'Reviews',
    date: 'June 05, 2026',
    readTime: '10 min read',
    summary: 'A comparison of top-rated geotagging apps, highlighting mobile and web solutions tailored for contractors, appraisers, surveyors, and field service professionals.',
    content: [
      'In professional industries such as civil engineering, utility surveying, insurance claim verification, and property valuation, standard camera files are no longer sufficient. Teams need verified geographical logs that embed data stamps onto JPEG outputs.',
      'This guide reviews the best GPS camera options available today, outlining features, performance metrics, and pricing structures.',
      '### 1. GeoTag Pro (Web-Based App)',
      'GeoTag Pro leads the industry as an installable Progressive Web App (PWA) that operates across Android, iOS, Windows, and macOS devices. Key benefits include zero app store install requirements, completely offline functionality using client-side IndexedDB, and the ability to download batch CSV audit spreadsheets alongside images.',
      '### 2. Mobile Native Options',
      'Native apps offer strong integration with camera hardware and hardware sensors (compass, accelerometer). However, they often lock files behind paid cloud storage subscriptions or demand complex licensing agreements. Selecting a client-side web sandbox provides equivalent utility with improved data privacy and lower overhead.'
    ],
    faqs: [
      { q: 'Is GeoTag Pro free to use?', a: 'Yes. GeoTag Pro is completely free and operates offline without subscription limits.' },
      { q: 'Do Web Apps support compass data?', a: 'Modern browsers support DeviceOrientation APIs, allowing web apps to fetch heading and direction information directly.' }
    ]
  },
  {
    slug: 'what-is-geotagging',
    title: 'What Is Geotagging? The Complete Guide to Image Geolocation',
    category: 'Education',
    date: 'June 01, 2026',
    readTime: '8 min read',
    summary: 'Understand the science of embedding geographic data, how coordinates are represented in binary files, and its practical applications.',
    content: [
      'Geotagging is the technical process of appending geographical coordinates, altitude, direction, and place-name metadata to digital files such as photos, videos, or SMS messages. At its core, geotagging bridges the physical world and virtual databases, creating verifiable links between digital actions and real coordinates.',
      '### The Binary Architecture of Geotagging',
      'When a photo is taken, the device writes image pixels alongside header segments. The most common metadata standard is EXIF. EXIF stores coordinates as rational numbers representing degrees, minutes, and seconds, alongside indicators for North/South latitude and East/West longitude.',
      '### Why Geotagging Matters',
      'Without geotagging, organizing large image databases would require manual sorting. By indexing geotags, applications can automatically cluster photos by city, country, or route, map inspection pins, and generate location audit logs.'
    ],
    faqs: [
      { q: 'What files support geotagging?', a: 'JPEG, TIFF, WebP, and PNG files support EXIF geotag structures. JPEG is the most widely supported.' },
      { q: 'How do I see geotags in a photo?', a: 'You can upload the photo to our Online EXIF Viewer to inspect coordinates, address tags, and camera details instantly.' }
    ]
  },
  {
    slug: 'how-gps-photo-verification-works',
    title: 'How GPS Photo Verification Prevents Fraud in Field Audits',
    category: 'Security',
    date: 'May 28, 2026',
    readTime: '15 min read',
    summary: 'Explore the methods used by audits to verify coordinates, check EXIF structures, and confirm that field technicians visited exact spots.',
    content: [
      'Field service verification is plagued by verification challenges. Spoofed listings, manipulated screenshots, and remote claims cost operations millions annually. Traditional checklists are easily bypassed. GPS Photo Verification represents a secure, automated solution to establish location evidence.',
      '### The Verification Process',
      '1. **Live Capture**: Technicians snap photos directly inside a secure sandbox app using raw browser Geolocation APIs.\n2. **Hardware Constraints**: The platform records accuracy indices, speed, and timestamps.\n3. **EXIF Cryptography**: The coordinates are written directly into the binary header.\n4. **Audit Review**: Auditors load the files, verify the address signatures, and check coordinates.',
      '### Fraud Prevention Strategies',
      'To prevent spoofing, verification platforms check for anomalies like mismatching file edit timestamps, missing camera details, or coordinates that point to impossible locations. GeoTag Pro offers clean verification dashboards for insurance claims and remote inspection verification.'
    ],
    faqs: [
      { q: 'Can coordinates in EXIF be faked?', a: 'Standard EXIF data can be modified. To ensure absolute verification, platforms utilize secure capture flows, device coordinate verification, and cross-reference timestamps.' },
      { q: 'How does reverse geocoding work?', a: 'It queries coordinate sets against geographical databases to return human-readable street names, cities, and zip codes.' }
    ]
  },
  {
    slug: 'benefits-of-geotagged-images',
    title: '10 Benefits of Using Geotagged Images for Inspections',
    category: 'Guides',
    date: 'May 20, 2026',
    readTime: '9 min read',
    summary: 'Why construction managers, insurance companies, and utility surveyors are switching from normal photos to location-verified geotags.',
    content: [
      'Visual audits are standard for modern enterprise operations. However, without context, a photo of a crack in a pipe or a broken concrete footing is meaningless. Geotagging transforms simple files into structured assets. Here are ten benefits of implementing geotagging:',
      '### 1. Verifiable Proof of Presence',
      'Provide concrete proof that inspectors visited the exact coordinate at the designated time, preventing field log falsification.',
      '### 2. High-Accuracy Asset Mapping',
      'Pinpoint assets on digital map logs. Map pipelines, road signs, and electrical grids automatically.',
      '### 3. Streamlined Daily Logs',
      'Automate documentation. Export CSV tables with image tags, dates, and locations to save time on reports.'
    ],
    faqs: [
      { q: 'Do geotags work offline?', a: 'Yes. Browser APIs can save device coordinates and compile local data even when network connection is absent.' }
    ]
  },
  {
    slug: 'exif-metadata-explained',
    title: 'EXIF Metadata Explained: Inside the Headers of Your Photo Files',
    category: 'Education',
    date: 'May 15, 2026',
    readTime: '11 min read',
    summary: 'A deep dive into EXIF segments, TIFF headers, binary offsets, and how browsers parse image details.',
    content: [
      'Every digital photo contains hidden data. This data is written in Exchangeable Image File Format (EXIF) segments. EXIF acts as a passport for your images, containing device hardware profiles, exposure stats, and geographical markers.',
      '### Under the Hood of a JPEG File',
      'A JPEG file begins with a Start of Image (SOI) marker (`0xFFD8`). Right after, the file contains APP1 markers (`0xFFE1`), which contain the EXIF payload. This payload is structured like a TIFF header, containing pointers (offsets) to tags like Exposure, Focal Length, and GPS details.',
      '### Managing Your Data Footprint',
      'While EXIF data is highly useful for cataloging, it also poses security risks if private photos are posted online with home addresses. Modern platforms recommend scrubbing metadata before publishing assets.'
    ],
    faqs: [
      { q: 'Is EXIF supported by all browsers?', a: 'Browsers do not natively display EXIF properties. You need custom JS parsers like `exifr` to extract and display them.' }
    ]
  },
  {
    slug: 'gps-photos-for-construction-projects',
    title: 'Using GPS Photos to Document Construction Project Milestones',
    category: 'Industry',
    date: 'May 10, 2026',
    readTime: '14 min read',
    summary: 'How contractors and builders use geotagged daily progress reports to satisfy compliance requirements and accelerate payments.',
    content: [
      'Construction workflows depend on proof of progress. General contractors must prove to clients and lenders that milestones (foundations, framing, electrical rough-ins) are complete. Location-stamped progress photos provide the solution.',
      '### Creating the Build Audit Trail',
      'By capturing geotagged photos throughout a project lifecycle, contractors create a complete timeline. If disputes arise regarding build quality, the team can reference the exact coordinates and dates to check records.',
      '### Integrating with Client Dashboards',
      'With GeoTag Pro, managers can compile daily logs, export coordinates on map systems, and share clear reports with developers.'
    ],
    faqs: [
      { q: 'How do I export construction logs?', a: 'Select target logs on our Gallery console, and click Export CSV to compile coordinates and details.' }
    ]
  },
  {
    slug: 'location-verification-for-field-teams',
    title: 'How to Manage Location Verification for Remote Field Teams',
    category: 'Guides',
    date: 'May 05, 2026',
    readTime: '10 min read',
    summary: 'A blueprint for managers seeking to establish transparent, compliant field documentation processes.',
    content: [
      'Managing remote field workers requires trust. However, verifying that technicians visited specific sites can be challenging. Location verification platforms resolve this issue by tracking visual proofs.',
      '### Best Practices for Managers',
      '- **Clear Standard operating procedures**: Mandate that all photos must have GPS permission active.\n- **Sandbox tools**: Provide web utilities like GeoTag Pro to prevent app store installation issues.\n- **Consistent Audits**: Periodically cross-reference photo stamps with logged timesheets.'
    ],
    faqs: [
      { q: 'Do you track users in the background?', a: 'No. GeoTag Pro only accesses GPS location data at the moment you click "Capture" or edit tags.' }
    ]
  },
  {
    slug: 'gps-documentation-for-site-inspections',
    title: 'GPS Documentation Guidelines for Commercial Site Inspections',
    category: 'Guides',
    date: 'April 28, 2026',
    readTime: '13 min read',
    summary: 'Establish standardized protocols for commercial appraisal, safety compliance, and insurance reports.',
    content: [
      'Site inspections demand high-quality evidence. Standardized GPS coordinates ensure that all reports are legally defensible and compliant with industry regulations.',
      '### Guidelines for Inspectors',
      '1. **GPS Accuracy Checks**: Ensure the accuracy indicator is below 5 meters before taking photos.\n2. **Capture Key Features**: Take photos of site markers, building numbers, and structural issues.\n3. **Stamp description data**: Use the metadata editor to append notes and category tags directly into the file.'
    ],
    faqs: [
      { q: 'What accuracy is typical?', a: 'Most modern smartphones achieve GPS accuracy between 3 and 10 meters under open skies.' }
    ]
  },
  {
    slug: 'timestamp-photos-for-audits',
    title: 'Why Timestamp Photos Are Crucial for Regulatory Compliance Audits',
    category: 'Security',
    date: 'April 20, 2026',
    readTime: '12 min read',
    summary: 'How timestamped and geolocated images serve as immutable evidence for environmental, safety, and operational audits.',
    content: [
      'Regulatory compliance audits require concrete documentation. Simple lists or logs are easily edited. A geotagged photo with embedded GPS metadata represents a highly verifiable record.',
      '### Meeting Compliance Standards',
      'For EPA logs, OSHA inspections, and safety checks, visual evidence with certified timestamps prevents liability disputes. Using canvas stamp overlays ensures that coordinates are visible to inspectors reviewing files.'
    ],
    faqs: [
      { q: 'Can the stamped text be edited?', a: 'Once the visual stamp is rendered onto the image canvas, the text becomes part of the image pixels, making it highly secure.' }
    ]
  }
];

export const BlogSection: React.FC<{ onNavigate: (tab: any, pathSlug: string) => void }> = ({ onNavigate }) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Router slug parser for links
  const handleSelectArticleBySlug = (slug: string) => {
    const found = BLOG_ARTICLES.find(a => a.slug === slug);
    if (found) {
      setSelectedArticle(found);
      window.history.pushState(null, '', `/blog/${slug}`);
    }
  };

  const handleBackToBlogList = () => {
    setSelectedArticle(null);
    onNavigate('dashboard', '/dashboard');
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <button onClick={handleBackToBlogList} className="hover:text-brand-500 transition">Blog Home</button>
          <ChevronRight size={10} />
          <span className="text-slate-655 dark:text-slate-200 truncate">{selectedArticle.title}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={handleBackToBlogList}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-brand-500 dark:hover:text-brand-400 transition"
        >
          <ArrowLeft size={14} /> Back to Blog List
        </button>

        {/* Article Layout */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 md:p-10 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/20 text-brand-655 dark:text-brand-400 border border-brand-100/50 dark:border-brand-900/30 text-[10px] font-bold uppercase tracking-wider rounded-full">
              {selectedArticle.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-850 dark:text-white leading-tight">
              {selectedArticle.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-805/50 pb-4">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {selectedArticle.date}</span>
              <span className="flex items-center gap-1.5"><User size={12} /> By Audit Experts</span>
              <span className="flex items-center gap-1.5"><Clock size={12} /> {selectedArticle.readTime}</span>
            </div>
          </div>

          <div className="space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
            {selectedArticle.content.map((paragraph, idx) => {
              if (paragraph.startsWith('###')) {
                return (
                  <h2 key={idx} className="text-sm md:text-lg font-black text-slate-850 dark:text-white pt-4 pb-2 uppercase tracking-wide">
                    {paragraph.replace('###', '').trim()}
                  </h2>
                );
              }
              if (paragraph.startsWith('1.') || paragraph.startsWith('-')) {
                return (
                  <div key={idx} className="pl-4 border-l-2 border-brand-500 py-1 font-mono text-[11px]">
                    {paragraph}
                  </div>
                );
              }
              return <p key={idx}>{paragraph}</p>;
            })}
          </div>

          {/* FAQ Schema Markup UI */}
          {selectedArticle.faqs && selectedArticle.faqs.length > 0 && (
            <div className="mt-10 border-t border-slate-100 dark:border-slate-805/50 pt-8 space-y-4">
              <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <HelpCircle size={16} className="text-brand-500" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                {selectedArticle.faqs.map((faq, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850/50 space-y-1">
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white">{faq.q}</h4>
                    <p className="text-[11px] text-slate-450 font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-850 dark:text-white">Knowledge Hub & Inspection Blog</h2>
        <p className="text-xs text-slate-450 font-semibold">
          Discover guides, industry compliance standards, and technical documentation regarding image metadata and location audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_ARTICLES.map(article => (
          <div
            key={article.slug}
            onClick={() => handleSelectArticleBySlug(article.slug)}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-brand-400 transition duration-300 cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{article.category}</span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="text-sm font-black text-slate-850 dark:text-white leading-snug hover:text-brand-500 transition">
                {article.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold line-clamp-3">
                {article.summary}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/50 flex items-center gap-1 text-[10px] font-bold text-brand-655 dark:text-brand-400">
              <span>Read Full Guide</span>
              <ChevronRight size={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
