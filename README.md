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
| Database | PostgreSQL |
| Auth | Firebase Authentication (client SDK + Admin SDK for token verification) |
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
| PostgreSQL | 14+ | `psql --version` |

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

**PostgreSQL**

| OS | Command |
|----|--------|
| macOS (Homebrew) | `brew install postgresql@16 && brew services start postgresql@16` |
| Ubuntu / Debian | `sudo apt install postgresql postgresql-contrib` |
| Fedora / RHEL | `sudo dnf install postgresql-server postgresql-contrib` |
| Windows | Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/) or use `winget install PostgreSQL.PostgreSQL` |

---

## Setup and Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Code_Frolics.git
cd Code_Frolics
```

### 2. Database Setup (PostgreSQL)

Create the database. The app uses `ddl-auto: update`, so tables are created automatically on first run.

**Start PostgreSQL** (if not already running):

| OS | Command |
|----|--------|
| macOS (Homebrew) | `brew services start postgresql@16` |
| Linux (systemd) | `sudo systemctl start postgresql` |
| Windows | PostgreSQL runs as a service after installation. You can also start it from the Services panel or run `pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start` |

**Create the database:**

```bash
# macOS / Linux
createdb legacy_trunk

# Windows (from Command Prompt or PowerShell)
# If psql is in your PATH:
psql -U postgres -c "CREATE DATABASE legacy_trunk;"
```

> On Windows the default superuser is `postgres`. You may be prompted for the password you set during installation.

If your PostgreSQL setup requires a specific user/password, edit `backend/src/main/resources/application.yml`:

```yaml
datasource:
  url: jdbc:postgresql://localhost:5432/legacy_trunk
  username: your_pg_user     # defaults to $USER (your OS username)
  password: your_pg_password # defaults to empty
```

### 3. Firebase Setup

The app uses Firebase Authentication. You need a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. Enable **Email/Password** sign-in under Authentication > Sign-in method.
3. Get your **web app config** from Project Settings > General > Your Apps > Web App.
4. Update `frontend/src/config/firebase.js` with your project's config values.

For backend token verification (optional but recommended):

1. Go to Project Settings > Service Accounts > Generate New Private Key.
2. Save the JSON file somewhere secure.
3. Set the environment variable before starting the backend:

```bash
# macOS / Linux
export FIREBASE_SERVICE_ACCOUNT=/path/to/your-service-account.json

# Windows (Command Prompt)
set FIREBASE_SERVICE_ACCOUNT=C:\path\to\your-service-account.json

