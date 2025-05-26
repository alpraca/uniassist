import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { topic, university, answers, socialLinks, userId } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a university admissions expert, write a compelling essay for the following topic: "${topic}"

Context:
- University: ${university.name}
- Student Profile:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Social Media Profiles:
${Object.entries(socialLinks).map(([platform, url]) => `${platform}: ${url}`).join('\n')}

Please write a personal, engaging essay that:
1. Addresses the topic directly
2. Incorporates specific examples from the student's experiences
3. Demonstrates their passion and commitment
4. Aligns with the university's values and culture
5. Shows personal growth and reflection
6. Maintains authenticity and originality

The essay should be approximately 650 words (standard college essay length).`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const essay = response.text();

    return new Response(JSON.stringify({ essay }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating essay:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate essay' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 