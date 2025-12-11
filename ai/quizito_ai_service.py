import os
import json
import re
import logging
import io
from typing import Dict, List, Optional, Any
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from PyPDF2 import PdfReader
import numpy as np
import pandas as pd
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Try to import OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI package not available")

# Configure OpenAI if available
if OPENAI_AVAILABLE:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key)
        logger.info("✅ OpenAI configured successfully")
    else:
        client = None
        logger.warning("❌ OPENAI_API_KEY not found")
else:
    client = None

# ========================================================
# HEALTH & INFO ENDPOINTS
# ========================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'healthy',
        'service': 'quizito-ai',
        'timestamp': datetime.now().isoformat(),
        'openai_available': bool(client),
        'python_version': os.sys.version,
        'features': ['quiz-generation', 'pdf-extraction', 'ai-enhancement', 'question-generation']
    })

@app.route('/info', methods=['GET'])
def service_info():
    """Service information endpoint"""
    return jsonify({
        'name': 'Quizito AI Service',
        'version': '2.0.1',
        'status': 'operational',
        'endpoints': {
            'POST /generate-quiz': 'Generate complete quiz with AI',
            'POST /extract-pdf': 'Extract text from PDF',
            'POST /enhance-quiz': 'Enhance existing quiz',
            'POST /generate-questions': 'Generate specific questions',
            'POST /analyze-topic': 'Analyze topic for quiz creation',
            'GET /health': 'Health check'
        },
        'ai_capabilities': {
            'openai_integration': bool(client),
            'pdf_processing': True,
            'quiz_generation': True,
            'content_enhancement': True
        }
    })

