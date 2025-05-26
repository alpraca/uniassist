import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Define regions and their countries more comprehensively
const REGIONS_AND_COUNTRIES = {
  "Europe": {
    countries: [
      "United Kingdom", "Germany", "France", "Netherlands", "Italy", "Spain", 
      "Sweden", "Denmark", "Norway", "Finland", "Switzerland", "Ireland", 
      "Belgium", "Austria", "Poland", "Czech Republic", "Portugal", "Greece"
    ],
    neighbors: {
      "Germany": ["Netherlands", "Belgium", "France", "Switzerland", "Austria", "Poland", "Denmark"],
      "France": ["Belgium", "Germany", "Switzerland", "Italy", "Spain"],
      "United Kingdom": ["Ireland"],
      "Netherlands": ["Germany", "Belgium"],
      "Italy": ["France", "Switzerland", "Austria"],
      "Spain": ["France", "Portugal"],
      "Poland": ["Germany", "Czech Republic"],
      "Switzerland": ["France", "Germany", "Italy", "Austria"]
    }
  },
  "North America": {
    countries: ["United States", "Canada", "Mexico"],
    neighbors: {
      "United States": ["Canada", "Mexico"],
      "Canada": ["United States"],
      "Mexico": ["United States"]
    }
  },
  "Asia": {
    countries: [
      "Japan", "South Korea", "Singapore", "China", "Hong Kong", "Taiwan", 
      "Malaysia", "Vietnam", "Thailand", "India", "Indonesia"
    ],
    neighbors: {
      "China": ["Japan", "South Korea", "Vietnam", "Thailand", "Malaysia"],
      "Japan": ["South Korea"],
      "South Korea": ["Japan"],
      "Vietnam": ["Thailand", "Malaysia"],
      "Malaysia": ["Thailand", "Indonesia", "Singapore"]
    }
  },
  "Australia/Oceania": {
    countries: ["Australia", "New Zealand"],
    neighbors: {
      "Australia": ["New Zealand"],
      "New Zealand": ["Australia"]
    }
  }
};

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniIdx, setSelectedUniIdx] = useState(null);
  const [compatibility, setCompatibility] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    budget: 'all',
    region: 'all',
    country: 'all',
    studyLevel: 'all'
  });
  const [neighboringCountries, setNeighboringCountries] = useState([]);
  const navigate = useNavigate();

  // Get all countries for the dropdown
  const getAllCountries = () => {
    const countries = new Set();
    Object.values(REGIONS_AND_COUNTRIES).forEach(region => {
      region.countries.forEach(country => countries.add(country));
    });
    return Array.from(countries).sort();
  };

  // Get neighboring countries for a selected country
  const getNeighboringCountries = (country) => {
    for (const region of Object.values(REGIONS_AND_COUNTRIES)) {
      if (region.neighbors[country]) {
        return region.neighbors[country];
      }
    }
    return [];
  };

  // Handle country selection
  const handleCountryChange = (country) => {
    setFilters(prev => ({ ...prev, country }));
    if (country !== 'all') {
      const neighbors = getNeighboringCountries(country);
      setNeighboringCountries(neighbors);
    } else {
      setNeighboringCountries([]);
    }
    if (searchTerm) searchUniversities(searchTerm);
  };

  // Search universities using Gemini AI
  const searchUniversities = async (query) => {
    if (!query.trim()) {
      setUniversities([]);
      setError('');
      return;
    }

    setSearching(true);
    setError('');
    
    try {
      const selectedCountry = filters.country;
      const selectedRegion = filters.region;
      
      // Build location context for the search
      let locationContext = '';
      let regionCountries = [];
      
      if (selectedRegion !== 'all') {
        regionCountries = REGIONS_AND_COUNTRIES[selectedRegion]?.countries || [];
        locationContext = `Strictly show ONLY universities from these countries in ${selectedRegion}: ${regionCountries.join(', ')}. DO NOT include universities from any other countries or regions.`;
      } else if (selectedCountry !== 'all') {
        const neighboringCountriesStr = neighboringCountries.length > 0
          ? `and also consider universities in neighboring countries: ${neighboringCountries.join(', ')}`
          : '';
        locationContext = `Focus on universities in ${selectedCountry} ${neighboringCountriesStr}.`;
      }

      // Build budget context
      let budgetContext = '';
      switch (filters.budget) {
        case 'low':
          budgetContext = 'Only show universities with tuition under $15,000/year';
          break;
        case 'medium':
          budgetContext = 'Only show universities with tuition between $15,000-$30,000/year';
          break;
        case 'high':
          budgetContext = 'Only show universities with tuition above $30,000/year';
          break;
        default:
          budgetContext = 'Consider universities of all tuition levels';
      }

      const prompt = `You are a university search API endpoint. Your ONLY response must be a JSON array of universities. DO NOT include any other text, markdown, or explanations.

Search Term: "${query}"
${locationContext}
Budget Requirement: ${budgetContext}
Study Level: ${filters.studyLevel !== 'all' ? filters.studyLevel + ' programs' : 'all levels'}

Response Requirements:
1. Return ONLY a JSON array - no other text
2. Each university MUST be from specified region/countries
3. Each university MUST be accredited
4. Each university MUST match study level: ${filters.studyLevel !== 'all' ? filters.studyLevel : 'any'}
5. Each university MUST match budget constraints
6. Each object MUST have ALL these fields:
{
  "name": "Full Official University Name",
  "country": "Country Name",
  "description": "Brief description including accreditation status and notable achievements",
  "programs": "Available programs relevant to the search",
  "website": "Official university website URL",
  "tuitionRange": "Specific annual tuition range in USD",
  "accommodation": "Monthly accommodation cost range in USD",
  "rating": "Numerical rating (1-5)",
  "accreditationStatus": "Official accreditation status",
  "foundedYear": "Year of establishment",
  "globalRanking": "Current global ranking if available",
  "isNeighboringCountry": false
}

DO NOT include any text before or after the JSON array. Response must be parseable JSON.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          const responseText = data.candidates[0].content.parts[0].text;
          // First try to find JSON content between backticks
          let jsonText = responseText.match(/```json\n?([\s\S]*?)\n?```/)?.[1];
          
          // If no JSON found between backticks, try to parse the entire response
          if (!jsonText) {
            jsonText = responseText.trim();
          }

          // Remove any remaining markdown artifacts and clean the text
          jsonText = jsonText.replace(/```/g, '').trim();
          
          console.log('Attempting to parse JSON:', jsonText);
          
          const aiResponse = JSON.parse(jsonText);
          
          if (Array.isArray(aiResponse) && aiResponse.length > 0) {
            // Strict filtering based on region/country
            const filteredResults = aiResponse.filter(uni => {
              if (!uni || typeof uni !== 'object') return false;
              
              // Region filter
              if (selectedRegion !== 'all') {
                return REGIONS_AND_COUNTRIES[selectedRegion]?.countries.includes(uni.country);
              }
              
              // Country filter
              if (selectedCountry !== 'all') {
                return uni.country === selectedCountry || neighboringCountries.includes(uni.country);
              }

              // Budget filter
              if (uni.tuitionRange) {
              const tuition = parseFloat(uni.tuitionRange.replace(/[^0-9.]/g, ''));
                if (!isNaN(tuition)) {
              if (filters.budget === 'low' && tuition > 15000) return false;
              if (filters.budget === 'medium' && (tuition < 15000 || tuition > 30000)) return false;
              if (filters.budget === 'high' && tuition < 30000) return false;
                }
              }

              return true;
            });

            setUniversities(filteredResults);
            if (filteredResults.length === 0) {
              setError(`No universities found in ${selectedRegion !== 'all' ? selectedRegion : selectedCountry}. Try adjusting your filters.`);
            }
          } else {
            console.error('Invalid AI response format:', aiResponse);
            setError('No universities found. Try different search terms!');
          }
        } catch (e) {
          console.error('Failed to parse AI response:', e, '\nResponse text:', data.candidates[0].content.parts[0].text);
          setError('Sorry, something went wrong with processing the results. Try different search terms!');
        }
      } else {
        setError('No results found. Please try again!');
      }
    } catch (error) {
      console.error('Error searching universities:', error);
      setError('An error occurred. Please try again!');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => searchUniversities(value), 1000);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    if (searchTerm) searchUniversities(searchTerm);
  };

  useEffect(() => {
    return () => {
      if (window.searchTimeout) clearTimeout(window.searchTimeout);
    };
  }, []);

  // Ask AI for compatibility when a university is selected
  const handleCheckCompatibility = async (uni, idx) => {
    setSelectedUniIdx(idx);
    setCompatibility('');
    setLoading(true);
    try {
      const prompt = `You are a friendly university advisor helping a student evaluate their fit with ${uni.name} in ${uni.country}.

University Information:
- Name: ${uni.name}
- Country: ${uni.country}
- Programs: ${uni.programs}
- Tuition: ${uni.tuitionRange}
- Accommodation: ${uni.accommodation}
- Global Ranking: ${uni.globalRanking || 'Not available'}
- Founded: ${uni.foundedYear}
- Accreditation: ${uni.accreditationStatus}

Provide a personalized analysis in this format:
1. Start with a warm, friendly greeting
2. Highlight 3-4 key strengths of this university
3. Discuss potential challenges or considerations
4. Mention unique opportunities (research, internships, etc.)
5. Give practical advice about what to consider next
6. End with an encouraging note

Keep the tone casual and supportive, like a knowledgeable friend giving advice. Use emojis and friendly language, but maintain professionalism.

Format the response in clear sections with emojis and bullet points for easy reading.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      let aiText = 'Sorry, I could not generate an analysis at this time.';
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        aiText = data.candidates[0].content.parts[0].text;
      }
      setCompatibility(aiText);
    } catch (error) {
      console.error('Error generating compatibility analysis:', error);
      setCompatibility('Sorry, I encountered an error while analyzing compatibility. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add image error handling function
  const handleImageError = (event) => {
    const universityName = event.target.alt;
    event.target.src = `https://source.unsplash.com/featured/?university,${encodeURIComponent(universityName)},campus`;
  };

  const getUniversityLogo = (universityName) => {
    // Map of universities to their logos using reliable CDN
    const universityLogos = {
      'Massachusetts Institute of Technology': 'https://cdn.freebiesupply.com/logos/large/2x/mit-massachusetts-institute-of-technology-logo-png-transparent.png',
      'Stanford University': 'https://cdn.freebiesupply.com/logos/large/2x/stanford-university-logo-png-transparent.png',
      'University of California, Berkeley': 'https://cdn.freebiesupply.com/logos/large/2x/uc-berkeley-california-golden-bears-logo-png-transparent.png',
      'Georgia Institute of Technology': 'https://cdn.freebiesupply.com/logos/large/2x/georgia-tech-yellow-jackets-logo-png-transparent.png',
      'University of Toronto': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-toronto-logo-png-transparent.png',
      'Harvard University': 'https://cdn.freebiesupply.com/logos/large/2x/harvard-university-logo-png-transparent.png',
      'University of Oxford': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-oxford-logo-png-transparent.png',
      'University of Cambridge': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-cambridge-logo-png-transparent.png',
      'ETH Zurich': 'https://cdn.freebiesupply.com/logos/large/2x/eth-zurich-logo-png-transparent.png',
      'National University of Singapore': 'https://cdn.freebiesupply.com/logos/large/2x/national-university-of-singapore-logo-png-transparent.png',
      'University of Tokyo': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-tokyo-logo-png-transparent.png',
      'Peking University': 'https://cdn.freebiesupply.com/logos/large/2x/peking-university-logo-png-transparent.png',
      'University of Melbourne': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-melbourne-logo-png-transparent.png',
      'Technical University of Munich': 'https://cdn.freebiesupply.com/logos/large/2x/technical-university-of-munich-logo-png-transparent.png',
      'University of British Columbia': 'https://cdn.freebiesupply.com/logos/large/2x/university-of-british-columbia-logo-png-transparent.png'
    };

    return universityLogos[universityName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(universityName)}&background=random&size=200&bold=true&format=png`;
  };

  // Add function to handle saving and navigation
  const handleSaveAndNavigate = (university) => {
    try {
      // Save to local storage with university ID
      const savedUniversities = JSON.parse(localStorage.getItem('savedUniversities') || '[]');
      const universityWithId = {
        ...university,
        id: university.id || `${university.name}-${university.country}`.toLowerCase().replace(/\s+/g, '-')
      };
      savedUniversities.push(universityWithId);
      localStorage.setItem('savedUniversities', JSON.stringify(savedUniversities));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving university:', error);
      setError('Failed to save university. Please try again.');
    }
  };

  // Update the Prepare to Apply button click handler
  const handlePrepareToApply = (uni) => {
    handleSaveAndNavigate(uni);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect University
          </h1>
          <p className="text-gray-600 text-lg">Discover universities that match your preferences and budget</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search universities..."
            className="lg:col-span-2 p-4 rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm transition-all"
            value={searchTerm}
            onChange={handleSearchInput}
          />
          
          <select
            className="p-4 rounded-xl border-2 border-blue-100 bg-white"
            value={filters.budget}
            onChange={(e) => handleFilterChange('budget', e.target.value)}
          >
            <option value="all">All Budgets</option>
            <option value="low">Under $15,000/year</option>
            <option value="medium">$15,000-$30,000/year</option>
            <option value="high">Above $30,000/year</option>
          </select>

          <select
            className="p-4 rounded-xl border-2 border-blue-100 bg-white"
            value={filters.country}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="all">All Countries</option>
            {getAllCountries().map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            className="p-4 rounded-xl border-2 border-blue-100 bg-white"
            value={filters.studyLevel}
            onChange={(e) => handleFilterChange('studyLevel', e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        {/* Neighboring Countries Notice */}
        {neighboringCountries.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-blue-700">
              Also showing options from neighboring countries: {neighboringCountries.join(', ')}
            </p>
          </div>
        )}

        {/* Loading State */}
        {searching && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-500 mb-8 p-4 bg-red-50 rounded-xl">
            {error}
          </div>
        )}

        {/* University Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {universities.map((uni, idx) => (
            <motion.div
              key={uni.name + idx}
              className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border ${
                uni.isNeighboringCountry ? 'border-blue-200' : 'border-gray-100'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              {/* University Logo */}
              <div className="h-48 overflow-hidden relative bg-white flex items-center justify-center p-4">
                <img 
                  src={uni.imageUrl || getUniversityLogo(uni.name)}
                  alt={`${uni.name} logo`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(e.target.alt)}&background=random&size=200&bold=true&format=png`;
                  }}
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/50 to-transparent z-20">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{uni.name}</h2>
                  <p className="text-sm text-white/90 drop-shadow-md">
                    {uni.country}
                    {uni.isNeighboringCountry && (
                      <span className="ml-2 px-2 py-1 bg-blue-500 rounded-full text-xs">
                        Neighboring Country
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {uni.rating ? `${uni.rating}★` : 'New'}
                  </span>
                  {uni.accreditationStatus && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {uni.accreditationStatus}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{uni.description}</p>

                {/* Additional Info */}
                {uni.foundedYear && (
                  <div className="text-sm text-gray-500 mb-2">
                    Founded: {uni.foundedYear}
                  </div>
                )}
                {uni.globalRanking && (
                  <div className="text-sm text-gray-500 mb-2">
                    Global Ranking: {uni.globalRanking}
                  </div>
                )}

                {/* Cost Information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{uni.tuitionRange || 'Tuition varies by program'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{uni.accommodation || 'Accommodation info available on request'}</span>
                  </div>
                </div>

                {/* Programs Preview */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Notable Programs:</h3>
                  <p className="text-sm text-gray-600">{uni.programs}</p>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <a 
                      href={uni.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                      Visit Website
                    </a>
                    <button
                      onClick={() => handleCheckCompatibility(uni, idx)}
                      className="flex-1 py-2 rounded-lg bg-indigo-100 text-indigo-600 font-medium hover:bg-indigo-200 transition-colors"
                      disabled={loading && selectedUniIdx === idx}
                    >
                      {loading && selectedUniIdx === idx ? 'Analyzing...' : 'Check Fit'}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-500 bg-white">Ready to apply?</span>
                    </div>
                  </div>

                  {/* Prepare to Apply button */}
                  <button
                    onClick={() => handlePrepareToApply(uni)}
                    className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Save & Continue
                  </button>
                </div>

                {/* Compatibility Analysis */}
                {selectedUniIdx === idx && compatibility && (
                  <motion.div 
                    className="mt-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 text-gray-800 text-sm border border-blue-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="font-medium text-indigo-600 mb-2">Your Compatibility Analysis:</div>
                    <div className="whitespace-pre-line">{compatibility}</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {!searching && universities.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Start searching to discover universities!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities; 