import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

const developmentLogs = [
  {
    period: '초기 방향',
    title: '여행 기록을 지도 중심으로 모으기',
    description: '전국 지역별 여행 기록, 사진, 메모를 한 화면에서 이어볼 수 있는 기본 구조를 만들었습니다.',
    items: ['여행/데이트 모드 분리', '지역별 기록 작성', '앨범과 통계 화면 구성'],
  },
  {
    period: '기록 확장',
    title: '데이트 아카이브와 달력 연결',
    description: '데이트 기록을 별도 흐름으로 분리하고, 날짜 기준으로 추억을 다시 찾아볼 수 있게 정리했습니다.',
    items: ['데이트 전용 대시보드', '전체 기록 달력', '데이트 상세 페이지'],
  },
  {
    period: '운영 기능',
    title: '회원 승인과 관리자 페이지 추가',
    description: '서비스를 함께 쓰는 사람을 관리할 수 있도록 가입 승인, 역할 변경, 기록 사진 수 확인 기능을 넣었습니다.',
    items: ['가입 승인 대기 화면', '관리자 전용 회원 관리', '회원별 사진 개수 표시'],
  },
  {
    period: '프로필 개선',
    title: '커플 프로필 저장과 사진 보기',
    description: '마이페이지에서 이름, 애칭, 생일, 특징, 프로필 사진을 저장하고 사진을 크게 볼 수 있게 개선했습니다.',
    items: ['프로필 사진 압축 저장', 'Firebase Storage 업로드 보강', '프로필 사진 확대 모달'],
  },
  {
    period: '현재',
    title: '서비스 발전 기록 페이지',
    description: '서비스가 어떻게 발전해왔는지 남길 수 있는 개발기록 페이지를 추가했습니다.',
    items: ['모드 선택 화면 개발기록 링크', '개발 타임라인', '다음 개선 항목 정리'],
  },
];

const nextPlans = [
  '사진 업로드 실패 원인을 사용자에게 더 자세히 안내하기',
  '기록 검색과 태그 필터 추가하기',
  '모바일에서 앨범과 지도 탐색 흐름 다듬기',
];

export default function DevLogPage() {
  return (
    <AppShell>
      <main className="page devlog-page">
        <section className="section-heading inline">
          <div>
            <h1>개발기록</h1>
            <span>서비스가 어떤 방향으로 발전해왔는지 남기는 공간입니다.</span>
          </div>
          <Link to="/select">처음 화면</Link>
        </section>

        <section className="devlog-summary" aria-label="개발 기록 요약">
          <article>
            <span>기록된 단계</span>
            <strong>{developmentLogs.length}</strong>
          </article>
          <article>
            <span>최근 개선</span>
            <strong>프로필</strong>
          </article>
          <article>
            <span>다음 방향</span>
            <strong>탐색 개선</strong>
          </article>
        </section>

        <section className="devlog-timeline" aria-label="서비스 발전 타임라인">
          {developmentLogs.map((log) => (
            <article className="devlog-entry" key={log.title}>
              <div className="devlog-marker" aria-hidden="true" />
              <div className="devlog-entry-body">
                <span>{log.period}</span>
                <h2>{log.title}</h2>
                <p>{log.description}</p>
                <div className="chip-row">
                  {log.items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="devlog-next">
          <h2>다음에 남길 개선 기록</h2>
          <ul>
            {nextPlans.map((plan) => <li key={plan}>{plan}</li>)}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
