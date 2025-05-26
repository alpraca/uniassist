import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import MentorCard from '../components/mentors/MentorCard';

// Sample mentor data (in a real app, this would come from an API)
const mentors = [
  {
    name: "Sarah Johnson",
    title: "Senior Software Engineer",
    company: "Google",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/sarah-johnson",
    expertise: ["Software Engineering", "Machine Learning", "Cloud Computing"],
    description: "10+ years of experience in software development. Passionate about mentoring new developers and helping students break into tech.",
    universities: ["Stanford University", "MIT", "UC Berkeley"]
  },
  {
    name: "Michael Chen",
    title: "Entrepreneurship Professor",
    company: "Stanford University",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/michael-chen",
    expertise: ["Entrepreneurship", "Business Strategy", "Venture Capital"],
    description: "Teaching entrepreneurship for 15 years. Founded multiple successful startups and helped hundreds of students launch their ventures.",
    universities: ["Stanford University", "Harvard University"]
  },
  {
    name: "Emily Rodriguez",
    title: "Product Manager",
    company: "Microsoft",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/emily-rodriguez",
    expertise: ["Product Management", "UX Design", "Agile"],
    description: "Product leader with experience at top tech companies. Passionate about helping others transition into product management.",
    universities: ["University of Washington", "MIT"]
  },
  {
    name: "David Kim",
    title: "Data Scientist",
    company: "Netflix",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/david-kim",
    expertise: ["Data Science", "AI", "Python"],
    description: "Leading data science initiatives at Netflix. Previously worked at Amazon. Enjoys mentoring students in data science and machine learning.",
    universities: ["UC Berkeley", "Stanford University"]
  },
  {
    name: "Lisa Thompson",
    title: "Marketing Director",
    company: "Adobe",
    imageUrl: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/lisa-thompson",
    expertise: ["Digital Marketing", "Brand Strategy", "Content Marketing"],
    description: "20+ years in marketing leadership. Specializes in digital transformation and brand development. Mentors aspiring marketers.",
    universities: ["NYU", "Columbia University"]
  },
  {
    name: "James Wilson",
    title: "Investment Banker",
    company: "Morgan Stanley",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    linkedinUrl: "https://linkedin.com/in/james-wilson",
    expertise: ["Investment Banking", "Financial Analysis", "M&A"],
    description: "15+ years in investment banking. Helps students understand finance careers and prepare for interviews in the financial sector.",
    universities: ["Harvard University", "Columbia University", "LSE"]
  }
];

// Get unique expertise areas for filtering
const allExpertise = [...new Set(mentors.flatMap(mentor => mentor.expertise))];

// Sample user preferences (in a real app, this would come from your backend)
const sampleUserPreferences = {
  targetUniversities: ["Stanford University", "MIT", "Harvard University"],
  interests: ["Software Engineering", "Entrepreneurship", "Data Science"],
  academicLevel: "undergraduate"
};

const Mentors = () => {
  const { user } = useUser();
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [userPreferences, setUserPreferences] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState([]);

  useEffect(() => {
    // In a real app, fetch user preferences from your backend
    // For now, using sample data
    setUserPreferences(sampleUserPreferences);
  }, [user]);

  useEffect(() => {
    if (userPreferences) {
      // Filter mentors based on user's target universities and interests
      const recommended = mentors.filter(mentor => {
        const matchesUniversity = mentor.universities.some(university => 
          userPreferences.targetUniversities.includes(university)
        );
        const matchesInterests = mentor.expertise.some(skill => 
          userPreferences.interests.includes(skill)
        );
        return matchesUniversity || matchesInterests;
      });
      setRecommendedMentors(recommended);
    }
  }, [userPreferences]);

  // Filter mentors based on expertise and search query
  const filteredMentors = mentors.filter(mentor => {
    const matchesExpertise = selectedExpertise === 'All' || mentor.expertise.includes(selectedExpertise);
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesExpertise && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Connect with Mentors</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn from industry experts, entrepreneurs, and educators. Connect with mentors who can guide you through your educational and professional journey.
            </p>
          </div>

          {/* Recommended Mentors Section */}
          {recommendedMentors.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Recommended for You</h2>
                <div className="flex items-center text-sm text-primary">
                  <span>Based on your university preferences and interests</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedMentors.slice(0, 3).map((mentor, index) => (
                  <MentorCard key={`recommended-${index}`} mentor={mentor} />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Expertise</option>
              {allExpertise.map(expertise => (
                <option key={expertise} value={expertise}>
                  {expertise}
                </option>
              ))}
            </select>
          </div>

          {/* All Mentors Grid */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor, index) => (
                <MentorCard key={`all-${index}`} mentor={mentor} />
              ))}
            </div>
          </div>

          {/* No Results Message */}
          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No mentors found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Mentors; 