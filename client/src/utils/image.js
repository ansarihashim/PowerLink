export async function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function downscaleImage(dataUrl, max = 256, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

export async function prepareAvatar(file) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('File must be an image');
  if (file.size > 3 * 1024 * 1024) throw new Error('Image must be under 3MB');
  const raw = await fileToDataURL(file);
  const small = await downscaleImage(raw, 256, 0.82);
  return small; // data URL
}