# Windows (PowerShell)
$env:FIREBASE_SERVICE_ACCOUNT="C:\path\to\your-service-account.json"
```

If you skip this, the backend starts with `service-account-path: none` and uses Spring Security's default in-memory auth.

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

Navigate to **http://localhost:5173** in your browser. Register a new account to get started.

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
    src/main/java/com/codefrolics/legacytrunk/
      controller/              # REST API controllers
      model/                   # JPA entity classes
      repository/              # Spring Data repositories
      service/                 # Business logic
      security/                # Firebase token filter, security config
    src/main/resources/
      application.yml          # Server config (DB, port, Firebase)
    pom.xml                    # Maven dependencies

  frontend/                    # React + Vite frontend
    src/
      api/                     # Axios service modules (stories, friends, family, etc.)
      components/              # Reusable components (ProtectedRoute)
      config/                  # Firebase client config
      contexts/                # AuthContext, ToastContext
      layouts/                 # MainLayout, AuthLayout
      pages/                   # All page components
        Dashboard.jsx
        Login.jsx
        Register.jsx
        Profile.jsx
        FamilyTree.jsx
        Friends.jsx
        Gallery.jsx
        StoryCreate.jsx
        StoryView.jsx
        Home.jsx
    index.html
    package.json
    vite.config.js             # Dev server proxy config

  README.md
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
| `mvn clean install` | Build the project and run tests |
| `mvn clean install -DskipTests` | Build without running tests |
| `mvn test` | Run unit tests only |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | No | `none` | Path to Firebase service account JSON for backend token verification |

---

## Features

### Fully Implemented

| Feature | Description |
|---------|-------------|
| **User Registration and Login** | Email/password authentication via Firebase Auth. Register with name, email, password. Login with existing credentials. Firebase JWT tokens sent to backend on every API call. |
| **Dashboard** | Displays all stories as cards sorted by creation date. Each card shows cover image (or placeholder), title, description preview, date, location, author avatar, and tags. "New Memory" button links to story creation. |
| **Story Creation** | Create stories with title, description, date, location, and tags (Enter-key to add). Supports multi-file upload for images and videos. Files stored on server at `~/legacy-trunk-uploads`. |
| **Story Viewing** | Full story view with media gallery, thumbnail strip for multi-image stories, author info, date, location, and tag display. Supports delete for story author. |
| **Story Deletion** | Story author can delete their own stories with a confirmation dialog. Removes story, media files, tags, and shares from the database. |
| **User Profile** | View and edit display name, username (one-time change enforced by backend), bio, and profile photo. Shows account stats: story count, friend count, family member count. Profile photo upload with preview. |
| **Family Tree Builder** | Interactive visual tree with paternal/maternal tabs. Add, edit, and delete family members. Each member has name, relationship, birth/death dates, birth place, bio, photo, and parent link. Hierarchical rendering with expand/collapse. Hover actions for quick edit/delete/add-child. |
| **Friends System** | Invite friends by email, accept or decline pending invitations, remove existing friends. Friends list with avatar, name, and email. Pending requests panel with accept/decline buttons. |
| **Media Gallery** | Aggregates all media from all stories into a single masonry-grid page. Filter by All, Photos, or Videos. Click any item for fullscreen lightbox with Escape-to-close. Shows story title overlay on hover. |
| **Notifications** | Bell icon in navbar with unread count badge. Notification dropdown with mark-as-read and delete. Auto-polls backend every 30 seconds for new notifications. |
| **Toast Notifications** | Global toast system for all user actions across every page. Four variants: success (green), error (red), warning (amber), info (brown). Auto-dismiss with slide-out animation and manual close button. |
| **Protected Routes** | Unauthenticated users are redirected to `/login` when trying to access any protected page (dashboard, profile, family tree, friends, gallery, story pages). |
| **Backend Auth Middleware** | Spring Security filter intercepts every `/api/*` request, extracts the Firebase JWT from the `Authorization` header, verifies it with Firebase Admin SDK, and sets the authenticated user in the security context. |
| **Privacy Control** | Stories can be shared with specific users by ID. Backend enforces access control -- users can only view their own stories or stories explicitly shared with them. Stored in `story_shares` table. |

### Partially Implemented

| Feature | What Works | What is Missing |
|---------|-----------|----------------|
| **Story Tagging** | Tags can be added per story on creation (Enter-key input). Tags are stored in `story_tags` table and displayed on dashboard cards and story view. | AI-powered auto-tagging is not implemented. Tags are per-story only, not per-individual-photo. |
| **Timeline View** | Dashboard renders story cards sorted by date with date and location metadata visible on each card. | No dedicated timeline layout or visual timeline track. No date-range filtering or navigation by year/month. |
| **Story Editing** | Story deletion works from the story view page. Backend `StoryController` has delete endpoint. | No edit UI exists. The Edit icon is imported in `StoryView.jsx` but has no click handler. Backend has no `PUT /stories/{id}` endpoint. |
| **Notification Triggers** | The notification system can read, mark-as-read, and delete notifications. UI bell icon polls and displays them. | No code actually *creates* notifications. Events like friend request accepted, story shared, etc. do not fire notifications. The creation triggers are not wired. |
| **Media Upload Formats** | Image and video uploads work via the story creation form (`accept="image/*,video/*"`). | Audio upload is not supported (the old app accepted audio). No drag-and-drop upload interface. |

### Not Yet Implemented

| Feature | Description |
|---------|-------------|
| **Search** | No search bar or filtering exists on the frontend. No search endpoint on the backend. Users cannot search stories by title, tag, date, location, or author. |
| **User Roles** | No role system (parent, grandparent, child, admin). All authenticated users have identical permissions. |
| **Story Export (PDF)** | The old app had a fully built PDF/scrapbook export feature (using jsPDF and html2canvas). This has not been ported to the React rewrite. |
| **AI Memory Prompts** | Predefined story-starter questions (e.g., "What was your happiest childhood moment?") to inspire story writing. Not implemented in either old or new app. |
| **AI Text Analysis** | Auto-tagging and content categorization using NLP (Google Gemini API / Hugging Face). Not implemented. |
| **Cross-Generational Matching** | Matching family members with similar interests or experiences based on story content. Not implemented. |
| **Collaborative Story Editing** | Multiple users co-editing a single family story. Stories are shared as read-only via `story_shares` table but no co-editing mechanism exists. |
| **Geo-Tagged Memories** | Map view of memories using Google Maps or Mapbox. The `location` field stores text but there is no map integration or geocoding. |
| **Time Capsules** | Lock stories to be revealed on a future date. No date-lock or scheduled-reveal mechanism exists. |
| **Multilingual Translation** | Translate stories into multiple languages for global family sharing. Not implemented. |
| **AI Family Tree Helper** | AI assistance for building and suggesting family tree connections. Old app had partial scaffold code that was not ported. |

