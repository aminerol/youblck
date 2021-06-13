import { useMemo } from "react";
import Animated, {
  Extrapolate,
  interpolate,
  sub,
} from "react-native-reanimated";
import { useScrollHandler } from "react-native-redash";

export type Collapsible = {
  scrollHandler: {
    onScroll: (...args: any[]) => void;
    scrollEventThrottle: number;
  };
  translateY: Animated.Node<number>;
  progress: Animated.Node<number>;
  opacity: Animated.Node<number>;
};

const useCollapsibleHeader = (HeaderHeight: number): Collapsible => {
  const { scrollHandler, y: positionY } = useScrollHandler();

  const animatedValues = useMemo(() => {
    const progress = interpolate(positionY, {
      inputRange: [0, HeaderHeight],
      outputRange: [0, 1],
      extrapolate: Extrapolate.CLAMP,
    });
    const translateY = Animated.multiply(progress, -HeaderHeight);
    const opacity = sub(1, progress);

    return { progress, translateY, opacity };
  }, [HeaderHeight, positionY]);

  return { scrollHandler, ...animatedValues };
};

export default useCollapsibleHeader;
