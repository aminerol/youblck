import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { serialzeJS, buildInjectedJavascript } from "./utils";
import url from "url";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import useStorage from "./storage";

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

  const injectJS =
    `this.storageData = ${JSON.stringify(storage)};` +
    buildInjectedJavascript(serialzedJS);

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
      {ready && (
        <WebView
          ref={webView}
          source={{ uri: "https://m.youtube.com/" }}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectJS}
          onMessage={(e) => console.log(e.nativeEvent.data)}
          allowsBackForwardNavigationGestures={true}
          onShouldStartLoadWithRequest={onStartLoad}
          pullToRefreshEnabled={true}
          onNavigationStateChange={(e) => {
            webView.current?.postMessage(
              JSON.stringify({
                from: "YOUBLOCK",
                type: "loadEnd",
              })
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
