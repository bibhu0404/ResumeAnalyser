# 🚀 ResumeAnalyzer AI — Full-Stack Resume Intelligence Platform

> An intermediate-to-advanced full-stack web application built with **Spring Boot 3**, **React 18**, **Tailwind CSS**, and **MySQL 8.0**, featuring complete **JWT authentication & authorization**, **Google OAuth 2.0 login**, **multi-resume management**, and **Spring AI / LLM-powered ATS scoring & role-readiness analytics**.

---

## 🌟 Key Features

1. **Enterprise Security & Authentication**
   - **Stateless JWT (JSON Web Token)**: Cryptographically signed tokens (HMAC-SHA256) with 24-hour expiration.
   - **Google OAuth 2.0 Sign-In**: One-click Google authentication with automated user registration and JWT exchange.
   - **Password Security**: Passwords hashed using **BCrypt** (strength 10).
   - **Role-Based Scoping**: Data isolation ensuring users only access and manage their own resumes and analyses.

2. **Multi-Resume Management**
   - Manage multiple resumes per account (e.g., *Full Stack*, *DevOps*, *Java Backend*, *Data Science*).
   - **Document Parsing**: Automatic text extraction from **PDF** (via Apache PDFBox) and **DOCX** files, as well as direct text entry.
   - Complete CRUD operations (Upload, View, Edit, Delete).

3. **Spring AI & LLM ATS Engine**
   - **ATS Compatibility Score (0–100)**: Calculates formatting, keyword density, section headers, and action verbs.
   - **Role Match Percentage (0–100)**: Evaluates candidate credentials against target job descriptions.
   - **Skill Gap Detection**: Categorizes skills into *Present in Resume* vs *Missing / Recommended*.
   - **Executive Summary**: Generates concise recruiter-facing profile briefs.
   - **Actionable Checklist**: Interactive checklist for continuous resume optimization.
   - **Tailored Interview Prep**: Produces custom technical & behavioral questions based on actual projects and target roles.
   - **Zero-Dependency Fallback**: Works immediately out-of-the-box using the built-in heuristic ATS engine even before you supply an API key!

4. **Modern Glassmorphic Frontend**
   - Built with **React 18**, **Vite**, and **Tailwind CSS**.
   - Custom SVG circular score gauges, dark glassmorphism aesthetic, responsive navigation, and celebratory micro-interactions.

---

## 🏗️ Project Architecture

```
ResumeAnalyserr/
├── backend/                             # Spring Boot 3.3.5 Backend (Java 21)
│   ├── src/main/java/com/resumeanalyser/
│   │   ├── config/                      # Web & App configuration
│   │   ├── controller/                  # REST Controllers (Auth, Resume, Analysis, Dashboard)
│   │   ├── dto/                         # Data Transfer Objects (Requests & Responses)
│   │   ├── exception/                   # Global exception handling (@RestControllerAdvice)
│   │   ├── model/                       # JPA Entities (User, Resume, ResumeAnalysis)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── security/                    # JWT Filter, Token Provider, UserPrincipal, SecurityConfig
│   │   └── service/                     # AuthService, ResumeService, Parser, ResumeAnalyzerService
│   ├── src/main/resources/
│   │   └── application.yml              # Database, JWT, Google, and LLM configuration
│   ├── .env.example                     # Backend environment variables template
│   └── pom.xml                          # Maven build definition
│
├── frontend/                            # React 18 + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/                  # Navbar, ScoreGauge, ResumesView, Dashboard, Modals
│   │   ├── context/                     # AuthContext (JWT & Google Auth state)
│   │   ├── services/                    # Axios API client with automatic Bearer token injection
│   │   ├── App.jsx                      # Main application view & routing
│   │   └── index.css                    # Tailwind CSS & glassmorphic styling
│   ├── .env.example                     # Frontend environment variables template
│   ├── tailwind.config.js
│   └── vite.config.js                   # Development proxy to backend
│
├── setup_database.sql                   # MySQL initial database creation script
├── .gitignore                           # Git ignore rules (protects credentials and binaries)
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 3.3.5, Java 21 |
| **Security** | Spring Security 6, JJWT 0.12.6, BCrypt, Google OAuth Client |
| **Database & ORM** | MySQL 8.0, Spring Data JPA, Hibernate ORM |
| **Document Processing** | Apache PDFBox 3.0.3 |
| **AI Integration** | Spring AI / OpenAI-compatible RestClient (supports OpenAI, Gemini, Groq, Ollama) |
| **Frontend Framework** | React 18, Vite |
| **Styling** | Tailwind CSS 3.4, PostCSS, Lucide Icons |
| **HTTP Client** | Axios (with token interceptors) |

---

## 📋 Step-by-Step Setup Guide

### Step 1: Connect with MySQL

1. Ensure your local MySQL server is running (MySQL 8.0 service).
2. Open your terminal or MySQL Workbench and run:
   ```sql
   CREATE DATABASE IF NOT EXISTS resume_analyzer CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Or execute the provided `setup_database.sql` script).*

