// backend/services/deepseek.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateDeepSeekQuiz(topic, numQuestions = 10, difficulty = "medium") {
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are Quizito AI. Output JSON only."
        },
        {
          role: "user",
          content: `Generate ${numQuestions} ${difficulty} MCQ questions about ${topic}.
Return EXACT JSON:
{
  "topic": "...",
  "difficulty": "...",
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": 0,
      "explanation": ""
    }
  ]
}`
        }
      ]
    });

    return JSON.parse(completion.choices[0].message.content);

  } catch (error) {
    console.error("DeepSeek AI Error:", error);
    throw new Error("DeepSeek generation failed");
  }
}
