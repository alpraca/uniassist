import { motion } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CTA = () => {
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
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTryAI = () => {
    if (user) {
      navigate('/dashboard/ai');
    } else {
      navigate('/auth/signup?redirect=/dashboard/ai');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Educational Journey?
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Join UniAssist today and connect with students, teachers, mentors, and companies. 
              Let our AI assistant guide you to the perfect educational path.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleGetStarted}
                className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 rounded-lg transition-all"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </button>
              <button 
                onClick={handleLearnMore}
                className="btn border border-white text-white hover:bg-white/10 text-lg px-8 py-3 rounded-lg transition-all"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Assistance</h3>
              </div>
              <p className="mb-6 opacity-90">
                Our AI assistant will help you navigate through:
              </p>
              <ul className="space-y-3 mb-6">
                {['University selection', 'Mentor matching', 'Career guidance', 'Skill development'].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="text-center">
                <button 
                  onClick={handleTryAI}
                  className="btn bg-white text-primary hover:bg-gray-100 w-full rounded-lg transition-all"
                >
                  {user ? 'Open AI Assistant' : 'Try AI Assistant'}
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-white/10 rounded-full"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 