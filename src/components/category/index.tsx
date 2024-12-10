import { colors } from "@/styles/theme";
import { categoriesIcons } from "@/utils/categories-icons";
import { Pressable, type PressableProps, Text } from "react-native";
import { s } from "./styles";

type Props = PressableProps & {
  name: string;
  iconId: string;
  isSelected?: boolean;
};

export function Category({
  name,
  iconId,
  isSelected = false,
  ...props
}: Props) {
  const Icon = categoriesIcons[iconId];

  return (
    <Pressable
      style={[s.container, isSelected && s.containerSelected]}
      {...props}
    >
      <Icon size={16} color={colors.gray[isSelected ? 100 : 400]} />
      <Text style={[s.name, isSelected && s.nameSelected]}>{name}</Text>
    </Pressable>
  );
}
