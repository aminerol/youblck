import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Constants from "expo-constants";
import { useWebView } from "../../context/webview";
import useStorage from "../../utils/storage";
import SettingsRow from "./item";

const Settings = () => {
  const { postMessage } = useWebView();
  const { state, setOptions } = useStorage();

  return (
    <View style={styles.container}>
      <SettingsRow
        title="Block trending page"
        toggled={state.options.trending}
        setToggled={(value) => {
          setOptions(value, "trending");
          postMessage({ type: "toggleTrending", payload: value });
        }}
      />
      <SettingsRow
        title="Block playlists"
        description="Generated playlists made by youtube"
        toggled={state.options.mixes}
        setToggled={(value) => {
          setOptions(value, "mixes");
          postMessage({ type: "toggleMixes", payload: value });
        }}
      />
      <View style={styles.footer}>
        <Text style={styles.copyright}>
          Version {Constants.manifest.version}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  footer: {
    position: "absolute",
    right: 0,
    left: 0,
    bottom: 16,
  },
  copyright: {
    color: "#606060",
    fontSize: 13,
    textAlign: "center",
    includeFontPadding: false,
  },
});

export default Settings;
