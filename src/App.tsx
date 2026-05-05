import { type CSSProperties, type ChangeEvent, type DragEvent, type FormEvent, type PointerEvent, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FileText,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { EnergyRing, ShaderPlane } from './components/ui/background-paper-shaders';
import './App.css';

const headerItemAnimation = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const languages = ['TR', 'EN', 'DE'];
const blogIndexPageSize = 9;

type AdminProduct = {
  key: string;
  categoryKey: string;
  categoryTitle: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  alt: string;
  badges: string[];
  children: { key: string; title: string; slug: string }[];
  sortOrder: number;
};

type AdminCategory = {
  key: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  sortOrder: number;
};

type BlogTaxonomyItem = {
  key: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder?: number;
};

type BlogPost = {
  key: string;
  title: string;
  summary: string;
  targetKeyword: string;
  content: string;
  slug: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  oldUrl: string;
  seoScore: number;
  status: 'draft' | 'published';
  publishedAt: string;
  categories: BlogTaxonomyItem[];
  tags: BlogTaxonomyItem[];
};

type SiteReference = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type SiteService = {
  key: string;
  title: string;
  summary: string;
  detail: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ReferenceFormState = {
  key: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

type SiteServiceFormState = {
  key: string;
  title: string;
  summary: string;
  detail: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

type ProductFormState = {
  key: string;
  categoryKey: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  sortOrder: string;
  alt: string;
  badges: string;
};

type BlogPostFormState = {
  key: string;
  title: string;
  summary: string;
  targetKeyword: string;
  content: string;
  slug: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  oldUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
  categories: string[];
  tags: string;
};

type CategoryFormState = {
  key: string;
  title: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  sortOrder: string;
};

type AssetItem = {
  key: string;
  url: string;
  size: number;
  uploaded: string | null;
  references?: string[];
  isUsed?: boolean;
};

type AssetFolderKey = 'all' | 'urun' | 'kategori' | 'blog' | 'sayfa' | 'referans' | 'other';

const assetFolderFilters: { key: AssetFolderKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'urun', label: 'Ürün' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'blog', label: 'Blog' },
  { key: 'sayfa', label: 'Sayfa' },
  { key: 'referans', label: 'Referans' },
  { key: 'other', label: 'Diğer' },
];

const getAssetFolderKey = (assetKey: string): AssetFolderKey => {
  const folder = assetKey.split('/')[0] ?? '';

  if (folder === 'kategori' || folder === 'categories') {
    return 'kategori';
  }

  if (folder === 'urun' || folder === 'products') {
    return 'urun';
  }

  if (folder === 'blog') {
    return 'blog';
  }

  if (folder === 'sayfa' || folder === 'admin-avatars') {
    return 'sayfa';
  }

  if (folder === 'referans') {
    return 'referans';
  }

  return 'other';
};

const getAssetFolderLabel = (assetKey: string) =>
  assetFolderFilters.find((folder) => folder.key === getAssetFolderKey(assetKey))?.label ?? 'Diğer';

type ImagePreview = {
  title: string;
  url: string;
} | null;

type ImageVariantKey = 'square' | 'horizontal' | 'vertical';

type CropFocalPoint = {
  x: number;
  y: number;
};

type CropFocalPoints = Record<ImageVariantKey, CropFocalPoint>;
type ImageAssetType = 'product-image' | 'category-image' | 'blog-image' | 'page-image';

type PendingImageCrop = {
  file: File;
  assetType: ImageAssetType;
  previewUrl: string;
  focalPoints: CropFocalPoints;
} | null;

type AdminImageUploadControlProps = {
  value: string;
  onUrlChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (file: File) => void | Promise<void>;
  buttonLabel: string;
  disabled: boolean;
  placeholder?: string;
  required?: boolean;
};

const isDraggingFiles = (event: DragEvent<HTMLElement>) => Array.from(event.dataTransfer.types).includes('Files');

function AdminImageUploadControl({
  value,
  onUrlChange,
  inputRef,
  onFileInputChange,
  onFileDrop,
  buttonLabel,
  disabled,
  placeholder,
  required = false,
}: AdminImageUploadControlProps) {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!isDraggingFiles(event)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!isDraggingFiles(event)) {
      return;
    }

    event.preventDefault();

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files[0];

    if (file) {
      void onFileDrop(file);
    }
  };

  return (
    <div className="adminImageUploadControl" onDragOver={handleDragOver} onDrop={handleDrop}>
      <input
        required={required}
        value={value}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder={placeholder}
      />
      <input
        ref={inputRef}
        className="adminHiddenFileInput"
        type="file"
        accept="image/*"
        aria-label="Görsel dosyası seç"
        onChange={onFileInputChange}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        title="Görsel seçin veya dosyayı bu alana bırakın"
      >
        <Upload size={17} strokeWidth={2.4} />
        {buttonLabel}
      </button>
    </div>
  );
}

const defaultCropFocalPoint: CropFocalPoint = { x: 0.5, y: 0.5 };

const defaultCropFocalPoints: CropFocalPoints = {
  square: defaultCropFocalPoint,
  horizontal: defaultCropFocalPoint,
  vertical: defaultCropFocalPoint,
};

const cropVariantOptions: { key: ImageVariantKey; label: string }[] = [
  { key: 'square', label: 'Kare' },
  { key: 'horizontal', label: 'Yatay' },
  { key: 'vertical', label: 'Dikey' },
];

const getCropVariantOptions = (assetType?: ImageAssetType) =>
  assetType === 'page-image' ? cropVariantOptions.filter((option) => option.key === 'square') : cropVariantOptions;

type SocialLink = {
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

type ContactSettings = {
  phonePrimary: string;
  phoneSecondary: string;
  whatsapp: string;
  service: string;
  email: string;
  address: string;
  googleMapUrl: string;
  appleMapUrl: string;
  footerDescription: string;
};

type PushoverSettings = {
  userKey: string;
  apiToken: string;
  emailAddress: string;
  isActive: boolean;
  hasApiToken?: boolean;
};

type QuoteQuestion = {
  id: string;
  categoryKey: string;
  productKey?: string;
  question: string;
  description: string;
  imageUrl: string;
  answerType: 'text' | 'single' | 'multiple' | 'number';
  options: string[];
  defaultValue: string;
  maxLength: number;
  decimalPlaces: number;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
};

type QuoteQuestionFormState = {
  id: string;
  question: string;
  description: string;
  imageUrl: string;
  answerType: 'text' | 'single' | 'multiple' | 'number';
  options: string;
  defaultValue: string;
  maxLength: string;
  decimalPlaces: string;
  isRequired: boolean;
  isActive: boolean;
};

type AdminUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isActive: boolean;
  modules: string[];
};

type LoginFormState = {
  login: string;
  password: string;
};

type ServiceRequestFormState = {
  requestType: string;
  fullName: string;
  phone: string;
  productKey: string;
  description: string;
};

type QuoteContactFormState = {
  fullName: string;
  phone: string;
  email: string;
};

type QuoteRequest = {
  id: string;
  isAnonymous: boolean;
  categoryKey: string;
  categoryTitle: string;
  productKey: string;
  productTitle: string;
  fullName: string;
  phone: string;
  email: string;
  answers: { questionId?: string; question: string; answer: string | string[] }[];
  whatsappMessage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ServiceRequest = {
  id: string;
  requestType: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  productKey: string;
  productTitle: string;
  description: string;
  status: string;
  emailSent: boolean;
  pushoverSent: boolean;
  createdAt: string;
  updatedAt: string;
};

type AdminSection =
  | 'products'
  | 'blog'
  | 'assets'
  | 'services'
  | 'references'
  | 'quoteQuestions'
  | 'quoteRequests'
  | 'serviceRequests'
  | 'users'
  | 'database';
type SettingsTab = 'footer' | 'contact' | 'pushover';

type DatabaseColumn = {
  name: string;
  type: string;
  isRequired: boolean;
  isPrimaryKey: boolean;
};

type DatabaseTable = {
  name: string;
  rowCount: number;
  sizeBytes: number | null;
  columns: DatabaseColumn[];
};

type AdminUserFormState = {
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  password: string;
  isActive: boolean;
  modules: string[];
};

const adminModuleOptions = [
  { key: 'products', label: 'Ürünler', description: 'Ürün ve kategori yönetimi' },
  { key: 'blog', label: 'Blog', description: 'Blog yazıları, kategori ve SEO yönetimi' },
  { key: 'users', label: 'Kullanıcılar', description: 'Kullanıcı ekleme ve yetki düzenleme' },
  { key: 'settings', label: 'Ayarlar', description: 'Footer ve site ayarları' },
  { key: 'database', label: 'Veritabanı', description: 'D1 tablo ve sütun metadatası' },
];

const socialPlatforms = [
  {
    platform: 'instagram',
    label: 'Instagram',
    defaultUrl: 'https://www.instagram.com/',
    iconUrl: 'https://cdn.simpleicons.org/instagram/ffffff',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    defaultUrl: 'https://www.facebook.com/',
    iconUrl: 'https://cdn.simpleicons.org/facebook/ffffff',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://www.linkedin.com/',
    iconUrl: 'https://cdn.simpleicons.org/linkedin/ffffff',
  },
  {
    platform: 'youtube',
    label: 'YouTube',
    defaultUrl: 'https://www.youtube.com/',
    iconUrl: 'https://cdn.simpleicons.org/youtube/ffffff',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    defaultUrl: 'https://www.tiktok.com/',
    iconUrl: 'https://cdn.simpleicons.org/tiktok/ffffff',
  },
];

const defaultContactSettings: ContactSettings = {
  phonePrimary: '+90 264 291 00 60',
  phoneSecondary: '+90 542 614 29 29',
  whatsapp: '+90 542 614 29 29',
  service: 'Sakarya ve çevre iller',
  email: 'info@hhsotomatikkapi.com',
  address: 'Sakarya ve çevre iller',
  googleMapUrl: '',
  appleMapUrl: '',
  footerDescription: 'Otomatik kapı, bariyer ve geçiş kontrol sistemlerinde keşif, satış, montaj ve teknik destek.',
};

const defaultPushoverSettings: PushoverSettings = {
  userKey: '',
  apiToken: '',
  emailAddress: 'g76fqg9ggn@pomail.net',
  isActive: false,
  hasApiToken: false,
};

const createEmptyQuoteQuestionForm = (): QuoteQuestionFormState => ({
  id: `quote_${crypto.randomUUID()}`,
  question: '',
  description: '',
  imageUrl: '',
  answerType: 'text',
  options: '',
  defaultValue: '',
  maxLength: '',
  decimalPlaces: '0',
  isRequired: false,
  isActive: true,
});

const contactSettingFields: { key: keyof ContactSettings; label: string; placeholder: string }[] = [
  { key: 'phonePrimary', label: 'Telefon 1', placeholder: '+90 264 291 00 60' },
  { key: 'phoneSecondary', label: 'Telefon 2', placeholder: '+90 542 614 29 29' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+90 542 614 29 29 veya https://wa.me/...' },
  { key: 'service', label: 'Servis', placeholder: 'Sakarya ve çevre iller' },
  { key: 'email', label: 'Mail', placeholder: 'info@hhsotomatikkapi.com' },
  { key: 'address', label: 'Adres', placeholder: 'Açık adres' },
  { key: 'googleMapUrl', label: 'Google Map Link', placeholder: 'https://maps.google.com/...' },
  { key: 'appleMapUrl', label: 'Apple Map Link', placeholder: 'https://maps.apple.com/...' },
  {
    key: 'footerDescription',
    label: 'Footer Logo Altı Metin',
    placeholder: 'Footer logo altında gösterilecek kısa açıklama',
  },
];

const serviceRequestTypes = [
  { value: 'Arıza', label: 'Arıza', tone: 'danger', icon: '!' },
  { value: 'Aksesuar Talebi', label: 'Aksesuar Talebi', tone: 'success', icon: '+' },
  { value: 'Periyodik Bakım', label: 'Periyodik Bakım', tone: 'warning', icon: '↻' },
];

const emptyServiceRequestForm: ServiceRequestFormState = {
  requestType: serviceRequestTypes[0].value,
  fullName: '',
  phone: '',
  productKey: '',
  description: '',
};

const emptyReferenceForm: ReferenceFormState = {
  key: `ref_${crypto.randomUUID()}`,
  title: '',
  description: '',
  imageUrl: '',
  sortOrder: '0',
  isActive: true,
};

const emptySiteServiceForm: SiteServiceFormState = {
  key: `srv_${crypto.randomUUID()}`,
  title: '',
  summary: '',
  detail: '',
  imageUrl: '',
  sortOrder: '0',
  isActive: true,
};

const emptyQuoteContactForm: QuoteContactFormState = {
  fullName: '',
  phone: '',
  email: '',
};

const createEmptyProductForm = (categoryKey = ''): ProductFormState => ({
  key: '',
  categoryKey,
  title: '',
  slug: '',
  description: '',
  metaTitle: '',
  metaKeywords: '',
  metaDescription: '',
  image: '',
  imageSquare: '',
  imageHorizontal: '',
  imageVertical: '',
  sortOrder: '0',
  alt: '',
  badges: '',
});

const createEmptyBlogPostForm = (categoryKey = ''): BlogPostFormState => ({
  key: '',
  title: '',
  summary: '',
  targetKeyword: '',
  content: '',
  slug: '',
  metaTitle: '',
  metaKeywords: '',
  metaDescription: '',
  image: '',
  imageAlt: '',
  oldUrl: '',
  status: 'draft',
  publishedAt: '',
  categories: categoryKey ? [categoryKey] : [],
  tags: '',
});

const emptyCategoryForm: CategoryFormState = {
  key: '',
  title: '',
  slug: '',
  description: '',
  metaTitle: '',
  metaKeywords: '',
  metaDescription: '',
  image: '',
  imageSquare: '',
  imageHorizontal: '',
  imageVertical: '',
  sortOrder: '0',
};

const parseSortOrder = (value: string) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getQuoteNumberDecimalPlaces = (question: QuoteQuestion) =>
  Math.min(6, Math.max(0, Math.trunc(question.decimalPlaces ?? 0)));

const getQuoteNumberStep = (question: QuoteQuestion) => {
  const decimalPlaces = getQuoteNumberDecimalPlaces(question);

  return decimalPlaces > 0 ? 1 / 10 ** decimalPlaces : 1;
};

const formatQuoteNumberAnswer = (value: number, question: QuoteQuestion) =>
  value.toFixed(getQuoteNumberDecimalPlaces(question));

const emptyAdminUserForm: AdminUserFormState = {
  username: '',
  email: '',
  displayName: '',
  avatarUrl: '',
  password: '',
  isActive: true,
  modules: ['products'],
};

const adminTokenStorageKey = 'hhs.admin.token';

const formatTableSize = (sizeBytes: number | null) => {
  if (sizeBytes === null) {
    return 'Hesaplanamadı';
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
};

const normalizeTurkishText = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const createSlugFromTitle = (title: string) =>
  normalizeTurkishText(title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createProductKeyFromTitle = (title: string) => {
  const words = normalizeTurkishText(title).match(/[a-z0-9]+/g) ?? [];

  return words
    .map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
    .join('');
};

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

const countKeywordMatches = (value: string, keyword: string) => {
  const normalizedValue = normalizeTurkishText(value);
  const normalizedKeyword = normalizeTurkishText(keyword);

  if (!normalizedKeyword) {
    return 0;
  }

  return normalizedValue.split(normalizedKeyword).length - 1;
};

const includesKeyword = (value: string, keyword: string) => countKeywordMatches(value, keyword) > 0;

const calculateBlogSeo = (form: BlogPostFormState) => {
  const summaryWordCount = countWords(form.summary);
  const summaryKeywordCount = countKeywordMatches(form.summary, form.targetKeyword);
  const summaryKeywordDensity = summaryWordCount > 0 ? (summaryKeywordCount / summaryWordCount) * 100 : 0;
  const checks = [
    { label: 'Hedef kelime tanımlandı.', passed: Boolean(form.targetKeyword.trim()) },
    { label: 'Blog adı boş bırakılamaz.', passed: Boolean(form.title.trim()) },
    { label: 'Hedef kelime Blog başlığı içerisinde geçiyor.', passed: includesKeyword(form.title, form.targetKeyword) },
    { label: 'Blog açıklama alanı boş bırakılamaz.', passed: Boolean(form.summary.trim()) },
    { label: 'Hedef kelime Blog açıklaması içerisinde geçiyor.', passed: includesKeyword(form.summary, form.targetKeyword) },
    {
      label: `Blog açıklama alanı en az 50 kelime içermelidir. Kelime Sayısı: ${summaryWordCount}`,
      passed: summaryWordCount >= 50,
    },
    {
      label: `Hedef kelime, Blog açıklamasında %${summaryKeywordDensity.toFixed(2)} oranında geçmektedir.`,
      passed: summaryKeywordDensity > 0,
    },
    { label: 'Blog sayfa başlığı boş olamaz.', passed: Boolean(form.metaTitle.trim()) },
    {
      label: `Blog sayfa başlığı alanı minimum 20 maksimum 60 karakter içermelidir. Karakter Sayısı: ${form.metaTitle.length}`,
      passed: form.metaTitle.length >= 20 && form.metaTitle.length <= 60,
    },
    { label: 'Hedef kelime Blog sayfa başlığı içerisinde geçmelidir.', passed: includesKeyword(form.metaTitle, form.targetKeyword) },
    { label: 'Blog meta açıklaması boş olamaz.', passed: Boolean(form.metaDescription.trim()) },
    {
      label: `Blog meta açıklama alanı minimum 50 maksimum 155 karakter içermelidir. Karakter sayısı: ${form.metaDescription.length}`,
      passed: form.metaDescription.length >= 50 && form.metaDescription.length <= 155,
    },
    { label: 'Hedef kelime Blog açıklama içerisinde geçiyor.', passed: includesKeyword(form.metaDescription, form.targetKeyword) },
  ];

  return {
    checks,
    score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
    summaryKeywordDensity,
  };
};

const withImageVariantFallbacks = <
  T extends {
    image?: string;
    imageSquare?: string;
    imageHorizontal?: string;
    imageVertical?: string;
  },
>(
  item: T,
) => {
  const fallbackImage = item.imageHorizontal || item.imageSquare || item.imageVertical || item.image || '';

  return {
    image: item.image || fallbackImage,
    imageSquare: item.imageSquare || fallbackImage,
    imageHorizontal: item.imageHorizontal || fallbackImage,
    imageVertical: item.imageVertical || fallbackImage,
  };
};

const apiUrl = (path: string) => {
  if (typeof window === 'undefined') {
    return path;
  }

  return window.location.hostname === 'hhsotomatikkapi.com' ? path : `https://hhsotomatikkapi.com${path}`;
};

const createPhoneHref = (phone: string) => {
  const normalizedPhone = phone.replace(/[^\d+]/g, '');

  return normalizedPhone ? `tel:${normalizedPhone}` : '#iletisim';
};

const createWhatsAppHref = (whatsapp: string) => {
  const trimmedWhatsapp = whatsapp.trim();

  if (/^https?:\/\//i.test(trimmedWhatsapp)) {
    return trimmedWhatsapp;
  }

  const digits = trimmedWhatsapp.replace(/\D/g, '');

  return digits ? `https://wa.me/${digits}` : '#iletisim';
};

const createMailHref = (email: string) => {
  const trimmedEmail = email.trim();

  return trimmedEmail ? `mailto:${trimmedEmail}` : '#iletisim';
};

const canvasToWebpBlob = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Görsel WebP formatına dönüştürülemedi.'));
          return;
        }

        resolve(blob);
      },
      'image/webp',
      0.82,
    );
  });
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const optimizeProductImage = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const maxHeight = 1200;
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('Görsel işleme başlatılamadı.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvasToWebpBlob(canvas);
};

const cropImageBitmapToWebp = async (
  bitmap: ImageBitmap,
  width: number,
  height: number,
  focalPoint: CropFocalPoint = defaultCropFocalPoint,
) => {
  const sourceRatio = bitmap.width / bitmap.height;
  const targetRatio = width / height;
  const sourceWidth = sourceRatio >= targetRatio ? bitmap.height * targetRatio : bitmap.width;
  const sourceHeight = sourceRatio >= targetRatio ? bitmap.height : bitmap.width / targetRatio;
  const sourceX = clamp(bitmap.width * focalPoint.x - sourceWidth / 2, 0, bitmap.width - sourceWidth);
  const sourceY = clamp(bitmap.height * focalPoint.y - sourceHeight / 2, 0, bitmap.height - sourceHeight);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Görsel kırpma başlatılamadı.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

  return canvasToWebpBlob(canvas);
};

const createProductImageVariants = async (file: File, focalPoints: CropFocalPoints = defaultCropFocalPoints) => {
  const bitmap = await createImageBitmap(file);
  const variantSizes = {
    square: { width: 1200, height: 1200 },
    horizontal: { width: 1600, height: 900 },
    vertical: { width: 900, height: 1200 },
  };

  try {
    return {
      square: await cropImageBitmapToWebp(
        bitmap,
        variantSizes.square.width,
        variantSizes.square.height,
        focalPoints.square,
      ),
      horizontal: await cropImageBitmapToWebp(
        bitmap,
        variantSizes.horizontal.width,
        variantSizes.horizontal.height,
        focalPoints.horizontal,
      ),
      vertical: await cropImageBitmapToWebp(
        bitmap,
        variantSizes.vertical.width,
        variantSizes.vertical.height,
        focalPoints.vertical,
      ),
    };
  } finally {
    bitmap.close();
  }
};

