import Footer from './Footer';
import Header from './Header';
import NotificationCenter from './NotificationCenter';

export default function AppShell({ children, hideHeaderOnMobile = false }) {
  return (
    <>
      <div className={hideHeaderOnMobile ? 'mobile-hidden-header' : ''}>
        <Header />
      </div>
      <NotificationCenter />
      {children}
      <Footer />
    </>
  );
}
