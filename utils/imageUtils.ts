
/**
 * Processes an image file (resize and compress).
 * 
 * @param file - The input File object.
 * @param maxWidth - Maximum width (default 500).
 * @param maxHeight - Maximum height (default 500).
 * @param quality - JPEG quality (0 to 1), ignored for PNG (default 0.8).
 * @param format - Output format ('image/jpeg' or 'image/png').
 * @returns Promise<Blob> - The processed image blob.
 */
export const processImage = (
    file: File,
    maxWidth: number = 500,
    maxHeight: number = 500,
    quality: number = 0.8,
    format: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // Draw image
                ctx.clearRect(0, 0, width, height); // Clear for transparency
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log(`[ImageProcess] Success. Type: ${blob.type}, Size: ${blob.size}, Format: ${format}`);
                            resolve(blob);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    format,
                    format === 'image/jpeg' ? quality : undefined
                );
            };

            img.onerror = (err) => reject(new Error('Failed to load image'));
        };

        reader.onerror = (err) => reject(new Error('Failed to read file'));
    });
};

/**
 * Validates file size and type.
 */
export const validateImage = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/jpg', 'image/webp'];

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Formato de arquivo inválido. Apenas JPG, PNG e SVG.' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `Arquivo muito grande. Máximo de ${maxSizeMB}MB.` };
    }

    return { valid: true };
};
