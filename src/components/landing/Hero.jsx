import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth/signup');
    }
  };

  const handleLearnMore = () => {
    // Smooth scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-blue-50 py-20 md:py-32">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
              Connect, Learn, and Grow with <span className="text-primary">UniAssist</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              The AI-powered educational networking platform for students, teachers, mentors, and companies to collaborate and thrive together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleGetStarted}
                className="btn btn-primary text-lg px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </button>
              <button 
                onClick={handleLearnMore}
                className="btn btn-outline text-lg px-8 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
              >
                Learn More
              </button>
            </div>
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white overflow-hidden"
                  >
                    <img 
                      src={`https://source.unsplash.com/random/100x100?face&${i}`} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="ml-4 text-gray-600">
                <span className="font-semibold">1000+</span> students already joined
              </p>
            </div>
          </motion.div>

          {/* Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <div className="aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
                  <p className="text-gray-500">Personalized educational experience with our advanced AI assistant</p>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-accent/20 rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 