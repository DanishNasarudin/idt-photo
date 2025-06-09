import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function convertFileToWebP(
  file: File,
  {
    maxSizeInBytes = 1 * 1024 * 1024, // 1 MB
    initialQuality = 0.8,
    minQuality = 0.05,
    qualityStep = 0.05,
    maxWidth = 1920,
    maxHeight = 1080,
  }: {
    maxSizeInBytes?: number;
    initialQuality?: number;
    minQuality?: number;
    qualityStep?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<File> {
  // load image
  const dataURL = await new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? res(reader.result) : rej();
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const image = new Image();
    image.onload = () => res(image);
    image.onerror = () => rej();
    image.src = dataURL;
  });

  // compute resize scale
  const scale = Math.min(
    1,
    maxWidth / img.naturalWidth,
    maxHeight / img.naturalHeight
  );
  const width = Math.floor(img.naturalWidth * scale);
  const height = Math.floor(img.naturalHeight * scale);

  // draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(img, 0, 0, width, height);

  // iteratively reduce quality until under maxSizeInBytes
  let quality = initialQuality;
  let blob: Blob | null = null;
  do {
    blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
        "image/webp",
        quality
      )
    );
    if (blob.size <= maxSizeInBytes || quality <= minQuality) break;
    quality = Math.max(minQuality, quality - qualityStep);
  } while (true);

  // wrap as File
  const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
