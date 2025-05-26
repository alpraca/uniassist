import { motion } from 'framer-motion';
import { BriefcaseIcon, AcademicCapIcon, UserGroupIcon, StarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const mentors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    role: 'Professor of Computer Science',
    university: 'Stanford University',
    image: 'https://placehold.co/300x300/e2e8f0/64748b?text=SJ',
    rating: 4.9,
    reviews: 124,
    expertise: ['Machine Learning', 'AI Ethics', 'Data Science'],
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Senior Software Engineer',
    university: 'Google',
    image: 'https://placehold.co/300x300/e2e8f0/64748b?text=MC',
    rating: 4.8,
    reviews: 98,
    expertise: ['Web Development', 'System Design', 'Cloud Architecture'],
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    role: 'Associate Professor of Business',
    university: 'Harvard Business School',
    image: 'https://placehold.co/300x300/e2e8f0/64748b?text=ER',
    rating: 4.7,
    reviews: 87,
    expertise: ['Entrepreneurship', 'Marketing Strategy', 'Business Analytics'],
  },
];

const Mentorship = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFindMentor = () => {
    if (user) {
      navigate('/mentors');
    } else {
      navigate('/auth/signup?redirect=/mentors');
    }
  };

  const handleViewAllMentors = () => {
    if (user) {
      navigate('/mentors');
    } else {
      navigate('/auth/signup?redirect=/mentors');
    }
  };

  const handleViewMentorDetails = (mentorId) => {
    if (user) {
      navigate(`/mentors/${mentorId}`);
    } else {
      navigate(`/auth/signup?redirect=/mentors/${mentorId}`);
    }
  };

  const handleViewInternshipDetails = (company) => {
    if (user) {
      navigate(`/opportunities/${company.toLowerCase()}`);
    } else {
      navigate(`/auth/signup?redirect=/opportunities/${company.toLowerCase()}`);
    }
  };

  const handleBrowseAllInternships = () => {
    if (user) {
      navigate('/opportunities');
    } else {
      navigate('/auth/signup?redirect=/opportunities');
    }
  };

  return (
    <section id="mentorship" className="section bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold mb-2 block">MENTORSHIP</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Connect with Expert Mentors and Find Internships</h2>
            <p className="text-gray-600 text-lg mb-8">
              Get guidance from industry professionals and academics who can help you navigate your educational and career path. Find internships that match your skills and aspirations.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <AcademicCapIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Academic Guidance</h3>
                  <p className="text-gray-600 text-sm">Get advice on courses, research, and academic decisions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <BriefcaseIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Career Development</h3>
                  <p className="text-gray-600 text-sm">Prepare for your career with expert industry insights</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <UserGroupIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Networking</h3>
                  <p className="text-gray-600 text-sm">Build valuable professional connections</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-2 rounded-lg mr-3">
                  <StarIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Skill Development</h3>
                  <p className="text-gray-600 text-sm">Learn practical skills from industry experts</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleFindMentor}
              className="btn btn-primary"
            >
              Find a Mentor
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary to-accent p-1 rounded-2xl shadow-xl">
              <div className="bg-white p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Featured Mentors</h3>
                <div className="space-y-6">
                  {mentors.map((mentor) => (
                    <div 
                      key={mentor.name} 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => handleViewMentorDetails(mentor.id)}
                    >
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{mentor.name}</h4>
                        <p className="text-sm text-gray-600">{mentor.role}</p>
                        <p className="text-xs text-gray-500">{mentor.university}</p>
                        <div className="flex items-center mt-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium ml-1">{mentor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({mentor.reviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleViewAllMentors}
                    className="btn btn-outline w-full"
                  >
                    View All Mentors
                  </button>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/20 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary/20 rounded-full"></div>
          </motion.div>
        </div>

        {/* Internship Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mt-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-4"
            >
              Discover Internship Opportunities
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-600"
            >
              Find internships that match your skills, interests, and career goals. Connect directly with companies offering opportunities.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Google', 'Microsoft', 'Amazon'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              >
                <div className="h-12 mb-4 flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-gray-600">{company[0]}</span>
                  </div>
                  <h3 className="ml-3 font-semibold">{company}</h3>
                </div>
                <h4 className="font-semibold mb-2">Software Engineering Intern</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Join our team to work on cutting-edge technology projects and gain valuable industry experience.
                </p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Remote / On-site</span>
                  <span>12 weeks</span>
                </div>
                <button 
                  onClick={() => handleViewInternshipDetails(company)}
                  className="btn btn-outline w-full text-sm"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={handleBrowseAllInternships}
              className="btn btn-primary"
            >
              Browse All Internships
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mentorship; 