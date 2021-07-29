import React, { PureComponent } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Tap from "../../../components/tap";
import { Channel, Video } from "../../../utils/storage";
import ActionSheet from "../../../components/actionsheet";

class VideoItem extends PureComponent<{
  video: Video;
  unBlockVideo: () => void;
}> {
  video: Video;
  owner: Channel;
  constructor(props) {
    super(props);

    this.video = props.video;
    this.owner = props.video.owner;
  }

  render() {
    return (
      <View style={styles.container}>
        <Tap onTaps={[{ count: 2, action: this.props.unBlockVideo }]}>
          <View style={[styles.shadowsStyling]}>
            <Image
              source={{ uri: this.video.thumbnail }}
              style={{ height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </View>
        </Tap>
        <View style={styles.descContainer}>
          <Image
            source={{ uri: this.owner.thumbnail }}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <View style={styles.videoDetails}>
            <Text numberOfLines={2} style={styles.videoTitle}>
              {this.video.name}
            </Text>
            <View
              style={{ flexDirection: "column", flex: 1, flexWrap: "wrap" }}
            >
              <Text numberOfLines={2} style={styles.videoStats}>
                {this.video.views + " • " + this.owner.name}
              </Text>
            </View>
          </View>
          <ActionSheet
            cancelButtonIndex={1}
            options={["Unblock Video", "Cancel"]}
            childrens={[
              <MaterialIcons
                key={"visibility-off"}
                name={"visibility-off"}
                size={24}
              />,
              <MaterialIcons key={"close"} name="close" size={24} />,
            ]}
            actions={[this.props.unBlockVideo]}
          />
        </View>
      </View>
    );
  }
}

export default VideoItem;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
    paddingHorizontal: 8,
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
