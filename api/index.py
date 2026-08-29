import os
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import google.generativeai as genai

# Get the absolute path of the current directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, 
            static_folder=os.path.join(BASE_DIR, 'static'),
            template_folder=os.path.join(BASE_DIR, 'templates'))
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ GEMINI_API_KEY not set!")

if API_KEY:
    genai.configure(api_key=API_KEY)
    try:
        model = genai.GenerativeModel('gemini-3.5-flash')
    except:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
        except:
            model = genai.GenerativeModel('gemini-pro')

history = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'static'), filename)

@app.route('/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({
            'response': '⚠️ API Key not configured. Please add GEMINI_API_KEY in environment variables.'
        })
    
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message.strip():
        return jsonify({'response': 'Please type something!'})
    
    history.append(user_message)
    prompt = """You are DebugBot, a friendly and helpful AI debugging assistant. 
Your expertise is in Python programming, debugging, and error resolution.
Keep responses concise, friendly, and practical.

User: """ + user_message
    
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

# For Vercel serverless
app.debug = False

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5000)
