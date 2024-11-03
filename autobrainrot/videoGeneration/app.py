from flask import Flask, request, jsonify, send_file
from shortGPT.config.api_db import ApiKeyManager
from shortGPT.engine.facts_short_engine import FactsShortEngine
from shortGPT.engine.ad_short_engine import AdShortEngine
from shortGPT.engine.reddit_short_engine import RedditShortEngine
from shortGPT.engine.multi_language_translation_engine import MultiLanguageTranslationEngine
from shortGPT.audio.eleven_voice_module import ElevenLabsVoiceModule
from shortGPT.audio.edge_voice_module import EdgeTTSVoiceModule
# from shortGPT.audio.coqui_voice_module import CoquiVoiceModule
from shortGPT.config.languages import Language, EDGE_TTS_VOICENAME_MAPPING, LANGUAGE_ACRONYM_MAPPING
from shortGPT.api_utils.eleven_api import ElevenLabsAPI
from shortGPT.config.asset_db import AssetDatabase
import os
import platform
import subprocess

from zipfile import ZipFile

app = Flask(__name__)

# Utility functions
class AssetUtils:
    EDGE_TTS = "EdgeTTS"
    ELEVEN_TTS = "ElevenLabs"

    COQUI_TTS_VOICES = [
        # List of Coqui TTS voices
        "Claribel Dervla",
        "Daisy Studious",
        # ... (other voices omitted for brevity)
    ]

    @staticmethod
    def get_background_video_choices():
        df = AssetDatabase.get_df()
        choices = list(df.loc[df["type"] == "background video"]["name"])
        return choices

    @staticmethod
    def get_background_music_choices():
        df = AssetDatabase.get_df()
        choices = list(df.loc[df["type"] == "background music"]["name"])
        return choices

    @staticmethod
    def get_elevenlabs_voices():
        api_key = ApiKeyManager.get_api_key("ELEVEN_LABS")
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

