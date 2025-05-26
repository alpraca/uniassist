import { GoogleGenerativeAI } from "@google/generative-ai";

interface UserProfile {
  gpa: number;
  intendedMajor: string;
  preferredRegions?: string[];
  tuitionPreference?: 'free' | 'low-cost' | 'any';
  learningStyle?: 'research-oriented' | 'hands-on';
  testScores?: {
    SAT?: number;
    ACT?: number;
    IELTS?: number;
    TOEFL?: number;
  };
}

interface UniversityRecommendation {
  name: string;
  country: string;
  matchScore: number;
  admissionChance: number;
  programDetails: {
    availablePrograms: string[];
    ranking?: number;
    tuitionRange: string;
    admissionRequirements: string;
  };
  reasonsForMatch: string[];
}

export class UniversityAIService {
  private genAI: any;
  private model: any;

  constructor(apiKey: string) {
    try {
      if (!apiKey || apiKey.trim() === '') {
        console.error('No API key provided or API key is empty');
        throw new Error('API key is required');
      }
      console.log('Initializing Gemini AI with API key:', apiKey.substring(0, 4) + '...');
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('Successfully initialized Gemini AI service');
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      throw error;
    }
  }

  private async generatePrompt(profile: UserProfile): Promise<string> {
    // Calculate academic level based on GPA
    const academicLevel = profile.gpa >= 3.7 ? "excellent" :
                         profile.gpa >= 3.3 ? "very good" :
                         profile.gpa >= 3.0 ? "good" :
                         profile.gpa >= 2.5 ? "fair" : "needs improvement";

    // Format test scores if available
    const testScoresText = profile.testScores ? 
      Object.entries(profile.testScores)
        .filter(([_, score]) => score !== undefined && score !== null)
        .map(([test, score]) => `${test}: ${score}`)
        .join(', ') : 'No standardized test scores provided';

    const prompt = `You are a university admissions expert. Based on this student's profile, suggest specific universities that would be good matches. Return ONLY a JSON array of universities.

STUDENT PROFILE:
---------------
- GPA: ${profile.gpa}/4.0 (${academicLevel} academic standing)
- Major: ${profile.intendedMajor}
- Test Scores: ${testScoresText}
- Preferred Regions: ${profile.preferredRegions?.join(', ') || 'Any'}
- Tuition Preference: ${profile.tuitionPreference || 'Any'}
- Learning Style: ${profile.learningStyle || 'Not specified'}

RESPONSE FORMAT:
--------------
Return a JSON array of exactly 10 universities with this structure:
[{
  "name": "University Name",
  "country": "Country",
  "matchScore": <number 0-100>,
  "admissionChance": <number 0-100>,
  "programDetails": {
    "availablePrograms": ["Specific programs matching ${profile.intendedMajor}"],
    "ranking": <world ranking number if available>,
    "tuitionRange": "free/low/moderate/high",
    "admissionRequirements": "Specific requirements including minimum GPA, test scores",
    "campusLocation": {
      "cityType": "large/medium/small",
      "type": "urban/suburban/rural"
    }
  },
  "reasonsForMatch": [
    "3-4 specific reasons why this university matches the student"
  ]
}]

REQUIREMENTS:
------------
1. Include a mix of safety (90%+ chance), target (60-80% chance), and reach (30-50% chance) schools
2. Base admission chances on the ${profile.gpa} GPA and ${testScoresText}
3. Focus on universities in: ${profile.preferredRegions?.join(', ') || 'any region'}
4. Consider the ${profile.tuitionPreference || 'any'} tuition preference
5. Match the ${profile.learningStyle || 'unspecified'} learning style
6. Provide specific program names, not generic fields
7. Include only accredited institutions
8. Give realistic admission chances and rankings
9. Return ONLY the JSON array with no additional text

ADDITIONAL INSTRUCTIONS:
----------------------
1. For each university, ensure the programs listed are SPECIFIC to the student's major (${profile.intendedMajor})
2. Include detailed admission requirements with specific GPA and test score thresholds
3. Consider the student's learning style (${profile.learningStyle || 'not specified'}) when suggesting universities
4. If the student prefers ${profile.tuitionPreference || 'any'} tuition, prioritize matching universities
5. Ensure geographic diversity within the preferred regions: ${profile.preferredRegions?.join(', ') || 'any region'}
6. Include a mix of university sizes and campus types
7. Match scores should reflect how well the university matches ALL aspects of the student's profile
8. Admission chances should be realistic based on the student's academic profile

Return the JSON array directly with no additional text or formatting.`;

    console.log('Generated prompt:', prompt);
    return prompt;
  }

  public async getUniversityRecommendations(profile: UserProfile): Promise<UniversityRecommendation[]> {
    try {
      if (!profile.gpa || !profile.intendedMajor) {
        throw new Error('GPA and intended major are required');
      }

      console.log('Generating recommendations for profile:', profile);
      
      const prompt = await this.generatePrompt(profile);
      console.log('Sending prompt to Gemini AI...');

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });

      if (!result?.response) {
        console.error('No response received from Gemini AI');
        throw new Error('No response from AI service');
      }

      const text = result.response.text();
      console.log('Raw AI response:', text);

      try {
        // Clean the response text to ensure it's valid JSON
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        console.log('Cleaned response text:', cleanedText);
        
        const recommendations = JSON.parse(cleanedText);
        
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          console.error('Invalid recommendations format:', recommendations);
          throw new Error('Invalid recommendations format');
        }

        console.log('Successfully parsed recommendations:', recommendations);

        // Validate and normalize each recommendation
        return recommendations.map(rec => ({
          name: rec.name || 'Unknown University',
          country: rec.country || 'Unknown Country',
          matchScore: Math.min(100, Math.max(0, Number(rec.matchScore) || 50)),
          admissionChance: Math.min(100, Math.max(0, Number(rec.admissionChance) || 50)),
          programDetails: {
            availablePrograms: Array.isArray(rec.programDetails?.availablePrograms) 
              ? rec.programDetails.availablePrograms 
              : [profile.intendedMajor],
            ranking: Number(rec.programDetails?.ranking) || undefined,
            tuitionRange: rec.programDetails?.tuitionRange || 'moderate',
            admissionRequirements: rec.programDetails?.admissionRequirements || 'Contact university for requirements'
          },
          reasonsForMatch: Array.isArray(rec.reasonsForMatch) && rec.reasonsForMatch.length > 0
            ? rec.reasonsForMatch
            : [
                `Matches your ${profile.intendedMajor} major requirements`,
                `Suitable for your academic profile (${profile.gpa} GPA)`,
                `Offers programs aligned with your interests`
              ]
        }));
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        console.error('Raw response that failed parsing:', text);
        throw new Error('Failed to parse university recommendations');
      }
    } catch (error) {
      console.error('Error in getUniversityRecommendations:', error);
      throw error;
    }
  }
} 