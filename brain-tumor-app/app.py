"""
Brain Tumor Classifier — Streamlit App
=======================================
Classifies MRI brain scans into Glioma, Meningioma, or Pituitary tumor.
Uses a fine-tuned ResNet50 loaded from HuggingFace Hub.
"""

import os
import sys
from io import BytesIO

import numpy as np
import streamlit as st
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

# ── Attempt optional Grad-CAM import ────────────────────────────────────────
GRADCAM_AVAILABLE = False
try:
    from pytorch_grad_cam import GradCAM
    from pytorch_grad_cam.utils.image import show_cam_on_image
    import matplotlib.pyplot as plt

    GRADCAM_AVAILABLE = True
except ImportError:
    pass

# ── Configuration ────────────────────────────────────────────────────────────
HF_REPO = "schari/brain_tumor_classifier"
HF_FILENAME = "tumor_detection.pth"
HF_TOKEN = os.environ.get("HF_TOKEN", "")

CLASS_NAMES = ["Meningioma", "Glioma", "Pituitary Tumor"]
CLASS_EMOJIS = ["🟡", "🔴", "🟢"]
CLASS_COLORS = ["#fbbf24", "#f87171", "#34d399"]

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

IMG_SIZE = (224, 224)

# ── Preprocessing transform ─────────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# ── Model architecture ──────────────────────────────────────────────────────
def build_model() -> nn.Module:
    """Build a ResNet50 with the same custom head used during training."""
    model = models.resnet50(weights=None)
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(0.5),
        nn.Linear(512, 3),
    )
    return model


@st.cache_resource(show_spinner="Loading brain tumor model from HuggingFace Hub...")
def load_model() -> nn.Module:
    """Download weights from HF Hub and return the model in eval mode."""
    try:
        from huggingface_hub import hf_hub_download

        model_path = hf_hub_download(
            repo_id=HF_REPO,
            filename=HF_FILENAME,
            token=HF_TOKEN or None,
        )
        st.sidebar.info(f"Model loaded from HuggingFace Hub: `{HF_REPO}`")
    except Exception as e:
        # Fallback: look for local model file
        local_path = os.path.join(
            os.path.dirname(__file__), "..", "ML", "Brain Tumor", "model", HF_FILENAME
        )
        if os.path.exists(local_path):
            model_path = local_path
            st.sidebar.warning("HF Hub download failed. Using local model weights.")
        else:
            st.error(f"Could not load model from HuggingFace ({e}) and no local copy found.")
            st.stop()

    model = build_model()
    state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()
    return model


# ── Inference ───────────────────────────────────────────────────────────────
def predict(image: Image.Image):
    """Run inference and return class index, probabilities, and the input tensor."""
    img_tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(img_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0)

    pred_idx = int(probs.argmax().item())
    return pred_idx, probs.cpu().numpy(), img_tensor


# ── Grad-CAM ────────────────────────────────────────────────────────────────
def compute_gradcam(img_tensor: torch.Tensor, target_idx: int):
    """Compute a Grad-CAM heatmap for the predicted class."""
    if not GRADCAM_AVAILABLE:
        return None
    try:
        target_layers = [model.layer4[-1]]
        cam = GradCAM(model=model, target_layers=target_layers)

        grayscale_cam = cam(input_tensor=img_tensor, targets=None)[0]

        # Input image in [0,1] for blending
        img_display = img_tensor[0].cpu().permute(1, 2, 0).numpy()
        # Denormalize
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        img_display = np.clip((img_display * std + mean), 0, 1)

        vis = show_cam_on_image(img_display, grayscale_cam, use_rgb=True)
        return vis
    except Exception:
        return None


# ── Streamlit UI ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Brain Tumor Classifier",
    page_icon="🧠",
    layout="centered",
)

# Title
st.title("🧠 Brain Tumor Classifier")
st.caption(
    "Classify brain MRI scans into **Glioma**, **Meningioma**, or **Pituitary Tumor** "
    "using a fine-tuned ResNet50 deep learning model."
)

# ⚠️ Medical Disclaimer
st.warning(
    "**⚠️ Medical Disclaimer:** This tool is for **educational and research purposes only**. "
    "It is not a substitute for professional medical diagnosis. "
    "Always consult a qualified radiologist or medical professional for clinical decisions.",
    icon="⚠️",
)

# ── Sidebar ──
model = load_model()
model_name = f"ResNet50 (fine-tuned)"
st.sidebar.markdown(f"**Model:** {model_name}")
st.sidebar.markdown(f"**Device:** {DEVICE}")
st.sidebar.markdown(f"**Classes:** {len(CLASS_NAMES)} — {', '.join(CLASS_NAMES)}")
st.sidebar.markdown(f"**Accuracy:** ~95.9% (validation)")
st.sidebar.markdown("---")

# ── How it works ──
with st.expander("ℹ️ How it works"):
    st.markdown("""
    This app uses a **ResNet50** convolutional neural network fine-tuned via transfer learning
    on the **Jun Cheng Figshare brain tumor dataset** (3,064 T1-weighted CE-MRI images from 233 patients).

    **Three classes:**
    - 🔴 **Glioma** (1,426 images) — arises from glial cells; most common & aggressive
    - 🟡 **Meningioma** (708 images) — grows on membranes surrounding the brain; often benign
    - 🟢 **Pituitary Tumor** (930 images) — forms on the pituitary gland; usually slow-growing

    **How prediction works:**
    1. Your uploaded MRI is resized to 224×224 and normalized
    2. The ResNet50 backbone extracts visual features
    3. A custom classifier head outputs a probability for each class
    4. The class with the highest confidence is shown as the prediction

    > **Accuracy:** ~95.9% validation accuracy (macro-F1: 0.937)
    """)

