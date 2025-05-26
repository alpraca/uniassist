import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Landing from './pages/Landing';
import Universities from './pages/Universities';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Mentors from './pages/Mentors';
import Roommates from './pages/Roommates';
import AcademicProfile from './pages/AcademicProfile';
import ApplicationPrep from './pages/ApplicationPrep';
import Navbar from './components/common/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth/signin" />;
  }

  return children;
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
                <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/universities" element={
          <ProtectedRoute>
            <Universities />
          </ProtectedRoute>
        } />

        <Route path="/application-prep" element={
          <ProtectedRoute>
            <ApplicationPrep />
          </ProtectedRoute>
        } />
        
        <Route path="/mentors" element={
          <ProtectedRoute>
            <Mentors />
          </ProtectedRoute>
        } />
        
        <Route path="/roommates" element={
          <ProtectedRoute>
            <Roommates />
          </ProtectedRoute>
        } />

        <Route path="/academic-profile" element={
          <ProtectedRoute>
            <AcademicProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/onboarding/*" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
