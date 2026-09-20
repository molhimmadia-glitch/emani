// Emani Art Craft - User Management & Granular Role-Based Access Control (RBAC)

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  Edit2,
  Trash2,
  X,
  Check,
  KeyRound,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Power,
} from 'lucide-react';
import { StorageService, ALL_SYSTEM_PAGES, DEFAULT_ROLE_PAGES } from '../../services/storage';
import { Language, User, UserRole } from '../../types';
import { translations } from '../../services/i18n';

interface UsersViewProps {
  lang: Language;
}

const DEFAULT_PERMISSIONS = [
  { key: 'can_login', labelAr: 'صلاحية تسجيل الدخول للنظام', labelEn: 'System Login Access' },
  { key: 'can_access_pos', labelAr: 'الدخول لشاشة الكاشير (POS)', labelEn: 'Access POS Terminal' },
  { key: 'can_discount', labelAr: 'منح خصومات يدوية', labelEn: 'Apply Manual Discounts' },
  { key: 'can_void_receipt', labelAr: 'إلغاء واسترجاع الفواتير', labelEn: 'Void / Refund Receipts' },
  { key: 'can_edit_prices', labelAr: 'تعديل أسعار المنتجات', labelEn: 'Edit Product Prices' },
  { key: 'can_view_cost', labelAr: 'الاطلاع على أسعار التكلفة', labelEn: 'View Cost Margins' },
  { key: 'can_access_accounting', labelAr: 'التقارير المالية والضريبية', labelEn: 'Accounting & VAT Reports' },
  { key: 'can_manage_settings', labelAr: 'إدارة إعدادات النظام', labelEn: 'Manage System Settings' },
  { key: 'can_manage_users', labelAr: 'إدارة حسابات الموظفين', labelEn: 'Manage User Accounts' },
];