# ========================================================
# MAIN QUIZ GENERATION ENDPOINT
# ========================================================

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """
    Generate a complete quiz based on topic, difficulty, and optional PDF content.
    Supports both OpenAI and fallback generation.
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        topic = data.get('topic', '').strip()
        difficulty = data.get('difficulty', 'medium').lower()
        num_questions = int(data.get('numQuestions', 10))
        quiz_type = data.get('quizType', 'multiple-choice')
        pdf_text = data.get('pdfText', '')
        
        # Validate
        if not topic and not pdf_text:
            return jsonify({
                'success': False,
                'error': 'Topic or PDF content is required'
            }), 400
        
        if num_questions < 1 or num_questions > 50:
            return jsonify({
                'success': False,
                'error': 'Number of questions must be between 1 and 50'
            }), 400
        
        logger.info(f"Generating quiz: {topic}, {difficulty}, {num_questions} questions")
        
        # Try OpenAI generation first
        if client:
            try:
                quiz_data = generate_with_openai(
                    topic=topic,
                    difficulty=difficulty,
                    num_questions=num_questions,
                    quiz_type=quiz_type,
                    context=pdf_text
                )
                quiz_data['metadata']['ai_provider'] = 'openai'
                quiz_data['metadata']['model'] = 'gpt-3.5-turbo'
                
                return jsonify({
                    'success': True,
                    'message': 'Quiz generated with AI',
                    'data': quiz_data
                })
                
            except Exception as ai_error:
                logger.warning(f"OpenAI generation failed: {ai_error}, using enhanced fallback")
        
        # Enhanced fallback generation
        quiz_data = generate_enhanced_fallback_quiz(
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions,
            quiz_type=quiz_type,
            context=pdf_text
        )
        quiz_data['metadata']['ai_provider'] = 'fallback'
        quiz_data['metadata']['note'] = 'AI service unavailable, using enhanced fallback'
        
        return jsonify({
            'success': True,
            'message': 'Quiz generated with enhanced fallback',
            'data': quiz_data
        })
        
    except Exception as e:
        logger.error(f"Error in generate-quiz: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to generate quiz: {str(e)}'
        }), 500

# ========================================================
# OPENAI-BASED GENERATION
# ========================================================

def generate_with_openai(topic: str, difficulty: str, num_questions: int, 
                         quiz_type: str = 'multiple-choice', context: str = '') -> Dict[str, Any]:
    """Generate quiz using OpenAI with comprehensive prompts"""
    
    # Create detailed prompt
    prompt = create_comprehensive_prompt(topic, difficulty, num_questions, quiz_type, context)
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are QuizMaster AI, an expert quiz creator. 
                    Create engaging, accurate, and educational quizzes.
                    Always return valid JSON with this exact structure."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        response_text = response.choices[0].message.content
        
        # Parse JSON response
        quiz_data = json.loads(response_text)
        
        # Validate and enhance the response
        enhanced_quiz = enhance_quiz_data(
            quiz_data=quiz_data,
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions,
            quiz_type=quiz_type
        )
        
        return enhanced_quiz
        
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise

def create_comprehensive_prompt(topic: str, difficulty: str, num_questions: int,
                               quiz_type: str, context: str) -> str:
    """Create detailed prompt for OpenAI"""
    
    difficulty_map = {
        'easy': 'Beginner level with straightforward questions',
        'medium': 'Intermediate level with moderately challenging questions',
        'hard': 'Advanced level with complex and thought-provoking questions'
    }
    
    prompt = f"""
    Create a comprehensive quiz about "{topic}" with these specifications:
    
    Specifications:
    - Number of questions: {num_questions}
    - Difficulty: {difficulty} ({difficulty_map.get(difficulty, 'Medium')})
    - Question type: {quiz_type}
    - Target audience: Students and adult learners
    
    {f'Additional context from PDF:\n{context[:1500]}\n' if context else ''}
    
    Requirements for each question:
    1. Question text should be clear, concise, and educational
    2. Provide exactly 4 options (A, B, C, D) for multiple-choice
    3. Mark the correct answer clearly (0-3 index)
    4. Include a brief but informative explanation
    5. Assign appropriate points based on difficulty
    6. Include relevant tags/categories
    7. Add educational value beyond simple recall
    
    Response Format (JSON ONLY):
    {{
        "title": "Engaging and descriptive quiz title",
        "description": "Detailed description of quiz content and learning objectives",
        "category": "Appropriate category",
        "difficulty": "{difficulty}",
        "estimatedTime": {num_questions * 0.8},
        "totalPoints": {num_questions * (100 if difficulty == 'easy' else 150 if difficulty == 'medium' else 200)},
        "learningObjectives": ["Objective 1", "Objective 2"],
        "questions": [
            {{
                "question": "Clear and concise question text",
                "type": "{quiz_type}",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0,
                "explanation": "Detailed explanation of why this is correct",
                "points": 100,
                "timeLimit": 30,
                "difficulty": "{difficulty}",
                "category": "Subcategory if applicable",
                "tags": ["tag1", "tag2"],
                "educationalTip": "Additional learning tip"
            }}
        ],
        "tags": ["{topic.lower().replace(' ', '-')}", "{difficulty}", "quiz"],
        "metadata": {{
            "educationalLevel": "appropriate level",
            "prerequisites": "any prerequisites",
            "targetAudience": "target audience description"
        }}
    }}
    
    IMPORTANT: Return ONLY valid JSON. Do not include any additional text.
    """
    
    return prompt

# ========================================================
# ENHANCED FALLBACK GENERATION (NO OPENAI)
# ========================================================

def generate_enhanced_fallback_quiz(topic: str, difficulty: str, num_questions: int,
                                   quiz_type: str = 'multiple-choice', context: str = '') -> Dict[str, Any]:
    """Generate high-quality quiz without OpenAI using advanced algorithms"""
    
    # Extract keywords from context if provided
    keywords = extract_keywords_from_context(context) if context else []
    
    # Generate questions with varied types based on difficulty
    questions = []
    points_map = {'easy': 100, 'medium': 150, 'hard': 200}
    time_map = {'easy': 30, 'medium': 45, 'hard': 60}
    
    # Question templates for variety
    question_templates = [
        "What is the primary concept of {topic} regarding {aspect}?",
        "Which of the following best describes {aspect} in {topic}?",
        "What is a key characteristic of {topic} related to {aspect}?",
        "How does {aspect} function within {topic}?",
        "What is the significance of {aspect} in understanding {topic}?"
    ]
    
    # Generate different aspects based on topic
    aspects = generate_aspects_from_topic(topic, num_questions)
    
    for i in range(num_questions):
        aspect = aspects[i % len(aspects)]
        template = question_templates[i % len(question_templates)]
        
        question_text = template.format(topic=topic, aspect=aspect)
        
        # Generate plausible distractors
        options = generate_plausible_options(aspect, topic, difficulty)
        
        questions.append({
            'question': question_text,
            'type': quiz_type,
            'options': options,
            'correctAnswer': 0,
            'explanation': create_detailed_explanation(topic, aspect, difficulty),
            'points': points_map.get(difficulty, 100),
            'timeLimit': time_map.get(difficulty, 30),
            'difficulty': difficulty,
            'category': categorize_topic(topic),
            'tags': [topic.lower().replace(' ', '-'), aspect.lower().replace(' ', '-'), difficulty],
            'educationalTip': generate_educational_tip(topic, aspect)
        })
    
    # Create comprehensive quiz structure
    quiz_data = {
        'title': f"Comprehensive Quiz: {topic}",
        'description': f"A detailed quiz covering various aspects of {topic}. \n        This quiz is designed to test understanding at {difficulty} level and covers \n        key concepts, applications, and principles.",
        'category': categorize_topic(topic),
        'difficulty': difficulty,
        'estimatedTime': num_questions * 0.8,
        'totalPoints': num_questions * points_map.get(difficulty, 100),
        'learningObjectives': generate_learning_objectives(topic, num_questions),
        'questions': questions,
        'tags': [topic.lower().replace(' ', '-'), difficulty, 'educational', 'comprehensive'] + keywords,
        'metadata': {
            'educationalLevel': get_educational_level(difficulty),
            'prerequisites': f"Basic understanding of {topic}" if difficulty in ['medium', 'hard'] else "None",
            'targetAudience': "Students, professionals, and lifelong learners",
            'generationMethod': 'enhanced_fallback',
            'keywordsUsed': keywords[:5] if keywords else []
        }
    }
    
    return quiz_data

def extract_keywords_from_context(context: str) -> List[str]:
    """Extract keywords from PDF/text context"""
    if not context:
        return []
    
    # Simple keyword extraction (in production, use NLP libraries)
    words = re.findall(r'\b[a-zA-Z]{4,}\b', context.lower())
    common_words = {'this', 'that', 'with', 'from', 'have', 'were', 'their', 'which', 'about'}
    
    # Count frequency
    word_counts = {}
    for word in words:
        if word not in common_words:
            word_counts[word] = word_counts.get(word, 0) + 1
    
    # Get top keywords
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    return [word[0].title() for word in sorted_words[:10]]

def generate_aspects_from_topic(topic: str, num_aspects: int) -> List[str]:
    """Generate relevant aspects for a topic"""
    # Aspect templates for different categories
    aspect_templates = {
        'technology': ['fundamentals', 'applications', 'architecture', 'security', 'performance', 
                      'implementation', 'best practices', 'trends', 'tools', 'methodologies'],
        'science': ['principles', 'theories', 'experiments', 'discoveries', 'applications',
                   'methodologies', 'impact', 'research', 'concepts', 'phenomena'],
        'history': ['events', 'figures', 'periods', 'causes', 'consequences', 'themes',
                   'movements', 'cultures', 'developments', 'interpretations'],
        'general': ['basics', 'advanced concepts', 'practical applications', 'common mistakes',
                   'best practices', 'tools', 'resources', 'career aspects', 'future trends']
    }
    
    # Determine category
    category = categorize_topic(topic).lower()
    templates = aspect_templates.get(category, aspect_templates['general'])
    
    # Generate aspects
    aspects = []
    for i in range(num_aspects):
        aspect = f"{templates[i % len(templates)]} of {topic}"
        aspects.append(aspect)
    
    return aspects[:num_aspects]

def generate_plausible_options(correct_aspect: str, topic: str, difficulty: str) -> List[str]:
    """Generate plausible multiple-choice options"""
    correct_option = f"The {correct_aspect}"
    
    # Generate distractors based on difficulty
    distractors = []
    
    if difficulty == 'easy':
        distractors = [
            f"A different aspect of {topic}",
            f"An unrelated concept to {topic}",
            f"A common misconception about {topic}",
            f"A basic principle of {topic}"
        ]
    elif difficulty == 'medium':
        distractors = [
            f"A related but incorrect aspect of {topic}",
            f"A partially correct concept about {topic}",
            f"An advanced but irrelevant concept in {topic}",
            f"A historical perspective on {topic}"
        ]
    else:  # hard
        distractors = [
            f"A nuanced but incorrect interpretation of {correct_aspect}",
            f"A controversial viewpoint on {topic}",
            f"An advanced technical detail unrelated to {correct_aspect}",
            f"A theoretical concept that doesn't apply to {correct_aspect}"
        ]
    
    # Combine and shuffle
    options = [correct_option] + distractors[:3]
    # Use numpy for shuffling if available
    try:
        np.random.shuffle(options)
        # Find correct answer index after shuffle
        correct_index = options.index(correct_option)
        # Move correct answer to first position for consistency
        if correct_index != 0:
            options.insert(0, options.pop(correct_index))
    except:
        # Fallback if numpy not available
        pass
    
    return options

def create_detailed_explanation(topic: str, aspect: str, difficulty: str) -> str:
    """Create detailed explanation for answer"""
    explanations = {
        'easy': f"This is correct because understanding {aspect} is fundamental to {topic}. "
                f"It represents a basic principle that forms the foundation for more advanced concepts.",
        
        'medium': f"The correct answer relates to {aspect}, which is a key component of {topic}. "
                 f"This aspect is important because it connects various concepts within {topic} "
                 f"and demonstrates practical applications.",
        
        'hard': f"This answer correctly identifies {aspect}, which involves complex interplay "
               f"within {topic}. Understanding this requires knowledge of underlying principles, "
               f"contextual factors, and potential implications in advanced scenarios of {topic}."
    }
    
    return explanations.get(difficulty, explanations['medium'])

def generate_educational_tip(topic: str, aspect: str) -> str:
    """Generate educational tip for learning"""
    tips = [
        f"To better understand {aspect} in {topic}, try relating it to practical examples.",
        f"Consider how {aspect} connects to other concepts within {topic} for deeper understanding.",
        f"Research real-world applications of {aspect} to see how {topic} is used in practice.",
        f"Create mind maps linking {aspect} to related concepts in {topic}.",
        f"Discuss {aspect} with peers to gain different perspectives on {topic}."
    ]
    
    return tips[len(aspect) % len(tips)]

def categorize_topic(topic: str) -> str:
    """Categorize topic into broad category"""
    topic_lower = topic.lower()
    
    categories = {
        'technology': ['programming', 'software', 'computer', 'ai', 'machine learning', 
                      'data science', 'web', 'mobile', 'cloud', 'cybersecurity'],
        'science': ['biology', 'chemistry', 'physics', 'astronomy', 'geology', 
                   'environmental', 'medical', 'neuroscience'],
        'history': ['historical', 'war', 'civilization', 'ancient', 'medieval', 
                   'modern', 'political', 'cultural'],
        'mathematics': ['math', 'algebra', 'calculus', 'statistics', 'geometry'],
        'business': ['marketing', 'finance', 'management', 'economics', 'entrepreneurship']
    }
    
    for category, keywords in categories.items():
        if any(keyword in topic_lower for keyword in keywords):
            return category.capitalize()
    
    return 'General'

def generate_learning_objectives(topic: str, num_objectives: int) -> List[str]:
    """Generate learning objectives for the quiz"""
    objectives = [
        f"Understand the fundamental concepts of {topic}",
        f"Identify key components and their relationships within {topic}",
        f"Apply knowledge of {topic} to solve basic problems",
        f"Analyze different aspects of {topic} and their implications",
        f"Evaluate the importance and applications of {topic}",
        f"Synthesize information about {topic} to form comprehensive understanding",
        f"Develop critical thinking skills related to {topic}",
        f"Recognize common misconceptions about {topic}"
    ]
    
    return objectives[:min(num_objectives, len(objectives))]

def get_educational_level(difficulty: str) -> str:
    """Get educational level based on difficulty"""
    levels = {
        'easy': 'Beginner/Introductory',
        'medium': 'Intermediate',
        'hard': 'Advanced/Expert'
    }
    return levels.get(difficulty, 'Intermediate')

# ========================================================
# PDF EXTRACTION ENDPOINT
# ========================================================

@app.route('/extract-pdf', methods=['POST'])
def extract_pdf():
    """Extract text content from uploaded PDF with advanced analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({
                'success': False,
                'error': 'File must be a PDF'
            }), 400
        
        # Read and process PDF
        pdf_content = file.read()
        pdf_file = io.BytesIO(pdf_content)
        
        try:
            pdf_reader = PdfReader(pdf_file)
            
            # Extract text from all pages
            full_text = ""
            page_texts = []
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    full_text += f"\\n--- Page {page_num + 1} ---\\n{page_text}"
                    page_texts.append(page_text)
            
            # Clean text
            full_text = re.sub(r'\\s+', ' ', full_text).strip()
            
            # Analyze content
            analysis = analyze_pdf_content(full_text, page_texts)
            
            return jsonify({
                'success': True,
                'message': 'PDF extracted successfully',
                'data': {
                    'text': full_text,
                    'analysis': analysis,
                    'metadata': {
                        'pages': len(pdf_reader.pages),
                        'wordCount': len(full_text.split()),
                        'charCount': len(full_text),
                        'extractedAt': datetime.now().isoformat()
                    }
                }
            })
            
        except Exception as pdf_error:
            logger.error(f"PDF processing error: {pdf_error}")
            return jsonify({
                'success': False,
                'error': f'Failed to process PDF: {str(pdf_error)}'
            }), 500
            
    except Exception as e:
        logger.error(f"PDF extraction error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to extract PDF: {str(e)}'
        }), 500

