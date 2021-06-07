import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default class EmptyList extends PureComponent<{
  headLine: string;
  subHeadLine: string;
}> {
  constructor(props) {
    super(props);
  }

  render() {
    const { headLine, subHeadLine } = this.props;
    return (
      <View style={styles.container}>
        <View style={{ paddingVertical: 5 }} />
        <Text style={styles.headline}> {headLine} </Text>
        <View style={{ paddingVertical: 3 }} />
        <Text style={styles.subHeadline}> {subHeadLine} </Text>
        <View style={{ paddingVertical: 50 }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  headline: {
    color: "#333333",
    fontSize: 24,
    textAlign: "center",
  },
  subHeadline: {
    color: "#606060",
    fontSize: 20,
    textAlign: "center",
  },
});
