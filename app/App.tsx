import React from "react";
import { StatusBar } from "react-native";
import { WebViewProvider } from "./context/webview";
import { StateProvider } from "./storage";
import Home from "./screens/home";

export default function App() {
  return (
    <StateProvider>
      <WebViewProvider>
        <StatusBar barStyle="dark-content" />
        <Home />
      </WebViewProvider>
    </StateProvider>
  );
}
