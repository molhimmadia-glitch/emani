// Emani Art Craft - Special Collections Management

import React, { useState } from 'react';
import { Sparkles, Plus, Edit2, Trash2, X, Calendar, Package } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Collection } from '../../types';
import { translations } from '../../services/i18n';

interface CollectionsViewProps {
  lang: Language;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({ lang }) => {
  const t = translations[lang];
  const collections = StorageService.getCollections();
  const products = StorageService.getProducts();

  const [showModal, setShowModal] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [formState, setFormState] = useState<Partial<Collection>>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    active: true,
  });

  const handleOpenCreate = () => {
    setEditingCol(null);
    setFormState({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCol(col);
    setFormState({ ...col });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nameAr || !formState.nameEn) return;

    const col: Collection = {
      id: editingCol ? editingCol.id : `col-${Date.now()}`,
      nameAr: formState.nameAr!,
      nameEn: formState.nameEn!,
      code: editingCol?.code || `COL-${(collections.length + 1).toString().padStart(3, '0')}`,
      descriptionAr: formState.descriptionAr,
      descriptionEn: formState.descriptionEn,
      bannerImage: formState.bannerImage,
      active: formState.active ?? true,
    };

    StorageService.saveCollection(col);
    setShowModal(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525]">
            {t.navCollections}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'مجموعات المواسم والمناسبات: العيد الوطني، رمضان المبارك، ومجموعات الأعراس الفاخرة'
              : 'Seasonal and thematic artisan collections for holidays, Ramadan, and weddings'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'ar' ? 'إضافة مجموعة جديدة' : 'Add Collection'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const count = products.filter((p) => p.collectionIds?.includes(col.id)).length;
          return (
            <div
              key={col.id}
              className="bg-white border border-[#E9DDCA] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#B8862B] transition-all"
            >
              {col.bannerImage && (
                <div className="h-32 w-full overflow-hidden relative">
                  <img
                    src={col.bannerImage}
                    alt={col.nameEn}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <span className="text-white font-bold text-xs">
                      {lang === 'ar' ? col.nameAr : col.nameEn}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-[#252525]">
                    {lang === 'ar' ? col.nameAr : col.nameEn}
                  </h3>
                  <p className="text-xs text-neutral-400 font-semibold">
                    {lang === 'ar' ? col.nameEn : col.nameAr}
                  </p>
                  {(col.descriptionAr || col.descriptionEn) && (
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                      {lang === 'ar' ? col.descriptionAr : col.descriptionEn}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E9DDCA]/60 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">
                    {count} {lang === 'ar' ? 'منتجات في المجموعة' : 'items'}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(col)}
                    className="p-1.5 text-neutral-500 hover:text-[#B8862B] rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2">
              <h3 className="font-bold text-sm text-[#252525]">
                {editingCol ? 'تعديل المجموعة' : 'مجموعة جديدة'}
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

              <div>
                <label className="font-bold text-neutral-700">رابط صورة البانر (Banner Image URL)</label>
                <input
                  type="text"
                  value={formState.bannerImage}
                  onChange={(e) => setFormState({ ...formState, bannerImage: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
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
