import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { TitlesList } from './components/TitlesList';
import { UserManagement } from './components/UserManagement';
import { ExportData } from './components/ExportData';
import { BackupRestore } from './components/BackupRestore';

type Page = 'dashboard' | 'users' | 'export' | 'backup';

interface TitlesView {
  municipalityId: string;
  municipalityName: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [titlesView, setTitlesView] = useState<TitlesView | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Use relative path to ensure it works when accessed from any device on the network
const API_BASE_URL = '/api';

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUsername(savedUser);
      setIsAuthenticated(true);
    }
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
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', username);
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
          role: 'user', // Default role for new users
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
    localStorage.removeItem('currentUser');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setTitlesView(null);
  };

  const handleViewTitles = (municipalityId: string, municipalityName: string) => {
    setTitlesView({ municipalityId, municipalityName });
  };

  const handleBackToDashboard = () => {
    setTitlesView(null);
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    if (showSignUp) {
      return <SignUpPage onSignUp={handleSignUp} onBackToLogin={() => setShowSignUp(false)} />;
    } else {
      return <LoginPage onLogin={handleLogin} onSignUp={() => setShowSignUp(true)} />;
    }
  }

  // Render titles view
  if (titlesView) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
            <div className="px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
              <h1 className="text-xl">Department of Agrarian Reform - La Union</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-md text-sm"
              >
                Logout
              </button>
            </div>
          </header>
          <TitlesList
            municipalityId={titlesView.municipalityId}
            municipalityName={titlesView.municipalityName}
            onBack={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Render main application with sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onCollapse={setSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {currentPage === 'dashboard' && (
          <Dashboard username={username} onLogout={handleLogout} onViewTitles={handleViewTitles} />
        )}
        {currentPage === 'users' && (
          <>
            <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
              <div className="px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
                <h1 className="text-xl">Department of Agrarian Reform - La Union</h1>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-md text-sm"
                >
                  Logout
                </button>
              </div>
            </header>
            <UserManagement />
          </>
        )}
        {currentPage === 'export' && (
          <>
            <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
              <div className="px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
                <h1 className="text-xl">Department of Agrarian Reform - La Union</h1>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-md text-sm"
                >
                  Logout
                </button>
              </div>
            </header>
            <ExportData />
          </>
        )}
        {currentPage === 'backup' && (
          <>
            <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
              <div className="px-4 py-5 sm:px-6 lg:px-8 flex items-center justify-between">
                <h1 className="text-xl">Department of Agrarian Reform - La Union</h1>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-md text-sm"
                >
                  Logout
                </button>
              </div>
            </header>
            <BackupRestore />
          </>
        )}
      </div>
    </div>
  );
}