import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import pkg from "../../package.json";
import { AppVersion } from "./app-version";

it("shows the app name and version in the footer", () => {
  render(<AppVersion />);

  expect(screen.getByText(`Pocket Notes v${pkg.version}`)).toBeVisible();
});
