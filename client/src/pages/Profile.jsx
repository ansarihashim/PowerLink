import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ChangePasswordModal from "../components/profile/ChangePasswordModal.jsx";
import TwoFactorModal from "../components/profile/TwoFactorModal.jsx";
import api from "../api/http.js";

export default function Profile() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || ''
  });

  // Update form when user data changes
  useEffect(() => {
    if (user?.name) {
      setProfileForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error) => {
      alert(error.response?.message || 'Failed to update profile');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (profileForm.name.trim().length < 1 || profileForm.name.trim().length > 100) {
      alert('Name must be between 1 and 100 characters');
      return;
    }
    updateProfileMutation.mutate({ name: profileForm.name.trim() });
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-slate-500">
          <div className="text-lg font-medium mb-2">Loading profile...</div>
          <div className="text-sm">Please wait while we fetch your information</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded bg-teal-500" />
        <h2 className="text-xl font-semibold text-slate-900">Profile Settings</h2>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-2xl font-semibold flex items-center justify-center shadow-lg">
            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{user.name || 'User'}</h3>
            <p className="text-slate-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                {user.role || 'User'}
              </span>
              <span className="text-xs text-slate-500">
                Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profile Information', icon: '👤' },
            { id: 'security', label: 'Security', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="text-lg font-medium text-slate-900 mb-4">Personal Information</h4>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your full name"
                  disabled={updateProfileMutation.isPending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                  readOnly
                />
                <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <input
                  type="text"
                  value={user.role || 'User'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500"
                  readOnly
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200" 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h4 className="text-lg font-medium text-slate-900 mb-4">Account Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Account Created</span>
                <span className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Last Login</span>
                <span className="font-medium">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Account Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-slate-900 mb-4">Security Settings</h4>
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900">Password</h5>
                  <p className="text-sm text-slate-600">Change your account password</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(true)}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 transition-colors duration-200"
                >
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900">Two-Factor Authentication</h5>
                  <p className="text-sm text-slate-600">
                    {user.twoFactorEnabled 
                      ? 'Two-factor authentication is enabled' 
                      : 'Add an extra layer of security to your account'
                    }
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowTwoFactorModal(true)}
                  className={`transition-colors duration-200 ${
                    user.twoFactorEnabled
                      ? 'border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
                      : 'border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400'
                  }`}
                >
                  {user.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </Button>
              </div>
            </div>

            <div className="border border-rose-200 rounded-lg p-4 bg-rose-50 hover:bg-rose-100 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-rose-900">Logout from all devices</h5>
                  <p className="text-sm text-rose-700">Sign out from all browsers and devices</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-rose-300 text-rose-700 hover:bg-rose-200 hover:border-rose-400 transition-colors duration-200" 
                  onClick={handleLogout}
                >
                  Logout All
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      <TwoFactorModal 
        isOpen={showTwoFactorModal} 
        onClose={() => setShowTwoFactorModal(false)} 
      />
    </div>
  );
}