const pdf = require('pdf-parse');

/**
 * PDF Service - Handles PDF text extraction and processing
 */
class PDFService {
    /**
     * Extract text from PDF buffer
     * @param {Buffer} pdfBuffer - PDF file buffer
     * @returns {Promise<Object>} Extracted text and metadata
     */
    async extractText(pdfBuffer) {
        try {
            const data = await pdf(pdfBuffer);

            return {
                text: data.text,
                pages: data.numpages,
                info: data.info,
                metadata: data.metadata
            };
        } catch (error) {
            console.error('[PDFService] Error extracting text:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    /**
     * Chunk text into manageable pieces
     * @param {string} text - Full text to chunk
     * @param {number} maxChunkSize - Maximum characters per chunk
     * @returns {Array<string>} Array of text chunks
     */
    chunkText(text, maxChunkSize = 2000) {
        // Clean the text
        const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
            .trim();

        // Split by paragraphs first
        const paragraphs = cleanedText.split(/\n\n+/);
        const chunks = [];
        let currentChunk = '';

        for (const para of paragraphs) {
            const trimmedPara = para.trim();
            if (!trimmedPara) continue;

            // If adding this paragraph exceeds max size, save current chunk and start new one
            if ((currentChunk + trimmedPara).length > maxChunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }

                // If single paragraph is too large, split by sentences
                if (trimmedPara.length > maxChunkSize) {
                    const sentences = trimmedPara.split(/\. /);
                    let sentenceChunk = '';

                    for (const sentence of sentences) {
                        if ((sentenceChunk + sentence).length > maxChunkSize) {
                            if (sentenceChunk) {
                                chunks.push(sentenceChunk.trim());
                            }
                            sentenceChunk = sentence;
                        } else {
                            sentenceChunk += (sentenceChunk ? '. ' : '') + sentence;
                        }
                    }

                    if (sentenceChunk) {
                        currentChunk = sentenceChunk;
                    }
                } else {
                    currentChunk = trimmedPara;
                }
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara;
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks.filter(chunk => chunk.length > 50); // Filter out very small chunks
    }

    /**
     * Validate PDF file
     * @param {Object} file - Multer file object
     * @returns {Object} Validation result
     */
    validatePDF(file) {
        const errors = [];

        // Check if file exists
        if (!file) {
            errors.push('No file provided');
            return { valid: false, errors };
        }

        // Check MIME type
        const allowedMimeTypes = ['application/pdf'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            errors.push('Invalid file type. Only PDF files are allowed.');
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push('File too large. Maximum size is 10MB.');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Process PDF file and extract chunked text
     * @param {Buffer} pdfBuffer - PDF file buffer
     * @param {number} maxChunkSize - Maximum chunk size
     * @returns {Promise<Object>} Processed data with chunks
     */
    async processPDF(pdfBuffer, maxChunkSize = 2000) {
        try {
            // Extract text
            const extracted = await this.extractText(pdfBuffer);

            // Chunk the text
            const chunks = this.chunkText(extracted.text, maxChunkSize);

            return {
                chunks,
                totalChunks: chunks.length,
                pages: extracted.pages,
                metadata: {
                    pages: extracted.pages,
                    info: extracted.info
                }
            };
        } catch (error) {
            console.error('[PDFService] Error processing PDF:', error);
            throw error;
        }
    }
}

module.exports = new PDFService();
