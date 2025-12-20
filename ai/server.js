const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

const port = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const HTML_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Quiz Generator</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4f4f9; }
        .container { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h2 { text-align: center; color: #333; }
        .upload-box { border: 2px dashed #ccc; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px; }
        button#generateBtn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 10px;}
        button#generateBtn:hover { background: #0056b3; }
        button#generateBtn:disabled { background: #ccc; cursor: not-allowed; }
        
        .question-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px; background: #fff; }
        .question-text { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; }
        .options-grid { display: grid; gap: 10px; }
        .option-btn { padding: 10px; text-align: left; border: 1px solid #ccc; border-radius: 5px; background: #f8f9fa; cursor: pointer; transition: 0.2s; }
        .option-btn:hover { background: #e2e6ea; }

        .correct { background-color: #d4edda !important; border-color: #c3e6cb !important; color: #155724; }
        .wrong { background-color: #f8d7da !important; border-color: #f5c6cb !important; color: #721c24; }
        .disabled { pointer-events: none; opacity: 0.7; }
        #loading { text-align: center; color: #666; display: none; }
    </style>
</head>
<body>
<div class="container">
    <h2>📄 PDF to Quiz Generator</h2>
    <div class="upload-box">
        <form id="uploadForm">
            <input type="file" name="file" accept=".pdf" required>
            <br>
            <button type="submit" id="generateBtn">Generate Quiz</button>
        </form>
    </div>
    <div id="loading">
        <p>🧠 Reading PDF & Generating Questions...</p>
        <p><small>(This takes about 10-15 seconds)</small></p>
    </div>
    <div id="quizContainer"></div>
</div>
<script>
    document.getElementById('uploadForm').onsubmit = async (e) => {
        e.preventDefault();
        document.getElementById('loading').style.display = 'block';
        document.getElementById('quizContainer').innerHTML = '';
        document.getElementById('generateBtn').disabled = true;

        const formData = new FormData(e.target);
        try {
            const response = await fetch('/upload', { method: 'POST', body: formData });
            const data = await response.json();
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').disabled = false;
            
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                renderQuiz(data.questions);
            }
        } catch (err) {
            alert("Failed to connect to server.");
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').disabled = false;
        }
    };

    function renderQuiz(questions) {
        const container = document.getElementById('quizContainer');
        questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            
            const title = document.createElement('div');
            title.className = 'question-text';
            title.innerText = (index + 1) + ". " + q.question;
            card.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'options-grid';

            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerText = opt;
                btn.onclick = () => checkAnswer(btn, opt, q.answer, grid);
                grid.appendChild(btn);
            });
            card.appendChild(grid);
            container.appendChild(card);
        });
    }

    function checkAnswer(btn, selected, correct, grid) {
        const buttons = grid.querySelectorAll('.option-btn');
        buttons.forEach(b => b.classList.add('disabled'));
        if (selected === correct) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
            buttons.forEach(b => { if (b.innerText === correct) b.classList.add('correct'); });
        }
    }
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(HTML_PAGE));

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        const data = await pdf(req.file.buffer);
        let text = data.text;
        if (text.length > 30000) text = text.substring(0, 30000); 
        if (text.length < 50) return res.json({ error: "PDF text too short." });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate 5 multiple choice questions. Return raw JSON: [{"question": "...", "options": ["..."], "answer": "..."}]. Answer must match one option exactly. TEXT: ${text}`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        res.json({ questions: JSON.parse(responseText) });
    } catch (error) {
        res.status(500).json({ error: "Server Error: " + error.message });
    }
});

app.listen(port, () => console.log(\`Server running on port \${port}\`));
