// Emani Art Craft - Main Application Container & Reactive Navigation Engine

import React, { useState, useEffect } from 'react';
import { Language, NavRoute } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ShieldAlert } from 'lucide-react';

// Module Views
import { LoginView } from './components/auth/LoginView';
import { POSView } from './components/pos/POSView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/products/CategoriesView';
import { CollectionsView } from './components/products/CollectionsView';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomOrdersView } from './components/orders/CustomOrdersView';
import { QuotationsView } from './components/orders/QuotationsView';
import { CRMView } from './components/crm/CRMView';
import { PurchasingView } from './components/purchasing/PurchasingView';
import { AccountingView } from './components/accounting/AccountingView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => StorageService.isLoggedIn());
  const currentUser = StorageService.getCurrentUser();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>(() => {
    return (StorageService.getDefaultRouteForUser(currentUser) as NavRoute) || 'pos';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Force re-render state on storage change
  const [, setTick] = useState(0);

  useEffect(() => {
    // Synchronize HTML dir and lang attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // Subscribe to transactional storage mutations
    const unsubscribe = StorageService.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Ensure current active user is authorized for the current route
  useEffect(() => {
    if (isAuthenticated && currentUser && currentRoute !== 'login') {
      if (!StorageService.isPageAllowed(currentUser, currentRoute)) {
        const fallbackRoute = StorageService.getDefaultRouteForUser(currentUser);
        setCurrentRoute(fallbackRoute as NavRoute);
      }
    }
  }, [currentUser?.id, currentRoute, isAuthenticated]);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K for search, F2 for POS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        const user = StorageService.getCurrentUser();
        if (StorageService.isPageAllowed(user, 'pos')) {
          setCurrentRoute('pos');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleSafeNavigate = (tab: string) => {
    const user = StorageService.getCurrentUser();
    if (StorageService.isPageAllowed(user, tab)) {
      setCurrentRoute(tab as NavRoute);
    } else {
      const fallback = StorageService.getDefaultRouteForUser(user);
      setCurrentRoute(fallback as NavRoute);
    }
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    // Role Page Security Guard
    if (!StorageService.isPageAllowed(currentUser, currentRoute)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#B8862B] flex items-center justify-center mb-4 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-1">
            {lang === 'ar' ? 'صفحة غير مصرح بها' : 'Page Access Restricted'}
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mb-5 leading-relaxed">
            {lang === 'ar'
              ? `حسابك الحالي (${currentUser.nameAr}) بصلاحية (${currentUser.role}) غير مصرح له بالوصول إلى هذه الصفحة. يرجى مراجعة إدارة المعرض لتعديل الصلاحيات.`
              : `Your account (${currentUser.nameEn}) with role (${currentUser.role}) is not authorized to access this page. Please contact store management.`}
          </p>
          <button
            onClick={() => setCurrentRoute(StorageService.getDefaultRouteForUser(currentUser) as NavRoute)}
            className="px-5 py-2.5 bg-[#B8862B] text-white rounded-xl text-xs font-bold hover:bg-[#8D641D] transition-colors shadow-xs"
          >
            {lang === 'ar' ? 'الذهاب إلى صفحتك المصرح بها' : 'Return to Authorized Page'}
          </button>
        </div>
      );
    }

    switch (currentRoute) {
      case 'pos':
        return <POSView lang={lang} />;
      case 'dashboard':
        return <DashboardView lang={lang} onNavigate={handleSafeNavigate} />;
      case 'products':
        return <ProductsView lang={lang} />;
      case 'categories':
        return <CategoriesView lang={lang} />;
      case 'collections':
        return <CollectionsView lang={lang} />;
      case 'inventory':
        return <InventoryView lang={lang} />;
      case 'custom-orders':
      case 'custom_orders' as any:
        return <CustomOrdersView lang={lang} />;
      case 'quotations':
        return <QuotationsView lang={lang} />;
      case 'crm':
        return <CRMView lang={lang} />;
      case 'purchasing':
      case 'purchases':
        return <PurchasingView lang={lang} />;
      case 'expenses':
        return <AccountingView lang={lang} initialTab="expenses" />;
      case 'shifts':
        return <AccountingView lang={lang} initialTab="shifts" />;
      case 'reports':
        return <AccountingView lang={lang} initialTab="vat" />;
      case 'accounting':
        return <AccountingView lang={lang} initialTab="pl" />;
      case 'audit':
        return <SettingsView lang={lang} initialTab="audit" />;
      case 'users':
        return <UsersView lang={lang} />;
      case 'settings':
      case 'promotions' as any:
        return <SettingsView lang={lang} />;
      case 'login':
        return (
          <LoginView
            lang={lang}
            onToggleLang={handleToggleLang}
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              const active = StorageService.getCurrentUser();
              const def = StorageService.getDefaultRouteForUser(active);
              setCurrentRoute(def as NavRoute);
            }}
          />
        );
      default:
        return <POSView lang={lang} />;
    }
  };

  // Dedicated Full-Screen Login View if user is unauthenticated or navigated to login
  if (!isAuthenticated || currentRoute === 'login') {
    return (
      <LoginView
        lang={lang}
        onToggleLang={handleToggleLang}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          const active = StorageService.getCurrentUser();
          const def = StorageService.getDefaultRouteForUser(active);
          setCurrentRoute(def as NavRoute);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#252525] flex flex-col font-sans selection:bg-[#B8862B]/20 selection:text-[#8D641D]">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenShiftModal={() => {
          if (StorageService.isPageAllowed(currentUser, 'shifts')) {
            setCurrentRoute('shifts');
          } else if (StorageService.isPageAllowed(currentUser, 'accounting')) {
            setCurrentRoute('accounting');
          }
        }}
        activeTab={currentRoute}
        setActiveTab={handleSafeNavigate}
        onLogout={() => {
          StorageService.logout();
          setIsAuthenticated(false);
          setCurrentRoute('login');
        }}
      />

      {/* Main Body with Sidebar and Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          lang={lang}
          activeTab={currentRoute}
          setActiveTab={handleSafeNavigate}
          mobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* View Surface Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-[calc(100vh-4rem)]">
          {renderView()}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        onNavigate={(route) => {
          handleSafeNavigate(route);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
