import React from "react";
import { createRoot, type Root } from "react-dom/client";
import "dockview-react/dist/styles/dockview.css";
import "./app/styles.css";
import { App } from "./app/App";
import { ThemeProvider } from "./shared/theme";

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
    <ThemeProvider><App /></ThemeProvider>
  </React.StrictMode>,
);
