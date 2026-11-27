import type { Metadata } from "next";
import Link from "next/link";
import { AppVersion } from "@/components/app-version";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pocket Notes", template: "%s · Pocket Notes" },
  description:
    "A small, private notebook for thoughts, reminders, and ideas on this device.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header>
            <Link className="brand" href="/">
              <span aria-hidden="true">▤</span> Pocket Notes
            </Link>
            <span className="device-label">Your own little notebook</span>
          </header>
          <main>{children}</main>
          <footer>
            <p>
              Saved in this browser, on this device. Clearing browser data
              removes your items.
            </p>
            <AppVersion />
          </footer>
        </div>
      </body>
    </html>
  );
}
