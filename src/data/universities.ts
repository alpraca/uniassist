interface AdmissionCriteria {
  minGPA: number;
  avgGPA: number;
  testScores: {
    SAT?: { min: number; avg: number };
    ACT?: { min: number; avg: number };
    IELTS?: { min: number };
    TOEFL?: { min: number };
  };
  acceptanceRate: number;
}

interface SuccessMetrics {
  graduationRate: number;
  employmentRate: number;
  avgStartingSalary: number;
  internshipRate: number;
  researchOpportunities: number; // Scale of 1-10
  industryConnections: number; // Scale of 1-10
}

export interface UniversityData {
  name: string;
  country: string;
  ranking: number;
  programs: string[];
  researchFocus: boolean;
  tuitionRange: string;
  admissionRate: string;
  strengths: string[];
  campusType: 'urban' | 'suburban' | 'rural';
  size: 'large' | 'medium' | 'small';
  admissionCriteria: AdmissionCriteria;
  successMetrics: SuccessMetrics;
  programSpecificInfo: {
    [key: string]: {
      ranking?: number;
      specializations: string[];
      researchAreas: string[];
      successRate: number;
    };
  };
}

export const universities: UniversityData[] = [
  {
    name: "Massachusetts Institute of Technology",
    country: "United States",
    ranking: 1,
    programs: ["Computer Science", "Engineering", "Physics", "Mathematics", "Business"],
    researchFocus: true,
    tuitionRange: "high",
    admissionRate: "highly selective",
    strengths: ["Technology", "Innovation", "Research", "Entrepreneurship"],
    campusType: "urban",
    size: "medium",
    admissionCriteria: {
      minGPA: 3.9,
      avgGPA: 4.0,
      testScores: {
        SAT: { min: 1500, avg: 1545 },
        ACT: { min: 34, avg: 35 },
        TOEFL: { min: 100 }
      },
      acceptanceRate: 0.07
    },
    successMetrics: {
      graduationRate: 0.94,
      employmentRate: 0.97,
      avgStartingSalary: 108000,
      internshipRate: 0.95,
      researchOpportunities: 10,
      industryConnections: 10
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 1,
        specializations: ["AI/ML", "Systems", "Theory", "Security"],
        researchAreas: ["Artificial Intelligence", "Robotics", "Quantum Computing"],
        successRate: 0.96
      }
    }
  },
  {
    name: "Stanford University",
    country: "United States",
    ranking: 2,
    programs: ["Computer Science", "Engineering", "Business", "Medicine", "Law"],
    researchFocus: true,
    tuitionRange: "high",
    admissionRate: "highly selective",
    strengths: ["Innovation", "Entrepreneurship", "Research", "Interdisciplinary Studies"],
    campusType: "suburban",
    size: "medium",
    admissionCriteria: {
      minGPA: 3.8,
      avgGPA: 3.96,
      testScores: {
        SAT: { min: 1440, avg: 1505 },
        ACT: { min: 32, avg: 34 },
        TOEFL: { min: 100 }
      },
      acceptanceRate: 0.04
    },
    successMetrics: {
      graduationRate: 0.94,
      employmentRate: 0.95,
      avgStartingSalary: 105000,
      internshipRate: 0.92,
      researchOpportunities: 10,
      industryConnections: 10
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 2,
        specializations: ["AI", "Systems", "HCI", "Theory"],
        researchAreas: ["Machine Learning", "Computer Vision", "NLP"],
        successRate: 0.95
      }
    }
  },
  {
    name: "University of California, Berkeley",
    country: "United States",
    ranking: 4,
    programs: ["Computer Science", "Engineering", "Business", "Physics", "Chemistry"],
    researchFocus: true,
    tuitionRange: "moderate",
    admissionRate: "very selective",
    strengths: ["Research", "Innovation", "Diversity", "Public Service"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.7,
      avgGPA: 3.89,
      testScores: {
        SAT: { min: 1330, avg: 1440 },
        ACT: { min: 29, avg: 32 },
        TOEFL: { min: 90 }
      },
      acceptanceRate: 0.16
    },
    successMetrics: {
      graduationRate: 0.91,
      employmentRate: 0.92,
      avgStartingSalary: 95000,
      internshipRate: 0.88,
      researchOpportunities: 9,
      industryConnections: 9
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 3,
        specializations: ["AI", "Security", "Graphics", "Theory"],
        researchAreas: ["AI", "Systems", "Programming Languages"],
        successRate: 0.93
      }
    }
  },
  {
    name: "Georgia Institute of Technology",
    country: "United States",
    ranking: 8,
    programs: ["Engineering", "Computer Science", "Business", "Design", "Sciences"],
    researchFocus: true,
    tuitionRange: "moderate",
    admissionRate: "selective",
    strengths: ["Technology", "Engineering", "Innovation", "Industry Connections"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.6,
      avgGPA: 3.8,
      testScores: {
        SAT: { min: 1300, avg: 1400 },
        ACT: { min: 28, avg: 31 },
        TOEFL: { min: 90 }
      },
      acceptanceRate: 0.21
    },
    successMetrics: {
      graduationRate: 0.87,
      employmentRate: 0.90,
      avgStartingSalary: 92000,
      internshipRate: 0.85,
      researchOpportunities: 8,
      industryConnections: 9
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 5,
        specializations: ["Systems", "Intelligence", "Information Security"],
        researchAreas: ["Machine Learning", "Cybersecurity", "HCI"],
        successRate: 0.89
      }
    }
  },
  {
    name: "University of Toronto",
    country: "Canada",
    ranking: 18,
    programs: ["Computer Science", "Engineering", "Business", "Life Sciences", "Arts"],
    researchFocus: true,
    tuitionRange: "moderate",
    admissionRate: "selective",
    strengths: ["Research", "Innovation", "Diversity", "Global Focus"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.5,
      avgGPA: 3.7,
      testScores: {
        IELTS: { min: 6.5 },
        TOEFL: { min: 89 }
      },
      acceptanceRate: 0.43
    },
    successMetrics: {
      graduationRate: 0.85,
      employmentRate: 0.88,
      avgStartingSalary: 75000,
      internshipRate: 0.80,
      researchOpportunities: 9,
      industryConnections: 8
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 10,
        specializations: ["AI", "Game Design", "Web Technologies"],
        researchAreas: ["Machine Learning", "Computer Vision", "Graphics"],
        successRate: 0.87
      }
    }
  },
  {
    name: "Rochester Institute of Technology",
    country: "United States",
    ranking: 112,
    programs: ["Engineering", "Computer Science", "Design", "Technology", "Business"],
    researchFocus: false,
    tuitionRange: "moderate",
    admissionRate: "selective",
    strengths: ["Hands-on Learning", "Industry Connections", "Co-op Programs", "Applied Technology"],
    campusType: "suburban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.3,
      avgGPA: 3.7,
      testScores: {
        SAT: { min: 1220, avg: 1300 },
        ACT: { min: 26, avg: 29 },
        TOEFL: { min: 88 }
      },
      acceptanceRate: 0.71
    },
    successMetrics: {
      graduationRate: 0.86,
      employmentRate: 0.94,
      avgStartingSalary: 85000,
      internshipRate: 0.95,
      researchOpportunities: 6,
      industryConnections: 9
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 65,
        specializations: ["Software Engineering", "Web Development", "Game Development"],
        researchAreas: ["Applied Computing", "Human-Computer Interaction"],
        successRate: 0.89
      }
    }
  },
  {
    name: "Northeastern University",
    country: "United States",
    ranking: 44,
    programs: ["Business", "Engineering", "Computer Science", "Health Sciences"],
    researchFocus: false,
    tuitionRange: "high",
    admissionRate: "selective",
    strengths: ["Co-op Program", "Experiential Learning", "Global Opportunities"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.6,
      avgGPA: 3.8,
      testScores: {
        SAT: { min: 1390, avg: 1450 },
        ACT: { min: 32, avg: 33 },
        TOEFL: { min: 92 }
      },
      acceptanceRate: 0.18
    },
    successMetrics: {
      graduationRate: 0.89,
      employmentRate: 0.96,
      avgStartingSalary: 89000,
      internshipRate: 0.98,
      researchOpportunities: 7,
      industryConnections: 9
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 15,
        specializations: ["Software Engineering", "Data Science", "Cybersecurity"],
        researchAreas: ["AI", "Networks", "Software Systems"],
        successRate: 0.92
      }
    }
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    ranking: 50,
    programs: ["Engineering", "Computer Science", "Mathematics", "Physics", "Chemistry"],
    researchFocus: true,
    tuitionRange: "free",
    admissionRate: "moderate",
    strengths: ["Engineering Excellence", "Research", "Industry Connections", "No Tuition Fees"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.0,
      avgGPA: 3.5,
      testScores: {
        IELTS: { min: 6.5 },
        TOEFL: { min: 88 }
      },
      acceptanceRate: 0.40
    },
    successMetrics: {
      graduationRate: 0.85,
      employmentRate: 0.92,
      avgStartingSalary: 65000,
      internshipRate: 0.90,
      researchOpportunities: 9,
      industryConnections: 9
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 18,
        specializations: ["AI", "Software Engineering", "Data Science"],
        researchAreas: ["Machine Learning", "Robotics", "Software Systems"],
        successRate: 0.88
      }
    }
  },
  {
    name: "University of Amsterdam",
    country: "Netherlands",
    ranking: 55,
    programs: ["Computer Science", "Business", "Psychology", "Economics", "Data Science"],
    researchFocus: false,
    tuitionRange: "moderate",
    admissionRate: "selective",
    strengths: ["International Environment", "Research", "Modern Facilities"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.0,
      avgGPA: 3.4,
      testScores: {
        IELTS: { min: 6.5 },
        TOEFL: { min: 90 }
      },
      acceptanceRate: 0.45
    },
    successMetrics: {
      graduationRate: 0.88,
      employmentRate: 0.91,
      avgStartingSalary: 58000,
      internshipRate: 0.85,
      researchOpportunities: 8,
      industryConnections: 8
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 45,
        specializations: ["AI", "Software Engineering", "Information Systems"],
        researchAreas: ["AI", "Data Science", "Security"],
        successRate: 0.89
      }
    }
  },
  {
    name: "University of British Columbia",
    country: "Canada",
    ranking: 37,
    programs: ["Computer Science", "Engineering", "Business", "Life Sciences", "Arts"],
    researchFocus: true,
    tuitionRange: "moderate",
    admissionRate: "selective",
    strengths: ["Research Excellence", "Beautiful Campus", "Strong Industry Connections"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 3.3,
      avgGPA: 3.7,
      testScores: {
        IELTS: { min: 6.5 },
        TOEFL: { min: 90 }
      },
      acceptanceRate: 0.52
    },
    successMetrics: {
      graduationRate: 0.88,
      employmentRate: 0.93,
      avgStartingSalary: 70000,
      internshipRate: 0.87,
      researchOpportunities: 9,
      industryConnections: 8
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 30,
        specializations: ["AI", "Software Engineering", "Data Science"],
        researchAreas: ["Machine Learning", "HCI", "Systems"],
        successRate: 0.90
      }
    }
  },
  {
    name: "Arizona State University",
    country: "United States",
    ranking: 121,
    programs: ["Computer Science", "Engineering", "Business", "Arts", "Sciences"],
    researchFocus: false,
    tuitionRange: "moderate",
    admissionRate: "inclusive",
    strengths: ["Innovation", "Online Programs", "Industry Partnerships"],
    campusType: "urban",
    size: "large",
    admissionCriteria: {
      minGPA: 2.5,
      avgGPA: 3.0,
      testScores: {
        SAT: { min: 1100, avg: 1250 },
        ACT: { min: 22, avg: 25 },
        TOEFL: { min: 80 }
      },
      acceptanceRate: 0.85
    },
    successMetrics: {
      graduationRate: 0.69,
      employmentRate: 0.85,
      avgStartingSalary: 65000,
      internshipRate: 0.80,
      researchOpportunities: 7,
      industryConnections: 8
    },
    programSpecificInfo: {
      "Computer Science": {
        ranking: 75,
        specializations: ["Software Engineering", "Web Development", "Cybersecurity"],
        researchAreas: ["Software Systems", "Cybersecurity"],
        successRate: 0.75
      }
    }
  }
];

