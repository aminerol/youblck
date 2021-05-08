import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { serialzeJS, buildInjectedJavascript } from "./utils";
import url from "url";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import useStorage, { Channel, Video } from "./storage";

export default function App() {
  const webView = useRef<WebView>();

  const { block, ready, storage } = useStorage();

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

  const onStartLoad = (request: ShouldStartLoadRequest) => {
    const redirectUrl = url.parse(request.url, true);
    if (redirectUrl.pathname === "/youblock") {
      const {
        action,
        id,
        duration,
        publishedTime,
        thumbnail,
        title,
        views,
      } = redirectUrl.query;
      const owner = JSON.parse(redirectUrl.query.owner.toString()) as Channel;

      if (action === "BLOCK_CHANNEL") {
        block(owner, "channels");
      }
      if (action === "BLOCK_VIDEO") {
        block(
          {
            id: id.toString(),
            duration: duration.toString(),
            publishedTime: publishedTime.toString(),
            thumbnail: thumbnail.toString(),
            name: title.toString(),
            views: views.toString(),
            ownerId: owner.id,
          } as Video,
          "videos"
        );
      }
      webView.current?.goBack();
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (ready) {
      console.log(storage);
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
          onMessage={(e) => console.log(e.nativeEvent.data)}
          allowsBackForwardNavigationGestures={true}
          onShouldStartLoadWithRequest={onStartLoad}
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
