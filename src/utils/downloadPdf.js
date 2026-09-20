import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFS from 'expo-file-system/legacy';
import { fetch as expoFetch } from 'expo/fetch';
import * as Sharing from 'expo-sharing';
import { openWebUrl } from './openWebUrl';

function safePdfFileName(title, url) {
  const fromUrl = decodeURIComponent(String(url || '').split('/').pop()?.split('?')[0] || '');
  if (/\.pdf$/i.test(fromUrl)) return fromUrl;

  const base = String(title || 'document')
    .replace(/[^\w\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);

  return `${base || 'document'}.pdf`;
}

async function shareLocalPdf(uri, title) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: title || 'Download PDF',
    UTI: 'com.adobe.pdf',
  });
}

/** Most reliable path on current Expo/Android builds. */
async function downloadWithLegacy(url, folder, fileName) {
  const base = `${LegacyFS.cacheDirectory}${folder}/`;
  await LegacyFS.makeDirectoryAsync(base, { intermediates: true });
  const dest = `${base}${fileName}`;
  const result = await LegacyFS.downloadAsync(url, dest, {
    headers: {
      Accept: 'application/pdf,*/*',
      'User-Agent': 'BridgeAcademy/1.0 (Expo)',
    },
  });
  if (result.status !== 200) {
    throw new Error(`Download failed (${result.status})`);
  }
  return result.uri;
}

async function downloadWithFileApi(url, folder, fileName) {
  const dir = new Directory(Paths.cache, folder);
  dir.create({ intermediates: true, idempotent: true });

  // Pass a Directory (SDK-recommended). Filename comes from the URL.
  const downloaded = await File.downloadFileAsync(url, dir, {
    idempotent: true,
    headers: {
      Accept: 'application/pdf,*/*',
      'User-Agent': 'BridgeAcademy/1.0 (Expo)',
    },
  });

  if (!downloaded?.uri) {
    throw new Error('Download produced no file');
  }

  try {
    const preferred = new File(dir, fileName);
    if (preferred.uri !== downloaded.uri) {
      if (preferred.exists) preferred.delete();
      downloaded.copy(preferred);
      return preferred.uri;
    }
  } catch {
    // Keep the downloaded URI if rename/copy fails.
  }

  return downloaded.uri;
}

async function downloadWithExpoFetch(url, folder, fileName) {
  const dir = new Directory(Paths.cache, folder);
  dir.create({ intermediates: true, idempotent: true });

  const response = await expoFetch(url, {
    headers: {
      Accept: 'application/pdf,*/*',
      'User-Agent': 'BridgeAcademy/1.0 (Expo)',
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const file = new File(dir, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(await response.bytes());
  return file.uri;
}

/**
 * Download a remote PDF into app storage, then open the native share sheet
 * so the user can save it to Files / Downloads / Drive.
 * Falls back to opening the PDF in the browser if native download fails.
 */
export async function downloadAndSharePdf(url, { title, folder = 'downloads' } = {}) {
  if (!url) throw new Error('Missing PDF url');

  const fileName = safePdfFileName(title, url);
  let lastError = null;

  for (const strategy of [downloadWithLegacy, downloadWithFileApi, downloadWithExpoFetch]) {
    try {
      const uri = await strategy(url, folder, fileName);
      await shareLocalPdf(uri, title);
      return uri;
    } catch (error) {
      lastError = error;
    }
  }

  // Last resort: open in browser so the user can still save the PDF.
  try {
    await openWebUrl(url);
    return url;
  } catch {
    throw lastError || new Error('Could not download PDF');
  }
}
