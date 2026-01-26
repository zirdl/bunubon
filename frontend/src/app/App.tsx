import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { Sidebar } from './components/Sidebar';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const TitlesPage = lazy(() => import('./components/TitlesPage').then(module => ({ default: module.TitlesPage })));
const UserManagement = lazy(() => import('./components/UserManagement').then(module => ({ default: module.UserManagement })));
const ExportData = lazy(() => import('./components/ExportData').then(module => ({ default: module.ExportData })));
const BackupRestore = lazy(() => import('./components/BackupRestore').then(module => ({ default: module.BackupRestore })));
const TitlesList = lazy(() => import('./components/TitlesList').then(module => ({ default: module.TitlesList })));

// Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = '/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    if (savedUser) {
      setUsername(savedUser);
      setRole(savedRole || '');
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUsername(username);
        setRole(data.user.role);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', username);
        localStorage.setItem('currentRole', data.user.role);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const handleSignUp = async (username: string, password: string, fullName: string, email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: 'Viewer', // Default role for new users
          fullName,
          email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Account created successfully' };
      } else {
        return { success: false, message: data.error || 'Sign up failed' };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setRole('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-emerald-700 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} onSignUp={() => navigate('/signup')} />
      } />
      <Route path="/signup" element={
        isAuthenticated ? <Navigate to="/" replace /> : <SignUpPage onSignUp={handleSignUp} onBackToLogin={() => navigate('/login')} />
      } />
      
      {/* Protected Routes */}
      <Route path="/*" element={
        isAuthenticated ? (
          <AuthenticatedLayout 
            username={username} 
            userRole={role}
            onLogout={handleLogout} 
            sidebarCollapsed={sidebarCollapsed} 
            setSidebarCollapsed={setSidebarCollapsed}
          />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
    </Routes>
  );
}

interface AuthenticatedLayoutProps {
  username: string;
  userRole: string;
  onLogout: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

function AuthenticatedLayout({ username, userRole, onLogout, sidebarCollapsed, setSidebarCollapsed }: AuthenticatedLayoutProps) {
  const navigate = useNavigate();

  const handleViewTitles = (municipalityId: string, municipalityName: string) => {
    navigate(`/titles/${municipalityId}`);
  };

  return (
    <div className="flex min-h-screen bg-emerald-50">
      <Sidebar
        onCollapse={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-20">
          <div className="max-w-[95%] mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                <img
                  src="/dar-logo.png"
                  alt="DAR Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">
                  Department of Agrarian Reform
                </h1>
                <p className="text-xs text-emerald-50 opacity-90">
                  Provincial Office - La Union | Land Title Tracking System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-emerald-100 uppercase tracking-wider">Logged in as</p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-sm font-medium text-white">{username}</p>
                  <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-100 border border-emerald-600">{userRole}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm text-sm font-medium"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Suspense fallback={
            <div className="flex h-full items-center justify-center bg-emerald-50/30">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                <p className="text-sm font-medium text-emerald-700">Loading page...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={
                 <Dashboard username={username} userRole={userRole} onLogout={onLogout} onViewTitles={handleViewTitles} />
              } />
              <Route path="/titles" element={
                <TitlesPage userRole={userRole} onViewTitles={handleViewTitles} />
              } />
              <Route path="/titles/:municipalityId" element={
                 <TitlesListWrapper userRole={userRole} />
              } />
              <Route path="/users" element={
                <UserManagement />
              } />
              <Route path="/export" element={
                <ExportData />
              } />
              <Route path="/backup" element={
                <BackupRestore />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Wrapper to handle params for TitlesList
import { useParams } from 'react-router-dom';
function TitlesListWrapper({ userRole }: { userRole: string }) {
  const { municipalityId } = useParams();
  const [municipalityName, setMunicipalityName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (municipalityId) {
      fetch(`${API_BASE_URL}/municipalities/${municipalityId}`)
        .then(res => res.json())
        .then(data => setMunicipalityName(data.name))
        .catch(err => console.error(err));
    }
  }, [municipalityId]);

  return (
    municipalityId ? (
      <TitlesList
        municipalityId={municipalityId}
        municipalityName={municipalityName}
        userRole={userRole}
        onBack={() => navigate('/titles')}
      />
    ) : null
  );
}