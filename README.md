# The Legacy Trunk -- Yaado Ka Baksa

**Project by Team Code Frolics (Team ID: 631)**

| Member | Roll No | Program |
|--------|---------|---------|
| Yashwardhan Singh | 2025CA114 | MCA |
| Grishma Doshi | 2025CA038 | MCA |
| Harshita Prajapat | 2025CA042 | MCA |

---

## Overview

The Legacy Trunk (Yaado Ka Baksa) is a digital family archive that helps preserve memories, heirlooms, and life stories across generations. It is a secure storytelling platform where family members can record, upload, and relive shared memories through photos, videos, audio, and text -- keeping the heritage alive for years to come.

---

## Live Demo

**Deployed URL:** [https://code-frolics-rqln.vercel.app/](https://code-frolics-rqln.vercel.app/)

**GitHub:** [https://github.com/Yashwardhan61/Code_Frolics](https://github.com/Yashwardhan61/Code_Frolics)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | Spring Boot 3.4 (Java 17), Spring Security, Spring Data JPA, Lombok |
| Database | PostgreSQL (Neon serverless) |
| Auth | Firebase Authentication (client SDK + Admin SDK for token verification) |
| AI | Groq API (description enhancement and predictive text) |
| Email | Gmail SMTP via Spring Boot Mail (async HTML emails) |
| Storage | PostgreSQL (Neon) -- media files stored as binary blobs in `stored_media` table |
| API Docs | Springdoc OpenAPI / Swagger UI |
| Build | Maven (backend), npm (frontend) |
| Deployment | Vercel (frontend) |

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

**Node.js and npm** -- Download from [nodejs.org](https://nodejs.org/) (LTS recommended).

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

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
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

If you skip this, the backend starts with `service-account-path: none`. In dev profile (`-Dspring.profiles.active=dev`), it will use unsafe manual JWT decoding for local development.

### 4. Backend Setup

```bash
cd backend

# Build the project (downloads dependencies on first run)
mvn clean install -DskipTests

# Run the Spring Boot server
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

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

---

## Project Structure

```
Code_Frolics/
  backend/                     # Spring Boot backend
    .env.example               # Environment variable template
    pom.xml                    # Maven dependencies
    src/main/java/com/codefrolics/legacytrunk/
      config/                  # CorsConfig, FirebaseConfig, GroqConfig, SecurityConfig
      controller/              # REST API controllers (14 controllers)
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
      dto/                     # Request/Response DTOs (with Jakarta Bean Validation)
      model/                   # JPA entity classes (21 entities)
      repository/              # Spring Data JPA repositories
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
        AutoGenerateModal      # AI-powered scrapbook auto-generation
        FlipBookPreview        # Scrapbook flip-book viewer
        MemoryPromptsModal     # Categorized story-starter prompt picker
        ErrorBoundary          # React error boundary
        HourglassLoader        # Loading indicator
        dashboard/
          MediaCarousel        # Spotlight media carousel with time capsule countdown
          TimelineStoryCard    # Timeline card for dashboard story list
        story/
          AudioRecorderModal   # In-browser voice recording modal
          MemoryPromptsModal   # Story inspiration prompt modal
      config/                  # Firebase client config
      contexts/                # AuthContext, ToastContext
      layouts/                 # MainLayout (sidebar nav), AuthLayout (public pages)
      pages/                   # All page components (28 pages)
    index.html
    package.json
    vite.config.js             # Dev server proxy config
    vercel.json                # Vercel SPA rewrite rules

  README.md
  .gitignore
  Dockerfile
  vercel.json
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
| **Password Reset** | Forgot password flow with email-based reset tokens. Users receive an HTML-formatted email with a secure link to reset their password. Token validation and password update handled server-side. |
| **Dashboard** | Timeline-style family chronicle with a spotlight card for the latest story, an "On This Day" flashback panel, animated stat counters (memories, locations, members, oldest year), a media carousel with time capsule countdown, and scroll-reveal story cards sorted by date. |
| **Story CRUD** | Create, view, edit, and delete stories with title, description, date, location, and tags. Supports multi-file upload for images, videos, and audio. Dedicated edit page with pre-filled fields. Story author can delete with confirmation dialog. Stories can be shared with specific friends. |
| **Voice Recording** | In-browser audio recording modal during story creation. Records via the MediaRecorder API with a live timer, previews the recording, and attaches it as an audio file to the story. |
| **Memory Prompts** | Categorized story-starter prompt picker (Childhood & Youth, Journeys & Travel, Family Heritage, Milestones & Turning Points) accessible during story creation. Selecting a prompt auto-fills the description field. |
| **AI Description Enhancement** | Groq-powered AI integration for enhancing story descriptions with a single click and providing predictive text suggestions during story creation. |
| **Search and Filtering** | Multi-criteria search across stories with query text, date range, author, media type, tags, location, and sort options. Backend supports paginated results. |
| **Time Capsule** | Lock stories to be revealed on a future date and time. A Spring `@Scheduled` task (runs every 30 seconds) scans for stories unlocking today and within the next 2 minutes, dispatching deduplicated in-app notifications for both "reveal day" and "unlocking soon" events to the author and all shared users. |
| **Heritage Module** | Dedicated section for family recipes and heirlooms. Recipes include ingredients, steps, cooking time, servings, tags, and media. Heirlooms include current/next owner, estimated year, tags, and media. Full CRUD for both. |
| **Scrapbook** | Canvas-based scrapbook editor for creating visual memory collages. List view of all scrapbooks. AI-powered auto-generation with 3 themes (Legacy Capsule, Polaroid Grid, Vintage Journal). Flip-book preview mode. QR code generation for sharing; dedicated QR scanner page to decode and preview linked stories. |
| **User Profile** | View and edit display name, username (one-time change enforced), bio, and profile photo. Shows account stats: story count, friend count, family member count. Profile photo upload with preview. |
| **Family Tree Builder** | Interactive visual tree with paternal/maternal tabs. Add, edit, and delete family members. Each member has name, relationship, birth/death dates, birth place, bio, photo, and parent link. Hierarchical rendering with expand/collapse. Hover actions for quick edit/delete/add-child. Each member has a dedicated **Member Portal** page showing their profile and all stories linked to them. Notifications sent when new members are added. |
| **Friends System** | Invite friends by email, accept or decline pending invitations, remove existing friends. Friends list with avatar, name, and email. Pending requests panel with accept/decline buttons. Notifications on friend request and acceptance. |
| **Media Gallery** | Aggregates all media from all stories into a single masonry-grid page. Filter by All, Photos, or Videos. Click any item for fullscreen lightbox with Escape-to-close. Shows story title overlay on hover. |

### Access Control and Security

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | Three roles: ADMIN, MEMBER, and VIEWER. First registered user gets ADMIN. Admins can view all users and change roles via the Admin Panel. Backend enforces roles with `@PreAuthorize`. |
| **Admin Panel** | Admin-only dashboard showing all registered users with their roles. Admins can promote/demote users between ADMIN, MEMBER, and VIEWER roles. Frontend route is protected by role guard (non-admins redirected to dashboard). |
| **Protected Routes** | Unauthenticated users are redirected to `/login` when trying to access any protected page. Admin routes additionally check for ADMIN role. |
| **Backend Auth Middleware** | Spring Security filter intercepts every `/api/*` request, extracts the Firebase JWT from the `Authorization` header, verifies it with Firebase Admin SDK, and sets the authenticated user in the security context. Unsafe JWT fallback is gated behind `dev` profile only. |
| **Input Validation** | All request DTOs are validated with Jakarta Bean Validation annotations (`@NotBlank`, `@Size`, `@Valid`). Invalid input returns structured field-level error messages. |
| **Global Error Handling** | Centralized `@RestControllerAdvice` catches validation errors, access denials, upload limits, and runtime exceptions. Returns consistent JSON error responses. No stack traces leak to clients. |
| **Privacy Control** | Stories can be shared with specific friends by user ID. Backend enforces access control -- users can only view their own stories or stories explicitly shared with them. Stored in `story_shares` table. |

### Notifications

| Feature | Description |
|---------|-------------|
| **In-App Notifications** | Bell icon in navbar with unread count badge. Notification dropdown with mark-as-read and delete. Auto-polls backend every 30 seconds for new notifications. |
| **Notification Triggers** | Notifications are automatically created for: story sharing, friend request sent, friend request accepted, family member added, time capsule reveal day, and time capsule unlocking soon. |
| **Email Notifications** | Async HTML SMTP email service for password reset emails. Styled HTML emails sent via Gmail with App Password authentication. |
| **Toast Notifications** | Global toast system for all user actions across every page. Four variants: success (green), error (red), warning (amber), info (brown). Auto-dismiss with slide-out animation and manual close button. |

### Pages (28 total)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Public landing page |
| Register | `/register` | New user sign-up |
| Login | `/login` | User sign-in |
| Reset Password | `/reset-password` | Password reset via token |
| Welcome | `/welcome` | Post-registration welcome |
| Onboarding | `/onboarding` | Profile setup wizard for new users |
| Dashboard | `/dashboard` | Family chronicle timeline |
| Story Create | `/story/create` | Multi-step story creation with voice recording and AI prompts |
| Story View | `/story/:id` | Full story view with media and time capsule lock/unlock |
| Story Edit | `/story/:id/edit` | Edit existing story |
| Gallery | `/gallery` | Masonry media gallery across all stories |
| Heritage | `/heritage` | Recipes and heirlooms listing |
| Recipe Create | `/heritage/recipe/create` | Create a new recipe |
| Recipe View | `/heritage/recipe/:id` | Full recipe view |
| Heirloom Create | `/heritage/heirloom/create` | Create a new heirloom |
| Heirloom View | `/heritage/heirloom/:id` | Full heirloom view |
| Family Tree | `/family-tree` | Interactive hierarchical family tree |
| Member Portal | `/family-tree/member/:id` | Individual member profile and their linked stories |
| Friends | `/friends` | Friends list and invitation management |
| Scrapbook List | `/scrapbook` | All scrapbooks overview |
| Scrapbook Editor | `/scrapbook/:id/edit` | Canvas-based scrapbook editor |
| Scrapbook Scanner | `/scrapbook/scanner` | QR code scanner to preview linked stories |
| Profile | `/profile` | User profile view and edit |
| Admin Panel | `/admin` | User and role management (ADMIN only) |
| About | `/about` | About the project |
| Contact | `/contact` | Contact information |
| Feedback | `/feedback` | User feedback form |
| Not Found | `*` | 404 page |

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
