import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { createItem } from "@/lib/items";
import { ItemsList } from "./items-list";

beforeEach(() => {
  createItem("Camping plans", "Bring a tent.");
  createItem("Groceries", "Milk and bread.");
  createItem("Weekend supplies", "Pack CAMPfire supplies.");
});

it("shows a visibly labelled search input when saved items exist", () => {
  render(<ItemsList />);

  expect(screen.getByLabelText("Search notes")).toBeVisible();
  expect(screen.getByText("Search notes")).toBeVisible();
});

it.each(["aMp", "  aMp  "])(
  "filters title and body matches without changing their order for query %j",
  async (query) => {
    const user = userEvent.setup();
    render(<ItemsList />);

    await user.type(screen.getByLabelText("Search notes"), query);

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual(["Weekend supplies", "Camping plans"]);
    expect(
      screen.queryByRole("heading", { name: "Groceries" }),
    ).not.toBeInTheDocument();
  },
);

it("updates the matches as more of the title is typed", async () => {
  const user = userEvent.setup();
  render(<ItemsList />);
  const search = screen.getByLabelText("Search notes");

  await user.type(search, "camp");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  await user.type(search, "ing");

  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "Camping plans" })).toBeVisible();
});

it("shows every saved item for a whitespace-only query", async () => {
  const user = userEvent.setup();
  render(<ItemsList />);

  await user.type(screen.getByLabelText("Search notes"), "   ");

  expect(
    screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
  ).toEqual(["Weekend supplies", "Groceries", "Camping plans"]);
});

it("shows the first-run empty state without search when no items are saved", () => {
  localStorage.clear();
  render(<ItemsList />);

  expect(
    screen.getByRole("heading", { name: "A little room for your thoughts." }),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Write your first item" }),
  ).toHaveAttribute("href", "/new");
  expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  expect(screen.queryByText("Search notes")).not.toBeInTheDocument();
  expect(screen.queryByText("No notes match")).not.toBeInTheDocument();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});

it("restores every saved item in order when the search is cleared", async () => {
  const user = userEvent.setup();
  render(<ItemsList />);
  const search = screen.getByLabelText("Search notes");
  await user.type(search, "camping");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);

  await user.clear(search);

  expect(
    screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
  ).toEqual(["Weekend supplies", "Groceries", "Camping plans"]);
});

it("shows a status without cards for no matches and restores all items when cleared", async () => {
  const user = userEvent.setup();
  render(<ItemsList />);
  const search = screen.getByLabelText("Search notes");

  await user.type(search, "unmatched query");

  expect(screen.getByRole("status")).toHaveTextContent("No notes match");
  expect(screen.getByRole("status")).toBeVisible();
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(search).toBeVisible();

  await user.clear(search);

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(
    screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
  ).toEqual(["Weekend supplies", "Groceries", "Camping plans"]);
});
