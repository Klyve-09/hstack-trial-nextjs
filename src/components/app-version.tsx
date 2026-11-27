import pkg from "../../package.json";

export function AppVersion() {
  return <p className="app-version">Pocket Notes v{pkg.version}</p>;
}
