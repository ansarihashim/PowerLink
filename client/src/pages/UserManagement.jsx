import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/http.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import { useToast } from '../components/ui/ToastProvider.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [permissions, setPermissions] = useState({
    canRead: true,
    canWrite: false,
    canDelete: false,
    canExport: false
  });
  const [selectedRole, setSelectedRole] = useState('viewer');

  useEffect(() => {
    if (user?.role !== 'admin') {
      push({ type: 'error', title: 'Access Denied', message: 'Admin access required' });
      navigate('/');
      return;
    }
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await api.admin.getAllUsers(filter);
      setUsers(result.users || []);
    } catch (err) {
      push({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, customPermissions = null, customRole = null) => {
    try {
      const perms = customPermissions || permissions;
      const role = customRole || selectedRole;
      await api.admin.approveUser(userId, perms, role);
      push({ type: 'success', title: 'User Approved', message: 'User has been approved and notified' });
      fetchUsers();
      setShowPermissionsModal(false);
    } catch (err) {
      push({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleReject = async () => {
    try {
      await api.admin.rejectUser(selectedUser._id, rejectReason);
      push({ type: 'success', title: 'User Rejected', message: 'User request has been rejected' });
      fetchUsers();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      push({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleDelete = async () => {
    try {
      await api.admin.deleteUser(selectedUser._id);
      push({ type: 'success', title: 'User Deleted', message: 'User has been removed' });
      fetchUsers();
      setShowDeleteConfirm(false);
    } catch (err) {
      push({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      await api.admin.updatePermissions(selectedUser._id, permissions, selectedRole);
      push({ type: 'success', title: 'Updated', message: 'User permissions updated' });
      fetchUsers();
      setShowPermissionsModal(false);
    } catch (err) {
      push({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const openPermissionsModal = (user) => {
    setSelectedUser(user);
    setPermissions(user.permissions || { canRead: true, canWrite: false, canDelete: false, canExport: false });
    setSelectedRole(user.role || 'viewer');
    setShowPermissionsModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-teal-100 text-teal-700',
      rejected: 'bg-rose-100 text-rose-700'
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded bg-teal-500" />
          <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="p-4">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-teal-500 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && users.filter(u => u.accountStatus === 'pending').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white text-teal-600">
                  {users.filter(u => u.accountStatus === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Users List */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No {filter !== 'all' ? filter : ''} users found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Permissions</th>
                <th className="px-4 py-3 text-left">Registered</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(u.accountStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.permissions?.canRead && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Read</span>}
                      {u.permissions?.canWrite && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Write</span>}
                      {u.permissions?.canDelete && <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">Delete</span>}
                      {u.permissions?.canExport && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Export</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.accountStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => openPermissionsModal(u)}
                            className="px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setSelectedUser(u); setShowRejectModal(true); }}
                            className="px-2 py-1 text-xs bg-rose-500 text-white rounded hover:bg-rose-600 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {u.accountStatus === 'approved' && (
                        <button
                          onClick={() => openPermissionsModal(u)}
                          className="px-2 py-1 text-xs bg-slate-500 text-white rounded hover:bg-slate-600 transition"
                        >
                          Edit
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => { setSelectedUser(u); setShowDeleteConfirm(true); }}
                          className="px-2 py-1 text-xs bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={selectedUser?.accountStatus === 'pending' ? 'Approve User' : 'Edit User Permissions'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
            <p className="text-sm text-slate-600">{selectedUser?.name} ({selectedUser?.email})</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
            >
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
            <div className="space-y-2">
              {[
                { key: 'canRead', label: 'Can Read', desc: 'View all data' },
                { key: 'canWrite', label: 'Can Write', desc: 'Create and edit records' },
                { key: 'canDelete', label: 'Can Delete', desc: 'Delete records' },
                { key: 'canExport', label: 'Can Export', desc: 'Export data to CSV' }
              ].map((perm) => (
                <label key={perm.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions[perm.key]}
                    onChange={(e) => setPermissions({ ...permissions, [perm.key]: e.target.checked })}
                    className="mt-0.5 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-700">{perm.label}</div>
                    <div className="text-xs text-slate-500">{perm.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Cancel
            </Button>
            <Button onClick={selectedUser?.accountStatus === 'pending' ? () => handleApprove(selectedUser._id) : handleUpdatePermissions}>
              {selectedUser?.accountStatus === 'pending' ? 'Approve User' : 'Update Permissions'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject User Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to reject <strong>{selectedUser?.name}</strong>'s request?
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-200"
              placeholder="Enter reason for rejection..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="bg-rose-500 text-white hover:bg-rose-600" onClick={handleReject}>
              Reject User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
