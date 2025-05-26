import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import StudentCard from '../components/roommates/StudentCard';

// Sample student data with actual Clerk profile images
const students = [
  {
    name: "Alex Chen",
    clerkId: "user_2NNEqL3CW4",  // This will be replaced with actual Clerk user IDs
    major: "Computer Science",
    interests: ["Programming", "AI", "Basketball", "Photography"],
    livingPreferences: ["Night Owl", "No Smoking", "Social"],
    roommatePreferences: {
      rentRange: "$800 - $1200",
      moveInDate: "August 2024",
      duration: "Full Academic Year",
      location: "Near Campus",
      roomType: "Shared Room",
      cleanliness: "Very Clean",
      guests: "Occasionally"
    },
    bio: "CS major passionate about AI and machine learning. Looking for like-minded roommates who enjoy tech discussions and staying active.",
    socialLinks: {
      instagram: "https://instagram.com/alexchen",
      linkedin: "https://linkedin.com/in/alexchen"
    },
    targetUniversities: ["Stanford University", "MIT", "UC Berkeley"]
  },
  {
    name: "Sarah Martinez",
    clerkId: "user_2NNEqL3CW5",
    major: "Business Administration",
    interests: ["Entrepreneurship", "Tennis", "Reading", "Travel"],
    livingPreferences: ["Early Bird", "No Smoking", "Music"],
    roommatePreferences: {
      rentRange: "$1000 - $1500",
      moveInDate: "September 2024",
      duration: "Full Academic Year",
      location: "Downtown Area",
      roomType: "Private Room",
      cleanliness: "Clean",
      guests: "Rarely"
    },
    bio: "Future entrepreneur looking to connect with ambitious students. Love discussing business ideas and staying active with tennis.",
    socialLinks: {
      instagram: "https://instagram.com/sarahm",
      linkedin: "https://linkedin.com/in/sarahmartinez"
    },
    targetUniversities: ["Harvard University", "Stanford University", "Yale"]
  },
  {
    name: "James Wilson",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=c1f4cd",
    targetUniversities: ["MIT", "CalTech", "Georgia Tech"],
    major: "Mechanical Engineering",
    interests: ["Robotics", "3D Printing", "Soccer", "Gaming"],
    livingPreferences: ["Night Owl", "Social", "Music"],
    roommatePreferences: {
      rentRange: "$700 - $1000",
      moveInDate: "August 2024",
      duration: "Full Academic Year",
      location: "Near Engineering Building",
      roomType: "Shared Room",
      cleanliness: "Moderate",
      guests: "Weekends Only"
    },
    bio: "Mechanical engineering enthusiast with a love for robotics and innovation. Looking for roommates who enjoy tech and gaming sessions.",
    socialLinks: {
      instagram: "https://instagram.com/jameswilson",
      linkedin: "https://linkedin.com/in/jameswilson"
    }
  },
  {
    name: "Emily Zhang",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=ffd5e5",
    targetUniversities: ["UC Berkeley", "UCLA", "Stanford University"],
    major: "Data Science",
    interests: ["Machine Learning", "Hiking", "Photography", "Cooking"],
    livingPreferences: ["Early Bird", "No Smoking", "Social"],
    roommatePreferences: {
      rentRange: "$900 - $1300",
      moveInDate: "September 2024",
      duration: "Full Academic Year",
      location: "Quiet Neighborhood",
      roomType: "Private Room",
      cleanliness: "Very Clean",
      guests: "Occasionally"
    },
    bio: "Data science student who loves outdoor activities. Looking for active roommates who enjoy nature and trying new recipes.",
    socialLinks: {
      instagram: "https://instagram.com/emilyzhang",
      linkedin: "https://linkedin.com/in/emilyzhang"
    }
  },
  {
    name: "Michael Brown",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=d4f1f4",
    targetUniversities: ["Harvard University", "Columbia", "Yale"],
    major: "Economics",
    interests: ["Finance", "Basketball", "Chess", "Music"],
    livingPreferences: ["Night Owl", "Social", "Music"],
    roommatePreferences: {
      rentRange: "$1200 - $1800",
      moveInDate: "August 2024",
      duration: "Full Academic Year",
      location: "City Center",
      roomType: "Private Room",
      cleanliness: "Clean",
      guests: "Frequently"
    },
    bio: "Econ major with a passion for finance and sports. Looking for roommates who enjoy intellectual discussions and staying active.",
    socialLinks: {
      instagram: "https://instagram.com/michaelbrown",
      linkedin: "https://linkedin.com/in/michaelbrown"
    }
  }
];

// Sample user preferences
const sampleUserPreferences = {
  targetUniversities: ["Stanford University", "MIT", "Harvard University"],
  interests: ["Programming", "AI", "Basketball"],
  livingPreferences: ["Night Owl", "Social"],
  major: "Computer Science",
  roommatePreferences: {
    rentRange: "$800 - $1200",
    moveInDate: "August 2024",
    location: "Near Campus",
    roomType: "Shared Room",
    cleanliness: "Clean"
  }
};

