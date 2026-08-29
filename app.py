import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("⚠️ GEMINI_API_KEY not set!")

if API_KEY:
    genai.configure(api_key=API_KEY)
    try:
        model = genai.GenerativeModel('gemini-3.5-flash')
    except:
        model = genai.GenerativeModel('gemini-1.5-flash')

history = []

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({'response': '⚠️ API Key not configured. Please add GEMINI_API_KEY in Vercel environment variables.'})
    
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message.strip():
        return jsonify({'response': 'Please type something!'})
    
    history.append(user_message)
    prompt = "You are DebugBot, a friendly AI assistant.\n\nUser: " + user_message
    
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
