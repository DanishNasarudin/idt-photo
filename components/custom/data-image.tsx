"use client";
import { convertFileToWebP } from "@/lib/utils";
import equal from "fast-deep-equal";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import TooltipWrapper from "./tooltip-wrapper";

type Props = {
  value?: PreviewFile[];
  onValueChange?: (newValue: PreviewFile[]) => void;
};

export interface PreviewFile extends File {
  preview: string;
}

export default function DataImage({
  value = [],
  onValueChange = () => {},
}: Props) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewFile[]>(value || []);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (!equal(previews, value)) setPreviews(value);
  }, [value]);

  const onDrop = useCallback(
    async (incomingFiles: File[]) => {
      const existingKeys = new Set(previews.map((f) => f.name + f.size));
      const uniqueFiles = incomingFiles.filter(
        (file) => !existingKeys.has(file.name + file.size)
      );
      if (uniqueFiles.length === 0) return;

      setConverting(true);
      try {
        const converted: File[] = await Promise.all(
          uniqueFiles.map((file) => convertFileToWebP(file))
        );

        const newPreviewFiles: PreviewFile[] = converted.map((file) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        );

        const updated = [...previews, ...newPreviewFiles];
        setPreviews(updated);

        if (hiddenInputRef.current) {
          const dt = new DataTransfer();
          updated.forEach((file) => dt.items.add(file));
          hiddenInputRef.current.files = dt.files;
          hiddenInputRef.current.setCustomValidity("");
        }
      } finally {
        setConverting(false);
      }
    },
    [previews]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    noClick: true,
    noKeyboard: true,
  });

  useEffect(() => {
    onValueChange(previews);
    return () => {
      previews.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [previews]);

  const handleRemoveImage = (imageName: string) => {
    setPreviews((prev) => {
      const filtered = prev.filter((item) => item.name !== imageName);

      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer();
        filtered.forEach((file) => dataTransfer.items.add(file));
        hiddenInputRef.current.files = dataTransfer.files;
        if (dataTransfer.files.length === 0) {
          hiddenInputRef.current.setCustomValidity(
            "Please select at least one image to upload."
          );
        }
      }
      return filtered;
    });
  };

  return (
    <div
      {...getRootProps()}
      className="relative bg-card w-full p-8 rounded-lg border-dashed border-border border-[2px] min-h-64 flex items-center select-none"
    >
      <input
        type="file"
        name={"images"}
        required
        style={{ opacity: 0 }}
        ref={hiddenInputRef}
        className="absolute pointer-events-none top-[50%] right-[50%] translate-x-[50%] translate-y-[-50%]"
        onInvalid={(e: React.FormEvent<HTMLInputElement>) => {
          const target = e.target as HTMLInputElement;
          target.setCustomValidity(
            "Please select at least one image to upload."
          );
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            target.setCustomValidity("");
          }
        }}
      />
      <input {...getInputProps()} className="hidden" />
      {previews.length === 0 ? (
        !converting && (
          <div className="flex flex-col items-center w-full gap-2">
            <p className="text-center text-nowrap select-none cursor-default">
              Drop images here
            </p>
            <Button
              variant={"outline"}
              size={"sm"}
              className="max-w-max"
              onClick={() => open()}
            >
              Bulk Select
            </Button>
          </div>
        )
      ) : (
        <div className="w-full grid grid-cols-3 gap-4">
          {previews.map((file: PreviewFile) => (
            <div
              key={file.name + file.size}
              className="border p-2 rounded-lg relative space-y-2"
            >
              <img
                src={file.preview}
                alt={file.name}
                className="w-full h-auto object-cover rounded-lg aspect-square"
                draggable={false}
              />
              <TooltipWrapper content={file.name}>
                <p className="truncate w-full cursor-default">{file.name}</p>
              </TooltipWrapper>
              <Button
                variant={"outline"}
                size={"icon"}
                className="h-8 w-8 absolute top-0 right-0 translate-x-[30%] translate-y-[-30%] z-[5] !bg-card hover:!bg-destructive"
                onClick={() => handleRemoveImage(file.name)}
              >
                <X />
              </Button>
            </div>
          ))}
          <button
            className="w-full aspect-square rounded-lg border-border border-[1px] flex justify-center items-center flex-col text-foreground/60 text-center cursor-pointer"
            onClick={open}
          >
            <Plus />
            Add more
            <br />
            images
          </button>
        </div>
      )}
      {previews.length > 0 && (
        <TooltipWrapper content="Delete all images" side="right">
          <Button
            variant={"destructive"}
            size={"icon"}
            className="absolute top-0 right-0 translate-x-[140%]"
            onClick={() => {
              setPreviews([]);
              if (hiddenInputRef.current) {
                hiddenInputRef.current.value = "";
                hiddenInputRef.current.setCustomValidity(
                  "Please select at least one image to upload."
                );
              }
            }}
          >
            <Trash2 />
          </Button>
        </TooltipWrapper>
      )}
      {converting && (
        <div className="flex flex-col items-center w-full gap-2">
          <Loader2 className="animate-spin" />
          <p>Converting image to webp</p>
        </div>
      )}
    </div>
  );
}
