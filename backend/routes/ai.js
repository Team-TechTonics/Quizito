const express = require('express');
const router = express.Router();
const quizGenerationService = require('../services/quizGenerationService');
const rateLimit = require("express-rate-limit");

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per windowMs
    message: { success: false, message: "Too many AI generation requests, please try again later" }
});

router.use(aiLimiter);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate quiz from topic or text
 * @access  Private
 */
router.post('/generate', async (req, res) => {
    console.log('[AI Route] ==> POST /generate HIT');
    console.log('[AI Route] Request body:', JSON.stringify(req.body));

    try {
        const { type, content, options = {} } = req.body;
        const { numQuestions = 10, difficulty = 'medium' } = options;

        console.log('[AI Route] Parsed params:', { type, content: content?.substring(0, 50), numQuestions, difficulty });

        if (!content) {
            console.log('[AI Route] ERROR: No content provided');
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        let questions = [];

        if (type === 'topic') {
            console.log(`[AI Route] Generating quiz for topic: ${content}`);

            const prompt = `You are an expert quiz generator. Generate exactly ${numQuestions} high-quality multiple-choice questions about the topic: "${content}".

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Mark the correct answer by its index (0, 1, 2, or 3)
- Difficulty level: ${difficulty}
- Questions should be diverse and cover different aspects of the topic
- Avoid duplicate or very similar questions
- Include a brief explanation for the correct answer
- Make questions clear and unambiguous

IMPORTANT: Return ONLY a valid JSON array with NO additional text, markdown, or formatting. Use this exact structure:
[
  {
    "question": "What is the main concept?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct",
    "difficulty": "${difficulty}"
  }
]`;

            console.log('[AI Route] Calling DeepSeek API...');
            questions = await quizGenerationService.callDeepSeekAPI(prompt);
            console.log('[AI Route] API call successful, got', questions.length, 'questions');
        } else if (type === 'text') {
            console.log(`[AI Route] Generating quiz from text (length: ${content.length})`);
            questions = await quizGenerationService.generateFromText(content, {
                numberOfQuestions: numQuestions,
                difficulty
            });
        } else {
            console.log('[AI Route] ERROR: Invalid type:', type);
            return res.status(400).json({
                success: false,
                message: 'Invalid generation type. Must be "topic" or "text"'
            });
        }

        console.log('[AI Route] Formatting questions...');
        // Validate and format response
        const formattedQuestions = questions.map((q, index) => {
            const options = Array.isArray(q.options) ? q.options : [];
            const correctIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;

            const formattedOptions = options.map((optText, optIdx) => ({
                text: String(optText),
                isCorrect: optIdx === correctIndex
            }));

            return {
                // Remove id field - MongoDB will auto-generate ObjectId
                question: String(q.question),
                type: 'multiple-choice',
                options: formattedOptions,
                correctAnswer: options[correctIndex] || '', // Provide text fallback
                explanation: q.explanation || '',
                difficulty: q.difficulty || difficulty,
                points: 100,
                timeLimit: 30
            };
        });

        console.log('[AI Route] Sending response with', formattedQuestions.length, 'formatted questions');
        res.json({
            success: true,
            quiz: {
                title: type === 'topic' ? `Quiz: ${content}` : 'AI Generated Quiz',
                description: `Generated from ${type}`,
                questions: formattedQuestions,
                aiModel: 'DeepSeek',
                type
            }
        });

    } catch (error) {
        console.error('[AI Route] EXCEPTION:', error);
        console.error('[AI Route] Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate quiz',
            details: error.response?.data || error.stack
        });
    }
});

module.exports = router;
