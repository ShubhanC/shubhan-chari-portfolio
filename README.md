# Shubhan Chari — Portfolio

Welcome to my portfolio! I am a **Statistics and Computer Science** student at the **University of Illinois Urbana-Champaign (UIUC)**, with minors in **Data Science** and **Economics (Econometrics Track)**.

This repository serves as a centralized hub for my data science, machine learning, deep learning, software engineering, and research projects.

🌐 **[Visit the Live Portfolio Website](https://shubhanchari.vercel.app/)** — *A custom, interactive iOS/phone mockup interface designed and built with clean HTML, CSS, JavaScript, and squircle corner-smoothing.*

---

## 📱 About the Portfolio Site

The portfolio website is a unique, fully interactive web experience that simulates a mobile OS. Visitors can click/tap to unlock the device, browse "apps" representing different project categories (folders), open utility apps like Spotify and Camera, view a custom Notes and Contacts app, and access details of all my projects.

*   **Path**: `portfolio/`
*   **Tech Stack**: Vanilla HTML5, CSS3 (using custom properties and CSS Grid), Modern ES6+ JavaScript, `corner-smoothing` squircle observer, and Motion library for transitions.
*   **Data Source**: Driven dynamically by `portfolio/data/projects.json`.

---

## 🚀 Projects Overview

My projects are organized into folders reflecting their context (Personal, Research, Open Source, and Coursework).

### 🧠 Personal Projects

#### 1. [Brain Tumor Classifier](https://github.com/ShubhanC/brain-tumor-classifier)
*   **Description**: A ResNet50-based deep learning application that classifies brain tumor MRI scans into Glioma, Meningioma, or Pituitary tumors with **~95.9% accuracy**. Fine-tuned using PyTorch transfer learning and wrapped in an interactive user interface.
*   **Tech Stack**: PyTorch, ResNet50, Transfer Learning, OpenCV, Streamlit
*   **Links**: [Live App](https://sc-brain-tumor.streamlit.app/) | [GitHub Repo](https://github.com/ShubhanC/brain-tumor-classifier)

#### 2. [Fake News Detector](https://github.com/ShubhanC/Fake-News-Detector)
*   **Description**: An NLP-powered machine learning classifier trained to detect fake news articles and social media posts. The pipeline handles text normalization, feature extraction, and predictions.
*   **Tech Stack**: Python, NLP, Scikit-learn, Vercel
*   **Links**: [Live App](https://fake-news-detector-sc.vercel.app/) | [GitHub Repo](https://github.com/ShubhanC/Fake-News-Detector)

#### 3. [UIUC Study Spots](https://github.com/ShubhanC/uiuc-study-spots)
*   **Description**: An interactive mapping application designed for UIUC students to locate and filter ideal study spaces across campus based on statistical occupancy and features.
*   **Tech Stack**: Statistical Modeling, Leaflet/Mapping, Web Development
*   **Links**: [Live App](https://uiuc-study-spots.vercel.app/) | [GitHub Repo](https://github.com/ShubhanC/uiuc-study-spots)

#### 4. [Cooking Chatbot](https://github.com/groversomanshi/Cooking-Chatbot)
*   **Description**: An AI-powered recipe and pantry management assistant. Uses computer vision to identify ingredients in your pantry and suggests recipes dynamically.
*   **Tech Stack**: PyTorch, CLIP, NLP, OpenCV, PostgreSQL, SQL, Flask
*   **Links**: [Live App](https://cookingchatbot.vercel.app/) | [GitHub Repo](https://github.com/groversomanshi/Cooking-Chatbot)

#### 5. [Musichead](https://github.com/ShubhanC/Musichead)
*   **Description**: A software engineering project enabling users to discover new music based on target audio attributes (danceability, energy, acousticness) and compare musical characteristics of different tracks.
*   **Tech Stack**: React, Node.js, Spotify Web API, Audio Analysis
*   **Links**: [GitHub Repo](https://github.com/ShubhanC/Musichead) *(In Progress)*

#### 6. Discord Wiki
*   **Description**: Automatically aggregates, organizes, and summarizes chat histories from Discord server channels into structured, searchable wiki/summary pages.
*   **Tech Stack**: Python, NLP, Discord API

---

### 🔬 Research & Open Source

#### 1. [MFPRL - Mobility & Fall Prevention Research Lab](https://mfp.hk.illinois.edu/)
*   **Description**: Collaborating with UIUC's Mobility & Fall Prevention Research Lab to build a predictive model that identifies Parkinson's disease from wearable sensor/signal data. Developed the core preprocessing pipeline that translates raw high-frequency sensor files into clean, feature-engineered datasets for model training.
*   **Tech Stack**: Python, Signal Processing, Machine Learning, Data Science, Healthcare Informatics

#### 2. [FreeLLM API Throttler](https://github.com/ShubhanC/freellmapi)
*   **Description**: Contributed to open source by designing and implementing a request rate throttler. This resolved a critical issue where LLM-to-agent interactions hit RPM (requests per minute) rate limits too quickly, ensuring stable, paced communication.
*   **Tech Stack**: Node.js, React, API Integration

---

### 📚 Coursework & Competitions

#### 1. [Illinois Statistics Datathon 2026](https://github.com/ShubhanC/Datathon-2026-SNACs)
*   **Description**: Developed a high-accuracy, 2-tiered predictive forecasting model with XGBoost regressors and Historical Intraday Profiling to predict call center volumes for four portfolios. Achieved exceptional predictive performance (MAPE: 9.5% - 11.5% for volume, 1.9% - 2.6% for handling times).
*   **Tech Stack**: XGBoost, Regression, Time Series Forecasting, Data Science
*   **Links**: [GitHub Repo](https://github.com/ShubhanC/Datathon-2026-SNACs)

#### 2. [Illinois Statistics Datathon 2025](https://github.com/ShubhanC/datathon-2025-ISBS)
*   **Description**: Built a regression-based machine learning model to predict fourth-quarter consumer spending using three years of transactional history, leveraging the predictions to optimally determine consumer credit line increases.
*   **Tech Stack**: Regression Analysis, Predictive Modeling, Scikit-learn
*   **Links**: [GitHub Repo](https://github.com/ShubhanC/datathon-2025-ISBS)

#### 3. [Global Fertility Decline Analysis — IS 312](https://github.com/ShubhanC/income-vs-birthrate-is312)
*   **Description**: Conducted an econometric study of global fertility rates using World Bank and United Nations data. Used Panel Data methods (Fixed Effects, Between Effects), log-transformations, and Variance Inflation Factor (VIF) diagnostics to reveal highly significant macroeconomic drivers.
*   **Tech Stack**: Panel Data Analysis, Econometrics, Statistical Modeling, Data Visualization
*   **Links**: [GitHub Repo](https://github.com/ShubhanC/income-vs-birthrate-is312)

#### 4. [Parkinson's Disease Detection (XGBoost)](https://github.com/ShubhanC/portfolio-ds-ml/tree/main/Basic/Parkinsons)
*   **Description**: An optimized XGBoost gradient-boosting classifier to detect Parkinson's disease from acoustic/vocal features. Utilized GridSearch hyperparameter tuning on the UCI vocal measurement dataset with 22 feature dimensions.
*   **Tech Stack**: XGBoost, Scikit-learn, Hyperparameter Optimization, Healthcare ML
*   **Links**: [GitHub Repo](https://github.com/ShubhanC/portfolio-ds-ml/tree/main/Basic/Parkinsons)

---

## 🛠️ Skills & Technologies

*   **Languages**: Python, R, SQL, C++, HTML5/CSS3, JavaScript (ES6+), Node.js, Bash
*   **Machine Learning & Data Science**: PyTorch, TensorFlow/Keras, Scikit-learn, XGBoost, Regression Modeling, Time Series Forecasting, Panel Data/Econometric Analysis, Signal Processing, Natural Language Processing (NLP)
*   **Tools & Libraries**: Git, Streamlit, Flask, PostgreSQL, Leaflet, Motion, Canva, Webpack/Vite

---

## 📬 Contact & Connections

Feel free to reach out or explore my work through these channels:

*   **Email**: [shubhan.chari@gmail.com](mailto:shubhan.chari@gmail.com)
*   **LinkedIn**: [linkedin.com/in/shubhanchari](https://linkedin.com/in/shubhanchari)
*   **GitHub**: [github.com/ShubhanC](https://github.com/ShubhanC)

---
*Created and maintained by [Shubhan Chari](https://shubhanchari.vercel.app/).*
