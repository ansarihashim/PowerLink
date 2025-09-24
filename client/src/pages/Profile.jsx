import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

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
            { id: 'security', label: 'Security', icon: '🔒' },
            { id: 'preferences', label: 'Preferences', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user.name || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  readOnly
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
              <Button className="w-full" disabled>
                Save Changes (Coming Soon)
              </Button>
            </div>
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
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900">Password</h5>
                  <p className="text-sm text-slate-600">Change your account password</p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900">Two-Factor Authentication</h5>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>
            </div>

            <div className="border border-rose-200 rounded-lg p-4 bg-rose-50">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-rose-900">Logout from all devices</h5>
                  <p className="text-sm text-rose-700">Sign out from all browsers and devices</p>
                </div>
                <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100" onClick={handleLogout}>
                  Logout All
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-slate-900 mb-4">Application Preferences</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <h5 className="font-medium text-slate-900">Theme</h5>
                <p className="text-sm text-slate-600">Choose your preferred theme</p>
              </div>
              <select className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" disabled>
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <h5 className="font-medium text-slate-900">Language</h5>
                <p className="text-sm text-slate-600">Select your preferred language</p>
              </div>
              <select className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" disabled>
                <option>English</option>
                <option>Hindi</option>
                <option>Gujarati</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h5 className="font-medium text-slate-900">Email Notifications</h5>
                <p className="text-sm text-slate-600">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}