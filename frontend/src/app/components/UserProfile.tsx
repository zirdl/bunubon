import { useState, useEffect } from 'react';
import { UserCircle, Save, X, Eye, EyeOff, ShieldCheck, Phone, Mail, Key, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface UserProfileData {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email: string;
  contactNumber: string;
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: '' // Required for profile update verification
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPass, setShowPass] = useState({
    verify: false,
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/profile');
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        contactNumber: data.contactNumber || '',
        password: ''
      });
    } catch (err) {
      console.error(err);
      setError('Could not load your profile information.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully.');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await apiFetch('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully.');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 px-8 py-12 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-inner">
                <UserCircle className="w-16 h-16 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile?.fullName || profile?.username}</h1>
                <p className="text-emerald-100 mt-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  System {profile?.role}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                <X className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sidebar Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Security</h3>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-700 border border-gray-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold">Change Password</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest mb-3">Permissions</h3>
                  <ul className="space-y-2">
                    {profile?.role === 'ADMIN' ? (
                      <>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ Full System Access</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ User Management</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ Audit Logs</li>
                      </>
                    ) : profile?.role === 'EDITOR' ? (
                      <>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ Manage Titles</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ Bulk Import/Export</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✕ User Management</li>
                      </>
                    ) : (
                      <>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ View Dashboards</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✓ Search Records</li>
                        <li className="text-xs text-emerald-700 flex items-center gap-2">✕ Modify Data</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm font-bold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
                      <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium flex items-center gap-3">
                        <UserCircle className="w-4 h-4" />
                        {profile?.username}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contact Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          disabled={!isEditing}
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Current Password Required</label>
                        <div className="relative">
                          <input
                            type={showPass.verify ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Enter password to confirm changes"
                            className="w-full px-4 py-3 bg-white border-2 border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass({...showPass, verify: !showPass.verify})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                          >
                            {showPass.verify ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              fullName: profile?.fullName || '',
                              email: profile?.email || '',
                              contactNumber: profile?.contactNumber || '',
                              password: ''
                            });
                          }}
                          className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Change Your Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPass.current ? "text" : "password"}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({...showPass, current: !showPass.current})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPass.new ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({...showPass, new: !showPass.new})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPass.confirm ? "text" : "password"}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-md transition-all active:scale-95"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
