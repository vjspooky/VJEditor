import { useState } from "react";
import { MediaAsset } from "../models/media";
import { saveMediaAsset } from "../store/mediaStore";

export function useMediaUpload(onSuccess?: (asset: MediaAsset) => void) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const type = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "image";

      const objectUrl = URL.createObjectURL(file);
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        url: objectUrl,
        size: file.size,
        createdAt: new Date().toISOString(),
      };

      saveMediaAsset(asset);
      if (onSuccess) onSuccess(asset);
      return asset;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}
