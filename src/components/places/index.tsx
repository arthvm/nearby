import BottomSheet from "@gorhom/bottom-sheet";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useRef } from "react";
import { Text, useWindowDimensions } from "react-native";
import { Place, type PlaceProps } from "../place";
import { s } from "./styles";

type Props = {
	data: PlaceProps[];
};

const topInset = 128;

export function Places({ data }: Props) {
	const dimensions = useWindowDimensions();
	const bottomSheetRef = useRef<BottomSheet>(null);

	const snapPoints = {
		min: 278,
		max: dimensions.height - topInset,
	};

	return (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={[snapPoints.min, snapPoints.max]}
			handleIndicatorStyle={s.indicator}
			backgroundStyle={s.container}
			enableOverDrag={false}
			topInset={128}
		>
			<BottomSheetFlatList
				data={data}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<Place
						data={item}
						onPress={() => router.navigate(`/market/${item.id}`)}
					/>
				)}
				contentContainerStyle={s.content}
				ListHeaderComponent={() => (
					<Text style={s.title}>Explore locais perto de você</Text>
				)}
				showsVerticalScrollIndicator={false}
			/>
		</BottomSheet>
	);
}
