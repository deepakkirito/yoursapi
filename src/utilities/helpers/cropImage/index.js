const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context is not supported");
    }

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    // Convert canvas to Base64
    const base64Image = canvas.toDataURL("image/jpeg"); // Change format if needed
    return base64Image;
  } catch (error) {
    console.error("Error cropping image:", error);
    return null;
  }
};

export default getCroppedImg;

// Utility function to create an image element from a URL
export const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Prevents CORS issues when loading images
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
  });
};
