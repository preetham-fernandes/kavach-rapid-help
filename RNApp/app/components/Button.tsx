import { TouchableOpacity, Text } from "react-native";

export default function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="p-3 mt-4 bg-blue-600 rounded w-80" onPress={onPress}>
      <Text className="font-semibold text-center text-white">{title}</Text>
    </TouchableOpacity>
  );
}
