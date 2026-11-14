import { ItemDetail } from "@/components/item-detail";
export const metadata = { title: "Item" };
export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetail id={id} />;
}
