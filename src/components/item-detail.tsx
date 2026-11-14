"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteItem } from "@/lib/items";
import { useItems } from "@/lib/use-items";

export function ItemDetail({ id }: { id: string }) {
  const router = useRouter();
  const { items, loading, error } = useItems();
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const item = items.find((entry) => entry.id === id);
  function remove() {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      deleteItem(id);
      setDeleting(true);
      router.push("/");
    } catch {
      setDeleteError(
        "Could not delete this item. Check your browser storage and try again.",
      );
    }
  }
  if (loading || deleting)
    return (
      <p role="status">
        {deleting ? "Returning to your items…" : "Loading your item…"}
      </p>
    );
  if (error)
    return (
      <p role="alert">
        Your items could not be read. Allow local storage in your browser and
        reload.
      </p>
    );
  if (!item)
    return (
      <div className="empty">
        <h1>Item not found</h1>
        <p>This item may have been deleted or saved in another browser.</p>
        <Link href="/">Back to items</Link>
      </div>
    );
  return (
    <article className="detail">
      <p className="eyebrow">
        Saved{" "}
        <time dateTime={item.createdAt}>
          {new Date(item.createdAt).toLocaleString()}
        </time>
      </p>
      <h1>{item.title}</h1>
      <p className="body-text">{item.body || "No additional notes."}</p>
      {deleteError && (
        <p role="alert" className="error">
          {deleteError}
        </p>
      )}
      <div className="detail-footer">
        <Link href="/">← All items</Link>
        <button type="button" className="delete" onClick={remove}>
          Delete item
        </button>
      </div>
    </article>
  );
}
