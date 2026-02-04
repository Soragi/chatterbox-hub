"""
Chatterbox TTS API Server
A FastAPI server that wraps the Chatterbox TTS model for speech synthesis.
"""

import os
import io
import tempfile
from pathlib import Path

import torch
import torchaudio
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(title="Chatterbox TTS API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
model = None

def get_device():
    """Determine the best available device."""
    device_override = os.environ.get("CHATTERBOX_DEVICE", "").lower()
    if device_override:
        return device_override
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

def load_model():
    """Load the Chatterbox TTS model."""
    global model
    if model is None:
        from chatterbox.tts import ChatterboxTTS
        device = get_device()
        print(f"Loading Chatterbox TTS model on {device}...")
        model = ChatterboxTTS.from_pretrained(device=device)
        print("Model loaded successfully!")
    return model

@app.on_event("startup")
async def startup_event():
    """Load model on startup."""
    load_model()

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": get_device()
    }

@app.post("/generate")
async def generate_speech(
    text: str = Form(...),
    exaggeration: float = Form(0.5),
    cfg_weight: float = Form(0.5),
    temperature: float = Form(0.8),
    audio: UploadFile = File(None)
):
    """
    Generate speech from text with optional voice cloning.
    
    Args:
        text: The text to synthesize
        exaggeration: Emotion exaggeration factor (0.0-1.0)
        cfg_weight: Classifier-free guidance weight (0.0-1.0)
        temperature: Sampling temperature (0.1-1.5)
        audio: Optional reference audio file for voice cloning
    
    Returns:
        WAV audio file
    """
    try:
        tts_model = load_model()
        
        # Handle reference audio for voice cloning
        audio_prompt = None
        if audio and audio.filename:
            # Save uploaded audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                content = await audio.read()
                tmp.write(content)
                tmp_path = tmp.name
            
            try:
                # Load the reference audio
                audio_prompt, _ = torchaudio.load(tmp_path)
            finally:
                # Clean up temp file
                os.unlink(tmp_path)
        
        # Generate speech
        wav = tts_model.generate(
            text=text,
            audio_prompt=audio_prompt,
            exaggeration=exaggeration,
            cfg_weight=cfg_weight,
            temperature=temperature
        )
        
        # Convert to WAV bytes
        buffer = io.BytesIO()
        torchaudio.save(buffer, wav.cpu(), sample_rate=24000, format="wav")
        buffer.seek(0)
        
        return Response(
            content=buffer.read(),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=output.wav"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
