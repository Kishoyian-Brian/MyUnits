import Hero from '../features/home/components/Hero';
import Showcase from '../features/home/components/Showcase';
import Benefits from '../features/home/components/Benefits';
import Features from '../features/home/components/Features';
import Testimonials from '../features/home/components/Testimonials';
import Newsletter from '../features/home/components/Newsletter';

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <Benefits />
      <Features />
      <Testimonials />
      <Newsletter />
    </>
  );
}
