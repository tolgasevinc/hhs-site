export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  ADMIN_BOOTSTRAP_TOKEN?: string;
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

type ContactSettingsInput = {
  phonePrimary: string;
  phoneSecondary: string;
  whatsapp: string;
  service: string;
  email: string;
  address: string;
  googleMapUrl: string;
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

type SocialLinkRow = {
  platform: string;
  label: string;
  url: string;
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

const getContactSettingsRequestBody = async (request: Request) => {
  try {
    return (await request.json()) as ContactSettingsInput;
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

const isValidContactSettingsInput = (body: ContactSettingsInput | null): body is ContactSettingsInput => {
  return Boolean(body && typeof body.phonePrimary === 'string' && typeof body.email === 'string');
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
    db.prepare('SELECT display_name AS label FROM admin_users WHERE avatar_url LIKE ?').bind(likeValue),
  ];
  const results = await Promise.all(queries.map((query) => query.all<AssetReferenceRow>()));

  return results.flatMap((result) => result.results.map((row) => row.label));
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
const adminModules = ['products', 'users', 'settings', 'database'] as const;
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

const defaultContactSettings: ContactSettingsInput = {
  phonePrimary: '+90 264 291 00 60',
  phoneSecondary: '+90 542 614 29 29',
  whatsapp: '+90 542 614 29 29',
  service: 'Sakarya ve çevre iller',
  email: 'info@hhsotomatikkapi.com',
  address: 'Sakarya ve çevre iller',
  googleMapUrl: '',
};

const mapContactSettings = (settings: ContactSettingsRow): ContactSettingsInput => ({
  phonePrimary: settings.phone_primary,
  phoneSecondary: settings.phone_secondary,
  whatsapp: settings.whatsapp,
  service: settings.service,
  email: settings.email,
  address: settings.address,
  googleMapUrl: settings.google_map_url,
});

const getContactSettings = async (db: D1Database) => {
  let settings: ContactSettingsRow | null = null;

  try {
    settings = await db
      .prepare(
        `SELECT id, phone_primary, phone_secondary, whatsapp, service, email, address, google_map_url
        FROM contact_settings
        WHERE id = 'default'
        LIMIT 1`,
      )
      .first<ContactSettingsRow>();
  } catch {
    return defaultContactSettings;
  }

  return settings ? mapContactSettings(settings) : defaultContactSettings;
};

const upsertContactSettings = async (db: D1Database, settings: ContactSettingsInput) => {
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
        google_map_url
      ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        phone_primary = excluded.phone_primary,
        phone_secondary = excluded.phone_secondary,
        whatsapp = excluded.whatsapp,
        service = excluded.service,
        email = excluded.email,
        address = excluded.address,
        google_map_url = excluded.google_map_url,
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
    )
    .run();

  return getContactSettings(db);
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

      if (!hasAdminModule(admin, 'products')) {
        return forbidden();
      }

      const listedAssets = await env.ASSETS.list({ limit: 1000 });

      return json({
        ok: true,
        assets: listedAssets.objects
          .filter((asset) => asset.key.match(/\.(webp|png|jpe?g|gif)$/i))
          .map((asset) => ({
            key: asset.key,
            url: `/api/assets/${asset.key}`,
            size: asset.size,
            uploaded: asset.uploaded?.toISOString() ?? null,
          })),
      });
    }

    if (
      (url.pathname === '/api/assets/product-image' || url.pathname === '/api/assets/category-image') &&
      request.method === 'POST'
    ) {
      const admin = await authenticateAdmin(request, env.DB);

      if (!admin) {
        return unauthorized();
      }

      if (!hasAdminModule(admin, 'products')) {
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
      const assetFolder = url.pathname.endsWith('/category-image') ? 'categories' : 'products';
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
      const objectKey = `admin-avatars/${Date.now()}-${crypto.randomUUID()}-${safeName}.webp`;

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
