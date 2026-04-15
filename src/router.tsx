import React, { useState, useEffect } from "react";
import App from "./App";
import { DebugPage } from "./pages/DebugPage";

function getHash(): string {
  return window.location.hash.replace(/^#/, "") || "/";
}

export function Router() {
  const [path, setPath] = useState(getHash);

  useEffect(() => {
    const handler = () => setPath(getHash());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (path === "/debug") return <DebugPage />;
  return <App />;
}
