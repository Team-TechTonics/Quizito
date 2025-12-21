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
        const audioService = require('../services/audioService');
        const quizGenerationService = require('../services/quizGenerationService');

        let extractedText = '';
        let metadata = {};

        // Detect File Type
        const mimeType = req.file.mimetype;
        const isPdf = mimeType === 'application/pdf';
        const isAudio = mimeType.startsWith('audio/') ||
            ['application/octet-stream'].includes(mimeType); // Fallback for some audio types

        console.log(`📂 Processing file type: ${mimeType}`);

        if (isPdf) {
            console.log('📖 Extracting text from PDF...');
            const pdfData = await pdfService.processPDF(req.file.buffer);
            console.log(`✅ Extracted ${pdfData.pages} pages, ${pdfData.totalChunks} text chunks`);

            if (pdfData.totalChunks === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not extract text from PDF. The file might be scanned or empty.'
                });
            }

            // Combine chunks for simple context (quizGenerationService might need chunks, but for now we simplify)
            // Actually quizGenerationService.generateFromChunks expects an array of chunks.
            // Let's stick to the existing flow for PDFs, but unify the text source for Audio.

            // For PDF we just use the chunks directly below, so we don't strictly need 'extractedText' variable here yet,
            // but for Audio we need to transcribe first.

            // PDF PATH
            console.log('🤖 Generating questions via AI (PDF Pipeline)...');
            const questions = await quizGenerationService.generateFromChunks(pdfData.chunks, {
                numberOfQuestions: 15,
                difficulty: 'medium'
            });
            console.log(`✅ AI generated ${questions.length} questions`);

            return sendQuizResponse(res, req.file.originalname, questions, {
                source: 'pdf-upload',
                pages: pdfData.pages
            });

        } else if (isAudio) {
            console.log('🎤 Transcribing audio...');
            const audioData = await audioService.processAudio(req.file.buffer, req.file.originalname);
            console.log(`✅ Transcription complete. Length: ${audioData.wordCount} words`);

            if (!audioData.text || audioData.text.length < 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not transcribe sufficient text from audio. Please try a clearer recording.'
                });
            }

            // For Audio, we have raw text, we need to chunk it like PDF or just pass it as context.
            // Let's use the pdfService.chunkText utility since it's generic!
            const chunks = pdfService.chunkText(audioData.text, 2000);

            console.log('🤖 Generating questions via AI (Audio Pipeline)...');
            const questions = await quizGenerationService.generateFromChunks(chunks, {
                numberOfQuestions: 15,
                difficulty: 'medium'
            });
            console.log(`✅ AI generated ${questions.length} questions`);

            return sendQuizResponse(res, req.file.originalname, questions, {
                source: 'audio-upload',
                duration: audioData.duration,
                wordCount: audioData.wordCount
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported file type. Only PDF and Audio (MP3, WAV, M4A) are supported.'
            });
        }

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
            message: error.message || 'Failed to process file',
            error: 'Internal server error'
        });
    }
});

// Helper to standardise response
const sendQuizResponse = (res, filename, questions, metadata) => {
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
            title: `Quiz from ${filename}`,
            category: 'General',
            difficulty: 'medium',
            questions: formattedQuestions,
            metadata: {
                filename,
                questionsGenerated: formattedQuestions.length,
                ...metadata
            }
        }
    });
};

module.exports = router;
