import { Text, View } from "react-native";
import "../global.css";
export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-200 dark:bg-black">
      <Text className="font-bold text-xl text-primay">Hello world</Text>
    </View>
  );
}
