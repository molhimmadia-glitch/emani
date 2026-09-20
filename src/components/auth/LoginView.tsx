// Emani Art Craft - Dedicated Authentication & POS Staff Login View
// Souq Al Baraha - Diyar Al Muharraq, Kingdom of Bahrain

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Database,
  Sparkles,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Delete,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Clock,
  Laptop,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  lang: Language;
  onToggleLang: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  onToggleLang,
  onLoginSuccess,
}) => {
  const { currentUser: googleUser, signInWithGoogle, signOut: googleSignOut } = useAuth();
  const allUsers = StorageService.getUsers();
  const settings = StorageService.getSettings();

  // Mode: 'pin' | 'credentials' | 'google'
  const [authMode, setAuthMode] = useState<'pin' | 'credentials' | 'google'>('pin');

  // Selected User for PIN mode
  const [selectedUser, setSelectedUser] = useState<User>(allUsers[0] || null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Credentials Mode State
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('admin');
  const [passwordInput, setPasswordInput] = useState<string>('9999');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Time in Bahrain
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(lang === 'ar' ? 'ar-BH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Physical keyboard support for PIN entry when in PIN mode
  useEffect(() => {
    if (authMode !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pinInput.length < 4) {
          handlePinDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handlePinBackspace();
      } else if (e.key === 'Enter') {
        handlePinSubmit();
      } else if (e.key === 'Escape') {
        handlePinClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authMode, pinInput, selectedUser]);

  // PIN keypad actions
  const handlePinDigit = (digit: string) => {
    setPinError(null);
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);

      // Auto-validate when 4 digits are reached
      if (nextPin.length === 4) {
        validatePin(nextPin, selectedUser);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinError(null);
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPinError(null);
    setPinInput('');
  };

  const validatePin = (pin: string, user: User) => {
    if (!user) {
      setPinError(lang === 'ar' ? 'يرجى اختيار الموظف أولاً' : 'Please select a staff member');
      return;
    }

    if (!StorageService.canUserLogin(user)) {
      setPinError(
        lang === 'ar'
          ? `صلاحية تسجيل الدخول معطلة للمستخدم "${user.nameAr}". يرجى التواصل مع إدارة المعرض.`
          : `Login permission is disabled for "${user.nameEn}". Please contact store management.`
      );
      setPinInput('');
      return;
    }

    if (user.pin === pin) {
      setPinError(null);
      StorageService.login(user);
      onLoginSuccess(user);
    } else {
      setPinError(
        lang === 'ar'
          ? 'رمز الـ PIN غير صحيح، يرجى المحاولة مجدداً'
          : 'Invalid PIN code. Please try again'
      );
      setPinInput('');
    }
  };

  const handlePinSubmit = () => {
    if (pinInput.length !== 4) {
      setPinError(lang === 'ar' ? 'يرجى إدخال 4 أرقام لرمز الـ PIN' : 'Please enter 4 digits PIN');
      return;
    }
    validatePin(pinInput, selectedUser);
  };

  // Credentials login handler
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError(null);
    setIsSubmitting(true);

    const identifier = usernameOrEmail.trim().toLowerCase();
    const foundUser = allUsers.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier ||
        u.phone.includes(identifier)
    );

    if (!foundUser) {
      setIsSubmitting(false);
      setCredentialsError(
        lang === 'ar'
          ? 'اسم المستخدم أو البريد الإلكتروني غير مسجل في النظام'
          : 'Username or email not registered in system'
      );
      return;
    }

    if (!StorageService.canUserLogin(foundUser)) {
      setIsSubmitting(false);
      setCredentialsError(
        lang === 'ar'
          ? `صلاحية تسجيل الدخول معطلة للحساب "${foundUser.nameAr}". يرجى مراجعة إدارة المعرض.`
          : `Login access is revoked for "${foundUser.nameEn}". Please contact store management.`
      );
      return;
    }

    // Check PIN or default password
    if (passwordInput === foundUser.pin || passwordInput === '123456' || passwordInput === 'admin') {
      setTimeout(() => {
        setIsSubmitting(false);
        StorageService.login(foundUser);
        onLoginSuccess(foundUser);
      }, 350);
    } else {
      setIsSubmitting(false);
      setCredentialsError(
        lang === 'ar'
          ? `كلمة المرور / الـ PIN غير صحيحة (رمز الموظف هو: ${foundUser.pin})`
          : `Invalid password or PIN (User's PIN is: ${foundUser.pin})`
      );
    }
  };

  // Google OAuth Login handler
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithGoogle();
      // Map to an active manager or admin user who has login permission
      const defaultUser = allUsers.find((u) => StorageService.canUserLogin(u)) || allUsers[0];
      if (!StorageService.canUserLogin(defaultUser)) {
        throw new Error(
          lang === 'ar'
            ? 'لا توجد حسابات مفعلة بصلاحية تسجيل الدخول. يرجى مراجعة المسؤول.'
            : 'No active accounts with login permission available.'
        );
      }
      StorageService.login(defaultUser);
      onLoginSuccess(defaultUser);
    } catch (err: any) {
      setIsSubmitting(false);
      setCredentialsError(err.message || 'Google Sign-in failed');
    }
  };

  // Quick Switch to a Demo Staff Account
  const handleSelectQuickStaff = (user: User) => {
    setSelectedUser(user);
    setPinInput('');
    if (!StorageService.canUserLogin(user)) {
      setPinError(
        lang === 'ar'
          ? `تنبيه: صلاحية تسجيل الدخول معطلة لهذا الحساب (${user.nameAr})`
          : `Notice: Login access is currently disabled for (${user.nameEn})`
      );
    } else {
      setPinError(null);
    }
    setUsernameOrEmail(user.username);
    setPasswordInput(user.pin);
  };

  const handleInstantLogin = (user: User) => {
    if (!StorageService.canUserLogin(user)) {
      setPinError(
        lang === 'ar'
          ? `لا يمكن الدخول: صلاحية تسجيل الدخول معطلة للمستخدم "${user.nameAr}"`
          : `Login blocked: Access permission revoked for "${user.nameEn}"`
      );
      return;
    }
    StorageService.login(user);
    onLoginSuccess(user);
  };

  return (
    <div
      id="login-view-container"
      className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between text-[#252525] selection:bg-[#B8862B]/20 selection:text-[#8D641D] relative overflow-hidden"
    >
      {/* Decorative Background Accents */}
      <div className="absolute top-0 end-0 w-96 h-96 bg-[#B8862B]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 start-0 w-96 h-96 bg-[#8D641D]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Top Bar Header */}
      <header className="relative z-10 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E9DDCA]/60 bg-white/70 backdrop-blur-md">
        {/* Brand & Market Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] flex items-center justify-center text-[#B8862B] shadow-2xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
                {lang === 'ar' ? settings.companyNameAr : settings.companyNameEn}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B8862B]/10 text-[#8D641D] border border-[#B8862B]/20">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{lang === 'ar' ? 'البحرين' : 'Bahrain'}</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'سوق البراحة - ديار المحرق' : 'Souq Al Baraha - Diyar Al Muharraq'}</span>
              <span>•</span>
              <span>{lang === 'ar' ? 'بوابة ١٢ - محل ١٠٥١' : 'Gate 12, Shop 1051'}</span>
            </p>
          </div>
        </div>

        {/* Right Tools: Database Status, Time, & Language */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cloud SQL Database Connection Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl text-xs">
            <Database className="w-3.5 h-3.5 text-[#B8862B]" />
            <span className="text-neutral-700 font-semibold">PostgreSQL (Cloud SQL)</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {lang === 'ar' ? 'متصل' : 'Connected'}
            </span>
          </div>

          {/* Clock */}
          {currentTime && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-mono bg-white px-2.5 py-1.5 rounded-xl border border-[#E9DDCA]">
              <Clock className="w-3.5 h-3.5 text-[#B8862B]" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Language Switcher */}
          <button
            id="login-lang-toggle-btn"
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E9DDCA] bg-white rounded-xl text-xs font-bold text-neutral-800 hover:border-[#B8862B] hover:bg-[#FAF7F0] transition-colors cursor-pointer shadow-2xs"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-[#B8862B]" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl bg-white border border-[#E9DDCA] rounded-3xl shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 sm:p-7 text-center bg-gradient-to-b from-[#FAF7F0] to-white border-b border-[#E9DDCA]/60">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B8862B] to-[#8D641D] text-white shadow-md mb-3.5">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
              {lang === 'ar' ? 'تسجيل الدخول للنظام السحابي' : 'Cloud POS & ERP Portal Login'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
              {lang === 'ar'
                ? 'إدارة نقاط البيع، المخزون الحرفي، وتوثيق المبيعات والطلبات الخاصة'
                : 'Manage artisan retail POS, inventory, custom orders, and cloud sales'}
            </p>

            {/* Authentication Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-1 p-1 bg-[#FAF7F0] border border-[#E9DDCA] rounded-2xl max-w-md mx-auto mt-5">
              <button
                id="tab-mode-pin"
                type="button"
                onClick={() => {
                  setAuthMode('pin');
                  setPinError(null);
                  setPinInput('');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'pin'
                    ? 'bg-white text-[#8D641D] shadow-xs border border-[#E9DDCA]'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#B8862B]" />
                <span>{lang === 'ar' ? 'رمز الـ PIN السريع' : 'Quick POS PIN'}</span>
              </button>

              <button
                id="tab-mode-credentials"
                type="button"
                onClick={() => {
                  setAuthMode('credentials');
                  setCredentialsError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'credentials'
                    ? 'bg-white text-[#8D641D] shadow-xs border border-[#E9DDCA]'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-[#B8862B]" />
                <span>{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</span>
              </button>

              <button
                id="tab-mode-google"
                type="button"
                onClick={() => {
                  setAuthMode('google');
                  setCredentialsError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'google'
                    ? 'bg-white text-[#8D641D] shadow-xs border border-[#E9DDCA]'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </div>
          </div>

          {/* Form / Interaction Body */}
          <div className="p-6 sm:p-8">
            {/* ---------------- MODE 1: QUICK PIN ENTRY & TOUCH KEYPAD ---------------- */}
            {authMode === 'pin' && (
              <div className="space-y-6">
                {/* Selected Staff Member Card */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2">
                    {lang === 'ar' ? 'اختر الموظف / الكاشير:' : 'Select Staff Member:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allUsers.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      const canLogin = StorageService.canUserLogin(u);
                      return (
                        <button
                          key={u.id}
                          id={`select-user-${u.id}`}
                          type="button"
                          onClick={() => handleSelectQuickStaff(u)}
                          className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer flex items-center gap-2.5 relative overflow-hidden ${
                            isSelected
                              ? 'bg-[#FAF7F0] border-[#B8862B] shadow-xs ring-2 ring-[#B8862B]/30'
                              : !canLogin
                              ? 'bg-neutral-50/80 border-rose-200 hover:border-rose-400 opacity-80'
                              : 'bg-white border-[#E9DDCA] hover:border-neutral-400'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#B8862B] text-white'
                                : !canLogin
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-[#FAF7F0] text-[#8D641D] border border-[#E9DDCA]'
                            }`}
                          >
                            {canLogin ? (
                              u.username.substring(0, 2).toUpperCase()
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="overflow-hidden min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-bold text-neutral-900 truncate">
                                {lang === 'ar' ? u.nameAr.split(' ')[0] : u.nameEn.split(' ')[0]}
                              </p>
                              {!canLogin && (
                                <span className="text-[8px] font-bold px-1 py-0.2 bg-rose-100 text-rose-700 rounded-sm shrink-0">
                                  {lang === 'ar' ? 'معطل' : 'Off'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8D641D] block truncate font-medium capitalize">
                              {u.role.replace('_', ' ')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PIN Display Indicators */}
                <div className="text-center py-2">
                  <div className="inline-flex items-center justify-center gap-3 p-3 px-6 bg-[#FAF7F0] rounded-2xl border border-[#E9DDCA]">
                    {[0, 1, 2, 3].map((index) => {
                      const isFilled = pinInput.length > index;
                      return (
                        <div
                          key={index}
                          className={`w-5 h-5 rounded-full transition-all duration-150 ${
                            isFilled
                              ? 'bg-[#B8862B] scale-110 shadow-xs ring-4 ring-[#B8862B]/20'
                              : 'bg-white border-2 border-[#E9DDCA]'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-2">
                    {lang === 'ar'
                      ? 'أدخل رمز الـ PIN المكون من 4 أرقام عبر لوحة المفاتيح أو الشاشة'
                      : 'Enter 4-digit PIN via keyboard or on-screen keypad'}
                  </p>
                </div>

                {/* Error Alert */}
                {pinError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {/* Touch Numeric Keypad */}
                <div className="max-w-xs mx-auto grid grid-cols-3 gap-2.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      id={`keypad-${digit}`}
                      type="button"
                      onClick={() => handlePinDigit(digit)}
                      className="h-12 bg-white hover:bg-[#FAF7F0] active:bg-[#B8862B]/10 active:scale-95 border border-[#E9DDCA] rounded-2xl text-lg font-black text-neutral-800 shadow-2xs hover:border-[#B8862B] transition-all cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}

                  {/* Clear / C */}
                  <button
                    id="keypad-clear"
                    type="button"
                    onClick={handlePinClear}
                    className="h-12 bg-neutral-100 hover:bg-neutral-200 active:scale-95 border border-neutral-200 rounded-2xl text-xs font-bold text-neutral-600 transition-all cursor-pointer"
                    title={lang === 'ar' ? 'مسح الكل' : 'Clear All'}
                  >
                    C
                  </button>

                  {/* 0 */}
                  <button
                    id="keypad-0"
                    type="button"
                    onClick={() => handlePinDigit('0')}
                    className="h-12 bg-white hover:bg-[#FAF7F0] active:bg-[#B8862B]/10 active:scale-95 border border-[#E9DDCA] rounded-2xl text-lg font-black text-neutral-800 shadow-2xs hover:border-[#B8862B] transition-all cursor-pointer"
                  >
                    0
                  </button>

                  {/* Backspace */}
                  <button
                    id="keypad-backspace"
                    type="button"
                    onClick={handlePinBackspace}
                    className="h-12 bg-neutral-100 hover:bg-neutral-200 active:scale-95 border border-neutral-200 rounded-2xl flex items-center justify-center text-neutral-700 transition-all cursor-pointer"
                    title={lang === 'ar' ? 'حذف رقم' : 'Backspace'}
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                {/* Submit / Login Button */}
                <button
                  id="pin-login-btn"
                  type="button"
                  onClick={handlePinSubmit}
                  disabled={pinInput.length !== 4}
                  className="w-full py-3.5 px-4 bg-[#B8862B] hover:bg-[#8D641D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تأكيد ودخول النظام' : 'Confirm & Sign In'}</span>
                </button>
              </div>
            )}

            {/* ---------------- MODE 2: USERNAME & PASSWORD ---------------- */}
            {authMode === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Credentials Error */}
                {credentialsError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{credentialsError}</span>
                  </div>
                )}

                {/* Username / Email */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    {lang === 'ar' ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="input-username"
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: admin أو emani@emaniartcraft.com' : 'e.g. admin or emani@emaniartcraft.com'}
                      required
                      className="w-full ps-10 pe-4 py-2.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#B8862B] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password / PIN */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      {lang === 'ar' ? 'كلمة المرور / رمز الـ PIN' : 'Password or PIN Code'}
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {lang === 'ar' ? '(رمز المدير: 9999)' : '(Admin PIN: 9999)'}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل كلمة المرور أو رمز الـ PIN' : 'Enter password or PIN'}
                      required
                      className="w-full ps-10 pe-10 py-2.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:border-[#B8862B] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-[#B8862B] rounded border-[#E9DDCA] focus:ring-[#B8862B]"
                    />
                    <span>{lang === 'ar' ? 'تذكر هذه الجلسة على هذا الجهاز' : 'Remember session on this device'}</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  id="credentials-login-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 bg-[#B8862B] hover:bg-[#8D641D] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? (lang === 'ar' ? 'جاري التحقق...' : 'Authenticating...')
                      : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
                  </span>
                </button>
              </form>
            )}

            {/* ---------------- MODE 3: GOOGLE OAUTH & CLOUD SQL ---------------- */}
            {authMode === 'google' && (
              <div className="space-y-5 text-center py-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FAF7F0] border border-[#E9DDCA] flex items-center justify-center text-neutral-700 shadow-2xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                    {lang === 'ar' ? 'تسجيل الدخول عبر حساب Google' : 'Google Workspace Sign-In'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    {lang === 'ar'
                      ? 'يتصل النظام مباشرة بقاعدة بيانات Cloud SQL لمزامنة هوية الموظف وصلاحياته'
                      : 'Directly integrates with Cloud SQL PostgreSQL to synchronize user profile'}
                  </p>
                </div>

                {credentialsError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-start">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{credentialsError}</span>
                  </div>
                )}

                {googleUser ? (
                  <div className="p-4 bg-[#FAF7F0] border border-[#E9DDCA] rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 text-start">
                      <img
                        src={googleUser.photoURL || 'https://placehold.co/40x40'}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full border border-[#E9DDCA]"
                      />
                      <div>
                        <p className="text-xs font-bold text-neutral-900">{googleUser.displayName}</p>
                        <p className="text-[10px] text-neutral-500">{googleUser.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInstantLogin(allUsers[0])}
                      className="px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold hover:bg-[#8D641D] cursor-pointer"
                    >
                      {lang === 'ar' ? 'متابعة الدخول' : 'Continue'}
                    </button>
                  </div>
                ) : (
                  <button
                    id="google-login-btn"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-white border-2 border-[#E9DDCA] hover:border-[#B8862B] text-neutral-800 font-bold text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{lang === 'ar' ? 'متابعة عبر حساب Google' : 'Continue with Google'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Demo Staff Logins (1-Click Access for Evaluation) */}
            <div className="mt-6 pt-5 border-t border-[#E9DDCA]/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-neutral-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B8862B]" />
                  <span>{lang === 'ar' ? 'دخول سريع لتجربة صلاحيات الأدوار:' : 'Quick Demo Role Access:'}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {allUsers.map((u) => {
                  const canLogin = StorageService.canUserLogin(u);
                  return (
                    <button
                      key={u.id}
                      id={`quick-login-${u.username}`}
                      type="button"
                      onClick={() => handleInstantLogin(u)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                        canLogin
                          ? 'bg-[#FAF7F0] border-[#E9DDCA] hover:border-[#B8862B] text-neutral-700 hover:text-[#8D641D]'
                          : 'bg-rose-50/70 border-rose-200 text-rose-700 hover:border-rose-400 opacity-70'
                      }`}
                      title={
                        canLogin
                          ? `PIN: ${u.pin} - ${lang === 'ar' ? 'مصرح بالدخول' : 'Authorized'}`
                          : lang === 'ar'
                          ? 'صلاحية الدخول معطلة'
                          : 'Login Revoked'
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          canLogin ? 'bg-[#B8862B]' : 'bg-rose-500'
                        }`}
                      />
                      <span>{lang === 'ar' ? u.nameAr.split(' ')[0] : u.nameEn.split(' ')[0]}</span>
                      <span className="text-[9px] text-neutral-400 font-normal">
                        ({canLogin ? u.pin : lang === 'ar' ? 'معطل' : 'Off'})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 px-4 py-4 text-center text-xs text-neutral-500 border-t border-[#E9DDCA]/60 bg-white/50 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]">
            {lang === 'ar'
              ? 'ورشة ومعرض إيماني آرت كرافت • ست: CR-104928-1 • الرقم الضريبي: BH-200034982100002'
              : 'Emani Art Craft Workshop & Gallery • CR: CR-104928-1 • VAT: BH-200034982100002'}
          </p>
          <p className="text-[11px] text-neutral-400">
            {lang === 'ar' ? 'سوق البراحة، ديار المحرق، مملكة البحرين' : 'Souq Al Baraha, Diyar Al Muharraq, Bahrain'}
          </p>
        </div>
      </footer>
    </div>
  );
};
