import { type ChangeEvent, type FormEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
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

type AdminProduct = {
  key: string;
  categoryKey: string;
  categoryTitle: string;
  title: string;
  slug: string;
  description: string;
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
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  sortOrder: number;
};

type ProductFormState = {
  key: string;
  categoryKey: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  imageSquare: string;
  imageHorizontal: string;
  imageVertical: string;
  sortOrder: string;
  alt: string;
  badges: string;
};

type CategoryFormState = {
  key: string;
  title: string;
  slug: string;
  description: string;
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
};

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

type PendingImageCrop = {
  file: File;
  assetType: 'product-image' | 'category-image';
  previewUrl: string;
  focalPoints: CropFocalPoints;
} | null;

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

type AdminSection = 'products' | 'users' | 'database';
type SettingsTab = 'footer' | 'contact';

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

const createEmptyProductForm = (categoryKey = ''): ProductFormState => ({
  key: '',
  categoryKey,
  title: '',
  slug: '',
  description: '',
  image: '',
  imageSquare: '',
  imageHorizontal: '',
  imageVertical: '',
  sortOrder: '0',
  alt: '',
  badges: '',
});

const emptyCategoryForm: CategoryFormState = {
  key: '',
  title: '',
  slug: '',
  description: '',
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
  const [language, setLanguage] = useState('TR');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [isServiceTypeMenuOpen, setIsServiceTypeMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [hoveredCategoryGalleryIndex, setHoveredCategoryGalleryIndex] = useState<number | null>(null);
  const [selectedCategoryGalleryIndex, setSelectedCategoryGalleryIndex] = useState<number | null>(null);
  const [hasQuoteButtonEntered, setHasQuoteButtonEntered] = useState(false);
  const [adminSection, setAdminSection] = useState<AdminSection>('products');
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [imagePreview, setImagePreview] = useState<ImagePreview>(null);
  const [pendingImageCrop, setPendingImageCrop] = useState<PendingImageCrop>(null);
  const [selectedDatabaseTable, setSelectedDatabaseTable] = useState<DatabaseTable | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSavingSocialLinks, setIsSavingSocialLinks] = useState(false);
  const [isSavingContactSettings, setIsSavingContactSettings] = useState(false);
  const [isSubmittingServiceRequest, setIsSubmittingServiceRequest] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isLoadingDatabaseTables, setIsLoadingDatabaseTables] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [isUploadingUserAvatar, setIsUploadingUserAvatar] = useState(false);
  const [isConfirmingCategoryDelete, setIsConfirmingCategoryDelete] = useState(false);
  const [isConfirmingUserDisable, setIsConfirmingUserDisable] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('footer');
  const [socialLinkForm, setSocialLinkForm] = useState<Record<string, string>>({});
  const [contactSettingsForm, setContactSettingsForm] = useState<ContactSettings>(defaultContactSettings);
  const [serviceRequestForm, setServiceRequestForm] = useState<ServiceRequestFormState>(emptyServiceRequestForm);
  const [serviceRequestMessage, setServiceRequestMessage] = useState('');
  const [editingProductKey, setEditingProductKey] = useState<string | null>(null);
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
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
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const cropPointRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cropPreviewImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

  const authorizedFetch = (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);

    if (adminToken) {
      headers.set('authorization', `Bearer ${adminToken}`);
    }

    return fetch(apiUrl(path), {
      ...init,
      headers,
    });
  };

  const canAccessModule = (moduleKey: string) => {
    return Boolean(adminUser?.modules.includes(moduleKey));
  };

  const activeAdminSection = canAccessModule(adminSection)
    ? adminSection
    : canAccessModule('products')
      ? 'products'
      : canAccessModule('users')
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

    cropVariantOptions.forEach(({ key }, index) => {
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
        const [productsResponse, categoriesResponse, socialLinksResponse, contactSettingsResponse] = await Promise.all([
          fetch(apiUrl('/api/products')),
          fetch(apiUrl('/api/product-categories')),
          fetch(apiUrl('/api/footer-social-links')),
          fetch(apiUrl('/api/contact-settings')),
        ]);
        const productsData = (await productsResponse.json()) as { products?: AdminProduct[] };
        const categoriesData = (await categoriesResponse.json()) as { categories?: AdminCategory[] };
        const socialLinksData = (await socialLinksResponse.json()) as { links?: SocialLink[] };
        const contactSettingsData = (await contactSettingsResponse.json()) as { settings?: ContactSettings };

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
  }, [adminToken, authStatus, adminUser, isPanelPage]);

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

      if (isCategoryModalOpen) {
        setIsCategoryModalOpen(false);
        setEditingCategoryKey(null);
        setIsConfirmingCategoryDelete(false);
        return;
      }

      if (isProductModalOpen) {
        setIsProductModalOpen(false);
        setEditingProductKey(null);
        return;
      }

      if (isQuoteModalOpen) {
        setIsQuoteModalOpen(false);
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
    isServiceTypeMenuOpen,
    imagePreview,
    isAssetManagerOpen,
    isProductModalOpen,
    pendingImageCrop,
    isQuoteModalOpen,
    isServiceRequestModalOpen,
    isSettingsModalOpen,
    isUserModalOpen,
    selectedDatabaseTable,
    selectedCategoryGalleryIndex,
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

  const uploadImageVariants = async (
    file: File,
    assetType: 'product-image' | 'category-image',
    focalPoints: CropFocalPoints = defaultCropFocalPoints,
  ) => {
    const variants = await createProductImageVariants(file, focalPoints);
    const uploads = await Promise.all(
      Object.entries(variants).map(async ([variant, blob]) => {
        const uploadEndpoint = assetType === 'category-image' ? 'product-image' : assetType;
        const uploadVariant = assetType === 'category-image' ? `category-${variant}` : variant;
        const uploadPath = `/api/assets/${uploadEndpoint}?variant=${uploadVariant}&name=${encodeURIComponent(file.name)}`;
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

  const openImageCropper = (file: File, assetType: 'product-image' | 'category-image') => {
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
    const setUploading = assetType === 'product-image' ? setIsUploadingProductImage : setIsUploadingCategoryImage;

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
      image: productImages.image,
      imageSquare: productImages.imageSquare,
      imageHorizontal: productImages.imageHorizontal,
      imageVertical: productImages.imageVertical,
      sortOrder: String(product.sortOrder ?? 0),
      alt: product.alt,
      badges: product.badges.join(', '),
    });
    setIsProductModalOpen(true);
    setAdminMessage('');
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProductKey(null);
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

  const uploadProductImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    openImageCropper(file, 'product-image');
  };

  const uploadAdminUserAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

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

  const uploadCategoryImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAdminMessage('Lütfen geçerli bir kategori görseli seçin.');
      return;
    }

    openImageCropper(file, 'category-image');
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

  const reloadAdminCatalog = async () => {
    const [productsResponse, categoriesResponse, socialLinksResponse, contactSettingsResponse] = await Promise.all([
      fetch(apiUrl('/api/products')),
      fetch(apiUrl('/api/product-categories')),
      fetch(apiUrl('/api/footer-social-links')),
      fetch(apiUrl('/api/contact-settings')),
    ]);
    const productsData = (await productsResponse.json()) as { products?: AdminProduct[] };
    const categoriesData = (await categoriesResponse.json()) as { categories?: AdminCategory[] };
    const socialLinksData = (await socialLinksResponse.json()) as { links?: SocialLink[] };
    const contactSettingsData = (await contactSettingsResponse.json()) as { settings?: ContactSettings };

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
  };

  const reloadAssets = async () => {
    setIsLoadingAssets(true);

    try {
      const response = await authorizedFetch('/api/assets');
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

      setAssets(data.assets);
    } catch {
      setAdminMessage('Görseller yüklenemedi. API bağlantısını kontrol edin.');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const openAssetManager = () => {
    setIsAssetManagerOpen(true);
    setAdminMessage('');
    void reloadAssets();
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
      const data = (await response.json().catch(() => null)) as { ok?: boolean; emailSent?: boolean } | null;

      if (!response.ok || !data?.ok) {
        setServiceRequestMessage('Servis kaydı gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.');
        return;
      }

      setServiceRequestForm(emptyServiceRequestForm);
      setServiceRequestMessage(
        data.emailSent
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

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: productForm.key.trim(),
      categoryKey: productForm.categoryKey,
      title: productForm.title.trim(),
      slug: productForm.slug.trim(),
      description: productForm.description.trim(),
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

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      key: categoryForm.key.trim(),
      title: categoryForm.title.trim(),
      slug: categoryForm.slug.trim(),
      description: categoryForm.description.trim(),
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
              <h1>Sign in</h1>
              <span>or use your account</span>
            </div>

            <div className="adminLoginSocials" aria-hidden="true">
              <span>f</span>
              <span>G</span>
              <span>in</span>
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

              <a href="mailto:info@hhsotomatikkapi.com">Forgot your password?</a>

              {adminMessage && <div className="adminLoginError">{adminMessage}</div>}

              <button type="submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Giriş yapılıyor...' : 'Sign In'}
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
          <a className="adminLogo" href="/" aria-label="HHS ana sayfa">
            <img src="/apple-touch-icon.png" alt="HHS Otomatik Kapı" />
          </a>

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
                <button type="button" onClick={openAssetManager}>
                  Görsel Yönetimi
                </button>
                <button type="button" onClick={openNewProductModal}>
                  Yeni Ürün
                </button>
              </div>
            ) : activeAdminSection === 'users' ? (
              <div className="adminTopbarActions">
                <button type="button" onClick={openNewUserModal}>
                  Yeni Kullanıcı
                </button>
              </div>
            ) : (
              <div className="adminTopbarActions">
                <button type="button" onClick={loadDatabaseTables} disabled={isLoadingDatabaseTables}>
                  {isLoadingDatabaseTables ? 'Yükleniyor...' : 'Yenile'}
                </button>
              </div>
            )}
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
                  <strong>Hazır</strong>
                </article>
              </div>

              <div className="adminProducts">
                {adminProducts.map((product) => (
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
                    Her oran için önizlemenin üzerinde ayrı ayrı tıklayıp sürükleyerek kırpma merkezini ayarla.
                    Yükleme sırasında kare, yatay ve dikey görseller kendi seçimine göre oluşturulur.
                  </p>

                  <div className="adminCropPreviewGrid">
                    {cropVariantOptions.map(({ key, label }, index) => (
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
                        : isUploadingCategoryImage
                    }
                  >
                    {pendingImageCrop.assetType === 'product-image'
                      ? isUploadingProductImage
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
                  <button type="button" onClick={reloadAssets} disabled={isLoadingAssets}>
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
                      {activeSettingsTab === 'footer' ? 'Footer' : 'İletişim Bilgileri'}
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
                  ) : (
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
                      <div className="adminImageUploadControl">
                        <input
                          value={adminUserForm.avatarUrl}
                          onChange={(event) => updateAdminUserForm('avatarUrl', event.target.value)}
                          placeholder="https://... veya görsel yükleyin"
                        />
                        <input
                          ref={userAvatarInputRef}
                          className="adminHiddenFileInput"
                          type="file"
                          accept="image/*"
                          onChange={uploadAdminUserAvatar}
                        />
                        <button
                          type="button"
                          disabled={isUploadingUserAvatar}
                          onClick={() => userAvatarInputRef.current?.click()}
                        >
                          <Upload size={17} strokeWidth={2.4} />
                          {isUploadingUserAvatar ? 'Yükleniyor...' : 'Avatar Yükle'}
                        </button>
                      </div>
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

                    <label className="adminFormWide">
                      Kategori Görseli
                      <div className="adminImageUploadControl">
                        <input
                          value={categoryForm.image}
                          onChange={(event) => updateCategoryForm('image', event.target.value)}
                          placeholder="https://... veya görsel yükleyin"
                        />
                        <input
                          ref={categoryImageInputRef}
                          className="adminHiddenFileInput"
                          type="file"
                          accept="image/*"
                          onChange={uploadCategoryImage}
                        />
                        <button
                          type="button"
                          disabled={isUploadingCategoryImage}
                          onClick={() => categoryImageInputRef.current?.click()}
                        >
                          <Upload size={17} strokeWidth={2.4} />
                          {isUploadingCategoryImage ? 'Yükleniyor...' : 'Görsel Yükle'}
                        </button>
                      </div>
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

                  <label className="adminFormWide">
                    Görsel URL
                    <div className="adminImageUploadControl">
                      <input
                        value={productForm.image}
                        onChange={(event) => updateProductForm('image', event.target.value)}
                        placeholder="https://..."
                      />
                      <input
                        ref={productImageInputRef}
                        className="adminHiddenFileInput"
                        type="file"
                        accept="image/*"
                        onChange={uploadProductImage}
                      />
                      <button
                        type="button"
                        disabled={isUploadingProductImage}
                        onClick={() => productImageInputRef.current?.click()}
                      >
                        <Upload size={17} strokeWidth={2.4} />
                        {isUploadingProductImage ? 'Yükleniyor...' : 'Görsel Yükle'}
                      </button>
                    </div>
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
                  onClick={() => setIsQuoteModalOpen(true)}
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
              initial={headerItemAnimation.initial}
              animate={headerItemAnimation.animate}
              transition={{ duration: 0.45, delay: 1.21, ease: 'easeOut' }}
            >
              <Menu size={28} strokeWidth={2.2} />
            </motion.button>
          </nav>
        </header>

        <AnimatePresence>
          {isQuoteModalOpen && (
            <motion.div
              className="quoteModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsQuoteModalOpen(false)}
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
                onClick={() => setIsQuoteModalOpen(false)}
              >
                <X size={22} strokeWidth={2.2} />
              </button>

              <div className="quoteModalContent">
                <p className="quoteModalEyebrow">Hızlı Teklif</p>
                <h2 id="quote-modal-title">Projeniz için teklif alalım</h2>
                <p>
                  Otomatik kapı, bariyer veya geçiş sistemi ihtiyacınız için bize
                  ulaşın. Keşif ve ürün önerisi için hızlıca dönüş yapalım.
                </p>

                <div className="productCarousel" aria-label="Ürün seçenekleri">
                  <div className="productCarouselHeader">
                    <div>
                      <p className="productCarouselEyebrow">Ürün Seçimi</p>
                      <h3>İlgilendiğiniz ürünü seçin</h3>
                    </div>
                    <div className="productCarouselControls">
                      <button
                        type="button"
                        aria-label="Önceki ürün"
                        onClick={() => scrollProducts('previous')}
                      >
                        <ChevronLeft size={20} strokeWidth={2.4} />
                      </button>
                      <button
                        type="button"
                        aria-label="Sonraki ürün"
                        onClick={() => scrollProducts('next')}
                      >
                        <ChevronRight size={20} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>

                  <div className="productCarouselViewport" ref={productCarouselRef}>
                    <div className="productCarouselTrack">
                      {adminProducts.map((product) => (
                        <article className="productSlide" key={product.key}>
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
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="quoteModalActions">
                  <a href={phonePrimaryHref}>Telefonla Ara</a>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    WhatsApp Yaz
                  </a>
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
          <article>
            <h3>Bahçe Kapısı Motorları</h3>
            <p>
              Yana kayar ve kanatlı kapılar için motor, kumanda, fotosel ve
              aksesuar çözümleri.
            </p>
          </article>
          <article>
            <h3>Otomatik Bariyer Sistemleri</h3>
            <p>
              Site, fabrika, otopark ve işletme girişleri için profesyonel
              bariyer sistemleri.
            </p>
          </article>
          <article>
            <h3>Fotoselli Kapılar</h3>
            <p>
              Mağaza, hastane, ofis ve yoğun geçiş alanları için otomatik cam
              kapı sistemleri.
            </p>
          </article>
          <article>
            <h3>Plaka Tanıma Sistemleri</h3>
            <p>
              Araç giriş kontrolü, ambulans geçiş önceliği ve yetkili araç geçiş
              çözümleri.
            </p>
          </article>
        </div>
      </section>

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
          <a href="/panel">Yönetim Paneli</a>
        </div>
      </footer>
    </main>
  );
}

export default App;
