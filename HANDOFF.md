# Handoff Document: Portfolio Website Development

## Purpose

This document provides all context needed to continue or complete development of the portfolio-ds-ml website. It can be handed to any AI agent or developer.

## Repository Overview

```
portfolio-ds-ml/
├── portfolio/                    # Portfolio website + apps
│   ├── index.html                # Single-page HTML with hero + grid + iframe overlay
│   ├── style.css                 # Dark-themed responsive CSS + overlay styles
│   ├── script.js                 # JSON-driven project renderer + iframe handler
│   ├── portfolio.json            # 15 projects, 3 complete, 12 planned
│   │
│   └── brain-tumor-app/          # Streamlit app (embedded via iframe)
│       ├── app.py                # Full Streamlit app with inference + Grad-CAM
│       ├── requirements.txt      # Dependencies
│       └── .streamlit/config.toml # Dark theme config matching portfolio
│
├── ML/Brain Tumor/               # Source data/model (read-only reference)
│   ├── notebooks/resnet.ipynb    # Training code (model arch, transforms)
│   ├── model/tumor_detection.pth # Local weights (may be stale)
│   ├── data/test_jpg/            # 15 test MRI images (5 per class)
│   ├── README.md                 # Medical disclaimer, dataset info
│   └── brain_tumor_metadata.csv  # Filename ↔ label mappings
│
├── Basic/Fake News Detector/     # External project (linked)
├── Basic/Parkinsons/             # External project (linked)
├── .env                          # HF_TOKEN (DO NOT COMMIT)
├── pixi.toml                     # Workspace config (Python 3.12)
├── HANDOFF.md                    # You are here
└── README.md                     # Root project table
```

## What's Already Done

### 1. Portfolio Website (`portfolio/`)
- **Fully implemented** — single-page dark-themed site with:
  - Dynamic hero section (name, bio, social links rendered from JSON)
  - 15 projects organized into 5 categories
  - Filter bar (All / Complete / Planned)
  - Project cards with status badges, tags, action buttons
  - Responsive grid layout, hover effects, transitions
- **Iframe embedding**: Projects with `type: "iframe"` open in a fullscreen overlay with close button instead of navigating away
- **To add a new project:** Just add an object to `portfolio/portfolio.json` in the `projects` array. The site auto-renders it.

### 2. Brain Tumor Classifier (`portfolio/brain-tumor-app/`)
- **Fully implemented** — Streamlit app with:
  - Model loaded from HuggingFace Hub (`schari/brain_tumor_classifier`)
  - Lazy model loading — model only downloads when first image is uploaded (not on page load)
  - File uploader for MRI images (JPG/PNG)
  - Inference with confidence scores + progress bar
  - Per-class bar chart visualization (colors from DataFrame column, not raw list — avoids StreamlitColorLengthError)
  - Grad-CAM overlay (optional, graceful degradation if grad-cam not installed)
  - Medical disclaimer (always visible)
  - Example images from test_jpg/ (auto-discovers per-class examples from metadata)
  - Dark theme matching portfolio (`config.toml`)
  - Spinner during inference

### 3. Graphify Knowledge Graph
- **Built and saved** in `graphify-out/`
- 69 nodes, 71 edges, 14 communities
- Includes `graph.html` (interactive), `graph.json` (raw data), `GRAPH_REPORT.md`

## Brain Tumor App — Technical Details

### Model Architecture (from `ML/Brain Tumor/notebooks/resnet.ipynb`)
```python
model = models.resnet50(weights=None)
model.fc = nn.Sequential(
    nn.Linear(2048, 512),
    nn.ReLU(inplace=True),
    nn.Dropout(0.5),
    nn.Linear(512, 3),
)
```

