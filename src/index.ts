export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  ADMIN_BOOTSTRAP_TOKEN?: string;
  RESEND_API_KEY?: string;
  SERVICE_REQUEST_FROM_EMAIL?: string;
  PUSHOVER_API_TOKEN?: string;
  PUSHOVER_USER_KEY?: string;
}

type ProductChild = {
  key: string;
  title: string;
  slug: string;
};

type ProductInput = {
  key: string;
  categoryKey: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  imageSquare?: string;
  imageHorizontal?: string;
  imageVertical?: string;
  alt?: string;
  badges?: string[];
  children?: ProductChild[];
  sortOrder?: number;
  isActive?: boolean;
};

type CategoryInput = {
  key: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  imageSquare?: string;
  imageHorizontal?: string;
  imageVertical?: string;
  sortOrder?: number;
};

type SocialLinkInput = {
  platform: string;
  label: string;
  url: string;
  sortOrder?: number;
  isActive?: boolean;
};

type QuoteQuestionInput = {
  id?: string;
  categoryKey: string;
  productKey: string;
  question: string;
  description?: string;
  imageUrl?: string;
  answerType: 'text' | 'single' | 'multiple' | 'number';
  options?: string[];
  defaultValue?: string;
  maxLength?: number;
  decimalPlaces?: number;
  isRequired?: boolean;
  sortOrder?: number;
  isActive?: boolean;
};

type QuoteQuestionListInput = {
  categoryKey: string;
  productKey: string;
  questions: QuoteQuestionInput[];
};

type ContactSettingsInput = {
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

type SiteReferenceInput = {
  key: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

type PushoverSettingsInput = {
  userKey: string;
  apiToken?: string;
  emailAddress?: string;
  isActive?: boolean;
};

type ServiceRequestInput = {
  requestType: string;
  firstName: string;
  lastName: string;
  phone: string;
  productKey?: string;
  description?: string;
};

type QuoteRequestInput = {
  isAnonymous?: boolean;
  pageKey?: string;
  categoryKey: string;
  categoryTitle?: string;
  productKey: string;
  productTitle?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  answers?: { questionId?: string; question: string; answer: string | string[] }[];
  whatsappMessage: string;
};

type BlogPostInput = {
  key: string;
  title: string;
  summary: string;
  targetKeyword: string;
  content: string;
  slug: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  image?: string;
  imageAlt?: string;
  oldUrl?: string;
  seoScore?: number;
  status?: 'draft' | 'published';
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
};

type BlogCategoryInput = {
  key: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder?: number;
};

type ServiceRequestRecord = ServiceRequestInput & {
  id: string;
  productTitle: string;
  emailSent: boolean;
  pushoverSent?: boolean;
};

type ServiceRequestRow = {
  id: string;
  request_type: string;
  first_name: string;
  last_name: string;
  phone: string;
  product_key: string;
  product_title: string;
  description: string;
  status: string;
  email_sent: number;
  pushover_sent: number;
  created_at: string;
  updated_at: string;
};

type QuoteRequestRecord = QuoteRequestInput & {
  id: string;
  whatsappUrl: string;
  pushoverSent?: boolean;
};

type QuoteRequestRow = {
  id: string;
  is_anonymous: number;
  page_key: string;
  category_key: string;
  category_title: string;
  product_key: string;
  product_title: string;
  full_name: string;
  phone: string;
  email: string;
  answers_json: string;
  whatsapp_message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  key: string;
  category_key: string;
  category_title: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  image_square_url: string;
  image_horizontal_url: string;
  image_vertical_url: string;
  alt_text: string;
  sort_order: number;
  is_active: number;
};

type BadgeRow = {
  product_key: string;
  label: string;
};

type ChildRow = {
  key: string;
  product_key: string;
  title: string;
  slug: string;
};

type CategoryRow = {
  key: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  image_square_url: string;
  image_horizontal_url: string;
  image_vertical_url: string;
  sort_order: number;
};

type AssetReferenceRow = {
  label: string;
};

type AssetUrlRow = {
  image_url?: string | null;
  image_square_url?: string | null;
  image_horizontal_url?: string | null;
  image_vertical_url?: string | null;
  avatar_url?: string | null;
};

type SocialLinkRow = {
  platform: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: number;
};

type QuoteQuestionRow = {
  id: string;
  category_key: string;
  product_key: string | null;
  question: string;
  description: string;
  image_url: string;
  answer_type: string;
  options_json: string;
  default_value: string;
  max_length: number;
  decimal_places: number;
  is_required: number;
  sort_order: number;
  is_active: number;
};

type ContactSettingsRow = {
  id: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp: string;
  service: string;
  email: string;
  address: string;
  google_map_url: string;
  apple_map_url: string;
  footer_description: string;
};

type SiteReferenceRow = {
  key: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type PushoverSettingsRow = {
  id: string;
  user_key: string;
  api_token: string;
  email_address: string;
  is_active: number;
  updated_at: string;
};

type AdminUserInput = {
  username: string;
  email: string;
  password?: string;
  displayName: string;
  avatarUrl?: string;
  isActive?: boolean;
  modules?: string[];
};

type AdminUserRow = {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  password_hash: string;
  role: string;
  is_active: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthenticatedAdmin = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  isActive: boolean;
  modules: string[];
};

type AdminUserModuleRow = {
  user_id: string;
  module_key: string;
};

type DatabaseTableRow = {
  name: string;
  sql: string;
};

type DatabaseSizeRow = {
  size: number | null;
};

type BlogPostRow = {
  key: string;
  title: string;
  summary: string;
  target_keyword: string;
  content: string;
  slug: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  image_url: string;
  image_alt: string;
  old_url: string;
  seo_score: number;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

type BlogCategoryRow = {
  key: string;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
};

type BlogTagRow = {
  key: string;
  title: string;
  slug: string;
};

type BlogPostCategoryRow = {
  post_key: string;
  category_key: string;
  title: string;
  slug: string;
};

type BlogPostTagRow = {
  post_key: string;
  tag_key: string;
  title: string;
  slug: string;
};

type BlogRedirectRow = {
  slug: string;
  status_code: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-Bootstrap-Token',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, init?: ResponseInit) =>
  Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers,
    },
  });

const emptyCorsResponse = () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  });

const notFound = () => json({ ok: false, error: 'Not found' }, { status: 404 });

const getRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as ProductInput;
  } catch {
    return null;
  }
};

const getCategoryRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as CategoryInput;
  } catch {
    return null;
  }
};

const getSocialLinkRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as SocialLinkInput;
  } catch {
    return null;
  }
};

const getQuoteQuestionListRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as QuoteQuestionListInput;
  } catch {
    return null;
  }
};

const getContactSettingsRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as ContactSettingsInput;
  } catch {
    return null;
  }
};

const getSiteReferenceRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as SiteReferenceInput;
  } catch {
    return null;
  }
};

const getPushoverSettingsRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as PushoverSettingsInput;
  } catch {
    return null;
  }
};

const getServiceRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as ServiceRequestInput;
  } catch {
    return null;
  }
};

const getQuoteRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as QuoteRequestInput;
  } catch {
    return null;
  }
};

const getBlogPostRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as BlogPostInput;
  } catch {
    return null;
  }
};

const getBlogCategoryRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as BlogCategoryInput;
  } catch {
    return null;
  }
};

const getAdminUserRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as AdminUserInput;
  } catch {
    return null;
  }
};

const isValidProductInput = (body: ProductInput | null): body is ProductInput => {
  return Boolean(body?.key && body.categoryKey && body.title && body.slug);
};

const isValidCategoryInput = (body: CategoryInput | null): body is CategoryInput => {
  return Boolean(body?.key && body.title && body.slug);
};

const isValidSocialLinkInput = (body: SocialLinkInput | null): body is SocialLinkInput => {
  return Boolean(body?.platform && body.label);
};

const isValidQuoteQuestionListInput = (body: QuoteQuestionListInput | null): body is QuoteQuestionListInput => {
  return Boolean(
    body?.categoryKey &&
      body.productKey &&
      Array.isArray(body.questions) &&
      body.questions.every(
        (question) =>
          question.question?.trim() &&
          ['text', 'single', 'multiple', 'number'].includes(question.answerType) &&
          ((question.answerType !== 'single' && question.answerType !== 'multiple') ||
            (question.options?.length ?? 0) > 0) &&
          (question.maxLength === undefined ||
            (Number.isInteger(question.maxLength) && question.maxLength >= 0)) &&
          (question.decimalPlaces === undefined ||
            (Number.isInteger(question.decimalPlaces) &&
              question.decimalPlaces >= 0 &&
              question.decimalPlaces <= 6)),
      ),
  );
};

const isValidContactSettingsInput = (body: ContactSettingsInput | null): body is ContactSettingsInput => {
  return Boolean(body && typeof body.phonePrimary === 'string' && typeof body.email === 'string');
};

const isValidSiteReferenceInput = (body: SiteReferenceInput | null): body is SiteReferenceInput => {
  return Boolean(body?.key?.trim() && body.title?.trim() && body.imageUrl?.trim());
};

const isValidServiceRequestInput = (body: ServiceRequestInput | null): body is ServiceRequestInput => {
  return Boolean(
    body &&
      typeof body.requestType === 'string' &&
      body.requestType.trim() &&
      typeof body.firstName === 'string' &&
      body.firstName.trim() &&
      typeof body.lastName === 'string' &&
      body.lastName.trim() &&
      typeof body.phone === 'string' &&
      body.phone.trim(),
  );
};

const isValidQuoteRequestInput = (body: QuoteRequestInput | null): body is QuoteRequestInput => {
  if (!body?.categoryKey?.trim() || !body.productKey?.trim() || !body.whatsappMessage?.trim()) {
    return false;
  }

  if (body.isAnonymous) {
    return true;
  }

  return Boolean(
    body.fullName?.trim() &&
      body.phone?.trim() &&
      body.email?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()),
  );
};

const isValidPushoverSettingsInput = (body: PushoverSettingsInput | null): body is PushoverSettingsInput => {
  return Boolean(
    body &&
      typeof body.userKey === 'string' &&
      (body.apiToken === undefined || typeof body.apiToken === 'string') &&
      (body.emailAddress === undefined || typeof body.emailAddress === 'string') &&
      (body.isActive === undefined || typeof body.isActive === 'boolean'),
  );
};

const isValidBlogPostInput = (body: BlogPostInput | null): body is BlogPostInput => {
  return Boolean(
    body?.key &&
      body.title &&
      body.summary &&
      body.targetKeyword &&
      body.content &&
      body.slug &&
      body.metaTitle &&
      body.metaKeywords &&
      body.metaDescription,
  );
};

const isValidBlogCategoryInput = (body: BlogCategoryInput | null): body is BlogCategoryInput => {
  return Boolean(body?.key && body.title && body.slug);
};

const isValidCreateAdminUserInput = (body: AdminUserInput | null): body is AdminUserInput => {
  return Boolean(body?.username && body.email && body.password && body.password.length >= 8 && body.displayName);
};

const isValidUpdateAdminUserInput = (body: AdminUserInput | null): body is AdminUserInput => {
  return Boolean(body?.username && body.email && body.displayName);
};

const getProductKeyOwner = async (db: D1Database, key: string) => {
  return db.prepare('SELECT key FROM products WHERE key = ? LIMIT 1').bind(key).first<{ key: string }>();
};

const getProductSlugOwner = async (db: D1Database, slug: string) => {
  return db.prepare('SELECT key FROM products WHERE slug = ? LIMIT 1').bind(slug).first<{ key: string }>();
};

const extractAssetKeyFromUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  const assetMarker = '/api/assets/';
  const markerIndex = url.indexOf(assetMarker);
  const key = markerIndex >= 0 ? url.slice(markerIndex + assetMarker.length) : url;
  const cleanKey = key.split(/[?#]/)[0]?.trim();

  if (!cleanKey || !cleanKey.match(/\.(webp|png|jpe?g|gif)$/i)) {
    return null;
  }

  try {
    return decodeURIComponent(cleanKey);
  } catch {
    return cleanKey;
  }
};

const getUsedAssetKeys = async (db: D1Database) => {
  const queries = [
    db
      .prepare(
        `SELECT image_url, image_square_url, image_horizontal_url, image_vertical_url
        FROM products`,
      )
      .all<AssetUrlRow>(),
    db
      .prepare(
        `SELECT image_url, image_square_url, image_horizontal_url, image_vertical_url
        FROM product_categories`,
      )
      .all<AssetUrlRow>(),
    db.prepare('SELECT image_url FROM blog_posts').all<AssetUrlRow>(),
    db.prepare('SELECT image_url FROM quote_questions').all<AssetUrlRow>(),
    db.prepare('SELECT image_url FROM site_references').all<AssetUrlRow>(),
    db.prepare('SELECT avatar_url FROM admin_users').all<AssetUrlRow>(),
  ];
  const results = await Promise.all(
    queries.map((query) =>
      query.catch(() => ({
        results: [],
        success: false,
        meta: {},
      })),
    ),
  );
  const usedKeys = new Set<string>();

  results.forEach((result) => {
    result.results.forEach((row) => {
      [
        row.image_url,
        row.image_square_url,
        row.image_horizontal_url,
        row.image_vertical_url,
        row.avatar_url,
      ].forEach((assetUrl) => {
        const assetKey = extractAssetKeyFromUrl(assetUrl);

        if (assetKey) {
          usedKeys.add(assetKey);
        }
      });
    });
  });

  return usedKeys;
};

const getAssetReferences = async (db: D1Database, objectKey: string) => {
  const assetPath = `/api/assets/${objectKey}`;
  const likeValue = `%${assetPath}`;
  const queries = [
    db
      .prepare(
        `SELECT title AS label FROM products
        WHERE image_url LIKE ? OR image_square_url LIKE ? OR image_horizontal_url LIKE ? OR image_vertical_url LIKE ?`,
      )
      .bind(likeValue, likeValue, likeValue, likeValue),
    db
      .prepare(
        `SELECT title AS label FROM product_categories
        WHERE image_url LIKE ? OR image_square_url LIKE ? OR image_horizontal_url LIKE ? OR image_vertical_url LIKE ?`,
      )
      .bind(likeValue, likeValue, likeValue, likeValue),
    db.prepare('SELECT title AS label FROM blog_posts WHERE image_url LIKE ?').bind(likeValue),
    db.prepare('SELECT question AS label FROM quote_questions WHERE image_url LIKE ?').bind(likeValue),
    db.prepare('SELECT title AS label FROM site_references WHERE image_url LIKE ?').bind(likeValue),
    db.prepare('SELECT display_name AS label FROM admin_users WHERE avatar_url LIKE ?').bind(likeValue),
  ];
  const results = await Promise.all(
    queries.map((query) =>
      query.all<AssetReferenceRow>().catch(() => ({
        results: [],
        success: false,
        meta: {},
      })),
    ),
  );

  return results.flatMap((result) => result.results.map((row) => row.label));
};

const listAssetsWithUsage = async (db: D1Database, assetsBucket: R2Bucket, onlyUnused = false) => {
  const listedAssets = await assetsBucket.list({ limit: 1000 });
  const imageAssets = listedAssets.objects.filter((asset) => asset.key.match(/\.(webp|png|jpe?g|gif)$/i));
  const usedAssetKeys = await getUsedAssetKeys(db);
  const assetsWithReferences = await Promise.all(
    imageAssets.map(async (asset) => {
      const isUsed = usedAssetKeys.has(asset.key);
      const references = isUsed ? await getAssetReferences(db, asset.key) : [];

      return {
        key: asset.key,
        url: `/api/assets/${asset.key}`,
        size: asset.size,
        uploaded: asset.uploaded?.toISOString() ?? null,
        references,
        isUsed,
      };
    }),
  );

  return onlyUnused ? assetsWithReferences.filter((asset) => !asset.isUsed) : assetsWithReferences;
};

const toSafeAssetName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

const textEncoder = new TextEncoder();
const adminSessionDurationMs = 1000 * 60 * 60 * 12;
const passwordHashIterations = 100_000;
const adminModules = ['products', 'blog', 'users', 'settings', 'database'] as const;
const defaultAdminModules = [...adminModules];

const bufferToHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

const randomHex = (byteLength: number) => {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const sha256Hex = async (value: string) => {
  return bufferToHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(value)));
};

const hashPassword = async (password: string) => {
  const salt = randomHex(16);
  const baseKey = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: textEncoder.encode(salt),
      iterations: passwordHashIterations,
    },
    baseKey,
    256,
  );

  return `pbkdf2_sha256$${passwordHashIterations}$${salt}$${bufferToHex(bits)}`;
};

const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, iterations, salt, expectedHash] = storedHash.split('$');

  if (algorithm !== 'pbkdf2_sha256' || !iterations || !salt || !expectedHash) {
    return false;
  }

  const baseKey = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: textEncoder.encode(salt),
      iterations: Number(iterations),
    },
    baseKey,
    256,
  );

  return bufferToHex(bits) === expectedHash;
};

const sanitizeAdminModules = (modules?: string[]) => {
  const allowedModules = new Set(adminModules);
  const selectedModules = (modules ?? defaultAdminModules).filter((moduleKey) =>
    allowedModules.has(moduleKey as (typeof adminModules)[number]),
  );

  return [...new Set(selectedModules)];
};

const mapAdminUser = (user: AdminUserRow, modules: string[]): AuthenticatedAdmin => ({
  id: user.id,
  username: user.username,
  email: user.email,
  displayName: user.display_name,
  avatarUrl: user.avatar_url ?? '',
  isActive: Boolean(user.is_active),
  modules,
});

const listAdminUserModules = async (db: D1Database, userId: string) => {
  const modules = await db
    .prepare('SELECT user_id, module_key FROM admin_user_modules WHERE user_id = ? ORDER BY module_key ASC')
    .bind(userId)
    .all<AdminUserModuleRow>();

  return modules.results.map((moduleRow) => moduleRow.module_key);
};

const listAdminUsers = async (db: D1Database) => {
  const users = await db
    .prepare(
      `SELECT id, username, email, display_name, avatar_url, password_hash, role, is_active, last_login_at, created_at, updated_at
      FROM admin_users
      ORDER BY created_at ASC`,
    )
    .all<AdminUserRow>();

  const modules = await db
    .prepare('SELECT user_id, module_key FROM admin_user_modules ORDER BY module_key ASC')
    .all<AdminUserModuleRow>();

  return users.results.map((user) =>
    mapAdminUser(
      user,
      modules.results.filter((moduleRow) => moduleRow.user_id === user.id).map((moduleRow) => moduleRow.module_key),
    ),
  );
};

const getAdminUserByLogin = async (db: D1Database, login: string) => {
  return db
    .prepare(
      `SELECT id, username, email, display_name, avatar_url, password_hash, role, is_active, last_login_at, created_at, updated_at
      FROM admin_users
      WHERE username = ? OR email = ?
      LIMIT 1`,
    )
    .bind(login, login)
    .first<AdminUserRow>();
};

const getAdminUserCount = async (db: D1Database) => {
  const row = await db.prepare('SELECT COUNT(*) AS total FROM admin_users').first<{ total: number }>();
  return row?.total ?? 0;
};

