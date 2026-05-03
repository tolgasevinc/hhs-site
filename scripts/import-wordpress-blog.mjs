import 'dotenv/config';
import mysql from 'mysql2/promise';
import sharp from 'sharp';

const args = new Set(process.argv.slice(2));
const getArg = (name, fallback = '') => {
  const prefix = `${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const tablePrefix = process.env.WP_TABLE_PREFIX || 'wp_';
const apiBase = (process.env.HHS_API_BASE || 'https://hhsotomatikkapi.com').replace(/\/$/, '');
const oldSiteUrl = (process.env.WP_OLD_SITE_URL || '').replace(/\/$/, '');
const dryRun = args.has('--dry-run') || !args.has('--import');
const inspectOnly = args.has('--inspect');
const includeDrafts = args.has('--include-drafts');
const limit = Number(getArg('--limit', '0'));

const requiredDbEnv = ['WP_DB_HOST', 'WP_DB_USER', 'WP_DB_NAME'];
const missingDbEnv = requiredDbEnv.filter((key) => !process.env[key]);

if (missingDbEnv.length) {
  console.error(`Eksik WordPress DB env: ${missingDbEnv.join(', ')}`);
  process.exit(1);
}

if (!dryRun && !process.env.HHS_ADMIN_TOKEN) {
  console.error('Gerçek import için HHS_ADMIN_TOKEN gerekli.');
  process.exit(1);
}

const connection = await mysql.createConnection({
  host: process.env.WP_DB_HOST,
  port: Number(process.env.WP_DB_PORT || 3306),
  user: process.env.WP_DB_USER,
  password: process.env.WP_DB_PASSWORD || '',
  database: process.env.WP_DB_NAME,
  charset: 'utf8mb4',
});

const query = async (sql, params = []) => {
  const [rows] = await connection.execute(sql, params);
  return rows;
};

const stripHtml = (value = '') =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const decodeEntities = (value = '') =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const normalizeTurkishText = (value = '') =>
  value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const slugify = (value = '') =>
  normalizeTurkishText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createKeyFromTitle = (title = '') => {
  const words = normalizeTurkishText(title).match(/[a-z0-9]+/g) ?? [];
  return words.map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`)).join('');
};

const countWords = (value = '') => value.trim().split(/\s+/).filter(Boolean).length;

const countKeywordMatches = (value = '', keyword = '') => {
  const normalizedValue = normalizeTurkishText(value);
  const normalizedKeyword = normalizeTurkishText(keyword);
  return normalizedKeyword ? normalizedValue.split(normalizedKeyword).length - 1 : 0;
};

const includesKeyword = (value, keyword) => countKeywordMatches(value, keyword) > 0;

