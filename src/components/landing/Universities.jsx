import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const universities = [
  {
    id: 1,
    name: 'Harvard University',
    location: 'Cambridge, MA',
    image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Harvard',
    programs: '200+ Programs',
    country: 'United States',
    tuition: '$50,000+',
    programsList: ['Business', 'Engineering', 'Computer Science', 'Medicine']
  },
  {
    id: 2,
    name: 'Stanford University',
    location: 'Stanford, CA',
    image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Stanford',
    programs: '180+ Programs',
    country: 'United States',
    tuition: '$50,000+',
    programsList: ['Business', 'Engineering', 'Computer Science', 'Medicine']
  },
  {
    id: 3,
    name: 'MIT',
    location: 'Cambridge, MA',
    image: 'https://placehold.co/400x300/e2e8f0/64748b?text=MIT',
    programs: '150+ Programs',
    country: 'United States',
    tuition: '$50,000+',
    programsList: ['Business', 'Engineering', 'Computer Science', 'Medicine']
  },
  {
    id: 4,
    name: 'Oxford University',
    location: 'Oxford, UK',
    image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Oxford',
    programs: '220+ Programs',
    country: 'Europe',
    tuition: '$30,000+',
    programsList: ['Business', 'Engineering', 'Computer Science', 'Medicine']
  },
];

const Universities = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Any Location');
  const [tuition, setTuition] = useState('Any Tuition');
  const [program, setProgram] = useState('Any Program');

  const handleViewDetails = (universityId) => {
    navigate(`/universities/${universityId}`);
  };

  const handleBrowseAll = () => {
    navigate('/universities');
  };

  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = location === 'Any Location' || university.country === location;
    const matchesTuition = tuition === 'Any Tuition' || university.tuition === tuition;
    const matchesProgram = program === 'Any Program' || university.programsList.includes(program);
    return matchesSearch && matchesLocation && matchesTuition && matchesProgram;
  });

  return (
    <section id="universities" className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-primary font-semibold mb-2 block"
          >
            UNIVERSITIES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Find Your Perfect University
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg"
          >
            Search and filter through thousands of universities worldwide to find the one that matches your academic goals and preferences.
          </motion.p>
        </div>

        {/* Search and Filter UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-xl shadow-md p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition appearance-none bg-white"
                >
                  <option>Any Location</option>
                  <option>United States</option>
                  <option>Europe</option>
                  <option>Asia</option>
                  <option>Australia</option>
                </select>
              </div>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select 
                  value={tuition}
                  onChange={(e) => setTuition(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition appearance-none bg-white"
                >
                  <option>Any Tuition</option>
                  <option>Under $10,000</option>
                  <option>$10,000 - $20,000</option>
                  <option>$20,000 - $30,000</option>
                  <option>$30,000+</option>
                </select>
              </div>
              <div className="relative">
                <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select 
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition appearance-none bg-white"
                >
                  <option>Any Program</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Computer Science</option>
                  <option>Medicine</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* University Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUniversities.map((university, index) => (
            <motion.div
              key={university.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={university.image}
                  alt={university.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-1">{university.name}</h3>
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{university.location}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{university.programs}</span>
                </div>
                <button 
                  onClick={() => handleViewDetails(university.id)}
                  className="mt-4 w-full btn btn-outline text-sm"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={handleBrowseAll}
            className="btn btn-primary"
          >
            Browse All Universities
          </button>
        </div>
      </div>
    </section>
  );
};

export default Universities; 