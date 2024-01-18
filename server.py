from flask import Flask, request, jsonify, send_file
from elevenlabs import generate, save
from elevenlabs import set_api_key
from api_keys import ELEVEN_LABS_API_KEY, OPENAI_API_KEY
import os
from openai import OpenAI
from werkzeug.utils import secure_filename
from flask_cors import CORS
from io import BytesIO
from pydub import AudioSegment

set_api_key(ELEVEN_LABS_API_KEY)
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
client = OpenAI(api_key=OPENAI_API_KEY)

# Set the upload and download folders
app.config['UPLOAD_FOLDER'] = './Audio'
app.config['DOWNLOAD_FOLDER'] = './Audio'
app.config['ALLOWED_EXTENSIONS'] = {'wav', 'mp3'}

# Function to check if the file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def translate_whisper(audio_blob):
    
    transcript = client.audio.translations.create(
        model="whisper-1", 
        file= audio_blob,  # Pass the file content as bytes
        response_format="text"
    )
    translated_text = transcript.text
    print(translated_text)
    return translated_text


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return jsonify({"message": "File uploaded successfully", "filename": filename})

    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/voice-clone', methods=['POST'])
def voice_clone():
    data = request.form
    text = data.get('text')

    file_blob = request.files['file']
    translated_text = translate_whisper(file_blob)

    audio = generate(text=translated_text)
    processed_audio_path = os.path.join(app.config['DOWNLOAD_FOLDER'], 'processed_audio.wav')
    save(audio, processed_audio_path)

    return send_file(processed_audio_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)