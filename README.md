# 🚀 Touchless Gesture-Based UI System

A next-generation **touchless interaction system** powered by real-time hand gesture recognition using MediaPipe.

Control a complete UI without touching anything — just use your hand.

---

## 🧠 Overview

This project replaces traditional mouse interaction with **AI-powered hand tracking**, enabling users to interact with a UI using gestures like pinch, point, and swipe.

It includes a **virtual cursor**, **gesture engine**, and a **hospital-style dashboard** designed for sterile, hands-free environments.

---

## ✨ Features

### 🎯 Real-Time Hand Tracking

- 21-point hand landmark detection using MediaPipe
- High-performance webcam pipeline
- Smooth tracking with jitter reduction

### 🤌 Gesture Recognition

- ✋ Open Palm → Reset / Back
- 🤏 Pinch → Click / Select
- 👉 Point → Cursor Control / Hover
- 👈👉 Swipe → Navigation

### 🖱️ Virtual Cursor

- Smooth 60 FPS cursor movement
- Gesture-controlled interactions
- Hover, click, and drag support

### 🏥 Hospital Dashboard

- Patient navigation system
- X-ray / scan viewer with zoom & pan
- Gesture-based UI controls

### 🎥 Persistent Camera HUD

- Live camera feed with hand skeleton overlay
- Always visible (floating panel)
- Real-time gesture and tracking status

### ⚡ Performance Optimized

- Decoupled detection (~25 FPS) and UI rendering (60 FPS)
- No React re-render bottlenecks
- GPU-accelerated animations

### 🛡️ Stability Features

- Tracking loss recovery
- Landmark smoothing & buffering
- Predictive cursor movement

---

## 🧱 Tech Stack

- **React.js**
- **MediaPipe (Hand Landmarker)**
- **TypeScript**
- **Canvas API**
- **Framer Motion / CSS Animations**

---

## ⚙️ How It Works

```txt
Camera Feed
→ MediaPipe Detection
→ Landmark Processing
→ Gesture Recognition
→ Virtual Cursor
→ UI Interaction
```
