import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  AcademicCapIcon, 
  MusicalNoteIcon, 
  UserGroupIcon,
  MoonIcon,
  SunIcon,
  NoSymbolIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  HomeIcon,
  SparklesIcon,
  LinkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const StudentCard = ({ student }) => {
  const [imageError, setImageError] = useState(false);
  const { 
    name, 
    imageUrl, 
    targetUniversities, 
    major,
    interests,
    livingPreferences,
    roommatePreferences,
    bio,
    socialLinks,
    email
  } = student;

  const handleImageError = () => {
    setImageError(true);
  };

  const renderPreferenceIcon = (preference) => {
    switch(preference) {
      case 'Night Owl':
        return <MoonIcon className="h-4 w-4" />;
      case 'Early Bird':
        return <SunIcon className="h-4 w-4" />;
      case 'No Smoking':
        return <NoSymbolIcon className="h-4 w-4" />;
      case 'Social':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'Music':
        return <MusicalNoteIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleConnectLinkedIn = () => {
    if (socialLinks.linkedin) {
      window.open(socialLinks.linkedin, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="relative">
        {imageError ? (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <UserCircleIcon className="w-24 h-24 text-gray-400" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            onError={handleImageError}
            className="w-full h-48 object-cover bg-gray-100"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* LinkedIn Connect Button */}
        {socialLinks.linkedin && (
          <button
            onClick={handleConnectLinkedIn}
            className="absolute top-4 right-4 bg-[#0A66C2] text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-[#004182] transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Connect
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-semibold">{name}</h3>
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-sm text-primary hover:text-primary/80"
            >
              Contact
            </a>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-3">Studying {major}</p>
        
        {/* Target Universities */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <AcademicCapIcon className="h-4 w-4" />
            <span>Target Universities</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {targetUniversities.map((university, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
              >
                {university}
              </span>
            ))}
          </div>
        </div>

        {/* Roommate Preferences */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <HomeIcon className="h-4 w-4" />
            <span>Housing Preferences</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
              <span>{roommatePreferences.rentRange}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-orange-600" />
              <span>{roommatePreferences.moveInDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-red-600" />
              <span>{roommatePreferences.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <HomeIcon className="h-4 w-4 text-purple-600" />
              <span>{roommatePreferences.roomType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
              <SparklesIcon className="h-3 w-3" />
              {roommatePreferences.cleanliness}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
              <UserGroupIcon className="h-3 w-3" />
              Guests: {roommatePreferences.guests}
            </span>
          </div>
        </div>

        {/* Living Style */}
        <div className="mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <UserGroupIcon className="h-4 w-4" />
            <span>Living Style</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {livingPreferences.map((pref, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1"
              >
                {renderPreferenceIcon(pref)}
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {bio}
        </p>

        {/* Social Links */}
        <div className="flex gap-3">
          {socialLinks.instagram && (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-pink-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#0A66C2]"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCard; 