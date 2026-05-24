import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProjectGallery } from '../components/ui/ProjectGallery';
import { PageHero } from '../components/ui/PageHero';
import { layout, type ProjectItem, type PortfolioItem } from '../lib/layout';

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioSlug = searchParams.get('portfolio') || 'All';

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    Promise.all([fetch('/api/projects').then((r) => r.json()), fetch('/api/portfolios').then((r) => r.json())])
      .then(([p, pf]) => {
        setProjects(p);
        setPortfolios(pf);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilter('All');
  }, [portfolioSlug]);

  const portfolioFiltered =
    portfolioSlug === 'All'
      ? projects
      : projects.filter((p) => {
          const pf = portfolios.find((x) => x.slug === portfolioSlug);
          return pf ? p.portfolioId === pf.id : true;
        });

  const categories = ['All', ...Array.from(new Set(portfolioFiltered.map((p) => p.category)))];

  const setPortfolio = (slug: string) => {
    if (slug === 'All') setSearchParams({});
    else setSearchParams({ portfolio: slug });
    setFilter('All');
  };

  return (
    <div className={layout.page}>
      <PageHero
        eyebrow="Our Work"
        title="Galleries"
        description="Browse albums and projects — open any shoot instantly, full screen."
        image={projects[0]?.images?.[0]}
        compact
      />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={layout.sectionDefault}
      >
        <ProjectGallery
          projects={portfolioFiltered}
          portfolios={portfolios}
          portfolioSlug={portfolioSlug}
          onPortfolioChange={setPortfolio}
          filter={filter}
          onFilterChange={setFilter}
          categories={categories as string[]}
          loading={loading}
        />
      </motion.section>
    </div>
  );
}
