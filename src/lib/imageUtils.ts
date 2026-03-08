
import imageCompression from 'browser-image-compression';

export async function compressAndConvertToWebP(file: File): Promise<File> {
  // Validate file type
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
    throw new Error('Format file tidak didukung. Harap gunakan JPG, PNG, atau WEBP.');
  }

  const options = {
    maxSizeMB: 0.5, // Max 500KB
    maxWidthOrHeight: 1920, // Max dimension 1920px
    useWebWorker: true,
    fileType: 'image/webp', // Force convert to WebP
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // Create new File object with .webp extension
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
    
    return new File([compressedBlob], newFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Gagal memproses gambar. Silakan coba lagi.');
  }
}