# Function to create short videos
def create_short_video(
    num_shorts,
    short_type,
    tts_engine,
    language,
    voice_choice,
    num_images,
    watermark,
    background_videos,
    background_musics,
    subject,
):
    # Load API keys
    api_key_manager = ApiKeyManager()
    eleven_key = api_key_manager.get_api_key("ELEVEN_LABS")
    openai_key = api_key_manager.get_api_key("OPENAI_API_KEY")
    if tts_engine == "ElevenLabs" and not eleven_key:
        raise ValueError("ELEVEN LABS API key is missing.")
    if not openai_key:
        raise ValueError("OPENAI API key is missing.")

    # Set up voice module based on TTS engine choice
    language_obj = Language(language.lower().capitalize())
    if tts_engine == "ElevenLabs":
        voice_module = ElevenLabsVoiceModule(eleven_key, voice_choice, checkElevenCredits=True)
    elif tts_engine == "EdgeTTS":
        voice_name = EDGE_TTS_VOICENAME_MAPPING[language_obj]['male']  # or 'female'
        voice_module = EdgeTTSVoiceModule(voice_name)
    # elif tts_engine == "CoquiTTS":
    #     language_acronym = LANGUAGE_ACRONYM_MAPPING[language_obj]
    #     voice_module = CoquiVoiceModule(voice_choice, language_acronym)
    else:
        raise ValueError("Unsupported TTS engine")

    # Prepare background assets
    if not background_videos:
        background_videos = AssetUtils.get_background_video_choices()[:num_shorts]
    if not background_musics:
        background_musics = AssetUtils.get_background_music_choices()[:num_shorts]

    # Ensure lists are long enough
    background_videos *= (num_shorts // len(background_videos)) + 1
    background_musics *= (num_shorts // len(background_musics)) + 1

    video_paths = []

    for i in range(num_shorts):
        # Select short engine type
        if short_type == "reddit_story_shorts":
            short_engine = RedditShortEngine(
                voiceModule=voice_module,
                background_video_name=background_videos[i],
                background_music_name=background_musics[i],
                num_images=num_images,
                watermark=watermark,
                language=language_obj,
            )
        elif short_type == "facts_shorts":
            short_engine = FactsShortEngine(
                voiceModule=voice_module,
                facts_type=subject,
                background_video_name=background_videos[i],
                background_music_name=background_musics[i],
                num_images=num_images,
                watermark=watermark,
                language=language_obj,
            )
        elif short_type == "ad_shorts":
            short_engine = AdShortEngine(
                voiceModule=voice_module,
                ads_type=subject,
                background_video_name=background_videos[i],
                background_music_name=background_musics[i],
                num_images=num_images,
                watermark=watermark,
                language=language_obj,
            )
        else:
            short_engine = FactsShortEngine(
                voiceModule=voice_module,
                facts_type=subject,
                background_video_name=background_videos[i],
                background_music_name=background_musics[i],
                num_images=num_images,
                watermark=watermark,
                language=language_obj,
            )

        # Generate video content
        for step_num, step_info in short_engine.makeContent():
            print(f"Progress: Short {i+1}/{num_shorts} - Step {step_num + 1}/{short_engine.get_total_steps()} - {step_info}")

        # Get path of the generated video
        video_path = short_engine.get_video_output_path()
        video_paths.append(video_path)

    return video_paths

# Endpoint to create short videos
@app.route('/create_short', methods=['POST'])
def create_short():
    try:
        data = request.json
        num_shorts = int(data.get("num_shorts", 1))
        short_type = data.get("short_type", "Scientific Facts shorts") #options: reddit_story_short, facts_shorts, ad_shorts
        subject = data.get("subject", "Insurances")
        tts_engine = data.get("tts_engine", "EdgeTTS")
        language = data.get("language", "English")
        voice_choice = data.get("voice_choice", "en-US-GuyNeural")
        num_images = int(data.get("num_images", 5))
        watermark = data.get("watermark", "")
        background_videos = data.get("background_videos", [])
        background_musics = data.get("background_musics", [])

        # Generate the videos
        video_paths = create_short_video(
            num_shorts=num_shorts,
            short_type=short_type,
            tts_engine=tts_engine,
            language=language,
            voice_choice=voice_choice,
            num_images=num_images,
            watermark=watermark,
            background_videos=background_videos,
            background_musics=background_musics,
            subject=subject
        )

        # Create a zip file containing all video paths
        zip_filename = "videos.zip"
        with ZipFile(zip_filename, 'w') as zipf:
            for video_path in video_paths:
                zipf.write(video_path, os.path.basename(video_path))
        return send_file(zip_filename, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to translate videos
def translate_video(
    video_type,
    video_path,
    yt_link,
    tts_engine,
    languages,
    use_captions,
    voice_choice,
):
    # Load API keys
    api_key_manager = ApiKeyManager()
    eleven_key = api_key_manager.get_api_key("ELEVEN LABS")
    openai_key = api_key_manager.get_api_key("OPENAI")
    if tts_engine == "ElevenLabs" and not eleven_key:
        raise ValueError("ELEVEN LABS API key is missing.")
    if not openai_key:
        raise ValueError("OPENAI API key is missing.")

    video_paths = []

    for language in languages:
        language_obj = Language(language.lower().capitalize())
        # Set up voice module
        if tts_engine == "ElevenLabs":
            voice_module = ElevenLabsVoiceModule(eleven_key, voice_choice, checkElevenCredits=True)
        elif tts_engine == "EdgeTTS":
            voice_name = EDGE_TTS_VOICENAME_MAPPING[language_obj]['male']
            voice_module = EdgeTTSVoiceModule(voice_name)
        # elif tts_engine == "CoquiTTS":
        #     language_acronym = LANGUAGE_ACRONYM_MAPPING[language_obj]
        #     voice_module = CoquiVoiceModule(voice_choice, language_acronym)
        else:
            raise ValueError("Unsupported TTS engine")

        # Source video
        if video_type == "Youtube link":
            src_url = yt_link
        else:
            src_url = video_path

        # Create translation engine
        translation_engine = MultiLanguageTranslationEngine(
            voiceModule=voice_module,
            src_url=src_url,
            target_language=language_obj,
            use_captions=use_captions
        )

        # Generate video content
        for step_num, step_info in translation_engine.makeContent():
            print(f"Progress: Translating to {language} - Step {step_num + 1}/{translation_engine.get_total_steps()} - {step_info}")

        # Get path of the generated video
        translated_video_path = translation_engine.get_video_output_path()
        video_paths.append(translated_video_path)

    return video_paths

# Endpoint to translate videos
@app.route('/translate_video', methods=['POST'])
def translate_video_endpoint():
    try:
        data = request.json
        video_type = data.get("video_type", "Youtube link")
        yt_link = data.get("yt_link", "")
        video_path = data.get("video_path", "")
        tts_engine = data.get("tts_engine", "EdgeTTS")
        languages = data.get("languages", ["English"])
        use_captions = data.get("use_captions", False)
        voice_choice = data.get("voice_choice", "Antoni")

        # Generate the translated videos
        video_paths = translate_video(
            video_type=video_type,
            video_path=video_path,
            yt_link=yt_link,
            tts_engine=tts_engine,
            languages=languages,
            use_captions=use_captions,
            voice_choice=voice_choice
        )

        # Return the generated video files
        if len(video_paths) == 1:
            return send_file(video_paths[0], as_attachment=True)
        else:
            return jsonify({"video_paths": video_paths})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def home():
    return "The app is working!"

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=12345)
