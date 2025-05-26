import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Universities from '../components/landing/Universities';
import Mentorship from '../components/landing/Mentorship';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import Footer from '../components/common/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Universities />
      <Mentorship />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing; 