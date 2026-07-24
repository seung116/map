import Footer from './Footer';
import Header from './Header';

export default function AppShell({ children, hideHeaderOnMobile = false }) {
  return (
    <>
      <div className={hideHeaderOnMobile ? 'mobile-hidden-header' : ''}>
        <Header />
      </div>
      {children}
      <Footer />
    </>
  );
}
