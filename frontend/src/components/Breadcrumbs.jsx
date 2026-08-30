import { Link } from 'react-router-dom';
import { breadcrumbTrail } from '../seo/schema';

// Visible trail matching the BreadcrumbList JSON-LD emitted for the same route.
// Google requires the markup to reflect what's actually on the page, so both
// read from breadcrumbTrail() rather than being declared twice.
//
// Renders nothing on '/' — a single-item breadcrumb on the home page is noise.
export default function Breadcrumbs({ pathname }) {
  const trail = breadcrumbTrail(pathname);
  if (!trail) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 16 }}>
      <ol
        style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          listStyle: 'none', margin: 0, padding: 0,
          fontSize: 12.5, color: 'var(--text3)',
        }}
      >
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isLast ? (
                <span aria-current="page" style={{ color: 'var(--text2)' }}>{crumb.name}</span>
              ) : (
                <Link to={crumb.path} style={{ color: 'var(--text3)' }}>{crumb.name}</Link>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
