"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteItem, toggleItemPin } from "@/lib/items";
import { useItems } from "@/lib/use-items";

export function ItemDetail({ id }: { id: string }) {
  const router = useRouter();
  const { items, loading, error } = useItems();
  const [deleteError, setDeleteError] = useState("");
  const [pinError, setPinError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const item = items.find((entry) => entry.id === id);
  function togglePin() {
    try {
      toggleItemPin(id);
      setPinError("");
    } catch {
      setPinError(
        "Could not update this pin. Check your browser storage and try again.",
      );
    }
  }
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
      <div className="item-heading">
        <h1>{item.title}</h1>
        <button type="button" onClick={togglePin} aria-pressed={!!item.pinned}>
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={item.pinned ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M8 3h8l-1 6 4 4v2h-6v7h-2v-7H5v-2l4-4-1-6Z" />
          </svg>
        </button>
      </div>
      {item.pinned && <p className="eyebrow">Pinned to the top of your items</p>}
      {pinError && (
        <p role="alert" className="error">{pinError}</p>
      )}
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
