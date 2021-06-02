import React from "react";
import { WebViewProvider } from "./context/webview";
import Home from "./screens/home";

export default function App() {
  return (
    <WebViewProvider>
      <Home />
    </WebViewProvider>
  );
}
