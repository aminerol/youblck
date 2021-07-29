import React, { useState, forwardRef } from "react";
import { WebView, WebViewProps } from "react-native-webview";
import { Dimensions, RefreshControl, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {} from "react";

const RefreshWebView = forwardRef<WebView, WebViewProps>(
  ({ style, ...webViewProps }, ref) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [height, setHeight] = useState(Dimensions.get("screen").height);
    const [isEnabled, setEnabled] = useState(true);

    const onRefresh = () => {
      setIsRefreshing(true);
      //@ts-ignore
      if (ref.current) {
        //@ts-ignore
        ref.current
          .injectJavaScript(`window.dispatchEvent(new CustomEvent('navigate', {
          detail: {href: document.location.href}
        }))`);
      }
      setIsRefreshing(false);
    };

    return (
      <ScrollView
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            enabled={isEnabled}
          />
        }
        style={styles.view}
      >
        <WebView
          ref={ref}
          {...webViewProps}
          onScroll={(e) =>
            setEnabled(
              typeof onRefresh === "function" &&
                e.nativeEvent.contentOffset.y === 0
            )
          }
          style={[
            styles.view,
            {
              height,
            },
            style,
          ]}
        />
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: "100%",
  },
});

export default RefreshWebView;