// Define regions and their countries
const REGIONS_AND_COUNTRIES = {
  "Asia": [
    "Japan", "South Korea", "Singapore", "China", "Hong Kong", "Taiwan", 
    "Malaysia", "Vietnam", "Thailand", "India", "Indonesia"
  ],
  "Europe": [
    "United Kingdom", "Germany", "France", "Netherlands", "Italy", "Spain", 
    "Sweden", "Denmark", "Norway", "Finland", "Switzerland", "Ireland", 
    "Belgium", "Austria", "Poland", "Czech Republic", "Portugal", "Greece"
  ],
  "North America": ["United States", "Canada", "Mexico"],
  "Australia/Oceania": ["Australia", "New Zealand"]
};

export const getUniversityMatchScore = (university: UniversityData, profile: any): {
  matchScore: number;
  admissionChance: number;
  successChance: number;
  details: {
    academicMatch: number;
    admissionLikelihood: number;
    careerAlignment: number;
    researchAlignment: number;
    financialFit: number;
    locationMatch: number;
    programMatch: number;
  };
} => {
  const details = {
    academicMatch: 0,
    admissionLikelihood: 0,
    careerAlignment: 0,
    researchAlignment: 0,
    financialFit: 0,
    locationMatch: 0,
    programMatch: 0
  };

  // Location matching - more flexible approach
  if (profile.preferredRegions?.length > 0) {
    const isInPreferredRegion = profile.preferredRegions.some(region => 
      REGIONS_AND_COUNTRIES[region]?.includes(university.country)
    );
    details.locationMatch = isInPreferredRegion ? 100 : 50; // Give partial score for non-preferred regions
  } else {
    details.locationMatch = 100; // No preference specified
  }

  // Program matching - more flexible approach
  const programExists = university.programs.some(prog => 
    prog.toLowerCase().includes(profile.intendedMajor?.toLowerCase() || '') ||
    (profile.intendedMajor?.toLowerCase() || '').includes(prog.toLowerCase())
  );
  details.programMatch = programExists ? 100 : 50; // Give partial score for non-matching programs

  // Calculate academic match - more flexible approach
  if (profile.gpa && university.admissionCriteria.minGPA) {
    const gpa = parseFloat(profile.gpa);
    const minGPA = university.admissionCriteria.minGPA;
    const avgGPA = university.admissionCriteria.avgGPA;

    if (gpa >= avgGPA) {
      details.academicMatch = 100;
      details.admissionLikelihood = 90;
    } else if (gpa >= minGPA) {
      const range = avgGPA - minGPA;
      const aboveMin = gpa - minGPA;
      const percentInRange = (aboveMin / range) * 100;
      details.academicMatch = Math.min(100, 60 + percentInRange);
      details.admissionLikelihood = 50 + (percentInRange / 2);
    } else {
      const gpaRatio = gpa / minGPA;
      if (gpaRatio > 0.7) { // More lenient threshold
        details.academicMatch = 40;
        details.admissionLikelihood = 30;
      } else if (gpaRatio > 0.6) { // Even more lenient
        details.academicMatch = 30;
        details.admissionLikelihood = 20;
      } else {
        details.academicMatch = 20; // Minimum score instead of zero
        details.admissionLikelihood = 10;
      }
    }
  } else {
    // No GPA provided - give benefit of doubt
    details.academicMatch = 70;
    details.admissionLikelihood = 60;
  }

  // Adjust admission likelihood based on university's acceptance rate
  const acceptanceRate = university.admissionCriteria.acceptanceRate;
  if (details.admissionLikelihood > 0) {
    const scaledLikelihood = details.admissionLikelihood * (acceptanceRate * 1.5);
    details.admissionLikelihood = Math.min(95, Math.max(5, scaledLikelihood));
  }

  // Learning style matching - more balanced approach
  let learningStyleMatch = 80; // Higher default score
  if (profile.learningStyle === 'research-oriented') {
    learningStyleMatch = university.researchFocus ? 100 : 70;
  } else if (profile.learningStyle === 'hands-on') {
    learningStyleMatch = university.researchFocus ? 70 : 100;
  }
  details.researchAlignment = learningStyleMatch;

  // Career prospects and success metrics
  if (university.successMetrics) {
    const employmentScore = university.successMetrics.employmentRate * 100;
    const internshipScore = university.successMetrics.internshipRate * 100;
    const industryScore = university.successMetrics.industryConnections * 10;
    
    details.careerAlignment = Math.round(
      (employmentScore * 0.4) +
      (internshipScore * 0.4) +
      (industryScore * 0.2)
    );
  } else {
    details.careerAlignment = 80; // Higher default score
  }

  // Financial fit - more flexible approach
  if (profile.tuitionPreference === 'free') {
    details.financialFit = university.tuitionRange === 'free' ? 100 :
                          university.tuitionRange === 'low' ? 80 :
                          university.tuitionRange === 'moderate' ? 60 : 40;
  } else if (profile.tuitionPreference === 'low-cost') {
    details.financialFit = university.tuitionRange === 'free' ? 100 :
                          university.tuitionRange === 'low' ? 90 :
                          university.tuitionRange === 'moderate' ? 80 : 60;
  } else {
    details.financialFit = 100; // No preference specified
  }

  // Calculate final scores with adjusted weights
  const totalScore = (
    details.academicMatch * 0.25 +
    details.programMatch * 0.25 +
    details.locationMatch * 0.15 +
    details.researchAlignment * 0.15 +
    details.careerAlignment * 0.1 +
    details.financialFit * 0.1
  );

  const admissionChance = details.admissionLikelihood;
  const successChance = Math.round((details.academicMatch + details.careerAlignment) / 2);

  return {
    matchScore: Math.round(totalScore),
    admissionChance: Math.round(admissionChance),
    successChance,
    details
  };
}; 