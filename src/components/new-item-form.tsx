"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createItem } from "@/lib/items";

export function NewItemForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "");
    if (!title.trim()) {
      setError("Give your item a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const item = createItem(title, String(data.get("body") ?? ""));
      router.push(`/items/${item.id}`);
    } catch {
      setError(
        "Could not save your item. Check that browser storage is available and has free space. Your text is still here.",
      );
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="note-form">
      <label htmlFor="title">
        Title <span>(required)</span>
      </label>
      <input
        id="title"
        name="title"
        required
        maxLength={120}
        autoFocus
        placeholder="What’s on your mind?"
      />
      <label htmlFor="body">
        Notes <span>(optional)</span>
      </label>
      <textarea
        id="body"
        name="body"
        maxLength={10000}
        rows={10}
        placeholder="Make a little space for the details…"
      />
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <button disabled={saving} type="submit">
          {saving ? "Saving…" : "Save item"}
        </button>
        <Link href="/">Cancel</Link>
      </div>
    </form>
  );
}
