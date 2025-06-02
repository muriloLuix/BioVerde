import { useCallback, useEffect, useState } from "react";

import axios from "axios";

import { Separator } from "radix-ui";
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from "ag-charts-community";

import {
	Loader2,
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

	const [barOptions, setBarOptions] = useState<AgChartOptions>({
		series: [
			{
				type: "bar",
				xKey: "classificacao_nome",
				yKey: "quantity",
				label: {
					enabled: true,
					fontSize: 12,
				},
			},
		],
		axes: [
			{
				type: "number",
				position: "left",
				title: {
					enabled: true,
					text: "QUANTIDADE",
					color: "white",
					fontSize: 12,
					fontWeight: "bold",
					spacing: 8,
				},
				interval: {
					step: 3,
				},
			},
			{
				type: "category",
				position: "bottom",
				title: {
					enabled: true,
					text: "CLASSIFICAÇÃO",
					color: "white",
					fontSize: 12,
					fontWeight: "bold",
					spacing: 8,
				},
			},
		],
		title: {
			text: "QUALIDADE DOS LOTES",
			color: "#fff",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "inter",
		},
		background: {
			visible: false,
		},
		theme: {
			palette: {
				fills: ["limegreen"],
				strokes: ["limegreen"],
			},
			overrides: {
				bar: {
					series: {
						strokeWidth: 2,
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
	});
	const [pieOptions, setPieOptions] = useState<AgChartOptions>({
		series: [
			{
				type: "pie",
				angleKey: "value",
				legendItemKey: "label",
				fills: ["red", "limegreen"],
				sectorLabelKey: "value",
				sectorLabel: {
					enabled: true,
					formatter: ({ value }) => value,
					fontSize: 12,
					fontWeight: "lighter",
				},
			},
		],
		height: 240,
		width: 300,
		title: {
			text: "OCUPAÇÃO DO ESTOQUE",
			color: "white",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "inter",
		},
		background: {
			visible: false,
		},
		legend: {
			position: "bottom",
			spacing: 20,
			item: {
				marker: {
					size: 12,
					shape: "circle",
				},
				label: {
					color: "white",
				},
			},
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
	const [lineOptions, setLineOptions] = useState<AgChartOptions>({
		theme: {
			palette: {
				fills: ["#fff"],
				strokes: ["#fff"],
			},
			overrides: {
				line: {
					series: {
						strokeWidth: 3,
						marker: {
							size: 8,
							fill: "#fff",
							stroke: "#fff",
							shape: "square",
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
		series: [
			{
				type: "line",
				xKey: "monthName",
				yKey: "rawValue",
				yName: "Valor Bruto",
				stroke: "#00FF01",
			},
			{
				type: "line",
				xKey: "monthName",
				yKey: "quantity",
				yName: "Quantidade",
				stroke: "#228B22",
			},
		],
		title: {
			text: "FATURAMENTO",
			color: "#fff",
			fontSize: 20,
			fontWeight: "bold",
			fontFamily: "inter",
		},
		subtitle: {
			text: "2025",
			color: "#fff",
			fontSize: 12,
			fontFamily: "inter",
			fontWeight: "bold",
		},
		background: {
			visible: false,
		},
		legend: {
			enabled: false,
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

	const loadStatusData = useCallback(async () => {
		try {
			setIsLoading(true);
			const req = await axios.post(
				"http://localhost/BioVerde/back-end/pedidos/listar_pedidos_por_status.php",
				{
					start: "2025-01-01",
					end: "2025-12-31",
				}
			);

			setProducts(req.data.data);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadLineChart = useCallback(async () => {
		try {
			setIsLoading(true);
			const req = await axios.post(
				"http://localhost/BioVerde/back-end/pedidos/valor_total_pedidos.php",
				{
					start: "2025-01-01",
					end: "2025-12-31",
				}
			);

			setLineOptions({ ...lineOptions, data: req.data.data });
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadPieChart = useCallback(async () => {
		try {
			setIsLoading(true);

			const res = await axios.get(
				"http://localhost/BioVerde/back-end/estoque/listar_dados.php"
			);

			const data = res.data.data;

			const pieData = [
				{
					value: Number(data[0].estoque_atual),
					label: "Ocupado",
				},
				{
					value:
						Number(data[0].estoque_capacidadeMax) -
						Number(data[0].estoque_atual),
					label: "Disponível",
				},
			];

			setPieOptions({
				...pieOptions,
				data: pieData ?? [],
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const loadBarChart = useCallback(async () => {
		try {
			setIsLoading(true);
			const req = await axios.get(
				"http://localhost/BioVerde/back-end/lotes/lotes_por_classificacao.php"
			);

			console.log(req.data);
			setBarOptions({ ...barOptions, data: req.data.data });
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStatusData();
		loadLineChart();
		loadPieChart();
		loadBarChart();
	}, []);

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
					<div className="h-full w-1/2 bg-verdeEscuroForte rounded-lg">
						<AgCharts className="h-full w-full" options={barOptions} />
					</div>
					<div className="h-full w-1/2 flex flex-col items-center justify-center bg-verdeEscuroForte rounded-lg">
						<AgCharts className="h-full w-full" options={pieOptions} />
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
