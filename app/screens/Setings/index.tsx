import React from "react";
import { View, StyleSheet } from "react-native";
import { useWebView } from "../../context/webview";
import useStorage from "../../storage";
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
});

export default Settings;
