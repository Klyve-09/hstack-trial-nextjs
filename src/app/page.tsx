import Link from "next/link";
import { ItemsList } from "@/components/items-list";
export default function Home() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">A place to put things</p>
          <h1>Your items</h1>
          <p>Small thoughts, kept close.</p>
        </div>
        <Link href="/new" className="button">
          + New item
        </Link>
      </div>
      <ItemsList />
    </>
  );
}
