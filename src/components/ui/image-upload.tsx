"use client";

import { useImageUpload } from "@/components/hooks/use-image-upload";
import { ImagePlus, Upload, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export function ImageUpload() {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url) => console.log("Uploaded image URL:", url),
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const fakeEvent = {
          target: { files: [file] },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange],
  );

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-black/10 bg-white/50 transition-colors hover:bg-white/80",
            isDragging && "border-blue-400/50 bg-blue-50/30",
          )}
        >
          <div className="rounded-full bg-white p-3 shadow-sm border border-black/5">
            <ImagePlus className="h-5 w-5 text-black/40" />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-black/60">Click to upload</p>
            <p className="text-[10px] text-black/30">or drag and drop</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-40 overflow-hidden rounded-xl border border-black/5">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={handleThumbnailClick}
                className="h-9 w-9 rounded-lg bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-all"
              >
                <Upload className="h-4 w-4 text-black/70" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="h-9 w-9 rounded-lg bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition-all"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-xs text-black/40">
              <span className="truncate">{fileName}</span>
              <button
                type="button"
                onClick={handleRemove}
                className="ml-auto rounded-full p-1 hover:bg-black/5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
