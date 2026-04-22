# Smart Crime Record Management System (CRMS)
## Integrated with AI Predictive Intelligence

### 🚀 Overview
The **Smart Crime Record Management System (CRMS)** is a state-of-the-art MERN-stack application designed for modern law enforcement agencies. It streamlines the lifecycle of a First Information Report (FIR)—from registration to investigation—while leveraging **AI Crime Analysis** to identify criminal patterns and assist investigators in reconstructing crime scenarios.

---

### 🛠 Technology Stack
- **Frontend**: React.js with Vite, Tailwind CSS, Lucide React (Icons), and Chart.js.
- **Backend**: Node.js & Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Documentation**: PDFKit & HTML2PDF for professional FIR document generation.
- **Security**: JWT (JSON Web Tokens) for authentication and role-based access control (RBAC).

---

### 🧠 Core Feature: AI CRIME ANALYSIS
The hallmark of this system is the **AI Crime Analysis** engine, which replaces traditional static maps with dynamic, pattern-based intelligence.

#### 1. Automated Pattern Matching
Upon FIR registration, the system automatically cross-references the new case with historical data based on:
- **Crime Type Consistency**: Grouping similar offenses (Theft, Robbery, etc.).
- **Jurisdictional Clues**: Matching district and localized vicinity.
- **Narrative Similarity**: Using Natural Language Processing (NLP) to detect similarities in crime descriptions.

#### 2. Intelligence Insights Generated:
- **Pattern Insight**: Explains how similar crimes usually occur (e.g., "Occurs in low-traffic areas with limited surveillance").
- **Execution Method**: Reconstructs the suspect's likely methodology (e.g., "Entry via forced window access using silent tools").
- **Predicted Timeline**: Analyzes temporal clusters to predict the likely time range of future similar incidents (e.g., "8PM - 11PM").
- **Risk Level**: Dynamically calculates risk (Low, Medium, High) based on incident frequency in the specific sector.
- **Investigation Hints**: Provides strategic tips for officers, such as which CCTV cameras to check or escape routes to monitor.

---

### 🖥 User Interface & Experience
The application features a **Premium Dark-Mode Aesthetic** using Glassmorphism to ensure a modern, command-center feel.

- **Admin Command Centre**: Global overview of all FIRs, officer deployment stats, and high-level AI risk assessments.
- **Officer Operations Hub**: Personalized dashboard for inspectors to manage their assigned cases and view localized sector intelligence.
- **Animated Analysis Flow**: During FIR registration, investigators see a real-time "Scanning & Analyzing" animation, providing immediate feedback on AI processing.
- **Professional FIR Reports**: One-click generation of официальные (official) PDF reports with watermarks and case metadata.

---

### 📂 Project Structure
```text
Crime/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI Components (Sidebar, Navbar, Layout)
│   │   ├── pages/          # Main Views (Dashboard, Register, Analytics)
│   │   └── services/       # API integration
├── server/                 # Node.js Backend
│   ├── controllers/        # Business logic (FIR, Analysis, Auth)
│   ├── models/             # MongoDB Schemas
│   ├── routes/             # API Endpoints
│   └── middleware/         # Auth & Safety checks
└── .gitignore              # Dependency & Environment exclusion
```

---

### 🚦 Getting Started

1. **Prerequisites**: Ensure you have Node.js and MongoDB installed.
2. **Backend Setup**:
   ```bash
   cd server
   npm install
   npm run dev  # Starts on port 5000
   ```
3. **Frontend Setup**:
   ```bash
   cd client
   npm install
   npm run dev  # Starts on port 5173
   ```
4. **Access**: Navigate to `http://localhost:5173` to access the command center.

---

### ⚖️ Legal & Ethical Note
The AI Crime Analysis provided by this system is intended as an **investigative aid**. It predicts patterns and methodologies based on historical data but **does not identify specific individuals** or replace the human judgment of professional law enforcement officers.
