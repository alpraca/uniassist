import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: Request) {
  try {
    const { messages, topic, university, profile } = await request.json();
    const userMessage = messages[messages.length - 1].content.toLowerCase();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let systemContext = `You are an expert college admissions consultant helping a student write an essay for ${university.name}. 

Topic: ${topic.title}
Prompt: ${topic.prompt}
Word Limit: ${topic.wordLimit}

Student Profile:
- Academic Goals: ${profile.goals}
- Relevant Experience: ${profile.experience}
- Key Achievements: ${profile.achievements}
- Extracurricular Activities: ${profile.extracurricular}

University Context:
- University Name: ${university.name}
- University Strengths: ${university.strengths?.join(', ') || 'Not specified'}
- Program Focus: ${university.programSpecificInfo?.[topic.title]?.description || 'General program'}

When generating essay content:
1. Maintain a personal and authentic voice
2. Include specific examples from the student's background
3. Connect experiences to future goals
4. Show alignment with university values
5. Follow the word limit
6. Address all aspects of the prompt
7. Demonstrate growth and self-reflection

When providing an essay, wrap it with ===ESSAY_START=== and ===ESSAY_END=== tags.`;

    let response;

    // Handle different user intents
    if (userMessage.includes('generate') || userMessage.includes('complete essay') || userMessage === '1') {
      response = await model.generateContent(`${systemContext}

Please generate a complete essay draft that incorporates the student's experiences and achievements while addressing the prompt. Format the response as:

Here's a complete essay draft for your review:

===ESSAY_START===
[Essay content here]
===ESSAY_END===

Would you like me to explain any part of the essay or make any adjustments?`);
    } else if (userMessage.includes('outline') || userMessage === '2') {
      response = await model.generateContent(`${systemContext}

Please create a detailed outline for the essay. Include:
1. Introduction approach
2. Main points to cover
3. Specific examples to use
4. Conclusion strategy

After providing the outline, ask if they'd like to expand any section into a full draft.`);
    } else if (userMessage.includes('highlight') || userMessage === '3') {
      response = await model.generateContent(`${systemContext}

Analyze the student's profile and suggest which experiences and achievements would be most impactful to highlight in the essay. Consider:
1. Relevance to the prompt
2. Alignment with university values
3. Demonstration of personal growth
4. Unique perspectives or experiences

After the analysis, ask if they'd like to generate a draft focusing on these aspects.`);
    } else if (userMessage.includes('experience') || userMessage === '4') {
      response = await model.generateContent(`${systemContext}

Let's discuss which specific experience or achievement would make the strongest foundation for your essay. I'll analyze your profile and suggest the most compelling options, explaining why each would work well.

After you choose one, we can craft an essay that builds from that experience.`);
    } else {
      response = await model.generateContent(`${systemContext}

Previous messages:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

User's latest message: ${userMessage}

Please provide a helpful response that guides the student in developing their essay. If they're ready for a draft, include it between ===ESSAY_START=== and ===ESSAY_END=== tags.`);
    }

    return NextResponse.json({
      message: response.response.text()
    });
  } catch (error) {
    console.error('Error in chat-essay:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 