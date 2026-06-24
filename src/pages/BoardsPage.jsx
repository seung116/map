import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { boards } from '../data/travelData';

export default function BoardsPage({ records }) {
  return (
    <AppShell>
      <main className="page">
        <section className="section-heading">
          <p>Shared Boards</p>
          <h1>함께 쓰는 여행 보드</h1>
        </section>
        <div className="board-grid">
          {boards.map((board) => {
            const boardRecords = records.filter((record) => record.board === board);
            const members = [...new Set(boardRecords.flatMap((record) => record.companions.split(',').map((name) => name.trim()).filter(Boolean)))];
            return (
              <article key={board} className="board-card">
                <h2>{board}</h2>
                <p>{boardRecords.length}개의 기록 · {members.length || 1}명의 멤버</p>
                <div className="chip-row">
                  {members.length ? members.map((member) => <span key={member}>{member}</span>) : <span>나</span>}
                </div>
                <Link to="/write">사진이나 메모 추가</Link>
              </article>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
