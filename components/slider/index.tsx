import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Dimensions, View, ScrollView } from "react-native";

const { width } = Dimensions.get("window");
import type { SliderProps } from "./types";

export type Slider = { goToSlide: (index: number) => void };

const Slider = forwardRef<Slider, SliderProps>(
  (
    { renderSlides, slideState, containerStyle = {}, slideStyle, ...rest },
    ref
  ) => {
    const scroll = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      goToSlide: (index: number) => {
        scroll.current.scrollTo({
          y: 0,
          x: index * width,
          animated: true,
        });
      },
    }));

    return (
      <View style={[{ flex: 1 }, containerStyle]}>
        <ScrollView
          ref={scroll}
          horizontal
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          automaticallyAdjustContentInsets={false}
          {...rest}
        >
          {slideState.slides.map((route, index) => {
            return (
              <View key={index} style={[{ width }, slideStyle]}>
                {renderSlides({
                  route,
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
);

class SceneComponent<
  T extends { component: React.ComponentType<any> }
> extends React.PureComponent<T> {
  render() {
    const { component, ...rest } = this.props;
    return React.createElement(component, rest);
  }
}

export function SlideMap<T extends any>(scenes: {
  [key: string]: React.ComponentType<T>;
}) {
  return ({ route }: { route: any }) => (
    <SceneComponent
      key={route.key}
      component={scenes[route.key]}
      route={route}
    />
  );
}

export default Slider;
