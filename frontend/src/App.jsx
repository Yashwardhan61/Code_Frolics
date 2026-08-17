import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import MemberPortal from './pages/MemberPortal';
import Profile from './pages/Profile';
import FamilyTree from './pages/FamilyTree';
import Friends from './pages/Friends';
import StoryCreate from './pages/StoryCreate';
import StoryView from './pages/StoryView';
import StoryEdit from './pages/StoryEdit';
import Heritage from './pages/Heritage';
import RecipeCreate from './pages/RecipeCreate';
import RecipeView from './pages/RecipeView';
import HeirloomCreate from './pages/HeirloomCreate';
import HeirloomView from './pages/HeirloomView';
import AdminPanel from './pages/AdminPanel';
import Gallery from './pages/Gallery';
import Welcome from './pages/Welcome';
import About from './pages/About';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import ResetPassword from './pages/ResetPassword';
import ScrapbookList from './pages/ScrapbookList';
import ScrapbookEditor from './pages/ScrapbookEditor';
import ScrapbookScanner from './pages/ScrapbookScanner';

function App() {
  return (
    <AuthProvider>
      <Router>
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
