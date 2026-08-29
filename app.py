import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__, static_folder='static')
CORS(app)

# Get API key from environment
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("❌ GEMINI_API_KEY not set in environment")
    # Don't exit, but return error for API calls

# Configure Gemini
if API_KEY:
    genai.configure(api_key=API_KEY)
    # Try different model names
    try:
        model = genai.GenerativeModel('gemini-pro')
    except:
        model = genai.GenerativeModel('gemini-3.5-flash')

personality = """You are DebugBot, a friendly AI assistant for Pakistani students learning Python debugging."""

history = []

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def css():
    return send_from_directory('static', 'style.css')

@app.route('/script.js')
def js():
    return send_from_directory('static', 'script.js')

@app.route('/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({'response': 'API Key not configured. Please set GEMINI_API_KEY in environment variables.'})
    
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message.strip():
        return jsonify({'response': 'Please type something!'})
    
    # Build prompt
    prompt = personality + "\n\nUser: " + user_message
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