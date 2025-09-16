'use client';

const DUMMY_IMAGE = '/assets/dummy-project.jpg'; // Local dummy image

export default function ProjectList({ projects = [] }) {
  if (!projects.length) {
    return <div style={{ padding: 20, color: '#555' }}>No projects yet — waiting for scraper...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {projects.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '16px',
            background: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          {/* Project Image */}
          <div style={{ width: '200px', height: '140px', flexShrink: 0 }}>
            <img
              src={p.image || DUMMY_IMAGE}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Project Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#d32f2f', marginBottom: '6px' }}>
                {p.name}
              </div>
              <div style={{ color: '#555', marginBottom: '4px', fontSize: '14px' }}>{p.location}</div>
              <div style={{ color: '#d32f2f', fontWeight: 600, marginBottom: '4px', fontSize: '16px' }}>
                Price: {p.priceRange}
              </div>
              <div style={{ color: '#555', marginBottom: '4px', fontSize: '14px' }}>Builder: {p.builder}</div>
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>
              Coords: {p.coords ? `${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}` : 'N/A'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
