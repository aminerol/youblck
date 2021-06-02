import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActionSheetOptions,
  useActionSheet,
} from "@expo/react-native-action-sheet";
import { BorderlessButton } from "react-native-gesture-handler";

interface ActionSheetProps {
  cancelButtonIndex: number;
  actions: (() => void)[];
  childrens: React.ReactNode[];
  options: string[];
}

const ActionSheet = ({
  options,
  childrens,
  actions,
  cancelButtonIndex,
}: ActionSheetProps) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const _onOpenActionSheet = () => {
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        textStyle: {
          color: "#333333",
          fontSize: 15,
        },
        icons: childrens,
        useModal: true,
      },
      (buttonIndex) => {
        if (actions.length > buttonIndex) {
          actions[buttonIndex]();
        }
      }
    );
  };

  return (
    <BorderlessButton onPress={_onOpenActionSheet}>
      <Ionicons name="ellipsis-vertical" size={22} color="#030303" />
    </BorderlessButton>
  );
};

export default ActionSheet;