const createAdminUser = async (db: D1Database, input: AdminUserInput) => {
  const id = crypto.randomUUID();
  const modules = sanitizeAdminModules(input.modules);
  const passwordHash = await hashPassword(input.password ?? '');

  await db.batch([
    db
      .prepare(
        `INSERT INTO admin_users (id, username, email, display_name, avatar_url, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.username.trim().toLowerCase(),
        input.email.trim().toLowerCase(),
        input.displayName.trim(),
        input.avatarUrl?.trim() ?? '',
        passwordHash,
        'admin',
        input.isActive === false ? 0 : 1,
      ),
    ...modules.map((moduleKey) =>
      db.prepare('INSERT INTO admin_user_modules (user_id, module_key) VALUES (?, ?)').bind(id, moduleKey),
    ),
  ]);

  const user = await db
    .prepare(
      `SELECT id, username, email, display_name, avatar_url, password_hash, role, is_active, last_login_at, created_at, updated_at
      FROM admin_users
      WHERE id = ?`,
    )
    .bind(id)
    .first<AdminUserRow>();

  return user ? mapAdminUser(user, await listAdminUserModules(db, user.id)) : null;
};

const updateAdminUser = async (db: D1Database, id: string, input: AdminUserInput) => {
  const modules = sanitizeAdminModules(input.modules);

  if (input.password) {
    const passwordHash = await hashPassword(input.password);

    await db.batch([
      db
        .prepare(
          `UPDATE admin_users
          SET username = ?, email = ?, display_name = ?, avatar_url = ?, password_hash = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          input.username.trim().toLowerCase(),
          input.email.trim().toLowerCase(),
          input.displayName.trim(),
          input.avatarUrl?.trim() ?? '',
          passwordHash,
          input.isActive === false ? 0 : 1,
          id,
        ),
      db.prepare('DELETE FROM admin_user_modules WHERE user_id = ?').bind(id),
      ...modules.map((moduleKey) =>
        db.prepare('INSERT INTO admin_user_modules (user_id, module_key) VALUES (?, ?)').bind(id, moduleKey),
      ),
    ]);
  } else {
    await db.batch([
      db
        .prepare(
          `UPDATE admin_users
          SET username = ?, email = ?, display_name = ?, avatar_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        )
        .bind(
          input.username.trim().toLowerCase(),
          input.email.trim().toLowerCase(),
          input.displayName.trim(),
          input.avatarUrl?.trim() ?? '',
          input.isActive === false ? 0 : 1,
          id,
        ),
      db.prepare('DELETE FROM admin_user_modules WHERE user_id = ?').bind(id),
      ...modules.map((moduleKey) =>
        db.prepare('INSERT INTO admin_user_modules (user_id, module_key) VALUES (?, ?)').bind(id, moduleKey),
      )
    ]);
  }

  const user = await db
    .prepare(
      `SELECT id, username, email, display_name, avatar_url, password_hash, role, is_active, last_login_at, created_at, updated_at
      FROM admin_users
      WHERE id = ?`,
    )
    .bind(id)
    .first<AdminUserRow>();

  return user ? mapAdminUser(user, await listAdminUserModules(db, user.id)) : null;
};

const createAdminSession = async (db: D1Database, userId: string) => {
  const token = randomHex(32);
  const expiresAt = new Date(Date.now() + adminSessionDurationMs).toISOString().replace('T', ' ').slice(0, 19);

  await db.batch([
    db
      .prepare('INSERT INTO admin_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, await sha256Hex(token), expiresAt),
    db.prepare('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').bind(userId),
  ]);

  return { token, expiresAt };
};

const authenticateAdmin = async (request: Request, db: D1Database) => {
  const authorizationHeader = request.headers.get('authorization') ?? '';
  const token = authorizationHeader.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return null;
  }

  const user = await db
    .prepare(
      `SELECT u.id, u.username, u.email, u.display_name, u.avatar_url, u.password_hash, u.role, u.is_active, u.last_login_at, u.created_at, u.updated_at
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.is_active = 1
      LIMIT 1`,
    )
    .bind(await sha256Hex(token))
    .first<AdminUserRow>();

  return user ? mapAdminUser(user, await listAdminUserModules(db, user.id)) : null;
};

const deleteAdminSession = async (request: Request, db: D1Database) => {
  const authorizationHeader = request.headers.get('authorization') ?? '';
  const token = authorizationHeader.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return;
  }

  await db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
};

const unauthorized = () => json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const forbidden = () => json({ ok: false, error: 'Forbidden' }, { status: 403 });
const hasAdminModule = (admin: AuthenticatedAdmin, moduleKey: (typeof adminModules)[number]) =>
  admin.modules.includes(moduleKey);

const quoteSqlIdentifier = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;

const getTableSizeBytes = async (db: D1Database, tableName: string) => {
  try {
    const size = await db
      .prepare('SELECT SUM(pgsize) AS size FROM dbstat WHERE name = ?')
      .bind(tableName)
      .first<DatabaseSizeRow>();

    return size?.size ?? null;
  } catch {
    return null;
  }
};

const splitSqlDefinitions = (definition: string) => {
  const definitions: string[] = [];
  let currentDefinition = '';
  let depth = 0;

  for (const character of definition) {
    if (character === '(') {
      depth += 1;
    }

    if (character === ')') {
      depth -= 1;
    }

    if (character === ',' && depth === 0) {
      definitions.push(currentDefinition.trim());
      currentDefinition = '';
      continue;
    }

    currentDefinition += character;
  }

  if (currentDefinition.trim()) {
    definitions.push(currentDefinition.trim());
  }

  return definitions;
};

const parseTableColumns = (createTableSql: string) => {
  const columnsBlock = createTableSql.match(/\(([\s\S]*)\)\s*$/)?.[1] ?? '';
  const constraintPrefixes = ['PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK', 'CONSTRAINT'];

  return splitSqlDefinitions(columnsBlock)
    .filter((definition) => {
      const firstToken = definition.trim().split(/\s+/)[0]?.replaceAll('"', '').toUpperCase();
      return firstToken && !constraintPrefixes.includes(firstToken);
    })
    .map((definition) => {
      const [rawName = '', ...rest] = definition.trim().split(/\s+/);
      const name = rawName.replace(/^["'`[]|["'`\]]$/g, '');
      const upperDefinition = definition.toUpperCase();

      return {
        name,
        type: rest[0]?.toUpperCase() ?? 'UNKNOWN',
        isRequired: upperDefinition.includes('NOT NULL'),
        isPrimaryKey: upperDefinition.includes('PRIMARY KEY'),
      };
    });
};

const listDatabaseTables = async (db: D1Database) => {
  const tables = await db
    .prepare(
      `SELECT name, sql
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT GLOB '_cf_*'
      ORDER BY name ASC`,
    )
    .all<DatabaseTableRow>();

  return Promise.all(
    tables.results.map(async (table) => {
      const tableIdentifier = quoteSqlIdentifier(table.name);
      const countRow = await db.prepare(`SELECT COUNT(*) AS total FROM ${tableIdentifier}`).first<{ total: number }>();

      return {
        name: table.name,
        rowCount: countRow?.total ?? 0,
        sizeBytes: await getTableSizeBytes(db, table.name),
        columns: parseTableColumns(table.sql),
      };
    }),
  );
};

const mapProducts = (products: ProductRow[], badges: BadgeRow[], children: ChildRow[]) => {
  return products.map((product) => ({
    key: product.key,
    categoryKey: product.category_key,
    categoryTitle: product.category_title,
    title: product.title,
    slug: product.slug,
    description: product.description,
    image: product.image_url,
    imageSquare: product.image_square_url || product.image_url,
    imageHorizontal: product.image_horizontal_url || product.image_url,
    imageVertical: product.image_vertical_url || product.image_url,
    alt: product.alt_text,
    sortOrder: product.sort_order,
    isActive: Boolean(product.is_active),
    badges: badges.filter((badge) => badge.product_key === product.key).map((badge) => badge.label),
    children: children
      .filter((child) => child.product_key === product.key)
      .map((child) => ({
        key: child.key,
        title: child.title,
        slug: child.slug,
      })),
  }));
};

const listProducts = async (db: D1Database) => {
  const products = await db
    .prepare(
      `SELECT
        p.key,
        p.category_key,
        c.title AS category_title,
        p.title,
        p.slug,
        p.description,
        p.image_url,
        p.image_square_url,
        p.image_horizontal_url,
        p.image_vertical_url,
        p.alt_text,
        p.sort_order,
        p.is_active
      FROM products p
      JOIN product_categories c ON c.key = p.category_key
      ORDER BY p.sort_order ASC, p.created_at ASC`,
    )
    .all<ProductRow>();

  const badges = await db
    .prepare('SELECT product_key, label FROM product_badges ORDER BY sort_order ASC, id ASC')
    .all<BadgeRow>();

  const children = await db
    .prepare('SELECT key, product_key, title, slug FROM product_children ORDER BY sort_order ASC')
    .all<ChildRow>();

  return mapProducts(products.results, badges.results, children.results);
};

const listCategories = async (db: D1Database) => {
  const categories = await db
    .prepare(
      `SELECT key, title, slug, description, image_url, image_square_url, image_horizontal_url, image_vertical_url, sort_order
      FROM product_categories
      ORDER BY sort_order ASC, created_at ASC`,
    )
    .all<CategoryRow>();

  return categories.results.map((category) => ({
    key: category.key,
    title: category.title,
    slug: category.slug,
    description: category.description,
    image: category.image_url,
    imageSquare: category.image_square_url || category.image_url,
    imageHorizontal: category.image_horizontal_url || category.image_url,
    imageVertical: category.image_vertical_url || category.image_url,
    sortOrder: category.sort_order,
  }));
};

const listSocialLinks = async (db: D1Database) => {
  const links = await db
    .prepare(
      `SELECT platform, label, url, sort_order, is_active
      FROM footer_social_links
      ORDER BY sort_order ASC, platform ASC`,
    )
    .all<SocialLinkRow>();

  return links.results.map((link) => ({
    platform: link.platform,
    label: link.label,
    url: link.url,
    sortOrder: link.sort_order,
    isActive: Boolean(link.is_active),
  }));
};

const upsertSocialLink = async (db: D1Database, link: SocialLinkInput) => {
  await db
    .prepare(
      `INSERT INTO footer_social_links (platform, label, url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(platform) DO UPDATE SET
        label = excluded.label,
        url = excluded.url,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active,
        updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(link.platform, link.label, link.url, link.sortOrder ?? 0, link.isActive === false ? 0 : 1)
    .run();

  return listSocialLinks(db);
};

const mapQuoteQuestion = (question: QuoteQuestionRow) => {
  try {
    const parsedOptions = JSON.parse(question.options_json) as unknown;
    const options = Array.isArray(parsedOptions) ? parsedOptions.filter((option): option is string => typeof option === 'string') : [];

    return {
      id: question.id,
      categoryKey: question.category_key,
      productKey: question.product_key ?? '',
      question: question.question,
      description: question.description ?? '',
      imageUrl: question.image_url ?? '',
      answerType: question.answer_type,
      options,
      defaultValue: question.default_value ?? '',
      maxLength: question.max_length ?? 0,
      decimalPlaces: question.decimal_places ?? 0,
      isRequired: Boolean(question.is_required),
      sortOrder: question.sort_order,
      isActive: Boolean(question.is_active),
    };
  } catch {
    return {
      id: question.id,
      categoryKey: question.category_key,
      productKey: question.product_key ?? '',
      question: question.question,
      description: question.description ?? '',
      imageUrl: question.image_url ?? '',
      answerType: question.answer_type,
      options: [],
      defaultValue: question.default_value ?? '',
      maxLength: question.max_length ?? 0,
      decimalPlaces: question.decimal_places ?? 0,
      isRequired: Boolean(question.is_required),
      sortOrder: question.sort_order,
      isActive: Boolean(question.is_active),
    };
  }
};

const listQuoteQuestions = async (
  db: D1Database,
  categoryKey?: string,
  productKey?: string,
  includeInactive = false,
) => {
  const whereClauses = [];
  const bindValues: (string | number)[] = [];

  if (categoryKey) {
    whereClauses.push('category_key = ?');
    bindValues.push(categoryKey);
  }

  if (productKey) {
    whereClauses.push('product_key = ?');
    bindValues.push(productKey);
  }

  if (!includeInactive) {
    whereClauses.push('is_active = 1');
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const questions = await db
    .prepare(
      `SELECT id, category_key, product_key, question, description, image_url, answer_type, options_json, default_value, max_length, decimal_places, is_required, sort_order, is_active
      FROM quote_questions
      ${whereSql}
      ORDER BY category_key ASC, product_key ASC, sort_order ASC, question ASC`,
    )
    .bind(...bindValues)
    .all<QuoteQuestionRow>();

  return questions.results.map(mapQuoteQuestion);
};

const replaceQuoteQuestions = async (db: D1Database, input: QuoteQuestionListInput) => {
  const activeQuestions = input.questions.map((question, index) => ({
    id: question.id?.trim() || `quote_${input.categoryKey}_${input.productKey}_${crypto.randomUUID()}`,
    categoryKey: input.categoryKey,
    productKey: input.productKey,
    question: question.question.trim(),
    description: question.description?.trim() ?? '',
    imageUrl: question.imageUrl?.trim() ?? '',
    answerType: question.answerType,
    options: (question.options ?? []).map((option) => option.trim()).filter(Boolean),
    defaultValue: question.defaultValue?.trim() ?? '',
    maxLength: question.answerType === 'text' ? Math.max(0, Math.trunc(question.maxLength ?? 0)) : 0,
    decimalPlaces:
      question.answerType === 'number' ? Math.min(6, Math.max(0, Math.trunc(question.decimalPlaces ?? 0))) : 0,
    isRequired: question.isRequired === true,
    sortOrder: question.sortOrder ?? index + 1,
    isActive: question.isActive !== false,
  }));

  await db.batch([
    db
      .prepare('DELETE FROM quote_questions WHERE category_key = ? AND product_key = ?')
      .bind(input.categoryKey, input.productKey),
    ...activeQuestions.map((question) =>
      db
        .prepare(
          `INSERT INTO quote_questions (
            id,
            page_key,
            category_key,
            product_key,
            question,
            description,
            image_url,
            answer_type,
            options_json,
            default_value,
            max_length,
            decimal_places,
            is_required,
            sort_order,
            is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          question.id,
          'all',
          question.categoryKey,
          question.productKey,
          question.question,
          question.description,
          question.imageUrl,
          question.answerType,
          JSON.stringify(question.options),
          question.defaultValue,
          question.maxLength,
          question.decimalPlaces,
          question.isRequired ? 1 : 0,
          question.sortOrder,
          question.isActive ? 1 : 0,
        ),
    ),
  ]);

  return listQuoteQuestions(db, input.categoryKey, input.productKey, true);
};

