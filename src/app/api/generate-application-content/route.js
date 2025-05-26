import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { university, answers, socialLinks, userId } = await request.json();

    if (!university || !answers || !socialLinks || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a university admissions expert, analyze the following student profile and provide detailed recommendations for applying to ${university.name}.

Student Profile:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Social Media Profiles:
${Object.entries(socialLinks).map(([platform, url]) => `${platform}: ${url}`).join('\n')}

Please provide a detailed analysis in the following JSON format:
{
  "analysis": {
    "overallScore": 85,
    "categoryScores": {
      "academic": 90,
      "extracurricular": 80,
      "experience": 85,
      "fit": 85
    },
    "strengths": [
      "Strong academic performance in relevant subjects",
      "Leadership experience in extracurricular activities",
      "Clear alignment with university values"
    ],
    "improvements": [
      "Consider gaining more research experience",
      "Strengthen international exposure",
      "Add more technical certifications"
    ]
  },
  "recommendedPrograms": ["Program 1", "Program 2", "Program 3"],
  "scholarships": [
    {
      "name": "Merit Scholarship",
      "description": "Full tuition coverage for outstanding students",
      "amount": "$50,000",
      "deadline": "2024-12-15"
    }
  ],
  "timeline": [
    {
      "date": "2024-09-01",
      "task": "Begin application process"
    }
  ],
  "contacts": {
    "admissions": {
      "name": "Admissions Office",
      "email": "admissions@university.edu",
      "phone": "+1-555-0123",
      "hours": "Mon-Fri 9am-5pm EST"
    },
    "programCoordinator": {
      "name": "Dr. Smith",
      "email": "smith@university.edu",
      "phone": "+1-555-0124",
      "office": "Building A, Room 101"
    },
    "financialAid": {
      "name": "Financial Aid Office",
      "email": "finaid@university.edu",
      "phone": "+1-555-0125",
      "website": "university.edu/financial-aid"
    },
    "international": {
      "name": "International Student Office",
      "email": "international@university.edu",
      "phone": "+1-555-0126",
      "website": "university.edu/international"
    }
  },
  "suggestedEssayTopics": [
    {
      "title": "Academic and Career Goals",
      "prompt": "Describe your academic and career aspirations and how our university will help you achieve them.",
      "wordLimit": 650,
      "tips": [
        "Be specific about your goals",
        "Connect to the university's strengths",
        "Share personal experiences"
      ]
    },
    {
      "title": "Personal Challenge",
      "prompt": "Discuss a significant challenge you've overcome and how it has shaped you.",
      "wordLimit": 500,
      "tips": [
        "Focus on personal growth",
        "Show resilience",
        "Connect to future goals"
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the AI response as JSON
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating application content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 