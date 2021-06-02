import type { ReactElement } from "react";
import type {
  FlexStyle,
  ScrollViewProps,
  TransformsStyle,
  ViewStyle as RNViewStyle,
} from "react-native";

type ViewStyle = RNViewStyle | FlexStyle | TransformsStyle;

export type SlideProps = {
  key: string;
};

export type SlideState<SlideProps> = {
  slides: SlideProps[];
};

interface SliderInterface<SlideProps> {
  renderSlides: (props: { route: SlideProps }) => React.ReactNode;
  slideState: SlideState<SlideProps>;
  containerStyle?: ViewStyle;
  slideStyle?: ViewStyle;
  onDone?: () => void;
}

export type SliderProps = SliderInterface<SlideProps> & ScrollViewProps;
