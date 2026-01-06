# Apex-Chest-Clinic

# 🩺 Dr. Gaurav's Appointment Dashboard

A streamlined, web-based appointment management system designed for medical professionals. This dashboard allows for real-time tracking of patient status, automated time-slot scheduling, and local data persistence.

## 🚀 Features

* **15-Minute Slot Logic:** Automatically generates appointment slots starting from **8:00 AM** in 15-minute increments.
* **Status Management:** Track patients through the workflow: `Pending` ➔ `Visited` ➔ `Completed`.
* **Auto-Cleanup:** Integrated script to clear out finished appointments, keeping the dashboard focused only on pending patients.
* **LocalStorage Persistence:** Ensures data remains available even after page refreshes without needing a complex backend.
* **Responsive UI:** Optimized for quick viewing on both desktop and tablet during clinic hours.

## 🛠️ Technical Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Data Storage:** Browser `localStorage` (with optional Firebase integration)
* **Icons:** FontAwesome / Material Icons

## 📂 Project Structure

```text
├── index.html          # Main dashboard view
├── css/
│   └── style.css       # Custom styling & layout
└── js/
    ├── app.js          # Core logic (Time slots & CRUD)
    └── storage.js      # LocalStorage cleanup & management
