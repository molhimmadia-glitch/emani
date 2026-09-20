// Emani Art Craft - System Settings, Store Profile, & Immutable Audit Logs

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Receipt,
  Share2,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  History,
  Download,
  Upload,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, CompanySettings } from '../../types';
import { translations } from '../../services/i18n';

interface SettingsViewProps {
  lang: Language;
  initialTab?: 'profile' | 'pos' | 'whatsapp' | 'audit';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ lang, initialTab = 'profile' }) => {
  const t = translations[lang];
  const currentSettings = StorageService.getSettings();
  const auditLogs = StorageService.getAuditLogs();

  const [activeTab, setActiveTab] = useState<'profile' | 'pos' | 'whatsapp' | 'audit'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [formData, setFormData] = useState<CompanySettings>({ ...currentSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDemo = () => {
    if (
      confirm(
        lang === 'ar'
          ? 'هل أنت متأكد من إعادة تعيين جميع بيانات النظام إلى البيانات الأولية الأصلية لإيماني آرت كرافت؟'
          : 'Reset all system data to original Emani Art Craft demonstration state?'
      )
    ) {
      StorageService.resetToSeedData();
      window.location.reload();
    }
  };

  const handleExportBackup = () => {
    const json = StorageService.exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emani_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#B8862B]" />
            {t.navSettings}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'بيانات السجل التجاري البحريني، الفاتورة الضريبية، رسائل الواتساب، وسجل تدقيق العمليات'
              : 'CR and VAT credentials, receipt customization, WhatsApp templates, and audit logs'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E9DDCA] text-[#8D641D] bg-white hover:bg-[#FAF7F0] rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'تصدير نسخة احتياطية' : 'Export JSON Backup'}</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إعادة تعيين البيانات' : 'Reset Demo State'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-[#E9DDCA] rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {lang === 'ar' ? 'بيانات المنشأة والضريبة' : 'Company & VAT'}
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'pos' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {lang === 'ar' ? 'إعدادات الفاتورة' : 'Receipt Settings'}
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'whatsapp' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {lang === 'ar' ? 'قوالب واتساب' : 'WhatsApp Templates'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-[#B8862B] text-white' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {t.auditLogs}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'ar' ? 'تم حفظ الإعدادات بنجاح!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      {/* TAB 1: Company Profile & VAT Registration */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E9DDCA] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div className="border-b border-[#E9DDCA] pb-4">
            <h3 className="font-bold text-sm text-[#252525]">{formData.companyNameAr}</h3>
            <p className="text-neutral-500 font-semibold">{formData.companyNameEn}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700">اسم المنشأة بالعربية *</label>
              <input
                type="text"
                required
                value={formData.companyNameAr}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700">Company Name (English) *</label>
              <input
                type="text"
                required
                value={formData.companyNameEn}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700">
                {lang === 'ar' ? 'رقم السجل التجاري (CR Number) - البحرين' : 'Bahrain CR Number'} *
              </label>
              <input
                type="text"
                required
                value={formData.crNumber}
                onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700">
                {lang === 'ar' ? 'الرقم الضريبي (NBR VAT Account Number)' : 'Bahrain NBR VAT Number'} *
              </label>
              <input
                type="text"
                required
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-neutral-700">{lang === 'ar' ? 'الهاتف' : 'Phone'}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700">{lang === 'ar' ? 'واتساب المتجر' : 'WhatsApp'}</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700">{lang === 'ar' ? 'حساب إنستغرام' : 'Instagram'}</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700">{lang === 'ar' ? 'عنوان المعرض بالعربية' : 'Address (Arabic)'}</label>
              <input
                type="text"
                value={formData.addressAr}
                onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-neutral-700">{lang === 'ar' ? 'العنوان بالإنجليزية' : 'Address (English)'}</label>
              <input
                type="text"
                value={formData.addressEn}
                onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E9DDCA]">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D] transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Receipt Settings */}
      {activeTab === 'pos' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E9DDCA] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div>
            <label className="font-bold text-neutral-700">
              {lang === 'ar' ? 'رسالة ترويسة الفاتورة بالعربية (Header Note)' : 'Receipt Header Note (Arabic)'}
            </label>
            <input
              type="text"
              value={formData.receiptHeaderAr}
              onChange={(e) => setFormData({ ...formData, receiptHeaderAr: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700">
              {lang === 'ar' ? 'رسالة ترويسة الفاتورة بالإنجليزية' : 'Receipt Header Note (English)'}
            </label>
            <input
              type="text"
              value={formData.receiptHeaderEn}
              onChange={(e) => setFormData({ ...formData, receiptHeaderEn: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700">
              {lang === 'ar' ? 'رسالة تذييل الفاتورة والشكر (Footer Note)' : 'Receipt Footer Message'}
            </label>
            <textarea
              rows={2}
              value={formData.receiptFooterAr}
              onChange={(e) => setFormData({ ...formData, receiptFooterAr: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E9DDCA]">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D] transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: WhatsApp Templates */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl p-5 shadow-xs space-y-4 text-xs">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#252525]">
              {lang === 'ar' ? 'قوالب رسائل واتساب التلقائية' : 'Automated WhatsApp Templates'}
            </h3>
            <p className="text-neutral-500">
              {lang === 'ar'
                ? 'تدعم الرسائل إرسال الفاتورة الإلكترونية، اعتماد التصاميم المحفورة، وإشعارات جاهزية التوزيعات والهدايا'
                : 'Supports electronic e-receipts, custom order design approvals, and ready for pickup alerts'}
            </p>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2">
            <span className="font-bold text-neutral-800">1. قالب الفاتورة الإلكترونية بعد البيع (POS Receipt):</span>
            <p className="p-2.5 bg-white rounded-lg border border-[#E9DDCA] text-neutral-600 font-mono text-[11px] leading-relaxed">
              شكراً لتسوقك من إيماني آرت كرافت - البحرين! فاتورتك الضريبية متاحة الآن.
            </p>
          </div>

          <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2">
            <span className="font-bold text-neutral-800">2. قالب اعتماد تصميم الخط العربي للتوزيعات (Custom Order Approval):</span>
            <p className="p-2.5 bg-white rounded-lg border border-[#E9DDCA] text-neutral-600 font-mono text-[11px] leading-relaxed">
              مرحباً بكم، مرفق مسودة تصميم وتنسيق طلبكم الخاص لمناسبتكم السعيدة. نرجو الاطلاع والاعتماد للبدء بالإنتاج.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E9DDCA] bg-[#FAF7F0] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#252525] flex items-center gap-2">
              <History className="w-4 h-4 text-[#B8862B]" />
              {t.auditLogs}
            </h3>
            <span className="text-xs text-neutral-400 font-medium">
              {auditLogs.length} {lang === 'ar' ? 'حدث مسجل' : 'events logged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-[#E9DDCA] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 text-start">{t.date}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الحدث' : 'Action'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الوحدة' : 'Module'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'التفاصيل' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCA]/40">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 text-neutral-600 font-mono">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-800">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F0] border border-[#E9DDCA] text-[#8D641D]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-neutral-600 font-semibold">{log.module}</td>
                    <td className="py-3 px-4 text-neutral-500 max-w-[250px] truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
