/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import axios from "axios";
import { Tabs } from "radix-ui";
import {
	Pencil,
	Trash2,
	FileSpreadsheet,
	Loader2,
	FileText,
	Eye,
} from "lucide-react";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ICellRendererParams,
	ColDef,
	themeQuartz,
} from "ag-grid-community";

import { checkAuth } from "../../utils/checkAuth";
import { agGridTranslation } from "../../utils/agGridTranslation";
import {
	overlayLoadingTemplate,
	overlayNoRowsTemplate,
} from "../../utils/gridOverlays";
import { cepApi } from "../../utils/cepApi";
import {
	City,
	SelectEvent,
	UF,
	OrderOptions,
	Order,
	OrderItem,
	FormDataOrders,
	DeleteOrders,
} from "../../utils/types";
import { OrderUpdate, OrderDelete } from "../pageComponents";
import {
	ConfirmationModal,
	Modal,
	NoticeModal,
	ReportModal,
} from "../../shared";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function Orders() {
	const [activeTab, setActiveTab] = useState("list");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [openOrderModal, setOpenOrderModal] = useState(false);
	const [numOrder, setNumOrder] = useState(0);
	const [clientOrder, setClientOrder] = useState("");
	const [totalOrder, setTotalOrder] = useState(0);
	const [selectedOrder, setSelectedOrder] = useState<OrderItem[]>([]);
	const [message, setMessage] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [ufs, setUfs] = useState<UF[]>();
	const [cities, setCities] = useState<City[]>();
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [options, setOptions] = useState<OrderOptions>();
	const [errors, setErrors] = useState({
		isCepValid: false,
	});
	const [formData, setFormData] = useState<FormDataOrders>({
		pedido_id: 0,
		nome_cliente: "",
		tel: "",
		cep: "",
		status: "",
		endereco: "",
		num_endereco: "",
		complemento: "",
		estado: "",
		cidade: "",
		prev_entrega: "",
		obs: "",
	});
	const [deleteOrder, setDeleteOrder] = useState<DeleteOrders>({
		pedido_id: 0,
		dnum_pedido: 0,
		dnome_cliente: "",
		reason: "",
	});
	const [params] = useSearchParams();
	const [isFiltered, setIsFiltered] = useState(false);

	/* ----- useEffects e Requisições via Axios ----- */

	//Checa a autenticação do usuário, se for false expulsa o usuário da sessão
	const navigate = useNavigate();
	const url = useLocation();

	useEffect(() => {
		checkAuth({ navigate, setMessage, setOpenNoticeModal });
		fetchData();
	}, []);

	useEffect(() => {
		if (rowData.length > 0) {
			buildFilter();
		}
	}, [loading]);

	//Carrega os clientes e status do pedido
	const fetchOptions = async () => {
		try {
			setLoading((prev) => new Set([...prev, "options"]));

			const response = await axios.get(
				"http://localhost/BioVerde/back-end/pedidos/listar_opcoes.php",
				{
					withCredentials: true,
					headers: {
						Accept: "application/json",
						"Content-Type": "application/json",
					},
				}
			);
			if (response.data.success) {
				setOptions({
					clientes: response.data.clientes,
					status: response.data.status,
				});
			} else {
				setOpenNoticeModal(true);
				setMessage(response.data.message || "Erro ao carregar opções");
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("options");
				return newLoading;
			});
		}
	};

	const fetchData = async () => {
		try {
			setLoading(
				(prev) => new Set([...prev, "orders", "options", "ufs", "cities"])
			);

			const [pedidosResponse, userLevelResponse, ufsResponse, citiesResponse] =
				await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php",
						{ withCredentials: true, headers: { Accept: "application/json" } }
					),
					axios.get(
						"http://localhost/BioVerde/back-end/auth/usuario_logado.php",
						{
							withCredentials: true,
							headers: { "Content-Type": "application/json" },
						}
					),
					axios.get(
						"https://servicodados.ibge.gov.br/api/v1/localidades/estados"
					),
					axios.get(
						"https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
					),
				]);
			await fetchOptions();

			if (pedidosResponse.data.success) {
				setRowData(pedidosResponse.data.pedidos || []);
			} else {
				setOpenNoticeModal(true);
				setMessage(pedidosResponse.data.message || "Erro ao carregar pedidos");
			}

			if (userLevelResponse.data.success) {
				setUserLevel(userLevelResponse.data.userLevel);
			} else {
				setOpenNoticeModal(true);
				setMessage(
					userLevelResponse.data.message || "Erro ao carregar nível do usuário"
				);
			}

			if (ufsResponse.status === 200) {
				setUfs(ufsResponse.data);
			} else {
				setOpenNoticeModal(true);
				setMessage("Erro ao carregar UFs");
			}

			if (citiesResponse.status === 200) {
				setCities(citiesResponse.data);
			} else {
				setOpenNoticeModal(true);
				setMessage("Erro ao carregar municípios");
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				["orders", "ufs", "cities"].forEach((item) => newLoading.delete(item));
				return newLoading;
			});
		}
	};

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "orders"]));
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php",
				{ withCredentials: true }
			);

			if (response.data.success) {
				setRowData(response.data.pedidos || []);
			} else {
				setMessage(response.data.message || "Erro ao carregar pedidos");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("orders");
				return newLoading;
			});
		}
	};

	// ---------- Funções para edição do Pedido -----------

	//função para puxar os dados do pedido que será editado
	const handleEditClick = (pedido: Order) => {
		const formatDate = (isoDate: string) => {
			const date = new Date(isoDate);
			return date.toISOString().split("T")[0];
		};
		setFormData({
			pedido_id: pedido.pedido_id,
			nome_cliente: String(pedido.cliente_id),
			tel: pedido.pedido_telefone,
			cep: pedido.pedido_cep,
			status: String(pedido.stapedido_id),
			endereco: pedido.pedido_endereco,
			num_endereco: pedido.pedido_num_endereco,
			complemento: pedido.pedido_complemento,
			estado: pedido.pedido_estado,
			cidade: pedido.pedido_cidade,
			prev_entrega: formatDate(pedido.pedido_prevEntrega),
			obs: pedido.pedido_observacoes,
		});
		setOpenEditModal(true);
	};

	// submit para atualizar o pedido após a edição dele
	const handleUpdateOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		if (errors.isCepValid) return;
		setLoading((prev) => new Set([...prev, "updateOrder"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/pedidos/editar.pedido.php",
				formData,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setOpenEditModal(false);
				setSuccessMsg(true);
				setMessage("Pedido atualizado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar pedido.");
			}
		} catch (error) {
			setSuccessMsg(false);
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setOpenNoticeModal(true);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("updateOrder");
				return newLoading;
			});
		}
	};

	// ---------- Funções para exclusão do Pedido -----------

	//função para puxar o nome do pedido que será excluido
	const handleDeleteClick = (pedido: Order) => {
		setDeleteOrder({
			pedido_id: pedido.pedido_id,
			dnum_pedido: pedido.pedido_id,
			dnome_cliente: pedido.cliente_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	// submit para excluir um pedido
	const handleDeleteOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "deleteOrder"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/pedidos/excluir.pedido.php",
				deleteOrder,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Pedido Excluído com sucesso!");
				setOpenConfirmModal(false);
			} else {
				setMessage(response.data.message || "Erro ao excluir pedido.");
			}
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				setMessage(error.response.data.message || "Erro no servidor");
				console.error("Erro na resposta:", error.response.data);
			} else {
				setMessage("Erro ao conectar com o servidor");
				console.error("Erro na requisição:", error);
			}
		} finally {
			setOpenNoticeModal(true);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("deleteOrder");
				return newLoading;
			});
		}
	};

	/* ----- Outras Funções ----- */

	//Verifica nível de acesso do usuário
	useCheckAccessLevel();

	//OnChange dos campos
	const handleChange = (
		event:
			| React.ChangeEvent<
					HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			  >
			| InputMaskChangeEvent
			| SelectEvent
	) => {
		const { name, value } = event.target;

		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in deleteOrder) {
			setDeleteOrder({ ...deleteOrder, [name]: value });
		}
		setErrors({ isCepValid: false });
	};

	const handleCities = async (id: number | undefined) => {
		if (formData.estado) {
			try {
				const response = await axios.get(
					`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}/municipios`
				);
				if (response.status === 200) {
					setCities(response.data);
				}
			} catch (err) {
				console.log(err);
			}
		}
	};

	const generateReport = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));

		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/ped.rel.php",
				{
					responseType: "blob",
					withCredentials: true,
				}
			);

			const contentType = response.headers["content-type"];

			if (contentType !== "application/pdf") {
				const errorText = await response.data.text();
				throw new Error(`Erro ao gerar relatório: ${errorText}`);
			}

			const fileURL = URL.createObjectURL(
				new Blob([response.data], { type: "application/pdf" })
			);
			setRelatorioContent(fileURL);
			setRelatorioModalOpen(true);
		} catch (error) {
			console.error("Erro ao gerar relatório:", error);
			setMessage("Erro ao gerar relatório");
			setOpenNoticeModal(true);
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("reports");
				return newLoading;
			});
		}
	};

	//Função para chamar a api de CEP
	const handleCepBlur = () => {
		setSuccessMsg(false);
		cepApi(
			formData.cep,
			setFormData,
			setOpenNoticeModal,
			setMessage,
			setSuccessMsg,
			setCities,
			setErrors
		);
	};

	//Limpar FormData
	const clearFormData = () =>
		setFormData(
			(prev) =>
				Object.fromEntries(
					Object.entries(prev).map(([key, value]) => {
						if (key === "nome_cliente") {
							return [key, { value: "", label: "" }];
						}
						return [key, typeof value === "number" ? 0 : ""];
					})
				) as typeof prev
		);

	const handleSeeOrderClick = (pedido: Order) => {
		setNumOrder(pedido.pedido_id);
		setClientOrder(pedido.cliente_nome);
		setTotalOrder(pedido.pedido_valor_total);
		setSelectedOrder(pedido.pedido_itens);
		setOpenOrderModal(true);
	};

	/* ----- Definição de colunas e dados que a tabela de Pedidos vai receber ----- */

	const [rowData, setRowData] = useState<Order[]>([]);
	const gridRef = useRef<AgGridReact>(null);
	const [columnDefs] = useState<ColDef[]>([
		{
			field: "pedido_id",
			headerName: "ID",
			cellDataType: "number",
			filter: true,
			width: 100,
		},
		{
			field: "cliente_nome",
			headerName: "Cliente",
			cellDataType: "string",
			filter: true,
			width: 250,
		},
		{
			field: "pedido_dtCadastro",
			headerName: "Data do Pedido",
			cellDataType: "date",
			filterParams: { maxNumConditions: 1 },
			filter: true,
			width: 180,
			valueGetter: (params) => new Date(params.data.pedido_dtCadastro),
		},
		{
			field: "pedido_prevEntrega",
			headerName: "Previsão de entrega",
			cellDataType: "date",
			filterParams: { maxNumConditions: 1 },
			filter: true,
			width: 180,
			valueGetter: (params) => new Date(params.data.pedido_dtCadastro),
		},
		{
			field: "stapedido_nome",
			headerName: "Status do Pedido",
			cellDataType: "string",
			filter: true,
			width: 200,
		},
		{
			headerName: "Itens do Pedido",
			field: "pedidoitem_id",
			width: 150,
			cellRenderer: (params: ICellRendererParams<Order>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Visualizar itens do pedido"
						onClick={() => {
							if (params.data) handleSeeOrderClick(params.data);
						}}
					>
						<Eye size={18} />
					</button>
				</div>
			),
			sortable: false,
			filter: false,
		},
		{
			field: "pedido_valor_total",
			headerName: "Valor Total",
			cellDataType: "number",
			width: 130,
			valueFormatter: (params) =>
				`R$ ${Number(params.value).toFixed(2).replace(".", ",")}`,
		},
		{
			field: "pedido_telefone",
			headerName: "Telefone",
			filter: true,
			width: 160,
		},
		{ field: "pedido_cep", headerName: "CEP", filter: true, width: 180 },
		{ field: "pedido_endereco", headerName: "Endereço", width: 200 },
		{
			field: "pedido_num_endereco",
			headerName: "Nº",
			cellDataType: "number",
			width: 100,
			valueGetter: (params) => Number(params.data.pedido_num_endereco),
		},
		{ field: "pedido_complemento", headerName: "Complemento", width: 180 },
		{ field: "pedido_cidade", headerName: "Cidade", filter: true, width: 180 },
		{ field: "pedido_estado", headerName: "Estado", filter: true, width: 120 },
		{ field: "pedido_observacoes", headerName: "Observações", width: 200 },
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellRenderer: (params: ICellRendererParams<Order>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Editar Pedido"
						onClick={() => {
							if (params.data) {
								handleEditClick(params.data);
								setErrors({ isCepValid: false });
							}
						}}
					>
						<Pencil size={18} />
					</button>
					{params.context.userLevel === "Administrador" && (
						<button
							className="text-red-600 hover:text-red-800 cursor-pointer"
							title="Excluir Pedido"
							onClick={() => {
								if (params.data) handleDeleteClick(params.data);
							}}
						>
							<Trash2 size={18} />
						</button>
					)}
				</div>
			),
			pinned: "right",
			sortable: false,
			filter: false,
		},
	]);

	/* ----- Definição de colunas e dados que a tabela de Itens do Pedido vai receber ----- */

	const [columnDefsItems] = useState<ColDef[]>([
		{ field: "pedidoitem_id", headerName: "ID", width: 50, filter: true },
		{ field: "produto_nome", headerName: "Produto", width: 180 },
		{ field: "pedidoitem_quantidade", headerName: "Qtd.", width: 110 },
		{
			field: "pedidoitem_preco",
			headerName: "Preço Unitário",
			width: 150,
			valueFormatter: (params) =>
				`R$ ${Number(params.value).toFixed(2).replace(".", ",")}`,
		},
		{
			field: "pedidoitem_subtotal",
			headerName: "Subtotal",
			width: 140,
			valueFormatter: (params) =>
				`R$ ${Number(params.value).toFixed(2).replace(".", ",")}`,
		},
	]);

	//Esilos da Tabela
	const myTheme = themeQuartz.withParams({
		spacing: 9,
		headerBackgroundColor: "#89C988",
		foregroundColor: "#1B1B1B",
		rowHoverColor: "#E2FBE2",
		oddRowBackgroundColor: "#f5f5f5",
		fontFamily: '"Inter", sans-serif',
	});

	// Cria um filtro com o paramtro status da url
	const buildFilter = () => {
		try {
			const param = params.get("status");

			// Checa se param tem valor
			if (param) {
				gridRef.current?.api.setFilterModel({
					stapedido_nome: {
						type: "lessThan",
						filter: param,
					},
				});
			}
		} catch (err) {
			console.error(err);
		} finally {
			navigate(url.pathname, { replace: true });
			setIsFiltered(true);
		}
	};

	// Limpa o filtro
	const clearFilter = useCallback(() => {
		gridRef.current?.api.setFilterModel(null);
		gridRef.current?.api.resetColumnState();
		setIsFiltered(false);
	}, []);

	// Ordena a coluna
	const reorderColumn = useCallback(
		(columnName: string, type: "asc" | "desc" | null) => {
			gridRef.current?.api.applyColumnState({
				state: [{ colId: columnName, sort: type }],
			});
			setIsFiltered(true);
		},
		[clearFilter]
	);

	// Calcula dia inicial e final do mês atual
	const calculateMonthRange = useCallback(() => {
		const fullMonths = [0, 2, 4, 6, 7, 9, 11];

		const date = new Date();
		const month = date.getMonth();
		const year = date.getFullYear();

		const limit = fullMonths.includes(month)
			? date.getDate() - 31
			: date.getDate() - 30;

		const firstDay = date.getDate() / date.getDate();
		const lastDay = date.getDate() - limit;

		const begin = new Date(year, month, firstDay).toISOString();
		const end = new Date(year, month, lastDay).toISOString();

		return { begin, end };
	}, []);

	// Filtra pedidos do mês pelo status selecionado
	const getMonthOrdersByStatus = useCallback(
		(type: string, filter: string) => {
			try {
				// Checa se já tem um filtro
				if (gridRef.current?.api.isAnyFilterPresent()) return;

				const { begin, end } = calculateMonthRange();

				gridRef.current?.api.setFilterModel({
					pedido_prevEntrega: {
						filterType: "date",
						type: "inRange",
						dateFrom: begin,
						dateTo: end,
					},
					stapedido_nome: {
						filterType: "string",
						type: type,
						filter: filter,
					},
				});

				setIsFiltered(true);
			} catch (error) {
				console.error(error);
			}
		},
		[clearFilter]
	);

	return (
		<div className="flex-1 p-6 pl-[280px]">
			<div className="px-6 font-[inter] bg-brancoSal">
				<h1 className="h-10 w-full flex items-center justify-center mb-3">
					<span className="text-4xl font-semibold text-center">Pedidos</span>
				</h1>
				{/* Selelcionar Abas */}
				<Tabs.Root
					defaultValue="list"
					className="w-full"
					onValueChange={(value) => setActiveTab(value)}
				>
					<Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
						<Tabs.Trigger
							value="list"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "list" ? "select animation-tab" : ""
							}`}
						>
							Lista de Pedidos
						</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content
						value="list"
						className="flex flex-col w-full py-2 px-4 gap-2"
					>
						<div className="flex justify-between p-2">
							<div className="flex items-center gap-2">
								<button
									disabled={loading.size > 0 || isFiltered}
									className="bg-gray-100 hover:bg-gray-200 transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={() => {
										getMonthOrdersByStatus("lessThan", "Entregue");
										reorderColumn("pedido_prevEntrega", "asc");
									}}
								>
									Concluídos no último mês
								</button>
								<button
									disabled={loading.size > 0 || isFiltered}
									className="bg-gray-100 hover:bg-gray-200 transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={() => {
										getMonthOrdersByStatus("notEqual", "Entregue");
										reorderColumn("pedido_prevEntrega", "asc");
									}}
								>
									Entrega próxima
								</button>
								<button
									disabled={loading.size > 0 || isFiltered}
									className="bg-gray-100 hover:bg-gray-200 transition-colors delay-100 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={() => reorderColumn("pedido_dtCadastro", "asc")}
								>
									Recentes
								</button>
								<button
									disabled={loading.size > 0 || !isFiltered}
									className="bg-gray-100 hover:bg-gray-200 transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={clearFilter}
								>
									Limpar filtro
								</button>
							</div>
							<div className="flex items-center gap-2">
								<button
									disabled={loading.size > 0}
									className="bg-red-700 py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-red-800 flex place-content-center gap-2 transition-colors delay-75 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={generateReport}
								>
									{loading.has("reports") ? (
										<Loader2 className="animate-spin h-6 w-6" />
									) : (
										<>
											<FileText />
											Exportar PDF
										</>
									)}
								</button>
								<button
									disabled={loading.size > 0}
									className="bg-verdeGrama py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex place-content-center gap-2 transition-colors delay-75 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
									onClick={() => {
										const params = {
											fileName: "pedidos.csv",
											columnSeparator: ";",
										};
										gridRef.current?.api.exportDataAsCsv(params);
									}}
								>
									<FileSpreadsheet />
									Exportar CSV
								</button>
							</div>
						</div>

						{/* Tabela de pedidos */}
						<div className="h-[75vh]">
							<AgGridReact
								modules={[AllCommunityModule]}
								theme={myTheme}
								ref={gridRef}
								rowData={rowData}
								columnDefs={columnDefs}
								context={{ userLevel }}
								localeText={agGridTranslation}
								pagination
								paginationPageSize={10}
								paginationPageSizeSelector={[10, 25, 50, 100]}
								loading={loading.has("orders")}
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{/* Modal de Pedidos */}
				<Modal
					isOrderModal
					withExitButton
					openModal={openOrderModal}
					setOpenModal={setOpenOrderModal}
					modalWidth="min-w-[700px] min-h-[40vh]"
					modalTitle={
						<span>
							Nº do Pedido: <span className="font-normal">{numOrder}</span>
						</span>
					}
					modalSecondTitle={
						<span>
							Cliente: <span className="font-normal">{clientOrder}</span>
						</span>
					}
					totalPedido={selectedOrder.length > 0 ? totalOrder : 0}
				>
					{/* Tabela de Itens dos Pedidos */}
					{selectedOrder.length > 0 ? (
						<div className="h-[40vh]">
							<AgGridReact
								modules={[AllCommunityModule]}
								theme={myTheme}
								ref={gridRef}
								rowData={selectedOrder}
								columnDefs={columnDefsItems}
								localeText={agGridTranslation}
								pagination
								paginationPageSize={10}
								paginationPageSizeSelector={[10, 25, 50, 100]}
								loading={loading.has("orders")}
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
							/>
						</div>
					) : (
						<p className="flex justify-center items-center flex-1">
							Esse pedido não possui itens cadastrados.
						</p>
					)}
				</Modal>

				{/* Modal de Relatório */}
				<ReportModal
					openModal={relatorioModalOpen}
					setOpenModal={setRelatorioModalOpen}
					reportUrl={relatorioContent}
					reportTitle="Relatório de Pedidos"
					fileName="relatorio_pedidos.pdf"
				/>

				{/* Modal de Avisos */}
				<NoticeModal
					openModal={openNoticeModal}
					setOpenModal={setOpenNoticeModal}
					successMsg={successMsg}
					message={message}
				/>

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Pedido:"
					rightButtonText="Editar"
					leftButtonText="Cancelar"
					modalWidth="w-1/2"
					isLoading={loading.has("updateOrder")}
					onSubmit={handleUpdateOrder}
				>
					<OrderUpdate
						formData={formData}
						loading={loading}
						ufs={ufs}
						cities={cities}
						errors={errors}
						options={options}
						handleCities={handleCities}
						handleCepBlur={handleCepBlur}
						handleChange={handleChange}
					/>
				</Modal>

				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Pedido:"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<OrderDelete deleteOrder={deleteOrder} handleChange={handleChange} />
				</Modal>

				{/* Alert para confirmar exclusão do pedido */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o pedido?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteOrder}
					isLoading={loading.has("deleteOrder")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir pedido"
				/>
			</div>
		</div>
	);
}
