import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const RAW_LIMIT = 20 * 1024 * 1024; // accept any image up to 20 MB…
const DOWNSCALE_OVER = 4 * 1024 * 1024; // …but shrink anything over 4 MB before upload
const MAX_EDGE = 1600;

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|avif|svg|heic|heif|tiff?)$/i;

function looksLikeImage(file: File) {
  return file.type.startsWith("image/") || IMAGE_EXT.test(file.name);
}

/** Shrink huge images in the browser so any image uploads cleanly. */
async function shrink(file: File): Promise<{ blob: Blob; type: string }> {
  if (file.size <= DOWNSCALE_OVER) {
    return { blob: file, type: file.type || "image/png" };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9),
  );
  if (!blob) throw new Error("no-encode");
  return { blob, type: "image/webp" };
}

/** PostgREST stores bytea from a "\x…" hex text value. */
function toHex(bytes: Uint8Array): string {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += Array.from(bytes.subarray(i, i + chunk), (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
  }
  return "\\x" + out;
}

export function ArtworkDrop({
  userId,
  onUploaded,
}: {
  userId: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    },
    [],
  );

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file || uploading) return;
      setError(null);
      if (!looksLikeImage(file)) {
        setError("That file isn't an image. Drop a picture instead.");
        return;
      }
      if (file.size > RAW_LIMIT) {
        setError("That image is over 20 MB — too big even for us.");
        return;
      }
      const objUrl = URL.createObjectURL(file);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return objUrl;
      });
      setUploading(true);
      try {
        const { blob, type } = await shrink(file);
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const { data, error: upErr } = await supabase
          .from("artwork")
          .insert({ owner_id: userId, mime: type, data: toHex(bytes) })
          .select("id")
          .single();
        if (upErr) throw upErr;
        onUploaded(`/api/public/artwork/${data.id}`);
      } catch {
        setError("Upload failed. Try again.");
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old);
          return null;
        });
      } finally {
        setUploading(false);
      }
    },
    [userId, onUploaded, uploading],
  );

  return (
    <div>
      <Button
        type="button"
        variant="outline"
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
          "group relative flex aspect-square h-auto w-full whitespace-normal rounded-none border border-dashed p-0 shadow-none transition-colors",
          dragging
            ? "border-foreground bg-muted"
            : "border-border bg-background hover:border-foreground",
        ].join(" ")}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Artwork preview"
              className="absolute inset-0 h-full w-full object-contain p-3"
            />
            <div className="absolute inset-x-0 bottom-0 border-t border-border bg-background/95 px-4 py-3 text-center backdrop-blur">
              <p className="text-xs font-bold uppercase text-foreground">
                {uploading ? "Uploading…" : "Artwork ready"}
              </p>
              <p className="text-xs text-muted-foreground">
                {uploading ? "One moment." : "Drop another image to replace it."}
              </p>
            </div>
          </>
        ) : (
          <div className="px-6 text-center">
            <span className="mx-auto grid size-12 place-items-center border border-foreground text-2xl font-normal transition-colors group-hover:bg-foreground group-hover:text-background">
              +
            </span>
            <p className="mt-4 text-xs font-bold uppercase">Upload artwork</p>
            <p className="mt-2 text-xs text-muted-foreground">Drop an image or click to browse</p>
            <p className="mt-1 text-[10px] uppercase text-muted-foreground/70">
              PNG, JPG, GIF, WebP · 20 MB max
            </p>
          </div>
        )}
      </Button>
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
      {error && <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
