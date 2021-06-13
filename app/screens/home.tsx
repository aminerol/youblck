import React, { useEffect, useState } from "react";
import {
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { Ionicons } from "@expo/vector-icons";
import url from "url";
import * as Linking from "expo-linking";

import { getChannelInfo } from "../utils";
import Library from "./Library";
import { useWebView } from "../context/webview";
import useStorage, { Channel, Video } from "../storage";
import { useLoadAssets } from "../components/assets";

const blockedUrls = [
  "studio.youtube.com",
  "myaccount.google.com",
  "support.google.com",
];

export default function Home() {
  const { ref: webView, updateStorage, setYtConfig, ytConfig } = useWebView();
  const [modalVisible, setModalVisible] = useState(false);
  const { block, unBlock, ready, storage } = useStorage();
  const injectedJS = useLoadAssets(require("../build/out.txt"));

  useEffect(() => {
    if (ready) {
      updateStorage(storage);
    }
  }, [ready, storage]);

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
        getChannelInfo(owner.id, ytConfig).then((info) =>
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
    if (type === "loaded") {
      updateStorage(storage);
    }
    if (type === "config") {
      setYtConfig(payload);
    }
    if (type === "error") {
      console.log(payload);
    }
  };

  if (!injectedJS) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {ready && (
        <WebView
          ref={webView}
          source={{ uri: "https://m.youtube.com/" }}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          onMessage={onMessage}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          onShouldStartLoadWithRequest={(e) => {
            const redirectTo = url.parse(e.url, true);
            if (redirectTo.query.action === "OPEN_LIBRARY") {
              setModalVisible(true);
              return false;
            }
            if (blockedUrls.includes(redirectTo.host)) {
              Linking.openURL(e.url);
              return false;
            }
            if (redirectTo.query.feature === "mweb_c3_open_app") {
              return false;
            }
            return true;
          }}
          injectedJavaScript={`window.ReactNativeWebView.postMessage(JSON.stringify({
            from: "YOUBLOCK",
            type: "config",
            payload: ytcfg.data_.INNERTUBE_CONTEXT.client
          }), this);`}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
