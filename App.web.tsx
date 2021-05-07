import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { serialzeJS, buildInjectedJavascript } from "./utils";
import url from "url";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import useStorage from "./storage";

import WebView from "react-native-web-webview";

export default function App() {
  const webView = useRef<WebView>();
  const serialzedJS = [
    require("./js/vars"),
    require("./js/pre-main"),
    require("./js/intercept"),
    require("./js/utils"),
    require("./js/filter-utils"),
    require("./js/filter"),
    require("./js/main"),
  ]
    .map((path) => serialzeJS(path))
    .join("\n");

  const {
    blockVideo,
    blockChannel,
    channels,
    videos,
    storage,
    ready,
  } = useStorage();

  const onContextMenuTap = async (
    action: string | string[],
    id: string | string[]
  ) => {
    if (action === "BLOCK_CHANNEL") {
      await blockChannel({ id });
    }
    if (action === "BLOCK_VIDEO") {
      await blockVideo({ id });
    }
    webView.current?.postMessage(
      JSON.stringify({
        from: "YOUBLOCK",
        type: "storage",
        payload: storage,
      })
    );
  };

  const onStartLoad = (request: ShouldStartLoadRequest) => {
    const redirectUrl = url.parse(request.url, true);
    if (redirectUrl.pathname === "/youblock") {
      const { action, id } = redirectUrl.query;
      onContextMenuTap(action, id);
      webView.current?.goBack();
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webView}
        source={{
          html: `<!DOCTYPE html>
          <html>
            <head>
                <meta name="viewport"content="width=device-width,">
                <style>body{margin:0}.container{position:relative;width:100%;height:0;padding-bottom:56.25%}.iframe{position:absolute;top:0;left:0;width:100%;height:100%}</style>
              </head>
              <body>
                <div class="container">
                  <iframe class="iframe" id="iframe" src="https://m.youtube.com/" allowfullscreen="" allowpaymentrequest="true" seamless="" style="border-width: 0px; height: 100%; overflow: hidden; width: 100%;" frameborder="0"></iframe>
                </div>
              </body>
              <script>
                const seed = document.createElement('script');
                seed.textContent = '${
                  serialzedJS +
                  "main();true;".replaceAll("window.postMessage", "console.log")
                }';
                seed.async = false;
                (document.head || document.documentElement).prepend(seed);
              </script>
            </html>`,
        }}
        onMessage={(e) => console.log(e.nativeEvent.data)}
        onShouldStartLoadWithRequest={onStartLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
