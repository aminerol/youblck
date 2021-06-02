import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import Slider, {
  SlideMap,
  Slider as SliderType,
} from "../../components/slider";
import Channels from "./channels";
import Videos from "./videos";
import Keywords from "./keywords";

const Library = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slider = useRef<SliderType>();
  const VideosSlide = useCallback(() => <Videos />, []);
  const ChannelsSlide = useCallback(() => <Channels />, []);
  const KeywordsSlide = useCallback(() => <Keywords />, []);

  const renderSlides = SlideMap({
    videos: VideosSlide,
    channels: ChannelsSlide,
    keywords: KeywordsSlide,
  });
  type Route = {
    key: string;
  }[];
  const [slides] = React.useState<Route>([
    { key: "videos" },
    { key: "channels" },
    { key: "keywords" },
  ]);

  const handleTabChange = (index: number) => {
    slider.current.goToSlide(index);
    setSelectedIndex(index);
  };

  return (
    <View style={styles.modalView}>
      <SegmentedControlTab
        values={["Videos", "Channels", "Keywords"]}
        selectedIndex={selectedIndex}
        tabStyle={styles.tabStyle}
        tabTextStyle={styles.tabTextStyle}
        activeTabStyle={styles.activeTabStyle}
        onTabPress={handleTabChange}
        tabsContainerStyle={styles.tabContainer}
      />
      <ActionSheetProvider>
        <Slider
          renderSlides={renderSlides}
          slideState={{ slides }}
          scrollEnabled={false}
          ref={slider}
        />
      </ActionSheetProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    paddingHorizontal: 8,
  },
  tabTextStyle: {
    color: "#333333",
    fontSize: 16,
  },
  tabStyle: {
    borderColor: "#D52C43",
    marginBottom: 12,
  },
  activeTabStyle: {
    backgroundColor: "#D52C43",
  },
  modalView: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default Library;