def analyze_pdf_content(text: str, page_texts: List[str]) -> Dict[str, Any]:
    """Analyze PDF content for quiz generation"""
    
    # Basic statistics
    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    
    # Extract potential topics
    potential_topics = extract_potential_topics(text)
    
    # Calculate readability metrics (simplified)
    avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
    avg_sentence_length = len(words) / len(sentences) if sentences else 0
    
    # Determine content type
    content_type = determine_content_type(text)
    
    return {
        'statistics': {
            'totalPages': len(page_texts),
            'totalWords': len(words),
            'totalSentences': len(sentences),
            'averageWordLength': round(avg_word_length, 2),
            'averageSentenceLength': round(avg_sentence_length, 2)
        },
        'contentAnalysis': {
            'type': content_type,
            'complexity': 'high' if avg_word_length > 5 and avg_sentence_length > 15 else 'medium' if avg_word_length > 4 else 'low',
            'technicalLevel': estimate_technical_level(text)
        },
        'potentialQuizTopics': potential_topics[:5],
        'keyThemes': extract_key_themes(text)[:5]
    }

def extract_potential_topics(text: str) -> List[str]:
    """Extract potential quiz topics from text"""
    # Simple keyword extraction
    words = re.findall(r'\\b[A-Z][a-z]{3,}\\b', text)
    
    # Filter common words and count frequency
    common_words = {'This', 'That', 'With', 'From', 'Have', 'Were', 'Their', 'Which', 'About', 'There'}
    word_counts = {}
    
    for word in words:
        if word not in common_words:
            word_counts[word] = word_counts.get(word, 0) + 1
    
    # Return most frequent words as potential topics
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    return [word[0] for word in sorted_words[:10]]

