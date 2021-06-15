import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { isEmpty } from "lodash";
import Slider, {
  SlideMap,
  Slider as SliderType,
} from "../../components/slider";
import Channels from "./channels";
import Videos from "./videos";
import Keywords from "./keywords";
import useCollapsibleHeader from "../../components/flatlist/useCollapsibleHeader";

const HEADER_HEIGHT = 60;

const Library = () => {
  const [searchValue, setSearchValue] = useState("");
  const { scrollHandler, translateY } = useCollapsibleHeader(HEADER_HEIGHT);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slider = useRef<SliderType>();
  const VideosSlide = useCallback(
    () => <Videos scrollHandler={scrollHandler} searchValue={searchValue} />,
    [searchValue]
  );
  const ChannelsSlide = useCallback(
    () => <Channels scrollHandler={scrollHandler} searchValue={searchValue} />,
    [searchValue]
  );
  const KeywordsSlide = useCallback(
    () => <Keywords scrollHandler={scrollHandler} searchValue={searchValue} />,
    [searchValue]
  );

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
      <Animated.View style={{ transform: [{ translateY }] }}>
        <SegmentedControlTab
          values={["Videos", "Channels", "Keywords"]}
          selectedIndex={selectedIndex}
          tabStyle={styles.tabStyle}
          tabTextStyle={styles.tabTextStyle}
          activeTabStyle={styles.activeTabStyle}
          onTabPress={handleTabChange}
          tabsContainerStyle={styles.tabContainer}
        />
      </Animated.View>
      <Animated.View style={[styles.inputView, { marginTop: translateY }]}>
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={22} />
        </View>
        <View style={styles.searchInput}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#86939e"
            autoCapitalize="none"
            onChangeText={setSearchValue}
            value={searchValue}
            style={{ fontSize: 18 }}
          />
        </View>
        {!isEmpty(searchValue) ? (
          <View style={styles.searchClose}>
            <TouchableOpacity onPress={() => setSearchValue("")}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>
        ) : null}
      </Animated.View>
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
  inputView: {
    marginHorizontal: 12,
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    alignItems: "center",
    position: "absolute",
    transform: [{ translateY: HEADER_HEIGHT }],
    backgroundColor: "white",
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flexGrow: 1,
  },
  searchClose: {
    padding: 8,
  },
});

export default Library;
