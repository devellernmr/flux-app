import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

interface BriefingFileUploaderProps {
  value: string; // JSON string or single URL
  onChange: (value: string) => void;
  projectId: string;
  blockLabel: string;
  disabled?: boolean;
}

export function BriefingFileUploader({
  value,
  onChange,
  projectId,
  blockLabel,
  disabled,
}: BriefingFileUploaderProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  // Parse current files
  let files: string[] = [];
  try {
    if (value) {
      if (value.startsWith("[") || value.startsWith("{")) {
        files = JSON.parse(value);
        if (!Array.isArray(files)) files = [value];
      } else {
        files = [value];
      }
    }
  } catch (e) {
    files = value ? [value] : [];
  }

  const getGroupNameFromLabel = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("logo")) return "Logo";
    if (lowerLabel.includes("referência") || lowerLabel.includes("inspiração"))
      return "Referencias";
    if (lowerLabel.includes("manual") || lowerLabel.includes("brandbook"))
      return "Brandbook";
    if (lowerLabel.includes("foto") || lowerLabel.includes("imagem"))
      return "Imagens";
    return "Assets";
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);

      const newUrls = [...files];

      for (const file of acceptedFiles) {
        try {
          const groupName = getGroupNameFromLabel(blockLabel);
          const fileExt = file.name.split(".").pop();
          const finalFileName = `Client_${groupName}_Briefing_${Date.now()}.${fileExt}`;
          const storagePath = `${projectId}/${Date.now()}_${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("project-files")
            .upload(storagePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("project-files").getPublicUrl(storagePath);

          // Register in database
          await supabase.from("files").insert({
            project_id: projectId,
            name: finalFileName,
            url: publicUrl,
            status: "pending",
          });

          newUrls.push(publicUrl);
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(
            `${t("public_briefing.toast.upload_error")}: ${file.name}`,
          );
        }
      }

      onChange(JSON.stringify(newUrls));
      setUploading(false);
      toast.success(t("public_briefing.toast.file_uploaded"));
    },
    [files, projectId, blockLabel, onChange, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/zip": [],
      "application/x-zip-compressed": [],
    },
  });

  const removeFile = (index: number) => {
    const newUrls = files.filter((_, i) => i !== index);
    onChange(newUrls.length > 0 ? JSON.stringify(newUrls) : "");
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  };

  return (
    <div className="space-y-4">
      {/* List of Files */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {files.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative flex items-center gap-3 p-3 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all backdrop-blur-sm"
            >
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-white/5">
                {isImage(url) ? (
                  <img
                    src={url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="h-6 w-6 text-zinc-500" />
                )}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">
                  {isImage(url) ? "Imagem" : "Documento"}
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {url.split("/").pop()?.split("_").slice(1).join("_") ||
                    "Arquivo"}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute right-2 p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5 scale-[0.99]"
              : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/30"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
            {uploading ? (
              <Loader2 className="h-7 w-7 text-blue-500 animate-spin" />
            ) : (
              <UploadCloud
                className={`h-7 w-7 transition-colors ${
                  isDragActive ? "text-blue-400" : "text-zinc-500"
                }`}
              />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              {uploading
                ? t("public_briefing.form.uploading")
                : isDragActive
                  ? "Solte para enviar"
                  : t("public_briefing.form.upload_reference")}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              {t("public_briefing.form.upload_hint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