# ── Example images ──
with st.expander("📸 Example images (from test set)"):
    st.markdown("These are sample test images from the dataset. Try uploading one!")
    example_dir = os.path.join(
        os.path.dirname(__file__), "..", "ML", "Brain Tumor", "data", "test_jpg"
    )
    # Find available examples per class from test_jpg (labels from metadata CSV)
    import csv

    examples = {}
    if os.path.isdir(example_dir):
        meta_path = os.path.join(
            os.path.dirname(__file__), "..", "ML", "Brain Tumor", "brain_tumor_metadata.csv"
        )
        label_lookup = {}
        if os.path.exists(meta_path):
            try:
                with open(meta_path) as mf:
                    for row in csv.DictReader(mf):
                        label_lookup[row["filename"]] = int(row["label"])
            except Exception:
                pass
        for fname in os.listdir(example_dir):
            if fname.endswith(".jpg") and fname in label_lookup:
                key = CLASS_NAMES[label_lookup[fname]]
                if key not in examples:
                    examples[key] = fname

    if examples:
        cols = st.columns(len(examples))
        for col, (name, fname) in zip(cols, examples.items()):
            emoji = CLASS_EMOJIS[CLASS_NAMES.index(name)]
            path = os.path.join(example_dir, fname)
            with col:
                if os.path.exists(path):
                    st.image(path, caption=f"{emoji} {name}", use_container_width=True)
                else:
                    st.warning(f"Image not found: {fname}")
    else:
        st.info("No labeled example images found in the test set.")

# ── File uploader ──
uploaded_file = st.file_uploader(
    "Upload a brain MRI scan",
    type=["jpg", "jpeg", "png"],
    help="Accepted formats: JPG, JPEG, PNG. Must be a T1-weighted CE-MRI brain scan.",
)

# ── Results ──
if uploaded_file is not None:
    try:
        image = Image.open(uploaded_file).convert("RGB")
    except Exception:
        st.error("Could not read the uploaded file. Please upload a valid image (JPG/PNG).")
        st.stop()

    # Show uploaded image
    st.subheader("📎 Uploaded MRI Scan")
    st.image(image, use_container_width=True)

    # Run inference
    with st.spinner("Analyzing MRI scan..."):
        pred_idx, probs, img_tensor = predict(image)

    # ── Display results ──
    st.subheader("📊 Results")

    pred_class = CLASS_NAMES[pred_idx]
    pred_emoji = CLASS_EMOJIS[pred_idx]
    pred_color = CLASS_COLORS[pred_idx]
    confidence = float(probs[pred_idx])

    # Prediction badge
    st.markdown(
        f"<div style='text-align:center;padding:16px;border-radius:12px;"
        f"background:{pred_color}20;border:2px solid {pred_color};margin:8px 0'>"
        f"<span style='font-size:2rem'>{pred_emoji}</span><br>"
        f"<span style='font-size:1.5rem;font-weight:700;color:{pred_color}'>"
        f"{pred_class}</span><br>"
        f"<span style='font-size:1rem;color:var(--text-muted)'>"
        f"Confidence: {confidence:.1%}</span>"
        f"</div>",
        unsafe_allow_html=True,
    )

    # Progress bar for confidence
    st.progress(confidence, text=f"Confidence: {confidence:.1%}")

    # Per-class bar chart
    st.markdown("**Per-class probabilities:**")
    chart_data = {
        "Class": CLASS_NAMES,
        "Probability": probs,
    }
    st.bar_chart(chart_data, x="Class", y="Probability", color=CLASS_COLORS)

    # Grad-CAM overlay
    if GRADCAM_AVAILABLE:
        with st.spinner("Generating Grad-CAM heatmap..."):
            cam_vis = compute_gradcam(img_tensor, pred_idx)
        if cam_vis is not None:
            with st.expander("🔥 Where the model is looking (Grad-CAM)"):
                st.image(cam_vis, caption=f"Grad-CAM heatmap for {pred_class}", use_container_width=True)
                st.caption(
                    "Grad-CAM highlights the regions of the input image that most influenced "
                    "the model's decision. Redder areas = higher influence."
                )

    # Show raw probabilities
    with st.expander("📋 Detailed probabilities"):
        for i, (name, prob) in enumerate(zip(CLASS_NAMES, probs)):
            st.markdown(
                f"{CLASS_EMOJIS[i]} **{name}**: {prob:.4f} ({prob:.2%})"
            )

    # Disclaimer reminder
    st.info(
        "⚠️ Remember: this is an educational tool. Please consult a medical "
        "professional for actual diagnosis."
    )

else:
    # Placeholder when no file uploaded
    st.info("👆 Upload a brain MRI scan above to get started.")
    col1, col2, col3 = st.columns(3)
    with col2:
        st.image(
            "https://img.icons8.com/fluency/96/upload-to-cloud.png",
            width=96,
        )