### Label Mapping
- 0 = Meningioma (🟡 #fbbf24)
- 1 = Glioma (🔴 #f87171)
- 2 = Pituitary Tumor (🟢 #34d399)

### Preprocessing
```python
transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])
```

### HuggingFace Model
- Repo: `schari/brain_tumor_classifier`
- File: `tumor_detection.pth`
- Token: `HF_TOKEN` (from `.env` or environment variable)

### ⚠️ Known Issue
The local `tumor_detection.pth` was last overwritten by ResNet152 training in the notebook. **Always load from HuggingFace Hub**, not the local file. The app handles this gracefully — it tries HF Hub first, falls back to local.

### Path Resolution
The app uses `ROOT_DIR = os.path.join(os.path.dirname(__file__), "..", "..")` which resolves to the repo root (e.g. `/Users/shubhan/portfolio-ds-ml`). All references to data files (`ML/Brain Tumor/...`) use this base path.

## Deployment Instructions

### Portfolio Site (Vercel)
1. Push to GitHub
2. Go to vercel.com → New Project → Import `portfolio-ds-ml`
3. Root Directory: `portfolio`
4. Build Command: (none — static site)
5. Deploy
6. URL: `https://portfolio-ds-ml.vercel.app/`

### Brain Tumor App (Streamlit Community Cloud)
1. Push the repo to GitHub (already done)
2. Go to https://share.streamlit.io
3. Sign in with GitHub
4. Click **"New app"**
5. Select repo: `ShubhanC/portfolio-ds-ml`
6. Branch: `main`
7. Main file path: `portfolio/brain-tumor-app/app.py`
8. Click **"Deploy"**
9. Once deployed, go to **Settings → Secrets** and add:
   - Key: `HF_TOKEN`
   - Value: (the token from `.env`)
10. Copy the app URL (e.g. `https://portfolio-ds-ml-brain-tumor-classifier.streamlit.app/`)

### After Deployment
Update `portfolio/portfolio.json` — change the brain tumor classifier's `url` from `http://localhost:8501` to the deployed Streamlit Cloud URL:

```json
{
  "id": "brain-tumor-classifier",
  "type": "iframe",
  "url": "https://portfolio-ds-ml-brain-tumor-classifier.streamlit.app/"
}
```

Then commit and push. The portfolio will now open the live app in the iframe overlay.

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `portfolio/index.html` | 57 | Single-page HTML + iframe overlay |
| `portfolio/style.css` | 430 | Dark theme, grid, overlay styles |
| `portfolio/script.js` | 250 | JSON loader, card renderer, filters, iframe handler |
| `portfolio/portfolio.json` | 201 | 15 projects, 3 complete, 12 planned |
| `portfolio/brain-tumor-app/app.py` | 330 | Streamlit app with lazy model loading |
| `portfolio/brain-tumor-app/requirements.txt` | 8 | Python dependencies |
| `portfolio/brain-tumor-app/.streamlit/config.toml` | 13 | Dark theme matching portfolio |

## Next Steps (Future Work)

1. **Deploy both apps** (instructions above)
2. **Add more projects** to `portfolio.json` as they're completed
3. **Add images** to portfolio cards (set `image` field in JSON)
4. **Add LinkedIn/Twitter** links to profile in `portfolio.json`
5. **Dark mode toggle** — CSS custom properties ready
6. **Contact form** — serverless function via Vercel
7. **Blog section** — Markdown-driven posts
8. **iPhone home screen layout** — drag-and-drop grid (future vision)

## Testing Commands

```bash
# Test portfolio locally
cd portfolio && python3 -m http.server 8000
# Visit http://localhost:8000

# Test brain tumor app (in another terminal)
cd portfolio/brain-tumor-app && streamlit run app.py
# Visit http://localhost:8501

# Syntax checks
python3 -c "import py_compile; py_compile.compile('portfolio/brain-tumor-app/app.py', doraise=True)"
python3 -c "import json; json.load(open('portfolio/portfolio.json'))"

# Test both together: open portfolio at localhost:8000,
# click "Launch" on Brain Tumor Classifier card →
# it loads localhost:8501 in the iframe overlay
```
