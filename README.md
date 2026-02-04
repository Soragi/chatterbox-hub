# Chatterbox TTS Web UI

A modern web interface for the [Chatterbox TTS](https://github.com/resemble-ai/chatterbox) text-to-speech system with voice cloning capabilities.

![Chatterbox Web UI](https://img.shields.io/badge/Chatterbox-TTS%20Web%20UI-blue)

## Features

- 🎤 **Voice Cloning** - Upload reference audio to clone any voice
- 🎛️ **Emotion Controls** - Fine-tune exaggeration, CFG weight, and temperature
- 📝 **Paralinguistic Tags** - Add natural speech elements like laughter and sighs
- 🌊 **Waveform Visualization** - Real-time audio visualization
- 🌙 **Dark Theme** - Modern, audio-focused interface

## Quick Start with Docker Compose

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- NVIDIA GPU with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
- Hugging Face account with API token

### Step 1: Build the Chatterbox Backend

First, clone and build the official Chatterbox TTS image:

```bash
git clone https://github.com/resemble-ai/chatterbox.git
cd chatterbox
docker build -t chatterbox-tts .
```

### Step 2: Setup This Project

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Create directories for persistence
mkdir -p hf_cache voices
```

### Step 3: Configure Environment

Create a `.env` file with your Hugging Face token:

```bash
echo "HF_TOKEN=hf_your_token_here" > .env
```

### Step 4: Start the Services

```bash
docker compose up --build
```

This will:
- Start the Chatterbox TTS backend on port 10050
- Build and start the Web UI on port 3000
- Connect both services with proper networking

> **Note:** First startup may take a few minutes to download models.

### Step 5: Access the Application

- **Web UI:** http://localhost:3000
- **API (direct):** http://localhost:10050

## Voice Cloning Setup

To preload a voice for cloning:

1. Place your reference audio file in `./voices/`:
   ```bash
   cp your_reference.wav ./voices/reference.wav
   ```

2. Update the command in `docker-compose.yml`:
   ```yaml
   command: python tts_api.py --port 10050 --preload-voice /workspace/audio/reference.wav
   ```

3. Restart the services:
   ```bash
   docker compose down && docker compose up
   ```

## Stopping the Services

```bash
docker compose down
```

## Running in Background (Detached Mode)

```bash
docker compose up --build -d
```

View logs:
```bash
docker compose logs -f
```

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐
│   Web Browser   │────▶│  Web UI (port 3000) │
└─────────────────┘     └──────────┬──────────┘
                                   │ /api/*
                                   ▼
                        ┌─────────────────────┐
                        │  Chatterbox Backend │
                        │   (port 10050)      │
                        └─────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate` | POST | Generate speech from text |

### Generate Speech Request

```bash
curl -X POST http://localhost:10050/generate \
  -F "text=Hello, world!" \
  -F "exaggeration=0.5" \
  -F "cfg_weight=0.5" \
  -F "temperature=0.8" \
  -F "audio=@reference.wav"
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at http://localhost:5173

### Project Structure

```
├── src/
│   ├── components/
│   │   ├── AudioPlayer.tsx      # Audio playback with controls
│   │   ├── EmotionControls.tsx  # Parameter sliders
│   │   ├── SettingsPanel.tsx    # API configuration
│   │   ├── TextInput.tsx        # Text input with tags
│   │   ├── VoiceSelector.tsx    # Voice grid & upload
│   │   └── WaveformVisualizer.tsx
│   ├── hooks/
│   │   └── useChatterbox.ts     # API integration hook
│   └── pages/
│       └── Index.tsx            # Main application
├── docker-compose.yml           # Multi-service deployment
├── Dockerfile                   # Web UI container
└── nginx.conf                   # Reverse proxy config
```

## Technologies

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Chatterbox TTS (PyTorch)
- **Deployment:** Docker, Docker Compose, Nginx

## Troubleshooting

### Backend not connecting
- Ensure the Chatterbox container is healthy: `docker compose ps`
- Check backend logs: `docker compose logs chatterbox`

### GPU not detected
- Verify NVIDIA drivers: `nvidia-smi`
- Check Container Toolkit: `docker run --gpus all nvidia/cuda:12.0-base nvidia-smi`

### Port conflicts
- Change ports in `docker-compose.yml` if 3000 or 10050 are in use

### HF_TOKEN errors
- Ensure your `.env` file contains a valid Hugging Face token
- Get a token at https://huggingface.co/settings/tokens

## License

MIT License
