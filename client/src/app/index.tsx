import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen(){
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌱 Plate2Farm</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F4",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
})