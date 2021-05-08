import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { serialzeJS, buildInjectedJavascript } from "./utils";
import url from "url";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import useStorage, { StorageItem } from "./storage";

export default function App() {
  const webView = useRef<WebView>();

  const { blockVideo, blockChannel, ready, storage } = useStorage();

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

  const onContextMenuTap = async (
    action: string | string[],
    item: StorageItem
  ) => {
    if (action === "BLOCK_CHANNEL") {
      await blockChannel(item);
    }
    if (action === "BLOCK_VIDEO") {
      await blockVideo(item);
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
      const {
        action,
        id,
        duration,
        owner,
        publishedTime,
        thumbnail,
        title,
        views,
      } = redirectUrl.query;
      onContextMenuTap(action, {
        id: id.toString(),
        duration: duration.toString(),
        owner: JSON.parse(owner.toString()),
        publishedTime: publishedTime.toString(),
        thumbnail: thumbnail.toString(),
        title: title.toString(),
        views: views.toString(),
      });
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
