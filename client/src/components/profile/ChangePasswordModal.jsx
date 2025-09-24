import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../api/http.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { useToast } from "../ui/ToastProvider.jsx";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  const { push } = useToast();
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => api.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      push({ type: 'success', title: 'Password Changed', message: 'For security you will be logged out now.' });
      // Force logout so tokens (invalidated server-side) are cleared
      logout();
      onClose();
    },
    onError: (error) => {
      setErrors({ submit: error.message });
      push({ type: 'error', title: 'Change Failed', message: error.message || 'Could not change password.' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200">
            <div className="text-sm text-rose-800">{errors.submit}</div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={handleChange("currentPassword")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.currentPassword ? "border-rose-500" : "border-slate-300"
            }`}
            placeholder="Enter your current password"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-rose-600">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={handleChange("newPassword")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.newPassword ? "border-rose-500" : "border-slate-300"
            }`}
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-rose-600">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              errors.confirmPassword ? "border-rose-500" : "border-slate-300"
            }`}
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex-1"
          >
            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}