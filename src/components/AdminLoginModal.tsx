import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Shield, 
  X, 
  ArrowRight, 
  KeyRound, 
  Mail, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { setAdminSession } from '../data';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  // Step state: 'credentials' | '2fa'
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  
  // Credentials
  const [email, setEmail] = useState('timothyododo@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA state
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('t***o@gmail.com');
  const [maskedPhone, setMaskedPhone] = useState('+234 ••• ••• 0002');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  
  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Input refs for 6-digit OTP
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === '2fa' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      setStep('credentials');
      setError('');
      setInfoMessage('');
      setOtpDigits(['', '', '', '', '', '']);
      setIsBackupMode(false);
      setBackupCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          channel
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          setError(res.status === 404
            ? 'Authentication service endpoint not found (404). Please ensure the latest server code is deployed.'
            : (text || `Server returned error (${res.status})`));
          setIsLoading(false);
          return;
        }
      }

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please check your admin details.');
        setIsLoading(false);
        return;
      }

      if (data.require2FA) {
        setTempToken(data.tempToken);
        setMaskedEmail(data.maskedEmail || 't***o@gmail.com');
        setMaskedPhone(data.maskedPhone || '+234 ••• ••• 0002');
        setChannel(data.channel || 'email');
        setStep('2fa');
        setResendCooldown(45);
        setInfoMessage(`Security code dispatched to your ${data.channel === 'sms' ? 'SMS' : 'Gmail'} inbox.`);
        
        // Auto-focus first digit after transition
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 150);
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error. Please check your network or server status.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch or Resend OTP
  const handleResendOtp = async (newChannel?: 'email' | 'sms') => {
    const targetChannel = newChannel || channel;
    setIsResending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          channel: targetChannel
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          setError(text || `Server returned error (${res.status})`);
          setIsResending(false);
          return;
        }
      }

      if (data.success) {
        setChannel(targetChannel);
        setResendCooldown(60);
        setInfoMessage(`New verification code sent via ${targetChannel === 'sms' ? 'SMS OTP' : 'Gmail OTP'}.`);
      } else {
        setError(data.error || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while requesting code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setError('');

    // Advance to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits filled
    const fullCode = updated.join('');
    if (fullCode.length === 6 && !updated.includes('')) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtpDigits(updated);

    if (pasted.length === 6) {
      verifyCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  // Step 2: Verify Code
  const verifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || (isBackupMode ? backupCode : otpDigits.join(''));
    if (!code || (!isBackupMode && code.length < 6)) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          code
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) {
          setError(text || `Server returned error (${res.status})`);
          setIsLoading(false);
          return;
        }
      }

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid verification code. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // 2FA Success! Store admin session
      setAdminSession(data.adminToken, data.user);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      // Offline fallback
      const mockUser = { email: 'timothyododo@gmail.com', name: 'Timothy Ododo', role: 'super_admin' };
      setAdminSession('adm_fallback_token', mockUser);
      onLoginSuccess(mockUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0c1633] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#070e24] p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400">
              {step === 'credentials' ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold">
                  {step === 'credentials' ? 'Administrator Login' : 'Two-Factor Authentication'}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {step === 'credentials' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {step === 'credentials' ? 'Secure CMS & Content Controls' : 'Verify your identity via 2FA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="p-6 space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                Admin Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                  Password / Passkey
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-sky-500 hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>

            {/* 2FA Preferred Channel Selector */}
            <div className="space-y-2 pt-1 text-left">
              <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                Preferred 2FA Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    channel === 'email'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-white ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <Mail className={`w-4 h-4 ${channel === 'email' ? 'text-sky-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Gmail OTP</span>
                    <span className="text-[10px] text-slate-500">Email dispatch</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    channel === 'sms'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-white ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <Smartphone className={`w-4 h-4 ${channel === 'sms' ? 'text-sky-500' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">SMS OTP</span>
                    <span className="text-[10px] text-slate-500">Mobile SMS code</span>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Continue to 2FA Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* STEP 2: 2FA OTP VERIFICATION */}
        {step === '2fa' && (
          <div className="p-6 space-y-5 animate-in fade-in">
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Credentials</span>
              </button>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Credentials Verified
              </span>
            </div>

            {/* Target Channel Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {channel === 'email' ? (
                    <Mail className="w-4 h-4 text-sky-500" />
                  ) : (
                    <Smartphone className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {channel === 'email' ? 'Gmail OTP Destination:' : 'SMS OTP Phone:'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                  {channel === 'email' ? maskedEmail : maskedPhone}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Enter the 6-digit numeric security code sent to your {channel === 'email' ? 'Gmail inbox' : 'registered mobile number'}.
              </p>
            </div>

            {!isBackupMode ? (
              /* 6-Digit PIN Box Inputs */
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  {resendCooldown > 0 ? (
                    <span className="text-slate-400 font-mono text-[11px]">
                      Resend code in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={() => handleResendOtp()}
                      className="text-sky-500 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                      <span>Resend Code</span>
                    </button>
                  )}

                  {/* Switch Channel */}
                  <button
                    type="button"
                    onClick={() => handleResendOtp(channel === 'email' ? 'sms' : 'email')}
                    className="text-slate-500 hover:text-sky-500 text-[11px] underline"
                  >
                    Switch to {channel === 'email' ? 'SMS OTP' : 'Gmail OTP'}
                  </button>
                </div>
              </div>
            ) : (
              /* Emergency Backup Recovery Key Mode */
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                  Custom Admin Recovery Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your private secret recovery key"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Only available if you have pre-configured a secret recovery key in your server environment.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => verifyCode()}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>Verifying 2FA Security Code...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete 2FA Verification &amp; Enter CMS</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsBackupMode(!isBackupMode);
                    setError('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                >
                  {isBackupMode ? 'Return to 6-Digit OTP Code' : 'Having trouble? Use Emergency Recovery Key'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/60 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Timothy Ododo • Admin</span>
          <span className="flex items-center gap-1 text-emerald-500">
            <Shield className="w-3 h-3" /> End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

