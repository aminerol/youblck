import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

const SettingsRow = ({
  title,
  description,
  toggled,
  setToggled,
}: {
  title: string;
  description?: string;
  toggled: boolean;
  setToggled: (value: boolean) => void;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.textView}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={toggled}
        onValueChange={setToggled}
        trackColor={{ true: "#D52C43", false: "#d3d3d3" }}
        style={{ alignSelf: "center" }}
        thumbColor="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 24,
  },
  textView: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#333333",
    fontSize: 18,
    textAlign: "left",
    lineHeight: 18 * 1.2,
    includeFontPadding: false,
  },
  description: {
    color: "#606060",
    fontSize: 15,
    textAlign: "left",
    paddingTop: 2,
    includeFontPadding: false,
  },
  switch: {
    paddingVertical: 8,
  },
});

export default SettingsRow;
