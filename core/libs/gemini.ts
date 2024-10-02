import { env } from '../../env';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Connect to Gemini and select model 
const Gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
// model for use of Gemini
const model = Gemini.getGenerativeModel({ model: "gemini-1.5-flash" });

export { model };