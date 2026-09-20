// Emani Art Craft - Product & Variant Management with Barcode Generator

import React, { useState, useRef } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Barcode,
  Printer,
  X,
  Layers,
  Sparkles,
  Check,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Camera,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { Language, Product, ProductVariant } from '../../types';
import { translations, formatBHDLocalized } from '../../services/i18n';

interface ProductsViewProps {
  lang: Language;
}

interface ProductFormState extends Partial<Product> {
  collectionId?: string;
  warehouseId?: string;
  shelfLocation?: string;
  isHandmade?: boolean;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ lang }) => {
  const t = translations[lang];
  const products = StorageService.getProducts();
  const categories = StorageService.getCategories();
  const collections = StorageService.getCollections();
  const warehouses = StorageService.getWarehouses();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [filterCustomizable, setFilterCustomizable] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodePrintProduct, setBarcodePrintProduct] = useState<Product | null>(null);
  const [labelCopies, setLabelCopies] = useState<number>(4);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Curated Bahraini Artisan Craft Presets (Quick Image Selection)
  const CRAFT_IMAGE_PRESETS = [
    {
      id: 'p-glass',
      nameAr: 'طقم استكانات مذهبة',
      nameEn: 'Gold Rim Teacups',
      url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'p-pottery',
      nameAr: 'فخار عالي يدوي',
      nameEn: 'A\'ali Handcraft Pottery',
      url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'p-box',
      nameAr: 'صندوق خشب النخيل',
      nameEn: 'Palm Wood Trinket Box',
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'p-bag',
      nameAr: 'حقيبة سدو بحرينية',
      nameEn: 'Sadu Embroidered Bag',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'p-burner',
      nameAr: 'مبخرة عود تراثية',
      nameEn: 'Heritage Oud Burner',
      url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Process & Optimize Image to Data URL (Auto resized to max 800px)
  const processImageFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error(
        lang === 'ar'
          ? 'نوع الملف غير مدعوم، يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)'
          : 'Unsupported file type. Please choose a valid image (JPG, PNG, WebP)'
      );
    }

    if (file.size > 12 * 1024 * 1024) {
      throw new Error(
        lang === 'ar'
          ? 'حجم الصورة كبير جداً (الحد الأقصى 12 ميجابايت)'
          : 'File size too large (maximum 12MB)'
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const maxDimension = 800;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              resolve(e.target?.result as string);
            }
          } catch (err) {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () =>
          reject(new Error(lang === 'ar' ? 'تعذر قراءة ملف الصورة' : 'Failed to read image file'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () =>
        reject(new Error(lang === 'ar' ? 'فشل تحميل ملف الصورة' : 'Failed to load file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const dataUrl = await processImageFile(file);
      setFormState((prev) => ({
        ...prev,
        images: [dataUrl, ...(prev.images || []).filter((img) => img !== dataUrl)].slice(0, 5),
      }));
    } catch (err: any) {
      setUploadError(err.message || (lang === 'ar' ? 'حدث خطأ أثناء معالجة الصورة' : 'Error processing image'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    const url = imageUrlInput.trim();
    setFormState((prev) => ({
      ...prev,
      images: [url, ...(prev.images || []).filter((img) => img !== url)].slice(0, 5),
    }));
    setImageUrlInput('');
    setShowUrlInput(false);
    setUploadError(null);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormState((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Form State
  const [formState, setFormState] = useState<ProductFormState>({
    nameAr: '',
    nameEn: '',
    sku: '',
    barcode: '',
    internalCode: '',
    categoryId: categories[0]?.id || 'cat-1',
    collectionId: collections[0]?.id || 'col-1',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    vatRate: 0.10,
    stockQuantity: 10,
    minStock: 3,
    reorderLevel: 5,
    unit: 'piece',
    warehouseId: 'wh-1',
    shelfLocation: 'A1-01',
    isHandmade: true,
    customizable: false,
    material: 'Glass / Gold Leaf',
    active: true,
    images: [],
    variants: [],
  });

  const handleOpenCreate = () => {
    const count = products.length + 1;
    const randomBarcode = `608${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setEditingProduct(null);
    setUploadError(null);
    setShowUrlInput(false);
    setImageUrlInput('');
    setFormState({
      nameAr: '',
      nameEn: '',
      sku: `SKU-${count.toString().padStart(4, '0')}`,
      barcode: randomBarcode,
      internalCode: `EM-${count.toString().padStart(4, '0')}`,
      categoryId: categories[0]?.id || 'cat-1',
      collectionId: collections[0]?.id || 'col-1',
      costPrice: 5.0,
      sellingPrice: 12.0,
      wholesalePrice: 9.0,
      vatRate: 0.10,
      stockQuantity: 15,
      minStock: 3,
      reorderLevel: 5,
      unit: 'piece',
      warehouseId: 'wh-1',
      shelfLocation: 'A1-01',
      isHandmade: true,
      customizable: false,
      material: 'Bahraini Artisan Clay & Glaze',
      active: true,
      images: [],
      variants: [],
    });
    setShowProductModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setUploadError(null);
    setShowUrlInput(false);
    setImageUrlInput('');
    setFormState({ ...p });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.nameAr || !formState.nameEn || !formState.sku) return;

    // Graceful fallback craft photo if no image was provided
    const finalImages =
      formState.images && formState.images.length > 0 && formState.images[0]
        ? formState.images
        : ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'];

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      nameAr: formState.nameAr!,
      nameEn: formState.nameEn!,
      sku: formState.sku!,
      barcode: formState.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      internalCode: formState.internalCode || formState.sku!,
      categoryId: formState.categoryId || 'cat-1',
      collectionIds: formState.collectionId ? [formState.collectionId] : [],
      descriptionEn: formState.descriptionEn || '',
      descriptionAr: formState.descriptionAr || '',
      costPrice: Number(formState.costPrice) || 0,
      sellingPrice: Number(formState.sellingPrice) || 0,
      wholesalePrice: Number(formState.wholesalePrice) || 0,
      vatRate: Number(formState.vatRate) || 0.10,
      stockQuantity: Number(formState.stockQuantity) || 0,
      minStock: Number(formState.minStock) || 3,
      reorderLevel: Number(formState.reorderLevel) || 5,
      unit: formState.unit === 'box' || formState.unit === 'pair' || formState.unit === 'set' || formState.unit === 'custom' ? formState.unit : 'piece',
      storageLocation: {
        warehouseId: formState.warehouseId || 'wh-1',
        shelf: formState.shelfLocation || 'A1',
      },
      handmade: formState.isHandmade ?? true,
      customizable: formState.customizable ?? false,
      featured: false,
      material: formState.material,
      active: formState.active ?? true,
      images: finalImages,
      variants: formState.variants || [],
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveProduct(newProd);
    setShowProductModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      StorageService.deleteProduct(id);
    }
  };

  // Add a new variant row in form
  const handleAddVariantRow = () => {
    const vCount = (formState.variants?.length || 0) + 1;
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${vCount}`,
      sku: `${formState.sku}-V${vCount}`,
      barcode: `608${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      nameAr: `خيار ${vCount}`,
      nameEn: `Variant ${vCount}`,
      costPrice: formState.costPrice || 5,
      sellingPrice: formState.sellingPrice || 12,
      stockQuantity: 5,
      attributes: {
        design: `Design ${vCount}`,
      },
    };
    setFormState({
      ...formState,
      variants: [...(formState.variants || []), newVariant],
    });
  };

  const handleRemoveVariantRow = (id: string) => {
    setFormState({
      ...formState,
      variants: formState.variants?.filter((v) => v.id !== id),
    });
  };

  // Filter products
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      p.nameAr.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const matchCustom = !filterCustomizable || p.customizable;
    const matchLowStock = !filterLowStock || p.stockQuantity <= p.minStock;
    return matchQuery && matchCat && matchCustom && matchLowStock;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header & New Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#252525] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#B8862B]" />
            {t.navProducts}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {lang === 'ar'
              ? 'كتالوج الحرف اليدوية البحرينية، التحف، أطقم الضيافة المذهبة، وإدارة الباركود والأسعار'
              : 'Authentic Bahraini heritage crafts, luxury hospitality sets, barcode generation, and inventory'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B8862B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#8D641D] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E9DDCA] rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8862B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث باسم المنتج أو الرمز...' : 'Search by name, SKU, or barcode...'}
            className="w-full ps-9 pe-3 py-2 bg-[#FAF7F0]/60 border border-[#E9DDCA] rounded-xl text-xs text-[#252525] focus:outline-hidden focus:border-[#B8862B]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 bg-[#FAF7F0]/60 border border-[#E9DDCA] rounded-xl text-xs font-semibold text-neutral-700"
          >
            <option value="all">{t.allCategories}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === 'ar' ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>

          {/* Customizable Toggle */}
          <button
            onClick={() => setFilterCustomizable(!filterCustomizable)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterCustomizable
                ? 'bg-[#B8862B] text-white'
                : 'bg-[#FAF7F0]/60 border border-[#E9DDCA] text-neutral-700'
            }`}
          >
            {lang === 'ar' ? 'قابل للتخصيص' : 'Customizable'}
          </button>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filterLowStock
                ? 'bg-amber-600 text-white'
                : 'bg-[#FAF7F0]/60 border border-[#E9DDCA] text-neutral-700'
            }`}
          >
            {t.lowStockAlerts}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-[#E9DDCA] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead>
              <tr className="border-b border-[#E9DDCA] bg-[#FAF7F0] text-neutral-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="py-3 px-4 text-start">{t.category}</th>
                <th className="py-3 px-4 text-start">{t.costPrice}</th>
                <th className="py-3 px-4 text-start">{t.sellingPrice}</th>
                <th className="py-3 px-4 text-start">{t.stockQty}</th>
                <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الموقع' : 'Location'}</th>
                <th className="py-3 px-4 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDCA]/50">
              {filtered.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const isLow = p.stockQuantity <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    {/* Product Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://placehold.co/80x80'}
                          alt={p.nameEn}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E9DDCA] shrink-0"
                        />
                        <div className="truncate max-w-[220px]">
                          <p className="font-bold text-neutral-900 truncate">
                            {lang === 'ar' ? p.nameAr : p.nameEn}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            SKU: {p.sku} • {p.barcode}
                          </p>
                          {p.customizable && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold bg-[#B8862B]/10 text-[#8D641D] rounded">
                              {lang === 'ar' ? 'تخصيص نحت / طباعة' : 'Engrave / Custom'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-neutral-700 font-medium">
                      {cat ? (lang === 'ar' ? cat.nameAr : cat.nameEn) : '-'}
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 text-neutral-500 font-mono">
                      {formatBHDLocalized(p.costPrice, lang)}
                    </td>

                    {/* Selling Price */}
                    <td className="py-3 px-4 font-bold text-[#8D641D] font-mono text-sm">
                      {formatBHDLocalized(p.sellingPrice, lang)}
                    </td>

                    {/* Stock Quantity */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          isLow
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3" />}
                        {p.stockQuantity} {p.unit}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-neutral-500">
                      <span className="font-mono text-[11px] bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E9DDCA]">
                        {p.storageLocation?.shelf || 'A1'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        {/* Barcode Print */}
                        <button
                          onClick={() => setBarcodePrintProduct(p)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-[#B8862B] hover:bg-[#FAF7F0] transition-colors"
                          title={t.printBarcodeLabel}
                        >
                          <Barcode className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-[#FAF7F0] transition-colors"
                          title={t.edit}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create / Edit Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-5 sm:p-6 border border-[#E9DDCA] shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-3">
              <h3 className="font-bold text-base text-[#252525]">
                {editingProduct ? t.editProduct : t.addProduct}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Image Upload Section */}
              <div
                id="product-image-upload-card"
                className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#E9DDCA] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#B8862B]" />
                    <span>{lang === 'ar' ? 'صورة المنتج' : 'Product Image'}</span>
                    <span className="text-[11px] font-normal text-neutral-500">
                      {lang === 'ar' ? '(رفع ملف أو سحب وإفلات)' : '(Upload, Drag & Drop, or URL)'}
                    </span>
                  </label>
                  <button
                    id="toggle-url-input-btn"
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] font-semibold text-[#8D641D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>
                      {showUrlInput
                        ? (lang === 'ar' ? 'إلغاء الرابط' : 'Cancel URL')
                        : (lang === 'ar' ? 'إدخال رابط صورة مباشرة' : 'Paste Image URL')}
                    </span>
                  </button>
                </div>

                {/* URL Input Row */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-[#E9DDCA]">
                    <input
                      id="product-image-url-input"
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder={
                        lang === 'ar'
                          ? 'ألصق رابط الصورة هنا (https://...)'
                          : 'Paste image URL here (https://...)'
                      }
                      className="flex-1 px-3 py-1.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg text-xs"
                    />
                    <button
                      id="apply-image-url-btn"
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-[#B8862B] text-white rounded-lg font-bold hover:bg-[#8D641D] text-xs transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>
                )}

                {/* Upload Error Alert */}
                {uploadError && (
                  <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Current Image Preview OR Drag-and-Drop Zone */}
                {formState.images && formState.images.length > 0 && formState.images[0] ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white rounded-xl border border-[#E9DDCA]">
                    <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#E9DDCA] shrink-0 bg-[#FAF7F0]">
                      <img
                        src={formState.images[0]}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 end-1.5">
                        <span className="px-1.5 py-0.5 bg-[#B8862B] text-white text-[9px] font-bold rounded-md shadow-xs">
                          {lang === 'ar' ? 'الصورة الرئيسية' : 'Main Image'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === 'ar' ? 'تم اختيار صورة المنتج بنجاح' : 'Product image selected'}</span>
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {lang === 'ar'
                            ? 'ستظهر هذه الصورة في الكتالوج وشاشة الكاشير (POS) والإيصالات.'
                            : 'This photo will be displayed in the catalog, POS terminal, and receipts.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Change Image Button */}
                        <button
                          id="change-product-image-btn"
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 bg-[#FAF7F0] border border-[#E9DDCA] rounded-lg text-[#8D641D] font-bold hover:bg-[#E9DDCA]/50 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{lang === 'ar' ? 'رفع صورة بديلة' : 'Upload Replacement'}</span>
                        </button>

                        {/* Remove Image Button */}
                        <button
                          id="remove-product-image-btn"
                          type="button"
                          onClick={() => handleRemoveImage(0)}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'إزالة' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Zone */
                  <div
                    id="product-image-dropzone"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all ${
                      isDragging
                        ? 'border-[#B8862B] bg-[#B8862B]/10 scale-[1.01]'
                        : 'border-[#E9DDCA] hover:border-[#B8862B] bg-white hover:bg-[#FAF7F0]/60'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-11 h-11 rounded-full bg-[#FAF7F0] border border-[#E9DDCA] flex items-center justify-center text-[#B8862B]">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-800 text-xs">
                          {isUploading
                            ? (lang === 'ar' ? 'جاري معالجة ورفع الصورة...' : 'Processing image...')
                            : (lang === 'ar'
                              ? 'اسحب وأفلت صورة المنتج هنا، أو انقر لاختيار ملف من جهازك'
                              : 'Drag and drop product image here, or click to browse')}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          {lang === 'ar'
                            ? 'يدعم صيغ JPG، PNG، WebP حتى 12MB (يتم التحسين والضغط تلقائياً)'
                            : 'Supports JPG, PNG, WebP up to 12MB (auto-compressed & optimized)'}
                        </p>
                      </div>
                      <span
                        id="browse-product-image-btn"
                        className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B8862B] text-white rounded-lg text-xs font-bold shadow-2xs hover:bg-[#8D641D] transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'اختيار صورة من الجهاز' : 'Choose Photo from Device'}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Hidden Native File Input */}
                <input
                  ref={fileInputRef}
                  id="product-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {/* Quick Artisan Presets Selection */}
                <div className="pt-2 border-t border-[#E9DDCA]/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-neutral-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#B8862B]" />
                      <span>
                        {lang === 'ar'
                          ? 'أو اختر صورة جاهزة من تحف وحرف إيماني:'
                          : 'Or select a quick Bahraini craft preset:'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {CRAFT_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        id={`preset-img-${preset.id}`}
                        type="button"
                        onClick={() => {
                          setFormState((prev) => ({
                            ...prev,
                            images: [preset.url, ...(prev.images || []).filter((i) => i !== preset.url)].slice(0, 5),
                          }));
                          setUploadError(null);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#E9DDCA] rounded-lg hover:border-[#B8862B] transition-colors shrink-0 group cursor-pointer"
                        title={lang === 'ar' ? preset.nameAr : preset.nameEn}
                      >
                        <img
                          src={preset.url}
                          alt={preset.nameEn}
                          className="w-5 h-5 rounded object-cover border border-[#E9DDCA]"
                        />
                        <span className="text-[10px] font-medium text-neutral-700 group-hover:text-[#B8862B] whitespace-nowrap">
                          {lang === 'ar' ? preset.nameAr : preset.nameEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row: AR Name & EN Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">
                    {lang === 'ar' ? 'اسم المنتج بالعربية' : 'Arabic Name'} *
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
                    {lang === 'ar' ? 'اسم المنتج بالإنجليزية' : 'English Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.nameEn}
                    onChange={(e) => setFormState({ ...formState, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              {/* Row: SKU & Barcode & Internal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{t.sku} *</label>
                  <input
                    type="text"
                    required
                    value={formState.sku}
                    onChange={(e) => setFormState({ ...formState, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.barcode}</label>
                  <input
                    type="text"
                    value={formState.barcode}
                    onChange={(e) => setFormState({ ...formState, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">
                    {lang === 'ar' ? 'الرمز الداخلي' : 'Internal Code'}
                  </label>
                  <input
                    type="text"
                    value={formState.internalCode}
                    onChange={(e) => setFormState({ ...formState, internalCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1 font-mono"
                  />
                </div>
              </div>

              {/* Row: Category & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{t.category}</label>
                  <select
                    value={formState.categoryId}
                    onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ar' ? c.nameAr : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.collection}</label>
                  <select
                    value={formState.collectionId}
                    onChange={(e) => setFormState({ ...formState, collectionId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  >
                    <option value="">{lang === 'ar' ? 'بدون مجموعة خاصة' : 'None'}</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {lang === 'ar' ? col.nameAr : col.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Pricing (Cost, Selling, Wholesale) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{t.costPrice} (BHD) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={formState.costPrice}
                    onChange={(e) => setFormState({ ...formState, costPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.sellingPrice} (BHD) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={formState.sellingPrice}
                    onChange={(e) => setFormState({ ...formState, sellingPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.wholesalePrice} (BHD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formState.wholesalePrice}
                    onChange={(e) => setFormState({ ...formState, wholesalePrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              {/* Row: Stock & Location */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-neutral-700">{t.stockQty} *</label>
                  <input
                    type="number"
                    required
                    value={formState.stockQuantity}
                    onChange={(e) => setFormState({ ...formState, stockQuantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.minStock}</label>
                  <input
                    type="number"
                    value={formState.minStock}
                    onChange={(e) => setFormState({ ...formState, minStock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{t.reorderLevel}</label>
                  <input
                    type="number"
                    value={formState.reorderLevel}
                    onChange={(e) => setFormState({ ...formState, reorderLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700">{lang === 'ar' ? 'الرف' : 'Shelf'}</label>
                  <input
                    type="text"
                    value={formState.shelfLocation}
                    onChange={(e) => setFormState({ ...formState, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F0] border border-[#E9DDCA] rounded-xl mt-1"
                  />
                </div>
              </div>

              {/* Checkboxes: Handmade & Customizable */}
              <div className="flex items-center gap-6 p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA]">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formState.isHandmade}
                    onChange={(e) => setFormState({ ...formState, isHandmade: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B8862B]"
                  />
                  <span>{lang === 'ar' ? 'صناعة يدوية (Handmade)' : 'Handmade Craft'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formState.customizable}
                    onChange={(e) => setFormState({ ...formState, customizable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B8862B]"
                  />
                  <span>{lang === 'ar' ? 'يقبل التخصيص والأسماء' : 'Customizable / Engravable'}</span>
                </label>
              </div>

              {/* Multi-Variants Section */}
              <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#E9DDCA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">
                    {lang === 'ar' ? 'الخيارات والنقشات المتعددة (Variants):' : 'Multi-Variants (Color/Size/Design):'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-2.5 py-1 bg-white border border-[#E9DDCA] text-[#8D641D] rounded-lg font-bold hover:bg-[#B8862B] hover:text-white transition-colors"
                  >
                    + {lang === 'ar' ? 'إضافة خيار' : 'Add Variant'}
                  </button>
                </div>

                {formState.variants?.map((v) => (
                  <div key={v.id} className="grid grid-cols-4 gap-2 bg-white p-2 rounded-lg border border-[#E9DDCA]">
                    <input
                      placeholder="Name AR (e.g. نقشة بحرينية)"
                      value={v.nameAr}
                      onChange={(e) => {
                        v.nameAr = e.target.value;
                        setFormState({ ...formState });
                      }}
                      className="px-2 py-1 bg-[#FAF7F0] rounded border border-[#E9DDCA]"
                    />
                    <input
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => {
                        v.sku = e.target.value;
                        setFormState({ ...formState });
                      }}
                      className="px-2 py-1 bg-[#FAF7F0] rounded border border-[#E9DDCA]"
                    />
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Selling Price"
                      value={v.sellingPrice}
                      onChange={(e) => {
                        v.sellingPrice = parseFloat(e.target.value) || 0;
                        setFormState({ ...formState });
                      }}
                      className="px-2 py-1 bg-[#FAF7F0] rounded border border-[#E9DDCA]"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stockQuantity}
                        onChange={(e) => {
                          v.stockQuantity = parseInt(e.target.value) || 0;
                          setFormState({ ...formState });
                        }}
                        className="w-full px-2 py-1 bg-[#FAF7F0] rounded border border-[#E9DDCA]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(v.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDCA]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-[#E9DDCA] rounded-xl text-neutral-600 font-bold hover:bg-neutral-50"
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
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Barcode Label Printable Sheet */}
      {barcodePrintProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-[#E9DDCA] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDCA] pb-2 no-print">
              <h3 className="font-bold text-sm text-[#252525] flex items-center gap-2">
                <Barcode className="w-4 h-4 text-[#B8862B]" />
                {t.printBarcodeLabel} - {barcodePrintProduct.nameEn}
              </h3>
              <button
                onClick={() => setBarcodePrintProduct(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 no-print">
              <label className="font-bold text-neutral-700">
                {lang === 'ar' ? 'عدد الملصقات للطباعة:' : 'Number of Labels:'}
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={labelCopies}
                onChange={(e) => setLabelCopies(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-1.5 border border-[#E9DDCA] rounded-lg text-center font-bold"
              />
            </div>

            {/* Printable Label Grid */}
            <div id="printable-barcodes" className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-dashed border-[#E9DDCA]">
              {Array.from({ length: labelCopies }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white border border-neutral-300 rounded-lg text-center space-y-1"
                >
                  <p className="font-bold text-[10px] text-neutral-900 tracking-wider">
                    EMANI ART CRAFT
                  </p>
                  <p className="text-[9px] text-neutral-600 truncate font-semibold">
                    {lang === 'ar' ? barcodePrintProduct.nameAr : barcodePrintProduct.nameEn}
                  </p>
                  <div className="py-1 flex justify-center">
                    {/* Visual Barcode Bars Simulation */}
                    <div className="h-9 flex items-center gap-0.5 justify-center px-2 bg-white">
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 4, 1, 2, 3].map((w, i) => (
                        <div
                          key={i}
                          className="bg-black h-full"
                          style={{ width: `${w}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-mono text-[9px] font-bold text-neutral-800">
                    {barcodePrintProduct.barcode}
                  </p>
                  <p className="font-extrabold text-[11px] text-[#8D641D]">
                    {formatBHDLocalized(barcodePrintProduct.sellingPrice, lang)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#B8862B] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#8D641D] transition-colors"
              >
                <Printer className="w-4 h-4" />
                {t.printReceipt}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
