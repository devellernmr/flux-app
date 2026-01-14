/**
 * Extracts dominant colors from an image URL.
 * Uses a canvas to sample pixels and filter out near-white/black/gray colors.
 */
export const extractColorsFromImage = (url: string, count: number = 5): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve([]);

      // Resize for faster processing but enough detail
      canvas.width = 150;
      canvas.height = 150;
      ctx.drawImage(img, 0, 0, 150, 150);

      const imageData = ctx.getImageData(0, 0, 150, 150).data;
      const colorCounts: Record<string, number> = {};

      // Sample every 12th pixel (every 3rd RGBA block)
      for (let i = 0; i < imageData.length; i += 12) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Filter out near-white, near-black, and grays
        const isNearWhite = r > 230 && g > 230 && b > 230;
        const isNearBlack = r < 25 && g < 25 && b < 25;
        const isGray =
          Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15;

        if (isNearWhite || isNearBlack || isGray) continue;

        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
          .toString(16)
          .slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([hex]) => hex);

      resolve(sorted);
    };
    img.onerror = () => resolve([]);
  });
};
