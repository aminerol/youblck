import React from "react";
import { StatusBar } from "react-native";
import { WebViewProvider } from "./context/webview";
import Home from "./screens/home";

export default function App() {
  return (
    <WebViewProvider>
      <StatusBar barStyle="dark-content" />
      <Home />
    </WebViewProvider>
  );
}
