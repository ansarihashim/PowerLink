import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/http.js";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

export default function TwoFactorModal({ isOpen, onClose, user }) {
  const [step, setStep] = useState(1); // 1: Setup, 2: QR Code, 3: Verify
  const [qrData, setQrData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableForm, setDisableForm] = useState({ password: "", token: "" });
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const enable2FAMutation = useMutation({
    mutationFn: () => api.auth.enable2FA(),
    onSuccess: (data) => {
      setQrData(data);
      setStep(2);
      setError("");
    },
    onError: (err) => setError(err.message)
  });

  const verify2FAMutation = useMutation({
    mutationFn: (token) => api.auth.verify2FA(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      alert("2FA enabled successfully!");
      handleClose();
    },
    onError: (err) => setError(err.message)
  });

  const disable2FAMutation = useMutation({
    mutationFn: ({ password, token }) => api.auth.disable2FA(password, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      alert("2FA disabled successfully!");
      handleClose();
    },
    onError: (err) => setError(err.message)
  });

  const handleClose = () => {
    setStep(1);
    setQrData(null);
    setVerificationCode("");
    setDisableForm({ password: "", token: "" });
    setError("");
    onClose();
  };

  const handleEnable = () => {
    setError("");
    enable2FAMutation.mutate();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }
    verify2FAMutation.mutate(verificationCode);
  };

  const handleDisable = (e) => {
    e.preventDefault();
    if (!disableForm.password) {
      setError("Password is required");
      return;
    }
    if (!disableForm.token) {
      setError("2FA code is required");
      return;
    }
    disable2FAMutation.mutate(disableForm);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!user) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={user.twoFactorEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
      size="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200">
          <div className="text-sm text-rose-800">{error}</div>
        </div>
      )}

      {/* Disable 2FA */}
      {user.twoFactorEnabled && (
        <form onSubmit={handleDisable} className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-amber-800">Warning</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Disabling 2FA will make your account less secure. You'll need to provide your password and current 2FA code.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={disableForm.password}
              onChange={(e) => setDisableForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              2FA Code
            </label>
            <input
              type="text"
              value={disableForm.token}
              onChange={(e) => setDisableForm(prev => ({ ...prev, token: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your 6-digit code"
              maxLength={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={disable2FAMutation.isPending}
              className="flex-1 bg-rose-600 hover:bg-rose-700"
            >
              {disable2FAMutation.isPending ? "Disabling..." : "Disable 2FA"}
            </Button>
          </div>
        </form>
      )}

      {/* Enable 2FA - Step 1: Introduction */}
      {!user.twoFactorEnabled && step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Secure Your Account</h3>
            <p className="text-sm text-slate-600">
              Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">You'll need:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                A smartphone or tablet
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                An authenticator app (Google Authenticator, Authy, etc.)
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleEnable} disabled={enable2FAMutation.isPending} className="flex-1">
              {enable2FAMutation.isPending ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {/* Enable 2FA - Step 2: QR Code */}
      {!user.twoFactorEnabled && step === 2 && qrData && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Scan QR Code</h3>
            <p className="text-sm text-slate-600 mb-4">
              Use your authenticator app to scan this QR code, or manually enter the secret key.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-slate-200 rounded-lg">
              <img src={qrData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">Manual Entry</h4>
                <p className="text-xs text-slate-600 font-mono break-all mt-1">{qrData.secret}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(qrData.secret)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-800 mb-2">Backup Codes</h4>
            <p className="text-xs text-amber-700 mb-2">
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
              {qrData.backupCodes?.map((code, i) => (
                <div key={i} className="bg-white px-2 py-1 rounded text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              I've Added the Account
            </Button>
          </div>
        </div>
      )}

      {/* Enable 2FA - Step 3: Verify */}
      {!user.twoFactorEnabled && step === 3 && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Verify Setup</h3>
            <p className="text-sm text-slate-600">
              Enter the 6-digit code from your authenticator app to complete the setup.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-lg font-mono tracking-wider"
              placeholder="000000"
              maxLength={6}
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
              Back
            </Button>
            <Button
              type="submit"
              disabled={verify2FAMutation.isPending || verificationCode.length !== 6}
              className="flex-1"
            >
              {verify2FAMutation.isPending ? "Verifying..." : "Enable 2FA"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}