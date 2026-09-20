// Emani Art Craft - Category Management

import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Category } from '../../types';
import { translations } from '../../services/i18n';

interface CategoriesViewProps {
  lang: Language;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ lang }) => {
  const t = translations[lang];
  const categories = StorageService.getCategories();
  const products = StorageService.getProducts();

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formState, setFormState] = useState<Partial<Category>>({
    nameAr: '',
    nameEn: '',
    slug: '',
    displayOrder: 1,
  });

  const handleOpenCreate = () => {
    setEditingCat(null);
    setFormState({
      nameAr: '',
      nameEn: '',
      slug: '',
      displayOrder: categories.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setFormState({ ...c });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nameAr || !formState.nameEn) return;

    const cat: Category = {
      id: editingCat ? editingCat.id : `cat-${Date.now()}`,
      nameAr: formState.nameAr!,
      nameEn: formState.nameEn!,
      slug: formState.slug || formState.nameEn!.toLowerCase().replace(/\s+/g, '-'),
      displayOrder: Number(formState.displayOrder) || 1,
    };

    StorageService.saveCategory(cat);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const attachedCount = products.filter((p) => p.categoryId === id).length;
    if (attachedCount > 0) {
      alert(
        lang === 'ar'
          ? `لا يمكن حذف هذا التصنيف لوجود ${attachedCount} منتجات مرتبطة به.`
          : `Cannot delete category with ${attachedCount} linked products.`
      );
      return;
    }
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف التصنيف؟' : 'Delete category?')) {
      StorageService.deleteCategory(id);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525]">
            {t.navCategories}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'تصنيف منتجات الحرف اليدوية والهدايا لتسهيل البحث والبيع في نقطة البيع'
              : 'Organize crafts and gifts into categories for fast POS access'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white border border-[#E9DDCA] rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#B8862B] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E9DDCA] text-[#B8862B] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-[#252525]">
                  {lang === 'ar' ? cat.nameAr : cat.nameEn}
                </h3>
                <p className="text-xs text-neutral-400 font-semibold">
                  {lang === 'ar' ? cat.nameEn : cat.nameAr}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E9DDCA]/60 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">
                  {count} {lang === 'ar' ? 'منتجات مرتبطة' : 'products'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                  {lang === 'ar' ? 'نشط' : 'Active'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {editingCat ? (lang === 'ar' ? 'تعديل التصنيف' : 'Edit Category') : (lang === 'ar' ? 'إضافة تصنيف' : 'Add Category')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="font-bold text-neutral-700">
                  {lang === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formState.nameAr}
                  onChange={(e) => setFormState({ ...formState, nameAr: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">
                  {lang === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formState.nameEn}
                  onChange={(e) => setFormState({ ...formState, nameEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700">
                  {lang === 'ar' ? 'الرمز التعريفي (Slug)' : 'Slug URL'}
                </label>
                <input
                  type="text"
                  value={formState.slug}
                  onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono"
                  placeholder="e.g. pottery-crafts"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B8862B] text-white rounded-xl font-bold hover:bg-[#8D641D]"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
