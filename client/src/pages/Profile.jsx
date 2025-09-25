import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import ChangePasswordModal from "../components/profile/ChangePasswordModal.jsx";
import api from "../api/http.js";
import { useToast } from "../components/ui/ToastProvider.jsx";
import { prepareAvatar } from "../utils/image.js";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // 2FA removed per request
  
  // Profile form & avatar state
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user?.name) setProfileForm(prev => ({ ...prev, name: user.name }));
    if (user?.avatar) setAvatarPreview(user.avatar);
  }, [user]);

  const { push } = useToast();
  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => {
      // Optimistically update local auth cache
      queryClient.setQueryData(['auth','me'], (old) => {
        if (!old) return old;
        const userData = old.user || old;
        const updated = { ...userData, name: data.user?.name || data.name || profileForm.name, avatar: data.user?.avatar || data.avatar || userData.avatar };
        if (old.user) return { ...old, user: updated };
        return updated;
      });
      push({ type: 'success', title: 'Profile Updated', message: 'Your changes have been saved.' });
    },
    onError: (error) => {
      push({ type: 'error', title: 'Update Failed', message: error.message || 'Could not update profile.' });
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (profileForm.name.trim().length < 1 || profileForm.name.trim().length > 100) {
      push({ type: 'warning', title: 'Invalid Name', message: 'Name must be 1-100 characters long.' });
      return;
    }
    updateProfileMutation.mutate({ name: profileForm.name.trim() });
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    try {
      setAvatarUploading(true);
      const dataUrl = await prepareAvatar(file);
      setAvatarPreview(dataUrl);
      setAvatarDirty(true);
      // Auto-upload avatar when selected
      const res = await api.updateProfile({ avatar: dataUrl });
      queryClient.setQueryData(['auth','me'], (old) => {
        if (!old) return old;
        const userData = old.user || old;
        const updated = { ...userData, avatar: res.user?.avatar || dataUrl };
        if (old.user) return { ...old, user: updated };
        return updated;
      });
      updateUser({ avatar: res.user?.avatar || dataUrl });
      push({ type: 'success', title: 'Avatar Updated', message: 'Your profile picture has been saved.' });
      setAvatarDirty(false);
    } catch (err) {
      setAvatarError(err.message || 'Failed to process image');
      push({ type: 'error', title: 'Avatar Error', message: err.message || 'Could not update avatar.' });
    } finally {
      setAvatarUploading(false);
      // reset file input value to allow re-selecting same file
      e.target.value = '';
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

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
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-teal-500/30 shadow-md"
                draggable={false}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-2xl font-semibold flex items-center justify-center shadow-lg select-none">
                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-teal-300 bg-white text-teal-600 shadow-sm hover:bg-teal-50 hover:text-teal-700 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              {avatarUploading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-600" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M4 3a2 2 0 00-2 2v9.5A2.5 2.5 0 004.5 17H9a1 1 0 100-2H4.5a.5.5 0 01-.5-.5V5a1 1 0 011-1h3.382a1 1 0 01.894.553l.724 1.447A2 2 0 0012.382 7H15a1 1 0 011 1v2a1 1 0 102 0V8a3 3 0 00-3-3h-2.618a1 1 0 01-.894-.553l-.724-1.447A2 2 0 008.382 2H5a2 2 0 00-2 2z" />
                  <path d="M16.707 12.293a1 1 0 00-1.414 0L13 14.586V13a1 1 0 10-2 0v4a1 1 0 001 1h4a1 1 0 100-2h-1.586l2.293-2.293a1 1 0 000-1.414z" />
                </svg>
              )}
            </label>
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
              {avatarError && (
                <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700">{avatarError}</div>
              )}
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
                className="relative w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors duration-200 disabled:opacity-70"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <span className="absolute left-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
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
            
            {/* Two-Factor Authentication removed */}

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
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout from all devices?"
        message="This will sign you out of your current session."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          try {
            await logout();
            navigate('/login');
          } catch (err) {
            // ignore for now
          } finally {
            setShowLogoutConfirm(false);
          }
        }}
      />
      {/* 2FA modal removed */}
    </div>
  );
}