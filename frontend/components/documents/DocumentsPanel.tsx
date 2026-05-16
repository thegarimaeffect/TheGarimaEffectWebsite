"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Document, DocumentKind } from "@/lib/supabase/database.types";

function fmtSize(n: number | null): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPanel({
  title,
  hint,
  kind,
  brandId,
  campaignId,
  documents,
  canUpload,
}: {
  title: string;
  hint: string;
  kind: DocumentKind;
  brandId: string;
  campaignId?: string | null;
  documents: Document[];
  canUpload: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("brand_id", brandId);
      fd.append("kind", kind);
      if (campaignId) fd.append("campaign_id", campaignId);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "upload failed");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function download(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/documents/${id}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "could not open");
      window.open(j.url, "_blank", "noopener");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this document?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "delete failed");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="glass p-7">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3
            className="font-bold mb-1"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 26,
              color: "var(--color-text-deep)",
            }}
          >
            {title}
          </h3>
          <p
            className="text-[12px] italic"
            style={{ color: "var(--color-text-muted)" }}
          >
            {hint}
          </p>
        </div>
        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={onPick}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="cta-solid"
              style={{ padding: "12px 22px", fontSize: 11 }}
            >
              {uploading ? "Uploading…" : "+ Upload"}
            </button>
          </>
        )}
      </div>

      {error && (
        <p
          className="text-[12px] px-3 py-2 rounded-xl mb-4"
          style={{
            background: "rgba(232,84,122,0.1)",
            color: "#c23b68",
            border: "1px solid rgba(232,84,122,0.3)",
          }}
        >
          ⚠ {error}
        </p>
      )}

      <div className="space-y-2">
        {documents.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(232,84,122,0.16)",
            }}
          >
            <span className="text-[18px]">📄</span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-semibold truncate"
                style={{ color: "var(--color-text-deep)" }}
              >
                {d.name}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {fmtSize(d.file_size)} · {new Date(d.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => download(d.id)}
              disabled={busyId === d.id}
              className="text-[11px] tracking-[0.2em] uppercase font-bold"
              style={{ color: "#e8547a" }}
            >
              {busyId === d.id ? "…" : "Open"}
            </button>
            <button
              onClick={() => remove(d.id)}
              disabled={busyId === d.id}
              className="text-[11px] tracking-[0.2em] uppercase font-bold opacity-60 hover:opacity-100"
              style={{ color: "#c23b68" }}
            >
              ✕
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p
            className="text-[13px] italic py-6 text-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            Nothing here yet.
          </p>
        )}
      </div>
    </div>
  );
}
