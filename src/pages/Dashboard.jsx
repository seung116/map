import AppShell from '../components/AppShell';
import MapExplorer from '../components/MapExplorer';

export default function Dashboard({ records }) {
  return (
    <AppShell>
      <main>
        <section className="content-grid map-section home-map-section">
          <div>
            <div className="section-heading home-map-heading">
              <h1>날 기억할 지도...</h1>
            </div>
            <MapExplorer
              records={records}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}
