export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  preserveTransparency?: boolean;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
};

const loadImageElement = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao processar a imagem.'));
    img.src = src;
  });
};

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxDimension = 1600,
    quality = 0.82,
    preserveTransparency = false,
  } = options;

  // Keep SVG and very small icons untouched
  if (file.type === 'image/svg+xml' || file.size < 40 * 1024) {
    return readFileAsDataUrl(file);
  }

  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(file);
    const img = await loadImageElement(objectUrl);

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (!width || !height) {
      return readFileAsDataUrl(file);
    }

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return readFileAsDataUrl(file);
    }

    const isPngOrWebp = file.type === 'image/png' || file.type === 'image/webp';
    const outputType =
      preserveTransparency && isPngOrWebp ? 'image/png' : 'image/jpeg';

    if (outputType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const compressedDataUrl =
      outputType === 'image/png'
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', quality);

    // If original small image was somehow smaller, keep original
    if (file.size < 180 * 1024 && scale === 1) {
      const originalDataUrl = await readFileAsDataUrl(file);
      return originalDataUrl.length < compressedDataUrl.length
        ? originalDataUrl
        : compressedDataUrl;
    }

    return compressedDataUrl;
  } catch {
    return readFileAsDataUrl(file);
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
