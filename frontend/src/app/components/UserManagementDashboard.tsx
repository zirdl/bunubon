import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCircle, Search, Save, X, Eye, EyeOff, ShieldAlert, Ban, RotateCcw } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' | string;
  email: string;
  contactNumber: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  mustChangePassword: boolean;
}

interface UserFormData {
  id?: string;
  username: string;
  fullName: string;
  password?: string;
  confirmPassword?: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  email: string;
  contactNumber: string;
  status: 'ACTIVE' | 'DEACTIVATED';
}

export function UserManagementDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: '',
    username: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    role: 'EDITOR',
    email: '',
    contactNumber: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setFormError(null);
    setFormData({
      username: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      role: 'EDITOR',
      email: '',
      contactNumber: '',
      status: 'ACTIVE'
    });
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setFormError(null);
    setFormData({
      id: user.id,
      username: user.username,
      fullName: user.fullName || '',
      role: user.role as 'ADMIN' | 'EDITOR' | 'VIEWER',
      email: user.email || '',
      contactNumber: user.contactNumber || '',
      status: user.status as 'ACTIVE' | 'DEACTIVATED'
    });
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeactivateUser = async (user: User) => {
    if (user.username === 'admin') {
      alert('Cannot deactivate the root admin user');
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate ${user.username}?`)) {
      try {
        const response = await apiFetch(`/users/${user.id}/deactivate`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to deactivate user');
        }

        setUsers(users.map(u => u.id === user.id ? { ...u, status: 'DEACTIVATED' } : u));
      } catch (err) {
        console.error('Error deactivating user:', err);
      }
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (username === 'admin') {
      alert('Cannot delete the root admin user');
      return;
    }

    if (window.confirm('Are you sure you want to PERMANENTLY delete this user? This will remove their record but keep audit logs.')) {
      try {
        const response = await apiFetch(`/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        setError('Failed to delete user. Please try again.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setResetPasswordData({
      userId: user.id,
      username: user.username,
      newPassword: '',
      confirmPassword: ''
    });
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const response = await apiFetch(`/users/${resetPasswordData.userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: resetPasswordData.newPassword }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      alert('Password reset successful. User will be forced to change it on next login.');
      setShowResetPasswordModal(false);
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingUser && formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      if (editingUser) {
        const response = await apiFetch(`/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            username: formData.username,
            fullName: formData.fullName,
            role: formData.role,
            email: formData.email,
            contactNumber: formData.contactNumber,
            status: formData.status
          }),
        });

        if (!response.ok) throw new Error('Failed to update user');
      } else {
        const response = await apiFetch(`/users`, {
          method: 'POST',
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            role: formData.role,
            fullName: formData.fullName,
            email: formData.email,
            contactNumber: formData.contactNumber
          }),
        });

        if (!response.ok) throw new Error('Failed to create user');
      }

      fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (err: any) {
      setFormError(err.message || 'Action failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-[95%] mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system access, roles, and administrative controls.</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create New User</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.username}</div>
                          <div className="text-xs text-gray-500">{user.fullName || 'No Name Set'}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        user.role === 'EDITOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className={`text-xs font-semibold ${user.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'}`}>
                          {user.status}
                        </span>
                        {user.mustChangePassword && (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 ml-1" title="Password reset required" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      -
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end transition-opacity">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPasswordClick(user)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                          title="Reset Password"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleDeactivateUser(user)}
                            className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                            title="Deactivate"
                            disabled={user.username === 'admin'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                           <button
                           onClick={() => {}} // Reactivate logic
                           className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                           title="Reactivate"
                         >
                           <RotateCcw className="w-4 h-4" />
                         </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="Delete Permanently"
                          disabled={user.username === 'admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Form Modal */}
        {showUserForm && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100">
              <div className="flex justify-between items-center border-b p-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingUser ? 'Edit System User' : 'Create New Account'}
                  </h2>
                  <p className="text-sm text-gray-500">{editingUser ? `Updating ${editingUser.username}` : 'Assign roles and permissions'}</p>
                </div>
                <button onClick={() => setShowUserForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {!editingUser && (
                    <>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Confirm</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">System Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="EDITOR">LTS Staff (Editor)</option>
                      <option value="VIEWER">Read-Only Viewer</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Account Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DEACTIVATED">Deactivated</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <div className="mt-5 p-3.5 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                    <ShieldAlert className="w-5 h-5" />
                    {formError}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-4 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingUser ? 'Update Profile' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100">
              <div className="p-6 border-b text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-sm text-gray-500 mt-1">Force a password change for <b>{resetPasswordData.username}</b></p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Temporary Password</label>
                    <input
                      type="password"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                  >
                    Confirm Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