export const UsersView: React.FC<UsersViewProps> = ({ lang }) => {
  const t = translations[lang];
  const users = StorageService.getUsers();
  const currentUser = StorageService.getCurrentUser();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<User>>({
    nameAr: '',
    nameEn: '',
    username: '',
    email: '',
    phone: '',
    pin: '1234',
    role: 'cashier',
    active: true,
    customPermissions: ['can_login', 'can_access_pos'],
    allowedPages: [...DEFAULT_ROLE_PAGES.cashier],
  });

  const pageSections = [
    {
      titleAr: 'العمليات ونقطة البيع',
      titleEn: 'Operations & Sales',
      pages: ALL_SYSTEM_PAGES.filter((p) => p.sectionAr === 'العمليات ونقطة البيع'),
    },
    {
      titleAr: 'الطلبات الخاصة والعملاء',
      titleEn: 'Custom Orders & CRM',
      pages: ALL_SYSTEM_PAGES.filter((p) => p.sectionAr === 'الطلبات الخاصة والعملاء'),
    },
    {
      titleAr: 'المشتريات والمالية',
      titleEn: 'Purchasing & Financials',
      pages: ALL_SYSTEM_PAGES.filter((p) => p.sectionAr === 'المشتريات والمالية'),
    },
    {
      titleAr: 'الإدارة والتقارير',
      titleEn: 'Administration & Reports',
      pages: ALL_SYSTEM_PAGES.filter((p) => p.sectionAr === 'الإدارة والتقارير'),
    },
  ];

  const handleOpenCreate = () => {
    setEditingUser(null);
    const defaultRole: UserRole = 'cashier';
    setFormState({
      nameAr: '',
      nameEn: '',
      username: '',
      email: '',
      phone: '39000000',
      pin: '1234',
      role: defaultRole,
      active: true,
      customPermissions: ['can_login', 'can_access_pos'],
      allowedPages: [...(DEFAULT_ROLE_PAGES[defaultRole] || ['pos'])],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormState({
      ...u,
      allowedPages: StorageService.getAllowedPages(u),
    });
    setShowModal(true);
  };

  const togglePageAllowed = (pageId: string) => {
    const pages = new Set(formState.allowedPages || []);
    if (pages.has(pageId)) {
      pages.delete(pageId);
    } else {
      pages.add(pageId);
    }
    setFormState({ ...formState, allowedPages: Array.from(pages) });
  };

  const handleApplyRoleDefaults = () => {
    const role = formState.role || 'cashier';
    const defaults = DEFAULT_ROLE_PAGES[role] || ['pos'];
    setFormState({ ...formState, allowedPages: [...defaults] });
  };

  const handleSelectAllPages = () => {
    setFormState({ ...formState, allowedPages: ALL_SYSTEM_PAGES.map((p) => p.id) });
  };

  const handleDeselectAllPages = () => {
    setFormState({ ...formState, allowedPages: [] });
  };

  const handleToggleLoginPermission = (u: User) => {
    setActionFeedback(null);
    const result = StorageService.toggleUserLoginPermission(u.id);
    if (!result.success) {
      setActionFeedback({
        message: lang === 'ar' ? result.error || 'تعذر تغيير صلاحية الدخول' : result.error || 'Could not change login permission',
        type: 'error',
      });
      return;
    }
    const isNowActive = StorageService.canUserLogin(result.user!);
    setActionFeedback({
      message:
        lang === 'ar'
          ? `تم ${isNowActive ? 'تفعيل' : 'تعطيل'} صلاحية تسجيل الدخول للمستخدم: ${u.nameAr}`
          : `Login permission has been ${isNowActive ? 'enabled' : 'disabled'} for: ${u.nameEn}`,
      type: 'success',
    });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nameEn || !formState.email) return;

    const finalActive = formState.active ?? true;
    const perms = new Set(formState.customPermissions || ['can_access_pos']);
    if (finalActive) {
      perms.add('can_login');
    } else {
      perms.delete('can_login');
    }

    const newUser: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      username: formState.username || formState.email!.split('@')[0],
      nameAr: formState.nameAr || formState.nameEn!,
      nameEn: formState.nameEn!,
      email: formState.email!,
      phone: formState.phone || '39000000',
      pin: formState.pin || '1234',
      role: formState.role || 'cashier',
      active: finalActive,
      customPermissions: Array.from(perms),
      allowedPages:
        formState.allowedPages && formState.allowedPages.length > 0
          ? formState.allowedPages
          : DEFAULT_ROLE_PAGES[formState.role || 'cashier'] || ['pos'],
    };

    StorageService.saveUser(newUser);
    setShowModal(false);
    setActionFeedback({
      message:
        lang === 'ar'
          ? `تم حفظ بيانات وصلاحيات المستخدم: ${newUser.nameAr}`
          : `Saved account & permissions for: ${newUser.nameEn}`,
      type: 'success',
    });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSwitchUser = (u: User) => {
    if (!StorageService.canUserLogin(u)) {
      alert(
        lang === 'ar'
          ? `لا يمكن التبديل إلى المستخدم "${u.nameAr}" لأن صلاحية تسجيل الدخول الخاصة به معطلة حالياً.`
          : `Cannot switch to user "${u.nameEn}" because login permission is disabled.`
      );
      return;
    }
    StorageService.setCurrentUser(u);
    alert(
      lang === 'ar'
        ? `تم التبديل بنجاح إلى المستخدم: ${u.nameAr} (${u.role})`
        : `Switched active user to: ${u.nameEn} (${u.role})`
    );
  };

  const handleDeleteClick = (u: User) => {
    setDeleteError(null);
    if (u.id === currentUser.id) {
      setDeleteError(
        lang === 'ar'
          ? 'لا يمكن حذف الحساب النشط حالياً الذي تستخدمه لتسجيل الدخول.'
          : 'You cannot delete the currently active logged-in account.'
      );
      return;
    }
    if (users.length <= 1) {
      setDeleteError(
        lang === 'ar'
          ? 'لا يمكن حذف المستخدم الأخير في النظام. يجب وجود حساب مستخدم واحد على الأقل.'
          : 'Cannot delete the last remaining user in the system.'
      );
      return;
    }
    setUserToDelete(u);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const success = StorageService.deleteUser(userToDelete.id);
    if (success) {
      setUserToDelete(null);
      setDeleteError(null);
    } else {
      setDeleteError(
        lang === 'ar'
          ? 'تعذر حذف المستخدم المحدد.'
          : 'Failed to delete selected user.'
      );
    }
  };

  const togglePermission = (key: string) => {
    const perms = new Set(formState.customPermissions || []);
    if (perms.has(key)) {
      perms.delete(key);
    } else {
      perms.add(key);
    }
    setFormState({ ...formState, customPermissions: Array.from(perms) });
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#B8862B]" />
            {t.navUsers}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'إدارة صلاحيات تسجيل الدخول للمستخدمين، الموظفين، الحرفيين، ومسؤولي نقاط البيع'
              : 'Manage user login permissions, cashier privileges, and artisan designer credentials'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addUser}</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all animate-in fade-in duration-200 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isMe = u.id === currentUser.id;
          const userPerms = new Set(u.customPermissions || []);
          const canLogin = StorageService.canUserLogin(u);
          return (
            <div
              key={u.id}
              className={`bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all ${
                isMe
                  ? 'border-2 border-[#B8862B]'
                  : !canLogin
                  ? 'border-rose-200 bg-rose-50/10'
                  : 'border-[#E9DDCA] hover:border-[#B8862B]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-[#252525]">
                      {lang === 'ar' ? u.nameAr : u.nameEn}
                    </span>
                    {isMe && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#B8862B] text-white">
                        {lang === 'ar' ? 'أنت الآن' : 'Active Session'}
                      </span>
                    )}
                    {!canLogin && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        {lang === 'ar' ? 'محظور من الدخول' : 'Login Disabled'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FAF7F0] border border-[#E9DDCA] text-[#8D641D]">
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                      <Lock className="w-3 h-3" /> PIN: {u.pin}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                    title={t.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(u)}
                    disabled={isMe}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isMe
                        ? 'text-neutral-300 cursor-not-allowed opacity-30'
                        : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title={
                      isMe
                        ? lang === 'ar'
                          ? 'لا يمكن حذف حساب الجلسة النشطة'
                          : 'Cannot delete active session account'
                        : t.delete
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Login Permission Status & Instant Toggle */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  canLogin
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      canLogin
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {canLogin ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">
                      {lang === 'ar' ? 'صلاحية تسجيل الدخول' : 'Login Access Permission'}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        canLogin ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {canLogin
                        ? lang === 'ar'
                          ? 'مفعّلة - مصرح بالدخول'
                          : 'Enabled - Allowed to Login'
                        : lang === 'ar'
                        ? 'معطلة - محظور من الدخول'
                        : 'Disabled - Cannot Login'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleLoginPermission(u)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    canLogin ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`}
                  title={
                    lang === 'ar'
                      ? canLogin
                        ? 'انقر لتعطيل صلاحية تسجيل الدخول'
                        : 'انقر لتفعيل صلاحية تسجيل الدخول'
                      : canLogin
                      ? 'Click to disable login permission'
                      : 'Click to enable login permission'
                  }
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      canLogin
                        ? lang === 'ar'
                          ? '-translate-x-5'
                          : 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Permissions Checklist Summary */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/60 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#E9DDCA]/60 text-neutral-900 font-bold">
                  <span>{lang === 'ar' ? 'صلاحية الدخول للنظام:' : 'System Login Access:'}</span>
                  <span
                    className={
                      canLogin ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'
                    }
                  >
                    {canLogin
                      ? lang === 'ar'
                        ? 'مسموح ✓'
                        : 'Allowed ✓'
                      : lang === 'ar'
                      ? 'معطل ✕'
                      : 'Blocked ✕'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>{lang === 'ar' ? 'استخدام نقطة البيع:' : 'Access POS:'}</span>
                  <span
                    className={
                      userPerms.has('can_access_pos')
                        ? 'text-emerald-700 font-bold'
                        : 'text-neutral-400'
                    }
                  >
                    {userPerms.has('can_access_pos') ? '✓' : '✕'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>{lang === 'ar' ? 'منح خصومات يدوية:' : 'Manual Discount:'}</span>
                  <span
                    className={
                      userPerms.has('can_discount')
                        ? 'text-emerald-700 font-bold'
                        : 'text-neutral-400'
                    }
                  >
                    {userPerms.has('can_discount') ? '✓' : '✕'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>{lang === 'ar' ? 'إلغاء فواتير البيع:' : 'Void Sale Receipts:'}</span>
                  <span
                    className={
                      userPerms.has('can_void_receipt')
                        ? 'text-emerald-700 font-bold'
                        : 'text-neutral-400'
                    }
                  >
                    {userPerms.has('can_void_receipt') ? '✓' : '✕'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-700">
                  <span>{lang === 'ar' ? 'التقارير المالية والمحاسبة:' : 'Financial Reports:'}</span>
                  <span
                    className={
                      userPerms.has('can_access_accounting')
                        ? 'text-emerald-700 font-bold'
                        : 'text-neutral-400'
                    }
                  >
                    {userPerms.has('can_access_accounting') ? '✓' : '✕'}
                  </span>
                </div>
              </div>

              {/* Authorized Pages Summary */}
              <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/60 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-bold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#B8862B]" />
                    <span>{lang === 'ar' ? 'الصفحات المصرح بها:' : 'Authorized Pages:'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#B8862B]/15 text-[#8D641D] text-[10px] font-bold">
                    {StorageService.getAllowedPages(u).length} {lang === 'ar' ? 'صفحة' : 'pages'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                  {StorageService.getAllowedPages(u).map((pageId) => {
                    const pageInfo = ALL_SYSTEM_PAGES.find((p) => p.id === pageId);
                    return (
                      <span
                        key={pageId}
                        className="px-1.5 py-0.5 rounded-md bg-white border border-[#E9DDCA] text-[9.5px] font-medium text-neutral-700 truncate max-w-[130px]"
                        title={lang === 'ar' ? pageInfo?.nameAr || pageId : pageInfo?.nameEn || pageId}
                      >
                        {lang === 'ar' ? pageInfo?.nameAr || pageId : pageInfo?.nameEn || pageId}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Switch active user button */}
              <button
                onClick={() => handleSwitchUser(u)}
                disabled={isMe || !canLogin}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isMe
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    : !canLogin
                    ? 'bg-rose-100 text-rose-700 border border-rose-200 cursor-not-allowed'
                    : 'bg-[#B8862B] text-white hover:bg-[#8D641D]'
                }`}
              >
                {isMe
                  ? lang === 'ar'
                    ? 'المستخدم النشط حالياً'
                    : 'Current Active User'
                  : !canLogin
                  ? lang === 'ar'
                    ? 'صلاحية الدخول معطلة لهذا الحساب'
                    : 'Login Permission Revoked'
                  : lang === 'ar'
                  ? 'تسجيل الدخول بهذا المستخدم'
                  : 'Switch to this User'}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL: Create / Edit User */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 my-8 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {editingUser ? t.edit : t.addUser}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              {/* Account Status / Login Permission Toggle */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] flex items-center justify-between">
                <div>
                  <label className="font-bold text-neutral-800 block text-xs">
                    {lang === 'ar'
                      ? 'تفعيل صلاحية تسجيل الدخول للنظام'
                      : 'Enable System Login Permission'}
                  </label>
                  <p className="text-[11px] text-neutral-500">
                    {(formState.active ?? true)
                      ? lang === 'ar'
                        ? 'المستخدم مسموح له بالدخول واستخدام النظام'
                        : 'User is authorized to log in'
                      : lang === 'ar'
                      ? 'تم إيقاف الدخول، لن يتمكن المستخدم من تسجيل الدخول'
                      : 'Login is blocked for this user'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextActive = !(formState.active ?? true);
                    const perms = new Set(formState.customPermissions || []);
                    if (nextActive) perms.add('can_login');
                    else perms.delete('can_login');
                    setFormState({
                      ...formState,
                      active: nextActive,
                      customPermissions: Array.from(perms),
                    });
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    (formState.active ?? true) ? 'bg-emerald-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      (formState.active ?? true)
                        ? lang === 'ar'
                          ? '-translate-x-5'
                          : 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formState.nameAr}
                    onChange={(e) => setFormState({ ...formState, nameAr: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">English Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.nameEn}
                    onChange={(e) => setFormState({ ...formState, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-neutral-700">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">
                    {lang === 'ar' ? 'رمز الدخول السريع (PIN)' : 'Cashier PIN'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formState.pin}
                    onChange={(e) => setFormState({ ...formState, pin: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700">{t.role} *</label>
                <select
                  value={formState.role}
                  onChange={(e) => {
                    const newRole = e.target.value as UserRole;
                    setFormState({
                      ...formState,
                      role: newRole,
                      allowedPages: [...(DEFAULT_ROLE_PAGES[newRole] || ['pos'])],
                    });
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                >
                  <option value="super_admin">Super Admin (المدير العام)</option>
                  <option value="manager">Store Manager (مدير المعرض)</option>
                  <option value="cashier">Cashier (كاشير)</option>
                  <option value="inventory_employee">Inventory Specialist (أمين المستودع)</option>
                  <option value="designer">Artisan / Designer (حرفي / مصمم)</option>
                  <option value="accountant">Accountant (محاسب)</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2">
                <span className="font-bold text-neutral-900 block">{t.permissions}:</span>

                {DEFAULT_PERMISSIONS.map((perm) => {
                  const isChecked = (formState.customPermissions || []).includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 cursor-pointer font-medium text-neutral-700 hover:text-neutral-900"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.key)}
                        className="w-4 h-4 rounded text-[#B8862B]"
                      />
                      <span className={perm.key === 'can_login' ? 'font-bold text-[#8D641D]' : ''}>
                        {lang === 'ar' ? perm.labelAr : perm.labelEn}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Authorized System Pages Selection */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-neutral-900 block text-xs">
                      {lang === 'ar' ? 'الصفحات المصرح بها لهذا المستخدم:' : 'Authorized System Pages:'}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {lang === 'ar'
                        ? 'تظهر في القائمة وتسمح بالدخول لهذا الحساب فقط'
                        : 'Visible in sidebar & accessible for this account'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={handleApplyRoleDefaults}
                      className="px-2 py-1 bg-white border border-[#E9DDCA] text-[#8D641D] rounded-lg font-bold hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'الافتراضي للدور' : 'Role Defaults'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllPages}
                      className="px-2 py-1 bg-white border border-[#E9DDCA] text-neutral-700 rounded-lg font-semibold hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'الكل' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPages}
                      className="px-2 py-1 bg-white border border-[#E9DDCA] text-rose-600 rounded-lg font-semibold hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'مسح' : 'Clear'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {pageSections.map((sec) => (
                    <div key={sec.titleAr} className="space-y-1 bg-white p-2.5 rounded-xl border border-[#E9DDCA]/70">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8D641D] border-b border-neutral-100 pb-1">
                        {lang === 'ar' ? sec.titleAr : sec.titleEn}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {sec.pages.map((p) => {
                          const isChecked = (formState.allowedPages || []).includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 text-[11px] text-neutral-700 hover:text-neutral-900 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePageAllowed(p.id)}
                                className="w-3.5 h-3.5 rounded text-[#B8862B]"
                              />
                              <span className={isChecked ? 'font-bold text-[#252525]' : 'text-neutral-500'}>
                                {lang === 'ar' ? p.nameAr : p.nameEn}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E9DDCA]">
                {editingUser && editingUser.id !== currentUser.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const u = editingUser;
                      setShowModal(false);
                      handleDeleteClick(u);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t.delete}</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold hover:bg-neutral-50 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D] transition-colors"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-rose-100 shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#252525]">
                  {lang === 'ar' ? 'تأكيد حذف المستخدم' : 'Confirm Delete User'}
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  {lang === 'ar'
                    ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه'
                    : 'This action is permanent and cannot be undone'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-1">
              <p className="font-bold text-[#252525] text-xs">
                {lang === 'ar' ? userToDelete.nameAr : userToDelete.nameEn}
              </p>
              <p className="text-neutral-500 text-[11px] font-mono">{userToDelete.email}</p>
              <p className="text-[#8D641D] text-[10px] uppercase font-bold">
                {userToDelete.role.replace('_', ' ')}
              </p>
            </div>

            <p className="text-neutral-600 leading-relaxed">
              {lang === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف حساب "${userToDelete.nameAr || userToDelete.nameEn}" نهائياً؟ لن يتمكن هذا المستخدم من الدخول للنظام بعد الحذف.`
                : `Are you sure you want to permanently delete "${userToDelete.nameEn}"? This user will no longer be able to access the system.`}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold hover:bg-neutral-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Error Notification */}
      {deleteError && (
        <div className="fixed bottom-5 end-5 z-50 max-w-md bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-lg flex items-start justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            className="text-rose-500 hover:text-rose-800 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
