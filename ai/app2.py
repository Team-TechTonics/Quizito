import PyPDF2
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import re

app = Flask(__name__)
CORS(app)

# --- 1. ROBUST PDF READER ---
def pdf2text(file_storage):
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(file_storage)
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

# --- 2. SIMPLE & GUARANTEED QUESTION LOGIC ---
def txt2questions(text):
    # Debug print to see what we are working with
    print(f"DEBUG: Processing text length: {len(text)} chars")
    
    # 1. Clean the text (remove newlines, extra spaces)
    text = text.replace('\n', ' ')
    
    # 2. Simple Sentence Splitter (Split by periods)
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    print(f"DEBUG: Found {len(sentences)} sentences.")

    # 3. Get a list of ALL words in the document for wrong answers
    #    (Regex splits by spaces and keeps only letters)
    all_words = re.findall(r'\b\w+\b', text)
    long_words = [w for w in all_words if len(w) > 4]
    
    quiz_data = []

    for sentence in sentences:
        # Split sentence into words
        words_in_sentence = re.findall(r'\b\w+\b', sentence)
        
        # Find potential answers (words > 4 chars)
        candidates = [w for w in words_in_sentence if len(w) > 4]
        
        if not candidates:
            continue # No long words in this sentence? Skip.
            
        # Pick a random word to be the "Correct Answer"
        target_word = random.choice(candidates)
        
        # Create Distractors (Wrong Answers)
        # Pick 3 random words from the document that are NOT the target word
        distractor_pool = [w for w in long_words if w.lower() != target_word.lower()]
        
        # Safety check: if text is too short, use dummy words
        if len(distractor_pool) < 3:
            options = ["Option A", "Option B", "Option C"]
        else:
            options = random.sample(distractor_pool, 3)
            
        # Add Correct Answer and Shuffle
        options.append(target_word)
        random.shuffle(options)
        
        # Make the "Blank"
        question_text = sentence.replace(target_word, "_______")
        
        quiz_data.append({
            "question": question_text,
            "answer": target_word,
            "options": options
        })
        
        # Limit to 10 questions
        if len(quiz_data) >= 10:
            break

    return quiz_data

# --- 3. API ENDPOINT ---
@app.route('/api/upload', methods=['POST'])
def generate_quiz():
    print("--- NEW REQUEST ---")
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        text = ""
        if file.filename.endswith('.pdf'):
            text = pdf2text(file)
        elif file.filename.endswith('.txt'):
            text = file.read().decode('utf-8')
        
        # FINAL DEBUG CHECK
        if len(text.strip()) == 0:
            print("ERROR: Text extraction failed. Result is empty.")
            return jsonify({"error": "PDF text is empty. Is it scanned?"}), 400
            
        questions = txt2questions(text)
        
        if not questions:
            print("ERROR: Logic found 0 questions.")
            return jsonify({"error": "Could not generate questions."}), 400

        print(f"SUCCESS: Generated {len(questions)} questions.")
        return jsonify(questions)

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)