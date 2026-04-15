import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./router";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found in DOM");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