const calculateCompatibility = (student, userPrefs) => {
  let score = 0;
  
  // University match (30%)
  const universityMatch = student.targetUniversities.some(uni => 
    userPrefs.targetUniversities.includes(uni)
  );
  if (universityMatch) score += 30;

  // Living preferences match (20%)
  const livingPrefMatch = student.livingPreferences.filter(pref => 
    userPrefs.livingPreferences.includes(pref)
  ).length;
  score += livingPrefMatch * 10;

  // Interests match (15%)
  const interestsMatch = student.interests.filter(interest => 
    userPrefs.interests.includes(interest)
  ).length;
  score += interestsMatch * 5;

  // Roommate preferences match (35%)
  const roommatePref = student.roommatePreferences;
  const userRoommatePref = userPrefs.roommatePreferences;
  
  // Rent range overlap (15%)
  const [studentMinRent, studentMaxRent] = roommatePref.rentRange.match(/\d+/g).map(Number);
  const [userMinRent, userMaxRent] = userRoommatePref.rentRange.match(/\d+/g).map(Number);
  if (studentMaxRent >= userMinRent && studentMinRent <= userMaxRent) score += 15;

  // Move-in date match (10%)
  if (roommatePref.moveInDate === userRoommatePref.moveInDate) score += 10;

  // Location preference match (5%)
  if (roommatePref.location === userRoommatePref.location) score += 5;

  // Room type match (5%)
  if (roommatePref.roomType === userRoommatePref.roomType) score += 5;

  return score;
};

const Roommates = () => {
  const { user } = useUser();
  const { users } = useClerk();
  const [userPreferences, setUserPreferences] = useState(null);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [rentFilter, setRentFilter] = useState('All');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [enrichedStudents, setEnrichedStudents] = useState([]);

  // Fetch actual user profile images from Clerk
  useEffect(() => {
    const enrichStudentsWithProfiles = async () => {
      try {
        const enriched = await Promise.all(
          students.map(async (student) => {
            try {
              const clerkUser = await users.getUser(student.clerkId);
              return {
                ...student,
                imageUrl: clerkUser.profileImageUrl || clerkUser.imageUrl,
                email: clerkUser.emailAddresses[0]?.emailAddress
              };
            } catch (error) {
              console.error(`Error fetching user ${student.clerkId}:`, error);
              return student;
            }
          })
        );
        setEnrichedStudents(enriched);
      } catch (error) {
        console.error('Error enriching students:', error);
        setEnrichedStudents(students);
      }
    };

    enrichStudentsWithProfiles();
  }, [users]);

  useEffect(() => {
    if (user) {
      // Get current user's preferences from their Clerk profile metadata
      const userPrefs = {
        targetUniversities: user.publicMetadata.targetUniversities || ["Stanford University", "MIT", "Harvard University"],
        interests: user.publicMetadata.interests || ["Programming", "AI", "Basketball"],
        livingPreferences: user.publicMetadata.livingPreferences || ["Night Owl", "Social"],
        major: user.publicMetadata.major || "Computer Science",
        roommatePreferences: user.publicMetadata.roommatePreferences || {
          rentRange: "$800 - $1200",
          moveInDate: "August 2024",
          location: "Near Campus",
          roomType: "Shared Room",
          cleanliness: "Clean"
        }
      };
      setUserPreferences(userPrefs);
    }
  }, [user]);

  useEffect(() => {
    if (userPreferences) {
      const studentsWithScores = enrichedStudents
        .map(student => ({
          ...student,
          compatibilityScore: calculateCompatibility(student, userPreferences)
        }))
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      setRecommendedStudents(studentsWithScores);
    }
  }, [userPreferences, enrichedStudents]);

  // Filter students based on all criteria
  const filteredStudents = enrichedStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.interests.some(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesUniversity = selectedUniversity === 'All' || 
      student.targetUniversities.includes(selectedUniversity);

    const matchesRent = rentFilter === 'All' || 
      student.roommatePreferences.rentRange === rentFilter;

    const matchesRoomType = roomTypeFilter === 'All' || 
      student.roommatePreferences.roomType === roomTypeFilter;

    return matchesSearch && matchesUniversity && matchesRent && matchesRoomType;
  });

  // Get unique values for filters
  const allUniversities = [...new Set(enrichedStudents.flatMap(student => student.targetUniversities))];
  const allRentRanges = [...new Set(enrichedStudents.map(student => student.roommatePreferences.rentRange))];
  const allRoomTypes = [...new Set(enrichedStudents.map(student => student.roommatePreferences.roomType))];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Roommate</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with potential roommates who share your interests, budget, and living preferences.
            </p>
          </div>

          {/* Recommended Roommates Section */}
          {recommendedStudents.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Best Matches for You</h2>
                <div className="flex items-center text-sm text-primary">
                  <span>Based on location, budget, and preferences</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedStudents.slice(0, 3).map((student, index) => (
                  <div key={`recommended-${index}`} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                        {Math.round(student.compatibilityScore)}% Match
                      </span>
                    </div>
                    <StudentCard student={student} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="All">All Universities</option>
                  {allUniversities.map(university => (
                    <option key={university} value={university}>
                      {university}
                    </option>
                  ))}
                </select>
                <select
                  value={rentFilter}
                  onChange={(e) => setRentFilter(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="All">All Rent Ranges</option>
                  {allRentRanges.map(range => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                <select
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="All">All Room Types</option>
                  {allRoomTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* All Students Grid */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Potential Roommates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student, index) => (
                <StudentCard key={`all-${index}`} student={student} />
              ))}
            </div>
          </div>

          {/* No Results Message */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No roommates found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Roommates; 