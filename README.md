# GATE Real-Time Assessment Platform (GATESphere)

A production-grade, full-stack MERN web application for **GATE preparation and real-time CBT assessment**.

The platform allows administrators to ingest official previous-year GATE question paper PDFs (3–4 years), automatically parses, structures, and classifies questions by branch, subject, and topic, and dynamically generates exact **100-mark GATE assessments** strictly matching user-selected topics with **intelligent no-repeat tracking**.

---

## 🌟 Key Features

### 1. Dynamic 100-Mark Assessment Engine
- **Strict Topic Isolation**: If a user selects *Theory of Computation* + *General Aptitude*, unselected subjects (e.g. DBMS, Operating Systems, Computer Networks) will **never** appear in their test.
- **Exact Mark Balancing**: Assembles an exact 100-mark combination using constraint-based algorithms across 1-mark and 2-mark questions.
- **Multiple Assessment Modes**:
  - **Topic Test**: Practice granular topics.
  - **Subject Test**: Complete subject deep-dive.
  - **Full Length GATE Mock**: Standard 100-mark GATE blueprint (15M General Aptitude + 85M Engineering Mathematics & Core CS).
  - **Custom Test**: Configurable marks, difficulty, and question types.

### 2. No-Repeat Algorithm & Spaced Repetition
- Every question attempted is tracked per user in `UserQuestionHistory`.
- Subsequent test generation on the same topics prioritizes unseen questions (`Day 2 ≠ Day 1`).
- **Transparent Fallback**: If available unseen questions are insufficient to form a 100-mark test, the system informs the user and allows intelligent spaced-repetition reuse (flagging repeated questions with *Revision Practice* tags).

### 3. Official GATE Question Paper Ingestion Pipeline
- **PDF Parsing**: Ingests multi-page GATE question paper PDFs.
- **Question Structure Extraction**: Identifies Question Number, Question Text, Math equations, and Options (A, B, C, D).
- **Question Types**: Full support for **MCQ** (Multiple Choice), **MSQ** (Multiple Select), and **NAT** (Numerical Answer Type).
- **Deduplication Engine**: Uses normalized text hashing (SHA-256) and fuzzy similarity comparison (`string-similarity`) to prevent duplicate questions.
- **Automatic Classification & Verification**: Classifies into Branch → Subject → Topic taxonomy and queues questions for admin verification.

### 4. Real-Time Computer-Based Test (CBT) Interface
- **Official Palette Layout**: Color-coded palette indicating Answered (Green), Not Answered (Red), Marked for Review (Purple), Answered & Marked (Blue), and Not Visited (Gray).
- **Server-Controlled Timer**: Timer countdown is synchronized with the server's `expiresAt` timestamp to prevent client-side clock manipulation.
- **Continuous Autosave**: Real-time response saving with visual sync indicators.
- **Virtual Scientific Calculator**: Built-in GATE scientific calculator (trig, log, ln, sqrt, powers, factorials).
- **Full Question Paper Overview**: Preview all test questions at a glance.

### 5. Detailed Evaluation & Performance Analytics
- **Official GATE Marking Rules**:
  - 1-Mark MCQ: +1 / -0.33
  - 2-Mark MCQ: +2 / -0.66
  - MSQ & NAT: Full marks / 0 negative marks
- **Visual Analytics**: Accuracy breakdown, subject mastery progress bars, topic strengths (&ge; 70%), and weak area warnings (&lt; 60%).
- **Verified Explanations**: LaTeX formatted mathematical step-by-step solutions for every question.

### 6. Multi-Branch Engineering Support
- Ready out-of-the-box for **Computer Science & IT (CS)**, **Electronics & Communication (EC)**, **Electrical Engineering (EE)**, **Mechanical Engineering (ME)**, and **Civil Engineering (CE)**.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Zustand, React Router 6, KaTeX (LaTeX math), Axios, Canvas Confetti |
| **Backend** | Node.js, Express.js (ES Modules), JWT, bcryptjs, Helmet, CORS, Express Rate Limit, Multer |
| **Database** | MongoDB & Mongoose (with automated `MongoMemoryServer` zero-config fallback) |
| **Ingestion** | `pdf-parse`, `string-similarity`, SHA-256 Deduplication, Keyword & Heuristic Classification |

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone & Install Dependencies

