import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { WebViewProvider } from "./context/webview";
import { StateProvider } from "./utils/storage";
import Home from "./screens/home";
import { enableSentry, setJSExceptionHandler } from "./utils/sentry";
import { initFirebase } from "./utils/firebase";

export default function App() {
  useEffect(() => {
    async function init() {
      await enableSentry();
      setJSExceptionHandler();
      await initFirebase();
    }
    init();
  }, []);
  return (
    <StateProvider>
      <WebViewProvider>
        <StatusBar barStyle="dark-content" />
        <Home />
      </WebViewProvider>
    </StateProvider>
  );
}
