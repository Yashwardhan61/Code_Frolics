# The Legacy Trunk -- Yaado Ka Baksa

**Project by Team Code Frolics (Team ID: 631)**

| Member | Roll No | Program |
|--------|---------|---------|
| Yashwardhan Singh | 2025CA114 | MCA |
| Grishma Doshi | 2025CA038 | MCA |
| Harshita Prajapat | 2025CA042 | MCA |

---

## Overview

The Legacy Trunk (Yaado Ka Baksa) is a digital family archive that helps preserve memories, heirlooms, and life stories across generations. It is a secure storytelling platform where family members can record, upload, and relive shared memories through photos, videos, and text -- keeping the heritage alive for years to come.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | Spring Boot 3.4 (Java 17), Spring Security, Spring Data JPA |
| Database | PostgreSQL (Neon serverless) |
| Auth | Firebase Authentication (client SDK + Admin SDK for token verification) |
| AI | Groq API (fast inference for description enhancement and predictive text) |
| Email | Gmail SMTP with Spring Boot Mail |
| Storage | Local filesystem (`~/legacy-trunk-uploads`) |
| Build | Maven (backend), npm (frontend) |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Node.js | v18+ | `node -v` |
| npm | v9+ | `npm -v` |
| Java (JDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -v` |

> **Note:** A local PostgreSQL installation is not required. The project uses [Neon](https://neon.tech) as a serverless PostgreSQL provider. If you prefer to run PostgreSQL locally, see the [Local Database Setup](#local-database-setup-optional) section.

### Installing Prerequisites

**Node.js and npm** -- Download from [nodejs.org](https://nodejs.org/) (LTS recommended). The npm CLI is bundled with the Node.js installer on all platforms.

**Java (JDK 17+)**

| OS | Command |
|----|--------|
| macOS (Homebrew) | `brew install openjdk@17` |
| Ubuntu / Debian | `sudo apt install openjdk-17-jdk` |
| Fedora / RHEL | `sudo dnf install java-17-openjdk-devel` |
| Windows | Download from [Adoptium](https://adoptium.net/) or use `winget install EclipseAdoptium.Temurin.17.JDK` |

**Maven**

| OS | Command |
|----|--------|
| macOS (Homebrew) | `brew install maven` |
| Ubuntu / Debian | `sudo apt install maven` |
| Fedora / RHEL | `sudo dnf install maven` |
| Windows | Download from [maven.apache.org](https://maven.apache.org/download.cgi) and add `bin/` to your `PATH`, or use `winget install Apache.Maven` |

---

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Yashwardhan61/Code_Frolics.git
cd Code_Frolics
```

### 2. Backend Environment Configuration

The backend reads all credentials from a `.env` file. Copy the example template and fill in your values:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Database (Neon PostgreSQL)
DB_URL=jdbc:postgresql://<your-neon-host>/neondb?sslmode=require
DB_USER=<your-neon-username>
DB_PASS=<your-neon-password>

# Firebase (set to path of your service account JSON, or "none" to skip)
FIREBASE_SERVICE_ACCOUNT=none

# Email SMTP (Gmail -- use an App Password, not your regular password)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

# Groq AI (for description enhancement)
GROQ_API_KEY=your_groq_api_key
```

> **Important:** Never commit the `.env` file. It is excluded via `.gitignore`.

### 3. Firebase Setup

The app uses Firebase Authentication. You need a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. Enable **Email/Password** sign-in under Authentication > Sign-in method.
3. Get your **web app config** from Project Settings > General > Your Apps > Web App.
4. Update `frontend/src/config/firebase.js` with your project's config values.

For backend token verification (optional but recommended):

1. Go to Project Settings > Service Accounts > Generate New Private Key.
2. Save the JSON file somewhere secure (do not commit it to git).
3. Set the path in your `.env`:

```env
FIREBASE_SERVICE_ACCOUNT=/path/to/your-service-account.json
```

If you skip this, the backend starts with `service-account-path: none`. In dev profile (`-Dspring.profiles.active=dev`), it will use unsafe manual JWT decoding for local development. In production, tokens will be rejected if Firebase Admin SDK is not configured.

### 4. Backend Setup

```bash
cd backend

# Build the project (downloads dependencies on first run)
mvn clean install -DskipTests

# Run the Spring Boot server
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

You should see output like:

```
Started LegacyTrunkApplication in X.XXX seconds
Tomcat started on port 8080 (http)
```

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend starts on **http://localhost:5173** with a proxy to the backend at `:8080` for all `/api/*` requests.

### 6. Open the App

Navigate to **http://localhost:5173** in your browser. Register a new account to get started. The first user to register is automatically assigned the ADMIN role.

---

## Running Both Servers (Quick Reference)

**macOS / Linux:**

```bash
# Terminal 1 -- Backend
cd backend && mvn spring-boot:run

# Terminal 2 -- Frontend
cd frontend && npm run dev
```

**Windows (Command Prompt):**

```cmd
REM Terminal 1 -- Backend
cd backend
mvn spring-boot:run

REM Terminal 2 -- Frontend
cd frontend
npm run dev
```

**Windows (PowerShell):**

```powershell
# Terminal 1 -- Backend
cd backend; mvn spring-boot:run

# Terminal 2 -- Frontend
cd frontend; npm run dev
```

---

## Project Structure

```
Code_Frolics/
  backend/                     # Spring Boot backend
    .env.example               # Environment variable template
    pom.xml                    # Maven dependencies
    src/main/java/com/codefrolics/legacytrunk/
      config/                  # CorsConfig, FirebaseConfig, GroqConfig, SecurityConfig
      controller/              # REST API controllers (13 controllers)
        AuthController         # Login sync, forgot/reset password
        StoryController        # Story CRUD
        RecipeController       # Recipe CRUD
        HeirloomController     # Heirloom CRUD
        FamilyTreeController   # Family tree member CRUD
        FriendController       # Friend invitations and management
        NotificationController # Notification read/delete
        ProfileController      # User profile management
        MediaController        # Media file serving
        AdminController        # User role management (ADMIN only)
        ScrapbookController    # Scrapbook CRUD
        AiController           # Groq AI integration
        MemoryController       # Memory search and statistics
        GlobalExceptionHandler # Centralized error handling
      dto/                     # Request/Response data transfer objects (with validation)
      model/                   # JPA entity classes (20 entities)
      repository/              # Spring Data repositories
      service/                 # Business logic (14 services)
      security/                # Firebase token filter, user details

    src/main/resources/
      application.yml          # Server config (DB, port, Firebase, Groq)

  frontend/                    # React + Vite frontend
    src/
      api/                     # Axios service modules (12 services)
      components/              # Reusable components
        ProtectedRoute         # Auth guard for protected routes
        AdminRoute             # Role guard for admin-only routes
        AudioWaveformPlayer    # Audio playback with waveform visualization
        AutoGenerateModal      # AI-powered scrapbook generation
        FlipBookPreview        # Scrapbook flip-book viewer
        HourglassLoader        # Loading indicator
      config/                  # Firebase client config
      contexts/                # AuthContext, ToastContext
      layouts/                 # MainLayout (sidebar nav), AuthLayout (public pages)
      pages/                   # All page components (27 pages)
    index.html
    package.json
    vite.config.js             # Dev server proxy config

  README.md
  .gitignore
```

---

## Available npm Scripts (Frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## Available Maven Commands (Backend)

| Command | Description |
|---------|-------------|
| `mvn spring-boot:run` | Start the Spring Boot server |
| `mvn spring-boot:run -Dspring.profiles.active=dev` | Start in dev mode (enables unsafe JWT fallback for local dev without Firebase Admin SDK) |
| `mvn clean install` | Build the project and run tests |
| `mvn clean install -DskipTests` | Build without running tests |
| `mvn compile` | Compile only (fastest check) |

---

## Environment Variables

All backend environment variables are loaded from `backend/.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_URL` | Yes | `jdbc:postgresql://localhost:5432/legacy_trunk` | JDBC connection URL for PostgreSQL |
| `DB_USER` | Yes | `postgres` | Database username |
| `DB_PASS` | Yes | (empty) | Database password |
| `FIREBASE_SERVICE_ACCOUNT` | No | `none` | Path to Firebase service account JSON, or `none` to skip |
| `MAIL_USERNAME` | No | (empty) | Gmail address for SMTP email sending |
| `MAIL_PASSWORD` | No | (empty) | Gmail App Password (not regular password) |
| `GROQ_API_KEY` | No | (empty) | Groq API key for AI description enhancement |
| `FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for CORS and email links |

---

## API Error Handling

All API errors return a consistent JSON structure:

```json
{
  "timestamp": "2025-08-17T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "name": "Name must not exceed 255 characters"
  }
}
```

| HTTP Status | When |
|-------------|------|
| 400 | Validation failures, bad input |
| 403 | Insufficient role/permissions |
| 413 | File upload exceeds 50MB limit |
| 500 | Unexpected server errors (details logged, not exposed to client) |

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **User Registration and Login** | Email/password authentication via Firebase Auth. Register with name, email, password with strength validation. Login with existing credentials. Firebase JWT tokens sent to backend on every API call. |
| **Password Reset** | Forgot password flow with email-based reset tokens. Users receive an email with a secure link to reset their password. Token validation and password update handled server-side. |
| **Dashboard** | Displays all stories as cards sorted by creation date. Each card shows cover image (or placeholder), title, description preview, date, location, author avatar, and tags. "New Memory" button links to story creation. |
| **Story CRUD** | Create, view, edit, and delete stories with title, description, date, location, and tags (Enter-key to add). Supports multi-file upload for images, videos, and audio. Dedicated edit page with pre-filled fields. Story author can delete with confirmation dialog. |
| **Search and Filtering** | Multi-criteria search across stories with query text, date range, author, media type, tags, location, and sort options. Backend supports paginated results. |
| **Time Capsule** | Lock stories to be revealed on a future date and time. Backend scheduler (`TimeCapsuleSchedulerService`) scans for stories unlocking today and within the next 2 minutes, sends email and in-app notifications to the author when unlocked. |
| **Heritage Module** | Dedicated section for family recipes and heirlooms. Recipes include ingredients, steps, cooking time, servings, tags, and media. Heirlooms include current/next owner, estimated year, tags, and media. Full CRUD for both. |
| **Scrapbook** | Canvas-based scrapbook editor for creating visual memory collages. List view of all scrapbooks. QR code scanner for sharing scrapbooks. Auto-generate scrapbooks with AI-powered themes (Legacy Capsule, Polaroid Grid, Vintage Journal). |
| **User Profile** | View and edit display name, username (one-time change enforced), bio, and profile photo. Shows account stats: story count, friend count, family member count. Profile photo upload with preview. |
| **Family Tree Builder** | Interactive visual tree with paternal/maternal tabs. Add, edit, and delete family members. Each member has name, relationship, birth/death dates, birth place, bio, photo, and parent link. Hierarchical rendering with expand/collapse. Hover actions for quick edit/delete/add-child. Notifications sent when new members are added. |
| **Friends System** | Invite friends by email, accept or decline pending invitations, remove existing friends. Friends list with avatar, name, and email. Pending requests panel with accept/decline buttons. Notifications on friend request and acceptance. |
| **Media Gallery** | Aggregates all media from all stories into a single masonry-grid page. Filter by All, Photos, or Videos. Click any item for fullscreen lightbox with Escape-to-close. Shows story title overlay on hover. |
| **AI Description Enhancement** | Groq-powered AI integration for enhancing story descriptions and providing predictive text suggestions during story creation. |

### Access Control and Security

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | Two roles: ADMIN and MEMBER. First registered user gets ADMIN. Admins can view all users and change roles via the Admin Panel. Backend enforces roles with `@PreAuthorize`. |
| **Admin Panel** | Admin-only dashboard showing all registered users with their roles. Admins can promote/demote users between ADMIN, MEMBER, and VIEWER roles. Frontend route is protected by role guard (non-admins redirected to dashboard). |
| **Protected Routes** | Unauthenticated users are redirected to `/login` when trying to access any protected page. Admin routes additionally check for ADMIN role. |
| **Backend Auth Middleware** | Spring Security filter intercepts every `/api/*` request, extracts the Firebase JWT from the `Authorization` header, verifies it with Firebase Admin SDK, and sets the authenticated user in the security context. Unsafe JWT fallback is gated behind `dev` profile only. |
| **Input Validation** | All request DTOs are validated with Jakarta Bean Validation annotations (`@NotBlank`, `@Size`, `@Valid`). Invalid input returns structured field-level error messages. |
| **Global Error Handling** | Centralized `@RestControllerAdvice` catches validation errors, access denials, upload limits, and runtime exceptions. Returns consistent JSON error responses. No stack traces leak to clients. |
| **Privacy Control** | Stories can be shared with specific users by ID. Backend enforces access control -- users can only view their own stories or stories explicitly shared with them. Stored in `story_shares` table. |

### Notifications

| Feature | Description |
|---------|-------------|
| **In-App Notifications** | Bell icon in navbar with unread count badge. Notification dropdown with mark-as-read and delete. Auto-polls backend every 30 seconds for new notifications. |
| **Notification Triggers** | Notifications are automatically created for: story sharing, friend request sent, friend request accepted, family member added, and time capsule unlocked. |
| **Email Notifications** | SMTP email service for password reset emails and time capsule unlock notifications. Uses Gmail with App Password authentication. |
| **Toast Notifications** | Global toast system for all user actions across every page. Four variants: success (green), error (red), warning (amber), info (brown). Auto-dismiss with slide-out animation and manual close button. |

### Additional Pages

| Page | Description |
|------|-------------|
| **Home** | Public landing page |
| **Welcome** | Post-registration welcome page |
| **Onboarding** | Profile setup wizard for new users |
| **About** | About the project |
| **Contact** | Contact information |
| **Feedback** | User feedback form |

### Not Yet Implemented

| Feature | Description |
|---------|-------------|
| **AI Auto-Tagging** | Auto-tagging and content categorization using NLP. Tags are currently manual per-story only. |
| **Story Export (PDF)** | Export stories or scrapbooks as downloadable PDF documents. |
| **AI Memory Prompts** | Predefined story-starter questions to inspire story writing. |
| **Cross-Generational Matching** | Matching family members with similar interests or experiences based on story content. |
| **Collaborative Story Editing** | Multiple users co-editing a single family story. Stories are currently shared as read-only. |
| **Geo-Tagged Memories** | Map view of memories using Google Maps or Mapbox. The `location` field stores text but there is no map integration or geocoding. |
| **Multilingual Translation** | Translate stories into multiple languages for global family sharing. |
| **AI Family Tree Helper** | AI assistance for building and suggesting family tree connections. |
| **Timeline View** | Dedicated visual timeline layout. Currently stories are shown as sorted cards on the dashboard. |

---

## Local Database Setup (Optional)

If you prefer to run PostgreSQL locally instead of using Neon:

**Install PostgreSQL:**

| OS | Command |
|----|--------|
| macOS (Homebrew) | `brew install postgresql@16 && brew services start postgresql@16` |
| Ubuntu / Debian | `sudo apt install postgresql postgresql-contrib` |
| Fedora / RHEL | `sudo dnf install postgresql-server postgresql-contrib` |
| Windows | Download from [postgresql.org](https://www.postgresql.org/download/windows/) or use `winget install PostgreSQL.PostgreSQL` |

**Create the database:**

```bash
createdb legacy_trunk
```

**Update your `.env`:**

```env
DB_URL=jdbc:postgresql://localhost:5432/legacy_trunk
DB_USER=postgres
DB_PASS=your_local_password
```

The app uses `ddl-auto: update`, so tables are created automatically on first run.
