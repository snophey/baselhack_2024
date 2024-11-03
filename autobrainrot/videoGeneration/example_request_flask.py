import argparse
import requests
import json
import zipfile
import io

# Base URL of your Flask API
BASE_URL = 'http://localhost:12345'

import time
import os

def store_video(response, video_name):
    """Save the video file(s) from the response, specifically handling zip archives with .mp4 files."""
    timestamp = int(time.time())
    save_directory = f"videos_{timestamp}"
    os.makedirs(save_directory, exist_ok=True)
    
    if response.status_code == 200 and response.headers['content-type'] == 'application/zip':
        # Save the zip content directly to memory and open it
        with zipfile.ZipFile(io.BytesIO(response.content)) as zipf:
            for file_info in zipf.infolist():
                # Only extract and save .mp4 files
                if file_info.filename.endswith('.mp4'):
                    zipf.extract(file_info, save_directory)
                    print(f"Saved {file_info.filename} in {save_directory}")
    else:
        print(f"Error or unexpected content type: {response.status_code}")

def create_custom_fact_shorts(video_name):
    """Scenario 1: Create custom fact shorts using ElevenLabs TTS in English."""
    endpoint = f'{BASE_URL}/create_short'
    payload = {
        "num_shorts": 1,
        "short_type": "facts_shorts",
        "subject": "Facts about pickles",
        # "tts_engine": "EdgeTTS",
        "language": "English",
        "voice_choice": "en-US-GuyNeural",  # Make sure this voice exists in your ElevenLabs account
        "num_images": 5,
        "watermark": "You can do it!",
        "background_videos": ["Minecraft jumping circuit"],  # Replace with actual names from your asset database
        # "background_videos": ["Ski gameplay"],  # Replace with actual names from your asset database
        "background_musics": ["Music dj quads"]        # Replace with actual names from your asset database
    }

    response = requests.post(endpoint, json=payload)
    print("Got video! Now storing locally...")
    store_video(response, video_name)

def create_custom_fact_shorts_german(video_name):
    """Scenario 1: Create custom fact shorts using ElevenLabs TTS in English."""
    endpoint = f'{BASE_URL}/create_short'
    payload = {
        "num_shorts": 2,
        "short_type": "ad_shorts",
        "subject": "Motorbike enthusiasts",
        "tts_engine": "ElevenLabs",
        # "tts_engine": "EdgeTTS",
        "language": "German",
        "voice_choice": "Roger",  # everlab ID
        # "voice_choice": "de-DE-ConradNeural",  # Make sure this voice exists in your ElevenLabs account
        "num_images": 7,
        "watermark": "stay safe\nnavbär.com",
        "background_videos": ["Motorbike"],  # Replace with actual names from your asset database
        "background_musics": ["Music joakim karud dreams"]        # Replace with actual names from your asset database
    }

    response = requests.post(endpoint, json=payload)
    print(response)
    store_video(response, video_name)

def create_custom_fact_shorts_everlab(video_name):
    """Scenario 1: Create custom fact shorts using ElevenLabs TTS in English."""
    endpoint = f'{BASE_URL}/create_short'
    payload = {
        "num_shorts": 1,
        "short_type": "Custom Facts shorts",
        "subject": "Artificial Intelligence",
        "tts_engine": "EdgeTTS",
        "language": "English",
        "voice_choice": "pNInz6obpgDQGcFmaJgB",  # Make sure this voice exists in your ElevenLabs account
        "num_images": 10,
        "watermark": "MyAIChannel",
        "background_videos": ["Minecraft jumping circuit"],  # Replace with actual names from your asset database
        "background_musics": ["Music dj quads"]        # Replace with actual names from your asset database
    }

    response = requests.post(endpoint, json=payload)
    store_video(response, video_name)

