import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import HourglassLoader from './components/HourglassLoader';

// Layouts (eagerly loaded as base shells)
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Lazy Loaded Pages for Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const MemberPortal = lazy(() => import('./pages/MemberPortal'));
const Profile = lazy(() => import('./pages/Profile'));
const FamilyTree = lazy(() => import('./pages/FamilyTree'));
const Friends = lazy(() => import('./pages/Friends'));
const StoryCreate = lazy(() => import('./pages/StoryCreate'));
const StoryView = lazy(() => import('./pages/StoryView'));
const StoryEdit = lazy(() => import('./pages/StoryEdit'));
const Heritage = lazy(() => import('./pages/Heritage'));
const RecipeCreate = lazy(() => import('./pages/RecipeCreate'));
const RecipeView = lazy(() => import('./pages/RecipeView'));
const HeirloomCreate = lazy(() => import('./pages/HeirloomCreate'));
const HeirloomView = lazy(() => import('./pages/HeirloomView'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Welcome = lazy(() => import('./pages/Welcome'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ScrapbookList = lazy(() => import('./pages/ScrapbookList'));
const ScrapbookEditor = lazy(() => import('./pages/ScrapbookEditor'));
const ScrapbookScanner = lazy(() => import('./pages/ScrapbookScanner'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
              <HourglassLoader size="large" text="Opening memory chest..." />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected Routes */}
              <Route element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/member/:id/stories" element={<MemberPortal />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/family-tree" element={<FamilyTree />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/story/create" element={<StoryCreate />} />
                <Route path="/story/:id" element={<StoryView />} />
                <Route path="/story/:id/edit" element={<StoryEdit />} />
                <Route path="/heritage" element={<Heritage />} />
                <Route path="/recipe/create" element={<RecipeCreate />} />
                <Route path="/recipe/:id" element={<RecipeView />} />
                <Route path="/heirloom/create" element={<HeirloomCreate />} />
                <Route path="/heirloom/:id" element={<HeirloomView />} />
                <Route path="/scrapbooks" element={<ScrapbookList />} />
                <Route path="/scrapbook/create" element={<ScrapbookEditor />} />
                <Route path="/scrapbook/edit/:id" element={<ScrapbookEditor />} />
                <Route path="/scrapbook/scanner" element={<ScrapbookScanner />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
              </Route>

              {/* 404 Dedicated Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
