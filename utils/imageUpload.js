/**
 * Upload image to ImgBB
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                url: data.data.url,
                display_url: data.data.display_url,
                delete_url: data.data.delete_url,
                thumb: data.data.thumb?.url,
                medium: data.data.medium?.url,
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Upload failed',
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Network error during upload',
        };
    }
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @returns {Object} - Validation result
 */
export const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) {
        return {
            valid: false,
            error: 'No file provided.',
        };
    }

    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        };
    }

    return { valid: true };
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Preview URL
 */
export const createImagePreview = (file) => {
    return URL.createObjectURL(file);
};

/**
 * Revoke a preview URL to free memory
 * @param {string} url - The preview URL to revoke
 */
export const revokeImagePreview = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

/**
 * Upload multiple images to ImgBB
 * @param {File[]} files - Array of image files
 * @returns {Promise<Object[]>} - Array of upload results
 */
export const uploadMultipleImages = async (files) => {
    const uploadPromises = files.map(file => uploadImageToImgBB(file));
    return Promise.all(uploadPromises);
};

/**
 * Compress image before upload (basic compression using canvas)
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = (error) => {
                reject(error);
            };
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
