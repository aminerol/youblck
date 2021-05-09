import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { serialzeJS, buildInjectedJavascript } from "./utils";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import useStorage, { Channel, Video } from "./storage";

export default function App() {
  const webView = useRef<WebView>();

  const { block, unBlock, ready, storage, state } = useStorage();

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
  const injectJS = buildInjectedJavascript(serialzedJS, storage);

  const onMessage = (event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);
    const { from, type, payload } = data;
    if (!from || from !== "YOUBLOCK") return;
    if (type === "menu") {
      const {
        action,
        id,
        duration,
        publishedTime,
        thumbnail,
        title: name,
        views,
      } = payload;
      const owner = JSON.parse(payload.owner) as Channel;
      const video = {
        id,
        duration,
        publishedTime,
        thumbnail,
        name,
        views,
        ownerId: owner.id,
      } as Video;

      if (action === "BLOCK_CHANNEL") {
        block(owner, "channels");
      }
      if (action === "BLOCK_VIDEO") {
        block(video, "videos");
      }
      if (action === "UNBLOCK_CHANNEL") {
        unBlock(owner, "channels");
      }
      if (action === "UNBLOCK_VIDEO") {
        unBlock(video, "videos");
      }
    }
    if (type === "test") {
      console.log(payload);
    }
  };

  useEffect(() => {
    if (ready) {
      webView.current?.postMessage(
        JSON.stringify({
          from: "YOUBLOCK",
          type: "storage",
          payload: storage,
        })
      );
    }
  }, [ready, storage]);

  return (
    <View style={styles.container}>
      {ready && (
        <WebView
          ref={webView}
          source={{ uri: "https://m.youtube.com/" }}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectJS}
          onMessage={onMessage}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
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
