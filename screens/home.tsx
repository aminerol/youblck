import React, { useEffect, useRef, useState } from "react";
import { Text, Modal, StyleSheet, View, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { serialzeJS, buildInjectedJavascript, getChannelInfo } from "../utils";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { Ionicons } from "@expo/vector-icons";
import useStorage, { Channel, Video } from "../storage";
import url from "url";
import Library from "./Library";
import { jsFiles } from "../js";
import { useWebView } from "../context/webview";

export default function Home() {
  const { ref: webView, postMessage } = useWebView();
  const [modalVisible, setModalVisible] = useState(false);

  const { block, unBlock, ready, storage, state } = useStorage();

  const serialzedJS = jsFiles.map((path) => serialzeJS(path)).join("\n");
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
        owner: owner,
      } as Video;

      if (action === "BLOCK_CHANNEL") {
        block(owner, "channels");
        getChannelInfo(owner.id).then((info) =>
          block({ ...owner, ...info }, "channels")
        );
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
      postMessage({
        from: "YOUBLOCK",
        type: "storage",
        payload: storage,
      });
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
          onShouldStartLoadWithRequest={(e) => {
            const redirectTo = url.parse(e.url, true);
            if (redirectTo.query.action === "OPEN_LIBRARY") {
              setModalVisible(true);
              return false;
            }
            return true;
          }}
        />
      )}
      <Modal
        animationType="slide"
        visible={modalVisible}
        presentationStyle="formSheet"
      >
        <TouchableOpacity
          style={{ alignItems: "flex-end", marginVertical: 8, marginRight: 8 }}
          onPress={() => setModalVisible(false)}
        >
          <Ionicons name="close-circle-outline" size={26} />
        </TouchableOpacity>
        <Library />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
