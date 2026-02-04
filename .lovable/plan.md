

# Adding Chatterbox Web UI to Your GitHub Repository

This guide explains which files to add to your GitHub repo and how to create a pull request with the Docker deployment setup.

## Recommendation: Docker Compose vs Docker Run

**Docker Compose is better** for this project because:
- It orchestrates 2 services (backend + frontend) that need to communicate
- Manages networking between containers automatically
- Handles health checks and startup order
- Easier to manage environment variables
- Single command to start/stop everything

## Files to Add to Your Repository

### Essential Docker Files (4 files)

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds the Web UI container (multi-stage: Node.js build → Nginx serve) |
| `docker-compose.yml` | Orchestrates backend + frontend services |
| `nginx.conf` | Nginx config with SPA routing + API reverse proxy |
| `.dockerignore` | Excludes unnecessary files from Docker build |

### Source Code Files (entire `src/` directory)

All React components, hooks, and pages that make up the Web UI.

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and build scripts |
| `package-lock.json` | Locked dependency versions |
| `index.html` | Entry HTML file |
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `tsconfig.app.json` | TypeScript app config |
| `tsconfig.node.json` | TypeScript Node config |
| `components.json` | shadcn/ui configuration |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Setup instructions and documentation |

### Files to NOT Commit

These should be in `.gitignore`:
- `node_modules/` - Dependencies (installed during build)
- `dist/` - Build output
- `.env` - Contains secrets (HF_TOKEN)
- `hf_cache/` - Hugging Face model cache
- `voices/` - User voice files (optional)

---

## Step-by-Step: Creating a Pull Request

### Step 1: Clone Your Repository Locally

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Step 2: Create a New Branch

```bash
git checkout -b feature/add-webui
```

### Step 3: Copy/Add the Required Files

Create the following directory structure:

```text
your-repo/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/           (all shadcn components)
│   │   ├── AudioPlayer.tsx
│   │   ├── EmotionControls.tsx
│   │   ├── NavLink.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── TextInput.tsx
│   │   ├── VoiceSelector.tsx
│   │   └── WaveformVisualizer.tsx
│   ├── hooks/
│   │   ├── useChatterbox.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .dockerignore
├── .gitignore
├── components.json
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── index.html
├── nginx.conf
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Step 4: Update .gitignore

Make sure your `.gitignore` includes:

```text
# Dependencies
node_modules/

# Build output
dist/
dist-ssr/

# Environment files (contains secrets!)
.env
.env.*

# Docker volumes (created at runtime)
hf_cache/
voices/

# Logs
*.log
npm-debug.log*

# Editor
.vscode/
.idea/
.DS_Store
*.local
```

### Step 5: Stage and Commit Your Changes

```bash
# Add all files
git add .

# Review what will be committed
git status

# Commit with a descriptive message
git commit -m "feat: Add Chatterbox TTS Web UI with Docker deployment

- Add React/TypeScript frontend with shadcn/ui components
- Add Docker Compose setup for backend + frontend orchestration
- Add Nginx reverse proxy configuration for API routing
- Add voice cloning and emotion control features
- Add comprehensive README with setup instructions"
```

### Step 6: Push to GitHub

```bash
git push origin feature/add-webui
```

### Step 7: Create Pull Request on GitHub

1. Go to your repository on GitHub
2. You'll see a banner: "feature/add-webui had recent pushes" → Click **"Compare & pull request"**
3. Or go to **Pull requests** → **New pull request**
4. Set:
   - **Base:** `main` (or your default branch)
   - **Compare:** `feature/add-webui`
5. Add a title: `Add Chatterbox TTS Web UI`
6. Add description explaining the changes
7. Click **"Create pull request"**

### Step 8: Merge the Pull Request

After review:
1. Click **"Merge pull request"**
2. Click **"Confirm merge"**
3. Optionally delete the feature branch

---

## After Merging: Running the Application

On your deployment machine (e.g., DGX Spark):

```bash
# Clone the updated repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Create required directories
mkdir -p hf_cache voices

# Create environment file with your HF token
echo "HF_TOKEN=hf_your_token_here" > .env

# Build and start (make sure chatterbox-tts image is built first)
docker compose up --build
```

Access at: `http://localhost:3000`

---

## Technical Details

### How the Services Connect

```text
┌─────────────────┐     ┌─────────────────────┐
│   Web Browser   │────▶│  webui (port 3000)  │
│                 │     │  - Serves React app │
└─────────────────┘     │  - Nginx proxy      │
                        └──────────┬──────────┘
                                   │ /api/* → proxied to backend
                                   ▼
                        ┌─────────────────────┐
                        │  chatterbox         │
                        │  (port 10050)       │
                        │  - TTS API          │
                        │  - Voice cloning    │
                        └─────────────────────┘
```

### Key API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Connection health check |
| `/voices` | GET | List available voices |
| `/voices/upload` | POST | Upload new voice reference |
| `/tts` | POST | Generate speech (with saved voice) |
| `/tts/with-audio` | POST | Generate speech (inline voice) |

