# 🚀 Touchless Gesture-Based UI System

A next-generation **touchless interaction system** powered by real-time hand gesture recognition using MediaPipe.

Control a complete UI without touching anything — just use your hand.

---

## 🧠 Overview

This project replaces traditional mouse interaction with **AI-powered hand tracking**, enabling users to interact with a UI using gestures like pinch, point, and swipe.

It includes a **virtual cursor**, **gesture engine**, and a **hospital-style dashboard** designed for sterile, hands-free environments.

---

## 📖 VitalStream Operating Guide

Follow these instructions to navigate and analyze patient data in a sterile, touchless environment.

### 1. The Interaction Paradigm
*   **Precision Cursor**: Point your index finger at the screen. The "Glass Cursor" will follow your movement with sub-pixel precision.
*   **Atomic Interaction**: The system uses a unified state engine for zoom and pan, ensuring zero-jitter performance.

### 2. Core Gestures
| Movement | Hand Action | Result |
| :--- | :--- | :--- |
| **Hover** | ☝️ Point Index Finger | Move the cursor & highlight UI elements |
| **Click** | 🤏 Quick Pinch (Thumb + Index) | Trigger Buttons (Next, Prev, Analysis) |
| **Analysis Mode** | 🤏 Hold Pinch | Activate Zoom & Pan on Diagnostic Images |
| **Reset View** | ✋ Open Palm | Reset image scale and position to center |

### 3. Diagnostic Image Analysis
Interaction with the patient imagery is restricted to the **Diagnostic Viewer** area to prevent accidental UI triggers.

*   **To Zoom**: 
    1. Hover over the central image.
    2. **Pinch fingers together**: Increasing/decreasing the gap between your thumb and index finger will dynamically scale the image relative to your cursor position (**Focal Point Zooming**).
    3. The cursor will glow **Blue** to indicate Analysis Mode is active.
*   **To Pan**:
    1. While pinching, move your hand across the screen.
    2. The image will follow your hand movement in real-time.
*   **To Reset**: Raise an open palm to the camera to quickly snap the image back to its original orientation.

### 4. Navigation
Use the **Prev** and **Next** buttons at the bottom of the left sidebar.
1. Hover over the button until it highlights.
2. Perform a **quick pinch** gesture to switch patients.

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