const defaultContactSettings: ContactSettingsInput = {
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

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const mapContactSettings = (settings: ContactSettingsRow): ContactSettingsInput => ({
  phonePrimary: settings.phone_primary,
  phoneSecondary: settings.phone_secondary,
  whatsapp: settings.whatsapp,
  service: settings.service,
  email: settings.email,
  address: settings.address,
  googleMapUrl: settings.google_map_url,
  appleMapUrl: settings.apple_map_url ?? '',
  footerDescription: settings.footer_description ?? defaultContactSettings.footerDescription,
});

const ensureContactSettingsTable = async (db: D1Database) => {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        phone_primary TEXT NOT NULL DEFAULT '',
        phone_secondary TEXT NOT NULL DEFAULT '',
        whatsapp TEXT NOT NULL DEFAULT '',
        service TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        address TEXT NOT NULL DEFAULT '',
        google_map_url TEXT NOT NULL DEFAULT '',
        apple_map_url TEXT NOT NULL DEFAULT '',
        footer_description TEXT NOT NULL DEFAULT 'Otomatik kapı, bariyer ve geçiş kontrol sistemlerinde keşif, satış, montaj ve teknik destek.',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();

  const columns = await db.prepare('PRAGMA table_info(contact_settings)').all<{ name: string }>();
  const hasAppleMapUrlColumn = columns.results.some((column) => column.name === 'apple_map_url');
  const hasFooterDescriptionColumn = columns.results.some((column) => column.name === 'footer_description');

  if (!hasAppleMapUrlColumn) {
    await db.prepare("ALTER TABLE contact_settings ADD COLUMN apple_map_url TEXT NOT NULL DEFAULT ''").run();
  }

  if (!hasFooterDescriptionColumn) {
    await db
      .prepare(
        "ALTER TABLE contact_settings ADD COLUMN footer_description TEXT NOT NULL DEFAULT 'Otomatik kapı, bariyer ve geçiş kontrol sistemlerinde keşif, satış, montaj ve teknik destek.'",
      )
      .run();
  }
};

const getContactSettings = async (db: D1Database) => {
  try {
    await ensureContactSettingsTable(db);
    const settings = await db
      .prepare(
        `SELECT id, phone_primary, phone_secondary, whatsapp, service, email, address, google_map_url, apple_map_url, footer_description
        FROM contact_settings
        WHERE id = 'default'
        LIMIT 1`,
      )
      .first<ContactSettingsRow>();

    return settings ? mapContactSettings(settings) : defaultContactSettings;
  } catch {
    return defaultContactSettings;
  }
};

const upsertContactSettings = async (db: D1Database, settings: ContactSettingsInput) => {
  await ensureContactSettingsTable(db);

  await db
    .prepare(
      `INSERT INTO contact_settings (
        id,
        phone_primary,
        phone_secondary,
        whatsapp,
        service,
        email,
        address,
        google_map_url,
        apple_map_url,
        footer_description
      ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        phone_primary = excluded.phone_primary,
        phone_secondary = excluded.phone_secondary,
        whatsapp = excluded.whatsapp,
        service = excluded.service,
        email = excluded.email,
        address = excluded.address,
        google_map_url = excluded.google_map_url,
        apple_map_url = excluded.apple_map_url,
        footer_description = excluded.footer_description,
        updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      settings.phonePrimary,
      settings.phoneSecondary,
      settings.whatsapp,
      settings.service,
      settings.email,
      settings.address,
      settings.googleMapUrl,
      settings.appleMapUrl ?? '',
      settings.footerDescription ?? defaultContactSettings.footerDescription,
    )
    .run();

  return getContactSettings(db);
};

const defaultPushoverSettings = {
  userKey: '',
  apiToken: '',
  emailAddress: 'g76fqg9ggn@pomail.net',
  isActive: false,
  hasApiToken: false,
};

const mapPushoverSettings = (settings: PushoverSettingsRow) => ({
  userKey: settings.user_key,
  apiToken: '',
  emailAddress: settings.email_address ?? defaultPushoverSettings.emailAddress,
  isActive: Boolean(settings.is_active),
  hasApiToken: Boolean(settings.api_token),
});

const ensurePushoverSettingsTable = async (db: D1Database) => {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS pushover_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        user_key TEXT NOT NULL DEFAULT '',
        api_token TEXT NOT NULL DEFAULT '',
        email_address TEXT NOT NULL DEFAULT 'g76fqg9ggn@pomail.net',
        is_active INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();

  const columns = await db.prepare('PRAGMA table_info(pushover_settings)').all<{ name: string }>();
  const hasEmailAddressColumn = columns.results.some((column) => column.name === 'email_address');

  if (!hasEmailAddressColumn) {
    await db
      .prepare("ALTER TABLE pushover_settings ADD COLUMN email_address TEXT NOT NULL DEFAULT 'g76fqg9ggn@pomail.net'")
      .run();
  }
};

const getPushoverSettingsRow = async (db: D1Database) => {
  await ensurePushoverSettingsTable(db);

  return db
    .prepare(
      `SELECT id, user_key, api_token, email_address, is_active, updated_at
      FROM pushover_settings
      WHERE id = 'default'
      LIMIT 1`,
    )
    .first<PushoverSettingsRow>();
};

const getPushoverSettings = async (db: D1Database) => {
  const settings = await getPushoverSettingsRow(db);

  return settings ? mapPushoverSettings(settings) : defaultPushoverSettings;
};

const getPushoverCredentials = async (db: D1Database, env: Env) => {
  const settings = await getPushoverSettingsRow(db).catch(() => null);

  if (settings) {
    if (!settings.is_active) {
      return null;
    }

    if (!(settings.user_key && settings.api_token) && !settings.email_address) {
      return null;
    }

    return {
      userKey: settings.user_key,
      apiToken: settings.api_token,
      emailAddress: settings.email_address,
    };
  }

  if (env.PUSHOVER_USER_KEY && env.PUSHOVER_API_TOKEN) {
    return {
      userKey: env.PUSHOVER_USER_KEY,
      apiToken: env.PUSHOVER_API_TOKEN,
      emailAddress: '',
    };
  }

  return null;
};

const upsertPushoverSettings = async (db: D1Database, settings: PushoverSettingsInput) => {
  await ensurePushoverSettingsTable(db);
  const existing = await getPushoverSettingsRow(db);
  const apiToken = settings.apiToken?.trim() || existing?.api_token || '';
  const emailAddress = settings.emailAddress?.trim() || existing?.email_address || defaultPushoverSettings.emailAddress;

  await db
    .prepare(
      `INSERT INTO pushover_settings (id, user_key, api_token, email_address, is_active, updated_at)
      VALUES ('default', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        user_key = excluded.user_key,
        api_token = excluded.api_token,
        email_address = excluded.email_address,
        is_active = excluded.is_active,
        updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(settings.userKey.trim(), apiToken, emailAddress, settings.isActive === true ? 1 : 0)
    .run();

  return getPushoverSettings(db);
};

const ensureSiteReferencesTable = async (db: D1Database) => {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_references (
        key TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();
};

const mapSiteReference = (reference: SiteReferenceRow) => ({
  key: reference.key,
  title: reference.title,
  description: reference.description,
  imageUrl: reference.image_url,
  sortOrder: reference.sort_order,
  isActive: Boolean(reference.is_active),
  createdAt: reference.created_at,
  updatedAt: reference.updated_at,
});

const listSiteReferences = async (db: D1Database, includeInactive = false) => {
  await ensureSiteReferencesTable(db);
  const references = await db
    .prepare(
      `SELECT key, title, description, image_url, sort_order, is_active, created_at, updated_at
      FROM site_references
      ${includeInactive ? '' : 'WHERE is_active = 1'}
      ORDER BY sort_order ASC, title ASC`,
    )
    .all<SiteReferenceRow>();

  return references.results.map(mapSiteReference);
};

const upsertSiteReference = async (db: D1Database, reference: SiteReferenceInput, previousKey?: string) => {
  await ensureSiteReferencesTable(db);
  const key = previousKey ?? reference.key.trim();

  await db
    .prepare(
      `INSERT INTO site_references (key, title, description, image_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        image_url = excluded.image_url,
        sort_order = excluded.sort_order,
        is_active = excluded.is_active,
        updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(
      key,
      reference.title.trim(),
      reference.description?.trim() ?? '',
      reference.imageUrl?.trim() ?? '',
      Number(reference.sortOrder ?? 0),
      reference.isActive === false ? 0 : 1,
    )
    .run();

  return listSiteReferences(db, true);
};

const deleteSiteReference = async (db: D1Database, key: string) => {
  await ensureSiteReferencesTable(db);
  await db.prepare('DELETE FROM site_references WHERE key = ?').bind(key).run();
  return listSiteReferences(db, true);
};

const ensureServiceRequestsTable = async (db: D1Database) => {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        request_type TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        product_key TEXT NOT NULL DEFAULT '',
        product_title TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        email_sent INTEGER NOT NULL DEFAULT 0,
        pushover_sent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();

  const columns = await db.prepare('PRAGMA table_info(service_requests)').all<{ name: string }>();
  const hasPushoverSentColumn = columns.results.some((column) => column.name === 'pushover_sent');

  if (!hasPushoverSentColumn) {
    await db.prepare('ALTER TABLE service_requests ADD COLUMN pushover_sent INTEGER NOT NULL DEFAULT 0').run();
  }

  await db.prepare('CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)').run();
};

const getCatalogItemTitle = async (db: D1Database, key = '') => {
  if (!key) {
    return '';
  }

  const product = await db.prepare('SELECT title FROM products WHERE key = ? LIMIT 1').bind(key).first<{ title: string }>();

  if (product?.title) {
    return product.title;
  }

  const category = await db
    .prepare('SELECT title FROM product_categories WHERE key = ? LIMIT 1')
    .bind(key)
    .first<{ title: string }>();

  return category?.title ?? '';
};

const truncateNotificationText = (value: string, maxLength = 900) => {
  const trimmedValue = value.trim();

  return trimmedValue.length > maxLength ? `${trimmedValue.slice(0, maxLength - 1)}…` : trimmedValue;
};

const sendPushoverEmailNotification = async (
  env: Env,
  recipientEmail: string,
  title: string,
  message: string,
  options: { url?: string; urlTitle?: string } = {},
) => {
  if (!env.RESEND_API_KEY || !recipientEmail) {
    return false;
  }

  const text = [message, options.url ? `${options.urlTitle ?? 'Link'}: ${options.url}` : ''].filter(Boolean).join('\n\n');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.SERVICE_REQUEST_FROM_EMAIL ?? 'HHS Otomatik Kapı <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: title,
      text: truncateNotificationText(text),
    }),
  });

  return response.ok;
};

const sendPushoverNotification = async (
  db: D1Database,
  env: Env,
  title: string,
  message: string,
  options: { priority?: number; url?: string; urlTitle?: string } = {},
) => {
  const credentials = await getPushoverCredentials(db, env);

  if (!credentials) {
    return false;
  }

  if (credentials.apiToken && credentials.userKey) {
    try {
      const response = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          token: credentials.apiToken,
          user: credentials.userKey,
          title,
          message: truncateNotificationText(message),
          priority: options.priority ?? 0,
          ...(options.url ? { url: options.url } : {}),
          ...(options.urlTitle ? { url_title: options.urlTitle } : {}),
        }),
      });
      const data = (await response.json().catch(() => null)) as { status?: number } | null;

      if (response.ok && data?.status === 1) {
        return true;
      }
    } catch {
      // Fall through to the Pushover e-mail gateway fallback below.
    }
  }

  return sendPushoverEmailNotification(env, credentials.emailAddress, title, message, options).catch(() => false);
};

const sendServiceRequestEmail = async (
  env: Env,
  recipientEmail: string,
  serviceRequest: ServiceRequestRecord,
) => {
  if (!env.RESEND_API_KEY || !recipientEmail) {
    return false;
  }

  const customerName = `${serviceRequest.firstName} ${serviceRequest.lastName}`.trim();
  const productLine = serviceRequest.productTitle || serviceRequest.productKey || 'Seçilmedi';
  const html = `
    <h2>Yeni servis kaydı</h2>
    <p><strong>Tip:</strong> ${escapeHtml(serviceRequest.requestType)}</p>
    <p><strong>Müşteri:</strong> ${escapeHtml(customerName)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(serviceRequest.phone)}</p>
    <p><strong>Ürün:</strong> ${escapeHtml(productLine)}</p>
    <p><strong>Açıklama:</strong></p>
    <p>${escapeHtml(serviceRequest.description ?? '').replaceAll('\n', '<br>')}</p>
    <p><strong>Kayıt No:</strong> ${escapeHtml(serviceRequest.id)}</p>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.SERVICE_REQUEST_FROM_EMAIL ?? 'HHS Otomatik Kapı <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `Yeni servis kaydı: ${serviceRequest.requestType}`,
      html,
    }),
  });

  return response.ok;
};

const sendServiceRequestPushover = (db: D1Database, env: Env, serviceRequest: ServiceRequestRecord) => {
  const customerName = `${serviceRequest.firstName} ${serviceRequest.lastName}`.trim();
  const productLine = serviceRequest.productTitle || serviceRequest.productKey || 'Seçilmedi';
  const message = [
    `Tip: ${serviceRequest.requestType}`,
    `Müşteri: ${customerName}`,
    `Telefon: ${serviceRequest.phone}`,
    `Ürün: ${productLine}`,
    serviceRequest.description ? `Açıklama: ${serviceRequest.description}` : '',
    `Kayıt No: ${serviceRequest.id}`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendPushoverNotification(db, env, 'Yeni servis kaydı', message, {
    priority: 1,
    url: 'https://hhsotomatikkapi.com/panel',
    urlTitle: 'Admin paneli aç',
  });
};

const createServiceRequest = async (db: D1Database, env: Env, input: ServiceRequestInput) => {
  await ensureServiceRequestsTable(db);

  const contactSettings = await getContactSettings(db);
  const productKey = input.productKey?.trim() ?? '';
  const serviceRequest: ServiceRequestRecord = {
    id: crypto.randomUUID(),
    requestType: input.requestType.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phone: input.phone.trim(),
    productKey,
    productTitle: await getCatalogItemTitle(db, productKey),
    description: input.description?.trim() ?? '',
    emailSent: false,
  };

  await db
    .prepare(
      `INSERT INTO service_requests (
        id,
        request_type,
        first_name,
        last_name,
        phone,
        product_key,
        product_title,
        description,
        email_sent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      serviceRequest.id,
      serviceRequest.requestType,
      serviceRequest.firstName,
      serviceRequest.lastName,
      serviceRequest.phone,
      serviceRequest.productKey,
      serviceRequest.productTitle,
      serviceRequest.description,
      0,
    )
    .run();

  const emailSent = await sendServiceRequestEmail(env, contactSettings.email, serviceRequest).catch(() => false);
  serviceRequest.emailSent = emailSent;
  serviceRequest.pushoverSent = await sendServiceRequestPushover(db, env, serviceRequest).catch(() => false);

  if (emailSent || serviceRequest.pushoverSent) {
    await db
      .prepare(
        `UPDATE service_requests
        SET email_sent = ?, pushover_sent = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      )
      .bind(emailSent ? 1 : 0, serviceRequest.pushoverSent ? 1 : 0, serviceRequest.id)
      .run();
  }

  return serviceRequest;
};

const mapServiceRequest = (request: ServiceRequestRow) => ({
  id: request.id,
  requestType: request.request_type,
  firstName: request.first_name,
  lastName: request.last_name,
  fullName: `${request.first_name} ${request.last_name}`.trim(),
  phone: request.phone,
  productKey: request.product_key,
  productTitle: request.product_title,
  description: request.description,
  status: request.status,
  emailSent: Boolean(request.email_sent),
  pushoverSent: Boolean(request.pushover_sent),
  createdAt: request.created_at,
  updatedAt: request.updated_at,
});

const listServiceRequests = async (db: D1Database) => {
  await ensureServiceRequestsTable(db);

  const requests = await db
    .prepare(
      `SELECT id, request_type, first_name, last_name, phone, product_key, product_title, description,
        status, email_sent, pushover_sent, created_at, updated_at
      FROM service_requests
      ORDER BY created_at DESC
      LIMIT 200`,
    )
    .all<ServiceRequestRow>();

  return requests.results.map(mapServiceRequest);
};

const closeServiceRequest = async (db: D1Database, id: string) => {
  await ensureServiceRequestsTable(db);

  await db
    .prepare("UPDATE service_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  return listServiceRequests(db);
};

const ensureQuoteRequestsTable = async (db: D1Database) => {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS quote_requests (
        id TEXT PRIMARY KEY,
        is_anonymous INTEGER NOT NULL DEFAULT 0,
        page_key TEXT NOT NULL DEFAULT '',
        category_key TEXT NOT NULL,
        category_title TEXT NOT NULL DEFAULT '',
        product_key TEXT NOT NULL,
        product_title TEXT NOT NULL DEFAULT '',
        full_name TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        answers_json TEXT NOT NULL DEFAULT '[]',
        whatsapp_message TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    .run();

  await db.prepare('CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status)').run();
};

const createQuoteRequest = async (db: D1Database, env: Env, input: QuoteRequestInput) => {
  await ensureQuoteRequestsTable(db);

  const contactSettings = await getContactSettings(db);
  const whatsappDigits = contactSettings.whatsapp.replace(/\D/g, '');
  const quoteRequest: QuoteRequestRecord = {
    id: crypto.randomUUID(),
    isAnonymous: input.isAnonymous === true,
    pageKey: input.pageKey?.trim() ?? '',
    categoryKey: input.categoryKey.trim(),
    categoryTitle: input.categoryTitle?.trim() ?? '',
    productKey: input.productKey.trim(),
    productTitle: input.productTitle?.trim() ?? '',
    fullName: input.isAnonymous ? '' : (input.fullName?.trim() ?? ''),
    phone: input.isAnonymous ? '' : (input.phone?.trim() ?? ''),
    email: input.isAnonymous ? '' : (input.email?.trim() ?? ''),
    answers: (input.answers ?? []).map((answer) => ({
      questionId: answer.questionId?.trim() ?? '',
      question: answer.question.trim(),
      answer: Array.isArray(answer.answer)
        ? answer.answer.map((value) => String(value).trim()).filter(Boolean)
        : String(answer.answer ?? '').trim(),
    })),
    whatsappMessage: input.whatsappMessage.trim(),
    whatsappUrl: whatsappDigits
      ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(input.whatsappMessage.trim())}`
      : '',
  };

  await db
    .prepare(
      `INSERT INTO quote_requests (
        id,
        is_anonymous,
        page_key,
        category_key,
        category_title,
        product_key,
        product_title,
        full_name,
        phone,
        email,
        answers_json,
        whatsapp_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      quoteRequest.id,
      quoteRequest.isAnonymous ? 1 : 0,
      quoteRequest.pageKey,
      quoteRequest.categoryKey,
      quoteRequest.categoryTitle,
      quoteRequest.productKey,
      quoteRequest.productTitle,
      quoteRequest.fullName,
      quoteRequest.phone,
      quoteRequest.email,
      JSON.stringify(quoteRequest.answers ?? []),
      quoteRequest.whatsappMessage,
    )
    .run();

  quoteRequest.pushoverSent = await sendQuoteRequestPushover(db, env, quoteRequest).catch(() => false);

  return quoteRequest;
};

const sendQuoteRequestPushover = (db: D1Database, env: Env, quoteRequest: QuoteRequestRecord) => {
  const customerLine = quoteRequest.isAnonymous
    ? 'Müşteri: İsimsiz'
    : `Müşteri: ${quoteRequest.fullName || '-'} / ${quoteRequest.phone || '-'} / ${quoteRequest.email || '-'}`;
  const answerSummary = (quoteRequest.answers ?? [])
    .map((answer) => {
      const answerText = Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer;

      return answerText ? `${answer.question}: ${answerText}` : '';
    })
    .filter(Boolean)
    .join('\n');
  const message = [
    `Kategori: ${quoteRequest.categoryTitle || quoteRequest.categoryKey}`,
    `Ürün: ${quoteRequest.productTitle || quoteRequest.productKey}`,
    customerLine,
    answerSummary,
    `Kayıt No: ${quoteRequest.id}`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendPushoverNotification(db, env, 'Yeni teklif talebi', message, {
    priority: 1,
    url: 'https://hhsotomatikkapi.com/panel',
    urlTitle: 'Teklif taleplerini aç',
  });
};

const mapQuoteRequest = (request: QuoteRequestRow) => {
  let answers: QuoteRequestInput['answers'];

  try {
    const parsedAnswers = JSON.parse(request.answers_json) as unknown;
    answers = Array.isArray(parsedAnswers)
      ? parsedAnswers
          .filter((answer): answer is { questionId?: string; question: string; answer: string | string[] } =>
            Boolean(answer && typeof answer === 'object' && 'question' in answer),
          )
          .map((answer) => ({
            questionId: typeof answer.questionId === 'string' ? answer.questionId : '',
            question: typeof answer.question === 'string' ? answer.question : '',
            answer: Array.isArray(answer.answer)
              ? answer.answer.filter((value): value is string => typeof value === 'string')
              : typeof answer.answer === 'string'
                ? answer.answer
                : '',
          }))
      : [];
  } catch {
    answers = [];
  }

  return {
    id: request.id,
    isAnonymous: Boolean(request.is_anonymous),
    pageKey: request.page_key,
    categoryKey: request.category_key,
    categoryTitle: request.category_title,
    productKey: request.product_key,
    productTitle: request.product_title,
    fullName: request.full_name,
    phone: request.phone,
    email: request.email,
    answers,
    whatsappMessage: request.whatsapp_message,
    status: request.status,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
};

const listQuoteRequests = async (db: D1Database) => {
  await ensureQuoteRequestsTable(db);

  const requests = await db
    .prepare(
      `SELECT id, is_anonymous, page_key, category_key, category_title, product_key, product_title, full_name, phone, email,
        answers_json, whatsapp_message, status, created_at, updated_at
      FROM quote_requests
      ORDER BY created_at DESC
      LIMIT 200`,
    )
    .all<QuoteRequestRow>();

  return requests.results.map(mapQuoteRequest);
};

const closeQuoteRequest = async (db: D1Database, id: string) => {
  await ensureQuoteRequestsTable(db);

  await db
    .prepare("UPDATE quote_requests SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(id)
    .run();

  return listQuoteRequests(db);
};

const getCategory = async (db: D1Database, key: string) => {
  const category = await db
    .prepare(
      `SELECT key, title, slug, description, image_url, image_square_url, image_horizontal_url, image_vertical_url, sort_order
      FROM product_categories
      WHERE key = ?`,
    )
    .bind(key)
    .first<CategoryRow>();

  if (!category) {
    return null;
  }

  return {
    key: category.key,
    title: category.title,
    slug: category.slug,
    description: category.description,
    image: category.image_url,
    imageSquare: category.image_square_url || category.image_url,
    imageHorizontal: category.image_horizontal_url || category.image_url,
    imageVertical: category.image_vertical_url || category.image_url,
    sortOrder: category.sort_order,
  };
};

const createCategory = async (db: D1Database, category: CategoryInput) => {
  await db
    .prepare(
      `INSERT INTO product_categories (
        key,
        title,
        slug,
        description,
        image_url,
        image_square_url,
        image_horizontal_url,
        image_vertical_url,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      category.key,
      category.title,
      category.slug,
      category.description ?? '',
      category.image ?? '',
      category.imageSquare ?? category.image ?? '',
      category.imageHorizontal ?? category.image ?? '',
      category.imageVertical ?? category.image ?? '',
      category.sortOrder ?? 0,
    )
    .run();

  return getCategory(db, category.key);
};

const updateCategory = async (db: D1Database, key: string, category: CategoryInput) => {
  await db
    .prepare(
      `UPDATE product_categories
      SET
        title = ?,
        slug = ?,
        description = ?,
        image_url = ?,
        image_square_url = ?,
        image_horizontal_url = ?,
        image_vertical_url = ?,
        sort_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE key = ?`,
    )
    .bind(
      category.title,
      category.slug,
      category.description ?? '',
      category.image ?? '',
      category.imageSquare ?? category.image ?? '',
      category.imageHorizontal ?? category.image ?? '',
      category.imageVertical ?? category.image ?? '',
      category.sortOrder ?? 0,
      key,
    )
    .run();

  return getCategory(db, key);
};

const getProduct = async (db: D1Database, key: string) => {
  const products = await db
    .prepare(
      `SELECT
        p.key,
        p.category_key,
        c.title AS category_title,
        p.title,
        p.slug,
        p.description,
        p.image_url,
        p.image_square_url,
        p.image_horizontal_url,
        p.image_vertical_url,
        p.alt_text,
        p.sort_order,
        p.is_active
      FROM products p
      JOIN product_categories c ON c.key = p.category_key
      WHERE p.key = ?`,
    )
    .bind(key)
    .all<ProductRow>();

  if (products.results.length === 0) {
    return null;
  }

  const badges = await db
    .prepare('SELECT product_key, label FROM product_badges WHERE product_key = ? ORDER BY sort_order ASC, id ASC')
    .bind(key)
    .all<BadgeRow>();

  const children = await db
    .prepare('SELECT key, product_key, title, slug FROM product_children WHERE product_key = ? ORDER BY sort_order ASC')
    .bind(key)
    .all<ChildRow>();

  return mapProducts(products.results, badges.results, children.results)[0];
};

const createProduct = async (db: D1Database, product: ProductInput) => {
  const badges = product.badges ?? [];
  const children = product.children ?? [];

  await db.batch([
    db
      .prepare(
        `INSERT INTO products (
          key,
          category_key,
          title,
          slug,
          description,
          image_url,
          image_square_url,
          image_horizontal_url,
          image_vertical_url,
          alt_text,
          sort_order,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        product.key,
        product.categoryKey,
        product.title,
        product.slug,
        product.description ?? '',
        product.image ?? '',
        product.imageSquare ?? product.image ?? '',
        product.imageHorizontal ?? product.image ?? '',
        product.imageVertical ?? product.image ?? '',
        product.alt ?? '',
        product.sortOrder ?? 0,
        product.isActive === false ? 0 : 1,
      ),
    ...badges.map((badge, index) =>
      db
        .prepare('INSERT INTO product_badges (product_key, label, sort_order) VALUES (?, ?, ?)')
        .bind(product.key, badge, index + 1),
    ),
    ...children.map((child, index) =>
      db
        .prepare('INSERT INTO product_children (key, product_key, title, slug, sort_order) VALUES (?, ?, ?, ?, ?)')
        .bind(child.key, product.key, child.title, child.slug, index + 1),
    ),
  ]);

  return getProduct(db, product.key);
};

const updateProduct = async (db: D1Database, key: string, product: ProductInput) => {
  const badges = product.badges ?? [];
  const children = product.children ?? [];

  await db.batch([
    db
      .prepare(
        `UPDATE products
        SET
          category_key = ?,
          title = ?,
          slug = ?,
          description = ?,
          image_url = ?,
          image_square_url = ?,
          image_horizontal_url = ?,
          image_vertical_url = ?,
          alt_text = ?,
          sort_order = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE key = ?`,
      )
      .bind(
        product.categoryKey,
        product.title,
        product.slug,
        product.description ?? '',
        product.image ?? '',
        product.imageSquare ?? product.image ?? '',
        product.imageHorizontal ?? product.image ?? '',
        product.imageVertical ?? product.image ?? '',
        product.alt ?? '',
        product.sortOrder ?? 0,
        product.isActive === false ? 0 : 1,
        key,
      ),
    db.prepare('DELETE FROM product_badges WHERE product_key = ?').bind(key),
    db.prepare('DELETE FROM product_children WHERE product_key = ?').bind(key),
    ...badges.map((badge, index) =>
      db
        .prepare('INSERT INTO product_badges (product_key, label, sort_order) VALUES (?, ?, ?)')
        .bind(key, badge, index + 1),
    ),
    ...children.map((child, index) =>
      db
        .prepare('INSERT INTO product_children (key, product_key, title, slug, sort_order) VALUES (?, ?, ?, ?, ?)')
        .bind(child.key, key, child.title, child.slug, index + 1),
    ),
  ]);

  return getProduct(db, key);
};

const mapBlogPosts = (
  posts: BlogPostRow[],
  categories: BlogPostCategoryRow[],
  tags: BlogPostTagRow[],
) =>
  posts.map((post) => ({
    key: post.key,
    title: post.title,
    summary: post.summary,
    targetKeyword: post.target_keyword,
    content: post.content,
    slug: post.slug,
    metaTitle: post.meta_title,
    metaKeywords: post.meta_keywords,
    metaDescription: post.meta_description,
    image: post.image_url,
    imageAlt: post.image_alt,
    oldUrl: post.old_url,
    seoScore: post.seo_score,
    status: post.status,
    publishedAt: post.published_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    categories: categories
      .filter((category) => category.post_key === post.key)
      .map((category) => ({
        key: category.category_key,
        title: category.title,
        slug: category.slug,
      })),
    tags: tags
      .filter((tag) => tag.post_key === post.key)
      .map((tag) => ({
        key: tag.tag_key,
        title: tag.title,
        slug: tag.slug,
      })),
  }));

const listBlogCategories = async (db: D1Database) => {
  const categories = await db
    .prepare('SELECT key, title, slug, description, sort_order FROM blog_categories ORDER BY sort_order ASC, title ASC')
    .all<BlogCategoryRow>();

  return categories.results.map((category) => ({
    key: category.key,
    title: category.title,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sort_order,
  }));
};

const listBlogTags = async (db: D1Database) => {
  const tags = await db.prepare('SELECT key, title, slug FROM blog_tags ORDER BY title ASC').all<BlogTagRow>();
  return tags.results.map((tag) => ({ key: tag.key, title: tag.title, slug: tag.slug }));
};

const listBlogPosts = async (db: D1Database, includeDrafts = false, limit = 100, offset = 0) => {
  const posts = await db
    .prepare(
      `SELECT key, title, summary, target_keyword, content, slug, meta_title, meta_keywords, meta_description,
        image_url, image_alt, old_url, seo_score, status, published_at, created_at, updated_at
      FROM blog_posts
      ${includeDrafts ? '' : "WHERE status = 'published'"}
      ORDER BY COALESCE(NULLIF(published_at, ''), created_at) DESC
      LIMIT ? OFFSET ?`,
    )
    .bind(limit, offset)
    .all<BlogPostRow>();
  const postKeys = posts.results.map((post) => post.key);

  if (!postKeys.length) {
    return [];
  }

  const placeholders = postKeys.map(() => '?').join(',');
  const categories = await db
    .prepare(
      `SELECT pc.post_key, c.key AS category_key, c.title, c.slug
      FROM blog_post_categories pc
      JOIN blog_categories c ON c.key = pc.category_key
      WHERE pc.post_key IN (${placeholders})
      ORDER BY c.sort_order ASC, c.title ASC`,
    )
    .bind(...postKeys)
    .all<BlogPostCategoryRow>();
  const tags = await db
    .prepare(
      `SELECT pt.post_key, t.key AS tag_key, t.title, t.slug
      FROM blog_post_tags pt
      JOIN blog_tags t ON t.key = pt.tag_key
      WHERE pt.post_key IN (${placeholders})
      ORDER BY t.title ASC`,
    )
    .bind(...postKeys)
    .all<BlogPostTagRow>();

  return mapBlogPosts(posts.results, categories.results, tags.results);
};

const getBlogPostByKeyOrSlug = async (db: D1Database, value: string, includeDrafts = false) => {
  const post = await db
    .prepare(
      `SELECT key, title, summary, target_keyword, content, slug, meta_title, meta_keywords, meta_description,
        image_url, image_alt, old_url, seo_score, status, published_at, created_at, updated_at
      FROM blog_posts
      WHERE (key = ? OR slug = ?) ${includeDrafts ? '' : "AND status = 'published'"}
      LIMIT 1`,
    )
    .bind(value, value)
    .first<BlogPostRow>();

  if (!post) {
    return null;
  }

  const categories = await db
    .prepare(
      `SELECT pc.post_key, c.key AS category_key, c.title, c.slug
      FROM blog_post_categories pc
      JOIN blog_categories c ON c.key = pc.category_key
      WHERE pc.post_key = ?`,
    )
    .bind(post.key)
    .all<BlogPostCategoryRow>();
  const tags = await db
    .prepare(
      `SELECT pt.post_key, t.key AS tag_key, t.title, t.slug
      FROM blog_post_tags pt
      JOIN blog_tags t ON t.key = pt.tag_key
      WHERE pt.post_key = ?`,
    )
    .bind(post.key)
    .all<BlogPostTagRow>();

  return mapBlogPosts([post], categories.results, tags.results)[0];
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureBlogTag = async (db: D1Database, titleOrKey: string) => {
  const title = titleOrKey.trim();
  const key = slugify(title) || toSafeAssetName(title) || crypto.randomUUID();

  await db
    .prepare('INSERT OR IGNORE INTO blog_tags (key, title, slug) VALUES (?, ?, ?)')
    .bind(key, title, key)
    .run();

  return key;
};

const upsertBlogPost = async (db: D1Database, post: BlogPostInput, previousKey?: string) => {
  const key = previousKey ?? post.key;
  const categoryKeys = post.categories ?? [];
  const tagKeys = await Promise.all((post.tags ?? []).filter(Boolean).map((tag) => ensureBlogTag(db, tag)));

  await db.batch([
    db
      .prepare(
        `INSERT INTO blog_posts (
          key, title, summary, target_keyword, content, slug, meta_title, meta_keywords, meta_description,
          image_url, image_alt, old_url, seo_score, status, published_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          title = excluded.title,
          summary = excluded.summary,
          target_keyword = excluded.target_keyword,
          content = excluded.content,
          slug = excluded.slug,
          meta_title = excluded.meta_title,
          meta_keywords = excluded.meta_keywords,
          meta_description = excluded.meta_description,
          image_url = excluded.image_url,
          image_alt = excluded.image_alt,
          old_url = excluded.old_url,
          seo_score = excluded.seo_score,
          status = excluded.status,
          published_at = excluded.published_at,
          updated_at = CURRENT_TIMESTAMP`,
      )
      .bind(
        key,
        post.title,
        post.summary,
        post.targetKeyword,
        post.content,
        post.slug,
        post.metaTitle,
        post.metaKeywords,
        post.metaDescription,
        post.image ?? '',
        post.imageAlt ?? '',
        post.oldUrl ?? '',
        post.seoScore ?? 0,
        post.status ?? 'draft',
        post.publishedAt ?? '',
      ),
    db.prepare('DELETE FROM blog_post_categories WHERE post_key = ?').bind(key),
    db.prepare('DELETE FROM blog_post_tags WHERE post_key = ?').bind(key),
    db.prepare('DELETE FROM blog_redirects WHERE post_key = ?').bind(key),
    ...categoryKeys.map((categoryKey) =>
      db.prepare('INSERT OR IGNORE INTO blog_post_categories (post_key, category_key) VALUES (?, ?)').bind(key, categoryKey),
    ),
    ...tagKeys.map((tagKey) =>
      db.prepare('INSERT OR IGNORE INTO blog_post_tags (post_key, tag_key) VALUES (?, ?)').bind(key, tagKey),
    ),
    ...(post.oldUrl
      ? [
          db
            .prepare('INSERT OR REPLACE INTO blog_redirects (old_url, post_key, status_code) VALUES (?, ?, 301)')
            .bind(post.oldUrl, key),
        ]
      : []),
  ]);

  return getBlogPostByKeyOrSlug(db, key, true);
};

const upsertBlogCategory = async (db: D1Database, category: BlogCategoryInput) => {
  await db
    .prepare(
      `INSERT INTO blog_categories (key, title, slug, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        title = excluded.title,
        slug = excluded.slug,
        description = excluded.description,
        sort_order = excluded.sort_order,
        updated_at = CURRENT_TIMESTAMP`,
    )
    .bind(category.key, category.title, category.slug, category.description ?? '', category.sortOrder ?? 0)
    .run();

  return listBlogCategories(db);
};

const getBlogRedirect = async (db: D1Database, value: string) => {
  return db
    .prepare(
      `SELECT p.slug, r.status_code
      FROM blog_redirects r
      JOIN blog_posts p ON p.key = r.post_key
      WHERE r.old_url = ? OR r.old_url LIKE ?
      LIMIT 1`,
    )
    .bind(value, `%${value}`)
    .first<BlogRedirectRow>();
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return emptyCorsResponse();
    }

    if (url.pathname.startsWith('/api/health')) {
      return json({
        ok: true,
        db: !!env.DB,
        assets: !!env.ASSETS,
      });
    }

    if (url.pathname === '/api/auth/bootstrap' && request.method === 'POST') {
      const body = await getAdminUserRequestBody(request);

      if (!isValidCreateAdminUserInput(body)) {
        return json({ ok: false, error: 'Invalid admin user payload' }, { status: 400 });
      }

      if ((await getAdminUserCount(env.DB)) > 0) {
        return json({ ok: false, error: 'Admin user already exists' }, { status: 409 });
      }

      if (env.ADMIN_BOOTSTRAP_TOKEN) {
        const token = request.headers.get('x-bootstrap-token');

        if (token !== env.ADMIN_BOOTSTRAP_TOKEN) {
          return unauthorized();
        }
      }

      return json(
        {
          ok: true,
          user: await createAdminUser(env.DB, body),
        },
        { status: 201 },
      );
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = (await request.json().catch(() => null)) as {
        login?: string;
        username?: string;
        password?: string;
      } | null;
      const login = body?.login ?? body?.username ?? '';
      const user = login ? await getAdminUserByLogin(env.DB, login.trim().toLowerCase()) : null;

      if (!user || !body?.password || !user.is_active || !(await verifyPassword(body.password, user.password_hash))) {
        return unauthorized();
      }

      const session = await createAdminSession(env.DB, user.id);

      return json({
        ok: true,
        token: session.token,
        expiresAt: session.expiresAt,
        user: mapAdminUser(user, await listAdminUserModules(env.DB, user.id)),
      });
    }

    if (url.pathname === '/api/auth/me' && request.method === 'GET') {
      const admin = await authenticateAdmin(request, env.DB);
      return admin ? json({ ok: true, user: admin }) : unauthorized();
    }

    if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
      await deleteAdminSession(request, env.DB);
      return json({ ok: true });
    }

    if (url.pathname === '/api/database/tables' && request.method === 'GET') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'database')) {
        return forbidden();
      }

      return json({
        ok: true,
        tables: await listDatabaseTables(env.DB),
      });
    }

    if (url.pathname === '/api/admin-users') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'users')) {
        return forbidden();
      }

      if (request.method === 'GET') {
        return json({
          ok: true,
          users: await listAdminUsers(env.DB),
        });
      }

      if (request.method === 'POST') {
        const body = await getAdminUserRequestBody(request);

        if (!isValidCreateAdminUserInput(body)) {
          return json({ ok: false, error: 'Invalid admin user payload' }, { status: 400 });
        }

        return json(
          {
            ok: true,
            user: await createAdminUser(env.DB, body),
          },
          { status: 201 },
        );
      }
    }

    const adminUserMatch = url.pathname.match(/^\/api\/admin-users\/([^/]+)$/);

    if (adminUserMatch) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'users')) {
        return forbidden();
      }

      const adminUserId = decodeURIComponent(adminUserMatch[1]);

      if (request.method === 'PUT') {
        const body = await getAdminUserRequestBody(request);

        if (!isValidUpdateAdminUserInput(body)) {
          return json({ ok: false, error: 'Invalid admin user payload' }, { status: 400 });
        }

        const user = await updateAdminUser(env.DB, adminUserId, body);
        return user ? json({ ok: true, user }) : notFound();
      }

      if (request.method === 'DELETE') {
        const result = await env.DB.prepare('UPDATE admin_users SET is_active = 0 WHERE id = ?').bind(adminUserId).run();

        return json({
          ok: result.meta.changes > 0,
          disabled: result.meta.changes,
        });
      }
    }

    if (url.pathname === '/api/assets' && request.method === 'GET') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'products') && !hasAdminModule(admin, 'blog')) {
        return forbidden();
      }

      try {
        return json({
          ok: true,
          assets: await listAssetsWithUsage(env.DB, env.ASSETS, url.searchParams.get('unused') === '1'),
        });
      } catch (error) {
        return json(
          {
            ok: false,
            error: 'Assets could not be listed',
            message: error instanceof Error ? error.message : 'Unknown asset list error',
          },
          { status: 500 },
        );
      }
    }

    if (
      (
        url.pathname === '/api/assets/product-image' ||
        url.pathname === '/api/assets/category-image' ||
        url.pathname === '/api/assets/blog-image' ||
        url.pathname === '/api/assets/page-image'
      ) &&
      request.method === 'POST'
    ) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'products') && !hasAdminModule(admin, 'blog')) {
        return forbidden();
      }

      const contentType = request.headers.get('content-type') ?? '';

      if (!contentType.includes('image/webp')) {
        return json({ ok: false, error: 'Only WebP uploads are accepted' }, { status: 400 });
      }

      const imageBody = await request.arrayBuffer();

      if (!imageBody.byteLength) {
        return json({ ok: false, error: 'Image body is empty' }, { status: 400 });
      }

      const fileName = url.searchParams.get('name') ?? 'product-image';
      const safeName = toSafeAssetName(fileName) || 'product-image';
      const imageVariant = url.searchParams.get('variant') ?? 'original';
      const safeVariant = toSafeAssetName(imageVariant) || 'original';
      const requestedFolder = url.searchParams.get('folder') ?? '';
      const assetFolder =
        ['urun', 'kategori', 'blog', 'sayfa', 'referans'].includes(requestedFolder)
          ? requestedFolder
          : url.pathname.endsWith('/category-image')
          ? 'kategori'
          : url.pathname.endsWith('/blog-image')
            ? 'blog'
            : url.pathname.endsWith('/page-image')
              ? 'sayfa'
              : 'urun';
      const objectKey = `${assetFolder}/${safeVariant}/${Date.now()}-${crypto.randomUUID()}-${safeName}.webp`;

      await env.ASSETS.put(objectKey, imageBody, {
        httpMetadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      return json(
        {
          ok: true,
          key: objectKey,
          url: `/api/assets/${objectKey}`,
          size: imageBody.byteLength,
        },
        { status: 201 },
      );
    }

    if (url.pathname === '/api/assets/admin-avatar' && request.method === 'POST') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'users')) {
        return forbidden();
      }

      const contentType = request.headers.get('content-type') ?? '';

      if (!contentType.includes('image/webp')) {
        return json({ ok: false, error: 'Only WebP uploads are accepted' }, { status: 400 });
      }

      const imageBody = await request.arrayBuffer();

      if (!imageBody.byteLength) {
        return json({ ok: false, error: 'Image body is empty' }, { status: 400 });
      }

      const fileName = url.searchParams.get('name') ?? 'admin-avatar';
      const safeName = toSafeAssetName(fileName) || 'admin-avatar';
      const objectKey = `sayfa/admin-avatar/${Date.now()}-${crypto.randomUUID()}-${safeName}.webp`;

      await env.ASSETS.put(objectKey, imageBody, {
        httpMetadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      return json(
        {
          ok: true,
          key: objectKey,
          url: `/api/assets/${objectKey}`,
          size: imageBody.byteLength,
        },
        { status: 201 },
      );
    }

    if (url.pathname.startsWith('/api/assets/') && request.method === 'GET') {
      const objectKey = decodeURIComponent(url.pathname.replace('/api/assets/', ''));
      const asset = await env.ASSETS.get(objectKey);

      if (!asset) {
        return notFound();
      }

      const headers = new Headers(corsHeaders);
      asset.writeHttpMetadata(headers);
      headers.set('etag', asset.httpEtag);

      return new Response(asset.body, {
        headers,
      });
    }

    if (url.pathname.startsWith('/api/assets/') && request.method === 'DELETE') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'products')) {
        return forbidden();
      }

      const objectKey = decodeURIComponent(url.pathname.replace('/api/assets/', ''));
      const references = await getAssetReferences(env.DB, objectKey);

      if (references.length > 0) {
        return json({ ok: false, error: 'asset_in_use', references }, { status: 409 });
      }

      await env.ASSETS.delete(objectKey);

      return json({ ok: true, deleted: objectKey });
    }

    if (url.pathname === '/api/product-categories' && request.method === 'GET') {
      return json({
        ok: true,
        categories: await listCategories(env.DB),
      });
    }

    if (url.pathname === '/api/footer-social-links') {
      if (request.method === 'GET') {
        return json({
          ok: true,
          links: await listSocialLinks(env.DB),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        const body = await getSocialLinkRequestBody(request);

        if (!isValidSocialLinkInput(body)) {
          return json({ ok: false, error: 'Invalid social link payload' }, { status: 400 });
        }

        return json({
          ok: true,
          links: await upsertSocialLink(env.DB, body),
        });
      }
    }

    if (url.pathname === '/api/contact-settings') {
      if (request.method === 'GET') {
        return json({
          ok: true,
          settings: await getContactSettings(env.DB),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        const body = await getContactSettingsRequestBody(request);

        if (!isValidContactSettingsInput(body)) {
          return json({ ok: false, error: 'Invalid contact settings payload' }, { status: 400 });
        }

        return json({
          ok: true,
          settings: await upsertContactSettings(env.DB, body),
        });
      }
    }

    if (url.pathname === '/api/references') {
      if (request.method === 'GET') {
        const includeInactive = url.searchParams.get('includeInactive') === '1';

        if (includeInactive) {
          const admin = await authenticateAdmin(request, env.DB);

          if (!admin) {
            return unauthorized();
          }

          if (!hasAdminModule(admin, 'settings')) {
            return forbidden();
          }
        }

        return json({
          ok: true,
          references: await listSiteReferences(env.DB, includeInactive),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        const body = await getSiteReferenceRequestBody(request);

        if (!isValidSiteReferenceInput(body)) {
          return json({ ok: false, error: 'Invalid reference payload' }, { status: 400 });
        }

        return json({
          ok: true,
          references: await upsertSiteReference(env.DB, body),
        });
      }
    }

    if (url.pathname.startsWith('/api/references/')) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'settings')) {
        return forbidden();
      }

      const key = decodeURIComponent(url.pathname.replace('/api/references/', ''));

      if (request.method === 'PUT') {
        const body = await getSiteReferenceRequestBody(request);

        if (!isValidSiteReferenceInput(body)) {
          return json({ ok: false, error: 'Invalid reference payload' }, { status: 400 });
        }

        return json({
          ok: true,
          references: await upsertSiteReference(env.DB, body, key),
        });
      }

      if (request.method === 'DELETE') {
        return json({
          ok: true,
          references: await deleteSiteReference(env.DB, key),
        });
      }
    }

    if (url.pathname === '/api/quote-questions') {
      if (request.method === 'GET') {
        const includeInactive = url.searchParams.get('includeInactive') === '1';

        if (includeInactive) {
          const admin = await authenticateAdmin(request, env.DB);

          if (!admin) {
            return unauthorized();
          }

          if (!hasAdminModule(admin, 'settings')) {
            return forbidden();
          }
        }

        return json({
          ok: true,
          questions: await listQuoteQuestions(
            env.DB,
            url.searchParams.get('categoryKey') ?? undefined,
            url.searchParams.get('productKey') ?? undefined,
            includeInactive,
          ),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        const body = await getQuoteQuestionListRequestBody(request);

        if (!isValidQuoteQuestionListInput(body)) {
          return json({ ok: false, error: 'Invalid quote questions payload' }, { status: 400 });
        }

        return json({
          ok: true,
          questions: await replaceQuoteQuestions(env.DB, body),
        });
      }
    }

    if (url.pathname === '/api/pushover-settings') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'settings')) {
        return forbidden();
      }

      if (request.method === 'GET') {
        return json({
          ok: true,
          settings: await getPushoverSettings(env.DB),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const body = await getPushoverSettingsRequestBody(request);

        if (!isValidPushoverSettingsInput(body)) {
          return json({ ok: false, error: 'Invalid pushover settings payload' }, { status: 400 });
        }

        return json({
          ok: true,
          settings: await upsertPushoverSettings(env.DB, body),
        });
      }
    }

    if (url.pathname.startsWith('/api/service-requests/')) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'settings')) {
        return forbidden();
      }

      const requestId = decodeURIComponent(url.pathname.replace('/api/service-requests/', '').replace(/\/$/, ''));

      if (request.method === 'PATCH') {
        return json({
          ok: true,
          requests: await closeServiceRequest(env.DB, requestId),
        });
      }

      return notFound();
    }

    if (url.pathname === '/api/service-requests') {
      if (request.method === 'GET') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        return json({
          ok: true,
          requests: await listServiceRequests(env.DB),
        });
      }

      if (request.method !== 'POST') {
        return notFound();
      }

      const body = await getServiceRequestBody(request);

      if (!isValidServiceRequestInput(body)) {
        return json({ ok: false, error: 'Invalid service request payload' }, { status: 400 });
      }

      const serviceRequest = await createServiceRequest(env.DB, env, body);

      return json(
        {
          ok: true,
          request: serviceRequest,
          emailSent: serviceRequest.emailSent,
          pushoverSent: serviceRequest.pushoverSent === true,
        },
        { status: 201 },
      );
    }

    if (url.pathname === '/api/quote-requests/test-pushover' && request.method === 'POST') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'settings')) {
        return forbidden();
      }

      if (!(await getPushoverCredentials(env.DB, env))) {
        return json({ ok: false, error: 'pushover_not_configured' }, { status: 400 });
      }

      const pushoverSent = await sendPushoverNotification(
        env.DB,
        env,
        'HHS deneme bildirimi',
        `Pushover deneme bildirimi başarıyla tetiklendi.\nKullanıcı: ${admin.displayName}`,
        {
          priority: 0,
          url: 'https://hhsotomatikkapi.com/panel',
          urlTitle: 'Admin paneli aç',
        },
      ).catch(() => false);

      if (!pushoverSent) {
        return json({ ok: false, error: 'pushover_send_failed' }, { status: 502 });
      }

      return json({ ok: true, pushoverSent: true });
    }

    if (url.pathname === '/api/quote-requests') {
      if (request.method === 'GET') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'settings')) {
          return forbidden();
        }

        return json({
          ok: true,
          requests: await listQuoteRequests(env.DB),
        });
      }

      if (request.method !== 'POST') {
        return notFound();
      }

      const body = await getQuoteRequestBody(request);

      if (!isValidQuoteRequestInput(body)) {
        return json({ ok: false, error: 'Invalid quote request payload' }, { status: 400 });
      }

      const quoteRequest = await createQuoteRequest(env.DB, env, body);

      return json(
        {
          ok: true,
          request: quoteRequest,
          whatsappUrl: quoteRequest.whatsappUrl,
          pushoverSent: quoteRequest.pushoverSent === true,
        },
        { status: 201 },
      );
    }

    if (url.pathname.startsWith('/api/quote-requests/')) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'settings')) {
        return forbidden();
      }

      const requestId = decodeURIComponent(url.pathname.replace('/api/quote-requests/', '').replace(/\/$/, ''));

      if (request.method === 'PATCH') {
        return json({
          ok: true,
          requests: await closeQuoteRequest(env.DB, requestId),
        });
      }

      return notFound();
    }

    if (url.pathname === '/api/blog-categories') {
      if (request.method === 'GET') {
        return json({
          ok: true,
          categories: await listBlogCategories(env.DB),
        });
      }

      if (request.method === 'POST' || request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'blog')) {
          return forbidden();
        }

        const body = await getBlogCategoryRequestBody(request);

        if (!isValidBlogCategoryInput(body)) {
          return json({ ok: false, error: 'Invalid blog category payload' }, { status: 400 });
        }

        return json({
          ok: true,
          categories: await upsertBlogCategory(env.DB, body),
        });
      }
    }

    if (url.pathname === '/api/blog-tags' && request.method === 'GET') {
      return json({
        ok: true,
        tags: await listBlogTags(env.DB),
      });
    }

    if (url.pathname === '/api/blog-redirect' && request.method === 'GET') {
      const oldUrl = url.searchParams.get('url') ?? url.searchParams.get('path') ?? '';

      if (!oldUrl) {
        return json({ ok: false, error: 'Missing url parameter' }, { status: 400 });
      }

      const redirect = await getBlogRedirect(env.DB, oldUrl);

      if (!redirect) {
        return notFound();
      }

      if (url.searchParams.get('redirect') === '1') {
        return Response.redirect(`${url.origin}/blog/${redirect.slug}`, redirect.status_code || 301);
      }

      return json({
        ok: true,
        statusCode: redirect.status_code,
        location: `/blog/${redirect.slug}`,
      });
    }

    if (url.pathname === '/api/blog-posts') {
      if (request.method === 'GET') {
        const includeDrafts = url.searchParams.get('includeDrafts') === '1';

        if (includeDrafts) {
          const admin = await authenticateAdmin(request, env.DB);

          if (!admin) {
            return unauthorized();
          }

          if (!hasAdminModule(admin, 'blog')) {
            return forbidden();
          }
        }

        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 100) || 100, 1), 100);
        const offset = Math.max(Number(url.searchParams.get('offset') ?? 0) || 0, 0);

        return json({
          ok: true,
          posts: await listBlogPosts(env.DB, includeDrafts, limit, offset),
        });
      }

      if (request.method === 'POST') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'blog')) {
          return forbidden();
        }

        const body = await getBlogPostRequestBody(request);

        if (!isValidBlogPostInput(body)) {
          return json({ ok: false, error: 'Invalid blog post payload' }, { status: 400 });
        }

        return json(
          {
            ok: true,
            post: await upsertBlogPost(env.DB, body),
          },
          { status: 201 },
        );
      }
    }

    const blogPostMatch = url.pathname.match(/^\/api\/blog-posts\/([^/]+)$/);

    if (blogPostMatch) {
      const blogPostKeyOrSlug = decodeURIComponent(blogPostMatch[1]);

      if (request.method === 'GET') {
        const post = await getBlogPostByKeyOrSlug(env.DB, blogPostKeyOrSlug, false);
        return post ? json({ ok: true, post }) : notFound();
      }

      if (request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'blog')) {
          return forbidden();
        }

        const body = await getBlogPostRequestBody(request);

        if (!isValidBlogPostInput(body)) {
          return json({ ok: false, error: 'Invalid blog post payload' }, { status: 400 });
        }

        const post = await upsertBlogPost(env.DB, body, blogPostKeyOrSlug);
        return post ? json({ ok: true, post }) : notFound();
      }

      if (request.method === 'DELETE') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'blog')) {
          return forbidden();
        }

        const result = await env.DB.prepare('DELETE FROM blog_posts WHERE key = ?').bind(blogPostKeyOrSlug).run();

        return json({
          ok: result.meta.changes > 0,
          deleted: result.meta.changes,
        });
      }
    }

    if (url.pathname === '/api/product-categories' && request.method === 'POST') {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'products')) {
        return forbidden();
      }

      const body = await getCategoryRequestBody(request);

      if (!isValidCategoryInput(body)) {
        return json({ ok: false, error: 'Invalid category payload' }, { status: 400 });
      }

      return json(
        {
          ok: true,
          category: await createCategory(env.DB, body),
        },
        { status: 201 },
      );
    }

    const categoryMatch = url.pathname.match(/^\/api\/product-categories\/([^/]+)$/);

    if (categoryMatch) {
      const categoryKey = decodeURIComponent(categoryMatch[1]);

      if (request.method === 'GET') {
        const category = await getCategory(env.DB, categoryKey);
        return category ? json({ ok: true, category }) : notFound();
      }

      if (request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'products')) {
          return forbidden();
        }

        const body = await getCategoryRequestBody(request);

        if (!isValidCategoryInput(body)) {
          return json({ ok: false, error: 'Invalid category payload' }, { status: 400 });
        }

        const category = await updateCategory(env.DB, categoryKey, body);
        return category ? json({ ok: true, category }) : notFound();
      }

      if (request.method === 'DELETE') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'products')) {
          return forbidden();
        }

        const result = await env.DB.prepare('DELETE FROM product_categories WHERE key = ?').bind(categoryKey).run();

        return json({
          ok: result.meta.changes > 0,
          deleted: result.meta.changes,
        });
      }
    }

    if (url.pathname === '/api/products') {
      if (request.method === 'GET') {
        return json({
          ok: true,
          products: await listProducts(env.DB),
        });
      }

      if (request.method === 'POST') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'products')) {
          return forbidden();
        }

        const body = await getRequestBody(request);

        if (!isValidProductInput(body)) {
          return json({ ok: false, error: 'Invalid product payload' }, { status: 400 });
        }

        if (await getProductKeyOwner(env.DB, body.key)) {
          return json({ ok: false, error: 'duplicate_product_key' }, { status: 409 });
        }

        if (await getProductSlugOwner(env.DB, body.slug)) {
          return json({ ok: false, error: 'duplicate_product_slug' }, { status: 409 });
        }

        return json(
          {
            ok: true,
            product: await createProduct(env.DB, body),
          },
          { status: 201 },
        );
      }
    }

    const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/);

    if (productMatch) {
      const productKey = decodeURIComponent(productMatch[1]);

      if (request.method === 'GET') {
        const product = await getProduct(env.DB, productKey);
        return product ? json({ ok: true, product }) : notFound();
      }

      if (request.method === 'PUT') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'products')) {
          return forbidden();
        }

        const body = await getRequestBody(request);

        if (!isValidProductInput(body)) {
          return json({ ok: false, error: 'Invalid product payload' }, { status: 400 });
        }

        if (body.key !== productKey) {
          return json({ ok: false, error: 'product_key_cannot_change' }, { status: 400 });
        }

        const product = await getProduct(env.DB, productKey);

        if (!product) {
          return notFound();
        }

        const slugOwner = await getProductSlugOwner(env.DB, body.slug);

        if (slugOwner && slugOwner.key !== productKey) {
          return json({ ok: false, error: 'duplicate_product_slug' }, { status: 409 });
        }

        const updatedProduct = await updateProduct(env.DB, productKey, body);
        return updatedProduct ? json({ ok: true, product: updatedProduct }) : notFound();
      }

      if (request.method === 'DELETE') {
        const admin = await authenticateAdmin(request, env.DB);

        if (!admin) {
          return unauthorized();
        }

        if (!hasAdminModule(admin, 'products')) {
          return forbidden();
        }

        const result = await env.DB.prepare('DELETE FROM products WHERE key = ?').bind(productKey).run();

        return json({
          ok: result.meta.changes > 0,
          deleted: result.meta.changes,
        });
      }
    }

    return notFound();
  },
};