```bash
# Clone the repository
cd smash

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Run the Backend Server
```bash
cd server
npm run dev
```
*The server will connect to MongoDB (or automatically initialize an In-Memory MongoDB instance if no external DB is reachable) and seed verified GATE PYQ questions, branches, subjects, topics, and demo accounts.*

### 4. Run the Frontend Development Client
In a new terminal window:
```bash
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Login Credentials

You can use the 1-click login buttons on the Login page or manually enter:

| Role | Email | Password |
|---|---|---|
| **Student (GATE Aspirant)** | `student@gate.io` | `student123` |
| **Administrator** | `admin@gate.io` | `admin123` |

---

## 📁 Project Architecture

```
smash/
├── server/
│   ├── src/
│   │   ├── config/             # DB connection with auto-memory fallback
│   │   ├── models/             # Mongoose schemas (User, Branch, Subject, Topic, Question, Paper, Test, TestAttempt, UserQuestionHistory, Blueprint)
│   │   ├── controllers/        # REST route controllers
│   │   ├── services/           # Ingestion, Test Engine, Deduplication, Classification, Marking
│   │   ├── middlewares/        # JWT auth, Multer PDF upload, Error handling, Rate limiting
│   │   ├── routes/             # Express API routes
│   │   ├── seed/               # Verified GATE PYQ seeders & hierarchy content
│   │   └── server.js           # Server entry point
│   ├── uploads/                # Uploaded GATE PDF papers
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ExamHeader, QuestionPalette, QuestionCard, KaTeXRenderer, ScientificCalculatorModal, SubmitModal, ProtectedRoute
│   │   ├── pages/              # Landing, Login, Register, Dashboard, TestSetup, TestInterface, TestResult, PerformanceAnalytics, TestHistory, AdminDashboard, AdminPapers, AdminQuestions, AdminBranches, AdminBlueprints
│   │   ├── services/           # Axios API service modules
│   │   ├── store/              # Zustand stores (Auth, Test, Theme)
│   │   ├── App.jsx             # React routing architecture
│   │   └── main.jsx            # React root
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json
└── README.md
```

---

## 📡 REST API Summary

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/branches` - List active branches
- `GET /api/branches/:id` - Full branch hierarchy (subjects & topics)
- `POST /api/tests/generate` - Constraint-based test generation engine
- `GET /api/tests/:id` - Retrieve test snapshot
- `POST /api/tests/:id/start` - Initialize attempt & server timer
- `POST /api/tests/:id/answer` - Autosave individual question response
- `POST /api/tests/:id/submit` - Submit and evaluate assessment
- `GET /api/tests/:id/result` - Retrieve evaluated breakdown
- `GET /api/tests/history` - User past test history
- `GET /api/analytics` - Performance analytics & topic mastery
- `POST /api/papers/upload` - Admin PDF paper upload
- `GET /api/questions` - Question bank explorer with filtering
- `PATCH /api/questions/:id/verify` - Admin question verification
- `GET /api/admin/stats` - Platform telemetry metrics

---

## 🔒 Security & Best Practices

- **JWT Bearer Authentication** with protected API endpoints.
- **Bcrypt Password Hashing** (salt factor 10).
- **Role-Based Access Control (RBAC)** protecting administrator endpoints.
- **Helmet.js Security Headers** & CORS restriction.
- **Express Rate Limiting** to prevent API abuse.
- **Safe HTML & LaTeX Rendering** preventing XSS.

---

## 📄 License
MIT License. Built for rigorous GATE preparation and real-time assessment.
