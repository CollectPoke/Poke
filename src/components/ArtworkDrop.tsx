import { useCallback, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;

export function ArtworkDrop({
  userId,
  onUploaded,
}: {
  userId: string;
  onUploaded: (publicUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file || uploading) return;
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("That file isn't an image. Try a PNG, JPG, GIF or WebP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That image is over 5 MB. Pick a smaller one.");
        return;
      }
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(file);
      });
      setUploading(true);
      try {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("card-art")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("card-art").getPublicUrl(path);
        onUploaded(data.publicUrl);
      } catch {
        setError("Upload failed. Try again.");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [userId, onUploaded, uploading],
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={[
          "flex w-full items-center justify-center rounded-xl border-2 border-dashed transition-colors",
          dragging
            ? "border-poke-blue bg-poke-blue/10"
            : "border-border bg-card hover:border-poke-blue/60",
          preview ? "p-3" : "px-4 py-8",
        ].join(" ")}
      >
        {preview ? (
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Artwork preview"
              className="h-24 w-24 rounded-lg object-contain"
            />
            <div className="text-left">
              <p className="text-sm font-semibold">
                {uploading ? "Uploading…" : "Artwork ready"}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploading ? "One moment." : "Drop another image to replace it."}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-display text-3xl leading-none">+</p>
            <p className="mt-2 text-sm font-semibold">Drag artwork here</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or click to choose — PNG, JPG, GIF or WebP, up to 5 MB
            </p>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1.5 text-xs font-semibold text-poke-red">{error}</p>}
    </div>
  );
}
