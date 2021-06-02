import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Tap from "../../../components/tap";
import { Channel } from "../../../storage";
import ActionSheet from "../../../components/actionsheet";

class ChannelItem extends PureComponent<{
  channel: Channel;
  unBlockChannel: () => void;
}> {
  channel: Channel;
  constructor(props) {
    super(props);

    this.channel = props.channel;
  }

  render() {
    return (
      <View style={styles.container}>
        <Tap onTaps={[{ count: 2, action: this.props.unBlockChannel }]}>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Image
              source={{ uri: this.channel.thumbnail }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              resizeMode="cover"
            />
          </View>
        </Tap>
        <View style={{ flex: 2, justifyContent: "center" }}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.videoTitle}
          >
            {this.channel.name}
          </Text>
          <Text numberOfLines={2} style={styles.videoStats}>
            {this.channel.subscriberCount +
              " • " +
              this.channel.videoCount +
              " videos"}
          </Text>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ActionSheet
            cancelButtonIndex={1}
            options={["Unblock Channel", "Cancel"]}
            childrens={[
              <MaterialIcons key={"lock"} name={"lock"} size={24} />,
              <MaterialIcons key={"close"} name="close" size={24} />,
            ]}
            actions={[this.props.unBlockChannel]}
          />
        </View>
      </View>
    );
  }
}

export default ChannelItem;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
    paddingHorizontal: 8,

    flex: 1,
    flexDirection: "row",
  },
  descContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  videoTitle: {
    color: "#333333",
    fontSize: 14,
    textAlign: "left",
    lineHeight: 14 * 1.2,
    includeFontPadding: false,
  },
  videoDetails: {
    paddingHorizontal: 10,
    flex: 1,
  },
  videoStats: {
    color: "#606060",
    fontSize: 12,
    textAlign: "left",
    paddingTop: 2,
    includeFontPadding: false,
  },
  shadowsStyling: {
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0,
    },
    elevation: 4,
  },
});
