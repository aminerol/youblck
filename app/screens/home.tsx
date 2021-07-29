import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  SafeAreaView,
  View,
  Pressable,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { Ionicons } from "@expo/vector-icons";
import url from "url";
import * as Linking from "expo-linking";
import { some } from "lodash";
import * as Sentry from "sentry-expo";

import { getChannelInfo } from "../utils/youtube";
import { captureException } from "../utils/sentry";
import Library from "./Library";
import { useWebView } from "../context/webview";
import useStorage, { Channel, Video } from "../utils/storage";
import { useLoadAssets } from "../components/assets";
import Settings from "./Setings";
import RefreshWebView from "../components/webview";
import { storeConfig } from "../utils/firebase";

const blockedUrls = [
  "studio.youtube.com",
  "myaccount.google.com",
  "support.google.com",
];

export default function Home() {
  const { ref: webView, updateStorage, setYtConfig, ytConfig } = useWebView();
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModal, setsettingsModal] = useState(false);
  const { block, unBlock, ready, storage, state } = useStorage();
  const injectedJS = useLoadAssets(require("../build/out.txt"));

  useEffect(() => {
    if (ready) {
      updateStorage(storage);
    }
  }, [ready, storage]);

  useEffect(() => {
    function handleBackButton() {
      webView.current.goBack();
      return true;
    }
    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
    };
  }, []);

  const onMessage = async (event: WebViewMessageEvent) => {
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
        if (!some(state.filterData.channels, ["id", owner.id])) {
          const info = await getChannelInfo(owner.id, ytConfig);
          if (info) {
            block({ ...owner, ...info }, "channels");
          } else {
            block(owner, "channels");
          }
        }
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
      storeConfig(payload);
    }
    if (type === "error") {
      captureException(payload, "core");
    }
  };

  if (!injectedJS) {
    return null;
  }

  const WebViewEx = Platform.OS === "ios" ? WebView : RefreshWebView;

  return (
    <SafeAreaView style={styles.container}>
      {ready && (
        <WebViewEx
          ref={webView}
          source={{ uri: "https://m.youtube.com/" }}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback
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
            payload: yt.config_.INNERTUBE_CONTEXT.client
          }), this);`}
          onNavigationStateChange={(navState) => {
            const redirectTo = url.parse(navState.url, true);
            if (
              redirectTo.query.action === "OPEN_LIBRARY" &&
              navState.loading
            ) {
              webView.current.goBack();
            }
          }}
        />
      )}
      <Modal
        animationType="slide"
        visible={modalVisible}
        presentationStyle="formSheet"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 12,
            marginHorizontal: 8,
            zIndex: 10,
            backgroundColor: "white",
          }}
        >
          <Pressable onPress={() => setModalVisible(false)}>
            <Ionicons name="arrow-back-outline" size={26} />
          </Pressable>
          <Pressable onPress={() => setsettingsModal(true)}>
            <Ionicons name="settings-outline" size={26} />
          </Pressable>
        </View>
        <Library />
        <Modal
          animationType="slide"
          visible={settingsModal}
          presentationStyle="formSheet"
        >
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              marginHorizontal: 8,
              zIndex: 10,
              backgroundColor: "white",
            }}
            onPress={() => setsettingsModal(false)}
          >
            <Ionicons name="arrow-back-outline" size={26} />
          </TouchableOpacity>
          <Settings />
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
