import Link from "next/link";
import { NewItemForm } from "@/components/new-item-form";
export const metadata = { title: "New item" };
export default function NewItemPage() {
  return (
    <>
      <Link className="back" href="/">
        ← All items
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Capture a thought</p>
          <h1>New item</h1>
          <p>Start with a title. Add the details if you like.</p>
        </div>
      </div>
      <NewItemForm />
    </>
  );
}
