import Footer from './Footer';
import Header from './Header';

export default function AppShell({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