def create_reddit_story_shorts(video_name):
    """Scenario 2: Create Reddit story shorts using EdgeTTS in Spanish."""
    endpoint = f'{BASE_URL}/create_short'
    payload = {
        "num_shorts": 1,
        "short_type": "Reddit Story shorts",
        "tts_engine": "EdgeTTS",
        "language": "English",
        "voice_choice": "",  # EdgeTTS uses predefined voices based on language; leave empty or specify if needed
        "num_images": 5,
        "watermark": "MySpanishChannel",
        "background_videos": ["BackgroundVideo2"],  # Replace with actual names
        "background_musics": ["MusicTrack2"]
    }

    response = requests.post(endpoint, json=payload)
    store_video(response, video_name)

def translate_youtube_video(video_name):
    """Scenario 3: Translate a YouTube video into French and German using CoquiTTS."""
    endpoint = f'{BASE_URL}/translate_video'
    payload = {
        "video_type": "Youtube link",
        "yt_link": "https://www.youtube.com/watch?v=YPpdpjZ5yEw",  # Replace with actual YouTube link
        "tts_engine": "EdgeTTS",
        "languages": ["French", "German"],
        "use_captions": True,
        "voice_choice": ""  # Replace with a valid CoquiTTS voice
    }

    response = requests.post(endpoint, json=payload)
    if response.status_code == 200:
        result = response.json()
        with zipfile.ZipFile(video_name + '.zip', 'w') as zipf:
            for idx, video_path in enumerate(result['video_paths']):
                zipf.write(video_path, os.path.basename(video_path))
        print(f"Translated video {idx+1} saved at: {video_name}.zip")
    else:
        print(f"Error: {response.json()['error']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", type=int, required=True, help="Select a scenario to run (1, 2, or 3)")
    args = parser.parse_args()

    if args.scenario == 1:
        print("Scenario 1: Creating Custom Fact Shorts")
        create_custom_fact_shorts('custom_fact_short')
    elif args.scenario == 2:
        print("Scenario 2: Creating everlab voice Shorts")
        create_custom_fact_shorts_everlab('custom_fact_shorts_everlab')
    elif args.scenario == 3:
        print("Scenario 2: Creating Reddit Story Shorts")
        create_reddit_story_shorts('reddit_story_short')
    elif args.scenario == 4:
        print("Scenario 4: Translating YouTube Video")
        translate_youtube_video('translated_video')
    elif args.scenario == 5:
        print("Scenario 5: Creating german video for ads")
        create_custom_fact_shorts_german('custom_fact_shorts_german')
    else:
        print("Error: Invalid scenario number")

#--------------------------------------

""" Motorbike
    payload = {
        "num_shorts": 1,
        "short_type": "ad_shorts",
        "subject": "Motorbike enthusiasts",
        # "tts_engine": "ElevenLabs",
        "tts_engine": "EdgeTTS",
        "language": "German",
        # "voice_choice": "Roger",  # everlab ID
        "voice_choice": "de-DE-ConradNeural",  # Make sure this voice exists in your ElevenLabs account
        "num_images": 10,
        "watermark": "navbär.com",
        "background_videos": ["Motorbike", "Motorbike crash"],  # Replace with actual names from your asset database
        "background_musics": ["Music joakim karud dreams"]        # Replace with actual names from your asset database
    }

"""
""" Drunk
    payload = {
        "num_shorts": 1,
        "short_type": "ad_shorts",
        "subject": "Party people drinking a bit too much",
        # "tts_engine": "ElevenLabs",
        "tts_engine": "EdgeTTS",
        "language": "German",
        # "voice_choice": "Roger",  # everlab ID
        "voice_choice": "de-DE-ConradNeural",  # Make sure this voice exists in your ElevenLabs account
        "num_images": 10,
        "watermark": "stay safe! ~ navbär.com",
        "background_videos": ["Motorbike", "Motorbike crash"],  # Replace with actual names from your asset database
        "background_musics": ["Music joakim karud dreams"]        # Replace with actual names from your asset database
    }

"""