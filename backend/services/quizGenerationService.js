const axios = require('axios');

/**
 * Quiz Generation Service - Generates quizzes using DeepSeek API
 */
class QuizGenerationService {
    constructor() {
        this.openRouterApiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
        this.apiKey = null;
    }

    /**
     * Initialize API key
     */
    initializeApiKey() {
        if (!this.apiKey) {
            this.apiKey = process.env.OPENROUTER_API_KEY || process.env.DEEPSEEK_API_KEY;
            if (!this.apiKey) {
                throw new Error('OPENROUTER_API_KEY or DEEPSEEK_API_KEY not found in environment variables');
            }
        }
        return this.apiKey;
    }

    /**
     * Generate quiz prompt
     * @param {string} text - Text to generate quiz from
     * @param {number} numberOfQuestions - Number of questions to generate
     * @param {string} difficulty - Difficulty level
     * @returns {string} Formatted prompt
     */
    generatePrompt(text, numberOfQuestions, difficulty = 'medium') {
        return `You are an expert quiz generator. Generate exactly ${numberOfQuestions} high-quality multiple-choice questions from the following text.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Mark the correct answer by its index (0, 1, 2, or 3)
- Difficulty level: ${difficulty}
- Questions should be diverse and cover different aspects of the text
- Avoid duplicate or very similar questions
- Include a brief explanation for the correct answer
- Make questions clear and unambiguous

Text to analyze:
${text}

IMPORTANT: Return ONLY a valid JSON array with NO additional text, markdown, or formatting. Use this exact structure:
[
  {
    "question": "What is the main topic discussed?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation why this is correct",
    "difficulty": "${difficulty}"
  }
]`;
    }

    /**
     * Call DeepSeek/OpenRouter API to generate quiz
     * @param {string} prompt - Quiz generation prompt
     * @returns {Promise<Array>} Generated questions
     */
    async callDeepSeekAPI(prompt) {
        try {
            const apiKey = this.initializeApiKey();
            // Default to DeepSeek R1T Chimera (free) if not specified
            const model = process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t-chimera:free';

            console.log(`[QuizGenerationService] Calling OpenRouter with model: ${model}`);

            const response = await axios.post(
                this.openRouterApiUrl,
                {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a quiz generation expert. Always return valid JSON arrays only, with no additional text or markdown formatting.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000,
                    // OpenRouter specific headers (can be passed in body for some providers, but standard is headers)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.FRONTEND_URL || 'https://quizito.com', // Required by OpenRouter for ranking
                        'X-Title': 'Quizito AI Quiz Generator' // Optional
                    }
                }
            );

            // OpenRouter response structure is standard OpenAI format
            const content = response.data.choices[0].message.content;

            // Clean the response - find JSON array
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            let cleanedContent = jsonMatch ? jsonMatch[0] : content;

            // Validate it looks like JSON
            if (!cleanedContent.trim().startsWith('[')) {
                throw new Error('Response does not contain a valid JSON array');
            }

            // Parse JSON
            const questions = JSON.parse(cleanedContent);

            if (!Array.isArray(questions)) {
                throw new Error('API response is not an array');
            }

            return questions;
        } catch (error) {
            console.error('[QuizGenerationService] API call error:', error.response?.data || error.message);
            throw new Error(`Failed to generate quiz: ${error.message}`);
        }
    }

    /**
     * Validate generated question
     * @param {Object} question - Question object
     * @returns {boolean} Is valid
     */
    validateQuestion(question) {
        return (
            question &&
            typeof question.question === 'string' &&
            question.question.length > 10 &&
            Array.isArray(question.options) &&
            question.options.length === 4 &&
            question.options.every(opt => typeof opt === 'string' && opt.length > 0) &&
            typeof question.correctAnswer === 'number' &&
            question.correctAnswer >= 0 &&
            question.correctAnswer <= 3 &&
            typeof question.explanation === 'string'
        );
    }

    /**
     * Deduplicate questions
     * @param {Array} questions - Array of questions
     * @returns {Array} Deduplicated questions
     */
    deduplicateQuestions(questions) {
        const seen = new Set();
        const deduplicated = [];

        for (const question of questions) {
            // Normalize question text for comparison
            const normalized = question.question
                .toLowerCase()
                .trim()
                .replace(/[^\w\s]/g, ''); // Remove punctuation

            if (!seen.has(normalized)) {
                seen.add(normalized);
                deduplicated.push(question);
            }
        }

        return deduplicated;
    }

    /**
     * Generate quiz from text
     * @param {string} text - Source text
     * @param {Object} options - Generation options
     * @returns {Promise<Array>} Generated questions
     */
    async generateFromText(text, options = {}) {
        const {
            numberOfQuestions = 10,
            difficulty = 'medium',
            questionsPerChunk = 5
        } = options;

        try {
            console.log('[QuizGenerationService] Generating quiz from text...');

            // If text is short enough, generate all questions at once
            if (text.length <= 3000) {
                const prompt = this.generatePrompt(text, numberOfQuestions, difficulty);
                const questions = await this.callDeepSeekAPI(prompt);

                // Validate and filter questions
                const validQuestions = questions.filter(q => this.validateQuestion(q));

                return this.deduplicateQuestions(validQuestions).slice(0, numberOfQuestions);
            }

            // For longer text, split into chunks and generate questions from each
            const pdfService = require('./pdfService');
            const chunks = pdfService.chunkText(text, 2500);

            const questionsPerChunkCount = Math.ceil(numberOfQuestions / chunks.length);
            const allQuestions = [];

            for (const chunk of chunks) {
                try {
                    const prompt = this.generatePrompt(chunk, questionsPerChunkCount, difficulty);
                    const questions = await this.callDeepSeekAPI(prompt);

                    const validQuestions = questions.filter(q => this.validateQuestion(q));
                    allQuestions.push(...validQuestions);

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('[QuizGenerationService] Error generating from chunk:', error.message);
                    // Continue with other chunks
                }
            }

            // Deduplicate and limit to requested number
            const deduplicated = this.deduplicateQuestions(allQuestions);

            return deduplicated.slice(0, numberOfQuestions);
        } catch (error) {
            console.error('[QuizGenerationService] Error generating quiz:', error);
            throw error;
        }
    }

    /**
     * Generate quiz from multiple text chunks
     * @param {Array<string>} chunks - Text chunks
     * @param {Object} options - Generation options
     * @returns {Promise<Array>} Generated questions
     */
    async generateFromChunks(chunks, options = {}) {
        const { numberOfQuestions = 10, difficulty = 'medium' } = options;

        try {
            const questionsPerChunk = Math.ceil(numberOfQuestions / chunks.length);
            const allQuestions = [];

            for (const chunk of chunks) {
                try {
                    const prompt = this.generatePrompt(chunk, questionsPerChunk, difficulty);
                    const questions = await this.callDeepSeekAPI(prompt);

                    const validQuestions = questions.filter(q => this.validateQuestion(q));
                    allQuestions.push(...validQuestions);

                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('[QuizGenerationService] Error with chunk:', error.message);
                    // Continue with other chunks
                }
            }

            // Deduplicate and limit
            const deduplicated = this.deduplicateQuestions(allQuestions);

            return deduplicated.slice(0, numberOfQuestions);
        } catch (error) {
            console.error('[QuizGenerationService] Error generating from chunks:', error);
            throw error;
        }
    }
}

module.exports = new QuizGenerationService();
