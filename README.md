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
- NVIDIA GPU with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) (for GPU acceleration)

### Deployment

1. **Clone this repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Start the services:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Web UI container
   - Pull the Chatterbox TTS backend image
   - Start both services with proper networking

3. **Access the application:**
   - **Web UI:** http://localhost:3000
   - **API (direct):** http://localhost:8000

### Stopping the Services

```bash
docker-compose down
```

### Running in Background (Detached Mode)

```bash
docker-compose up --build -d
```

View logs:
```bash
docker-compose logs -f
```

### CPU-Only Mode (No GPU)

If you don't have an NVIDIA GPU, modify `docker-compose.yml` to remove the GPU reservation:

```yaml
# Remove or comment out this section in docker-compose.yml:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

## Architecture

```
┌─────────────────┐     ┌─────────────────────┐
│   Web Browser   │────▶│  Web UI (port 3000) │
└─────────────────┘     └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │  Chatterbox Backend │
                        │    (port 8000)      │
                        └─────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate` | POST | Generate speech from text |

### Generate Speech Request

```bash
curl -X POST http://localhost:8000/generate \
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
- Ensure the Chatterbox container is healthy: `docker-compose ps`
- Check backend logs: `docker-compose logs chatterbox`

### GPU not detected
- Verify NVIDIA drivers: `nvidia-smi`
- Check Container Toolkit: `docker run --gpus all nvidia/cuda:11.0-base nvidia-smi`

### Port conflicts
- Change ports in `docker-compose.yml` if 3000 or 8000 are in use

## License

MIT License
