import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { Coupon } from "@/components/market/coupon";
import { Cover } from "@/components/market/cover";
import { Details, type PropsDetails } from "@/components/market/details";
import { api } from "@/services/api";
import { IconScan } from "@tabler/icons-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Modal, ScrollView, StatusBar, Text, View } from "react-native";

type DataProps = PropsDetails & {
	cover: string;
};

export default function Market() {
	const [_, requestPermission] = useCameraPermissions();
	const params = useLocalSearchParams<{ id: string }>();

	const [data, setData] = useState<DataProps>();
	const [coupon, setCoupon] = useState<string | null>(null);
	const [isFetchingCoupon, setIsFetchingCoupon] = useState(false);

	const [isLoading, setIsLoading] = useState(true);
	const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
	const qrLock = useRef(false);

	async function fetchMarket() {
		try {
			const { data } = await api.get(`/markets/${params.id}`);

			setData(data);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			Alert.alert("Erro", "Não foi possível carregar os dados.", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		}
	}

	async function handleOpenCamera() {
		try {
			const { granted } = await requestPermission();

			if (!granted) {
				Alert.alert("Camera", "Você precisa habilitar o uso da camera");
			}

			qrLock.current = false;
			setIsCameraModalVisible(true);
		} catch (error) {
			console.log(error);
			Alert.alert("Erro", "Não foi possível utilizar camera.");
		}
	}

	function handleUseCoupon(id: string) {
		setIsCameraModalVisible(false);

		Alert.alert(
			"Cupom",
			"Deseja resgatar o cupom? Não sera possível reutiliza-lo.",
			[
				{ style: "cancel", text: "Não" },
				{ text: "Sim", onPress: () => getCoupon(id) },
			],
		);
	}

	async function getCoupon(id: string) {
		try {
			setIsFetchingCoupon(true);

			const { data } = await api.patch(`/coupons/${id}`);

			console.log(data);

			Alert.alert("Cupom", data.coupon);
			setCoupon(data.coupon);
		} catch (error) {
			console.log(error);
			Alert.alert("Eror", "Não foi possível utilizar o cupom.");
		}

		setIsFetchingCoupon(false);
	}

	useEffect(() => {
		fetchMarket();
	}, [params.id, coupon]);

	if (isLoading) {
		return <Loading />;
	}

	if (!data) {
		return <Redirect href={"/home"} />;
	}

	return (
		<View style={{ flex: 1 }}>
			<StatusBar hidden={isCameraModalVisible} />

			<ScrollView showsVerticalScrollIndicator={false}>
				<Cover uri={data.cover} />
				<Details data={data} />
				{coupon && <Coupon code={coupon} />}
			</ScrollView>

			<View style={{ padding: 32 }}>
				<Button onPress={() => handleOpenCamera()}>
					<Button.Icon icon={IconScan} />
					<Button.Title>Ler QR Code</Button.Title>
				</Button>
			</View>

			<Modal style={{ flex: 1 }} visible={isCameraModalVisible}>
				<CameraView
					style={{ flex: 1 }}
					facing="back"
					onBarcodeScanned={({ data }) => {
						if (data && !qrLock.current) {
							qrLock.current = true;
							handleUseCoupon(data);
						}
					}}
				/>

				<View style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}>
					<Button
						onPress={() => setIsCameraModalVisible(false)}
						isLoading={isFetchingCoupon}
					>
						<Button.Title>Voltar</Button.Title>
					</Button>
				</View>
			</Modal>
		</View>
	);
}
