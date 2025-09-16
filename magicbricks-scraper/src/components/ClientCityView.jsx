'use client';
import { useEffect, useState } from 'react';
import useProjectsStore from '../store/useProjectsStore';
import MapView from './MapView';
import ProjectList from './ProjectList';

const DUMMY_IMAGE = '/assets/build1.jpg'; // local dummy image

export default function ClientCityView({ cityName }) {
  const addProject = useProjectsStore((s) => s.addProject);
  const projects = useProjectsStore((s) => s.projects);
  const clear = useProjectsStore((s) => s.clear);
  const [status, setStatus] = useState('idle'); // idle | streaming | done | error

  useEffect(() => {
    clear();
    setStatus('streaming');
    const es = new EventSource(`/api/stream-projects?city=${encodeURIComponent(cityName)}`);

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed?.type === 'project' && parsed.project) {
          if (!parsed.project.image) {
            parsed.project.image = DUMMY_IMAGE;
          }
          addProject(parsed.project);
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    };

    es.addEventListener('done', () => {
      setStatus('done');
      es.close();
    });

    es.onerror = (err) => {
      console.error('SSE error', err);
      setStatus('error');
      es.close();
    };

    return () => es.close();
  }, [cityName, clear, addProject]);

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        padding: '20px',
        minHeight: '100vh',
        background: '#f8f8f8',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Left side - Project List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '16px', color: '#d32f2f' }}>
          Projects in {cityName}
        </h1>

        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#555' }}>
          <strong>Status:</strong> {status} • <strong>Received:</strong> {projects.length}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '8px',
          }}
        >
          <ProjectList projects={projects} />
        </div>
      </div>

      {/* Right side - Map */}
      <div
        style={{
          width: '600px',
          maxWidth: '45%',
          height: '90vh',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: '#fff',
        }}
      >
        <MapView projects={projects} cityName={cityName} />
      </div>
    </div>
  );
}
