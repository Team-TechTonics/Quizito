const Groq = require('groq-sdk');

/**
 * Audio Service - Handles audio transcription using Groq Whisper
 */
class AudioService {
    constructor() {
        this.groq = null;
    }

    /**
     * Initialize Groq client
     */
    initializeGroq() {
        if (!this.groq) {
            const apiKey = process.env.GROQ_API_KEY;
            if (!apiKey) {
                throw new Error('GROQ_API_KEY not found in environment variables');
            }
            this.groq = new Groq({ apiKey });
        }
        return this.groq;
    }

    /**
     * Transcribe audio file using Groq Whisper
     * @param {Buffer} audioBuffer - Audio file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} Transcription result
     */
    async transcribeAudio(audioBuffer, filename) {
        try {
            const groq = this.initializeGroq();

            console.log('[AudioService] Starting transcription for:', filename);

            // Create a File object from buffer
            const audioFile = new File([audioBuffer], filename, {
                type: this.getMimeType(filename)
            });

            // Transcribe using Groq Whisper
            const transcription = await groq.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-large-v3',
                response_format: 'json',
                language: 'en', // Can be made dynamic
                temperature: 0.0
            });

            console.log('[AudioService] Transcription completed');

            return {
                text: transcription.text,
                duration: transcription.duration || null,
                language: transcription.language || 'en'
            };
        } catch (error) {
            console.error('[AudioService] Transcription error:', error);
            throw new Error(`Failed to transcribe audio: ${error.message}`);
        }
    }

    /**
     * Get MIME type from filename
     * @param {string} filename - File name
     * @returns {string} MIME type
     */
    getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'm4a': 'audio/m4a',
            'mp4': 'audio/mp4',
            'mpeg': 'audio/mpeg',
            'mpga': 'audio/mpeg',
            'webm': 'audio/webm'
        };
        return mimeTypes[ext] || 'audio/mpeg';
    }

    /**
     * Validate audio file
     * @param {Object} file - Multer file object
     * @returns {Object} Validation result
     */
    validateAudio(file) {
        const errors = [];

        // Check if file exists
        if (!file) {
            errors.push('No file provided');
            return { valid: false, errors };
        }

        // Check MIME type
        const allowedMimeTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/mp4',
            'audio/webm'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            errors.push('Invalid file type. Allowed formats: MP3, WAV, M4A, MP4, WebM');
        }

        // Check file size (25MB limit for Groq Whisper)
        const maxSize = 25 * 1024 * 1024; // 25MB
        if (file.size > maxSize) {
            errors.push('File too large. Maximum size is 25MB.');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Process audio file and get transcription
     * @param {Buffer} audioBuffer - Audio file buffer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} Transcription data
     */
    async processAudio(audioBuffer, filename) {
        try {
            const transcription = await this.transcribeAudio(audioBuffer, filename);

            return {
                text: transcription.text,
                duration: transcription.duration,
                language: transcription.language,
                wordCount: transcription.text.split(/\s+/).length
            };
        } catch (error) {
            console.error('[AudioService] Error processing audio:', error);
            throw error;
        }
    }
}

module.exports = new AudioService();