function App() {
  const isPanelPage = window.location.pathname.toLowerCase() === '/panel';
  const isBlogIndexPage = window.location.pathname.toLowerCase() === '/blog';
  const blogSlug = window.location.pathname.match(/^\/blog\/([^/]+)$/)?.[1] ?? '';
  const [language, setLanguage] = useState('TR');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [isServiceTypeMenuOpen, setIsServiceTypeMenuOpen] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [activeLatestBlogIndex, setActiveLatestBlogIndex] = useState(0);
  const [selectedQuoteCategoryKey, setSelectedQuoteCategoryKey] = useState('');
  const [selectedQuoteProductKey, setSelectedQuoteProductKey] = useState('');
  const [hoveredCategoryGalleryIndex, setHoveredCategoryGalleryIndex] = useState<number | null>(null);
  const [selectedCategoryGalleryIndex, setSelectedCategoryGalleryIndex] = useState<number | null>(null);
  const [selectedSiteService, setSelectedSiteService] = useState<SiteService | null>(null);
  const [hasQuoteButtonEntered, setHasQuoteButtonEntered] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>('products');
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [adminProductCategoryFilter, setAdminProductCategoryFilter] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [currentBlogPage, setCurrentBlogPage] = useState(1);
  const [isLoadingMoreBlogPosts, setIsLoadingMoreBlogPosts] = useState(false);
  const [hasMoreBlogPosts, setHasMoreBlogPosts] = useState(false);
  const [blogCategories, setBlogCategories] = useState<BlogTaxonomyItem[]>([]);
  const [blogTags, setBlogTags] = useState<BlogTaxonomyItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [siteReferences, setSiteReferences] = useState<SiteReference[]>([]);
  const [siteServices, setSiteServices] = useState<SiteService[]>([]);
  const [quoteQuestions, setQuoteQuestions] = useState<QuoteQuestion[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings);
  const [pushoverSettings, setPushoverSettings] = useState<PushoverSettings>(defaultPushoverSettings);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [assetViewMode, setAssetViewMode] = useState<'all' | 'unused'>('all');
  const [activeAssetFolder, setActiveAssetFolder] = useState<AssetFolderKey>('all');
  const [selectedAssetKeys, setSelectedAssetKeys] = useState<Set<string>>(new Set());
  const [imagePreview, setImagePreview] = useState<ImagePreview>(null);
  const [pendingImageCrop, setPendingImageCrop] = useState<PendingImageCrop>(null);
  const [selectedDatabaseTable, setSelectedDatabaseTable] = useState<DatabaseTable | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [isSiteServiceModalOpen, setIsSiteServiceModalOpen] = useState(false);
  const [isQuoteQuestionModalOpen, setIsQuoteQuestionModalOpen] = useState(false);
  const [isSavingSocialLinks, setIsSavingSocialLinks] = useState(false);
  const [isSavingContactSettings, setIsSavingContactSettings] = useState(false);
  const [isSavingQuoteQuestions, setIsSavingQuoteQuestions] = useState(false);
  const [isSavingPushoverSettings, setIsSavingPushoverSettings] = useState(false);
  const [isSubmittingQuoteRequest, setIsSubmittingQuoteRequest] = useState(false);
  const [isSubmittingServiceRequest, setIsSubmittingServiceRequest] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isLoadingDatabaseTables, setIsLoadingDatabaseTables] = useState(false);
  const [isLoadingQuoteRequests, setIsLoadingQuoteRequests] = useState(false);
  const [isLoadingServiceRequests, setIsLoadingServiceRequests] = useState(false);
  const [closingRequestId, setClosingRequestId] = useState('');
  const [isSendingPushoverTest, setIsSendingPushoverTest] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isDeletingSelectedAssets, setIsDeletingSelectedAssets] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isUploadingBlogImage, setIsUploadingBlogImage] = useState(false);
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [isUploadingQuoteQuestionImage, setIsUploadingQuoteQuestionImage] = useState(false);
  const [isUploadingReferenceImage, setIsUploadingReferenceImage] = useState(false);
  const [isUploadingSiteServiceImage, setIsUploadingSiteServiceImage] = useState(false);
  const [isUploadingUserAvatar, setIsUploadingUserAvatar] = useState(false);
  const [isConfirmingProductDelete, setIsConfirmingProductDelete] = useState(false);
  const [isConfirmingCategoryDelete, setIsConfirmingCategoryDelete] = useState(false);
  const [isConfirmingUserDisable, setIsConfirmingUserDisable] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('footer');
  const [socialLinkForm, setSocialLinkForm] = useState<Record<string, string>>({});
  const [quoteQuestionCategoryKey, setQuoteQuestionCategoryKey] = useState('');
  const [quoteQuestionProductKey, setQuoteQuestionProductKey] = useState('');
  const [quoteQuestionFormCategoryKey, setQuoteQuestionFormCategoryKey] = useState('');
  const [quoteQuestionFormProductKey, setQuoteQuestionFormProductKey] = useState('');
  const [quoteQuestionForm, setQuoteQuestionForm] = useState<QuoteQuestionFormState>(createEmptyQuoteQuestionForm());
  const [quoteAnswers, setQuoteAnswers] = useState<Record<string, string | string[]>>({});
  const [quoteContactForm, setQuoteContactForm] = useState<QuoteContactFormState>(emptyQuoteContactForm);
  const [quoteSubmitMessage, setQuoteSubmitMessage] = useState('');
  const [contactSettingsForm, setContactSettingsForm] = useState<ContactSettings>(defaultContactSettings);
  const [pushoverSettingsForm, setPushoverSettingsForm] = useState<PushoverSettings>(defaultPushoverSettings);
  const [serviceRequestForm, setServiceRequestForm] = useState<ServiceRequestFormState>(emptyServiceRequestForm);
  const [serviceRequestMessage, setServiceRequestMessage] = useState('');
  const [editingProductKey, setEditingProductKey] = useState<string | null>(null);
  const [editingBlogKey, setEditingBlogKey] = useState<string | null>(null);
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingQuoteQuestionId, setEditingQuoteQuestionId] = useState<string | null>(null);
  const [editingReferenceKey, setEditingReferenceKey] = useState<string | null>(null);
  const [editingSiteServiceKey, setEditingSiteServiceKey] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm());
  const [blogPostForm, setBlogPostForm] = useState<BlogPostFormState>(createEmptyBlogPostForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [referenceForm, setReferenceForm] = useState<ReferenceFormState>(emptyReferenceForm);
  const [siteServiceForm, setSiteServiceForm] = useState<SiteServiceFormState>(emptySiteServiceForm);
  const [adminUserForm, setAdminUserForm] = useState<AdminUserFormState>(emptyAdminUserForm);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'anonymous'>(
    isPanelPage ? 'checking' : 'anonymous',
  );
  const [loginForm, setLoginForm] = useState<LoginFormState>({ login: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const blogImageInputRef = useRef<HTMLInputElement>(null);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const quoteQuestionImageInputRef = useRef<HTMLInputElement>(null);
  const referenceImageInputRef = useRef<HTMLInputElement>(null);
  const siteServiceImageInputRef = useRef<HTMLInputElement>(null);
  const cropPointRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cropPreviewImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

  const authorizedFetch = useCallback((path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);

    if (adminToken) {
      headers.set('authorization', `Bearer ${adminToken}`);
    }

    return fetch(apiUrl(path), {
      ...init,
      headers,
    });
  }, [adminToken]);

  const readApiJson = async <T,>(request: Promise<Response>) => {
    try {
      const response = await request;
      const data = (await response.json().catch(() => null)) as T | null;

      return { response, data };
    } catch {
      return { response: null, data: null };
    }
  };

  const loadBlogPage = useCallback(async (page: number) => {
    if (!isBlogIndexPage || isLoadingMoreBlogPosts || page < 1) {
      return;
    }

    setIsLoadingMoreBlogPosts(true);

    try {
      const offset = (page - 1) * blogIndexPageSize;
      const response = await fetch(apiUrl(`/api/blog-posts?limit=${blogIndexPageSize}&offset=${offset}`));
      const data = (await response.json().catch(() => null)) as { posts?: BlogPost[] } | null;
      const nextPosts = data?.posts ?? [];

      if (!response.ok) {
        setHasMoreBlogPosts(false);
        return;
      }

      setBlogPosts(nextPosts);
      setCurrentBlogPage(page);
      setHasMoreBlogPosts(nextPosts.length === blogIndexPageSize);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoadingMoreBlogPosts(false);
    }
  }, [isBlogIndexPage, isLoadingMoreBlogPosts]);

  const canAccessModule = (moduleKey: string) => {
    return Boolean(adminUser?.modules.includes(moduleKey));
  };

  const getAdminSectionModuleKey = (section: AdminSection) => {
    if (section === 'assets') {
      return 'products';
    }

    if (
      section === 'services' ||
      section === 'references' ||
      section === 'quoteQuestions' ||
      section === 'quoteRequests' ||
      section === 'serviceRequests'
    ) {
      return 'settings';
    }

    return section;
  };

  const canAccessAdminSection = (section: AdminSection) => {
    return canAccessModule(getAdminSectionModuleKey(section));
  };

  const activeAdminSection = canAccessAdminSection(adminSection)
    ? adminSection
    : canAccessAdminSection('products')
      ? 'products'
      : canAccessAdminSection('blog')
        ? 'blog'
        : canAccessAdminSection('quoteQuestions')
          ? 'quoteQuestions'
          : canAccessAdminSection('services')
            ? 'services'
            : canAccessAdminSection('references')
              ? 'references'
              : canAccessAdminSection('quoteRequests')
                ? 'quoteRequests'
                : canAccessAdminSection('serviceRequests')
                  ? 'serviceRequests'
                  : canAccessAdminSection('users')
                    ? 'users'
                    : 'database';
  const phonePrimaryHref = createPhoneHref(contactSettings.phonePrimary);
  const phoneSecondaryHref = createPhoneHref(contactSettings.phoneSecondary);
  const whatsappHref = createWhatsAppHref(contactSettings.whatsapp);
  const emailHref = createMailHref(contactSettings.email);
  const selectedServiceRequestType =
    serviceRequestTypes.find((requestType) => requestType.value === serviceRequestForm.requestType) ??
    serviceRequestTypes[0];
  const categoryGalleryImages = adminCategories
    .map((category) => {
      const categoryFallbackProduct = adminProducts.find((product) => product.categoryKey === category.key);

      return {
        title: category.title,
        url:
          category.imageHorizontal ||
          category.image ||
          category.imageSquare ||
          category.imageVertical ||
          categoryFallbackProduct?.imageHorizontal ||
          categoryFallbackProduct?.image ||
          categoryFallbackProduct?.imageSquare ||
          categoryFallbackProduct?.imageVertical ||
          '',
      };
    })
    .filter((item): item is { title: string; url: string } => Boolean(item.url));
  const quoteCategories = adminCategories.map((category) => {
    const fallbackProduct = adminProducts.find((product) => product.categoryKey === category.key);

    return {
      ...category,
      image: category.imageSquare || category.imageHorizontal || category.image || fallbackProduct?.imageSquare || fallbackProduct?.imageHorizontal || fallbackProduct?.image || '',
      productCount: adminProducts.filter((product) => product.categoryKey === category.key).length,
    };
  });
  const selectedQuoteCategory = quoteCategories.find((category) => category.key === selectedQuoteCategoryKey);
  const quoteProducts = selectedQuoteCategoryKey
    ? adminProducts.filter((product) => product.categoryKey === selectedQuoteCategoryKey)
    : [];
  const selectedQuoteProduct = quoteProducts.find((product) => product.key === selectedQuoteProductKey);
  const activeQuoteQuestions = selectedQuoteCategoryKey && selectedQuoteProductKey
    ? quoteQuestions.filter(
        (question) =>
          question.categoryKey === selectedQuoteCategoryKey &&
          (question.productKey ? question.productKey === selectedQuoteProductKey : true) &&
          question.isActive,
      )
    : [];
  const quoteQuestionProducts = quoteQuestionCategoryKey
    ? adminProducts.filter((product) => product.categoryKey === quoteQuestionCategoryKey)
    : [];
  const quoteQuestionFormProducts = quoteQuestionFormCategoryKey
    ? adminProducts.filter((product) => product.categoryKey === quoteQuestionFormCategoryKey)
    : [];
  const filteredQuoteQuestions = quoteQuestions
    .filter(
      (question) =>
        (!quoteQuestionCategoryKey || question.categoryKey === quoteQuestionCategoryKey) &&
        (!quoteQuestionProductKey || question.productKey === quoteQuestionProductKey),
    )
    .sort((firstQuestion, secondQuestion) => {
      const categoryCompare = firstQuestion.categoryKey.localeCompare(secondQuestion.categoryKey);

      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      const productCompare = (firstQuestion.productKey ?? '').localeCompare(secondQuestion.productKey ?? '');

      if (productCompare !== 0) {
        return productCompare;
      }

      return firstQuestion.sortOrder - secondQuestion.sortOrder;
    });
  const visibleAssets = assets.filter(
    (asset) => activeAssetFolder === 'all' || getAssetFolderKey(asset.key) === activeAssetFolder,
  );
  const visibleAdminProducts = adminProductCategoryFilter
    ? adminProducts.filter((product) => product.categoryKey === adminProductCategoryFilter)
    : adminProducts;
  const selectedVisibleAssetCount = visibleAssets.filter((asset) => selectedAssetKeys.has(asset.key)).length;
  const quoteAnswerSummary = activeQuoteQuestions
    .map((question) => {
      const answer = quoteAnswers[question.id];
      const answerText = Array.isArray(answer) ? answer.join(', ') : answer;

      return answerText ? `${question.question}: ${answerText}` : '';
    })
    .filter(Boolean)
    .join('\n');
  const quotePhoneDigits = quoteContactForm.phone.replace(/\D/g, '').slice(0, 10);
  const quoteFullPhone = quotePhoneDigits ? `+90 ${quotePhoneDigits}` : '';
  const isQuoteContactComplete =
    quoteContactForm.fullName.trim().length > 1 &&
    quotePhoneDigits.length === 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteContactForm.email.trim());
  const quoteContinueMessage = [
    'Merhaba, teklif almak istiyorum.',
    selectedQuoteCategory ? `Kategori: ${selectedQuoteCategory.title}` : '',
    selectedQuoteProduct ? `Ürün: ${selectedQuoteProduct.title}` : '',
    quoteContactForm.fullName.trim() ? `Ad Soyad: ${quoteContactForm.fullName.trim()}` : '',
    quoteFullPhone ? `Telefon: ${quoteFullPhone}` : '',
    quoteContactForm.email.trim() ? `Mail: ${quoteContactForm.email.trim()}` : '',
    quoteAnswerSummary,
  ]
    .filter(Boolean)
    .join('\n');
  const isQuoteContinueDisabled =
    Boolean(selectedQuoteCategory && !selectedQuoteProduct) ||
    activeQuoteQuestions.some((question) => {
      if (!question.isRequired) {
        return false;
      }

      const answer = quoteAnswers[question.id];

      return Array.isArray(answer) ? answer.length === 0 : !answer?.trim();
    });
  const publishedBlogPosts = blogPosts.filter((post) => post.status === 'published');
  const latestBlogPosts = publishedBlogPosts.slice(0, 5);
  const normalizedLatestBlogIndex = latestBlogPosts.length ? activeLatestBlogIndex % latestBlogPosts.length : 0;
  const activeLatestBlogPost = latestBlogPosts[normalizedLatestBlogIndex];
  const blogSeo = calculateBlogSeo(blogPostForm);
  const activeSiteReferences = siteReferences.filter((reference) => reference.isActive);
  const openQuoteRequestCount = quoteRequests.filter((request) => request.status !== 'closed').length;
  const openServiceRequestCount = serviceRequests.filter((request) => request.status !== 'closed').length;

  const getAdminCategoryTitle = (categoryKey: string) =>
    adminCategories.find((category) => category.key === categoryKey)?.title ?? categoryKey;
  const getAdminProductTitle = (productKey?: string) =>
    adminProducts.find((product) => product.key === productKey)?.title ?? productKey ?? 'Genel';
  const formatAdminDateTime = (value: string) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('tr-TR');
  };
  const formatQuoteRequestAnswer = (answer: string | string[]) => (Array.isArray(answer) ? answer.join(', ') : answer);
  const getQuoteQuestionAnswerTypeLabel = (answerType: QuoteQuestion['answerType']) => {
    if (answerType === 'text') {
      return 'Metin';
    }

    if (answerType === 'single') {
      return 'Tek seçim';
    }

    if (answerType === 'multiple') {
      return 'Çoklu seçim';
    }

    return 'Sayı';
  };

  const openCategoryGalleryImage = (index: number) => {
    setSelectedCategoryGalleryIndex(index);
  };

  const closeCategoryGalleryImage = () => {
    setSelectedCategoryGalleryIndex(null);
  };

  const goToNextCategoryGalleryImage = () => {
    setSelectedCategoryGalleryIndex((currentIndex) =>
      currentIndex === null || categoryGalleryImages.length === 0
        ? currentIndex
        : (currentIndex + 1) % categoryGalleryImages.length,
    );
  };

  const goToPreviousCategoryGalleryImage = () => {
    setSelectedCategoryGalleryIndex((currentIndex) =>
      currentIndex === null || categoryGalleryImages.length === 0
        ? currentIndex
        : (currentIndex - 1 + categoryGalleryImages.length) % categoryGalleryImages.length,
    );
  };

  const getCategoryGalleryFlexValue = (index: number) => {
    if (hoveredCategoryGalleryIndex === null) {
      return 1;
    }

    return hoveredCategoryGalleryIndex === index ? 2 : 0.5;
  };

  const showNextLatestBlogPost = () => {
    if (latestBlogPosts.length === 0) {
      return;
    }

    setActiveLatestBlogIndex((currentIndex) => (currentIndex + 1) % latestBlogPosts.length);
  };

  const showPreviousLatestBlogPost = () => {
    if (latestBlogPosts.length === 0) {
      return;
    }

    setActiveLatestBlogIndex((currentIndex) => (currentIndex - 1 + latestBlogPosts.length) % latestBlogPosts.length);
  };

  const getLatestBlogImageStyle = (index: number): CSSProperties => {
    if (latestBlogPosts.length <= 1) {
      return { opacity: 1, transform: 'translateX(-50%) translateY(0) scale(1)', zIndex: 3 };
    }

    const isActive = index === normalizedLatestBlogIndex;
    const isPrevious = index === (normalizedLatestBlogIndex - 1 + latestBlogPosts.length) % latestBlogPosts.length;
    const isNext = index === (normalizedLatestBlogIndex + 1) % latestBlogPosts.length;

    if (isActive) {
      return { opacity: 1, pointerEvents: 'auto', transform: 'translateX(-50%) translateY(0) scale(1)', zIndex: 3 };
    }

    if (isPrevious) {
      return {
        opacity: 0.92,
        pointerEvents: 'auto',
        transform: 'translateX(calc(-50% - clamp(54px, 13vw, 104px))) translateY(-56px) scale(0.78) rotateY(16deg)',
        zIndex: 2,
      };
    }

    if (isNext) {
      return {
        opacity: 0.92,
        pointerEvents: 'auto',
        transform: 'translateX(calc(-50% + clamp(54px, 13vw, 104px))) translateY(-56px) scale(0.78) rotateY(-16deg)',
        zIndex: 2,
      };
    }

    return { opacity: 0, pointerEvents: 'none', transform: 'translateX(-50%) translateY(24px) scale(0.66)', zIndex: 1 };
  };

  const closePendingImageCrop = () => {
    setPendingImageCrop((currentCrop) => {
      if (currentCrop) {
        URL.revokeObjectURL(currentCrop.previewUrl);
      }

      return null;
    });
  };

  useEffect(() => {
    if (!pendingImageCrop) {
      return;
    }

    getCropVariantOptions(pendingImageCrop.assetType).forEach(({ key }, index) => {
      const focalPoint = pendingImageCrop.focalPoints[key];
      const cropPointElement = cropPointRefs.current[index];
      const imageElement = cropPreviewImageRefs.current[index];

      if (cropPointElement) {
        cropPointElement.style.left = `${focalPoint.x * 100}%`;
        cropPointElement.style.top = `${focalPoint.y * 100}%`;
      }

      if (imageElement) {
        imageElement.style.objectPosition = `${focalPoint.x * 100}% ${focalPoint.y * 100}%`;
      }
    });
  }, [pendingImageCrop]);

  useEffect(() => {
    if (latestBlogPosts.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveLatestBlogIndex((currentIndex) => (currentIndex + 1) % latestBlogPosts.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [latestBlogPosts.length]);

  useEffect(() => {
    if (!isPanelPage) {
      return;
    }

    const verifyStoredSession = async () => {
      const storedToken = window.localStorage.getItem(adminTokenStorageKey);

      if (!storedToken) {
        setAuthStatus('anonymous');
        return;
      }

      try {
        const response = await fetch(apiUrl('/api/auth/me'), {
          headers: {
            authorization: `Bearer ${storedToken}`,
          },
        });
        const data = (await response.json()) as { user?: AdminUser };

        if (!response.ok || !data.user) {
          window.localStorage.removeItem(adminTokenStorageKey);
          setAuthStatus('anonymous');
          return;
        }

        setAdminToken(storedToken);
        setAdminUser(data.user);
        setAuthStatus('authenticated');
      } catch {
        setAuthStatus('anonymous');
      }
    };

    void verifyStoredSession();
  }, [isPanelPage]);

  useEffect(() => {
    const loadCatalog = async () => {
      if (isPanelPage && authStatus !== 'authenticated') {
        return;
      }

      try {
        const [
          productsResult,
          categoriesResult,
          socialLinksResult,
          contactSettingsResult,
          siteServicesResult,
          referencesResult,
          quoteQuestionsResult,
          pushoverSettingsResult,
          quoteRequestsResult,
          serviceRequestsResult,
          blogPostsResult,
          blogCategoriesResult,
          blogTagsResult,
        ] =
          await Promise.all([
            readApiJson<{ products?: AdminProduct[] }>(fetch(apiUrl('/api/products'))),
            readApiJson<{ categories?: AdminCategory[] }>(fetch(apiUrl('/api/product-categories'))),
            readApiJson<{ links?: SocialLink[] }>(fetch(apiUrl('/api/footer-social-links'))),
            readApiJson<{ settings?: ContactSettings }>(fetch(apiUrl('/api/contact-settings'))),
            readApiJson<{ services?: SiteService[] }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/services?includeInactive=1')
                : fetch(apiUrl('/api/services')),
            ),
            readApiJson<{ references?: SiteReference[] }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/references?includeInactive=1')
                : fetch(apiUrl('/api/references')),
            ),
            readApiJson<{ questions?: QuoteQuestion[] }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/quote-questions?includeInactive=1')
                : fetch(apiUrl('/api/quote-questions')),
            ),
            readApiJson<{ settings?: PushoverSettings }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/pushover-settings')
                : Promise.resolve(new Response('{}', { status: 200 })),
            ),
            readApiJson<{ requests?: QuoteRequest[] }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/quote-requests')
                : Promise.resolve(new Response('{}', { status: 200 })),
            ),
            readApiJson<{ requests?: ServiceRequest[] }>(
              isPanelPage && adminUser?.modules.includes('settings')
                ? authorizedFetch('/api/service-requests')
                : Promise.resolve(new Response('{}', { status: 200 })),
            ),
            readApiJson<{ posts?: BlogPost[] }>(
              isPanelPage && adminUser?.modules.includes('blog')
                ? authorizedFetch('/api/blog-posts?includeDrafts=1')
                : fetch(apiUrl(`/api/blog-posts?limit=${isBlogIndexPage ? blogIndexPageSize : 5}`)),
            ),
            readApiJson<{ categories?: BlogTaxonomyItem[] }>(fetch(apiUrl('/api/blog-categories'))),
            readApiJson<{ tags?: BlogTaxonomyItem[] }>(fetch(apiUrl('/api/blog-tags'))),
          ]);
        const productsData = productsResult.data ?? {};
        const categoriesData = categoriesResult.data ?? {};
        const socialLinksData = socialLinksResult.data ?? {};
        const contactSettingsData = contactSettingsResult.data ?? {};
        const siteServicesData = siteServicesResult.data ?? {};
        const referencesData = referencesResult.data ?? {};
        const quoteQuestionsData = quoteQuestionsResult.data ?? {};
        const pushoverSettingsData = pushoverSettingsResult.data ?? {};
        const quoteRequestsData = quoteRequestsResult.data ?? {};
        const serviceRequestsData = serviceRequestsResult.data ?? {};
        const blogPostsData = blogPostsResult.data ?? {};
        const blogCategoriesData = blogCategoriesResult.data ?? {};
        const blogTagsData = blogTagsResult.data ?? {};

        if (productsData.products) {
          setAdminProducts(productsData.products);
        }

        if (categoriesData.categories) {
          setAdminCategories(categoriesData.categories);
        }

        if (socialLinksData.links) {
          setSocialLinks(socialLinksData.links);
          setSocialLinkForm(
            Object.fromEntries(socialLinksData.links.map((link) => [link.platform, link.url])),
          );
        }

        if (contactSettingsData.settings) {
          setContactSettings(contactSettingsData.settings);
          setContactSettingsForm(contactSettingsData.settings);
        }

        if (siteServicesData.services) {
          setSiteServices(siteServicesData.services);
        }

        if (referencesData.references) {
          setSiteReferences(referencesData.references);
        }

        if (quoteQuestionsData.questions) {
          setQuoteQuestions(quoteQuestionsData.questions);
        }

        if (pushoverSettingsData.settings) {
          setPushoverSettings(pushoverSettingsData.settings);
          setPushoverSettingsForm({ ...pushoverSettingsData.settings, apiToken: '' });
        }

        if (quoteRequestsData.requests) {
          setQuoteRequests(quoteRequestsData.requests);
        }

        if (serviceRequestsData.requests) {
          setServiceRequests(serviceRequestsData.requests);
        }

        if (blogPostsData.posts) {
          setBlogPosts(blogPostsData.posts);

          if (isBlogIndexPage) {
            setCurrentBlogPage(1);
            setHasMoreBlogPosts(blogPostsData.posts.length === blogIndexPageSize);
          }
        }

        if (blogCategoriesData.categories) {
          setBlogCategories(blogCategoriesData.categories);
        }

        if (blogTagsData.tags) {
          setBlogTags(blogTagsData.tags);
        }

        if (blogSlug) {
          const blogPostResponse = await fetch(apiUrl(`/api/blog-posts/${encodeURIComponent(blogSlug)}`));
          const blogPostData = (await blogPostResponse.json().catch(() => null)) as { post?: BlogPost } | null;
          setSelectedBlogPost(blogPostData?.post ?? null);
        }

        if (isPanelPage && adminUser?.modules.includes('users')) {
          const usersResponse = await fetch(apiUrl('/api/admin-users'), {
            headers: {
              authorization: `Bearer ${adminToken}`,
            },
          });
          const usersData = (await usersResponse.json()) as { users?: AdminUser[] };

          if (usersResponse.status === 401) {
            setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            window.localStorage.removeItem(adminTokenStorageKey);
            setAdminToken('');
            setAdminUser(null);
            setAuthStatus('anonymous');
            return;
          }

          if (usersData.users) {
            setAdminUsers(usersData.users);
          }
        }
      } catch {
        if (isPanelPage) {
          setAdminMessage('Canlı D1 ürün verileri yüklenemedi.');
        }
      }
    };

    void loadCatalog();
  }, [adminToken, authStatus, adminUser, authorizedFetch, blogSlug, isBlogIndexPage, isPanelPage]);

  useEffect(() => {
    const closeModalWithEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();

      if (pendingImageCrop) {
        closePendingImageCrop();
        return;
      }

      if (selectedCategoryGalleryIndex !== null) {
        setSelectedCategoryGalleryIndex(null);
        return;
      }

      if (selectedSiteService) {
        setSelectedSiteService(null);
        return;
      }

      if (imagePreview) {
        setImagePreview(null);
        return;
      }

      if (isAssetManagerOpen) {
        setIsAssetManagerOpen(false);
        return;
      }

      if (isContactMenuOpen) {
        setIsContactMenuOpen(false);
        return;
      }

      if (isHeaderMenuOpen) {
        setIsHeaderMenuOpen(false);
        return;
      }

      if (isServiceTypeMenuOpen) {
        setIsServiceTypeMenuOpen(false);
        return;
      }

      if (selectedDatabaseTable) {
        setSelectedDatabaseTable(null);
        return;
      }

      if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
        return;
      }

      if (isUserModalOpen) {
        setIsUserModalOpen(false);
        setEditingUserId(null);
        setIsConfirmingUserDisable(false);
        return;
      }

      if (isQuoteQuestionModalOpen) {
        setIsQuoteQuestionModalOpen(false);
        setEditingQuoteQuestionId(null);
        return;
      }

      if (isSiteServiceModalOpen) {
        setIsSiteServiceModalOpen(false);
        setEditingSiteServiceKey(null);
        return;
      }

      if (isReferenceModalOpen) {
        setIsReferenceModalOpen(false);
        setEditingReferenceKey(null);
        return;
      }

      if (isCategoryModalOpen) {
        setIsCategoryModalOpen(false);
        setEditingCategoryKey(null);
        setIsConfirmingCategoryDelete(false);
        return;
      }

      if (isProductModalOpen) {
        setIsProductModalOpen(false);
        setEditingProductKey(null);
        setIsConfirmingProductDelete(false);
        return;
      }

      if (isBlogModalOpen) {
        setIsBlogModalOpen(false);
        setEditingBlogKey(null);
        return;
      }

      if (isQuoteModalOpen) {
        closeQuoteModal();
        return;
      }

      if (isServiceRequestModalOpen) {
        setIsServiceRequestModalOpen(false);
      }
    };

    window.addEventListener('keydown', closeModalWithEscape);

    return () => {
      window.removeEventListener('keydown', closeModalWithEscape);
    };
  }, [
    isCategoryModalOpen,
    isContactMenuOpen,
    isHeaderMenuOpen,
    isServiceTypeMenuOpen,
    imagePreview,
    isAssetManagerOpen,
    isBlogModalOpen,
    isProductModalOpen,
    isQuoteQuestionModalOpen,
    isReferenceModalOpen,
    isSiteServiceModalOpen,
    pendingImageCrop,
    isQuoteModalOpen,
    isServiceRequestModalOpen,
    isSettingsModalOpen,
    isUserModalOpen,
    editingQuoteQuestionId,
    selectedDatabaseTable,
    selectedCategoryGalleryIndex,
    selectedSiteService,
  ]);

  useEffect(() => {
    if (!adminMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAdminMessage('');
    }, 3600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [adminMessage]);

  const scrollProducts = (direction: 'previous' | 'next') => {
    productCarouselRef.current?.scrollBy({
      left: direction === 'next' ? 280 : -280,
      behavior: 'smooth',
    });
  };

  function openQuoteModal() {
    setSelectedQuoteCategoryKey('');
    setSelectedQuoteProductKey('');
    setQuoteAnswers({});
    setQuoteContactForm(emptyQuoteContactForm);
    setQuoteSubmitMessage('');
    setIsQuoteModalOpen(true);
  }

  function closeQuoteModal() {
    setIsQuoteModalOpen(false);
    setSelectedQuoteCategoryKey('');
    setSelectedQuoteProductKey('');
    setQuoteAnswers({});
    setQuoteContactForm(emptyQuoteContactForm);
    setQuoteSubmitMessage('');
  }

  const uploadImageVariants = async (
    file: File,
    assetType: ImageAssetType,
    focalPoints: CropFocalPoints = defaultCropFocalPoints,
  ) => {
    const variants = await createProductImageVariants(file, focalPoints);
    const uploads = await Promise.all(
      Object.entries(variants)
        .filter(([variant]) => assetType !== 'page-image' || variant === 'square')
        .map(async ([variant, blob]) => {
        const uploadEndpoint = assetType === 'category-image' ? 'category-image' : 'product-image';
        const uploadVariant = variant;
        const uploadFolder =
          assetType === 'category-image'
            ? 'kategori'
            : assetType === 'blog-image'
              ? 'blog'
              : assetType === 'page-image'
                ? 'sayfa'
                : 'urun';
        const uploadPath = `/api/assets/${uploadEndpoint}?variant=${uploadVariant}&folder=${uploadFolder}&name=${encodeURIComponent(file.name)}`;
        const response = await authorizedFetch(uploadPath, {
          method: 'POST',
          headers: {
            'content-type': 'image/webp',
          },
          body: blob,
        });

        const data = (await response.json().catch(() => null)) as { ok?: boolean; url?: string; size?: number } | null;

        return { variant, blob, response, data };
      }),
    );

    if (uploads.some((upload) => upload.response.status === 401)) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.localStorage.removeItem(adminTokenStorageKey);
      setAdminToken('');
      setAdminUser(null);
      setAuthStatus('anonymous');
      return null;
    }

    if (uploads.some((upload) => !upload.response.ok || !upload.data?.url)) {
      setAdminMessage('Görsel yüklenemedi. Lütfen tekrar deneyin.');
      return null;
    }

    const urls = Object.fromEntries(
      uploads.map((upload) => [
        upload.variant,
        upload.data?.url?.startsWith('/api/') ? apiUrl(upload.data.url) : upload.data?.url ?? '',
      ]),
    ) as Record<'square' | 'horizontal' | 'vertical', string>;
    const totalSize = uploads.reduce((total, upload) => total + (upload.data?.size ?? upload.blob.size), 0);

    return { urls, totalSize };
  };

  const openImageCropper = (file: File, assetType: ImageAssetType) => {
    closePendingImageCrop();
    setPendingImageCrop({
      file,
      assetType,
      previewUrl: URL.createObjectURL(file),
      focalPoints: {
        square: { ...defaultCropFocalPoint },
        horizontal: { ...defaultCropFocalPoint },
        vertical: { ...defaultCropFocalPoint },
      },
    });
  };

  const updatePendingCropPoint = (event: PointerEvent<HTMLDivElement>, variant: ImageVariantKey) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const focalPoint = {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    };

    setPendingImageCrop((currentCrop) =>
      currentCrop
        ? {
            ...currentCrop,
            focalPoints: {
              ...currentCrop.focalPoints,
              [variant]: focalPoint,
            },
          }
        : currentCrop,
    );
  };

  const confirmImageCropAndUpload = async () => {
    if (!pendingImageCrop) {
      return;
    }

    const { file, assetType, focalPoints } = pendingImageCrop;
    const setUploading =
      assetType === 'product-image'
        ? setIsUploadingProductImage
        : assetType === 'blog-image'
          ? setIsUploadingBlogImage
          : assetType === 'page-image'
            ? setIsUploadingQuoteQuestionImage
            : setIsUploadingCategoryImage;

    setUploading(true);

    try {
      const uploaded = await uploadImageVariants(file, assetType, focalPoints);

      if (!uploaded) {
        return;
      }

      if (assetType === 'product-image') {
        setProductForm((currentForm) => ({
          ...currentForm,
          image: uploaded.urls.horizontal,
          imageSquare: uploaded.urls.square,
          imageHorizontal: uploaded.urls.horizontal,
          imageVertical: uploaded.urls.vertical,
        }));
      } else if (assetType === 'blog-image') {
        setBlogPostForm((currentForm) => ({
          ...currentForm,
          image: uploaded.urls.horizontal,
        }));
      } else if (assetType === 'page-image') {
        setQuoteQuestionForm((currentForm) => ({
          ...currentForm,
          imageUrl: uploaded.urls.square,
        }));
      } else {
        setCategoryForm((currentForm) => ({
          ...currentForm,
          image: uploaded.urls.horizontal,
          imageSquare: uploaded.urls.square,
          imageHorizontal: uploaded.urls.horizontal,
          imageVertical: uploaded.urls.vertical,
        }));
      }

      setAdminMessage(`Görsel seçilen kırpma merkeziyle yüklendi (${Math.round(uploaded.totalSize / 1024)} KB).`);
      closePendingImageCrop();
    } catch {
      setAdminMessage('Görsel kırpılıp yüklenemedi.');
    } finally {
      setUploading(false);
    }
  };

  const openNewProductModal = () => {
    setEditingProductKey(null);
    setProductForm(createEmptyProductForm());
    setIsConfirmingProductDelete(false);
    setIsProductModalOpen(true);
    setAdminMessage('');
  };

  const openEditProductModal = (product: AdminProduct) => {
    const productImages = withImageVariantFallbacks(product);

    setEditingProductKey(product.key);
    setProductForm({
      key: product.key,
      categoryKey: product.categoryKey,
      title: product.title,
      slug: product.slug,
      description: product.description,
      metaTitle: product.metaTitle,
      metaKeywords: product.metaKeywords,
      metaDescription: product.metaDescription,
      image: productImages.image,
      imageSquare: productImages.imageSquare,
      imageHorizontal: productImages.imageHorizontal,
      imageVertical: productImages.imageVertical,
      sortOrder: String(product.sortOrder ?? 0),
      alt: product.alt,
      badges: product.badges.join(', '),
    });
    setIsConfirmingProductDelete(false);
    setIsProductModalOpen(true);
    setAdminMessage('');
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProductKey(null);
    setIsConfirmingProductDelete(false);
  };

  const updateProductForm = (field: keyof ProductFormState, value: string) => {
    setProductForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateProductTitle = (title: string) => {
    setProductForm((currentForm) => {
      if (editingProductKey) {
        return {
          ...currentForm,
          title,
        };
      }

      return {
        ...currentForm,
        title,
        key: createProductKeyFromTitle(title),
        slug: createSlugFromTitle(title),
      };
    });
  };

  const openNewBlogModal = () => {
    setEditingBlogKey(null);
    setBlogPostForm(createEmptyBlogPostForm(blogCategories[0]?.key ?? ''));
    setIsBlogModalOpen(true);
    setAdminMessage('');
  };

  const openEditBlogModal = (post: BlogPost) => {
    setEditingBlogKey(post.key);
    setBlogPostForm({
      key: post.key,
      title: post.title,
      summary: post.summary,
      targetKeyword: post.targetKeyword,
      content: post.content,
      slug: post.slug,
      metaTitle: post.metaTitle,
      metaKeywords: post.metaKeywords,
      metaDescription: post.metaDescription,
      image: post.image,
      imageAlt: post.imageAlt,
      oldUrl: post.oldUrl,
      status: post.status,
      publishedAt: post.publishedAt,
      categories: post.categories.map((category) => category.key),
      tags: post.tags.map((tag) => tag.title).join(', '),
    });
    setIsBlogModalOpen(true);
    setAdminMessage('');
  };

  const closeBlogModal = () => {
    setIsBlogModalOpen(false);
    setEditingBlogKey(null);
  };

  const updateBlogPostForm = (field: keyof BlogPostFormState, value: string | string[]) => {
    setBlogPostForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateBlogTitle = (title: string) => {
    setBlogPostForm((currentForm) => ({
      ...currentForm,
      title,
      key: editingBlogKey ? currentForm.key : createProductKeyFromTitle(title),
      slug: editingBlogKey ? currentForm.slug : createSlugFromTitle(title),
      metaTitle: currentForm.metaTitle || title,
    }));
  };

  const toggleBlogCategory = (categoryKey: string) => {
    setBlogPostForm((currentForm) => ({
      ...currentForm,
      categories: currentForm.categories.includes(categoryKey)
        ? currentForm.categories.filter((key) => key !== categoryKey)
        : [...currentForm.categories, categoryKey],
    }));
  };

  const uploadBlogImageFile = (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir blog görseli seçin.');
      return;
    }

    openImageCropper(file, 'blog-image');
  };

  const uploadBlogImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      uploadBlogImageFile(file);
    }
  };

  const uploadQuoteQuestionImageFile = (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir soru görseli seçin.');
      return;
    }

    openImageCropper(file, 'page-image');
  };

  const uploadQuoteQuestionImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      uploadQuoteQuestionImageFile(file);
    }
  };

  const uploadProductImageFile = (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    openImageCropper(file, 'product-image');
  };

  const uploadProductImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      uploadProductImageFile(file);
    }
  };

  const uploadAdminUserAvatarFile = async (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir avatar görseli seçin.');
      return;
    }

    setIsUploadingUserAvatar(true);

    try {
      const optimizedAvatar = await optimizeProductImage(file);
      const response = await authorizedFetch(`/api/assets/admin-avatar?name=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'content-type': 'image/webp',
        },
        body: optimizedAvatar,
      });
      const data = (await response.json()) as { ok?: boolean; url?: string; size?: number };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        window.localStorage.removeItem(adminTokenStorageKey);
        setAdminToken('');
        setAdminUser(null);
        setAuthStatus('anonymous');
        return;
      }

      if (!response.ok || !data.url) {
        setAdminMessage('Avatar yüklenemedi. Lütfen tekrar deneyin.');
        return;
      }

      updateAdminUserForm('avatarUrl', data.url.startsWith('/api/') ? apiUrl(data.url) : data.url);
      setAdminMessage(`Avatar WebP olarak yüklendi (${Math.round((data.size ?? optimizedAvatar.size) / 1024)} KB).`);
    } catch {
      setAdminMessage('Avatar optimize edilip yüklenemedi.');
    } finally {
      setIsUploadingUserAvatar(false);
    }
  };

  const uploadAdminUserAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      void uploadAdminUserAvatarFile(file);
    }
  };

  const openNewReferenceModal = () => {
    setEditingReferenceKey(null);
    setReferenceForm({ ...emptyReferenceForm, key: `ref_${crypto.randomUUID()}` });
    setIsReferenceModalOpen(true);
    setAdminMessage('');
  };

  const openEditReferenceModal = (reference: SiteReference) => {
    setEditingReferenceKey(reference.key);
    setReferenceForm({
      key: reference.key,
      title: reference.title,
      description: reference.description,
      imageUrl: reference.imageUrl,
      sortOrder: String(reference.sortOrder ?? 0),
      isActive: reference.isActive,
    });
    setIsReferenceModalOpen(true);
    setAdminMessage('');
  };

  const closeReferenceModal = () => {
    setIsReferenceModalOpen(false);
    setEditingReferenceKey(null);
  };

  const updateReferenceForm = (field: keyof ReferenceFormState, value: string | boolean) => {
    setReferenceForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateReferenceTitle = (title: string) => {
    setReferenceForm((currentForm) => ({
      ...currentForm,
      title,
      key: editingReferenceKey ? currentForm.key : createProductKeyFromTitle(title),
    }));
  };

  const openNewSiteServiceModal = () => {
    setEditingSiteServiceKey(null);
    setSiteServiceForm({ ...emptySiteServiceForm, key: `srv_${crypto.randomUUID()}` });
    setIsSiteServiceModalOpen(true);
    setAdminMessage('');
  };

  const openEditSiteServiceModal = (service: SiteService) => {
    setEditingSiteServiceKey(service.key);
    setSiteServiceForm({
      key: service.key,
      title: service.title,
      summary: service.summary,
      detail: service.detail,
      imageUrl: service.imageUrl,
      sortOrder: String(service.sortOrder ?? 0),
      isActive: service.isActive,
    });
    setIsSiteServiceModalOpen(true);
    setAdminMessage('');
  };

  const closeSiteServiceModal = () => {
    setIsSiteServiceModalOpen(false);
    setEditingSiteServiceKey(null);
  };

  const updateSiteServiceForm = (field: keyof SiteServiceFormState, value: string | boolean) => {
    setSiteServiceForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateSiteServiceTitle = (title: string) => {
    setSiteServiceForm((currentForm) => ({
      ...currentForm,
      title,
      key: editingSiteServiceKey ? currentForm.key : createProductKeyFromTitle(title),
    }));
  };

  const uploadSiteServiceImageFile = async (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir hizmet görseli seçin.');
      return;
    }

    setIsUploadingSiteServiceImage(true);

    try {
      const optimizedImage = await optimizeProductImage(file);
      const response = await authorizedFetch(
        `/api/assets/page-image?variant=service&folder=sayfa&name=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'image/webp',
          },
          body: optimizedImage,
        },
      );
      const data = (await response.json()) as { ok?: boolean; url?: string; size?: number };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data.url) {
        setAdminMessage('Hizmet görseli yüklenemedi. Lütfen tekrar deneyin.');
        return;
      }

      updateSiteServiceForm('imageUrl', data.url.startsWith('/api/') ? apiUrl(data.url) : data.url);
      setAdminMessage(`Hizmet görseli yüklendi (${Math.round((data.size ?? optimizedImage.size) / 1024)} KB).`);
    } catch {
      setAdminMessage('Hizmet görseli optimize edilip yüklenemedi.');
    } finally {
      setIsUploadingSiteServiceImage(false);
    }
  };

  const uploadSiteServiceImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      void uploadSiteServiceImageFile(file);
    }
  };

  const uploadReferenceImageFile = async (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir referans görseli seçin.');
      return;
    }

    setIsUploadingReferenceImage(true);

    try {
      const optimizedImage = await optimizeProductImage(file);
      const response = await authorizedFetch(`/api/assets/page-image?variant=logo&folder=referans&name=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'content-type': 'image/webp',
        },
        body: optimizedImage,
      });
      const data = (await response.json().catch(() => null)) as { url?: string; size?: number } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data?.url) {
        setAdminMessage('Referans görseli yüklenemedi.');
        return;
      }

      updateReferenceForm('imageUrl', data.url.startsWith('/api/') ? apiUrl(data.url) : data.url);
      setAdminMessage(`Referans görseli yüklendi (${Math.round((data.size ?? optimizedImage.size) / 1024)} KB).`);
    } catch {
      setAdminMessage('Referans görseli optimize edilip yüklenemedi.');
    } finally {
      setIsUploadingReferenceImage(false);
    }
  };

  const uploadReferenceImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      void uploadReferenceImageFile(file);
    }
  };

  const openCategoryModal = () => {
    setEditingCategoryKey(null);
    setCategoryForm(emptyCategoryForm);
    setIsConfirmingCategoryDelete(false);
    setIsCategoryModalOpen(true);
    setAdminMessage('');
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategoryKey(null);
    setIsConfirmingCategoryDelete(false);
  };

  const selectCategoryForEdit = (category: AdminCategory) => {
    const categoryImages = withImageVariantFallbacks(category);

    setEditingCategoryKey(category.key);
    setIsConfirmingCategoryDelete(false);
    setCategoryForm({
      key: category.key,
      title: category.title,
      slug: category.slug,
      description: category.description,
      metaTitle: category.metaTitle,
      metaKeywords: category.metaKeywords,
      metaDescription: category.metaDescription,
      image: categoryImages.image,
      imageSquare: categoryImages.imageSquare,
      imageHorizontal: categoryImages.imageHorizontal,
      imageVertical: categoryImages.imageVertical,
      sortOrder: String(category.sortOrder ?? 0),
    });
  };

  const updateCategoryForm = (field: keyof CategoryFormState, value: string) => {
    setCategoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateCategoryTitle = (title: string) => {
    setCategoryForm((currentForm) => ({
      ...currentForm,
      title,
      key: editingCategoryKey ? currentForm.key : createProductKeyFromTitle(title),
      slug: createSlugFromTitle(title),
    }));
  };

  const uploadCategoryImageFile = (file: File) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir kategori görseli seçin.');
      return;
    }

    openImageCropper(file, 'category-image');
  };

  const uploadCategoryImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      uploadCategoryImageFile(file);
    }
  };

  const reloadAdminUsers = async () => {
    const response = await authorizedFetch('/api/admin-users');
    const data = (await response.json()) as { users?: AdminUser[] };

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      window.localStorage.removeItem(adminTokenStorageKey);
      setAdminToken('');
      setAdminUser(null);
      setAuthStatus('anonymous');
      return;
    }

    if (data.users) {
      setAdminUsers(data.users);
    }
  };

  const loadDatabaseTables = async () => {
    if (!canAccessModule('database')) {
      return;
    }

    setIsLoadingDatabaseTables(true);

    try {
      const response = await authorizedFetch('/api/database/tables');
      const data = (await response.json()) as { tables?: DatabaseTable[] };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        window.localStorage.removeItem(adminTokenStorageKey);
        setAdminToken('');
        setAdminUser(null);
        setAuthStatus('anonymous');
        return;
      }

      if (response.status === 403) {
        setAdminMessage('Veritabanı modülüne erişim yetkiniz yok.');
        return;
      }

      if (!response.ok || !data.tables) {
        setAdminMessage('Veritabanı bilgileri yüklenemedi.');
        return;
      }

      setDatabaseTables(data.tables);
    } catch {
      setAdminMessage('Veritabanı bilgileri yüklenemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsLoadingDatabaseTables(false);
    }
  };

  const loadQuoteRequests = async () => {
    if (!canAccessModule('settings')) {
      return;
    }

    setIsLoadingQuoteRequests(true);

    try {
      const response = await authorizedFetch('/api/quote-requests');
      const data = (await response.json().catch(() => null)) as { requests?: QuoteRequest[] } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (response.status === 403) {
        setAdminMessage('Teklif taleplerine erişim yetkiniz yok.');
        return;
      }

      if (!response.ok || !data?.requests) {
        setAdminMessage('Teklif talepleri yüklenemedi.');
        return;
      }

      setQuoteRequests(data.requests);
    } catch {
      setAdminMessage('Teklif talepleri yüklenemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsLoadingQuoteRequests(false);
    }
  };

  const loadServiceRequests = async () => {
    if (!canAccessModule('settings')) {
      return;
    }

    setIsLoadingServiceRequests(true);

    try {
      const response = await authorizedFetch('/api/service-requests');
      const data = (await response.json().catch(() => null)) as { requests?: ServiceRequest[] } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (response.status === 403) {
        setAdminMessage('Servis taleplerine erişim yetkiniz yok.');
        return;
      }

      if (!response.ok || !data?.requests) {
        setAdminMessage('Servis talepleri yüklenemedi.');
        return;
      }

      setServiceRequests(data.requests);
    } catch {
      setAdminMessage('Servis talepleri yüklenemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsLoadingServiceRequests(false);
    }
  };

  const closeQuoteRequest = async (requestId: string) => {
    setClosingRequestId(requestId);

    try {
      const response = await authorizedFetch(`/api/quote-requests/${encodeURIComponent(requestId)}`, {
        method: 'PATCH',
      });
      const data = (await response.json().catch(() => null)) as { requests?: QuoteRequest[] } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data?.requests) {
        setAdminMessage('Teklif talebi kapatılamadı.');
        return;
      }

      setQuoteRequests(data.requests);
      setAdminMessage('Teklif talebi kapatıldı.');
    } catch {
      setAdminMessage('Teklif talebi kapatılamadı. API bağlantısını kontrol edin.');
    } finally {
      setClosingRequestId('');
    }
  };

  const closeServiceRequest = async (requestId: string) => {
    setClosingRequestId(requestId);

    try {
      const response = await authorizedFetch(`/api/service-requests/${encodeURIComponent(requestId)}`, {
        method: 'PATCH',
      });
      const data = (await response.json().catch(() => null)) as { requests?: ServiceRequest[] } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data?.requests) {
        setAdminMessage('Servis talebi kapatılamadı.');
        return;
      }

      setServiceRequests(data.requests);
      setAdminMessage('Servis talebi kapatıldı.');
    } catch {
      setAdminMessage('Servis talebi kapatılamadı. API bağlantısını kontrol edin.');
    } finally {
      setClosingRequestId('');
    }
  };

  const sendPushoverTestNotification = async () => {
    if (!canAccessModule('settings')) {
      return;
    }

    setIsSendingPushoverTest(true);
    setAdminMessage('');

    try {
      const response = await authorizedFetch('/api/quote-requests/test-pushover', {
        method: 'POST',
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; pushoverSent?: boolean; error?: string } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (response.status === 403) {
        setAdminMessage('Pushover deneme bildirimi için yetkiniz yok.');
        return;
      }

      if (!response.ok || !data?.ok || !data.pushoverSent) {
        setAdminMessage(
          data?.error === 'pushover_not_configured'
            ? 'Pushover ayarları eksik. Ayarlar > Pushover bölümünden API bilgilerini veya yedek e-posta adresini kaydedin.'
            : 'Pushover deneme bildirimi gönderilemedi.',
        );
        return;
      }

      setAdminMessage('Pushover deneme bildirimi gönderildi.');
    } catch {
      setAdminMessage('Pushover deneme bildirimi gönderilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSendingPushoverTest(false);
    }
  };

  const reloadAdminCatalog = async () => {
    const [productsResult, categoriesResult, socialLinksResult, contactSettingsResult, siteServicesResult, referencesResult, quoteQuestionsResult, pushoverSettingsResult, blogPostsResult, blogCategoriesResult, blogTagsResult] =
      await Promise.all([
        readApiJson<{ products?: AdminProduct[] }>(fetch(apiUrl('/api/products'))),
        readApiJson<{ categories?: AdminCategory[] }>(fetch(apiUrl('/api/product-categories'))),
        readApiJson<{ links?: SocialLink[] }>(fetch(apiUrl('/api/footer-social-links'))),
        readApiJson<{ settings?: ContactSettings }>(fetch(apiUrl('/api/contact-settings'))),
        readApiJson<{ services?: SiteService[] }>(
          canAccessModule('settings') ? authorizedFetch('/api/services?includeInactive=1') : fetch(apiUrl('/api/services')),
        ),
        readApiJson<{ references?: SiteReference[] }>(
          canAccessModule('settings') ? authorizedFetch('/api/references?includeInactive=1') : fetch(apiUrl('/api/references')),
        ),
        readApiJson<{ questions?: QuoteQuestion[] }>(
          canAccessModule('settings') ? authorizedFetch('/api/quote-questions?includeInactive=1') : fetch(apiUrl('/api/quote-questions')),
        ),
        readApiJson<{ settings?: PushoverSettings }>(
          canAccessModule('settings')
            ? authorizedFetch('/api/pushover-settings')
            : Promise.resolve(new Response('{}', { status: 200 })),
        ),
        readApiJson<{ posts?: BlogPost[] }>(
          canAccessModule('blog') ? authorizedFetch('/api/blog-posts?includeDrafts=1') : fetch(apiUrl('/api/blog-posts?limit=3')),
        ),
        readApiJson<{ categories?: BlogTaxonomyItem[] }>(fetch(apiUrl('/api/blog-categories'))),
        readApiJson<{ tags?: BlogTaxonomyItem[] }>(fetch(apiUrl('/api/blog-tags'))),
      ]);
    const productsData = productsResult.data ?? {};
    const categoriesData = categoriesResult.data ?? {};
    const socialLinksData = socialLinksResult.data ?? {};
    const contactSettingsData = contactSettingsResult.data ?? {};
    const siteServicesData = siteServicesResult.data ?? {};
    const referencesData = referencesResult.data ?? {};
    const quoteQuestionsData = quoteQuestionsResult.data ?? {};
    const pushoverSettingsData = pushoverSettingsResult.data ?? {};
    const blogPostsData = blogPostsResult.data ?? {};
    const blogCategoriesData = blogCategoriesResult.data ?? {};
    const blogTagsData = blogTagsResult.data ?? {};

    if (productsData.products) {
      setAdminProducts(productsData.products);
    }

    if (categoriesData.categories) {
      setAdminCategories(categoriesData.categories);
    }

    if (socialLinksData.links) {
      setSocialLinks(socialLinksData.links);
      setSocialLinkForm(
        Object.fromEntries(socialLinksData.links.map((link) => [link.platform, link.url])),
      );
    }

    if (contactSettingsData.settings) {
      setContactSettings(contactSettingsData.settings);
      setContactSettingsForm(contactSettingsData.settings);
    }

    if (siteServicesData.services) {
      setSiteServices(siteServicesData.services);
    }

    if (referencesData.references) {
      setSiteReferences(referencesData.references);
    }

    if (quoteQuestionsData.questions) {
      setQuoteQuestions(quoteQuestionsData.questions);
    }

    if (pushoverSettingsData.settings) {
      setPushoverSettings(pushoverSettingsData.settings);
      setPushoverSettingsForm({ ...pushoverSettingsData.settings, apiToken: '' });
    }

    if (blogPostsData.posts) {
      setBlogPosts(blogPostsData.posts);
    }

    if (blogCategoriesData.categories) {
      setBlogCategories(blogCategoriesData.categories);
    }

    if (blogTagsData.tags) {
      setBlogTags(blogTagsData.tags);
    }
  };

  const reloadAssets = async (mode: 'all' | 'unused' = assetViewMode) => {
    setAssetViewMode(mode);
    setIsLoadingAssets(true);

    try {
      const response = await authorizedFetch(`/api/assets${mode === 'unused' ? '?unused=1' : ''}`);
      const data = (await response.json()) as { assets?: AssetItem[] };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data.assets) {
        setAdminMessage('Görseller yüklenemedi.');
        return;
      }

      const nextAssets = data.assets.map((asset) => ({
        ...asset,
        url: asset.url.startsWith('/api/') ? apiUrl(asset.url) : asset.url,
      }));

      setAssets(nextAssets);
      setSelectedAssetKeys((currentSelection) => {
        if (mode === 'unused') {
          return new Set(nextAssets.map((asset) => asset.key));
        }

        const nextAssetKeys = new Set(nextAssets.map((asset) => asset.key));
        return new Set([...currentSelection].filter((assetKey) => nextAssetKeys.has(assetKey)));
      });

      if (mode === 'unused') {
        setAdminMessage(
          nextAssets.length > 0
            ? `${nextAssets.length} kullanılmayan görsel tespit edildi.`
            : 'Kullanılmayan görsel bulunamadı.',
        );
      }
      return nextAssets;
    } catch {
      setAdminMessage('Görseller yüklenemedi. API bağlantısını kontrol edin.');
      return [];
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const showAllAssets = () => {
    setSelectedAssetKeys(new Set());
    void reloadAssets('all');
  };

  const showUnusedAssets = () => {
    void reloadAssets('unused');
  };

  const getAssetUsageLabel = (asset: AssetItem) => {
    if (asset.isUsed || (asset.references?.length ?? 0) > 0) {
      return `Kullanılıyor${asset.references?.length ? `: ${asset.references.slice(0, 2).join(', ')}` : ''}`;
    }

    return 'Kullanılmıyor';
  };

  const toggleAssetSelection = (assetKey: string) => {
    setSelectedAssetKeys((currentSelection) => {
      const nextSelection = new Set(currentSelection);

      if (nextSelection.has(assetKey)) {
        nextSelection.delete(assetKey);
      } else {
        nextSelection.add(assetKey);
      }

      return nextSelection;
    });
  };

  const deleteSelectedAssets = async () => {
    const selectedAssets = assets.filter((asset) => selectedAssetKeys.has(asset.key) && !asset.isUsed);

    if (selectedAssets.length === 0) {
      setAdminMessage('Silinecek kullanılmayan görsel seçilmedi.');
      return;
    }

    setIsDeletingSelectedAssets(true);

    try {
      const results = await Promise.all(
        selectedAssets.map(async (asset) => {
          const response = await authorizedFetch(`/api/assets/${encodeURIComponent(asset.key)}`, {
            method: 'DELETE',
          });

          return { asset, response };
        }),
      );

      if (results.some((result) => result.response.status === 401)) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      const deletedCount = results.filter((result) => result.response.ok).length;
      const blockedCount = results.filter((result) => result.response.status === 409).length;

      setSelectedAssetKeys(new Set());
      await reloadAssets(assetViewMode);
      setAdminMessage(
        blockedCount > 0
          ? `${deletedCount} görsel silindi, ${blockedCount} görsel kullanımda olduğu için atlandı.`
          : `${deletedCount} kullanılmayan görsel silindi.`,
      );
    } catch {
      setAdminMessage('Seçili görseller silinemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsDeletingSelectedAssets(false);
    }
  };

  const deleteAsset = async (asset: AssetItem) => {
    const response = await authorizedFetch(`/api/assets/${encodeURIComponent(asset.key)}`, {
      method: 'DELETE',
    });
    const data = (await response.json().catch(() => null)) as { error?: string; references?: string[] } | null;

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (response.status === 409) {
      setAdminMessage(
        `Bu görsel kayıtlı bir içerikte kullanılıyor: ${(data?.references ?? ['bağlı kayıt']).join(', ')}`,
      );
      return;
    }

    if (!response.ok) {
      setAdminMessage('Görsel silinemedi.');
      return;
    }

    setAdminMessage('Görsel silindi.');
    await reloadAssets();
  };

  const openSettingsModal = () => {
    setActiveSettingsTab('footer');
    setIsSettingsModalOpen(true);
    setAdminMessage('');
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    setAdminUserForm(emptyAdminUserForm);
    setIsConfirmingUserDisable(false);
    setIsUserModalOpen(true);
    setAdminMessage('');
  };

  const openEditUserModal = (user: AdminUser) => {
    setEditingUserId(user.id);
    setAdminUserForm({
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      password: '',
      isActive: user.isActive,
      modules: user.modules,
    });
    setIsConfirmingUserDisable(false);
    setIsUserModalOpen(true);
    setAdminMessage('');
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUserId(null);
    setIsConfirmingUserDisable(false);
  };

  const updateAdminUserForm = (field: keyof AdminUserFormState, value: string | boolean | string[]) => {
    setAdminUserForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const toggleAdminUserModule = (moduleKey: string) => {
    setAdminUserForm((currentForm) => {
      const hasModule = currentForm.modules.includes(moduleKey);
      const modules = hasModule
        ? currentForm.modules.filter((currentModule) => currentModule !== moduleKey)
        : [...currentForm.modules, moduleKey];

      return {
        ...currentForm,
        modules,
      };
    });
  };

  const updateSocialLinkForm = (platform: string, url: string) => {
    setSocialLinkForm((currentForm) => ({
      ...currentForm,
      [platform]: url,
    }));
  };

  const updateContactSettingsForm = (field: keyof ContactSettings, value: string) => {
    setContactSettingsForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const selectQuoteQuestionCategory = (categoryKey: string) => {
    setQuoteQuestionCategoryKey(categoryKey);
    setQuoteQuestionProductKey('');
  };

  const selectQuoteQuestionProduct = (productKey: string) => {
    setQuoteQuestionProductKey(productKey);
  };

  const updateQuoteQuestionFormCategory = (categoryKey: string) => {
    const firstProductKey = adminProducts.find((product) => product.categoryKey === categoryKey)?.key ?? '';

    setQuoteQuestionFormCategoryKey(categoryKey);
    setQuoteQuestionFormProductKey(firstProductKey);
  };

  const openNewQuoteQuestionModal = () => {
    const categoryKey = quoteQuestionCategoryKey || adminCategories[0]?.key || '';
    const productKey =
      quoteQuestionProductKey || adminProducts.find((product) => product.categoryKey === categoryKey)?.key || '';

    setEditingQuoteQuestionId(null);
    setQuoteQuestionFormCategoryKey(categoryKey);
    setQuoteQuestionFormProductKey(productKey);
    setQuoteQuestionForm(createEmptyQuoteQuestionForm());
    setIsQuoteQuestionModalOpen(true);
    setAdminMessage('');
  };

  const openEditQuoteQuestionModal = (question: QuoteQuestion) => {
    setEditingQuoteQuestionId(question.id);
    setQuoteQuestionFormCategoryKey(question.categoryKey);
    setQuoteQuestionFormProductKey(question.productKey ?? '');
    setQuoteQuestionForm({
      id: question.id,
      question: question.question,
      description: question.description,
      imageUrl: question.imageUrl ?? '',
      answerType: question.answerType,
      options: question.options.join('\n'),
      defaultValue: question.defaultValue,
      maxLength: question.maxLength ? String(question.maxLength) : '',
      decimalPlaces: String(question.decimalPlaces ?? 0),
      isRequired: question.isRequired,
      isActive: question.isActive,
    });
    setIsQuoteQuestionModalOpen(true);
    setAdminMessage('');
  };

  const closeQuoteQuestionModal = () => {
    setIsQuoteQuestionModalOpen(false);
    setEditingQuoteQuestionId(null);
    setQuoteQuestionForm(createEmptyQuoteQuestionForm());
  };

  const updateQuoteQuestionForm = (
    field: keyof QuoteQuestionFormState,
    value: string | boolean,
  ) => {
    setQuoteQuestionForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === 'answerType' && (value === 'text' || value === 'number') ? { options: '' } : {}),
      ...(field === 'answerType' && value !== 'text' ? { maxLength: '' } : {}),
      ...(field === 'answerType' && value !== 'number' ? { decimalPlaces: '0' } : {}),
    }));
  };

  const createDefaultQuoteAnswers = (categoryKey: string, productKey: string) => {
    return quoteQuestions
      .filter(
        (question) =>
          question.categoryKey === categoryKey &&
          question.productKey === productKey &&
          question.isActive,
      )
      .reduce<Record<string, string | string[]>>((answers, question) => {
        if (!question.defaultValue.trim()) {
          return answers;
        }

        if (question.answerType === 'multiple') {
          answers[question.id] = question.defaultValue
            .split(/\n|,/)
            .map((value) => value.trim())
            .filter((value) => question.options.includes(value));
        } else if (question.answerType === 'single') {
          answers[question.id] = question.options.includes(question.defaultValue.trim()) ? question.defaultValue.trim() : '';
        } else if (question.answerType === 'number') {
          const defaultNumber = Number(question.defaultValue.replace(',', '.'));
          answers[question.id] = Number.isFinite(defaultNumber) ? formatQuoteNumberAnswer(defaultNumber, question) : '';
        } else {
          answers[question.id] = question.defaultValue;
        }

        return answers;
      }, {});
  };

  const updateQuoteAnswer = (question: QuoteQuestion, value: string) => {
    setQuoteAnswers((currentAnswers) => {
      if (question.answerType !== 'multiple') {
        return {
          ...currentAnswers,
          [question.id]: value,
        };
      }

      const currentValues: string[] = Array.isArray(currentAnswers[question.id])
        ? (currentAnswers[question.id] as string[])
        : [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value];

      return {
        ...currentAnswers,
        [question.id]: nextValues,
      };
    });
  };

  const updateQuoteContactForm = (field: keyof QuoteContactFormState, value: string) => {
    setQuoteContactForm((currentForm) => ({
      ...currentForm,
      [field]: field === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  const updatePushoverSettingsForm = (field: keyof PushoverSettings, value: string | boolean) => {
    setPushoverSettingsForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateServiceRequestForm = (field: keyof ServiceRequestFormState, value: string) => {
    setServiceRequestForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const updateLoginForm = (field: keyof LoginFormState, value: string) => {
    setLoginForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setAdminMessage('');

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          login: loginForm.login.trim(),
          password: loginForm.password,
        }),
      });
      const data = (await response.json()) as { token?: string; user?: AdminUser };

      if (!response.ok || !data.token || !data.user) {
        setAdminMessage('Kullanıcı adı veya şifre hatalı.');
        return;
      }

      window.localStorage.setItem(adminTokenStorageKey, data.token);
      setAdminToken(data.token);
      setAdminUser(data.user);
      setAuthStatus('authenticated');
      setLoginForm({ login: '', password: '' });
    } catch {
      setAdminMessage('Giriş yapılamadı. API bağlantısını kontrol edin.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logoutAdmin = async () => {
    if (adminToken) {
      await authorizedFetch('/api/auth/logout', {
        method: 'POST',
      }).catch(() => undefined);
    }

    window.localStorage.removeItem(adminTokenStorageKey);
    setAdminToken('');
    setAdminUser(null);
    setAuthStatus('anonymous');
  };

  const saveAdminUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingUser(true);

    const payload: AdminUserFormState = {
      ...adminUserForm,
      username: adminUserForm.username.trim().toLowerCase(),
      email: adminUserForm.email.trim().toLowerCase(),
      displayName: adminUserForm.displayName.trim(),
      avatarUrl: adminUserForm.avatarUrl.trim(),
      password: adminUserForm.password,
      modules: adminUserForm.modules,
    };

    if (editingUserId && !payload.password) {
      delete (payload as Partial<AdminUserFormState>).password;
    }

    try {
      const response = await authorizedFetch(editingUserId ? `/api/admin-users/${editingUserId}` : '/api/admin-users', {
        method: editingUserId ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { user?: AdminUser };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data.user) {
        setAdminMessage('Kullanıcı kaydedilemedi. Alanları ve şifre uzunluğunu kontrol edin.');
        return;
      }

      await reloadAdminUsers();

      if (data.user.id === adminUser?.id) {
        setAdminUser(data.user);
      }

      setAdminMessage(editingUserId ? 'Kullanıcı bilgileri güncellendi.' : 'Yeni kullanıcı eklendi.');
      closeUserModal();
    } catch {
      setAdminMessage('Kullanıcı kaydedilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const disableAdminUser = async () => {
    if (!editingUserId || editingUserId === adminUser?.id) {
      return;
    }

    if (!isConfirmingUserDisable) {
      setIsConfirmingUserDisable(true);
      return;
    }

    const response = await authorizedFetch(`/api/admin-users/${editingUserId}`, {
      method: 'DELETE',
    });

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok) {
      setAdminMessage('Kullanıcı pasifleştirilemedi.');
      return;
    }

    await reloadAdminUsers();
    setAdminMessage('Kullanıcı pasifleştirildi.');
    closeUserModal();
  };

  const saveSocialLinks = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSavingSocialLinks(true);

    try {
      const responses = await Promise.all(
        socialPlatforms.map((platform, index) =>
          authorizedFetch('/api/footer-social-links', {
            method: 'PUT',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              platform: platform.platform,
              label: platform.label,
              url: socialLinkForm[platform.platform]?.trim() ?? '',
              sortOrder: index + 1,
              isActive: Boolean(socialLinkForm[platform.platform]?.trim()),
            }),
          }),
        ),
      );

      if (responses.some((response) => response.status === 401)) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!responses.every((response) => response.ok)) {
        setAdminMessage('Sosyal medya linkleri kaydedilemedi. Lütfen bağlantıları kontrol edin.');
        return;
      }

      await reloadAdminCatalog();
      setAdminMessage('Footer sosyal medya linkleri güncellendi.');
      closeSettingsModal();
    } catch {
      setAdminMessage('Sosyal medya linkleri kaydedilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingSocialLinks(false);
    }
  };

  const saveContactSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingContactSettings(true);

    try {
      const response = await authorizedFetch('/api/contact-settings', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(
            contactSettingFields.map((field) => [field.key, contactSettingsForm[field.key].trim()]),
          ),
        ),
      });
      const data = (await response.json()) as { settings?: ContactSettings };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data.settings) {
        setAdminMessage('İletişim bilgileri kaydedilemedi. Lütfen tekrar deneyin.');
        return;
      }

      setContactSettings(data.settings);
      setContactSettingsForm(data.settings);
      setAdminMessage('İletişim bilgileri güncellendi.');
      closeSettingsModal();
    } catch {
      setAdminMessage('İletişim bilgileri kaydedilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingContactSettings(false);
    }
  };

  const savePushoverSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingPushoverSettings(true);

    try {
      const response = await authorizedFetch('/api/pushover-settings', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userKey: pushoverSettingsForm.userKey.trim(),
          apiToken: pushoverSettingsForm.apiToken.trim(),
          emailAddress: pushoverSettingsForm.emailAddress.trim(),
          isActive: pushoverSettingsForm.isActive,
        }),
      });
      const data = (await response.json().catch(() => null)) as { settings?: PushoverSettings } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data?.settings) {
        setAdminMessage('Pushover ayarları kaydedilemedi.');
        return;
      }

      setPushoverSettings(data.settings);
      setPushoverSettingsForm({ ...data.settings, apiToken: '' });
      setAdminMessage('Pushover ayarları kaydedildi.');
    } catch {
      setAdminMessage('Pushover ayarları kaydedilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingPushoverSettings(false);
    }
  };

  const saveQuoteQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!quoteQuestionFormCategoryKey) {
      setAdminMessage('Lütfen soru tanımlanacak kategoriyi seçin.');
      return;
    }

    if (!quoteQuestionFormProductKey) {
      setAdminMessage('Lütfen soru tanımlanacak ürünü seçin.');
      return;
    }

    const nextOptions = quoteQuestionForm.options
      .split(/\n|,/)
      .map((option) => option.trim())
      .filter(Boolean);
    const maxLength = Number(quoteQuestionForm.maxLength);
    const decimalPlaces = Number(quoteQuestionForm.decimalPlaces);
    const nextQuestion = {
      id: quoteQuestionForm.id,
      categoryKey: quoteQuestionFormCategoryKey,
      productKey: quoteQuestionFormProductKey,
      question: quoteQuestionForm.question.trim(),
      description: quoteQuestionForm.description.trim(),
      imageUrl: quoteQuestionForm.imageUrl.trim(),
      answerType: quoteQuestionForm.answerType,
      options: nextOptions,
      defaultValue: quoteQuestionForm.defaultValue.trim(),
      maxLength:
        quoteQuestionForm.answerType === 'text' && Number.isInteger(maxLength) && maxLength > 0 ? maxLength : 0,
      decimalPlaces:
        quoteQuestionForm.answerType === 'number' && Number.isInteger(decimalPlaces) && decimalPlaces >= 0
          ? decimalPlaces
          : 0,
      isRequired: quoteQuestionForm.isRequired,
      sortOrder: 1,
      isActive: quoteQuestionForm.isActive,
    };

    if (!nextQuestion.question) {
      setAdminMessage('Lütfen soru metnini girin.');
      return;
    }

    if (
      (nextQuestion.answerType === 'single' || nextQuestion.answerType === 'multiple') &&
      nextQuestion.options.length === 0
    ) {
      setAdminMessage('Tek seçim veya çoklu seçim soruları için en az bir seçenek girin.');
      return;
    }

    if (quoteQuestionForm.answerType === 'text' && quoteQuestionForm.maxLength.trim() && nextQuestion.maxLength === 0) {
      setAdminMessage('Metin soruları için maksimum karakter pozitif tam sayı olmalı.');
      return;
    }

    if (
      quoteQuestionForm.answerType === 'number' &&
      (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 6)
    ) {
      setAdminMessage('Sayı soruları için küsürat basamağı 0 ile 6 arasında olmalı.');
      return;
    }

    const existingProductQuestions = quoteQuestions
      .filter(
        (question) =>
          question.categoryKey === quoteQuestionFormCategoryKey &&
          question.productKey === quoteQuestionFormProductKey &&
          question.id !== editingQuoteQuestionId,
      )
      .sort((firstQuestion, secondQuestion) => firstQuestion.sortOrder - secondQuestion.sortOrder);
    const editedQuestion = editingQuoteQuestionId
      ? quoteQuestions.find((question) => question.id === editingQuoteQuestionId)
      : null;
    const questions = [
      ...existingProductQuestions.map((question, index) => ({
        ...question,
        productKey: quoteQuestionFormProductKey,
        sortOrder: index + 1,
      })),
      {
        ...nextQuestion,
        sortOrder: editedQuestion?.sortOrder ?? existingProductQuestions.length + 1,
      },
    ]
      .sort((firstQuestion, secondQuestion) => firstQuestion.sortOrder - secondQuestion.sortOrder)
      .map((question, index) => ({
        ...question,
        sortOrder: index + 1,
      }));

    setIsSavingQuoteQuestions(true);

    try {
      const response = await authorizedFetch('/api/quote-questions', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          categoryKey: quoteQuestionFormCategoryKey,
          productKey: quoteQuestionFormProductKey,
          questions,
        }),
      });
      const data = (await response.json()) as { questions?: QuoteQuestion[] };

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data.questions) {
        setAdminMessage('Teklif soruları kaydedilemedi.');
        return;
      }

      setQuoteQuestions((currentQuestions) => [
        ...currentQuestions.filter(
          (question) =>
            question.categoryKey !== quoteQuestionFormCategoryKey ||
            question.productKey !== quoteQuestionFormProductKey,
        ),
        ...(data.questions ?? []),
      ]);
      setQuoteQuestionCategoryKey(quoteQuestionFormCategoryKey);
      setQuoteQuestionProductKey(quoteQuestionFormProductKey);
      setAdminMessage(editingQuoteQuestionId ? 'Teklif sorusu güncellendi.' : 'Teklif sorusu eklendi.');
      closeQuoteQuestionModal();
    } catch {
      setAdminMessage('Teklif soruları kaydedilemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingQuoteQuestions(false);
    }
  };

  const getQuoteQuestionGroupCount = (question: QuoteQuestion) => {
    const productKey = question.productKey ?? '';

    return quoteQuestions.filter(
      (groupQuestion) =>
        groupQuestion.categoryKey === question.categoryKey &&
        (groupQuestion.productKey ?? '') === productKey,
    ).length;
  };

  const updateQuoteQuestionSortOrder = async (question: QuoteQuestion, nextSortOrder: number) => {
    const productKey = question.productKey ?? '';
    const groupQuestions = quoteQuestions
      .filter(
        (groupQuestion) =>
          groupQuestion.categoryKey === question.categoryKey &&
          (groupQuestion.productKey ?? '') === productKey,
      )
      .sort((firstQuestion, secondQuestion) => firstQuestion.sortOrder - secondQuestion.sortOrder);
    const currentIndex = groupQuestions.findIndex((groupQuestion) => groupQuestion.id === question.id);
    const targetIndex = Math.min(Math.max(nextSortOrder, 1), groupQuestions.length) - 1;

    if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) {
      return;
    }

    const reorderedQuestions = [...groupQuestions];
    [reorderedQuestions[currentIndex], reorderedQuestions[targetIndex]] = [
      reorderedQuestions[targetIndex],
      reorderedQuestions[currentIndex],
    ];
    const questions = reorderedQuestions.map((groupQuestion, index) => ({
      ...groupQuestion,
      productKey,
      sortOrder: index + 1,
    }));

    setIsSavingQuoteQuestions(true);

    try {
      const response = await authorizedFetch('/api/quote-questions', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          categoryKey: question.categoryKey,
          productKey,
          questions,
        }),
      });
      const data = (await response.json().catch(() => null)) as { questions?: QuoteQuestion[] } | null;

      if (response.status === 401) {
        setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        await logoutAdmin();
        return;
      }

      if (!response.ok || !data?.questions) {
        setAdminMessage('Soru sırası güncellenemedi.');
        return;
      }

      setQuoteQuestions((currentQuestions) => [
        ...currentQuestions.filter(
          (currentQuestion) =>
            currentQuestion.categoryKey !== question.categoryKey ||
            (currentQuestion.productKey ?? '') !== productKey,
        ),
        ...(data.questions ?? []),
      ]);
      setAdminMessage('Soru sırası güncellendi.');
    } catch {
      setAdminMessage('Soru sırası güncellenemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsSavingQuoteQuestions(false);
    }
  };

  const submitQuoteRequest = async (isAnonymous: boolean) => {
    if (!selectedQuoteCategory || !selectedQuoteProduct || isQuoteContinueDisabled || (!isAnonymous && !isQuoteContactComplete)) {
      return;
    }

    setIsSubmittingQuoteRequest(true);
    setQuoteSubmitMessage('');
    const whatsappWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');

    const whatsappMessage = isAnonymous
      ? [
          'Merhaba, teklif almak istiyorum.',
          `Kategori: ${selectedQuoteCategory.title}`,
          `Ürün: ${selectedQuoteProduct.title}`,
          'İletişim bilgisi: İsimsiz devam',
          quoteAnswerSummary,
        ]
          .filter(Boolean)
          .join('\n')
      : quoteContinueMessage;

    try {
      const response = await fetch(apiUrl('/api/quote-requests'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          isAnonymous,
          categoryKey: selectedQuoteCategory.key,
          categoryTitle: selectedQuoteCategory.title,
          productKey: selectedQuoteProduct.key,
          productTitle: selectedQuoteProduct.title,
          fullName: isAnonymous ? '' : quoteContactForm.fullName.trim(),
          phone: isAnonymous ? '' : quoteFullPhone,
          email: isAnonymous ? '' : quoteContactForm.email.trim(),
          answers: activeQuoteQuestions.map((question) => {
            const answer = quoteAnswers[question.id];

            return {
              questionId: question.id,
              question: question.question,
              answer: Array.isArray(answer) ? answer : answer ?? '',
            };
          }),
          whatsappMessage,
        }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; whatsappUrl?: string } | null;

      if (!response.ok || !data?.ok || !data.whatsappUrl) {
        whatsappWindow?.close();
        setQuoteSubmitMessage('Teklif bilgileriniz kaydedilemedi. Lütfen tekrar deneyin.');
        return;
      }

      setQuoteSubmitMessage('Bilgileriniz kaydedildi. WhatsApp açılıyor...');
      if (whatsappWindow) {
        whatsappWindow.location.href = data.whatsappUrl;
      } else {
        window.location.href = data.whatsappUrl;
      }
    } catch {
      whatsappWindow?.close();
      setQuoteSubmitMessage('Teklif bilgileriniz kaydedilemedi. Bağlantınızı kontrol edin.');
    } finally {
      setIsSubmittingQuoteRequest(false);
    }
  };

  const submitServiceRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingServiceRequest(true);
    setServiceRequestMessage('');

    const nameParts = serviceRequestForm.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') || '-';
    const phoneSuffix = serviceRequestForm.phone.replace(/\D/g, '');
    const payload = {
      requestType: serviceRequestForm.requestType.trim(),
      firstName,
      lastName,
      phone: `+90 ${phoneSuffix}`,
      productKey: serviceRequestForm.productKey,
      description: serviceRequestForm.description.trim(),
    };

    try {
      const response = await fetch(apiUrl('/api/service-requests'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; emailSent?: boolean; pushoverSent?: boolean } | null;

      if (!response.ok || !data?.ok) {
        setServiceRequestMessage('Servis kaydı gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.');
        return;
      }

      setServiceRequestForm(emptyServiceRequestForm);
      setServiceRequestMessage(
        data.pushoverSent
          ? 'Servis kaydınız alındı. Ekibimize Pushover bildirimi gönderildi.'
          : data.emailSent
            ? 'Servis kaydınız alındı. Ekibimize e-posta bildirimi gönderildi.'
          : 'Servis kaydınız alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.',
      );
      setTimeout(() => setIsServiceRequestModalOpen(false), 1400);
    } catch {
      setServiceRequestMessage('Servis kaydı gönderilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setIsSubmittingServiceRequest(false);
    }
  };

  const saveBlogPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const seo = calculateBlogSeo(blogPostForm);
    const payload = {
      key: blogPostForm.key.trim(),
      title: blogPostForm.title.trim(),
      summary: blogPostForm.summary.trim(),
      targetKeyword: blogPostForm.targetKeyword.trim(),
      content: blogPostForm.content.trim(),
      slug: blogPostForm.slug.trim(),
      metaTitle: blogPostForm.metaTitle.trim(),
      metaKeywords: blogPostForm.metaKeywords.trim(),
      metaDescription: blogPostForm.metaDescription.trim(),
      image: blogPostForm.image.trim(),
      imageAlt: blogPostForm.imageAlt.trim(),
      oldUrl: blogPostForm.oldUrl.trim(),
      seoScore: seo.score,
      status: blogPostForm.status,
      publishedAt: blogPostForm.publishedAt.trim(),
      categories: blogPostForm.categories,
      tags: blogPostForm.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const response = await authorizedFetch(
      editingBlogKey ? `/api/blog-posts/${encodeURIComponent(editingBlogKey)}` : '/api/blog-posts',
      {
        method: editingBlogKey ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      setAdminMessage('Blog yazısı kaydedilemedi. Lütfen zorunlu alanları kontrol edin.');
      return;
    }

    await reloadAdminCatalog();
    setAdminMessage(editingBlogKey ? 'Blog yazısı güncellendi.' : 'Yeni blog yazısı eklendi.');
    closeBlogModal();
  };

  const deleteBlogPost = async () => {
    if (!editingBlogKey) {
      return;
    }

    const response = await authorizedFetch(`/api/blog-posts/${encodeURIComponent(editingBlogKey)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      setAdminMessage('Blog yazısı silinemedi.');
      return;
    }

    await reloadAdminCatalog();
    setAdminMessage('Blog yazısı silindi.');
    closeBlogModal();
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: productForm.key.trim(),
      categoryKey: productForm.categoryKey,
      title: productForm.title.trim(),
      slug: productForm.slug.trim(),
      description: productForm.description.trim(),
      metaTitle: productForm.metaTitle.trim(),
      metaKeywords: productForm.metaKeywords.trim(),
      metaDescription: productForm.metaDescription.trim(),
      image: productForm.image.trim(),
      imageSquare: productForm.imageSquare.trim(),
      imageHorizontal: productForm.imageHorizontal.trim(),
      imageVertical: productForm.imageVertical.trim(),
      sortOrder: parseSortOrder(productForm.sortOrder),
      alt: productForm.alt.trim(),
      badges: productForm.badges
        .split(',')
        .map((badge) => badge.trim())
        .filter(Boolean),
      children: [],
    };

    if (!payload.categoryKey) {
      setAdminMessage('Lütfen ürün kategorisi seçin.');
      return;
    }

    const duplicateProduct = adminProducts.find(
      (product) =>
        product.key !== editingProductKey && (product.key === payload.key || product.slug === payload.slug),
    );

    if (duplicateProduct?.key === payload.key) {
      setAdminMessage('Bu kayıt anahtarı zaten kullanılıyor.');
      return;
    }

    if (duplicateProduct?.slug === payload.slug) {
      setAdminMessage('Bu slug zaten kullanılıyor.');
      return;
    }

    const response = await authorizedFetch(
      editingProductKey ? `/api/products/${encodeURIComponent(editingProductKey)}` : '/api/products',
      {
        method: editingProductKey ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as { error?: string } | null;

      if (response.status === 409 && errorData?.error === 'duplicate_product_key') {
        setAdminMessage('Bu kayıt anahtarı zaten kullanılıyor.');
        return;
      }

      if (response.status === 409 && errorData?.error === 'duplicate_product_slug') {
        setAdminMessage('Bu slug zaten kullanılıyor.');
        return;
      }

      setAdminMessage('Kayıt kaydedilemedi. Lütfen alanları kontrol edin.');
      return;
    }

    await reloadAdminCatalog();

    setAdminMessage(editingProductKey ? 'Ürün güncellendi.' : 'Yeni ürün eklendi.');
    closeProductModal();
  };

  const deleteProduct = async () => {
    if (!editingProductKey) {
      return;
    }

    if (!isConfirmingProductDelete) {
      setIsConfirmingProductDelete(true);
      return;
    }

    const response = await authorizedFetch(`/api/products/${encodeURIComponent(editingProductKey)}`, {
      method: 'DELETE',
    });

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok) {
      setAdminMessage('Ürün silinemedi.');
      return;
    }

    await reloadAdminCatalog();
    setAdminMessage('Ürün silindi.');
    closeProductModal();
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: categoryForm.key.trim(),
      title: categoryForm.title.trim(),
      slug: categoryForm.slug.trim(),
      description: categoryForm.description.trim(),
      metaTitle: categoryForm.metaTitle.trim(),
      metaKeywords: categoryForm.metaKeywords.trim(),
      metaDescription: categoryForm.metaDescription.trim(),
      image: categoryForm.image.trim(),
      imageSquare: categoryForm.imageSquare.trim(),
      imageHorizontal: categoryForm.imageHorizontal.trim(),
      imageVertical: categoryForm.imageVertical.trim(),
      sortOrder: parseSortOrder(categoryForm.sortOrder),
    };

    const response = await authorizedFetch(
      editingCategoryKey
        ? `/api/product-categories/${encodeURIComponent(editingCategoryKey)}`
        : '/api/product-categories',
      {
        method: editingCategoryKey ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok) {
      setAdminMessage('Kategori kaydedilemedi. Lütfen alanları kontrol edin.');
      return;
    }

    await reloadAdminCatalog();
    setAdminMessage(editingCategoryKey ? 'Kategori güncellendi.' : 'Yeni kategori eklendi.');
    setEditingCategoryKey(null);
    setCategoryForm(emptyCategoryForm);
    setIsConfirmingCategoryDelete(false);
  };

  const deleteCategory = async () => {
    if (!editingCategoryKey) {
      return;
    }

    if (!isConfirmingCategoryDelete) {
      setIsConfirmingCategoryDelete(true);
      return;
    }

    const response = await authorizedFetch(`/api/product-categories/${encodeURIComponent(editingCategoryKey)}`, {
      method: 'DELETE',
    });

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok) {
      setAdminMessage('Kategori silinemedi.');
      return;
    }

    await reloadAdminCatalog();
    setAdminMessage('Kategori silindi.');
    setEditingCategoryKey(null);
    setCategoryForm(emptyCategoryForm);
    setIsConfirmingCategoryDelete(false);
  };

  const saveReference = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: referenceForm.key.trim(),
      title: referenceForm.title.trim(),
      description: referenceForm.description.trim(),
      imageUrl: referenceForm.imageUrl.trim(),
      sortOrder: parseSortOrder(referenceForm.sortOrder),
      isActive: referenceForm.isActive,
    };

    const response = await authorizedFetch(
      editingReferenceKey ? `/api/references/${encodeURIComponent(editingReferenceKey)}` : '/api/references',
      {
        method: editingReferenceKey ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
    const data = (await response.json().catch(() => null)) as { references?: SiteReference[] } | null;

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok || !data?.references) {
      setAdminMessage('Referans kaydedilemedi. Başlık ve görsel alanlarını kontrol edin.');
      return;
    }

    setSiteReferences(data.references);
    setAdminMessage(editingReferenceKey ? 'Referans güncellendi.' : 'Yeni referans eklendi.');
    closeReferenceModal();
  };

  const deleteReference = async () => {
    if (!editingReferenceKey) {
      return;
    }

    const response = await authorizedFetch(`/api/references/${encodeURIComponent(editingReferenceKey)}`, {
      method: 'DELETE',
    });
    const data = (await response.json().catch(() => null)) as { references?: SiteReference[] } | null;

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok || !data?.references) {
      setAdminMessage('Referans silinemedi.');
      return;
    }

    setSiteReferences(data.references);
    setAdminMessage('Referans silindi.');
    closeReferenceModal();
  };

  const saveSiteService = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: siteServiceForm.key.trim(),
      title: siteServiceForm.title.trim(),
      summary: siteServiceForm.summary.trim(),
      detail: siteServiceForm.detail.trim(),
      imageUrl: siteServiceForm.imageUrl.trim(),
      sortOrder: parseSortOrder(siteServiceForm.sortOrder),
      isActive: siteServiceForm.isActive,
    };

    const response = await authorizedFetch(
      editingSiteServiceKey ? `/api/services/${encodeURIComponent(editingSiteServiceKey)}` : '/api/services',
      {
        method: editingSiteServiceKey ? 'PUT' : 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
    const data = (await response.json().catch(() => null)) as { services?: SiteService[] } | null;

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok || !data?.services) {
      setAdminMessage('Hizmet kaydedilemedi. Başlık, özet ve detay alanlarını kontrol edin.');
      return;
    }

    setSiteServices(data.services);
    setAdminMessage(editingSiteServiceKey ? 'Hizmet güncellendi.' : 'Yeni hizmet eklendi.');
    closeSiteServiceModal();
  };

  const deleteSiteService = async () => {
    if (!editingSiteServiceKey) {
      return;
    }

    const response = await authorizedFetch(`/api/services/${encodeURIComponent(editingSiteServiceKey)}`, {
      method: 'DELETE',
    });
    const data = (await response.json().catch(() => null)) as { services?: SiteService[] } | null;

    if (response.status === 401) {
      setAdminMessage('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      await logoutAdmin();
      return;
    }

    if (!response.ok || !data?.services) {
      setAdminMessage('Hizmet silinemedi.');
      return;
    }

    setSiteServices(data.services);
    setAdminMessage('Hizmet silindi.');
    closeSiteServiceModal();
  };

  if (isPanelPage && authStatus === 'checking') {
    return (
      <main className="adminLoginPage">
        <section className="adminLoginCard adminLoginStatusCard">
          <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
          <p>Oturum kontrol ediliyor...</p>
        </section>
      </main>
    );
  }

  if (isPanelPage && authStatus !== 'authenticated') {
    return (
      <main className="adminLoginPage">
        <motion.section
          className="adminLoginCard"
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <div className="adminLoginFormPane">
            <a className="adminLoginLogo" href="/" aria-label="HHS ana sayfa">
              <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
            </a>

            <div className="adminLoginHeader">
              <p>HHS Yönetim</p>
              <h1>Kullanıcı Girişi</h1>
            </div>

            <form className="adminLoginForm" onSubmit={submitLogin}>
              <label>
                <UserRound size={18} strokeWidth={2.2} />
                <input
                  required
                  value={loginForm.login}
                  onChange={(event) => updateLoginForm('login', event.target.value)}
                  placeholder="Kullanıcı adı veya e-posta"
                  autoComplete="username"
                />
              </label>

              <label>
                <LockKeyhole size={18} strokeWidth={2.2} />
                <input
                  required
                  value={loginForm.password}
                  onChange={(event) => updateLoginForm('password', event.target.value)}
                  placeholder="Şifre"
                  type="password"
                  autoComplete="current-password"
                />
              </label>

              <a href="mailto:info@hhsotomatikkapi.com">Parolamı unuttum</a>

              {adminMessage && <div className="adminLoginError">{adminMessage}</div>}

              <button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Devam ediliyor...' : 'Devam Et >'}
              </button>
            </form>
          </div>

          <div className="adminLoginVisualPane">
            <img
              src="/admin-login-building.png"
              alt="HHS yönetim paneli giriş görseli"
            />
            <div>
              <ShieldCheck size={34} strokeWidth={2.1} />
              <h2>Güvenli Yönetim Paneli</h2>
              <p>Ürün, kategori ve footer ayarları artık yalnızca yetkili D1 kullanıcılarıyla düzenlenir.</p>
            </div>
          </div>
        </motion.section>
      </main>
    );
  }

  if (isPanelPage) {
    return (
      <main className="adminShell">
        <aside className="adminSidebar">
          <div className="adminBrandRow">
            <a className="adminLogo" href="/" aria-label="HHS ana sayfa">
              <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
            </a>
            <a className="adminSiteLink" href="/" target="_blank" rel="noreferrer" aria-label="Siteye git">
              <ExternalLink size={18} strokeWidth={2.3} />
            </a>
          </div>

          <nav className="adminNav" aria-label="Panel menüsü">
            {canAccessModule('products') && (
              <button
                className={`adminNavItem${activeAdminSection === 'products' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('products')}
              >
                <Package size={20} strokeWidth={2.2} />
                <span>Ürünler</span>
              </button>
            )}
            {canAccessModule('blog') && (
              <button
                className={`adminNavItem${activeAdminSection === 'blog' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('blog')}
              >
                <FileText size={20} strokeWidth={2.2} />
                <span>Blog</span>
              </button>
            )}
            {canAccessModule('products') && (
              <button
                className={`adminNavItem${activeAdminSection === 'assets' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  setAdminSection('assets');
                  void reloadAssets();
                }}
              >
                <Upload size={20} strokeWidth={2.2} />
                <span>Görsel Yönetimi</span>
              </button>
            )}
            {canAccessModule('settings') && (
              <button
                className={`adminNavItem${activeAdminSection === 'quoteQuestions' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('quoteQuestions')}
              >
                <FileText size={20} strokeWidth={2.2} />
                <span>Teklif Soruları</span>
              </button>
            )}
            {canAccessModule('settings') && (
              <button
                className={`adminNavItem${activeAdminSection === 'services' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('services')}
              >
                <Settings size={20} strokeWidth={2.2} />
                <span>Hizmet Alanları</span>
              </button>
            )}
            {canAccessModule('settings') && (
              <button
                className={`adminNavItem${activeAdminSection === 'references' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('references')}
              >
                <ShieldCheck size={20} strokeWidth={2.2} />
                <span>Referanslar</span>
              </button>
            )}
            {canAccessModule('settings') && (
              <button
                className={`adminNavItem${activeAdminSection === 'quoteRequests' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  setAdminSection('quoteRequests');

                  if (quoteRequests.length === 0) {
                    void loadQuoteRequests();
                  }
                }}
              >
                <Mail size={20} strokeWidth={2.2} />
                <span>Teklif Talepleri</span>
                {openQuoteRequestCount > 0 && <strong className="adminNavBadge">{openQuoteRequestCount}</strong>}
              </button>
            )}
            {canAccessModule('settings') && (
              <button
                className={`adminNavItem${activeAdminSection === 'serviceRequests' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  setAdminSection('serviceRequests');

                  if (serviceRequests.length === 0) {
                    void loadServiceRequests();
                  }
                }}
              >
                <Settings size={20} strokeWidth={2.2} />
                <span>Servis Talepleri</span>
                {openServiceRequestCount > 0 && <strong className="adminNavBadge">{openServiceRequestCount}</strong>}
              </button>
            )}
            {canAccessModule('users') && (
              <button
                className={`adminNavItem${activeAdminSection === 'users' ? ' active' : ''}`}
                type="button"
                onClick={() => setAdminSection('users')}
              >
                <UserRound size={20} strokeWidth={2.2} />
                <span>Kullanıcılar</span>
              </button>
            )}
            {canAccessModule('database') && (
              <button
                className={`adminNavItem${activeAdminSection === 'database' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  setAdminSection('database');

                  if (databaseTables.length === 0) {
                    void loadDatabaseTables();
                  }
                }}
              >
                <Database size={20} strokeWidth={2.2} />
                <span>Veritabanı</span>
              </button>
            )}
          </nav>

          <div className="adminSidebarFooter">
            {canAccessModule('settings') && (
              <button className="adminSettings" type="button" onClick={openSettingsModal}>
                <Settings size={18} strokeWidth={2.2} />
                <span>Ayarlar</span>
              </button>
            )}
            <button className="adminSettings" type="button" onClick={logoutAdmin}>
              <LogOut size={18} strokeWidth={2.2} />
              <span>Çıkış Yap</span>
            </button>

            <div className="adminUser">
              <div className="adminUserAvatar">
                {adminUser?.avatarUrl ? (
                  <img src={adminUser.avatarUrl} alt={adminUser.displayName} />
                ) : (
                  <UserRound size={18} strokeWidth={2.2} />
                )}
              </div>
              <div>
                <strong>{adminUser?.displayName ?? 'Admin'}</strong>
                <span>{adminUser?.email ?? 'HHS Yönetim'}</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="adminMain">
          <header className="adminTopbar">
            <div>
              <p>Admin Panel</p>
              <h1>
                {activeAdminSection === 'products'
                  ? 'Ürünler'
                  : activeAdminSection === 'blog'
                    ? 'Blog'
                    : activeAdminSection === 'assets'
                      ? 'Görsel Yönetimi'
                      : activeAdminSection === 'references'
                        ? 'Referanslar'
                        : activeAdminSection === 'services'
                          ? 'Hizmet Alanları'
                          : activeAdminSection === 'quoteQuestions'
                            ? 'Teklif Soruları'
                            : activeAdminSection === 'quoteRequests'
                              ? 'Teklif Talepleri'
                              : activeAdminSection === 'serviceRequests'
                                ? 'Servis Talepleri'
                                : activeAdminSection === 'users'
                                  ? 'Kullanıcılar'
                                  : 'Veritabanı'}
              </h1>
            </div>
            {activeAdminSection === 'products' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openCategoryModal}>
                  Kategoriler
                </button>
                <button type="button" onClick={openNewProductModal}>
                  Yeni Ürün
                </button>
              </div>
            ) : activeAdminSection === 'blog' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openNewBlogModal}>
                  Yeni Blog Yazısı
                </button>
              </div>
            ) : activeAdminSection === 'users' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openNewUserModal}>
                  Yeni Kullanıcı
                </button>
              </div>
            ) : activeAdminSection === 'references' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openNewReferenceModal}>
                  Yeni Referans
                </button>
              </div>
            ) : activeAdminSection === 'services' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openNewSiteServiceModal}>
                  Yeni Hizmet
                </button>
              </div>
            ) : activeAdminSection === 'assets' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={showAllAssets} disabled={isLoadingAssets}>
                  {isLoadingAssets ? 'Yükleniyor...' : 'Görselleri Yenile'}
                </button>
                <button type="button" onClick={showUnusedAssets} disabled={isLoadingAssets}>
                  Kullanılmayanları Göster
                </button>
                {selectedAssetKeys.size > 0 && (
                  <button type="button" onClick={deleteSelectedAssets} disabled={isDeletingSelectedAssets}>
                    {isDeletingSelectedAssets ? 'Siliniyor...' : `Seçili Kullanılmayanları Sil (${selectedAssetKeys.size})`}
                  </button>
                )}
              </div>
            ) : activeAdminSection === 'database' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={loadDatabaseTables} disabled={isLoadingDatabaseTables}>
                  {isLoadingDatabaseTables ? 'Yükleniyor...' : 'Yenile'}
                </button>
              </div>
            ) : activeAdminSection === 'quoteRequests' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={sendPushoverTestNotification} disabled={isSendingPushoverTest}>
                  {isSendingPushoverTest ? 'Gönderiliyor...' : 'Deneme Bildirimi'}
                </button>
                <button type="button" onClick={loadQuoteRequests} disabled={isLoadingQuoteRequests}>
                  {isLoadingQuoteRequests ? 'Yükleniyor...' : 'Yenile'}
                </button>
              </div>
            ) : activeAdminSection === 'serviceRequests' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={loadServiceRequests} disabled={isLoadingServiceRequests}>
                  {isLoadingServiceRequests ? 'Yükleniyor...' : 'Yenile'}
                </button>
              </div>
            ) : null}
          </header>

          <AnimatePresence>
            {adminMessage && (
              <motion.div
                className="adminToast"
                role="status"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <span>{adminMessage}</span>
                <button type="button" aria-label="Bildirimi kapat" onClick={() => setAdminMessage('')}>
                  <X size={16} strokeWidth={2.4} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {activeAdminSection === 'products' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Ürün</span>
                  <strong>{adminProducts.length}</strong>
                </article>
                <article>
                  <span>Kategori</span>
                  <strong>{adminCategories.length}</strong>
                </article>
                <article>
                  <span>Durum</span>
                  <strong>{adminProductCategoryFilter ? `${visibleAdminProducts.length} Ürün` : 'Hazır'}</strong>
                </article>
              </div>

              <div className="adminProductFilters">
                <label>
                  Kategori
                  <select
                    value={adminProductCategoryFilter}
                    onChange={(event) => setAdminProductCategoryFilter(event.target.value)}
                  >
                    <option value="">Tüm kategoriler</option>
                    {adminCategories.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>
                {adminProductCategoryFilter && (
                  <button type="button" onClick={() => setAdminProductCategoryFilter('')}>
                    Filtreyi Temizle
                  </button>
                )}
              </div>

              <div className="adminProducts">
                {visibleAdminProducts.length === 0 ? (
                  <p className="adminProductEmpty">Bu kategoride ürün bulunamadı.</p>
                ) : visibleAdminProducts.map((product) => (
                  <button
                    className="adminProductCard"
                    key={product.key}
                    type="button"
                    onClick={() => openEditProductModal(product)}
                  >
                    <img src={product.imageSquare || product.imageHorizontal || product.image} alt={product.alt} />
                    <div>
                      <span>{product.categoryTitle}</span>
                      <h2>{product.title}</h2>
                      <p>
                        Sıra: {product.sortOrder} {product.badges.length ? ` / ${product.badges.slice(0, 2).join(' / ')}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : activeAdminSection === 'blog' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Yazı</span>
                  <strong>{blogPosts.length}</strong>
                </article>
                <article>
                  <span>Yayında</span>
                  <strong>{blogPosts.filter((post) => post.status === 'published').length}</strong>
                </article>
                <article>
                  <span>Kategori</span>
                  <strong>{blogCategories.length}</strong>
                </article>
              </div>

              <div className="adminProducts">
                {blogPosts.map((post) => (
                  <button
                    className={`adminProductCard adminBlogCard${post.status === 'draft' ? ' draft' : ' published'}`}
                    key={post.key}
                    type="button"
                    onClick={() => openEditBlogModal(post)}
                  >
                    {post.image ? <img src={post.image} alt={post.imageAlt || post.title} /> : <div className="adminBlogImageFallback" />}
                    <div>
                      <span>{post.status === 'published' ? 'Yayında' : 'Taslak'} / SEO %{post.seoScore}</span>
                      <h2>{post.title}</h2>
                      <p>{post.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : activeAdminSection === 'references' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Referans</span>
                  <strong>{siteReferences.length}</strong>
                </article>
                <article>
                  <span>Yayında</span>
                  <strong>{siteReferences.filter((reference) => reference.isActive).length}</strong>
                </article>
                <article>
                  <span>Sıralama</span>
                  <strong>Panelden</strong>
                </article>
              </div>

              <div className="adminProducts adminReferenceGrid">
                {siteReferences.length === 0 ? (
                  <p className="adminProductEmpty">Henüz referans eklenmedi.</p>
                ) : siteReferences.map((reference) => (
                  <button
                    className={`adminProductCard adminReferenceCard${reference.isActive ? ' active' : ' passive'}`}
                    key={reference.key}
                    type="button"
                    onClick={() => openEditReferenceModal(reference)}
                  >
                    <img src={reference.imageUrl} alt={reference.title} />
                    <div>
                      <span>{reference.isActive ? 'Yayında' : 'Pasif'} / Sıra {reference.sortOrder}</span>
                      <h2>{reference.title}</h2>
                      <p>{reference.description || 'Detay metni eklenmedi.'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : activeAdminSection === 'services' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Hizmet</span>
                  <strong>{siteServices.length}</strong>
                </article>
                <article>
                  <span>Yayında</span>
                  <strong>{siteServices.filter((service) => service.isActive).length}</strong>
                </article>
                <article>
                  <span>Sıralama</span>
                  <strong>Panelden</strong>
                </article>
              </div>

              <div className="adminProducts adminReferenceGrid">
                {siteServices.length === 0 ? (
                  <p className="adminProductEmpty">Henüz hizmet alanı eklenmedi.</p>
                ) : siteServices.map((service) => (
                  <button
                    className={`adminProductCard adminServiceCard${service.isActive ? ' active' : ' passive'}`}
                    key={service.key}
                    type="button"
                    onClick={() => openEditSiteServiceModal(service)}
                  >
                    {service.imageUrl ? <img src={service.imageUrl} alt={service.title} /> : <span className="adminServiceImagePlaceholder">Görsel Yok</span>}
                    <div>
                      <span>{service.isActive ? 'Yayında' : 'Pasif'} / Sıra {service.sortOrder}</span>
                      <h2>{service.title}</h2>
                      <p>{service.summary || 'Özet metni eklenmedi.'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : activeAdminSection === 'assets' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Görsel</span>
                  <strong>{visibleAssets.length}</strong>
                </article>
                <article>
                  <span>Toplam Boyut</span>
                  <strong>{Math.round(visibleAssets.reduce((total, asset) => total + asset.size, 0) / 1024)} KB</strong>
                </article>
                <article>
                  <span>Durum</span>
                  <strong>
                    {selectedVisibleAssetCount > 0
                      ? `${selectedVisibleAssetCount} Seçili`
                      : assetViewMode === 'unused'
                        ? 'Kullanılmayan'
                        : isLoadingAssets
                          ? 'Yükleniyor'
                          : 'Hazır'}
                  </strong>
                </article>
              </div>

              <div className="adminAssetManagerPanel">
                <div className="adminAssetFolders" aria-label="Görsel klasörleri">
                  {assetFolderFilters.map((folder) => {
                    const folderCount =
                      folder.key === 'all'
                        ? assets.length
                        : assets.filter((asset) => getAssetFolderKey(asset.key) === folder.key).length;

                    return (
                      <button
                        className={activeAssetFolder === folder.key ? 'active' : ''}
                        key={folder.key}
                        type="button"
                        onClick={() => setActiveAssetFolder(folder.key)}
                      >
                        <strong>{folder.label}</strong>
                        <span>{folderCount}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="adminAssetManagerBody">
                  {isLoadingAssets ? (
                    <p>Görseller yükleniyor...</p>
                  ) : visibleAssets.length === 0 ? (
                    <p>R2 üzerinde kayıtlı görsel bulunamadı.</p>
                  ) : (
                    <div className="adminAssetGrid">
                      {visibleAssets.map((asset) => (
                        <article className="adminAssetCard" key={asset.key}>
                          <label className="adminAssetSelect">
                            <input
                              type="checkbox"
                              checked={selectedAssetKeys.has(asset.key)}
                              disabled={Boolean(asset.isUsed)}
                              onChange={() => toggleAssetSelection(asset.key)}
                            />
                            <span>{asset.isUsed ? 'Kullanımda' : 'Seç'}</span>
                          </label>
                          <button
                            className="adminAssetPreview"
                            type="button"
                            aria-label={`${asset.key} görselini önizle`}
                            onClick={() => setImagePreview({ title: asset.key, url: asset.url })}
                          >
                            <img src={asset.url} alt="" />
                          </button>
                          <strong>{asset.key}</strong>
                          <span>{getAssetFolderLabel(asset.key)} / {Math.round(asset.size / 1024)} KB</span>
                          <span>{getAssetUsageLabel(asset)}</span>
                          <button type="button" onClick={() => deleteAsset(asset)}>
                            Sil
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeAdminSection === 'quoteQuestions' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Kategori</span>
                  <strong>{adminCategories.length}</strong>
                </article>
                <article>
                  <span>Toplam Soru</span>
                  <strong>{quoteQuestions.length}</strong>
                </article>
                <article>
                  <span>Aktif Soru</span>
                  <strong>{quoteQuestions.filter((question) => question.isActive).length}</strong>
                </article>
              </div>

              <section className="adminPanelForm adminQuoteQuestionPanel">
                <div className="adminQuoteQuestionToolbar">
                  <label>
                    Kategori
                    <select
                      value={quoteQuestionCategoryKey}
                      onChange={(event) => selectQuoteQuestionCategory(event.target.value)}
                    >
                      <option value="">Tüm kategoriler</option>
                      {adminCategories.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Ürün
                    <select
                      value={quoteQuestionProductKey}
                      disabled={!quoteQuestionCategoryKey || quoteQuestionProducts.length === 0}
                      onChange={(event) => selectQuoteQuestionProduct(event.target.value)}
                    >
                      <option value="">Tüm ürünler</option>
                      {quoteQuestionProducts.map((product) => (
                        <option key={product.key} value={product.key}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button type="button" onClick={openNewQuoteQuestionModal}>
                    Yeni
                  </button>
                </div>

                {quoteQuestionCategoryKey && quoteQuestionProducts.length === 0 && (
                  <p className="adminFormHint">Bu kategoriye bağlı ürün bulunamadı.</p>
                )}

                {filteredQuoteQuestions.length === 0 ? (
                  <div className="adminQuoteQuestionEmpty">
                    <strong>Soru bulunamadı.</strong>
                    <span>Seçili filtre için henüz teklif sorusu eklenmemiş.</span>
                  </div>
                ) : (
                  <div className="adminQuoteQuestionList">
                    {filteredQuoteQuestions.map((question) => (
                      <article className="adminQuoteQuestionListCard" key={question.id}>
                        <label className="adminQuoteQuestionOrder">
                          <span>Sıra</span>
                          <input
                            min={1}
                            max={getQuoteQuestionGroupCount(question)}
                            step={1}
                            type="number"
                            value={question.sortOrder}
                            disabled={isSavingQuoteQuestions}
                            onChange={(event) => updateQuoteQuestionSortOrder(question, Number(event.target.value))}
                          />
                        </label>
                        <div className="adminQuoteQuestionMain">
                          <span className={question.isActive ? 'adminStatusDot active' : 'adminStatusDot'} />
                          {question.imageUrl && (
                            <img className="adminQuoteQuestionAvatar" src={question.imageUrl} alt="" aria-hidden="true" />
                          )}
                          <div>
                            <h3>{question.question}</h3>
                            <p>
                              {getAdminCategoryTitle(question.categoryKey)} / {getAdminProductTitle(question.productKey)}
                            </p>
                          </div>
                        </div>
                        <div className="adminQuoteQuestionInlineMeta">
                          <span>{getQuoteQuestionAnswerTypeLabel(question.answerType)}</span>
                          {question.isRequired && <span>Zorunlu</span>}
                          {question.defaultValue && <span>Varsayılan: {question.defaultValue}</span>}
                        </div>
                        <button type="button" onClick={() => openEditQuoteQuestionModal(question)}>
                          Düzenle
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : activeAdminSection === 'quoteRequests' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Talep</span>
                  <strong>{quoteRequests.length}</strong>
                </article>
                <article>
                  <span>İsimli Talep</span>
                  <strong>{quoteRequests.filter((request) => !request.isAnonymous).length}</strong>
                </article>
                <article>
                  <span>Son Talep</span>
                  <strong>{quoteRequests[0] ? formatAdminDateTime(quoteRequests[0].createdAt) : '-'}</strong>
                </article>
              </div>

              <section className="adminPanelForm adminQuoteRequestPanel">
                {quoteRequests.length === 0 ? (
                  <div className="adminQuoteQuestionEmpty">
                    <strong>Teklif talebi bulunamadı.</strong>
                    <span>Teklif Al modalından gönderilen talepler burada listelenecek.</span>
                  </div>
                ) : (
                  <div className="adminQuoteRequestList">
                    {quoteRequests.map((request) => (
                      <article className="adminQuoteRequestCard" key={request.id}>
                        <div className="adminQuoteRequestHeader">
                          <div>
                            <span>{request.isAnonymous ? 'İsimsiz Talep' : 'Teklif Talebi'}</span>
                            <h3>{request.productTitle || getAdminProductTitle(request.productKey)}</h3>
                            <p>
                              {request.categoryTitle || getAdminCategoryTitle(request.categoryKey)} /{' '}
                              {formatAdminDateTime(request.createdAt)}
                            </p>
                          </div>
                          <div className="adminQuoteRequestStatusGroup">
                            <span className="adminQuoteRequestStatus">{request.status === 'closed' ? 'Kapalı' : 'Açık'}</span>
                            {request.status !== 'closed' && (
                              <button
                                type="button"
                                onClick={() => closeQuoteRequest(request.id)}
                                disabled={closingRequestId === request.id}
                              >
                                {closingRequestId === request.id ? 'Kapatılıyor...' : 'Kapat'}
                              </button>
                            )}
                          </div>
                        </div>

                        <dl className="adminQuoteRequestContact">
                          <div>
                            <dt>Ad Soyad</dt>
                            <dd>{request.fullName || 'İsimsiz'}</dd>
                          </div>
                          <div>
                            <dt>Telefon</dt>
                            <dd>{request.phone || '-'}</dd>
                          </div>
                          <div>
                            <dt>Mail</dt>
                            <dd>{request.email || '-'}</dd>
                          </div>
                        </dl>

                        {request.answers.length > 0 && (
                          <div className="adminQuoteRequestAnswers">
                            {request.answers.map((answer, index) => (
                              <p key={`${request.id}-${answer.questionId || index}`}>
                                <strong>{answer.question}</strong>
                                <span>{formatQuoteRequestAnswer(answer.answer) || '-'}</span>
                              </p>
                            ))}
                          </div>
                        )}

                        <details className="adminQuoteRequestMessage">
                          <summary>WhatsApp mesajı</summary>
                          <pre>{request.whatsappMessage}</pre>
                        </details>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : activeAdminSection === 'serviceRequests' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Servis Talebi</span>
                  <strong>{serviceRequests.length}</strong>
                </article>
                <article>
                  <span>Açık Talep</span>
                  <strong>{openServiceRequestCount}</strong>
                </article>
                <article>
                  <span>Son Talep</span>
                  <strong>{serviceRequests[0] ? formatAdminDateTime(serviceRequests[0].createdAt) : '-'}</strong>
                </article>
              </div>

              <section className="adminPanelForm adminQuoteRequestPanel">
                {serviceRequests.length === 0 ? (
                  <div className="adminQuoteQuestionEmpty">
                    <strong>Servis talebi bulunamadı.</strong>
                    <span>Servis Kaydı formundan gönderilen talepler burada listelenecek.</span>
                  </div>
                ) : (
                  <div className="adminQuoteRequestList">
                    {serviceRequests.map((request) => (
                      <article className="adminQuoteRequestCard" key={request.id}>
                        <div className="adminQuoteRequestHeader">
                          <div>
                            <span>{request.requestType}</span>
                            <h3>{request.productTitle || getAdminProductTitle(request.productKey) || 'Ürün seçilmedi'}</h3>
                            <p>{formatAdminDateTime(request.createdAt)}</p>
                          </div>
                          <div className="adminQuoteRequestStatusGroup">
                            <span className="adminQuoteRequestStatus">{request.status === 'closed' ? 'Kapalı' : 'Açık'}</span>
                            {request.status !== 'closed' && (
                              <button
                                type="button"
                                onClick={() => closeServiceRequest(request.id)}
                                disabled={closingRequestId === request.id}
                              >
                                {closingRequestId === request.id ? 'Kapatılıyor...' : 'Kapat'}
                              </button>
                            )}
                          </div>
                        </div>

                        <dl className="adminQuoteRequestContact">
                          <div>
                            <dt>Ad Soyad</dt>
                            <dd>{request.fullName || '-'}</dd>
                          </div>
                          <div>
                            <dt>Telefon</dt>
                            <dd>{request.phone || '-'}</dd>
                          </div>
                          <div>
                            <dt>Bildirim</dt>
                            <dd>
                              {request.pushoverSent ? 'Pushover' : request.emailSent ? 'E-posta' : '-'}
                            </dd>
                          </div>
                        </dl>

                        {request.description && (
                          <details className="adminQuoteRequestMessage" open>
                            <summary>Açıklama</summary>
                            <pre>{request.description}</pre>
                          </details>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : activeAdminSection === 'users' ? (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Kullanıcı</span>
                  <strong>{adminUsers.length}</strong>
                </article>
                <article>
                  <span>Aktif Kullanıcı</span>
                  <strong>{adminUsers.filter((user) => user.isActive).length}</strong>
                </article>
                <article>
                  <span>Oturum</span>
                  <strong>Güvenli</strong>
                </article>
              </div>

              <div className="adminUsers">
                {adminUsers.map((user) => (
                  <button
                    className="adminUserCard"
                    key={user.id}
                    type="button"
                    onClick={() => openEditUserModal(user)}
                  >
                    <div className="adminUserCardAvatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} />
                      ) : (
                        <UserRound size={22} strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="adminUserCardBody">
                      <div>
                        <span className={user.isActive ? 'active' : 'passive'}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                        <h2>{user.displayName}</h2>
                        <p>{user.email}</p>
                      </div>
                      <dl>
                        <div>
                          <dt>Kullanıcı adı</dt>
                          <dd>{user.username}</dd>
                        </div>
                        <div>
                          <dt>Modül</dt>
                          <dd>{user.modules.length}</dd>
                        </div>
                      </dl>
                      <div className="adminUserModules">
                        {adminModuleOptions
                          .filter((moduleOption) => user.modules.includes(moduleOption.key))
                          .map((moduleOption) => (
                            <span key={moduleOption.key}>{moduleOption.label}</span>
                          ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="adminStats">
                <article>
                  <span>Toplam Tablo</span>
                  <strong>{databaseTables.length}</strong>
                </article>
                <article>
                  <span>Toplam Kayıt</span>
                  <strong>{databaseTables.reduce((total, table) => total + table.rowCount, 0)}</strong>
                </article>
                <article>
                  <span>Mod</span>
                  <strong>Readonly</strong>
                </article>
              </div>

              <div className="adminDatabaseList">
                <div className="adminDatabaseListHead">
                  <span>Tablo</span>
                  <span>Kayıt</span>
                  <span>Sütun</span>
                  <span>Boyut</span>
                  <span>Detay</span>
                </div>
                {databaseTables.map((table) => (
                  <article className="adminDatabaseRow" key={table.name}>
                    <div className="adminDatabaseTableName">
                      <Database size={20} strokeWidth={2.2} />
                      <strong>{table.name}</strong>
                    </div>
                    <span data-label="Kayıt">{table.rowCount}</span>
                    <span data-label="Sütun">{table.columns.length}</span>
                    <span data-label="Boyut">{formatTableSize(table.sizeBytes)}</span>
                    <button type="button" onClick={() => setSelectedDatabaseTable(table)}>
                      Sütunları Gör
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <AnimatePresence>
          {selectedDatabaseTable && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDatabaseTable(null)}
            >
              <motion.section
                className="adminProductModal adminDatabaseColumnsModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="database-columns-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>D1 Tablosu</p>
                    <h2 id="database-columns-modal-title">{selectedDatabaseTable.name}</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={() => setSelectedDatabaseTable(null)}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="adminDatabaseColumnsBody">
                  <dl className="adminDatabaseModalMeta">
                    <div>
                      <dt>Kayıt</dt>
                      <dd>{selectedDatabaseTable.rowCount}</dd>
                    </div>
                    <div>
                      <dt>Sütun</dt>
                      <dd>{selectedDatabaseTable.columns.length}</dd>
                    </div>
                    <div>
                      <dt>Boyut</dt>
                      <dd>{formatTableSize(selectedDatabaseTable.sizeBytes)}</dd>
                    </div>
                  </dl>

                  <div className="adminDatabaseColumns">
                    {selectedDatabaseTable.columns.map((column) => (
                      <div className="adminDatabaseColumn" key={column.name}>
                        <strong>{column.name}</strong>
                        <span>{column.type}</span>
                        <small>
                          {column.isPrimaryKey ? 'PK' : null}
                          {column.isPrimaryKey && column.isRequired ? ' / ' : null}
                          {column.isRequired ? 'Zorunlu' : 'Opsiyonel'}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adminFormActions">
                  <button type="button" onClick={() => setSelectedDatabaseTable(null)}>
                    Kapat
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}

          {pendingImageCrop && (
            <motion.div
              className="adminModalOverlay adminImageCropOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePendingImageCrop}
            >
              <motion.section
                className="adminProductModal adminImageCropModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="image-crop-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Görsel Kırpma</p>
                    <h2 id="image-crop-title">Kırpma merkezini seç</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closePendingImageCrop}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="adminImageCropBody">
                  <p>
                    {pendingImageCrop.assetType === 'page-image'
                      ? 'Soru görseli için kare önizlemenin üzerinde tıklayıp sürükleyerek kırpma merkezini ayarla.'
                      : 'Her oran için önizlemenin üzerinde ayrı ayrı tıklayıp sürükleyerek kırpma merkezini ayarla. Yükleme sırasında kare, yatay ve dikey görseller kendi seçimine göre oluşturulur.'}
                  </p>

                  <div className="adminCropPreviewGrid">
                    {getCropVariantOptions(pendingImageCrop.assetType).map(({ key, label }, index) => (
                      <div className={`adminCropPreview ${key}`} key={key}>
                        <div
                          className="adminCropPreviewFrame"
                          onPointerDown={(pointerEvent) => updatePendingCropPoint(pointerEvent, key)}
                          onPointerMove={(pointerEvent) => {
                            if (pointerEvent.buttons === 1) {
                              updatePendingCropPoint(pointerEvent, key);
                            }
                          }}
                        >
                          <img
                            src={pendingImageCrop.previewUrl}
                            alt={`${label} önizleme`}
                            ref={(imageElement) => {
                              cropPreviewImageRefs.current[index] = imageElement;
                            }}
                            draggable={false}
                          />
                          <span
                            className="adminImageCropPoint"
                            ref={(cropPointElement) => {
                              cropPointRefs.current[index] = cropPointElement;
                            }}
                          />
                        </div>
                        <strong>{label}</strong>
                        <small>Bu oran için kırpma alanını ayarla</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adminFormActions">
                  <button type="button" onClick={closePendingImageCrop}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    onClick={confirmImageCropAndUpload}
                    disabled={
                      pendingImageCrop.assetType === 'product-image'
                        ? isUploadingProductImage
                        : pendingImageCrop.assetType === 'blog-image'
                          ? isUploadingBlogImage
                          : pendingImageCrop.assetType === 'page-image'
                            ? isUploadingQuoteQuestionImage
                            : isUploadingCategoryImage
                    }
                  >
                    {pendingImageCrop.assetType === 'product-image'
                      ? isUploadingProductImage
                        ? 'Yükleniyor...'
                        : 'Kırp ve Yükle'
                      : pendingImageCrop.assetType === 'blog-image'
                        ? isUploadingBlogImage
                          ? 'Yükleniyor...'
                          : 'Kırp ve Yükle'
                        : pendingImageCrop.assetType === 'page-image'
                          ? isUploadingQuoteQuestionImage
                            ? 'Yükleniyor...'
                            : 'Kırp ve Yükle'
                          : isUploadingCategoryImage
                            ? 'Yükleniyor...'
                            : 'Kırp ve Yükle'}
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}

          {imagePreview && (
            <motion.div
              className="adminModalOverlay adminImagePreviewOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImagePreview(null)}
            >
              <motion.section
                className="adminProductModal adminImagePreviewModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="image-preview-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Görsel Önizleme</p>
                    <h2 id="image-preview-title">{imagePreview.title}</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={() => setImagePreview(null)}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="adminImagePreviewBody">
                  <img src={imagePreview.url} alt={imagePreview.title} />
                </div>
              </motion.section>
            </motion.div>
          )}

          {isAssetManagerOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssetManagerOpen(false)}
            >
              <motion.section
                className="adminProductModal adminAssetManagerModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="asset-manager-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>R2 Görselleri</p>
                    <h2 id="asset-manager-title">Görsel Yönetimi</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={() => setIsAssetManagerOpen(false)}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="adminAssetManagerBody">
                  {isLoadingAssets ? (
                    <p>Görseller yükleniyor...</p>
                  ) : assets.length === 0 ? (
                    <p>R2 üzerinde kayıtlı görsel bulunamadı.</p>
                  ) : (
                    <div className="adminAssetGrid">
                      {assets.map((asset) => (
                        <article className="adminAssetCard" key={asset.key}>
                          <button
                            className="adminAssetPreview"
                            type="button"
                            aria-label={`${asset.key} görselini önizle`}
                            onClick={() => {
                              setIsAssetManagerOpen(false);
                              setImagePreview({ title: asset.key, url: asset.url });
                            }}
                          >
                            <img src={asset.url} alt="" />
                          </button>
                          <strong>{asset.key}</strong>
                          <span>{Math.round(asset.size / 1024)} KB</span>
                          <button type="button" onClick={() => deleteAsset(asset)}>
                            Sil
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
                <div className="adminFormActions">
                  <button type="button" onClick={showAllAssets} disabled={isLoadingAssets}>
                    Yenile
                  </button>
                  <button type="button" onClick={() => setIsAssetManagerOpen(false)}>
                    Kapat
                  </button>
                </div>
              </motion.section>
            </motion.div>
          )}

          {isSettingsModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSettingsModal}
            >
              <motion.section
                className="adminProductModal adminSettingsModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Ayarlar</p>
                    <h2 id="settings-modal-title">
                      {activeSettingsTab === 'footer'
                        ? 'Footer'
                        : activeSettingsTab === 'contact'
                          ? 'İletişim Bilgileri'
                          : 'Pushover Bildirimleri'}
                    </h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeSettingsModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="adminSettingsBody">
                  <aside className="adminSettingsTabs">
                    <button
                      className={activeSettingsTab === 'footer' ? 'active' : ''}
                      type="button"
                      onClick={() => setActiveSettingsTab('footer')}
                    >
                      Footer
                    </button>
                    <button
                      className={activeSettingsTab === 'contact' ? 'active' : ''}
                      type="button"
                      onClick={() => setActiveSettingsTab('contact')}
                    >
                      İletişim
                    </button>
                    <button
                      className={activeSettingsTab === 'pushover' ? 'active' : ''}
                      type="button"
                      onClick={() => setActiveSettingsTab('pushover')}
                    >
                      Pushover
                    </button>
                  </aside>

                  {activeSettingsTab === 'footer' ? (
                    <form className="adminProductForm adminFooterForm" onSubmit={saveSocialLinks}>
                      {socialPlatforms.map((platform) => (
                        <label className="adminFormWide" key={platform.platform}>
                          {platform.label}
                          <input
                            value={socialLinkForm[platform.platform] ?? ''}
                            onChange={(event) => updateSocialLinkForm(platform.platform, event.target.value)}
                            placeholder={`https://${platform.platform}.com/...`}
                          />
                        </label>
                      ))}

                      <div className="adminFormActions">
                        <button type="button" onClick={closeSettingsModal}>
                          Vazgeç
                        </button>
                        <button type="submit" disabled={isSavingSocialLinks}>
                          {isSavingSocialLinks ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </form>
                  ) : activeSettingsTab === 'contact' ? (
                    <form className="adminProductForm adminFooterForm" onSubmit={saveContactSettings}>
                      {contactSettingFields.map((field) => (
                        <label
                          className={
                            field.key === 'address' ||
                            field.key === 'googleMapUrl' ||
                            field.key === 'appleMapUrl' ||
                            field.key === 'footerDescription'
                              ? 'adminFormWide'
                              : ''
                          }
                          key={field.key}
                        >
                          {field.label}
                          {field.key === 'address' || field.key === 'footerDescription' ? (
                            <textarea
                              rows={3}
                              value={contactSettingsForm[field.key]}
                              onChange={(event) => updateContactSettingsForm(field.key, event.target.value)}
                              placeholder={field.placeholder}
                            />
                          ) : (
                            <input
                              value={contactSettingsForm[field.key]}
                              onChange={(event) => updateContactSettingsForm(field.key, event.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                        </label>
                      ))}

                      <div className="adminFormActions">
                        <button type="button" onClick={closeSettingsModal}>
                          Vazgeç
                        </button>
                        <button type="submit" disabled={isSavingContactSettings}>
                          {isSavingContactSettings ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form className="adminProductForm adminFooterForm" onSubmit={savePushoverSettings}>
                      <label className="adminToggleRow adminFormWide">
                        <span>
                          Pushover bildirimleri aktif
                          <small>Teklif talebi ve servis kaydı oluşturulduğunda Pushover bildirimi gönderir.</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={pushoverSettingsForm.isActive}
                          onChange={(event) => updatePushoverSettingsForm('isActive', event.target.checked)}
                        />
                      </label>

                      <label className="adminFormWide">
                        User Key
                        <input
                          value={pushoverSettingsForm.userKey}
                          onChange={(event) => updatePushoverSettingsForm('userKey', event.target.value)}
                          placeholder="u5yr5d91r8ojvk2uwu3kps4q2q34e7"
                        />
                      </label>

                      <label className="adminFormWide">
                        API Token
                        <input
                          type="password"
                          value={pushoverSettingsForm.apiToken}
                          onChange={(event) => updatePushoverSettingsForm('apiToken', event.target.value)}
                          placeholder={pushoverSettings.hasApiToken ? 'Kayıtlı token korunur' : 'Pushover application API token'}
                        />
                        {pushoverSettings.hasApiToken && !pushoverSettingsForm.apiToken && <small>API token kayıtlı.</small>}
                      </label>

                      <label className="adminFormWide">
                        Yedek E-posta Gateway
                        <input
                          type="email"
                          value={pushoverSettingsForm.emailAddress}
                          onChange={(event) => updatePushoverSettingsForm('emailAddress', event.target.value)}
                          placeholder="g76fqg9ggn@pomail.net"
                        />
                        <small>API token eksikse veya API gönderimi başarısız olursa bu adrese e-posta gönderilir.</small>
                      </label>

                      <div className="adminFormActions">
                        <button type="button" onClick={closeSettingsModal}>
                          Vazgeç
                        </button>
                        <button type="button" onClick={sendPushoverTestNotification} disabled={isSendingPushoverTest}>
                          {isSendingPushoverTest ? 'Gönderiliyor...' : 'Deneme Bildirimi'}
                        </button>
                        <button type="submit" disabled={isSavingPushoverSettings}>
                          {isSavingPushoverSettings ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.section>
            </motion.div>
          )}

          {isUserModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeUserModal}
            >
              <motion.section
                className="adminProductModal adminUserModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="user-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Kullanıcı Yönetimi</p>
                    <h2 id="user-modal-title">
                      {editingUserId ? 'Kullanıcı Bilgilerini Düzenle' : 'Yeni Kullanıcı'}
                    </h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeUserModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm adminUserForm" onSubmit={saveAdminUser}>
                  <label>
                    Ad Soyad
                    <input
                      required
                      value={adminUserForm.displayName}
                      onChange={(event) => updateAdminUserForm('displayName', event.target.value)}
                      placeholder="HHS Admin"
                    />
                  </label>

                  <label>
                    Kullanıcı Adı
                    <input
                      required
                      value={adminUserForm.username}
                      onChange={(event) => updateAdminUserForm('username', event.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </label>

                  <label className="adminFormWide">
                    E-posta
                    <input
                      required
                      value={adminUserForm.email}
                      onChange={(event) => updateAdminUserForm('email', event.target.value)}
                      placeholder="admin@hhsotomatikkapi.com"
                      type="email"
                    />
                  </label>

                  <label className="adminFormWide">
                    Avatar
                    <div className="adminAvatarUpload">
                      <div className="adminAvatarPreview">
                        {adminUserForm.avatarUrl ? (
                          <img src={adminUserForm.avatarUrl} alt="Kullanıcı avatar önizlemesi" />
                        ) : (
                          <UserRound size={24} strokeWidth={2.2} />
                        )}
                      </div>
                      <AdminImageUploadControl
                        value={adminUserForm.avatarUrl}
                        onUrlChange={(value) => updateAdminUserForm('avatarUrl', value)}
                        inputRef={userAvatarInputRef}
                        onFileInputChange={uploadAdminUserAvatar}
                        onFileDrop={uploadAdminUserAvatarFile}
                        buttonLabel={isUploadingUserAvatar ? 'Yükleniyor...' : 'Yükle / Bırak'}
                        disabled={isUploadingUserAvatar}
                        placeholder="https://... veya sürükle bırak"
                      />
                    </div>
                  </label>

                  <fieldset className="adminModulePicker adminFormWide">
                    <legend>Girebileceği Modüller</legend>
                    {adminModuleOptions.map((moduleOption) => (
                      <label key={moduleOption.key}>
                        <input
                          checked={adminUserForm.modules.includes(moduleOption.key)}
                          onChange={() => toggleAdminUserModule(moduleOption.key)}
                          type="checkbox"
                        />
                        <span>
                          <strong>{moduleOption.label}</strong>
                          <small>{moduleOption.description}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  <label className="adminFormWide">
                    {editingUserId ? 'Yeni Şifre' : 'Şifre'}
                    <input
                      required={!editingUserId}
                      minLength={8}
                      value={adminUserForm.password}
                      onChange={(event) => updateAdminUserForm('password', event.target.value)}
                      placeholder={editingUserId ? 'Boş bırakırsanız değişmez' : 'En az 8 karakter'}
                      type="password"
                      autoComplete="new-password"
                    />
                  </label>

                  <div className="adminFormActions">
                    <label className="adminStatusSwitch">
                      <input
                        checked={adminUserForm.isActive}
                        disabled={editingUserId === adminUser?.id}
                        onChange={(event) => updateAdminUserForm('isActive', event.target.checked)}
                        role="switch"
                        type="checkbox"
                      />
                      <span aria-hidden="true" />
                      <strong>{adminUserForm.isActive ? 'Aktif' : 'Pasif'}</strong>
                    </label>
                    {editingUserId && editingUserId !== adminUser?.id && (
                      <button
                        className={`dangerButton${isConfirmingUserDisable ? ' confirmDelete' : ''}`}
                        type="button"
                        onClick={disableAdminUser}
                      >
                        {isConfirmingUserDisable ? 'Pasifleştirmeyi onayla' : 'Pasifleştir'}
                      </button>
                    )}
                    <button type="button" onClick={closeUserModal}>
                      Vazgeç
                    </button>
                    <button type="submit" disabled={isSavingUser}>
                      {isSavingUser ? 'Kaydediliyor...' : editingUserId ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {isQuoteQuestionModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQuoteQuestionModal}
            >
              <motion.section
                className="adminProductModal adminQuoteQuestionModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-question-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Teklif Soruları</p>
                    <h2 id="quote-question-modal-title">
                      {editingQuoteQuestionId ? 'Soruyu Düzenle' : 'Yeni Soru'}
                    </h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeQuoteQuestionModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm" onSubmit={saveQuoteQuestion}>
                  <label>
                    Kategori
                    <select
                      required
                      value={quoteQuestionFormCategoryKey}
                      disabled={Boolean(editingQuoteQuestionId)}
                      onChange={(event) => updateQuoteQuestionFormCategory(event.target.value)}
                    >
                      <option value="" disabled>
                        Kategori seçin
                      </option>
                      {adminCategories.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Ürün
                    <select
                      required
                      value={quoteQuestionFormProductKey}
                      disabled={
                        Boolean(editingQuoteQuestionId) ||
                        !quoteQuestionFormCategoryKey ||
                        quoteQuestionFormProducts.length === 0
                      }
                      onChange={(event) => setQuoteQuestionFormProductKey(event.target.value)}
                    >
                      <option value="" disabled>
                        Ürün seçin
                      </option>
                      {quoteQuestionFormProducts.map((product) => (
                        <option key={product.key} value={product.key}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  {quoteQuestionFormCategoryKey && quoteQuestionFormProducts.length === 0 && (
                    <p className="adminFormHint adminFormWide">Bu kategoriye bağlı ürün bulunamadı.</p>
                  )}

                  <label className="adminFormWide">
                    Soru
                    <input
                      required
                      value={quoteQuestionForm.question}
                      onChange={(event) => updateQuoteQuestionForm('question', event.target.value)}
                      placeholder="Örn: Ölçü bilgisi nedir?"
                    />
                  </label>

                  <label className="adminFormWide">
                    Açıklama
                    <input
                      value={quoteQuestionForm.description}
                      onChange={(event) => updateQuoteQuestionForm('description', event.target.value)}
                      placeholder="Kullanıcıya gösterilecek kısa açıklama"
                    />
                  </label>

                  <label className="adminFormWide">
                    Soru görseli
                    <div className="adminQuoteQuestionImageControl">
                      {quoteQuestionForm.imageUrl && (
                        <img className="adminQuoteQuestionImagePreview" src={quoteQuestionForm.imageUrl} alt="Soru görseli önizlemesi" />
                      )}
                      <AdminImageUploadControl
                        value={quoteQuestionForm.imageUrl}
                        onUrlChange={(value) => updateQuoteQuestionForm('imageUrl', value)}
                        inputRef={quoteQuestionImageInputRef}
                        onFileInputChange={uploadQuoteQuestionImage}
                        onFileDrop={uploadQuoteQuestionImageFile}
                        buttonLabel={isUploadingQuoteQuestionImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                        disabled={isUploadingQuoteQuestionImage}
                        placeholder="https://... veya sürükle bırak"
                      />
                    </div>
                  </label>

                  <label>
                    Cevap tipi
                    <select
                      value={quoteQuestionForm.answerType}
                      onChange={(event) =>
                        updateQuoteQuestionForm(
                          'answerType',
                          event.target.value as QuoteQuestionFormState['answerType'],
                        )
                      }
                    >
                      <option value="text">Metin</option>
                      <option value="single">Tek seçim</option>
                      <option value="multiple">Çoklu seçim</option>
                      <option value="number">Sayı</option>
                    </select>
                  </label>

                  <label className="adminToggleRow">
                    <span>Zorunlu</span>
                    <input
                      type="checkbox"
                      checked={quoteQuestionForm.isRequired}
                      onChange={(event) => updateQuoteQuestionForm('isRequired', event.target.checked)}
                    />
                  </label>

                  {quoteQuestionForm.answerType === 'text' && (
                    <label>
                      Maksimum karakter
                      <input
                        min={1}
                        step={1}
                        type="number"
                        value={quoteQuestionForm.maxLength}
                        onChange={(event) => updateQuoteQuestionForm('maxLength', event.target.value)}
                        placeholder="Boş bırakılırsa limitsiz"
                      />
                    </label>
                  )}

                  {quoteQuestionForm.answerType === 'number' && (
                    <label>
                      Küsürat basamağı
                      <input
                        min={0}
                        max={6}
                        step={1}
                        type="number"
                        value={quoteQuestionForm.decimalPlaces}
                        onChange={(event) => updateQuoteQuestionForm('decimalPlaces', event.target.value)}
                        placeholder="0"
                      />
                    </label>
                  )}

                  {(quoteQuestionForm.answerType === 'single' || quoteQuestionForm.answerType === 'multiple') && (
                    <label className="adminFormWide">
                      Seçenekler
                      <textarea
                        rows={3}
                        value={quoteQuestionForm.options}
                        onChange={(event) => updateQuoteQuestionForm('options', event.target.value)}
                        placeholder="Her satıra veya virgülle bir seçenek"
                      />
                    </label>
                  )}

                  <label className="adminFormWide">
                    Varsayılan değer
                    <input
                      value={quoteQuestionForm.defaultValue}
                      onChange={(event) => updateQuoteQuestionForm('defaultValue', event.target.value)}
                      placeholder={
                        quoteQuestionForm.answerType === 'multiple'
                          ? 'Seçenekleri virgül veya satırla yazın'
                          : 'Varsayılan cevap'
                      }
                    />
                  </label>

                  <div className="adminFormActions">
                    <label className="adminStatusSwitch">
                      <input
                        checked={quoteQuestionForm.isActive}
                        onChange={(event) => updateQuoteQuestionForm('isActive', event.target.checked)}
                        role="switch"
                        type="checkbox"
                      />
                      <span aria-hidden="true" />
                      <strong>{quoteQuestionForm.isActive ? 'Aktif' : 'Pasif'}</strong>
                    </label>
                    <button type="button" onClick={closeQuoteQuestionModal}>
                      Vazgeç
                    </button>
                    <button type="submit" disabled={isSavingQuoteQuestions}>
                      {isSavingQuoteQuestions ? 'Kaydediliyor...' : editingQuoteQuestionId ? 'Güncelle' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {isCategoryModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCategoryModal}
            >
              <motion.section
                className="adminProductModal adminCategoryModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Kategori Yönetimi</p>
                    <h2 id="category-modal-title">
                      {editingCategoryKey ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                    </h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeCategoryModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <div className="adminCategoryManager">
                  <div className="adminCategoryList">
                    <button
                      className={!editingCategoryKey ? 'active' : ''}
                      type="button"
                      onClick={() => {
                        setEditingCategoryKey(null);
                        setCategoryForm(emptyCategoryForm);
                        setIsConfirmingCategoryDelete(false);
                      }}
                    >
                      Yeni kategori ekle
                    </button>
                    {adminCategories.map((category) => (
                      <button
                        className={editingCategoryKey === category.key ? 'active' : ''}
                        key={category.key}
                        type="button"
                        onClick={() => selectCategoryForEdit(category)}
                      >
                        <strong>{category.title}</strong>
                        <span>
                          Sıra: {category.sortOrder} / {category.slug}
                        </span>
                      </button>
                    ))}
                  </div>

                  <form className="adminProductForm adminCategoryForm" onSubmit={saveCategory}>
                    <label>
                      Kategori Anahtarı
                      <input
                        required
                        disabled={Boolean(editingCategoryKey)}
                        value={categoryForm.key}
                        onChange={(event) => updateCategoryForm('key', event.target.value)}
                        placeholder="kategoriAnahtari"
                      />
                    </label>

                    <label>
                      Kategori Adı
                      <input
                        required
                        value={categoryForm.title}
                        onChange={(event) => updateCategoryTitle(event.target.value)}
                        placeholder="Kategori adı"
                      />
                    </label>

                    <label className="adminFormWide">
                      Slug
                      <input
                        required
                        value={categoryForm.slug}
                        onChange={(event) => updateCategoryForm('slug', event.target.value)}
                        placeholder="kategori-slug"
                      />
                    </label>

                    <label>
                      Sıra
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={categoryForm.sortOrder}
                        onChange={(event) => updateCategoryForm('sortOrder', event.target.value)}
                        placeholder="0"
                      />
                    </label>

                    <label className="adminFormWide">
                      Açıklama
                      <textarea
                        value={categoryForm.description}
                        onChange={(event) => updateCategoryForm('description', event.target.value)}
                        placeholder="Kısa kategori açıklaması"
                      />
                    </label>

                    <label>
                      SEO Başlık
                      <input
                        value={categoryForm.metaTitle}
                        onChange={(event) => updateCategoryForm('metaTitle', event.target.value)}
                        placeholder="Arama motoru başlığı"
                      />
                    </label>

                    <label>
                      Anahtar Kelimeler
                      <input
                        value={categoryForm.metaKeywords}
                        onChange={(event) => updateCategoryForm('metaKeywords', event.target.value)}
                        placeholder="kelime, kelime grubu"
                      />
                    </label>

                    <label className="adminFormWide">
                      SEO Açıklama
                      <textarea
                        value={categoryForm.metaDescription}
                        onChange={(event) => updateCategoryForm('metaDescription', event.target.value)}
                        placeholder="Arama sonucu açıklama metni"
                      />
                    </label>

                    <label className="adminFormWide">
                      Kategori Görseli
                      <AdminImageUploadControl
                        value={categoryForm.image}
                        onUrlChange={(value) => updateCategoryForm('image', value)}
                        inputRef={categoryImageInputRef}
                        onFileInputChange={uploadCategoryImage}
                        onFileDrop={uploadCategoryImageFile}
                        buttonLabel={isUploadingCategoryImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                        disabled={isUploadingCategoryImage}
                        placeholder="https://... veya sürükle bırak"
                      />
                      <div className="adminImageVariants">
                        {[
                          { key: 'square', label: 'Kare', url: categoryForm.imageSquare },
                          { key: 'horizontal', label: 'Yatay', url: categoryForm.imageHorizontal },
                          { key: 'vertical', label: 'Dikey', url: categoryForm.imageVertical },
                        ].map((variant) => (
                          <button
                            type="button"
                            className={`adminImageVariant ${variant.key}`}
                            key={variant.key}
                            disabled={!variant.url}
                            onClick={() =>
                              variant.url && setImagePreview({ title: `Kategori ${variant.label}`, url: variant.url })
                            }
                          >
                            {variant.url ? <img src={variant.url} alt="" /> : <span>{variant.label}</span>}
                            <strong>{variant.label}</strong>
                          </button>
                        ))}
                      </div>
                    </label>

                    <div className="adminFormActions">
                      {editingCategoryKey && (
                        <button
                          className={`dangerButton${isConfirmingCategoryDelete ? ' confirmDelete' : ''}`}
                          type="button"
                          onClick={deleteCategory}
                        >
                          {isConfirmingCategoryDelete ? 'Silme işlemini onayla' : 'Sil'}
                        </button>
                      )}
                      <button type="button" onClick={closeCategoryModal}>
                        Kapat
                      </button>
                      <button type="submit">{editingCategoryKey ? 'Güncelle' : 'Kaydet'}</button>
                    </div>
                  </form>
                </div>
              </motion.section>
            </motion.div>
          )}

          {isSiteServiceModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSiteServiceModal}
            >
              <motion.section
                className="adminProductModal adminReferenceModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="site-service-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Hizmet Alanı Yönetimi</p>
                    <h2 id="site-service-modal-title">{editingSiteServiceKey ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeSiteServiceModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm adminReferenceForm" onSubmit={saveSiteService}>
                  <label>
                    Kayıt Anahtarı
                    <input
                      required
                      disabled={Boolean(editingSiteServiceKey)}
                      value={siteServiceForm.key}
                      onChange={(event) => updateSiteServiceForm('key', event.target.value)}
                      placeholder="hizmetAnahtari"
                    />
                  </label>
                  <label>
                    Sıra
                    <input
                      min="0"
                      step="1"
                      type="number"
                      value={siteServiceForm.sortOrder}
                      onChange={(event) => updateSiteServiceForm('sortOrder', event.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="adminFormWide">
                    Başlık
                    <input
                      required
                      value={siteServiceForm.title}
                      onChange={(event) => updateSiteServiceTitle(event.target.value)}
                      placeholder="Hizmet başlığı"
                    />
                  </label>
                  <label className="adminFormWide">
                    Özet
                    <textarea
                      required
                      rows={3}
                      value={siteServiceForm.summary}
                      onChange={(event) => updateSiteServiceForm('summary', event.target.value)}
                      placeholder="Ana sayfa kartında görünecek kısa özet"
                    />
                  </label>
                  <label className="adminFormWide">
                    Detaylı Metin
                    <textarea
                      required
                      rows={6}
                      value={siteServiceForm.detail}
                      onChange={(event) => updateSiteServiceForm('detail', event.target.value)}
                      placeholder="Modal içinde gösterilecek detaylı metin"
                    />
                  </label>
                  <label className="adminFormWide">
                    Görsel
                    <AdminImageUploadControl
                      value={siteServiceForm.imageUrl}
                      onUrlChange={(value) => updateSiteServiceForm('imageUrl', value)}
                      inputRef={siteServiceImageInputRef}
                      onFileInputChange={uploadSiteServiceImage}
                      onFileDrop={uploadSiteServiceImageFile}
                      buttonLabel={isUploadingSiteServiceImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                      disabled={isUploadingSiteServiceImage}
                      placeholder="https://... veya sürükle bırak"
                    />
                    {siteServiceForm.imageUrl && (
                      <button
                        className="adminReferencePreviewButton"
                        type="button"
                        onClick={() =>
                          setImagePreview({ title: siteServiceForm.title || 'Hizmet görseli', url: siteServiceForm.imageUrl })
                        }
                      >
                        <img src={siteServiceForm.imageUrl} alt="" />
                        <span>Önizle</span>
                      </button>
                    )}
                  </label>

                  <div className="adminFormActions">
                    <label className="adminStatusSwitch">
                      <input
                        checked={siteServiceForm.isActive}
                        type="checkbox"
                        onChange={(event) => updateSiteServiceForm('isActive', event.target.checked)}
                      />
                      <span />
                      <strong>{siteServiceForm.isActive ? 'Yayında' : 'Pasif'}</strong>
                    </label>
                    {editingSiteServiceKey && (
                      <button className="dangerButton" type="button" onClick={deleteSiteService}>
                        Sil
                      </button>
                    )}
                    <button type="button" onClick={closeSiteServiceModal}>Vazgeç</button>
                    <button type="submit">{editingSiteServiceKey ? 'Güncelle' : 'Kaydet'}</button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {isReferenceModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeReferenceModal}
            >
              <motion.section
                className="adminProductModal adminReferenceModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reference-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Referans Yönetimi</p>
                    <h2 id="reference-modal-title">{editingReferenceKey ? 'Referansı Düzenle' : 'Yeni Referans'}</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeReferenceModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm adminReferenceForm" onSubmit={saveReference}>
                  <label>
                    Kayıt Anahtarı
                    <input
                      required
                      disabled={Boolean(editingReferenceKey)}
                      value={referenceForm.key}
                      onChange={(event) => updateReferenceForm('key', event.target.value)}
                      placeholder="referansAnahtari"
                    />
                  </label>
                  <label>
                    Sıra
                    <input
                      min="0"
                      step="1"
                      type="number"
                      value={referenceForm.sortOrder}
                      onChange={(event) => updateReferenceForm('sortOrder', event.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="adminFormWide">
                    Başlık
                    <input
                      required
                      value={referenceForm.title}
                      onChange={(event) => updateReferenceTitle(event.target.value)}
                      placeholder="Referans adı"
                    />
                  </label>
                  <label className="adminFormWide">
                    Detay Bilgi
                    <textarea
                      rows={4}
                      value={referenceForm.description}
                      onChange={(event) => updateReferenceForm('description', event.target.value)}
                      placeholder="Hover popover içinde görünecek kısa metin"
                    />
                  </label>
                  <label className="adminFormWide">
                    Logo / Görsel
                    <AdminImageUploadControl
                      required
                      value={referenceForm.imageUrl}
                      onUrlChange={(value) => updateReferenceForm('imageUrl', value)}
                      inputRef={referenceImageInputRef}
                      onFileInputChange={uploadReferenceImage}
                      onFileDrop={uploadReferenceImageFile}
                      buttonLabel={isUploadingReferenceImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                      disabled={isUploadingReferenceImage}
                      placeholder="https://... veya sürükle bırak"
                    />
                    {referenceForm.imageUrl && (
                      <button
                        className="adminReferencePreviewButton"
                        type="button"
                        onClick={() => setImagePreview({ title: referenceForm.title || 'Referans görseli', url: referenceForm.imageUrl })}
                      >
                        <img src={referenceForm.imageUrl} alt="" />
                        <span>Önizle</span>
                      </button>
                    )}
                  </label>

                  <div className="adminFormActions">
                    <label className="adminStatusSwitch">
                      <input
                        checked={referenceForm.isActive}
                        type="checkbox"
                        onChange={(event) => updateReferenceForm('isActive', event.target.checked)}
                      />
                      <span />
                      <strong>{referenceForm.isActive ? 'Yayında' : 'Pasif'}</strong>
                    </label>
                    {editingReferenceKey && (
                      <button className="dangerButton" type="button" onClick={deleteReference}>
                        Sil
                      </button>
                    )}
                    <button type="button" onClick={closeReferenceModal}>Vazgeç</button>
                    <button type="submit">{editingReferenceKey ? 'Güncelle' : 'Kaydet'}</button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {isBlogModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeBlogModal}
            >
              <motion.section
                className="adminProductModal adminBlogModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="blog-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Blog Yönetimi</p>
                    <h2 id="blog-modal-title">{editingBlogKey ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}</h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeBlogModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm adminBlogForm" onSubmit={saveBlogPost}>
                  <label>
                    Kayıt Anahtarı
                    <input required disabled={Boolean(editingBlogKey)} value={blogPostForm.key} onChange={(event) => updateBlogPostForm('key', event.target.value)} />
                  </label>
                  <label>
                    Blog Başlığı
                    <input required value={blogPostForm.title} onChange={(event) => updateBlogTitle(event.target.value)} />
                  </label>
                  <label>
                    Slug
                    <input required value={blogPostForm.slug} onChange={(event) => updateBlogPostForm('slug', event.target.value)} />
                  </label>
                  <label>
                    Hedef Kelime
                    <input required value={blogPostForm.targetKeyword} onChange={(event) => updateBlogPostForm('targetKeyword', event.target.value)} />
                  </label>
                  <label>
                    Yayın Tarihi
                    <input value={blogPostForm.publishedAt} onChange={(event) => updateBlogPostForm('publishedAt', event.target.value)} placeholder="2026-05-02" />
                  </label>
                  <label className="adminFormWide">
                    Blog Açıklaması / Özet
                    <textarea required value={blogPostForm.summary} onChange={(event) => updateBlogPostForm('summary', event.target.value)} />
                  </label>
                  <label className="adminFormWide">
                    Asıl Metin
                    <textarea required className="adminLargeTextarea" value={blogPostForm.content} onChange={(event) => updateBlogPostForm('content', event.target.value)} />
                  </label>
                  <label>
                    Meta Title
                    <input required value={blogPostForm.metaTitle} onChange={(event) => updateBlogPostForm('metaTitle', event.target.value)} />
                  </label>
                  <label>
                    Meta Keywords
                    <input required value={blogPostForm.metaKeywords} onChange={(event) => updateBlogPostForm('metaKeywords', event.target.value)} />
                  </label>
                  <label className="adminFormWide">
                    Meta Description
                    <textarea required value={blogPostForm.metaDescription} onChange={(event) => updateBlogPostForm('metaDescription', event.target.value)} />
                  </label>
                  <label className="adminFormWide">
                    Görsel URL
                    <AdminImageUploadControl
                      value={blogPostForm.image}
                      onUrlChange={(value) => updateBlogPostForm('image', value)}
                      inputRef={blogImageInputRef}
                      onFileInputChange={uploadBlogImage}
                      onFileDrop={uploadBlogImageFile}
                      buttonLabel={isUploadingBlogImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                      disabled={isUploadingBlogImage}
                      placeholder="https://... veya sürükle bırak"
                    />
                  </label>
                  <label>
                    Görsel Alt Metni
                    <input value={blogPostForm.imageAlt} onChange={(event) => updateBlogPostForm('imageAlt', event.target.value)} />
                  </label>
                  <label>
                    Eski WordPress URL
                    <input value={blogPostForm.oldUrl} onChange={(event) => updateBlogPostForm('oldUrl', event.target.value)} placeholder="https://eski-site.com/yazi/" />
                  </label>
                  <fieldset className="adminFormWide adminModulePicker">
                    <legend>Kategoriler</legend>
                    {blogCategories.map((category) => (
                      <label key={category.key}>
                        <input checked={blogPostForm.categories.includes(category.key)} type="checkbox" onChange={() => toggleBlogCategory(category.key)} />
                        <span>{category.title}</span>
                      </label>
                    ))}
                  </fieldset>
                  <label className="adminFormWide">
                    Etiketler
                    <input value={blogPostForm.tags} onChange={(event) => updateBlogPostForm('tags', event.target.value)} placeholder="otomatik kapı, bariyer, motor" />
                    {blogTags.length > 0 && (
                      <small>Mevcut etiketler: {blogTags.slice(0, 8).map((tag) => tag.title).join(', ')}</small>
                    )}
                  </label>
                  <div className="adminSeoPanel adminFormWide">
                    <strong className={`adminSeoScore ${blogSeo.score >= 85 ? 'good' : blogSeo.score >= 60 ? 'medium' : 'bad'}`}>SEO %{blogSeo.score}</strong>
                    {blogSeo.checks.map((check) => (
                      <span className={check.passed ? 'passed' : 'failed'} key={check.label}>
                        {check.passed ? '✓' : '×'} {check.label}
                      </span>
                    ))}
                  </div>
                  <div className="adminFormActions">
                    <label className="adminStatusSwitch">
                      <input
                        checked={blogPostForm.status === 'published'}
                        type="checkbox"
                        onChange={(event) =>
                          updateBlogPostForm('status', event.target.checked ? 'published' : 'draft')
                        }
                      />
                      <span />
                      <strong>{blogPostForm.status === 'published' ? 'Yayında' : 'Taslak'}</strong>
                    </label>
                    {editingBlogKey && (
                      <button className="dangerButton" type="button" onClick={deleteBlogPost}>
                        Sil
                      </button>
                    )}
                    <span className={`adminSeoFooterScore ${blogSeo.score >= 85 ? 'good' : blogSeo.score >= 60 ? 'medium' : 'bad'}`}>
                      SEO %{blogSeo.score}
                    </span>
                    <button type="button" onClick={closeBlogModal}>Vazgeç</button>
                    <button type="submit">{editingBlogKey ? 'Güncelle' : 'Kaydet'}</button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}

          {isProductModalOpen && (
            <motion.div
              className="adminModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProductModal}
            >
              <motion.section
                className="adminProductModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(modalEvent) => modalEvent.stopPropagation()}
              >
                <div className="adminModalHeader">
                  <div>
                    <p>Ürün Kaydı</p>
                    <h2 id="product-modal-title">
                      {editingProductKey ? 'Ürünü Düzenle' : 'Yeni Ürün'}
                    </h2>
                  </div>
                  <button type="button" aria-label="Modalı kapat" onClick={closeProductModal}>
                    <X size={20} strokeWidth={2.2} />
                  </button>
                </div>

                <form className="adminProductForm" onSubmit={saveProduct}>
                  <label>
                    Kayıt Anahtarı
                    <input
                      required
                      disabled={Boolean(editingProductKey)}
                      value={productForm.key}
                      onChange={(event) => updateProductForm('key', event.target.value)}
                      placeholder="ornekUrun"
                    />
                  </label>

                  <label>
                    Kategori
                    <select
                      required
                      value={productForm.categoryKey}
                      onChange={(event) => updateProductForm('categoryKey', event.target.value)}
                    >
                      <option value="" disabled>
                        Seçiniz
                      </option>
                      {adminCategories.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Ürün Adı
                    <input
                      required
                      value={productForm.title}
                      onChange={(event) => updateProductTitle(event.target.value)}
                      placeholder="Ürün adı"
                    />
                  </label>

                  <label>
                    Slug
                    <input
                      required
                      value={productForm.slug}
                      onChange={(event) => updateProductForm('slug', event.target.value)}
                      placeholder="urun-slug"
                    />
                  </label>

                  <label>
                    Sıra
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.sortOrder}
                      onChange={(event) => updateProductForm('sortOrder', event.target.value)}
                      placeholder="0"
                    />
                  </label>

                  <label className="adminFormWide">
                    Açıklama
                    <textarea
                      value={productForm.description}
                      onChange={(event) => updateProductForm('description', event.target.value)}
                      placeholder="Kısa ürün açıklaması"
                    />
                  </label>

                  <label>
                    SEO Başlık
                    <input
                      value={productForm.metaTitle}
                      onChange={(event) => updateProductForm('metaTitle', event.target.value)}
                      placeholder="Arama motoru başlığı"
                    />
                  </label>

                  <label>
                    Anahtar Kelimeler
                    <input
                      value={productForm.metaKeywords}
                      onChange={(event) => updateProductForm('metaKeywords', event.target.value)}
                      placeholder="kelime, kelime grubu"
                    />
                  </label>

                  <label className="adminFormWide">
                    SEO Açıklama
                    <textarea
                      value={productForm.metaDescription}
                      onChange={(event) => updateProductForm('metaDescription', event.target.value)}
                      placeholder="Arama sonucu açıklama metni"
                    />
                  </label>

                  <label className="adminFormWide">
                    Görsel URL
                    <AdminImageUploadControl
                      value={productForm.image}
                      onUrlChange={(value) => updateProductForm('image', value)}
                      inputRef={productImageInputRef}
                      onFileInputChange={uploadProductImage}
                      onFileDrop={uploadProductImageFile}
                      buttonLabel={isUploadingProductImage ? 'Yükleniyor...' : 'Yükle / Bırak'}
                      disabled={isUploadingProductImage}
                      placeholder="https://... veya sürükle bırak"
                    />
                    <div className="adminImageVariants">
                      {[
                        { key: 'square', label: 'Kare', url: productForm.imageSquare },
                        { key: 'horizontal', label: 'Yatay', url: productForm.imageHorizontal },
                        { key: 'vertical', label: 'Dikey', url: productForm.imageVertical },
                      ].map((variant) => (
                        <button
                          type="button"
                          className={`adminImageVariant ${variant.key}`}
                          key={variant.key}
                          disabled={!variant.url}
                          onClick={() =>
                            variant.url && setImagePreview({ title: `Ürün ${variant.label}`, url: variant.url })
                          }
                        >
                          {variant.url ? <img src={variant.url} alt="" /> : <span>{variant.label}</span>}
                          <strong>{variant.label}</strong>
                        </button>
                      ))}
                    </div>
                  </label>

                  <label>
                    Görsel Alt Metni
                    <input
                      value={productForm.alt}
                      onChange={(event) => updateProductForm('alt', event.target.value)}
                      placeholder="Görsel açıklaması"
                    />
                  </label>

                  <label>
                    Badge'ler
                    <input
                      value={productForm.badges}
                      onChange={(event) => updateProductForm('badges', event.target.value)}
                      placeholder="Konut, Garaj, Motorlu Sistem"
                    />
                  </label>

                  <div className="adminFormActions">
                    {editingProductKey && (
                      <button
                        className={`dangerButton${isConfirmingProductDelete ? ' confirmDelete' : ''}`}
                        type="button"
                        onClick={deleteProduct}
                      >
                        {isConfirmingProductDelete ? 'Silme işlemini onayla' : 'Sil'}
                      </button>
                    )}
                    <button type="button" onClick={closeProductModal}>
                      Vazgeç
                    </button>
                    <button type="submit">{editingProductKey ? 'Güncelle' : 'Kaydet'}</button>
                  </div>
                </form>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  if (blogSlug) {
    return (
      <main className="page blogDetailPage">
        <article className="blogDetail">
          <a className="blogBackLink" href="/blog">Tüm blog yazıları</a>
          {selectedBlogPost ? (
            <>
              {selectedBlogPost.image && <img src={selectedBlogPost.image} alt={selectedBlogPost.imageAlt || selectedBlogPost.title} />}
              <p className="eyebrow">{selectedBlogPost.categories[0]?.title ?? 'Blog'}</p>
              <h1>{selectedBlogPost.title}</h1>
              <p className="blogDetailSummary">{selectedBlogPost.summary}</p>
              <div className="blogDetailMeta">
                {selectedBlogPost.publishedAt && <span>{selectedBlogPost.publishedAt}</span>}
              </div>
              <div className="blogDetailContent" dangerouslySetInnerHTML={{ __html: selectedBlogPost.content }} />
            </>
          ) : (
            <>
              <p className="eyebrow">Blog</p>
              <h1>Yazı bulunamadı</h1>
              <p>Aradığınız blog yazısı yayında olmayabilir veya kaldırılmış olabilir.</p>
            </>
          )}
        </article>
      </main>
    );
  }

  if (isBlogIndexPage) {
    return (
      <main className="page blogIndexPage">
        <header className="siteHeader">
          <motion.a
            className="logoLink"
            href="/"
            aria-label="HHS Otomatik Kapı ana sayfa"
            initial={{
              opacity: 0,
              width: 8,
              height: 8,
              borderRadius: 999,
              y: -8,
            }}
            animate={{
              opacity: 1,
              width: [8, 52, 92],
              height: [8, 52, 52],
              borderRadius: [999, 999, 6],
              y: 0,
            }}
            transition={{
              duration: 0.9,
              ease: 'easeInOut',
              times: [0, 0.48, 1],
            }}
          >
            <motion.img
              src="/apple-touch-icon.png"
              alt="HHS Otomatik Kapı"
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.58, ease: 'easeOut' }}
            />
          </motion.a>

          <div className="headerCenter">
            <motion.a
              className="headerQuoteButton"
              href="/#iletisim"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 0.95, ease: 'easeOut' }}
            >
              Teklif Al
            </motion.a>
          </div>

          <nav className="headerActions" aria-label="Üst menü">
            <motion.button
              className="iconButton"
              type="button"
              aria-label="Ara"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 0.95, ease: 'easeOut' }}
            >
              <Search size={22} strokeWidth={2.2} />
            </motion.button>

            <motion.div
              className="languageButton"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.08, ease: 'easeOut' }}
            >
              <select
                aria-label="Dil seçimi"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} strokeWidth={2.3} />
            </motion.div>

            <motion.button
              className="iconButton"
              type="button"
              aria-label="Menüyü aç"
              onClick={() => setIsHeaderMenuOpen((isOpen) => !isOpen)}
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.21, ease: 'easeOut' }}
            >
              <Menu size={28} strokeWidth={2.2} />
            </motion.button>
          </nav>

          <AnimatePresence>
            {isHeaderMenuOpen && (
              <motion.nav
                className="headerMenuPanel"
                aria-label="Ana menü"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <a href="/" onClick={() => setIsHeaderMenuOpen(false)}>Ana Sayfa</a>
                <a href="/#hizmetler" onClick={() => setIsHeaderMenuOpen(false)}>Hizmetler</a>
                <a href="/blog" onClick={() => setIsHeaderMenuOpen(false)}>Blog</a>
                <a href="/#iletisim" onClick={() => setIsHeaderMenuOpen(false)}>İletişim</a>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <section className="blogIndexHero">
          <a className="blogBackLink" href="/">Ana sayfaya dön</a>
          <h1>Güncel Yazılar</h1>
          <p>Otomatik kapı, bariyer, garaj kapısı ve geçiş sistemleri hakkında güncel rehberler ve haberler.</p>
        </section>

        {publishedBlogPosts.length === 0 ? (
          <section className="blogIndexEmpty">
            <h2>Henüz yayında blog yazısı yok.</h2>
            <p>Blog yazıları aktarıldığında bu sayfada listelenecek.</p>
          </section>
        ) : (
          <>
            <section className="latestBlogGrid blogIndexGrid" aria-label="Blog yazıları">
              {publishedBlogPosts.map((post) => (
                <a className="latestBlogCard" href={`/blog/${post.slug}`} key={post.key}>
                  {post.image && <img src={post.image} alt={post.imageAlt || post.title} />}
                  <div>
                    <span>{post.categories[0]?.title ?? 'Blog'}</span>
                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>
                  </div>
                </a>
              ))}
            </section>

            <nav className="blogPagination" aria-label="Blog sayfalama">
              <button
                type="button"
                disabled={currentBlogPage === 1 || isLoadingMoreBlogPosts}
                onClick={() => loadBlogPage(currentBlogPage - 1)}
              >
                Önceki
              </button>
              <span>Sayfa {currentBlogPage}</span>
              <button
                type="button"
                disabled={!hasMoreBlogPosts || isLoadingMoreBlogPosts}
                onClick={() => loadBlogPage(currentBlogPage + 1)}
              >
                {isLoadingMoreBlogPosts ? 'Yükleniyor...' : 'Sonraki'}
              </button>
            </nav>
          </>
        )}

        <footer className="siteFooter">
          <div className="footerBrand">
            <a className="footerLogo" href="/" aria-label="HHS Otomatik Kapı ana sayfa">
              <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
            </a>
            <p>{contactSettings.footerDescription}</p>
          </div>

          <div className="footerColumn">
            <h2>İletişim</h2>
            <a className="footerContactLink" href={phonePrimaryHref}>
              <span>
                <Phone size={15} strokeWidth={2.4} />
              </span>
              {contactSettings.phonePrimary}
            </a>
            {contactSettings.phoneSecondary && (
              <a className="footerContactLink" href={phoneSecondaryHref}>
                <span>
                  <Phone size={15} strokeWidth={2.4} />
                </span>
                {contactSettings.phoneSecondary}
              </a>
            )}
            <a className="footerContactLink" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <span>
                <img src="https://cdn.simpleicons.org/whatsapp/25d366" alt="" />
              </span>
              {contactSettings.whatsapp}
            </a>
            <a className="footerContactLink" href={emailHref}>
              <span>
                <Mail size={15} strokeWidth={2.4} />
              </span>
              {contactSettings.email}
            </a>
          </div>

          <div className="footerColumn">
            <h2>Sayfalar</h2>
            <a href="/">Ana Sayfa</a>
            <a href="/#hizmetler">Hizmetler</a>
            <a href="/#referanslar">Referanslar</a>
            <a href="/#iletisim">İletişim</a>
          </div>

          <div className="footerColumn">
            <h2>Sosyal Medya</h2>
            <div className="footerSocialLinks">
              {socialPlatforms.map((platform) => {
                const link = socialLinks.find((item) => item.platform === platform.platform);

                if (link && !link.isActive) {
                  return null;
                }

                return (
                  <a href={link?.url || platform.defaultUrl} key={platform.platform} target="_blank" rel="noreferrer">
                    <span>
                      <img src={platform.iconUrl} alt="" />
                    </span>
                    {link?.label ?? platform.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footerBottom">
            <span>© 2026 HHS Otomatik Kapı. Tüm hakları saklıdır.</span>
            <a href="/panel" target="_blank" rel="noreferrer">
              Yönetim Paneli
            </a>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="page">
      <LayoutGroup id="quote-modal">
        <header className="siteHeader">
          <motion.a
            className="logoLink"
            href="/"
            aria-label="HHS Otomatik Kapı ana sayfa"
            initial={{
              opacity: 0,
              width: 8,
              height: 8,
              borderRadius: 999,
              y: -8,
            }}
            animate={{
              opacity: 1,
              width: [8, 52, 92],
              height: [8, 52, 52],
              borderRadius: [999, 999, 6],
              y: 0,
            }}
            transition={{
              duration: 0.9,
              ease: 'easeInOut',
              times: [0, 0.48, 1],
            }}
          >
            <motion.img
              src="/apple-touch-icon.png"
              alt="HHS Otomatik Kapı"
              initial={{ opacity: 0, scale: 0.72 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.58, ease: 'easeOut' }}
            />
          </motion.a>

          <div className="headerCenter">
            <AnimatePresence>
              {!isQuoteModalOpen && (
                <motion.button
                  className="headerQuoteButton"
                  type="button"
                  layoutId="quote-surface"
                  initial={hasQuoteButtonEntered ? false : headerItemAnimation.initial}
                  animate={headerItemAnimation.animate}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: hasQuoteButtonEntered ? 0 : 0.95,
                    ease: 'easeOut',
                  }}
                  onAnimationComplete={() => setHasQuoteButtonEntered(true)}
                  onClick={openQuoteModal}
                >
                  Teklif Al
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <nav className="headerActions" aria-label="Üst menü">
            <motion.button
              className="iconButton"
              type="button"
              aria-label="Ara"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 0.95, ease: 'easeOut' }}
            >
              <Search size={22} strokeWidth={2.2} />
            </motion.button>

            <motion.div
              className="languageButton"
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.08, ease: 'easeOut' }}
            >
              <select
                aria-label="Dil seçimi"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} strokeWidth={2.3} />
            </motion.div>

            <motion.button
              className="iconButton"
              type="button"
              aria-label="Menüyü aç"
              onClick={() => setIsHeaderMenuOpen((isOpen) => !isOpen)}
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.21, ease: 'easeOut' }}
            >
              <Menu size={28} strokeWidth={2.2} />
            </motion.button>
          </nav>

          <AnimatePresence>
            {isHeaderMenuOpen && (
              <motion.nav
                className="headerMenuPanel"
                aria-label="Ana menü"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <a href="/" onClick={() => setIsHeaderMenuOpen(false)}>Ana Sayfa</a>
                <a href="#hizmetler" onClick={() => setIsHeaderMenuOpen(false)}>Hizmetler</a>
                <a href="/blog" onClick={() => setIsHeaderMenuOpen(false)}>Blog</a>
                <a href="#iletisim" onClick={() => setIsHeaderMenuOpen(false)}>İletişim</a>
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <AnimatePresence>
          {isQuoteModalOpen && (
            <motion.div
              className="quoteModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeQuoteModal}
            >
              <motion.section
                className="quoteModal"
                layoutId="quote-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="quote-modal-title"
                exit={{ opacity: 0, scale: 0.2, y: -94, borderRadius: 999 }}
                transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsServiceTypeMenuOpen(false);
                }}
              >
              <button
                className="quoteModalClose"
                type="button"
                aria-label="Teklif penceresini kapat"
                onClick={closeQuoteModal}
              >
                <X size={22} strokeWidth={2.2} />
              </button>

              <div className="quoteModalContent">
                <p className="quoteModalEyebrow">Hızlı Teklif</p>
                <h2 id="quote-modal-title">Teklifiniz için lütfen seçim yapın</h2>
                <p>İlgilendiğiniz ürün için yana kaydırın.</p>

                <div className="productCarousel" aria-label="Teklif kategori ve ürün seçenekleri">
                  <div className="productCarouselHeader">
                    <div>
                      <p className="productCarouselEyebrow">{selectedQuoteCategory ? 'Ürün Seçimi' : 'Kategori Seçimi'}</p>
                      <h3>{selectedQuoteCategory ? `${selectedQuoteCategory.title} ürünleri` : 'Önce kategori seçin'}</h3>
                    </div>
                    <div className="productCarouselControls">
                      {selectedQuoteCategory && (
                        <button
                          className="quoteCategoryBackButton"
                          type="button"
                          onClick={() => {
                            setSelectedQuoteCategoryKey('');
                            setSelectedQuoteProductKey('');
                            setQuoteAnswers({});
                          }}
                        >
                          Kategori değiştir
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Önceki seçenek"
                        onClick={() => scrollProducts('previous')}
                      >
                        <ChevronLeft size={20} strokeWidth={2.4} />
                      </button>
                      <button
                        type="button"
                        aria-label="Sonraki seçenek"
                        onClick={() => scrollProducts('next')}
                      >
                        <ChevronRight size={20} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>

                  <div className="productCarouselViewport" ref={productCarouselRef}>
                    <div className={`productCarouselTrack${selectedQuoteProductKey ? ' compact' : ''}`}>
                      {!selectedQuoteCategory ? (
                        quoteCategories.length > 0 ? (
                          quoteCategories.map((category) => (
                            <button
                              className="quoteCategoryCard"
                              key={category.key}
                              type="button"
                              onClick={() => {
                                setSelectedQuoteCategoryKey(category.key);
                                setSelectedQuoteProductKey('');
                                setQuoteAnswers({});
                                productCarouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                              }}
                            >
                              <span className="quoteCategoryThumb">
                                {category.image ? <img src={category.image} alt={category.title} /> : <Package size={28} strokeWidth={2.2} />}
                              </span>
                              <span>
                                <strong>{category.title}</strong>
                                <small>{category.productCount} ürün</small>
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="quoteSelectionEmpty">Teklif için kategori bulunamadı.</p>
                        )
                      ) : quoteProducts.length > 0 ? (
                        quoteProducts.map((product) => (
                            <button
                              className={`productSlide quoteProductSlide${selectedQuoteProductKey === product.key ? ' selected' : ''}`}
                              key={product.key}
                              type="button"
                              onClick={() => {
                                setSelectedQuoteProductKey(product.key);
                                setQuoteAnswers(createDefaultQuoteAnswers(selectedQuoteCategoryKey, product.key));
                              }}
                            >
                              <div className="productImageWrap">
                                <img src={product.imageHorizontal || product.image} alt={product.alt} />
                              </div>

                              <div className="productSlideBody">
                                <h4>{product.title}</h4>
                                <div className="productBadges">
                                  <span>{product.categoryTitle}</span>
                                  {product.badges.slice(0, 2).map((badge) => (
                                    <span key={badge}>{badge}</span>
                                  ))}
                                </div>
                                {selectedQuoteProductKey === product.key && <strong className="quoteProductSelectedBadge">Seçildi</strong>}
                              </div>
                            </button>
                          ))
                      ) : (
                        <p className="quoteSelectionEmpty">Bu kategori için ürün bulunamadı.</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedQuoteCategory && selectedQuoteProduct && (
                  <div className="quoteQuestionStep">
                    <div className="quoteQuestionStepHeader">
                      <p>2. Adım</p>
                      <h3>{selectedQuoteProduct.title} için birkaç bilgi</h3>
                    </div>

                    {activeQuoteQuestions.length > 0 ? (
                      <div className="quoteQuestionList">
                        {activeQuoteQuestions.map((question) => (
                          <label className="quoteQuestionField" key={question.id}>
                            <span className="quoteQuestionFieldTitle">
                              {question.imageUrl && (
                                <img className="quoteQuestionAvatar" src={question.imageUrl} alt="" aria-hidden="true" />
                              )}
                              <span>
                                <strong>
                                  {question.question}
                                  {question.isRequired && <em> *</em>}
                                </strong>
                                {question.description && <small>{question.description}</small>}
                              </span>
                            </span>
                            {question.answerType === 'text' ? (
                              <input
                                required={question.isRequired}
                                maxLength={question.maxLength || undefined}
                                value={(quoteAnswers[question.id] as string | undefined) ?? ''}
                                onChange={(event) => updateQuoteAnswer(question, event.target.value)}
                                placeholder="Yanıtınızı yazın"
                              />
                            ) : question.answerType === 'number' ? (
                              <input
                                required={question.isRequired}
                                step={getQuoteNumberStep(question)}
                                type="number"
                                value={(quoteAnswers[question.id] as string | undefined) ?? ''}
                                onChange={(event) => updateQuoteAnswer(question, event.target.value)}
                                onBlur={(event) => {
                                  if (!event.target.value) {
                                    return;
                                  }

                                  const numberValue = Number(event.target.value);

                                  if (Number.isFinite(numberValue)) {
                                    updateQuoteAnswer(question, formatQuoteNumberAnswer(numberValue, question));
                                  }
                                }}
                                placeholder="Sayı girin"
                              />
                            ) : (
                              <div className="quoteQuestionOptions">
                                {question.options.map((option) => {
                                  const currentAnswer = quoteAnswers[question.id];
                                  const isChecked = Array.isArray(currentAnswer)
                                    ? currentAnswer.includes(option)
                                    : currentAnswer === option;

                                  return (
                                    <label key={option}>
                                      <input
                                        type={question.answerType === 'multiple' ? 'checkbox' : 'radio'}
                                        name={question.id}
                                        required={question.isRequired && question.answerType === 'single'}
                                        checked={isChecked}
                                        onChange={() => updateQuoteAnswer(question, option)}
                                      />
                                      <span>{option}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="quoteQuestionEmpty">Bu kategori için panelden soru tanımlanmamış.</p>
                    )}
                  </div>
                )}

                {selectedQuoteCategory && selectedQuoteProduct && (
                  <div className="quoteContactStep">
                    <div className="quoteQuestionStepHeader">
                      <p>Son Adım</p>
                      <h3>İletişim bilgileri</h3>
                    </div>
                    <div className="quoteContactGrid">
                      <label>
                        Adı Soyadı
                        <input
                          value={quoteContactForm.fullName}
                          onChange={(event) => updateQuoteContactForm('fullName', event.target.value)}
                          placeholder="Adınız Soyadınız"
                        />
                      </label>
                      <label>
                        Telefon
                        <div className="quotePhoneInput">
                          <span>+90</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={quoteContactForm.phone}
                            onChange={(event) => updateQuoteContactForm('phone', event.target.value)}
                            placeholder="5xx xxx xx xx"
                          />
                        </div>
                      </label>
                      <label>
                        Mail
                        <input
                          type="email"
                          value={quoteContactForm.email}
                          onChange={(event) => updateQuoteContactForm('email', event.target.value)}
                          placeholder="ornek@mail.com"
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="quoteModalActions">
                  {selectedQuoteCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuoteCategoryKey('');
                        setSelectedQuoteProductKey('');
                        setQuoteAnswers({});
                      }}
                    >
                      Geri
                    </button>
                  )}
                  {selectedQuoteProduct ? (
                    isQuoteContinueDisabled ? (
                      <button type="button" disabled>
                        Devam Et
                      </button>
                    ) : (
                      <>
                        <button
                          className="secondary"
                          type="button"
                          disabled={isSubmittingQuoteRequest}
                          onClick={() => submitQuoteRequest(true)}
                        >
                          İsimsiz Devam Et
                        </button>
                        <button
                          type="button"
                          disabled={!isQuoteContactComplete || isSubmittingQuoteRequest}
                          onClick={() => submitQuoteRequest(false)}
                        >
                          {isSubmittingQuoteRequest ? 'Kaydediliyor...' : 'Devam Et'}
                        </button>
                      </>
                    )
                  ) : (
                    <button type="button" disabled>
                      Devam Et
                    </button>
                  )}
                  {quoteSubmitMessage && <p className="quoteSubmitMessage">{quoteSubmitMessage}</p>}
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
          {isServiceRequestModalOpen && (
            <motion.div
              className="quoteModalOverlay serviceRequestModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsServiceRequestModalOpen(false)}
            >
              <motion.section
                className="quoteModal serviceRequestModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-request-modal-title"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 190, damping: 24 }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="quoteModalClose"
                  type="button"
                  aria-label="Servis kaydı penceresini kapat"
                  onClick={() => setIsServiceRequestModalOpen(false)}
                >
                  <X size={22} strokeWidth={2.2} />
                </button>

                <div className="quoteModalContent">
                  <p className="quoteModalEyebrow">Servis Kaydı</p>
                  <h2 id="service-request-modal-title">Servis talebinizi oluşturun</h2>
                  <p>Bilgilerinizi bırakın, arıza veya bakım talebiniz servis ekibimize ulaşsın.</p>

                  <form className="serviceRequestForm" onSubmit={submitServiceRequest}>
                    <label className="serviceTypeField" onClick={(event) => event.stopPropagation()}>
                      Talep Tipi
                      <button
                        className="serviceTypeSelect"
                        type="button"
                        aria-label="Talep tipi seç"
                        onClick={() => setIsServiceTypeMenuOpen((isOpen) => !isOpen)}
                      >
                        <span className={`serviceTypeIcon ${selectedServiceRequestType.tone}`}>
                          {selectedServiceRequestType.icon}
                        </span>
                        {selectedServiceRequestType.label}
                        <ChevronDown size={17} strokeWidth={2.4} />
                      </button>

                      {isServiceTypeMenuOpen && (
                        <div className="serviceTypeMenu">
                          {serviceRequestTypes.map((requestType) => (
                            <button
                              className={serviceRequestForm.requestType === requestType.value ? 'active' : ''}
                              type="button"
                              key={requestType.value}
                              onClick={() => {
                                updateServiceRequestForm('requestType', requestType.value);
                                setIsServiceTypeMenuOpen(false);
                              }}
                            >
                              <span className={`serviceTypeIcon ${requestType.tone}`}>{requestType.icon}</span>
                              {requestType.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </label>

                    <label>
                      İlgili Ürün
                      <select
                        value={serviceRequestForm.productKey}
                        onChange={(event) => updateServiceRequestForm('productKey', event.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        {adminCategories.map((category) => (
                          <option key={category.key} value={category.key}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Ad Soyad
                      <input
                        required
                        value={serviceRequestForm.fullName}
                        onChange={(event) => updateServiceRequestForm('fullName', event.target.value)}
                        placeholder="Adınız Soyadınız"
                      />
                    </label>

                    <label>
                      Telefon
                      <div className="servicePhoneInput">
                        <span>+90</span>
                        <input
                          required
                          type="tel"
                          value={serviceRequestForm.phone}
                          onChange={(event) => updateServiceRequestForm('phone', event.target.value.replace(/[^\d\s]/g, ''))}
                          placeholder="5xx xxx xx xx"
                        />
                      </div>
                    </label>

                    <label className="serviceRequestWide">
                      Açıklama
                      <textarea
                        rows={5}
                        value={serviceRequestForm.description}
                        onChange={(event) => updateServiceRequestForm('description', event.target.value)}
                        placeholder="Arıza, talep veya bakım ihtiyacınızı kısaca anlatın."
                      />
                    </label>

                    <div className="serviceRequestActions">
                      {serviceRequestMessage && <p>{serviceRequestMessage}</p>}
                      <div>
                        <button type="button" className="secondary" onClick={() => setIsServiceRequestModalOpen(false)}>
                          Kapat
                        </button>
                        <button type="submit" disabled={isSubmittingServiceRequest}>
                          {isSubmittingServiceRequest ? 'Gönderiliyor...' : 'Gönder'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>

      <div className="paperShaderBackground" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 48 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <ShaderPlane position={[-1.7, 0.9, 0]} color1="#f0801a" color2="#d8d8d8" />
          <ShaderPlane position={[1.7, -0.8, -0.3]} color1="#253669" color2="#f0801a" />
          <EnergyRing radius={1.35} position={[1.25, 0.8, 0.1]} />
          <EnergyRing radius={0.85} position={[-1.4, -0.9, 0.2]} />
        </Canvas>
      </div>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">HHS Otomatik Kapı Sistemleri</p>
          <h1>
            Otomatik kapı, bariyer ve geçiş sistemlerinde profesyonel çözümler
          </h1>
          <p className="lead">
            Bahçe kapısı motorları, otomatik bariyer sistemleri, fotoselli
            kapılar, garaj kapıları ve plaka tanıma çözümleri için keşif, satış,
            montaj ve teknik destek.
          </p>

          <div className="actions">
            <a className="primary" href={phonePrimaryHref}>
              Hemen Ara
            </a>
            <a className="secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">
              WhatsApp Teklif Al
            </a>
          </div>
        </div>

        <div className="heroCard">
          <h2>25+ Yıllık Tecrübe</h2>
          <p>
            Yetkili bayi güvencesi, stoktan teslim ürünler ve saha deneyimiyle
            hızlı çözüm.
          </p>
        </div>
      </section>

      {categoryGalleryImages.length > 0 && (
        <section className="categoryGallerySection">
          <div className="categoryGalleryHeader">
            <p className="eyebrow">Kategori Galerisi</p>
            <h2>Çözüm alanlarımızı keşfedin</h2>
          </div>

          <div className="expandableGallery" aria-label="Kategori görselleri">
            {categoryGalleryImages.map((image, index) => (
              <motion.button
                className="expandableGalleryItem"
                key={image.title}
                type="button"
                style={{ flex: 1 }}
                animate={{ flex: getCategoryGalleryFlexValue(index) }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                onMouseEnter={() => setHoveredCategoryGalleryIndex(index)}
                onMouseLeave={() => setHoveredCategoryGalleryIndex(null)}
                onClick={() => openCategoryGalleryImage(index)}
              >
                <img src={image.url} alt={image.title} />
                <motion.span
                  className="expandableGalleryShade"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredCategoryGalleryIndex === index ? 0 : 0.34 }}
                  transition={{ duration: 0.3 }}
                />
                <strong>{image.title}</strong>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selectedCategoryGalleryIndex !== null && categoryGalleryImages[selectedCategoryGalleryIndex] && (
          <motion.div
            className="galleryModalOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCategoryGalleryImage}
          >
            <button
              className="galleryModalClose"
              type="button"
              aria-label="Galeri önizlemesini kapat"
              onClick={closeCategoryGalleryImage}
            >
              <X size={30} strokeWidth={2.2} />
            </button>

            {categoryGalleryImages.length > 1 && (
              <button
                className="galleryModalNav previous"
                type="button"
                aria-label="Önceki görsel"
                onClick={(event) => {
                  event.stopPropagation();
                  goToPreviousCategoryGalleryImage();
                }}
              >
                <ChevronLeft size={42} strokeWidth={2.2} />
              </button>
            )}

            <motion.div className="galleryModalImageWrap" onClick={(event) => event.stopPropagation()}>
              <motion.img
                key={selectedCategoryGalleryIndex}
                src={categoryGalleryImages[selectedCategoryGalleryIndex].url}
                alt={categoryGalleryImages[selectedCategoryGalleryIndex].title}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>

            {categoryGalleryImages.length > 1 && (
              <button
                className="galleryModalNav next"
                type="button"
                aria-label="Sonraki görsel"
                onClick={(event) => {
                  event.stopPropagation();
                  goToNextCategoryGalleryImage();
                }}
              >
                <ChevronRight size={42} strokeWidth={2.2} />
              </button>
            )}

            <div className="galleryModalCounter">
              {selectedCategoryGalleryIndex + 1} / {categoryGalleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="services">
        <h2>Hizmet Alanları</h2>
        <div className="grid">
          {siteServices.map((service) => (
            <button className="serviceAreaCard" type="button" key={service.key} onClick={() => setSelectedSiteService(service)}>
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedSiteService && (
          <motion.div
            className="quoteModalOverlay serviceDetailOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSelectedSiteService(null)}
          >
            <motion.section
              className="quoteModal serviceDetailModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-detail-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 190, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="quoteModalClose"
                type="button"
                aria-label="Hizmet detayını kapat"
                onClick={() => setSelectedSiteService(null)}
              >
                <X size={22} strokeWidth={2.2} />
              </button>

              <div className="quoteModalContent serviceDetailContent">
                {selectedSiteService.imageUrl && (
                  <img src={selectedSiteService.imageUrl} alt={selectedSiteService.title} />
                )}
                <p className="quoteModalEyebrow">Hizmet Alanı</p>
                <h2 id="service-detail-title">{selectedSiteService.title}</h2>
                <strong>{selectedSiteService.summary}</strong>
                <p>{selectedSiteService.detail}</p>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {activeSiteReferences.length > 0 && (
        <section className="referenceSection" id="referanslar">
          <div className="referenceHeader">
            <h2>Tecrübemize güvenenler</h2>
          </div>

          <div className="referenceCloud" aria-label="Referans logoları">
            <div className="referenceCloudTrack">
              {[...activeSiteReferences, ...activeSiteReferences].map((reference, index) => (
                <article className="referenceLogoCard" key={`${reference.key}-${index}`}>
                  <img src={reference.imageUrl} alt={reference.title} />
                  <div className="referencePopover">
                    <strong>{reference.title}</strong>
                    <p>{reference.description || 'Referans detay metni panelden eklenebilir.'}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className={`floatingContact${isContactMenuOpen ? ' open' : ''}`}>
        <a
          className="floatingContactItem whatsapp"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile yaz"
        >
          <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" />
        </a>
        <a className="floatingContactItem phone" href={phonePrimaryHref} aria-label="Telefonla ara">
          <Phone size={21} strokeWidth={2.4} />
        </a>
        <a className="floatingContactItem mail" href={emailHref} aria-label="E-posta gönder">
          <Mail size={21} strokeWidth={2.4} />
        </a>
        <button
          className="floatingContactToggle"
          type="button"
          aria-label={isContactMenuOpen ? 'İletişim menüsünü kapat' : 'İletişim menüsünü aç'}
          onClick={() => setIsContactMenuOpen((isOpen) => !isOpen)}
        >
          {isContactMenuOpen ? <X size={26} strokeWidth={2.4} /> : <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" />}
        </button>
      </div>

      <section className="contactSection" id="iletisim">
        <div className="contactIntro">
          <p className="eyebrow">Servis Kaydı</p>
          <h2>Arıza ve bakım taleplerinizi bize iletin</h2>
          <p>
            Arıza, aksesuar talebi veya periyodik bakım ihtiyacınız için servis kaydı oluşturun. Talebiniz D1 sistemimize
            kaydedilir ve servis ekibimize bildirilir.
          </p>
          <button className="serviceRequestOpenButton" type="button" onClick={() => setIsServiceRequestModalOpen(true)}>
            Servis Kaydı Oluştur
          </button>
        </div>
      </section>

      {latestBlogPosts.length > 0 && (
        <section className="latestBlogSection" id="blog">
          <div className="latestBlogHeader">
            <p className="eyebrow">Blog</p>
            <h2>Son Blog Yazıları</h2>
            <p>Otomatik kapı, bariyer ve geçiş sistemleri hakkında güncel içerikler.</p>
            <a className="latestBlogAllLink" href="/blog">
              Tüm blog yazıları
            </a>
          </div>
          <div className="latestBlogCarousel">
            <div className="latestBlogImageStack" aria-hidden="true">
              {latestBlogPosts.map((post, index) => (
                post.image ? (
                  <img
                    alt=""
                    className="latestBlogStackImage"
                    key={post.key}
                    src={post.image}
                    style={getLatestBlogImageStyle(index)}
                  />
                ) : (
                  <div
                    className="latestBlogStackImage latestBlogStackFallback"
                    key={post.key}
                    style={getLatestBlogImageStyle(index)}
                  />
                )
              ))}
            </div>

            {activeLatestBlogPost && (
              <div className="latestBlogCarouselContent">
                <div className="latestBlogText">
                  <span>{activeLatestBlogPost.categories[0]?.title ?? 'Blog'}</span>
                  <h3>{activeLatestBlogPost.title}</h3>
                  <p>{activeLatestBlogPost.summary}</p>
                </div>

                <div className="latestBlogCarouselActions">
                  <a className="latestBlogReadLink" href={`/blog/${activeLatestBlogPost.slug}`}>
                    Yazıyı Oku
                  </a>
                  <div className="latestBlogArrows">
                    <button type="button" onClick={showPreviousLatestBlogPost} aria-label="Önceki blog yazısı">
                      <ChevronLeft size={24} strokeWidth={2.4} />
                    </button>
                    <button type="button" onClick={showNextLatestBlogPost} aria-label="Sonraki blog yazısı">
                      <ChevronRight size={24} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
          <div className="latestBlogMiniList" aria-label="Son blog yazıları">
            {latestBlogPosts.map((post, index) => (
              <button
                className={index === normalizedLatestBlogIndex ? 'active' : ''}
                key={post.key}
                type="button"
                onClick={() => setActiveLatestBlogIndex(index)}
              >
                <span>{post.categories[0]?.title ?? 'Blog'}</span>
                <strong>{post.title}</strong>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="siteFooter">
        <div className="footerBrand">
          <a className="footerLogo" href="/" aria-label="HHS Otomatik Kapı ana sayfa">
            <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
          </a>
          <p>{contactSettings.footerDescription}</p>
        </div>

        <div className="footerColumn">
          <h2>İletişim</h2>
          <a className="footerContactLink" href={phonePrimaryHref}>
            <span>
              <Phone size={15} strokeWidth={2.4} />
            </span>
            {contactSettings.phonePrimary}
          </a>
          {contactSettings.phoneSecondary && (
            <a className="footerContactLink" href={phoneSecondaryHref}>
              <span>
                <Phone size={15} strokeWidth={2.4} />
              </span>
              {contactSettings.phoneSecondary}
            </a>
          )}
          <a className="footerContactLink" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <span>
              <img src="https://cdn.simpleicons.org/whatsapp/25d366" alt="" />
            </span>
            {contactSettings.whatsapp}
          </a>
          <a className="footerContactLink" href={emailHref}>
            <span>
              <Mail size={15} strokeWidth={2.4} />
            </span>
            {contactSettings.email}
          </a>
          {contactSettings.service && (
            <span className="footerContactLink">
              <span>
                <Settings size={15} strokeWidth={2.4} />
              </span>
              {contactSettings.service}
            </span>
          )}
          {contactSettings.address && (
            <span className="footerContactLink">
              <span>
                <MapPin size={15} strokeWidth={2.4} />
              </span>
              {contactSettings.address}
            </span>
          )}
          {(contactSettings.googleMapUrl || contactSettings.appleMapUrl) && (
            <div className="footerMapLinks">
              {contactSettings.googleMapUrl && (
                <a
                  className="footerContactLink"
                  href={contactSettings.googleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <MapPin size={15} strokeWidth={2.4} />
                  </span>
                  Google Harita
                </a>
              )}
              {contactSettings.appleMapUrl && (
                <a
                  className="footerContactLink"
                  href={contactSettings.appleMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <MapPin size={15} strokeWidth={2.4} />
                  </span>
                  Apple Harita
                </a>
              )}
            </div>
          )}
        </div>

        <div className="footerColumn">
          <h2>Sayfalar</h2>
          <a href="/">Ana Sayfa</a>
          <a href="#hizmetler">Hizmetler</a>
          <a href="#referanslar">Referanslar</a>
          <a href="#iletisim">İletişim</a>
        </div>

        <div className="footerColumn">
          <h2>Sosyal Medya</h2>
          <div className="footerSocialLinks">
            {socialPlatforms.map((platform) => {
              const link = socialLinks.find((item) => item.platform === platform.platform);

              if (link && !link.isActive) {
                return null;
              }

              return (
                <a href={link?.url || platform.defaultUrl} key={platform.platform} target="_blank" rel="noreferrer">
                  <span>
                    <img src={platform.iconUrl} alt="" />
                  </span>
                  {link?.label ?? platform.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="footerBottom">
          <span>© 2026 HHS Otomatik Kapı. Tüm hakları saklıdır.</span>
          <a href="/panel" target="_blank" rel="noreferrer">
            Yönetim Paneli
          </a>
        </div>
      </footer>
    </main>
  );
}

export default App;
