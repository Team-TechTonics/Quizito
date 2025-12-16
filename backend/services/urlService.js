const axios = require('axios');
const cheerio = require('cheerio');
const { NodeHtmlMarkdown } = require('node-html-markdown'); // Optional, but let's stick to cheerio text for now for simplicity or use a parser if needed. Actually simpler to just use cheerio text.

async function scrapeUrl(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and other non-content elements
        $('script, style, nav, footer, iframe, header, noscript').remove();

        // Try to get main content
        let content = $('main').text() || $('article').text() || $('body').text();

        // Clean up whitespace
        content = content.replace(/\s+/g, ' ').trim();

        // Limit length to avoid token limits (approx 15000 chars)
        return content.substring(0, 15000);
    } catch (error) {
        console.error(`Error scraping URL ${url}:`, error.message);
        throw new Error(`Failed to scrape content from URL: ${error.message}`);
    }
}

module.exports = { scrapeUrl };