const calculateSeoScore = (post) => {
  const summaryWordCount = countWords(post.summary);
  const summaryKeywordCount = countKeywordMatches(post.summary, post.targetKeyword);
  const summaryKeywordDensity = summaryWordCount > 0 ? (summaryKeywordCount / summaryWordCount) * 100 : 0;
  const checks = [
    Boolean(post.targetKeyword.trim()),
    Boolean(post.title.trim()),
    includesKeyword(post.title, post.targetKeyword),
    Boolean(post.summary.trim()),
    includesKeyword(post.summary, post.targetKeyword),
    summaryWordCount >= 50,
    summaryKeywordDensity > 0,
    Boolean(post.metaTitle.trim()),
    post.metaTitle.length >= 20 && post.metaTitle.length <= 60,
    includesKeyword(post.metaTitle, post.targetKeyword),
    Boolean(post.metaDescription.trim()),
    post.metaDescription.length >= 50 && post.metaDescription.length <= 155,
    includesKeyword(post.metaDescription, post.targetKeyword),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const authHeaders = () => ({
  authorization: `Bearer ${process.env.HHS_ADMIN_TOKEN}`,
});

const apiJson = async (path, init = {}) => {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
};

const uploadImage = async (url, name) => {
  if (!url || dryRun) {
    return url || '';
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Görsel indirilemedi: ${url}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const webp = await sharp(input)
    .resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const uploadResponse = await fetch(`${apiBase}/api/assets/product-image?variant=blog&name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'content-type': 'image/webp',
    },
    body: webp,
  });
  const data = await uploadResponse.json();

  if (!uploadResponse.ok || !data.url) {
    throw new Error(`R2 upload başarısız: ${url}`);
  }

  return data.url.startsWith('/api/') ? `${apiBase}${data.url}` : data.url;
};

const getOptions = async () => {
  const rows = await query(
    `SELECT option_name, option_value FROM ${tablePrefix}options WHERE option_name IN ('home', 'siteurl', 'permalink_structure', 'uploads_use_yearmonth_folders')`,
  );
  return Object.fromEntries(rows.map((row) => [row.option_name, row.option_value]));
};

const getMetaMap = async (postIds) => {
  if (!postIds.length) {
    return new Map();
  }

  const placeholders = postIds.map(() => '?').join(',');
  const rows = await query(
    `SELECT post_id, meta_key, meta_value FROM ${tablePrefix}postmeta WHERE post_id IN (${placeholders})`,
    postIds,
  );
  const metaMap = new Map();

  rows.forEach((row) => {
    const postMeta = metaMap.get(row.post_id) || {};
    postMeta[row.meta_key] = row.meta_value;
    metaMap.set(row.post_id, postMeta);
  });

  return metaMap;
};

const getTaxonomies = async (postIds) => {
  if (!postIds.length) {
    return new Map();
  }

  const placeholders = postIds.map(() => '?').join(',');
  const rows = await query(
    `SELECT tr.object_id, tt.taxonomy, t.name, t.slug, tt.description
    FROM ${tablePrefix}term_relationships tr
    JOIN ${tablePrefix}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    JOIN ${tablePrefix}terms t ON t.term_id = tt.term_id
    WHERE tr.object_id IN (${placeholders}) AND tt.taxonomy IN ('category', 'post_tag')`,
    postIds,
  );
  const taxonomyMap = new Map();

  rows.forEach((row) => {
    const current = taxonomyMap.get(row.object_id) || { categories: [], tags: [] };
    const item = {
      key: slugify(row.slug || row.name),
      title: decodeEntities(row.name),
      slug: slugify(row.slug || row.name),
      description: stripHtml(decodeEntities(row.description || '')),
    };

    if (row.taxonomy === 'category') {
      current.categories.push(item);
    } else {
      current.tags.push(item);
    }

    taxonomyMap.set(row.object_id, current);
  });

  return taxonomyMap;
};

const buildAttachmentUrl = async (attachmentId, meta, options) => {
  if (!attachmentId) {
    return { url: '', alt: '' };
  }

  const rows = await query(
    `SELECT ID, guid, post_title FROM ${tablePrefix}posts WHERE ID = ? AND post_type = 'attachment' LIMIT 1`,
    [attachmentId],
  );
  const attachment = rows[0];
  const attachmentMeta = (await getMetaMap([attachmentId])).get(Number(attachmentId)) || {};
  const attachedFile = attachmentMeta._wp_attached_file || '';
  const baseUrl = options.siteurl || options.home || oldSiteUrl;
  const uploadUrl = attachedFile ? `${baseUrl.replace(/\/$/, '')}/wp-content/uploads/${attachedFile}` : attachment?.guid || '';

  return {
    url: uploadUrl,
    alt: attachmentMeta._wp_attachment_image_alt || attachment?.post_title || meta.title || '',
  };
};

const buildOldUrl = (post, options) => {
  const base = (oldSiteUrl || options.home || options.siteurl || '').replace(/\/$/, '');
  const date = new Date(post.post_date);
  const replacements = {
    '%postname%': post.post_name,
    '%year%': String(date.getFullYear()),
    '%monthnum%': String(date.getMonth() + 1).padStart(2, '0'),
    '%day%': String(date.getDate()).padStart(2, '0'),
    '%post_id%': String(post.ID),
  };
  let path = options.permalink_structure || '/%postname%/';

  Object.entries(replacements).forEach(([token, value]) => {
    path = path.replaceAll(token, value);
  });

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  return `${base}${path}`;
};

const replaceContentImages = async (content, postName) => {
  const matches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  let nextContent = content;
  const replaced = [];
  const failed = [];

  for (const match of matches) {
    const sourceUrl = match[1];

    if (!sourceUrl.includes('/wp-content/uploads/')) {
      continue;
    }

    try {
      const uploadedUrl = await uploadImage(sourceUrl, `${postName}-content`);
      nextContent = nextContent.replaceAll(sourceUrl, uploadedUrl);
      replaced.push({ sourceUrl, uploadedUrl });
    } catch (error) {
      failed.push({ sourceUrl, error: error.message });
    }
  }

  return { content: nextContent, replaced, failed };
};

const metaValue = (meta, keys, fallback = '') => {
  for (const key of keys) {
    if (meta[key]) {
      return decodeEntities(String(meta[key]));
    }
  }

  return fallback;
};

const inspectMeta = async () => {
  const metaRows = await query(
    `SELECT meta_key, COUNT(*) AS total FROM ${tablePrefix}postmeta WHERE meta_key LIKE '%yoast%' OR meta_key LIKE 'rank_math%' OR meta_key LIKE '_aioseo%' GROUP BY meta_key ORDER BY total DESC LIMIT 50`,
  );
  const samplePosts = await query(
    `SELECT ID, post_title, post_name, post_status, post_date FROM ${tablePrefix}posts WHERE post_type = 'post' ORDER BY post_date DESC LIMIT 5`,
  );

  console.log('SEO meta anahtarları:');
  console.table(metaRows);
  console.log('Örnek yazılar:');
  console.table(samplePosts);
};

const importBlog = async () => {
  const options = await getOptions();
  const statusSql = includeDrafts ? "post_status IN ('publish', 'draft')" : "post_status = 'publish'";
  const limitSql = limit > 0 ? `LIMIT ${limit}` : '';
  const posts = await query(
    `SELECT ID, post_title, post_name, post_excerpt, post_content, post_date, post_date_gmt, post_status
    FROM ${tablePrefix}posts
    WHERE post_type = 'post' AND ${statusSql}
    ORDER BY post_date ASC ${limitSql}`,
  );
  const postIds = posts.map((post) => post.ID);
  const metaMap = await getMetaMap(postIds);
  const taxonomyMap = await getTaxonomies(postIds);
  const report = {
    dryRun,
    posts: [],
    imageFailures: [],
  };

  for (const post of posts) {
    const meta = metaMap.get(post.ID) || {};
    const taxonomies = taxonomyMap.get(post.ID) || { categories: [], tags: [] };
    const title = decodeEntities(post.post_title || '');
    const plainContent = stripHtml(decodeEntities(post.post_content || ''));
    const summary =
      decodeEntities(post.post_excerpt || '') ||
      plainContent.split(/\s+/).slice(0, 70).join(' ');
    const targetKeyword = metaValue(meta, ['_yoast_wpseo_focuskw', 'rank_math_focus_keyword'], title.split(/\s+/).slice(0, 2).join(' '));
    const metaTitle = metaValue(meta, ['_yoast_wpseo_title', 'rank_math_title'], title);
    const metaDescription = metaValue(
      meta,
      ['_yoast_wpseo_metadesc', 'rank_math_description'],
      summary.slice(0, 155),
    );
    const metaKeywords = metaValue(
      meta,
      ['_yoast_wpseo_metakeywords'],
      [...taxonomies.categories, ...taxonomies.tags].map((item) => item.title).join(', '),
    );
    const thumbnail = await buildAttachmentUrl(meta._thumbnail_id, { title }, options);
    const imageUrl = await uploadImage(thumbnail.url, `${post.post_name}-featured`).catch((error) => {
      report.imageFailures.push({ post: title, url: thumbnail.url, error: error.message });
      return thumbnail.url;
    });
    const contentImages = await replaceContentImages(post.post_content || '', post.post_name);
    report.imageFailures.push(...contentImages.failed.map((failure) => ({ post: title, ...failure })));

    const payload = {
      key: createKeyFromTitle(title) || `wpPost${post.ID}`,
      title,
      summary,
      targetKeyword,
      content: contentImages.content,
      slug: slugify(post.post_name || title),
      metaTitle,
      metaKeywords,
      metaDescription,
      image: imageUrl,
      imageAlt: thumbnail.alt || title,
      oldUrl: buildOldUrl(post, options),
      status: post.post_status === 'publish' ? 'published' : 'draft',
      publishedAt: post.post_date_gmt || post.post_date || '',
      categories: taxonomies.categories.map((category) => category.key),
      tags: taxonomies.tags.map((tag) => tag.title),
    };
    payload.seoScore = calculateSeoScore(payload);

    report.posts.push({
      title: payload.title,
      slug: payload.slug,
      oldUrl: payload.oldUrl,
      seoScore: payload.seoScore,
      categories: payload.categories,
      tags: payload.tags,
      contentImages: contentImages.replaced.length,
    });

    if (!dryRun) {
      for (const category of taxonomies.categories) {
        await apiJson('/api/blog-categories', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...category, sortOrder: 0 }),
        });
      }

      await apiJson('/api/blog-posts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  }

  console.log(JSON.stringify(report, null, 2));
};

try {
  if (inspectOnly) {
    await inspectMeta();
  } else {
    await importBlog();
  }
} finally {
  await connection.end();
}
