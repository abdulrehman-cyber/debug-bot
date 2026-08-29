import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
CORS(app)

# Get API key
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ ERROR: No API key found in .env file!")
    print("Please create .env file with GEMINI_API_KEY=your_key_here")
    exit(1)

# Configure Gemini
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-3.5-flash')

# Personality
personality = """You are DebugBot, a friendly AI assistant for Pakistani students learning Python debugging. 
You explain things in simple English mixed with Urdu when needed. Keep answers short and helpful."""

history = []

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message.strip():
        return jsonify({'response': 'Please type something!'})
    
    if user_message.lower() == 'exit':
        return jsonify({'response': 'Allah Hafiz! Keep debugging!', 'exit': True})
    
    # Build prompt with context
    if not history:
        prompt = personality + "\n\nUser: " + user_message
    else:
        context = "Previous conversation:\n"
        for i, msg in enumerate(history[-3:]):
            context += f"User: {msg}\n"
        prompt = context + "\nUser: " + user_message
    
    history.append(user_message)
    
    try:
        response = model.generate_content(prompt)
        return jsonify({'response': response.text})
    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'})

@app.route('/clear_history', methods=['POST'])
def clear():
    global history
    history = []
    return jsonify({'success': True})

if __name__ == '__main__':
   
    app.run(debug=True, port=5000)