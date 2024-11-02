from flask import Flask, request, jsonify, send_file
from shortGPT.config.api_db import ApiKeyManager
from shortGPT.engine.facts_short_engine import FactsShortEngine
from shortGPT.engine.reddit_short_engine import RedditShortEngine
from shortGPT.audio.eleven_voice_module import ElevenLabsVoiceModule
from shortGPT.audio.edge_voice_module import EdgeTTSVoiceModule
from shortGPT.audio.coqui_voice_module import CoquiVoiceModule
from shortGPT.config.languages import Language
from shortGPT.api_utils.eleven_api import ElevenLabsAPI
from shortGPT.config.asset_db import AssetDatabase
import os
import platform
import subprocess

app = Flask(__name__)

# Utility functions (previously AssetComponentsUtils class)
class AssetUtils:
    EDGE_TTS = "Free EdgeTTS (lower quality)"
    COQUI_TTS = "Free CoquiTTS (needs a powerful GPU)"
    ELEVEN_TTS = "ElevenLabs(Very High Quality)"
    
    COQUI_TTS_VOICES = [
        "Claribel Dervla", "Daisy Studious", "Gracie Wise", "Tammie Ema", "Alison Dietlinde", 
        "Ana Florence", "Annmarie Nele", "Asya Anara", "Brenda Stern", "Gitta Nikolina", 
        "Henriette Usha", "Sofia Hellen", "Tammy Grit", "Tanja Adelina", "Vjollca Johnnie",
        # ... (other voices omitted for brevity)
    ]

    @staticmethod
    def get_background_video_choices():
        df = AssetDatabase.get_df()
        choices = list(df.loc[df["type"] == "background video"]["name"])[:20]
        return choices

    @staticmethod
    def get_background_music_choices():
        df = AssetDatabase.get_df()
        choices = list(df.loc[df["type"] == "background music"]["name"])[:20]
        return choices

    @staticmethod
    def get_elevenlabs_voices():
        api_key = ApiKeyManager.get_api_key("ELEVEN LABS")
        voices = list(reversed(ElevenLabsAPI(api_key).get_voices().keys()))
        return voices

    @staticmethod
    def start_file(path):
        if platform.system() == "Windows":
            os.startfile(path)
        elif platform.system() == "Darwin":
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])

# Main function to create a video based on parameters
def create_short_video(
    short_type, facts_subject, tts_engine, language, num_shorts, num_images, watermark,
    use_background_video, use_background_music
):
    # Load API keys
    api_key_manager = ApiKeyManager()
    eleven_key = api_key_manager.get_api_key("ELEVEN LABS")
    if tts_engine == "ElevenLabs" and not eleven_key:
        raise ValueError("ELEVEN LABS API key is missing.")

    # Set up voice module based on TTS engine choice
    if tts_engine == "ElevenLabs":
        language_obj = Language(language.lower().capitalize())
        voice_module = ElevenLabsVoiceModule(eleven_key, "Antoni", checkElevenCredits=True)
    elif tts_engine == "EdgeTTS":
        language_obj = Language(language.lower().capitalize())
        voice_module = EdgeTTSVoiceModule("default_edge_voice")  # Set default edge voice name as needed
    elif tts_engine == "CoquiTTS":
        language_obj = Language(language.lower().capitalize())
        voice_module = CoquiVoiceModule("default_coqui_voice")  # Set default coqui voice name as needed
    else:
        raise ValueError("Unsupported TTS engine")

    # Select short engine type
    if short_type == "Reddit Story shorts":
        short_engine_class = RedditShortEngine
    else:
        short_engine_class = FactsShortEngine

    # Generate background videos and music if required
    background_videos = AssetUtils.get_background_video_choices() if use_background_video else []
    background_musics = AssetUtils.get_background_music_choices() if use_background_music else []

    # Create the short
    short_engine = short_engine_class(
        voice_module=voice_module,
        facts_type=facts_subject,
        background_video_name=background_videos[0] if background_videos else None,
        background_music_name=background_musics[0] if background_musics else None,
        num_images=num_images,
        watermark=watermark,
        language=language_obj,
    )

    # Generate video content
    for step_num, step_info in short_engine.makeContent():
        print(f"Progress: Step {step_num + 1}/{short_engine.get_total_steps()} - {step_info}")

    # Get path of the generated video
    video_path = short_engine.get_video_output_path()
    return video_path

# Flask route to create a video
@app.route('/generate_video', methods=['POST'])
def generate_video():
    try:
        data = request.json
        short_type = data.get("short_type", "Scientific Facts shorts")
        facts_subject = data.get("facts_subject", "Science")
        tts_engine = data.get("tts_engine", "ElevenLabs")
        language = data.get("language", "English")
        num_shorts = int(data.get("num_shorts", 1))
        num_images = int(data.get("num_images", 25))
        watermark = data.get("watermark", "")
        use_background_video = data.get("use_background_video", True)
        use_background_music = data.get("use_background_music", True)

        # Generate the video
        video_path = create_short_video(
            short_type=short_type,
            facts_subject=facts_subject,
            tts_engine=tts_engine,
            language=language,
            num_shorts=num_shorts,
            num_images=num_images,
            watermark=watermark,
            use_background_video=use_background_video,
            use_background_music=use_background_music
        )

        # Return the generated video file
        return send_file(video_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)

"""
curl -X POST http://127.0.0.1:5000/generate_video \
-H "Content-Type: application/json" \
-d '{
      "short_type": "Scientific Facts shorts",
      "facts_subject": "Physics",
      "tts_engine": "ElevenLabs",
      "language": "English",
      "num_shorts": 1,
      "num_images": 10,
      "watermark": "MyChannel",
      "use_background_video": true,
      "use_background_music": true
    }' --output generated_video.mp4

"""