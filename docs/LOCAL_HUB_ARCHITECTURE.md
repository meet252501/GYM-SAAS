# GymFlow Pro: Local Hub Architecture Report

This report outlines the strategy for running GymFlow Pro as a **Local-First, Self-Hosted SaaS** where the Admin Desktop acts as the master server and data remains on a single physical device.

---

## 🏛️ 1. The Architecture: "The Gym Hub"

In this model, the **Admin Desktop** replaces the Cloud.

*   **Server**: Node.js runs directly on the Admin PC.
*   **Database**: MongoDB (or SQLite) is installed locally on the Admin PC.
*   **Clients**: Members' phones and other staff devices connect to this PC.

### Connectivity Flow:
1.  **Local (No Internet)**: Devices on the same Gym WiFi connect to the Admin PC's local IP (e.g., `192.168.1.5:5000`).
2.  **Remote (With Tunnel)**: Use a **Cloudflare Tunnel** (Free) to give the local PC a public URL (e.g., `mumbai-gym.gymflow.pro`). Members can log workouts from home, but the data is sent directly to the PC in the gym.

---

## 🛠️ 2. How to Set It Up (Step-by-Step)

### A. Server Setup on Admin PC
1.  Install **Node.js** and **MongoDB Community Edition**.
2.  Clone the `server` folder to the desktop.
3.  Set the `.env` to `MONGODB_URI=mongodb://localhost:27017/gymflow`.
4.  Run the server using **PM2** (a tool that keeps the server running even if the PC restarts).

### B. Making it Public (The Free Way)
To let members use the app without you paying for hosting:
1.  Install **Cloudflared** on the Admin PC.
2.  Run: `cloudflared tunnel --url http://localhost:5000`.
3.  Cloudflare will give you a **Free URL**. 
4.  Point your PWA frontend to this URL.

---

## 📊 3. Pros & Cons of "Local-Only"

| Feature | Local Hub (Desktop) | Cloud (Supabase/Railway) |
| :--- | :--- | :--- |
| **Cost** | **₹0 / Month** (Almost Free) | ₹500+ / Month |
| **Privacy** | 100% (Data stays in the gym) | Data is on a 3rd party server |
| **Speed** | **Instant** on Gym WiFi | Depends on Internet speed |
| **Reliability** | PC must stay ON 24/7 | 99.9% Uptime guaranteed |
| **Risk** | If the PC hard drive breaks, data is lost. | Cloud handles backups automatically. |

---

## 🛡️ 4. The "Safety" Plan (Mandatory)

Since you are not using the cloud, you **MUST** have a backup plan:
1.  **Auto-Backup**: Create a script that copies the MongoDB database to a USB Drive or Google Drive every night at 12:00 AM.
2.  **UPS**: The Admin PC should be on a **Power Backup (UPS)** so a power cut doesn't corrupt the database.

---

## ✅ Summary for your Client
*"Your data never leaves your building. Your members connect to your desktop. It is fast, secure, and costs you zero in hosting fees."*

**Would you like me to help you write the Local Backup script for the Admin PC?**
