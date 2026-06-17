# Feature Audit v2: The Legacy Trunk (Yaado ka Baksa)
# Spring Boot + React Migration — Current State

Updated audit of the new `backend/` (Spring Boot 3.4 + PostgreSQL + Firebase Admin SDK) and `frontend/` (React + Vite + Tailwind) codebase, cross-referenced against the original `app/` vanilla audit (v1).

---

## Process Flow Features

| # | Feature | Old App Status | New App Status | Evidence |
|---|---------|---------------|---------------|----------|
| 1 | User Registration & Authentication | DONE | DONE | [Login.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Login.jsx), [Register.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Register.jsx) — Firebase Auth (email/password). Backend validates token via [FirebaseTokenFilter.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/security/FirebaseTokenFilter.java) on every request |
| 2 | Family Circle Creation | DONE | DONE | [Friends.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Friends.jsx) + [friendService.js](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/api/friendService.js) + [FriendController.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/controller/FriendController.java) — invite by email, accept/decline, remove. Persisted in PostgreSQL via `friend_invitations` and `friends` tables |
| 3 | Story Uploads (image/video/text) | DONE | DONE | [StoryCreate.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/StoryCreate.jsx) + [StoryController.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/controller/StoryController.java) — multi-file upload (image/video accepted), stored locally via [MediaStorageService.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/service/MediaStorageService.java) at `~/legacy-trunk-uploads`. **No audio** or drag-and-drop yet |
| 4 | Tagging & Categorization | PARTIAL | PARTIAL | Tags work (Enter-key input on create, displayed on view/dashboard). Backend stores them in `story_tags` table. **AI auto-tagging still not implemented** |
| 5 | Timeline Generation | PARTIAL | PARTIAL | Dashboard shows stories sorted by `createdAt` descending. Location + date shown per card. **No dedicated timeline view, no date-range filter** |
| 6 | AI Assistance (memory prompts) | NOT DONE | NOT DONE | No change — nothing in the new codebase |
| 7 | AI Text Analysis (auto-tagging) | NOT DONE | NOT DONE | No change — nothing in the new codebase |
| 8 | Privacy Control | DONE | DONE | `StoryRequest.sharedWithUserIds` allows sharing with specific user IDs. [StoryService.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/service/StoryService.java) fetches own + shared stories and checks access on read. Stored in `story_shares` table |
| 9 | Export Feature (PDF / scrapbook) | DONE | NOT DONE | [download-stories.js](file:///Users/yashwardhan61/Desktop/Code_Frolics/app/regis/home/download-stories.js) exists in old app only. **Not ported to React at all** |

---

## Basic Features

| # | Feature | Old App Status | New App Status | Evidence |
|---|---------|---------------|---------------|----------|
| 1 | Family Story Recording (audio/video/photo/text) | DONE | PARTIAL | [StoryCreate.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/StoryCreate.jsx) — `accept="image/*,video/*"` only. **Audio missing** from the new form |
| 2 | Timeline Creation | PARTIAL | PARTIAL | Dashboard renders cards sorted by date. No dedicated timeline layout (no `.timeline-track` equivalent), no date navigation |
| 3 | Photo Uploads with Tagging | PARTIAL | PARTIAL | Photo/video upload works. Tags are per-story (not per-file). No per-photo individual tagging |
| 4 | Private Family Circles | DONE | DONE | [FriendService.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/service/FriendService.java) + [friendService.js](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/api/friendService.js) — full invite/accept/decline/remove cycle |
| 5 | Search Functionality | NOT DONE | NOT DONE | No search bar or filtering of any kind in the new React frontend or backend |
| 6 | User Roles (parent/grandparent/kid) | NOT DONE | NOT DONE | No role system. All authenticated users have identical permissions |
| 7 | Story Export (PDF / printable books) | DONE | NOT DONE | Not ported — no PDF generation in new codebase |

---

## Advanced Features

| # | Feature | Old App Status | New App Status | Evidence |
|---|---------|---------------|---------------|----------|
| 1 | AI Memory Prompts (story-starter questions) | NOT DONE | NOT DONE | No change |
| 2 | AI Text Analysis (auto-tagging with NLP) | NOT DONE | NOT DONE | No change |
| 3 | Cross-Generational Matching | NOT DONE | NOT DONE | No change |
| 4 | Collaborative Story Editing | NOT DONE | NOT DONE | Stories are shared (read-only via `StoryShare`), but no co-editing mechanism |
| 5 | Geo-Tagged Memories (map view) | NOT DONE | NOT DONE | `location` field stored as text. No map integration |
| 6 | Time Capsules (locked stories) | NOT DONE | NOT DONE | No change |
| 7 | Multilingual Translation | NOT DONE | NOT DONE | No change |

---

## Additional Features — Status Comparison

Features that existed in the old app's "Additional Implemented" list:

| Feature | Old App | New App | Notes |
|---------|---------|---------|-------|
| User Profile System | DONE | DONE | [Profile.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Profile.jsx) — edit name, username (one-time change enforced), bio, photo upload, stats (story count, friend count, family member count) |
| Notifications System | DONE | DONE | [NotificationService.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/service/NotificationService.java) + [notificationService.js](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/api/notificationService.js) + bell in [MainLayout.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/layouts/MainLayout.jsx). Auto-polls every 30s. **Notification creation** (triggers) not yet wired — no code creates notifications on friend accept/story share events |
| Family Tree Builder | DONE | DONE | [FamilyTree.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/FamilyTree.jsx) — full interactive tree, maternal/paternal tabs, add/edit/delete/photo per member, hierarchy with collapse |
| Story Edit | DONE | PARTIAL | Delete works ([storyService.js](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/api/storyService.js)). **No story edit UI** — the Edit button in StoryView.jsx imports `Edit` icon but the `onClick` is absent |
| Media Preview (fullscreen) | DONE | DONE | [StoryView.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/StoryView.jsx) — thumbnail strip, active media display. [Gallery.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Gallery.jsx) — masonry grid + fullscreen lightbox (Escape to close) |
| AI Helper for Family Tree | PARTIAL | NOT DONE | Old app had scaffold code. Not ported |

---

## New Features Added in React Rewrite (not in old app)

| Feature | Evidence |
|---------|---------|
| Media Gallery page | [Gallery.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/Gallery.jsx) — aggregates all story media, filter by Photo/Video, masonry grid, lightbox |
| Persistent PostgreSQL backend | All data in relational DB (not Firebase Realtime DB). Schema: `users`, `stories`, `story_media`, `story_tags`, `story_shares`, `friends`, `friend_invitations`, `notifications`, `family_members` |
| Active-route highlighting in navbar | [MainLayout.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/layouts/MainLayout.jsx) — amber highlight on current route |
| Protected route guards | [ProtectedRoute.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/components/ProtectedRoute.jsx) — redirects unauthenticated users to /login |
| Backend auth middleware | [FirebaseTokenFilter.java](file:///Users/yashwardhan61/Desktop/Code_Frolics/backend/src/main/java/com/codefrolics/legacytrunk/security/FirebaseTokenFilter.java) — every API request verifies Firebase JWT |

---

## Tech Stack Comparison

| Tool/Library | README Spec | Old App | New App |
|---|---|---|---|
| HTML5 / CSS3 / Vanilla JS | Yes | DONE | Replaced by React + Vite |
| Firebase Auth | Yes | DONE | DONE — still used for auth, token passed to Spring backend |
| Firebase Realtime DB | Yes | DONE | **REPLACED** by PostgreSQL — no Firebase DB dependency |
| Firebase Storage | Yes | DONE | **REPLACED** by local disk storage (`MediaStorageService`) |
| Spring Boot | No (not in README) | N/A | DONE — v3.4.4, JPA, Security, Validation |
| PostgreSQL | No (not in README) | N/A | DONE — v16, running via Homebrew |
| React + Vite | No (not in README) | N/A | DONE |
| Google Gemini API | Yes | PARTIAL | NOT USED |
| Hugging Face / NLTK | Yes | NOT USED | NOT USED |
| Google Cloud Vision API | Yes | NOT USED | NOT USED |
| Mapbox / Google Maps | Yes | NOT USED | NOT USED |
| WebRTC | Yes | NOT USED | NOT USED |
| jsPDF / html2canvas | No | DONE (old app) | NOT PORTED |

---

## Summary Scorecard

| Category | Done | Partial | Not Done | Total |
|---|---|---|---|---|
| Process Flow (9 items) | 5 | 2 | 2 | 9 |
| Basic Features (7 items) | 3 | 2 | 2 | 7 |
| Advanced Features (7 items) | 0 | 0 | 7 | 7 |
| **Total** | **8** | **4** | **11** | **23** |

> Score is similar to old app because no new advanced features were added during migration — focus was on porting existing functionality to a proper backend.

---

## Critical Gaps to Address Next

> [!CAUTION]
> **Export (PDF/scrapbook)** is a fully-built 1363-line feature in the old app that has **not been ported at all**. High user value, low complexity to port.

> [!CAUTION]
> **Notification triggers** are missing — the `NotificationService` can read/mark/delete, but nothing ever *creates* a notification. Friend accept, story share events should fire notifications but currently don't.

> [!WARNING]
> **Story Edit UI** is absent — the `Edit` icon is imported in [StoryView.jsx](file:///Users/yashwardhan61/Desktop/Code_Frolics/frontend/src/pages/StoryView.jsx) but never wired up. Backend `StoryController` has no `PUT /stories/{id}` endpoint either.

> [!WARNING]
> **Audio upload** is stripped — old app accepted audio media. New `StoryCreate.jsx` only accepts `image/*,video/*`.

> [!WARNING]
> **Search** has no implementation on either frontend or backend. No search endpoint exists in Spring Boot.

> [!WARNING]
> **Firebase service account** (`FIREBASE_SERVICE_ACCOUNT` env var) must be set for the backend to validate tokens in production. Without it the backend starts but auth will fail.

> [!IMPORTANT]
> **All 7 Advanced Features remain unimplemented** — AI prompts, geo-map, time capsules, translation, collaborative editing, cross-generational matching. These are the differentiating features of the product.
