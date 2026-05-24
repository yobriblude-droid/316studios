import { db } from '../src/database';

function verifyDatabase() {
  console.log('Verifying database population…');

  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
  console.log(`Users: ${userCount}`);

  const portfolioCount = (db.prepare('SELECT COUNT(*) as count FROM portfolios').get() as { count: number }).count;
  console.log(`Portfolios: ${portfolioCount}`);

  const projectCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  console.log(`Projects: ${projectCount} (target: 30+)`);

  const unsplashProjects = (
    db.prepare(`SELECT COUNT(*) as count FROM projects WHERE images LIKE '%unsplash%'`).get() as { count: number }
  ).count;
  console.log(`Projects with external placeholder URLs: ${unsplashProjects}`);

  const mediaCount = (db.prepare('SELECT COUNT(*) as count FROM client_files').get() as { count: number }).count;
  console.log(`Client files: ${mediaCount}`);

  const serviceCount = (db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }).count;
  console.log(`Services: ${serviceCount}`);

  const slideCount = (db.prepare('SELECT COUNT(*) as count FROM hero_slides').get() as { count: number }).count;
  const emptySlides = (
    db.prepare(`SELECT COUNT(*) as count FROM hero_slides WHERE image IS NULL OR image = ''`).get() as { count: number }
  ).count;
  console.log(`Hero slides: ${slideCount} (empty images: ${emptySlides})`);

  const locationCount = (db.prepare('SELECT COUNT(*) as count FROM site_locations').get() as { count: number }).count;
  console.log(`Locations: ${locationCount}`);

  const testimonialCount = (db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number }).count;
  console.log(`Testimonials: ${testimonialCount}`);

  console.log('\nSample project image URLs:');
  const projects = db.prepare('SELECT title, images FROM projects LIMIT 3').all() as Array<{ title: string; images: string }>;
  projects.forEach((p) => {
    const imgs = JSON.parse(p.images) as string[];
    console.log(`  - ${p.title}: ${imgs[0] ?? '(none)'}`);
  });

  console.log('\nVerification complete.');
}

verifyDatabase();
