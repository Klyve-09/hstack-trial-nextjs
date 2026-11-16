"use client";
import Link from "next/link";
import { useState } from "react";
import { useItems } from "@/lib/use-items";

export function ItemsList() {
  const { items, loading, error } = useItems();
  const [query, setQuery] = useState("");
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
  const search = query.trim().toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search) ||
      item.body.toLowerCase().includes(search),
  );
  return (
    <>
      <label htmlFor="search-notes">Search notes</label>
      <input
        id="search-notes"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="items">
        {filteredItems.map((item) => (
          <li key={item.id}>
            <Link
              className="item-card"
              href={`/items/${encodeURIComponent(item.id)}`}
            >
              <time dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleDateString()}
              </time>
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
