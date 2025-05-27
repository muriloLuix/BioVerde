import { useCallback, useEffect, useState } from "react";

import axios from "axios";

import { Separator } from "radix-ui";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

import {
	Loader2,
	Mail,
	Package,
	PackageCheck,
	PackageOpen,
	PackageSearch,
} from "lucide-react";

interface QuantityByStatus {
	status: string;
	total_orders: Number;
}

const Dashboard = () => {
	const icons = [
		<PackageOpen className="text-white" />,
		<PackageSearch className="text-white" />,
		<Package className="text-white" />,
		<PackageCheck className="text-white" />,
	];
	const [lineOptions, setLineOptions] = useState<AgChartOptions>({
		theme: {
			palette: {
				fills: ["#fff"],
				strokes: ["#fff"],
			},
			overrides: {
				line: {
					series: {
						strokeWidth: 2,
						marker: {
							size: 4,
							fill: "#fff",
							stroke: "#fff",
						},
					},
					axes: {
						category: {
							line: {
								stroke: "#fff",
							},
							label: {
								color: "#fff",
							},
						},
						number: {
							line: {
								stroke: "#fff",
							},
							label: {
								color: "#fff",
							},
						},
					},
				},
			},
		},
		series: [{ type: "line", xKey: "monthName", yKey: "rawValue" }],
		title: {
			text: "PEDIDOS POR MÊS",
			color: "#fff",
			fontSize: 24,
		},
		background: {
			visible: false,
		},
		overlays: {
			loading: {
				text: "Carregando dados...",
			},
			noData: {
				text: "Sem dados disponíveis",
			},
		},
	});
	const [products, setProducts] = useState<QuantityByStatus[] | null>();
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = useCallback(async (url: string, params: object) => {
		try {
			const request = await axios.post(url, params);

			return request.data.data;
		} catch (err) {
			console.log(err);
		}
	}, []);

	const loadStatusData = useCallback(async () => {
		setIsLoading(true);
		const data = await fetchData(
			"http://localhost/BioVerde/back-end/pedidos/listar_pedidos_por_status.php",
			{
				start: "2025-01-01",
				end: "2025-12-31",
			}
		);

		console.log(data);

		setProducts(data);
		setIsLoading(false);
	}, []);

	const loadChartData = useCallback(async () => {
		setIsLoading(true);
		const data = await fetchData(
			"http://localhost/BioVerde/back-end/pedidos/valor_total_pedidos.php",
			{
				start: "2025-01-01",
				end: "2025-12-31",
			}
		);

		console.log(data);

		setLineOptions({ ...lineOptions, data: data });
		setIsLoading(false);
	}, []);

	useEffect(() => {
		loadStatusData();
		loadChartData();
	}, [fetchData]);

	return isLoading ? (
		<div className="pl-64 h-screen w-full flex justify-center items-center">
			<Loader2 className="animate-spin h-12 w-12" />
		</div>
	) : (
		<div className="pl-64">
			<div className="h-screen w-full flex flex-wrap items-start p-4">
				<div className="h-3/12 w-full flex items-center justify-around p-2 shadow-2xl rounded-lg bg-verdeEscuroForte">
					{products?.map((product, index) => (
						<>
							<div
								key={product.status}
								className="h-full w-1/5 flex flex-col p-2"
							>
								<div className="h-1/4 w-full flex p-1 item-center justify-center gap-2 font-medium">
									{icons[index]}
									<span className="text-white text-center text-xl">
										{product.status.toUpperCase()}
									</span>
								</div>
								<div className="h-3/4 w-full flex items-center justify-center font-medium">
									<span className="text-5xl text-white">
										{product.total_orders?.toString()}
									</span>
								</div>
							</div>
							{index < 3 ? (
								<Separator.Root
									className="bg-white data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.25"
									decorative
									orientation="vertical"
								/>
							) : null}
						</>
					))}
				</div>

				<div className="h-4/12 w-full gap-4 flex items-center justify-around">
					<div className="h-full w-1/2 p-3 bg-verdeEscuroForte rounded-lg overflow-auto">
						<div className="h-1/5 w-full flex items-center p-2 gap-2">
							<Mail className="text-white" />
							<span className="text-lg font-semibold text-white">
								NOTIFICAÇÕES
							</span>
						</div>
						<Separator.Root className="h-0.25 w-full m-auto bg-white" />
						{/* {messages.map((msg, index) => (
							<div
								key={index}
								className="h-1/5 w-full my-1 flex items-center p-2 bg-verdeMedio hover:bg-verdeEscuro rounded-lg cursor-pointer"
							>
								<span className="text-sm text-white">{msg}</span>
							</div>
						))} */}
					</div>
					<div className="h-full w-1/2 flex flex-col items-center justify-center p-2 bg-verdeEscuroForte rounded-lg">
						{/* <AgCharts className="h-full w-full" options={pieOptions} /> */}
					</div>
				</div>
				<div className="h-4/12 w-full rounded-lg p-1 box-border text-center shadow-xl bg-verdeEscuroForte">
					<AgCharts className="h-full w-full" options={lineOptions} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
