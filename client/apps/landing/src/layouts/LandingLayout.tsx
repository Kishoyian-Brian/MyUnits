import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingLayout() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main className='landing-main'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
