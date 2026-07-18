const highlights = [
  'User profiles, posts, likes, comments, and follows',
  'JWT auth and protected backend routes',
  'MongoDB schemas designed for feed-driven data',
  'Frontend feed and profile UI in the next phase',
];

function App() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">CodeAlpha Internship</p>
        <h1>CodeAlpha Social Media App</h1>
        <p className="intro">
          Phase 1 scaffold is ready. The repo is split into backend and frontend
          folders so the next phases can focus on data models, social features,
          and feed interactions.
        </p>
        <div className="status-row">
          <span className="status-pill">Phase 1 complete</span>
          <span className="status-note">Waiting for your confirmation before Phase 2</span>
        </div>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Backend</h2>
          <p>Express server with MongoDB connection wiring and a health endpoint.</p>
        </article>
        <article className="info-card">
          <h2>Frontend</h2>
          <p>React + Vite starter prepared for the feed and profile screens.</p>
        </article>
        <article className="info-card">
          <h2>Next work</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default App;
