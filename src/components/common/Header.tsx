// Emani Art Craft - Main Header

import React, { useState } from 'react';
import {
  Search,
  Globe,
  Bell,
  User,
  Clock,
  Menu,
  X,
  AlertTriangle,
  ChevronDown,
  LogOut,
  Shield,
  Layers,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { EmaniLogo } from './EmaniLogo';
import { StorageService } from '../../services/storage';
import { Language, User as UserType } from '../../types';
import { translations } from '../../services/i18n';
import { useAuth } from '../../context/AuthContext';
import { Database } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenSearch: () => void;
  onToggleMobileMenu: () => void;
  onOpenShiftModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenSearch,
  onToggleMobileMenu,
  onOpenShiftModal,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const t = translations[lang];
  const { currentUser: authUser, signInWithGoogle, signOut: authSignOut } = useAuth();
  const currentUser = StorageService.getCurrentUser();
  const activeShift = StorageService.getActiveShift();
  const products = StorageService.getProducts();
  const customOrders = StorageService.getCustomOrders();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Compute alerts
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStock);
  const approachingOrders = customOrders.filter(
    (o) => o.status === 'in_production' || o.status === 'customer_approval'
  );
  const totalAlerts = lowStockItems.length + approachingOrders.length;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E9DDCA] px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#252525] hover:bg-[#E9DDCA]/40 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="cursor-pointer"
            onClick={() => setActiveTab(StorageService.getDefaultRouteForUser(currentUser))}
            title="Emani Art Craft ERP"
          >
            <EmaniLogo size="md" showText={true} />
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <button
            id="global-search-trigger"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm bg-white/80 border border-[#E9DDCA] rounded-xl text-neutral-500 hover:border-[#B8862B] hover:bg-white shadow-xs transition-all text-start"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#B8862B]" />
              <span className="text-neutral-500 text-xs sm:text-sm truncate">
                {t.searchPlaceholder}
              </span>
            </div>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-neutral-500 bg-[#FAF7F0] border border-[#E9DDCA] rounded-md">
              /
            </kbd>
          </button>
        </div>

        {/* Right Actions: Store Badge, Shift Badge, Notifications, Language, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Active Showroom & Status Pill */}
          <div
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-[#E9DDCA] text-xs shadow-2xs"
            title={lang === 'ar' ? 'معرض سوق البراحة - ديار المحرق' : 'Souq Al Baraha - Diyar Al Muharraq'}
          >
            <MapPin className="w-3.5 h-3.5 text-[#B8862B] shrink-0" />
            <div className="flex flex-col text-start leading-tight">
              <span className="font-bold text-[#252525] truncate max-w-[160px]">
                {lang === 'ar' ? 'سوق البراحة - ديار المحرق' : 'Souq Al Baraha - Muharraq'}
              </span>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>{lang === 'ar' ? 'النظام متصل • الضريبة 10%' : 'Online • 10% VAT'}</span>
              </span>
            </div>
          </div>

          {/* Shift Status Pill */}
          <button
            id="shift-status-badge"
            onClick={onOpenShiftModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeShift
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title={activeShift ? `Shift #${activeShift.shiftNumber}` : t.noActiveShift}
          >
            <Clock className="w-3.5 h-3.5 text-current" />
            <span className="hidden sm:inline">
              {activeShift ? `${t.activeShift}: ${activeShift.shiftNumber}` : t.openShift}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                activeShift ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 text-[#252525] hover:bg-[#E9DDCA]/40 rounded-xl transition-colors"
              aria-label={t.notifications}
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F0]">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div
                className={`absolute ${
                  lang === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-80 bg-white border border-[#E9DDCA] rounded-2xl shadow-xl p-3 z-50`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
                  <h4 className="text-xs font-bold text-[#252525] uppercase tracking-wider">
                    {t.notifications} ({totalAlerts})
                  </h4>
                  <span className="text-[10px] text-[#B8862B] font-medium">
                    {lang === 'ar' ? 'تحديث تلقائي' : 'Auto Updated'}
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {lowStockItems.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-700 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {t.lowStockAlerts} ({lowStockItems.length})
                      </p>
                      {lowStockItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-amber-50/70 rounded-lg border border-amber-100 flex items-center justify-between"
                        >
                          <span className="truncate max-w-[180px] font-medium text-neutral-800">
                            {lang === 'ar' ? item.nameAr : item.nameEn}
                          </span>
                          <span className="text-amber-900 font-bold px-1.5 py-0.5 bg-amber-200/60 rounded text-[10px]">
                            {item.stockQuantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {approachingOrders.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="font-semibold text-blue-700 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'طلبات مناسبات قيد التنفيذ' : 'Event Orders in Progress'} (
                        {approachingOrders.length})
                      </p>
                      {approachingOrders.slice(0, 3).map((ord) => (
                        <div
                          key={ord.id}
                          className="p-2 bg-blue-50/70 rounded-lg border border-blue-100 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-neutral-800">{ord.customerName}</p>
                            <p className="text-[10px] text-neutral-500">
                              {ord.eventType} • {ord.quantity} pcs
                            </p>
                          </div>
                          <span className="text-blue-900 font-semibold text-[10px]">
                            {ord.deadline}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <p className="text-center text-neutral-400 py-4 text-xs">
                      {lang === 'ar' ? 'لا توجد تنبيهات جديدة' : 'No new notifications'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher Button */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E9DDCA] rounded-xl text-xs font-medium text-[#252525] hover:bg-white transition-colors"
            title={t.switchLang}
          >
            <Globe className="w-3.5 h-3.5 text-[#B8862B]" />
            <span className="font-bold">{t.switchLang}</span>
          </button>

          {/* Active User Switcher / Profile Dropdown */}
          <div className="relative">
            <button
              id="user-profile-btn"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#E9DDCA] bg-white hover:border-[#B8862B] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#B8862B]/10 text-[#8D641D] flex items-center justify-center font-bold text-xs">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-start leading-none">
                <span className="text-xs font-semibold text-[#252525] truncate max-w-[120px]">
                  {lang === 'ar' ? currentUser.nameAr.split(' ')[0] : currentUser.nameEn.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#8D641D] font-medium capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {showUserDropdown && (
              <div
                className={`absolute ${
                  lang === 'ar' ? 'left-0' : 'right-0'
                } mt-2 w-72 sm:w-80 bg-white border border-[#E9DDCA] rounded-2xl shadow-xl p-3 z-50`}
              >
                {/* Header: Logged-in Account Badge */}
                <div className="flex items-center justify-between px-2 pb-2.5 border-b border-neutral-100">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {lang === 'ar' ? 'الحساب المسجل حالياً' : 'Logged-in Account'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'ar' ? 'نشط الآن' : 'Active'}
                  </span>
                </div>

                {/* User Identity Card */}
                <div className="p-3 my-2 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]/70 flex items-center gap-3">
                  {authUser?.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover border border-[#E9DDCA] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B8862B] to-[#8D641D] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                      {currentUser.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="overflow-hidden flex-1 leading-tight">
                    <h4 className="text-sm font-bold text-neutral-900 truncate">
                      {lang === 'ar' ? currentUser.nameAr : currentUser.nameEn}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                      @{currentUser.username}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#8D641D] bg-[#B8862B]/10 px-2 py-0.5 rounded-md w-fit">
                      <ShieldCheck className="w-3 h-3 text-[#B8862B]" />
                      <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details List */}
                <div className="space-y-1.5 py-1 text-xs">
                  {/* Email */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 bg-neutral-50/70 border border-neutral-100">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate font-medium text-[11px]">{currentUser.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 bg-neutral-50/70 border border-neutral-100">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]" dir="ltr">{currentUser.phone}</span>
                  </div>

                  {/* Branch / Store Location */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-neutral-600 bg-neutral-50/70 border border-neutral-100">
                    <MapPin className="w-3.5 h-3.5 text-[#B8862B] shrink-0" />
                    <span className="truncate text-[11px]">
                      {lang === 'ar' ? 'سوق البراحة - محل ١٠٥١' : 'Souq Al Baraha - Shop 1051'}
                    </span>
                  </div>
                </div>

                {/* Cloud SQL Database Connected Status */}
                <div className="mt-2 px-2.5 py-1.5 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Database className="w-3.5 h-3.5 text-[#B8862B]" />
                    <span className="font-semibold text-[11px]">Cloud SQL PostgreSQL</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                {/* Google Linked Account (if linked) */}
                {authUser && (
                  <div className="mt-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                      <span className="truncate text-[10px] text-neutral-600 font-medium">
                        {authUser.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => authSignOut()}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold px-1.5 py-0.5 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'ar' ? 'فصل' : 'Unlink'}
                    </button>
                  </div>
                )}

                {/* Sign Out Action Button */}
                <div className="mt-2.5 pt-2 border-t border-neutral-100">
                  <button
                    id="header-logout-btn"
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        StorageService.logout();
                        setActiveTab('login');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out of Account'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
