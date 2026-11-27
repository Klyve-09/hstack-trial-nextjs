import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import pkg from "../../package.json";
import { AppVersion } from "./app-version";

it("shows the app version with a v prefix in the footer", () => {
  render(<AppVersion />);

  expect(screen.getByText(`v${pkg.version}`)).toBeVisible();
});
