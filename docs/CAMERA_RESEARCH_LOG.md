# Camera & AI Vision Research Log (Tomorrow's Deep-Dive)

## Current Status
- **UI**: The `LiveCamera` component in `FuelHQ.jsx` is successfully capturing video streams and displaying the "Neural Scan" overlay.
- **Issue**: Captured images are returning a **"Gemini Vision 404"** error in the Nutrition Intel panel.
- **Suspected Root Causes**:
    1. Base64 encoding/formatting of the captured frame.
    2. Backend endpoint connectivity (port 5000) for AI analysis.
    3. Payload size limits or API key validation in the `useGymAI` hook.

## Technical Details for Tomorrow

### 1. Capture Logic (`FuelHQ.jsx`)
- **Method**: `handleCapture` draws the current video frame onto a hidden canvas.
- **Output**: `canvas.toDataURL('image/jpeg', 0.8)` produces a base64 string.
- **Flow**: Base64 is passed to `analyzeFood(image)`, which triggers the `useGymAI` hook.

### 2. AI Integration (`useGymAI.js`)
- **Backend Service**: Communicates with the Node.js server.
- **Prompting**: Uses a specific prompt for Gemini Vision to extract nutritional data.
- **Parsing**: Expects a JSON response with calories, macros, and food identification.

### 3. Research Objectives
- [ ] **Data Validation**: Log the exact base64 string being sent to the backend.
- [ ] **Network Audit**: Check browser console for specific HTTP status codes (e.g., is it a real 404 URL error or a logical "data not found" error?).
- [ ] **Backend Debugging**: Verify if the `ai.controller.js` is correctly receiving the image buffer.
- [ ] **Image Quality**: Ensure the canvas drawing is not producing blank or corrupted images.

## Recommended Fix Strategy
- Implement a **Fallback/Mock Mode** for AI analysis if the external API is unreachable.
- Add **Detailed Error Messaging** instead of the generic "404".
- Verify **CORS settings** for high-resolution image uploads.

---
**Date**: 2026-05-11
**Objective**: Restore end-to-end "Visual Food Scanning" functionality.
