// Emani Art Craft - Sidebar Navigation

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Sparkles,
  Warehouse,
  Palette,
  FileText,
  Users,
  Truck,
  Receipt,
  Landmark,
  Coins,
  Tags,
  ShieldCheck,
  History,
  BarChart3,
  Settings,
  X,
  Store,
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../services/i18n';
import { StorageService } from '../../services/storage';

interface SidebarProps {
  lang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  activeTab,
  setActiveTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = translations[lang];
  const currentUser = StorageService.getCurrentUser();

  // Navigation Items organized logically
  const navSections: NavSection[] = [
    {
      title: lang === 'ar' ? 'العمليات ونقطة البيع' : 'Operations & Sales',
      items: [
        { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
        { id: 'pos', label: t.navPOS, icon: ShoppingCart, highlight: true },
        { id: 'products', label: t.navProducts, icon: Package },
        { id: 'categories', label: t.navCategories, icon: Layers },
        { id: 'collections', label: t.navCollections, icon: Sparkles },
        { id: 'inventory', label: t.navInventory, icon: Warehouse },
      ],
    },
    {
      title: lang === 'ar' ? 'الطلبات الخاصة والعملاء' : 'Custom Orders & CRM',
      items: [
        { id: 'custom-orders', label: t.navCustomOrders, icon: Palette, badge: 'VIP' },
        { id: 'quotations', label: t.navQuotations, icon: FileText },
        { id: 'crm', label: t.navCRM, icon: Users },
      ],
    },
    {
      title: lang === 'ar' ? 'المشتريات والمالية' : 'Purchasing & Financials',
      items: [
        { id: 'purchases', label: t.navSuppliers, icon: Truck },
        { id: 'expenses', label: t.navExpenses, icon: Receipt },
        { id: 'accounting', label: t.navAccounting, icon: Landmark },
        { id: 'shifts', label: t.navShifts, icon: Coins },
        { id: 'promotions', label: t.navPromotions, icon: Tags },
      ],
    },
    {
      title: lang === 'ar' ? 'الإدارة والتقارير' : 'Administration & Reports',
      items: [
        { id: 'reports', label: t.navReports, icon: BarChart3 },
        { id: 'users', label: t.navUsers, icon: ShieldCheck },
        { id: 'audit', label: t.navAudit, icon: History },
        { id: 'settings', label: t.navSettings, icon: Settings },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside Container */}
      <aside
        className={`fixed top-0 bottom-0 z-45 lg:static w-72 bg-[#FAF7F0] border-e border-[#E9DDCA] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen
            ? 'translate-x-0'
            : lang === 'ar'
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-[#E9DDCA] lg:hidden">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#B8862B]" />
            <span className="font-bold text-sm text-[#252525]">
              {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-neutral-500 hover:bg-[#E9DDCA]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#8D641D]/70 font-['Outfit']">
                {section.title}
              </h3>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#B8862B] text-white shadow-xs'
                          : item.highlight
                          ? 'text-[#8D641D] bg-[#E9DDCA]/30 hover:bg-[#E9DDCA]/60 font-bold'
                          : 'text-[#252525]/80 hover:bg-[#E9DDCA]/30 hover:text-[#252525]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? 'text-white'
                              : item.highlight
                              ? 'text-[#B8862B]'
                              : 'text-neutral-500 group-hover:text-[#B8862B]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#B8862B]/15 text-[#8D641D]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Store & Role Status */}
        <div className="p-3 border-t border-[#E9DDCA] bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-[#E9DDCA]/80">
            <div className="w-8 h-8 rounded-lg bg-[#B8862B]/10 text-[#B8862B] flex items-center justify-center font-bold text-xs shrink-0">
              🇧🇭
            </div>
            <div className="overflow-hidden leading-tight text-start">
              <p className="text-xs font-bold text-[#252525] truncate">
                {lang === 'ar'
                  ? 'معرض سوق البراحة - ديار المحرق'
                  : 'Souq Al Baraha - Diyar Al Muharraq'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>{lang === 'ar' ? 'النظام متصل • الضريبة 10%' : 'Online • 10% VAT'}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
