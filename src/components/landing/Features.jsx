import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  HomeModernIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Assistant',
    description: 'Personalized AI assistant to guide you through your educational journey.',
    icon: SparklesIcon,
    path: '/dashboard/ai'
  },
  {
    name: 'University Search',
    description: 'Global university search with filters for location, tuition, and requirements.',
    icon: AcademicCapIcon,
    path: '/universities'
  },
  {
    name: 'Mentorship',
    description: 'Connect with mentors who can guide you in your academic and professional path.',
    icon: UserCircleIcon,
    path: '/mentors'
  },
  {
    name: 'Internships',
    description: 'Discover internship opportunities with leading companies in your field.',
    icon: BuildingOfficeIcon,
    path: '/opportunities'
  },
  {
    name: 'Social Networking',
    description: 'Message, connect, and collaborate with peers and professionals.',
    icon: ChatBubbleLeftRightIcon,
    path: '/network'
  },
  {
    name: 'Roommate Finder',
    description: 'Find compatible roommates for your university housing needs.',
    icon: HomeModernIcon,
    path: '/roommates'
  },
];

const Features = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFeatureClick = (path) => {
    if (user) {
      navigate(path);
    } else {
      navigate('/auth/signup?redirect=' + path);
    }
  };

  return (
    <section id="features" className="section bg-white py-20">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-primary font-semibold mb-2 block"
          >
            FEATURES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg"
          >
            UniAssist provides a comprehensive set of tools and features to help students, teachers, mentors, and companies connect and collaborate effectively.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              onClick={() => handleFeatureClick(feature.path)}
              className="card hover:shadow-lg hover:-translate-y-1 cursor-pointer p-6 rounded-xl bg-white border border-gray-100 transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 