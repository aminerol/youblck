import React from "react";
import { StatusBar } from "react-native";
import { WebViewProvider } from "./context/webview";
import { StateProvider } from "./utils/storage";
import Home from "./screens/home";
import { enableSentry, setJSExceptionHandler } from "./utils/sentry";

export default function App() {
  enableSentry();
  setJSExceptionHandler();
  return (
    <StateProvider>
      <WebViewProvider>
        <StatusBar barStyle="dark-content" />
        <Home />
      </WebViewProvider>
    </StateProvider>
  );
}
