import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs.filter((arg) => !arg.includes('=')));
const getArg = (name, fallback = '') => {
  const prefix = `${name}=`;
  const arg = rawArgs.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const sqlFile = getArg('--sql', process.env.WP_SQL_DUMP || '');
const uploadsRoot = getArg('--uploads', process.env.WP_UPLOADS_ROOT || '');
const tablePrefixArg = getArg('--prefix', process.env.WP_TABLE_PREFIX || '');
const apiBase = (process.env.HHS_API_BASE || 'https://hhsotomatikkapi.com').replace(/\/$/, '');
const oldSiteUrl = (getArg('--old-site-url', process.env.WP_OLD_SITE_URL || '') || '').replace(/\/$/, '');
const previewOnly = args.has('--preview');
const previewOutput = getArg('--preview-output', 'public/wp-import-preview.json');
const previewAssetsDir = getArg('--preview-assets', 'public/wp-import-assets');
const dryRun = previewOnly || args.has('--dry-run') || !args.has('--import');
const includeDrafts = args.has('--include-drafts');
const limit = Number(getArg('--limit', '0'));
const inspectOnly = args.has('--inspect');

const targetTables = ['options', 'posts', 'postmeta', 'terms', 'term_taxonomy', 'term_relationships'];
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const previewAssetUrlPrefix = `/${previewAssetsDir.replace(/^public\/?/, '').replace(/^\/+|\/+$/g, '')}`;

if (!sqlFile) {
  console.error('SQL dump yolu gerekli. Ornek: --sql=/path/wordpress.sql');
  process.exit(1);
}

if (!dryRun && !process.env.HHS_ADMIN_TOKEN) {
  console.error('Gercek import icin HHS_ADMIN_TOKEN gerekli.');
  process.exit(1);
}

const authHeaders = () => ({
  authorization: `Bearer ${process.env.HHS_ADMIN_TOKEN}`,
});

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

const parseColumns = (value) => value.split(',').map((column) => column.trim().replace(/^`|`$/g, ''));

const findStatementEnd = (sql, start) => {
  let inString = false;
  let escaped = false;

  for (let index = start; index < sql.length; index += 1) {
    const char = sql[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === "'") {
        if (sql[index + 1] === "'") {
          index += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === ';') {
      return index;
    }
  }

  return -1;
};

const getTargetBaseTable = (tableName) => {
  for (const baseTable of targetTables) {
    if (tablePrefixArg && tableName === `${tablePrefixArg}${baseTable}`) {
      return baseTable;
    }

    if (!tablePrefixArg && (tableName === baseTable || tableName.endsWith(`_${baseTable}`))) {
      return baseTable;
    }
  }

  return '';
};

const unescapeSqlString = (value) => {
  let result = '';

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '\\') {
      const next = value[index + 1];
      index += 1;

      if (next === 'n') result += '\n';
      else if (next === 'r') result += '\r';
      else if (next === 't') result += '\t';
      else if (next === 'b') result += '\b';
      else if (next === '0') result += '\0';
      else if (next === 'Z') result += '\x1a';
      else result += next ?? '';
    } else if (char === "'" && value[index + 1] === "'") {
      result += "'";
      index += 1;
    } else {
      result += char;
    }
  }

  return result;
};

const parseSqlValue = (rawValue) => {
  const value = rawValue.trim();

  if (/^NULL$/i.test(value)) {
    return null;
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return unescapeSqlString(value.slice(1, -1));
  }

  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
};

const splitSqlValues = (rowText) => {
  const values = [];
  let inString = false;
  let escaped = false;
  let start = 0;

  for (let index = 0; index < rowText.length; index += 1) {
    const char = rowText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === "'") {
        if (rowText[index + 1] === "'") {
          index += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === ',') {
      values.push(rowText.slice(start, index));
      start = index + 1;
    }
  }

  values.push(rowText.slice(start));
  return values.map(parseSqlValue);
};

const parseRows = (valuesText, columns) => {
  const rows = [];
  let inString = false;
  let escaped = false;
  let depth = 0;
  let rowStart = -1;

  for (let index = 0; index < valuesText.length; index += 1) {
    const char = valuesText[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === "'") {
        if (valuesText[index + 1] === "'") {
          index += 1;
        } else {
          inString = false;
        }
      }
      continue;
    }

    if (char === "'") {
      inString = true;
    } else if (char === '(') {
      if (depth === 0) {
        rowStart = index + 1;
      }
      depth += 1;
    } else if (char === ')') {
      depth -= 1;

      if (depth === 0 && rowStart >= 0) {
        const values = splitSqlValues(valuesText.slice(rowStart, index));
        rows.push(Object.fromEntries(columns.map((column, columnIndex) => [column, values[columnIndex] ?? null])));
        rowStart = -1;
      }
    }
  }

  return rows;
};

