const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

/**
 * @route   POST /api/upload
 * @desc    Proxy PDF upload to Python AI service on Render
 * @access  Public
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log('📄 PDF Upload via /api/upload - Processing locally');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log(`📤 File: ${req.file.originalname} (${req.file.size} bytes)`);

        /* 
        // --- OLD PYTHON PROXY LOGIC (COMMENTED OUT) ---
        // Prepare FormData for Python service
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Python service URL
        const pythonUrl = process.env.PYTHON_SERVICE_URL || 'https://clone-quizito.onrender.com';
        const endpoint = `${pythonUrl.replace(/\/$/, '')}/api/upload`;

        console.log(`🔗 Forwarding to: ${endpoint}`);
        console.log('⏱️  May take 1-2 minutes on cold start...');

        // Forward to Python service
        const pythonResponse = await axios.post(endpoint, form, {
            headers: {
                ...form.getHeaders()
            },
            timeout: 180000, // 3 minutes
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        console.log('✅ Python service responded');
        console.log('📦 Response type:', typeof pythonResponse.data);

        // Check response - Handle Array or Object wrapper
        let questionsData = pythonResponse.data;

        // ... extraction logic ...
        */

        // --- NEW DIRECT PROCESSING LOGIC ---
        const pdfService = require('../services/pdfService');
        const quizGenerationService = require('../services/quizGenerationService');

        console.log('📖 Extracting text from PDF...');

        // 1. Process PDF to get text chunks
        const pdfData = await pdfService.processPDF(req.file.buffer);
        console.log(`✅ Extracted ${pdfData.pages} pages, ${pdfData.totalChunks} text chunks`);

        if (pdfData.totalChunks === 0) {
            return res.status(400).json({
                success: false,
                message: 'Could not extract text from PDF. The file might be scanned or empty.'
            });
        }

        console.log('🤖 Generating questions via AI...');

        // 2. Generate questions from chunks
        // Limit to 10 questions by default, or read from query/body if available
        const questions = await quizGenerationService.generateFromChunks(pdfData.chunks, {
            numberOfQuestions: 15, // Generate a decent amount
            difficulty: 'medium'
        });

        console.log(`✅ AI generated ${questions.length} questions`);

        // 3. Format response to match expected frontend structure
        const formattedQuestions = questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty || "medium",
            order: index + 1,
            type: 'multiple-choice',
            points: 100,
            timeLimit: 30
        }));

        res.json({
            success: true,
            quiz: {
                title: `Quiz from ${req.file.originalname}`,
                category: 'General',
                difficulty: 'medium',
                questions: formattedQuestions,
                metadata: {
                    source: 'pdf-upload',
                    filename: req.file.originalname,
                    questionsGenerated: formattedQuestions.length,
                    pages: pdfData.pages
                }
            }
        });

    } catch (error) {
        console.error('❌ Upload processing error:', error.message);

        // --- ERROR HANDLING ---
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return res.status(504).json({
                success: false,
                message: 'AI service timeout. Please try again or use a smaller file.',
                code: 'TIMEOUT'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process PDF',
            error: 'Internal server error'
        });
    }
});

module.exports = router;
