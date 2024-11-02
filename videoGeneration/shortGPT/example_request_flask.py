import requests
import json

# Define the request payload
payload = {
    "short_type": "Scientific Facts shorts",
    "facts_subject": "Physics",
    "tts_engine": "ElevenLabs",
    "language": "English",
    "num_shorts": 1,
    "num_images": 10,
    "watermark": "MyChannel",
    "use_background_video": True,
    "use_background_music": True
}

# Send the POST request
response = requests.post("http://127.0.0.1:5000/generate_video", json=payload)

# Save the video file if request was successful
if response.status_code == 200:
    with open("generated_video.mp4", "wb") as f:
        f.write(response.content)
    print("Video downloaded successfully as generated_video.mp4")
else:
    print("Error:", response.json())
