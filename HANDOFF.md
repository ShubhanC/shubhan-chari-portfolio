# Handoff Document: Portfolio Website Development

## Purpose

This document provides all context needed to continue or complete development of the portfolio-ds-ml website. It can be handed to any AI agent or developer.

## Repository Overview

```
portfolio-ds-ml/
├── portfolio/                    # ✅ COMPLETE — Portfolio website
│   ├── index.html                # Single-page HTML with hero + grid
│   ├── style.css                 # Dark-themed responsive CSS
│   ├── script.js                 # JSON-driven project renderer
│   └── portfolio.json            # 15 projects, 3 complete, 12 planned
│
├── brain-tumor-app/              # ✅ COMPLETE — Streamlit app
│   ├── app.py                    # Full Streamlit app with inference + Grad-CAM
│   └── requirements.txt          # Dependencies
│
├── ML/Brain Tumor/               # Source data/model (read-only reference)
│   ├── notebooks/resnet.ipynb    # Training code (model arch, transforms)
│   ├── model/tumor_detection.pth # Local weights (may be stale)
│   ├── data/test_jpg/            # 15 test MRI images
│   ├── README.md                 # Medical disclaimer, dataset info
│   └── brain_tumor_metadata.csv  # Filename ↔ label mappings
│
├── Basic/Fake News Detector/     # External project (linked)
├── Basic/Parkinsons/             # External project (linked)
├── .env                          # HF_TOKEN (DO NOT COMMIT)
├── pixi.toml                     # Workspace config (Python 3.12)
└── README.md                     # Root project table
```

## What's Already Done

### 1. Portfolio Website (`portfolio/`)
- **Fully implemented** — single-page dark-themed site with:
  - Dynamic hero section (name, bio, social links rendered from JSON)
  - 15 projects organized into 5 categories
  - Filter bar (All / Complete / Planned)
  - Project cards with status badges, tags, action buttons
  - Responsive grid layout
  - Hover effects, transitions
- **To add a new project:** Just add an object to `portfolio/portfolio.json` in the `projects` array. The site auto-renders it.

### 2. Brain Tumor Classifier (`brain-tumor-app/`)
- **Fully implemented** — Streamlit app with:
  - Model loaded from HuggingFace Hub (`schari/brain_tumor_classifier`)
  - File uploader for MRI images (JPG/PNG)
  - Inference with confidence scores
  - Per-class bar chart visualization
  - Grad-CAM overlay (optional, graceful degradation)
  - Medical disclaimer (always visible)
  - Example images from test_jpg/
  - Spinner during inference
- **To deploy:** Push to HuggingFace Spaces (SDK=Streamlit, Hardware=CPU free tier)

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
- 0 = Meningioma (🟡)
- 1 = Glioma (🔴)
- 2 = Pituitary Tumor (🟢)

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
The local `tumor_detection.pth` was last overwritten by ResNet152 training in the notebook. **Always load from HuggingFace Hub**, not the local file. The app handles this gracefully.

## Deployment Instructions

### Portfolio Site (Vercel)
1. Push to GitHub
2. Go to vercel.com → New Project → Import `portfolio-ds-ml`
3. Root Directory: `portfolio`
4. Deploy

### Brain Tumor App (HuggingFace Spaces)
1. Create new Space at huggingface.co/new-space
2. SDK: Streamlit
3. Hardware: CPU (free)
4. Upload `brain-tumor-app/app.py` and `brain-tumor-app/requirements.txt`
5. Go to Settings → Secrets → Add `HF_TOKEN` with value from `.env`
6. Deploy

## Files Created in This Session

| File | Lines | Purpose |
|------|-------|---------|
| `portfolio/index.html` | 49 | Single-page HTML structure |
| `portfolio/style.css` | 409 | Dark theme, responsive grid, card styles |
| `portfolio/script.js` | 206 | JSON loader, card renderer, filters |
| `portfolio/portfolio.json` | 201 | 15 projects, 3 complete, 12 planned |
| `brain-tumor-app/app.py` | 295 | Streamlit app with inference + Grad-CAM |
| `brain-tumor-app/requirements.txt` | 8 | Python dependencies |

## Next Steps (Future Work)

1. **Add more projects** to `portfolio.json` as they're completed
2. **Deploy both apps** (instructions above)
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

# Test brain tumor app
cd brain-tumor-app && streamlit run app.py
# Visit http://localhost:8501

# Syntax checks
python3 -c "import py_compile; py_compile.compile('brain-tumor-app/app.py', doraise=True)"
python3 -c "import json; json.load(open('portfolio/portfolio.json'))"
```
