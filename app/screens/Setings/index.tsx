import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import useStorage from "../../storage";
import SettingsRow from "./item";

const Settings = () => {
  const { state, setOptions } = useStorage();

  return (
    <View style={styles.container}>
      <SettingsRow
        title="Block trending page"
        toggled={state.options.trending}
        setToggled={(value) => setOptions(value, "trending")}
      />
      <SettingsRow
        title="Block playlists"
        description="Generated playlists made by youtube"
        toggled={state.options.mixes}
        setToggled={(value) => setOptions(value, "mixes")}
      />
      {/* <SettingsRow />
      <SettingsRow /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
});

export default Settings;