const parseWordPressDump = async (filePath) => {
  const sql = await fs.readFile(filePath, 'utf8');
  const tables = Object.fromEntries(targetTables.map((table) => [table, []]));
  const detectedPrefixes = new Set();
  let cursor = 0;

  while (cursor < sql.length) {
    const insertIndex = sql.indexOf('INSERT INTO `', cursor);

    if (insertIndex === -1) {
      break;
    }

    const tableStart = insertIndex + 'INSERT INTO `'.length;
    const tableEnd = sql.indexOf('`', tableStart);
    const tableName = sql.slice(tableStart, tableEnd);
    const baseTable = getTargetBaseTable(tableName);
    const statementEnd = findStatementEnd(sql, tableEnd);

    if (statementEnd === -1) {
      break;
    }

    if (baseTable) {
      detectedPrefixes.add(tableName.slice(0, -baseTable.length));
      const statement = sql.slice(insertIndex, statementEnd);
      const match = statement.match(/^INSERT INTO `[^`]+`\s*\(([\s\S]*?)\)\s*VALUES\s*/i);

      if (match) {
        const columns = parseColumns(match[1]);
        const valuesText = statement.slice(match[0].length);
        tables[baseTable].push(...parseRows(valuesText, columns));
      }
    }

    cursor = statementEnd + 1;
  }

  return { tables, detectedPrefixes: [...detectedPrefixes] };
};

const buildImageIndex = async (rootPath) => {
  const index = new Map();

  if (!rootPath) {
    return index;
  }

  const walk = async (directory) => {
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) {
        const current = index.get(entry.name);
        index.set(entry.name, current ? [...current, entryPath] : [entryPath]);
      }
    }
  };

  await walk(rootPath);
  return index;
};

const fileExists = async (filePath) => {
  if (!filePath) {
    return false;
  }

  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
};

const decodePathComponentSafe = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const toUploadRelativePath = (reference = '') => {
  const withoutQuery = String(reference).replaceAll('\\/', '/').split(/[?#]/)[0];
  const decoded = decodePathComponentSafe(withoutQuery);
  const marker = '/wp-content/uploads/';
  const markerIndex = decoded.indexOf(marker);

  if (markerIndex >= 0) {
    return decoded.slice(markerIndex + marker.length).replace(/^\/+/, '');
  }

  if (/^\d{4}\//.test(decoded)) {
    return decoded.replace(/^\/+/, '');
  }

  return '';
};

const resolveLocalUpload = async (reference, imageIndex) => {
  const relativePath = toUploadRelativePath(reference);

  if (uploadsRoot && relativePath) {
    const exactPath = path.join(uploadsRoot, relativePath);

    if (await fileExists(exactPath)) {
      return { localPath: exactPath, relativePath, matchedBy: 'relative' };
    }
  }

  const basename = path.basename(relativePath || String(reference).split(/[?#]/)[0]);
  const candidates = imageIndex.get(basename) ?? [];

  if (candidates.length === 1) {
    return { localPath: candidates[0], relativePath, matchedBy: 'basename' };
  }

  return { localPath: '', relativePath, matchedBy: candidates.length > 1 ? 'ambiguous' : 'missing' };
};

const toSafeAssetName = (value = '') => slugify(value) || value.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

const uploadLocalImage = async (localPath, name, fallbackUrl = '') => {
  if (!localPath || dryRun) {
    return fallbackUrl;
  }

  const input = await fs.readFile(localPath);
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
    throw new Error(`R2 upload basarisiz: ${localPath}`);
  }

  return data.url.startsWith('/api/') ? `${apiBase}${data.url}` : data.url;
};

const createPreviewImage = async (localPath, name) => {
  if (!localPath || !previewOnly) {
    return '';
  }

  const safeName = toSafeAssetName(name) || 'wp-import-image';
  const outputPath = path.join(previewAssetsDir, `${safeName}.webp`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await sharp(localPath)
      .resize({ width: 1000, height: 750, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(outputPath);
  } catch (error) {
    console.warn(`Preview gorsel uretilemedi: ${localPath} (${error.message})`);
    return '';
  }

  return `${previewAssetUrlPrefix}/${path.basename(outputPath)}`;
};

const apiJson = async (apiPath, init = {}) => {
  const response = await fetch(`${apiBase}${apiPath}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`${apiPath} failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
};

const metaValue = (meta, keys, fallback = '') => {
  for (const key of keys) {
    if (meta[key]) {
      return decodeEntities(String(meta[key]));
    }
  }

  return fallback;
};

const buildMetaMap = (postmetaRows) => {
  const metaMap = new Map();

  postmetaRows.forEach((row) => {
    const postId = String(row.post_id);
    const postMeta = metaMap.get(postId) || {};
    postMeta[row.meta_key] = row.meta_value ?? '';
    metaMap.set(postId, postMeta);
  });

  return metaMap;
};

const buildTaxonomyMap = (tables) => {
  const termsById = new Map(tables.terms.map((term) => [String(term.term_id), term]));
  const taxonomyById = new Map(tables.term_taxonomy.map((taxonomy) => [String(taxonomy.term_taxonomy_id), taxonomy]));
  const taxonomyMap = new Map();

  tables.term_relationships.forEach((relationship) => {
    const taxonomy = taxonomyById.get(String(relationship.term_taxonomy_id));
    const term = taxonomy ? termsById.get(String(taxonomy.term_id)) : null;

    if (!taxonomy || !term || !['category', 'post_tag'].includes(taxonomy.taxonomy)) {
      return;
    }

    const objectId = String(relationship.object_id);
    const current = taxonomyMap.get(objectId) || { categories: [], tags: [] };
    const item = {
      key: slugify(term.slug || term.name),
      title: decodeEntities(term.name || ''),
      slug: slugify(term.slug || term.name),
      description: stripHtml(decodeEntities(taxonomy.description || '')),
    };

    if (taxonomy.taxonomy === 'category') {
      current.categories.push(item);
    } else {
      current.tags.push(item);
    }

    taxonomyMap.set(objectId, current);
  });

  return taxonomyMap;
};

const buildOptions = (optionsRows) =>
  Object.fromEntries(optionsRows.map((row) => [row.option_name, row.option_value ?? '']));

const buildAttachmentInfo = async ({ attachmentId, meta, options, postsById, metaMap, imageIndex }) => {
  if (!attachmentId) {
    return { url: '', alt: '', localPath: '', relativePath: '', matchedBy: 'missing' };
  }

  const attachment = postsById.get(String(attachmentId));
  const attachmentMeta = metaMap.get(String(attachmentId)) || {};
  const attachedFile = attachmentMeta._wp_attached_file || '';
  const baseUrl = options.siteurl || options.home || oldSiteUrl;
  const uploadUrl = attachedFile ? `${String(baseUrl).replace(/\/$/, '')}/wp-content/uploads/${attachedFile}` : attachment?.guid || '';
  const resolved = await resolveLocalUpload(attachedFile || uploadUrl, imageIndex);

  return {
    url: uploadUrl,
    alt: attachmentMeta._wp_attachment_image_alt || attachment?.post_title || meta.title || '',
    ...resolved,
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
  let urlPath = options.permalink_structure || '/%postname%/';

  Object.entries(replacements).forEach(([token, value]) => {
    urlPath = urlPath.replaceAll(token, value ?? '');
  });

  if (!urlPath.startsWith('/')) {
    urlPath = `/${urlPath}`;
  }

  return `${base}${urlPath}`;
};

const replaceContentImages = async (content, postName, imageIndex) => {
  const matches = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  let nextContent = content;
  const replaced = [];
  const failed = [];

  for (const match of matches) {
    const sourceUrl = match[1];

    if (!sourceUrl.includes('/wp-content/uploads/') && !/^\d{4}\//.test(sourceUrl)) {
      continue;
    }

    const resolved = await resolveLocalUpload(sourceUrl, imageIndex);

    if (!resolved.localPath) {
      failed.push({ sourceUrl, ...resolved });
      continue;
    }

    try {
      const uploadedUrl = await uploadLocalImage(resolved.localPath, `${postName}-content`, sourceUrl);
      nextContent = nextContent.replaceAll(sourceUrl, uploadedUrl);
      replaced.push({ sourceUrl, uploadedUrl, ...resolved });
    } catch (error) {
      failed.push({ sourceUrl, error: error.message, ...resolved });
    }
  }

  return { content: nextContent, replaced, failed };
};

const inspectDump = ({ tables, detectedPrefixes }) => {
  const postRows = tables.posts.filter((post) => post.post_type === 'post');
  const publishedRows = postRows.filter((post) => post.post_status === 'publish');
  const attachmentRows = tables.posts.filter((post) => post.post_type === 'attachment');

  console.log(
    JSON.stringify(
      {
        dryRun,
        detectedPrefixes,
        rows: Object.fromEntries(Object.entries(tables).map(([table, rows]) => [table, rows.length])),
        posts: {
          total: postRows.length,
          published: publishedRows.length,
          draft: postRows.filter((post) => post.post_status === 'draft').length,
        },
        attachments: attachmentRows.length,
      },
      null,
      2,
    ),
  );
};

const importBlog = async () => {
  const parsed = await parseWordPressDump(sqlFile);
  const { tables, detectedPrefixes } = parsed;

  if (inspectOnly) {
    inspectDump(parsed);
    return;
  }

  const options = buildOptions(tables.options);
  const metaMap = buildMetaMap(tables.postmeta);
  const taxonomyMap = buildTaxonomyMap(tables);
  const postsById = new Map(tables.posts.map((post) => [String(post.ID), post]));
  const imageIndex = await buildImageIndex(uploadsRoot);
  const statusSet = includeDrafts ? new Set(['publish', 'draft']) : new Set(['publish']);
  const posts = tables.posts
    .filter((post) => post.post_type === 'post' && statusSet.has(post.post_status))
    .sort((firstPost, secondPost) => String(firstPost.post_date).localeCompare(String(secondPost.post_date)));
  const limitedPosts = limit > 0 ? posts.slice(0, limit) : posts;

  if (previewOnly) {
    await fs.rm(previewAssetsDir, { recursive: true, force: true });
  }

  const report = {
    dryRun,
    preview: previewOnly,
    sqlFile,
    uploadsRoot,
    detectedPrefixes,
    totals: {
      posts: limitedPosts.length,
      availableImagesByName: imageIndex.size,
    },
    posts: [],
    imageFailures: [],
  };
  const previewPosts = [];

  for (const post of limitedPosts) {
    const meta = metaMap.get(String(post.ID)) || {};
    const taxonomies = taxonomyMap.get(String(post.ID)) || { categories: [], tags: [] };
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
    const taxonomyKeywords = [...taxonomies.categories, ...taxonomies.tags].map((item) => item.title).filter(Boolean).join(', ');
    const metaKeywords = metaValue(
      meta,
      ['_yoast_wpseo_metakeywords'],
      taxonomyKeywords,
    ) || targetKeyword || title;
    const thumbnail = await buildAttachmentInfo({
      attachmentId: meta._thumbnail_id,
      meta: { title },
      options,
      postsById,
      metaMap,
      imageIndex,
    });
    const safePostName = toSafeAssetName(post.post_name || title || `wp-post-${post.ID}`);
    let imageUrl = thumbnail.url;
    const featuredPreviewUrl = await createPreviewImage(thumbnail.localPath, `${safePostName}-featured`);

    if (thumbnail.localPath) {
      imageUrl = await uploadLocalImage(thumbnail.localPath, `${safePostName}-featured`, thumbnail.url).catch((error) => {
        report.imageFailures.push({ post: title, url: thumbnail.url, localPath: thumbnail.localPath, error: error.message });
        return thumbnail.url;
      });
    } else if (thumbnail.url) {
      report.imageFailures.push({ post: title, url: thumbnail.url, relativePath: thumbnail.relativePath, matchedBy: thumbnail.matchedBy });
    }

    const contentImages = await replaceContentImages(post.post_content || '', safePostName, imageIndex);
    const previewContentImages = await Promise.all(
      contentImages.replaced.map(async (image, index) => ({
        sourceUrl: image.sourceUrl,
        previewUrl: await createPreviewImage(image.localPath, `${safePostName}-content-${index + 1}`),
        relativePath: image.relativePath,
        matchedBy: image.matchedBy,
      })),
    );
    const previewContent = previewContentImages.reduce(
      (content, image) => (image.previewUrl ? content.replaceAll(image.sourceUrl, image.previewUrl) : content),
      post.post_content || '',
    );
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
      featuredImage: {
        sourceUrl: thumbnail.url,
        localPath: thumbnail.localPath,
        matchedBy: thumbnail.matchedBy,
      },
      contentImages: contentImages.replaced.length,
    });
    previewPosts.push({
      id: String(post.ID),
      payload,
      categories: taxonomies.categories,
      preview: {
        summaryText: plainContent.slice(0, 260),
        content: previewContent,
        featuredImage: {
          sourceUrl: thumbnail.url,
          previewUrl: featuredPreviewUrl,
          relativePath: thumbnail.relativePath,
          matchedBy: thumbnail.matchedBy,
        },
        contentImages: previewContentImages,
        imageFailures: contentImages.failed,
      },
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

  if (previewOnly) {
    await fs.mkdir(path.dirname(previewOutput), { recursive: true });
    await fs.writeFile(
      previewOutput,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          source: {
            sqlFile,
            uploadsRoot,
            detectedPrefixes,
          },
          totals: {
            posts: limitedPosts.length,
            availableImagesByName: imageIndex.size,
            imageFailures: report.imageFailures.length,
          },
          posts: previewPosts,
          imageFailures: report.imageFailures,
        },
        null,
        2,
      ),
    );
    console.log(`Preview paketi olusturuldu: ${previewOutput}`);
    console.log(`Preview gorselleri: ${previewAssetsDir}`);
    console.log(JSON.stringify({ posts: previewPosts.length, imageFailures: report.imageFailures.length }, null, 2));
    return;
  }

  console.log(JSON.stringify(report, null, 2));
};

await importBlog();
