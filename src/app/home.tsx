import { Categories, type CategoriesProps } from "@/components/categories";
import type { PlaceProps } from "@/components/place";
import { Places } from "@/components/places";
import { api } from "@/services/api";
import { colors } from "@/styles/colors";
import { fontFamily } from "@/styles/font-family";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

type MarketsProps = PlaceProps & {
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [categories, setCategories] = useState<CategoriesProps>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [markets, setMarkets] = useState<MarketsProps[]>([]);

  const [location, setLocation] = useState<
    | Location.LocationObject
    | { coords: { latitude: number; longitude: number } }
  >();

  async function fetchCategories() {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
      setSelectedCategory(data[0].id);
    } catch (error) {
      console.log(error);
      Alert.alert("Categorias", "Não foi possível carregar as categorias.");
    }
  }

  async function fetchMarkets() {
    try {
      if (!selectedCategory) {
        return;
      }

      const { data } = await api.get(`/markets/category/${selectedCategory}`);
      setMarkets(data);
    } catch (error) {
      console.log(error);
      Alert.alert("Locais", "Não foi possível carregar os locais.");
    }
  }

  async function getCurrentLocation() {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();

      if (!granted) {
        Alert.alert("Localização", "Você precisa habilitar o uso da localização");
      }

      const currentLocation = await Location.getCurrentPositionAsync();
      setLocation(currentLocation);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Localização",
        "Não foi possível carregar a sua localização.",
      );
    }
  }

  useEffect(() => {
    getCurrentLocation();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: "#CECECE" }}>
      <Categories
        data={categories}
        onSelect={setSelectedCategory}
        selected={selectedCategory}
      />

      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            identifier="current"
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            image={require("@/assets/location.png")}
          />

          {markets.map((item) => (
            <Marker
              key={item.id}
              identifier={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              image={require("@/assets/pin.png")}
            >
              <Callout onPress={() => router.navigate(`/market/${item.id}`)}>
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.gray[600],
                      fontFamily: fontFamily.medium,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.gray[600],
                      fontFamily: fontFamily.regular,
                    }}
                  >
                    {item.address}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      <Places data={markets} />
    </View>
  );
}
