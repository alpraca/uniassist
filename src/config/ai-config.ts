export const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
 
if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in environment variables');
} 