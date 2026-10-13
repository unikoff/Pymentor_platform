import React from "react";
import { createRoot, type Root } from "react-dom/client";
import "./app/styles.css";
import { App } from "./app/App";

declare global {
  interface Window {
    __pymentorRoot?: Root;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

const root = window.__pymentorRoot ?? createRoot(rootElement);
window.__pymentorRoot = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