3. Configure your database password:
   Open [backend/src/main/resources/application.yml](file:///e:/ResumeAnalyserr/backend/src/main/resources/application.yml) or create a `backend/.env` file:
   ```properties
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=resume_analyzer
   MYSQL_USER=root
   MYSQL_PASSWORD=your_actual_mysql_password
   ```
   > **Note**: Spring Boot Hibernate is set to `ddl-auto: update` with `createDatabaseIfNotExist=true`, meaning all tables (`users`, `resumes`, `resume_analyses`) will be created automatically on first run!

---

### Step 2: Configure Required Keys

#### 1. JWT Secret
In `application.yml` or your `.env`:
```properties
JWT_SECRET=SuperSecretKeyForResumeAnalyserMustBeAtLeast32CharactersLong2026!
```
*(You can generate your own random key using PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))`)*.

#### 2. AI / LLM API Key (OpenAI or Google Gemini)
- **OpenAI**: Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
  ```properties
  OPENAI_API_KEY=sk-your-openai-api-key
  ```
- **Google Gemini**: Get an API key from [aistudio.google.com](https://aistudio.google.com).
  You can use Gemini's OpenAI-compatible endpoint:
  ```properties
  OPENAI_API_KEY=your_gemini_api_key
  AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
  AI_MODEL=gemini-1.5-flash
  ```
- **Groq (Ultra-Fast Free Tier)**:
  ```properties
  OPENAI_API_KEY=gsk_your_groq_key
  AI_BASE_URL=https://api.groq.com/openai/v1
  AI_MODEL=llama-3.3-70b-versatile
  ```
> **Tip**: If you leave the API key blank, the application will automatically run its built-in heuristic ATS scoring engine, allowing complete testing with zero cost!

#### 3. Google OAuth 2.0 Credentials (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID** -> **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:3000`
4. Copy the **Client ID** and paste it into:
   - `backend/src/main/resources/application.yml` -> `app.google.client-id`
   - `frontend/.env` -> `VITE_GOOGLE_CLIENT_ID`

---

### Step 3: Run the Application Locally

#### 1. Start the Backend (Spring Boot)
Open a terminal in the `backend/` directory:
```powershell
cd backend
mvn spring-boot:run
```
The backend API will start on **`http://localhost:9090`**.
You can verify it by opening: `http://localhost:9090/api/health`

#### 2. Start the Frontend (React + Vite)
Open a separate terminal in the `frontend/` directory:
```powershell
cd frontend
npm run dev
```
The React development server will start on **`http://localhost:5173`**.
Open `http://localhost:5173` in your browser!

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/google` | Sign in with Google ID token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (JWT)** |
| `GET` | `/api/resumes` | List all user's resumes | **Yes (JWT)** |
| `POST` | `/api/resumes/upload` | Upload resume file (PDF, DOCX, TXT) | **Yes (JWT)** |
| `POST` | `/api/resumes/text` | Save resume from raw text | **Yes (JWT)** |
| `GET` | `/api/resumes/{id}` | Get specific resume details | **Yes (JWT)** |
| `PUT` | `/api/resumes/{id}` | Update resume content / role | **Yes (JWT)** |
| `DELETE` | `/api/resumes/{id}` | Delete resume and its analysis history | **Yes (JWT)** |
| `POST` | `/api/resumes/{id}/analyze` | Trigger AI analysis against target role & JD | **Yes (JWT)** |
| `GET` | `/api/resumes/{id}/analyses` | Get all past analyses for a resume | **Yes (JWT)** |
| `GET` | `/api/analyses/{id}` | Get a specific analysis report | **Yes (JWT)** |
| `GET` | `/api/dashboard/stats` | Get overview metrics & recent activity | **Yes (JWT)** |
| `GET` | `/api/health` | Health check endpoint | No |

---

## 🐙 Publishing to GitHub

To publish this project to your GitHub account:

1. **Initialize Git in the root folder**:
   ```bash
   cd e:\ResumeAnalyserr
   git init
   ```

2. **Stage all files** (the included `.gitignore` will ensure secrets and `node_modules` are excluded):
   ```bash
   git add .
   git commit -m "feat: complete full-stack resume analyzer with Spring Boot, React, Tailwind, MySQL and Spring AI"
   ```

3. **Link to your GitHub repository**:
   Create a new empty repository on [GitHub](https://github.com/new), then run:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

## 📄 License
This project is open-source under the MIT License. Feel free to use and customize it for your portfolio or production projects!
