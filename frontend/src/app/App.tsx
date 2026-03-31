import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { Sidebar } from './components/Sidebar';
import { apiFetch } from './utils/api';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const TitlesPage = lazy(() => import('./components/TitlesPage').then(module => ({ default: module.TitlesPage })));
const UserManagement = lazy(() => import('./components/UserManagementDashboard').then(module => ({ default: module.UserManagementDashboard })));
const AuditLogViewer = lazy(() => import('./components/AuditLogViewer').then(module => ({ default: module.AuditLogViewer })));
const ExportData = lazy(() => import('./components/ExportData').then(module => ({ default: module.ExportData })));
const BackupRestore = lazy(() => import('./components/BackupRestore').then(module => ({ default: module.BackupRestore })));
const TitlesList = lazy(() => import('./components/TitlesList').then(module => ({ default: module.TitlesList })));
const UserProfile = lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const HelpPage = lazy(() => import('./components/HelpPage').then(module => ({ default: module.HelpPage })));
import { ForcePasswordChange } from './components/ForcePasswordChange';

const API_BASE_URL = '/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiFetch('/profile');
        if (response.ok) {
          const user = await response.json();
          setUsername(user.username);
          setRole(user.role);
          setMustChangePassword(user.mustChangePassword);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Session expired or invalid - clear stored data
          console.log('Session expired or invalid, clearing stored credentials');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentRole');
          
          // If we're not on the login page, redirect there
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
        } else if (response.status === 429) {
          // Rate limited - this shouldn't happen for /profile in development
          console.error('Rate limited during session check. This is a bug.');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentRole');
        } else {
          // Other errors - only log if not a first-load 401
          if (response.status !== 401 || isAuthenticated) {
            console.error('Session check failed with status:', response.status);
          }
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentRole');
        }
      } catch (err) {
        // Network error or server down - clear stored data
        // Only log if user was previously authenticated
        if (isAuthenticated) {
          console.error('Session check failed:', err);
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = data.retryAfter ? new Date(data.retryAfter).toLocaleTimeString() : 'a few minutes';
          return { 
            success: false, 
            message: `Too many login attempts. Please wait until ${retryAfter} or contact support.` 
          };
        }
        // Handle HTTP error status codes
        if (response.status === 403) {
          return { 
            success: false, 
            message: data.message || 'Your account has been deactivated. Contact an administrator.' 
          };
        }
        if (response.status === 400) {
          return { 
            success: false, 
            message: data.message || 'Invalid request. Please try again.' 
          };
        }
        if (response.status === 500) {
          return { 
            success: false, 
            message: 'Server error. Please try again later or contact support.' 
          };
        }
      }

      if (data.success) {
        setUsername(username);
        setRole(data.user.role);
        setMustChangePassword(data.user.mustChangePassword);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', username);
        localStorage.setItem('currentRole', data.user.role);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed. Please check your credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Unable to connect to the server. Please ensure the backend is running and try again.' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsAuthenticated(false);
      setUsername('');
      setRole('');
      setMustChangePassword(false);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentRole');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-emerald-700 font-bold tracking-tight">LTTS: Authenticating...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && mustChangePassword) {
    return (
      <ForcePasswordChange 
        username={username} 
        onPasswordChanged={() => setMustChangePassword(false)} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewTitles = (municipalityId: string, municipalityName: string) => {
    navigate(`/titles/${municipalityId}`);
  };

  return (
    <div className="flex min-h-screen bg-emerald-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown on md+ screens */}
      {/* Mobile: Slide-in menu */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          onCollapse={setSidebarCollapsed}
          userRole={userRole}
        />
      </div>
      
      {/* Desktop: Static sidebar that pushes content */}
      <div className="hidden md:block">
        <Sidebar
          onCollapse={setSidebarCollapsed}
          userRole={userRole}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-30">
          <div className="max-w-[95%] mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-emerald-600 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
                <img
                  src="/dar-logo.png"
                  alt="DAR Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
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
              <div 
                className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/profile')}
              >
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
              <Route path="/audit-logs" element={
                <AuditLogViewer />
              } />
              <Route path="/export" element={
                <ExportData />
              } />
              <Route path="/backup" element={
                <BackupRestore />
              } />
              <Route path="/profile" element={
                <UserProfile />
              } />
              <Route path="/help" element={
                <HelpPage userRole={userRole} />
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
      apiFetch(`/municipalities/${municipalityId}`)
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