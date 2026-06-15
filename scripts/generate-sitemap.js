import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://gps-camera-app-wmps.vercel.app';

const CORE_ROUTES = [
  '/',
  '/dashboard'
];

const LANDING_SLUGS = [
  '/gps-camera-app',
  '/geotag-photo-app',
  '/photo-location-tracker',
  '/gps-image-verification',
  '/exif-metadata-editor',
  '/field-inspection-photo-app',
  '/construction-site-photo-reporting',
  '/real-estate-inspection-photos',
  '/survey-photo-management',
  '/gps-photo-tracking-software',
  '/location-verification-platform',
  '/gps-timestamp-camera',
  '/gps-camera-app-vs-timestamp-camera',
  '/best-geotagging-software',
  '/gps-location-proof',
  '/field-inspection-software',
  '/geotagged-photos',
  '/gps-photo-verification',
  '/construction-site-photo-documentation',
  '/survey-photo-app'
];

const BLOG_SLUGS = [
  '/blog/how-to-add-gps-coordinates-to-photos',
  '/blog/best-gps-camera-apps',
  '/blog/what-is-geotagging',
  '/blog/how-gps-photo-verification-works',
  '/blog/benefits-of-geotagged-images',
  '/blog/exif-metadata-explained',
  '/blog/gps-photos-for-construction-projects',
  '/blog/location-verification-for-field-teams',
  '/blog/gps-documentation-for-site-inspections',
  '/blog/timestamp-photos-for-audits'
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add Core Routes
  CORE_ROUTES.forEach(route => {
    const priority = route === '/' ? '1.0' : '0.8';
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add Landing Pages
  LANDING_SLUGS.forEach(slug => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  // Add Blogs
  BLOG_SLUGS.forEach(slug => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>\n';

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap generated successfully at ${outputPath}`);
};

generateSitemap();
