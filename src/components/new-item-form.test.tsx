import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { readItems } from "@/lib/items";
import { NewItemForm } from "./new-item-form";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => {
  vi.restoreAllMocks();
  push.mockClear();
});

it("saves the form and opens the saved item", async () => {
  const user = userEvent.setup();
  render(<NewItemForm />);
  await user.type(screen.getByLabelText(/Title/), "Buy a notebook");
  await user.type(screen.getByLabelText(/Notes/), "One with plain pages.");
  await user.click(screen.getByRole("button", { name: "Save item" }));
  const [item] = readItems();
  expect(item).toMatchObject({
    title: "Buy a notebook",
    body: "One with plain pages.",
  });
  expect(push).toHaveBeenCalledWith(`/items/${item.id}`);
});

it("rejects a whitespace-only title", () => {
  render(<NewItemForm />);
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: "   " },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Save item" }).closest("form")!,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Give your item a title.",
  );
  expect(readItems()).toEqual([]);
  expect(push).not.toHaveBeenCalled();
});

it("keeps entered text and allows retry when storage fails", async () => {
  const user = userEvent.setup();
  render(<NewItemForm />);
  await user.type(screen.getByLabelText(/Title/), "Keep this thought");
  const write = vi
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("Full");
    });
  await user.click(screen.getByRole("button", { name: "Save item" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  expect(screen.getByLabelText(/Title/)).toHaveValue("Keep this thought");
  expect(push).not.toHaveBeenCalled();
  write.mockRestore();
  await user.click(screen.getByRole("button", { name: "Save item" }));
  expect(readItems()).toHaveLength(1);
  expect(push).toHaveBeenCalledOnce();
});