def determine_content_type(text: str) -> str:
    """Determine type of content"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['algorithm', 'code', 'programming', 'software']):
        return 'Technology/Programming'
    elif any(word in text_lower for word in ['experiment', 'research', 'study', 'scientific']):
        return 'Scientific/Research'
    elif any(word in text_lower for word in ['historical', 'century', 'war', 'civilization']):
        return 'Historical'
    elif any(word in text_lower for word in ['business', 'market', 'financial', 'economic']):
        return 'Business/Economics'
    else:
        return 'General/Educational'

def estimate_technical_level(text: str) -> str:
    """Estimate technical level of content"""
    technical_terms = ['algorithm', 'protocol', 'architecture', 'framework', 'syntax',
                      'theorem', 'hypothesis', 'methodology', 'quantitative', 'analysis']
    
    count = sum(1 for term in technical_terms if term in text.lower())
    
    if count > 10:
        return 'Advanced Technical'
    elif count > 5:
        return 'Intermediate Technical'
    elif count > 0:
        return 'Basic Technical'
    else:
        return 'Non-Technical'

def extract_key_themes(text: str) -> List[str]:
    """Extract key themes from text"""
    # Simple theme extraction based on sentence patterns
    sentences = re.split(r'[.!?]+', text)
    
    themes = []
    for sentence in sentences[:50]:  # Check first 50 sentences
        if len(sentence.split()) > 5:  # Meaningful sentences
            # Extract nouns as potential themes
            words = sentence.split()
            for i, word in enumerate(words):
                if word[0].isupper() and len(word) > 3 and i > 0 and words[i-1] not in ['the', 'a', 'an']:
                    themes.append(word)
    
    return list(set(themes))[:10]

# ========================================================
# QUIZ ENHANCEMENT ENDPOINT
# ========================================================

@app.route('/enhance-quiz', methods=['POST'])
def enhance_quiz():
    """Enhance existing quiz with explanations, difficulty adjustments, etc."""
    try:
        data = request.get_json()
        
        if not data or 'quiz' not in data:
            return jsonify({
                'success': False,
                'error': 'Quiz data is required'
            }), 400
        
        quiz = data['quiz']
        enhancement_type = data.get('enhancementType', 'comprehensive')
        
        logger.info(f"Enhancing quiz: {quiz.get('title', 'Unknown')}, type: {enhancement_type}")
        
        # Enhance based on type
        enhanced_quiz = enhance_quiz_content(quiz, enhancement_type)
        
        return jsonify({
            'success': True,
            'message': f'Quiz enhanced with {enhancement_type} improvements',
            'data': enhanced_quiz
        })
        
    except Exception as e:
        logger.error(f"Quiz enhancement error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to enhance quiz: {str(e)}'
        }), 500

def enhance_quiz_content(quiz: Dict[str, Any], enhancement_type: str) -> Dict[str, Any]:
    """Enhance quiz content based on type"""
    
    enhanced = quiz.copy()
    
    if enhancement_type == 'explanations':
        # Add detailed explanations
        for question in enhanced.get('questions', []):
            if 'explanation' not in question or not question['explanation']:
                question['explanation'] = create_detailed_explanation(
                    quiz.get('title', 'topic'),
                    'key concept',
                    question.get('difficulty', 'medium')
                )
    
    elif enhancement_type == 'difficulty':
        # Adjust difficulty levels
        base_difficulty = enhanced.get('difficulty', 'medium')
        
        for i, question in enumerate(enhanced.get('questions', [])):
            # Vary difficulty across questions
            if i % 3 == 0:
                question['difficulty'] = 'easy'
                question['points'] = 100
                question['timeLimit'] = 30
            elif i % 3 == 1:
                question['difficulty'] = 'medium'
                question['points'] = 150
                question['timeLimit'] = 45
            else:
                question['difficulty'] = 'hard'
                question['points'] = 200
                question['timeLimit'] = 60
    
    elif enhancement_type == 'comprehensive':
        # Comprehensive enhancement
        enhanced = enhance_quiz_comprehensively(quiz)
    
    # Add metadata
    if 'metadata' not in enhanced:
        enhanced['metadata'] = {}
    
    enhanced['metadata']['enhancedAt'] = datetime.now().isoformat()
    enhanced['metadata']['enhancementType'] = enhancement_type
    enhanced['metadata']['enhancementProvider'] = 'quizito_ai'
    
    return enhanced

def enhance_quiz_comprehensively(quiz: Dict[str, Any]) -> Dict[str, Any]:
    """Comprehensively enhance quiz"""
    enhanced = quiz.copy()
    
    # Enhance title and description
    if 'title' in enhanced:
        enhanced['title'] = f"Enhanced: {enhanced['title']}"
    
    if 'description' in enhanced:
        enhanced['description'] += "\\n\\nThis quiz has been enhanced with additional explanations, varied difficulty levels, and educational tips."
    
    # Add learning objectives if not present
    if 'learningObjectives' not in enhanced:
        topic = enhanced.get('title', '').replace('Quiz', '').replace('quiz', '').strip()
        enhanced['learningObjectives'] = generate_learning_objectives(topic, 3)
    
    # Enhance each question
    for i, question in enumerate(enhanced.get('questions', [])):
        # Add educational tip
        if 'educationalTip' not in question:
            question['educationalTip'] = generate_educational_tip(
                enhanced.get('title', 'topic'),
                f"concept {i+1}"
            )
        
        # Add tags if not present
        if 'tags' not in question:
            question['tags'] = [
                enhanced.get('category', 'general').lower(),
                question.get('difficulty', 'medium'),
                f"question_{i+1}"
            ]
        
        # Enhance explanation
        if 'explanation' in question:
            question['explanation'] = enhance_explanation(question['explanation'])
    
    # Add quiz metadata
    enhanced['metadata'] = {
        **enhanced.get('metadata', {}),
        'comprehensivelyEnhanced': True,
        'enhancementDate': datetime.now().isoformat(),
        'totalEnhancements': len(enhanced.get('questions', [])),
        'aiEnhanced': True
    }
    
    return enhanced

def enhance_explanation(explanation: str) -> str:
    """Enhance explanation with additional details"""
    if len(explanation.split()) < 10:
        # Short explanation, enhance it
        return explanation + " This understanding is crucial for building a comprehensive knowledge base and applying concepts in practical scenarios."
    
    return explanation

# ========================================================
# QUESTION GENERATION ENDPOINT
# ========================================================

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Generate specific number of questions on a topic"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        topic = data.get('topic', '').strip()
        question_type = data.get('type', 'multiple-choice')
        count = min(int(data.get('count', 5)), 20)
        difficulty = data.get('difficulty', 'medium')
        context = data.get('context', '')
        
        if not topic:
            return jsonify({
                'success': False,
                'error': 'Topic is required'
            }), 400
        
        logger.info(f"Generating {count} {question_type} questions about {topic}")
        
        # Generate questions
        if client:
            try:
                questions = generate_questions_with_openai(topic, question_type, count, difficulty, context)
                source = 'openai'
            except Exception:
                questions = generate_questions_fallback(topic, question_type, count, difficulty)
                source = 'fallback'
        else:
            questions = generate_questions_fallback(topic, question_type, count, difficulty)
            source = 'fallback'
        
        return jsonify({
            'success': True,
            'message': f'Generated {len(questions)} questions',
            'data': {
                'questions': questions,
                'metadata': {
                    'topic': topic,
                    'type': question_type,
                    'count': len(questions),
                    'difficulty': difficulty,
                    'source': source,
                    'generatedAt': datetime.now().isoformat()
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Question generation error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to generate questions: {str(e)}'
        }), 500

def generate_questions_with_openai(topic: str, question_type: str, count: int,
                                  difficulty: str, context: str) -> List[Dict[str, Any]]:
    """Generate questions using OpenAI"""
    
    prompt = f"""
    Generate {count} {question_type} questions about "{topic}".
    
    Difficulty: {difficulty}
    Question type: {question_type}
    {f'Context: {context[:500]}' if context else ''}
    
    For each question, include:
    1. Clear question text
    2. 4 options (for multiple-choice)
    3. Correct answer (index 0-3)
    4. Brief explanation
    
    Return as JSON array:
    [
        {{
            "question": "Question text",
            "type": "{question_type}",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Brief explanation"
        }}
    ]
    """
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You generate educational questions. Return valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    content = response.choices[0].message.content
    json_match = re.search(r'\[.*\]', content, re.DOTALL)
    
    if json_match:
        questions = json.loads(json_match.group(0))
        # Add additional fields
        for q in questions:
            q['points'] = 100 if difficulty == 'easy' else 150 if difficulty == 'medium' else 200
            q['timeLimit'] = 30 if difficulty == 'easy' else 45 if difficulty == 'medium' else 60
            q['difficulty'] = difficulty
        return questions
    
    raise ValueError("No valid questions generated")

def generate_questions_fallback(topic: str, question_type: str, count: int,
                               difficulty: str) -> List[Dict[str, Any]]:
    """Generate questions without OpenAI"""
    
    questions = []
    aspects = generate_aspects_from_topic(topic, count)
    
    for i in range(count):
        aspect = aspects[i % len(aspects)]
        
        question = {
            'question': f"What is important to know about {aspect} in {topic}?",
            'type': question_type,
            'options': [
                f"Key concept A about {aspect}",
                f"Key concept B about {aspect}",
                f"Key concept C about {aspect}",
                f"Key concept D about {aspect}"
            ],
            'correctAnswer': 0,
            'explanation': f"This covers fundamental knowledge about {aspect} in {topic}.",
            'points': 100 if difficulty == 'easy' else 150 if difficulty == 'medium' else 200,
            'timeLimit': 30 if difficulty == 'easy' else 45 if difficulty == 'medium' else 60,
            'difficulty': difficulty,
            'category': categorize_topic(topic)
        }
        
        questions.append(question)
    
    return questions

# ========================================================
# TOPIC ANALYSIS ENDPOINT
# ========================================================

@app.route('/analyze-topic', methods=['POST'])
def analyze_topic():
    """Analyze topic for quiz creation recommendations"""
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({
                'success': False,
                'error': 'Topic is required'
            }), 400
        
        topic = data.get('topic', '').strip()
        context = data.get('context', '')
        
        logger.info(f"Analyzing topic: {topic}")
        
        # Perform analysis
        analysis = analyze_topic_content(topic, context)
        
        return jsonify({
            'success': True,
            'message': f'Analysis complete for "{topic}"',
            'data': analysis
        })
        
    except Exception as e:
        logger.error(f"Topic analysis error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to analyze topic: {str(e)}'
        }), 500

def analyze_topic_content(topic: str, context: str = '') -> Dict[str, Any]:
    """Analyze topic for quiz creation"""
    
    category = categorize_topic(topic)
    
    # Generate analysis based on category
    analysis = {
        'topic': topic,
        'category': category,
        'recommendedDifficulty': 'medium',  # Default
        'suggestedQuestionCounts': {
            'easy': 3,
            'medium': 5,
            'hard': 2
        },
        'keyAreas': generate_aspects_from_topic(topic, 5),
        'suggestedQuestionTypes': ['multiple-choice', 'true-false', 'fill-blank'],
        'estimatedQuizTime': 15,  # minutes
        'prerequisites': f"Basic understanding of {category.lower()} concepts",
        'targetAudience': determine_target_audience(category),
        'learningPotential': estimate_learning_potential(topic, context),
        'commonMisconceptions': generate_common_misconceptions(topic),
        'resources': suggest_resources(topic, category)
    }
    
    return analysis

def determine_target_audience(category: str) -> List[str]:
    """Determine target audience based on category"""
    audiences = {
        'technology': ['Students', 'Developers', 'IT Professionals', 'Tech Enthusiasts'],
        'science': ['Students', 'Researchers', 'Educators', 'Science Enthusiasts'],
        'history': ['Students', 'Historians', 'Educators', 'History Buffs'],
        'business': ['Students', 'Professionals', 'Entrepreneurs', 'Managers'],
        'general': ['Students', 'General Public', 'Lifelong Learners']
    }
    
    return audiences.get(category.lower(), audiences['general'])

def estimate_learning_potential(topic: str, context: str) -> Dict[str, Any]:
    """Estimate learning potential of the topic"""
    return {
        'knowledgeDepth': 'High' if len(topic.split()) > 2 else 'Medium',
        'skillDevelopment': ['Critical Thinking', 'Analysis', 'Application'],
        'practicalApplications': estimate_practical_applications(topic),
        'complexityLevel': 'Moderate'
    }

def estimate_practical_applications(topic: str) -> List[str]:
    """Estimate practical applications of topic"""
    apps = [
        f"Applying {topic} in real-world scenarios",
        f"Problem-solving using {topic} principles",
        f"Implementing {topic} in projects",
        f"Analyzing situations with {topic} framework"
    ]
    
    return apps[:3]

def generate_common_misconceptions(topic: str) -> List[str]:
    """Generate common misconceptions about topic"""
    return [
        f"Misunderstanding the basic principles of {topic}",
        f"Confusing {topic} with related but different concepts",
        f"Overestimating or underestimating the importance of {topic}",
        f"Incorrect applications of {topic} in practice"
    ]

def suggest_resources(topic: str, category: str) -> List[Dict[str, str]]:
    """Suggest learning resources"""
    resources = []
    
    # Add general resources
    resources.append({
        'type': 'Online Course',
        'title': f'Introduction to {topic}',
        'description': f'Comprehensive course covering {topic} fundamentals',
        'platform': 'Coursera/edX'
    })
    
    resources.append({
        'type': 'Book',
        'title': f'The Complete Guide to {topic}',
        'description': f'In-depth exploration of {topic}',
        'platform': 'Amazon/Bookstore'
    })
    
    # Add category-specific resources
    if category.lower() == 'technology':
        resources.append({
            'type': 'Documentation',
            'title': f'Official {topic} Documentation',
            'description': f'Technical reference and guides',
            'platform': 'Official Website'
        })
    
    return resources

# ========================================================
# UTILITY FUNCTIONS
# ========================================================

def enhance_quiz_data(quiz_data: Dict[str, Any], topic: str, difficulty: str,
                     num_questions: int, quiz_type: str) -> Dict[str, Any]:
    """Enhance and validate quiz data from OpenAI"""
    
    enhanced = quiz_data.copy()
    
    # Ensure required fields
    enhanced.setdefault('title', f'{topic} Quiz')
    enhanced.setdefault('description', f'Test your knowledge about {topic}')
    enhanced.setdefault('category', categorize_topic(topic))
    enhanced.setdefault('difficulty', difficulty)
    
    # Calculate estimated time if not present
    if 'estimatedTime' not in enhanced:
        enhanced['estimatedTime'] = num_questions * 0.8
    
    # Calculate total points if not present
    if 'totalPoints' not in enhanced:
        total = sum(q.get('points', 100) for q in enhanced.get('questions', []))
        enhanced['totalPoints'] = total
    
    # Enhance questions
    for i, question in enumerate(enhanced.get('questions', [])):
        # Ensure required fields
        question.setdefault('type', quiz_type)
        question.setdefault('points', 100 if difficulty == 'easy' else 150 if difficulty == 'medium' else 200)
        question.setdefault('timeLimit', 30 if difficulty == 'easy' else 45 if difficulty == 'medium' else 60)
        question.setdefault('difficulty', difficulty)
        question.setdefault('explanation', 'Refer to course materials for detailed explanation.')
        
        # Add educational tip
        if 'educationalTip' not in question:
            question['educationalTip'] = generate_educational_tip(topic, f"concept {i+1}")
    
    # Add metadata
    enhanced['metadata'] = {
        **enhanced.get('metadata', {}),
        'generatedAt': datetime.now().isoformat(),
        'totalQuestions': len(enhanced.get('questions', [])),
        'aiGenerated': True,
        'enhancementLevel': 'full'
    }
    
    return enhanced

# ========================================================
# ERROR HANDLERS
# ========================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'success': False,
        'error': 'Bad request'
    }), 400

# ========================================================
# APPLICATION STARTUP
# ========================================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'production') != 'production'
    
    logger.info("=" * 60)
    logger.info("🎯 Quizito AI Service Starting...")
    logger.info(f"📁 Python Version: {os.sys.version}")
    logger.info(f"🔧 OpenAI Available: {bool(client)}")
    logger.info(f"🌍 Port: {port}")
    logger.info(f"🐛 Debug Mode: {debug}")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
