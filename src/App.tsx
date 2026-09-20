// Emani Art Craft - Main Application Container & Reactive Navigation Engine

import React, { useState, useEffect } from 'react';
import { Language, NavRoute } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Module Views
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
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('pos');
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

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K for search, F2 for POS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setCurrentRoute('pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const renderView = () => {
    switch (currentRoute) {
      case 'pos':
        return <POSView lang={lang} />;
      case 'dashboard':
        return <DashboardView lang={lang} onNavigate={(route) => setCurrentRoute(route as NavRoute)} />;
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
      case 'shifts':
      case 'expenses':
      case 'accounting':
        return <AccountingView lang={lang} />;
      case 'users':
        return <UsersView lang={lang} />;
      case 'settings':
        return <SettingsView lang={lang} />;
      default:
        return <POSView lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#252525] flex flex-col font-sans selection:bg-[#B8862B]/20 selection:text-[#8D641D]">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenShiftModal={() => setCurrentRoute('accounting')}
        activeTab={currentRoute}
        setActiveTab={(tab: string) => setCurrentRoute(tab as NavRoute)}
      />

      {/* Main Body with Sidebar and Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Sidebar */}
        <Sidebar
          lang={lang}
          activeTab={currentRoute}
          setActiveTab={(route: string) => {
            setCurrentRoute(route as NavRoute);
            setIsSidebarOpen(false); // Auto close drawer on mobile/touch
          }}
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
          setCurrentRoute(route as NavRoute);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
}
