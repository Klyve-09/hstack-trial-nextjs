"use client";
import Link from "next/link";
import { useState } from "react";
import { useItems } from "@/lib/use-items";

export function ItemsList() {
  const { items, loading, error } = useItems();
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const visibleItems = items
    .filter((item) => !pinnedOnly || item.pinned)
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  if (loading) return <p role="status">Loading your items…</p>;
  if (error)
    return (
      <p role="alert">
        Your items could not be read. Allow local storage in your browser and
        reload. Saved data has not been changed.
      </p>
    );
  if (items.length === 0)
    return (
      <div className="empty">
        <h2>A little room for your thoughts.</h2>
        <p>Keep a thought, a reminder, or an idea close at hand.</p>
        <Link className="button" href="/new">
          Write your first item
        </Link>
      </div>
    );
  return (
    <>
      <div className="list-filters">
        <div className="pin-filter" onClick={() => setPinnedOnly(!pinnedOnly)}>
          {pinnedOnly ? "Show all items" : "Show pinned items"}
        </div>
        <span>{visibleItems.length} items</span>
      </div>
      {visibleItems.length === 0 && (
        <p>No pinned items yet. Open an item to pin it.</p>
      )}
      <ul className="items">
        {visibleItems.map((item) => (
          <li key={item.id}>
            <Link
              className="item-card"
              href={`/items/${encodeURIComponent(item.id)}`}
            >
              <time dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleDateString()}
              </time>
              {item.pinned && <span className="eyebrow">Pinned</span>}
              <h2>{item.title}</h2>
              <p>{item.body || "No additional notes."}</p>
              <span className="open-item">Open item →</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
