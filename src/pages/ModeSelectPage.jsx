import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

export default function ModeSelectPage() {
  return (
    <AppShell>
      <main className="page mode-select-page">
        <section className="section-heading">
          <p>Choose Archive</p>
          <h1>어떤 추억을 기록할까요?</h1>
          <span>여행과 데이트를 따로 모아볼 수 있어요.</span>
        </section>

        <div className="mode-select-grid">
          <Link className="mode-card travel-mode" to="/travel">
            <span>Travel Map</span>
            <h2>여행 지도</h2>
            <p>전국 여행 기록을 지도와 앨범으로 모아보기</p>
          </Link>

          <Link className="mode-card date-mode" to="/date">
            <span>Date Archive</span>
            <h2>데이트 기록</h2>
            <p>우리의 데이트 장소, 사진, 기념일을 따로 기록하기</p>
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
