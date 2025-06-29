/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { Tabs } from "radix-ui";
import {
	Pencil,
	Trash2,
	Plus,
	FileSpreadsheet,
	Loader2,
	FileText,
	ListFilter,
	X,
} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ICellRendererParams,
	ColDef,
	themeQuartz,
} from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import {
	overlayLoadingTemplate,
	overlayNoRowsTemplate,
} from "../../utils/gridOverlays";
import {
	Modal,
	NoticeModal,
	ConfirmationModal,
	ReportModal,
} from "../../shared";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../utils/checkAuth";
import {
	BatchRegister,
	BatchUpdate,
	BatchDelete,
	FilterBatchModal,
} from "../pageComponents";
import {
	Batch,
	BatchOptions,
	SelectEvent,
	FormDataBatch,
	DeleteBatch,
	Product,
} from "../../utils/types";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function InventoryList() {
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openProductModal, setOpenProductModal] = useState(false);
	const [openFilterModal, setOpenFilterModal] = useState(false);
	const [openProductConfirmModal, setOpenProductConfirmModal] = useState(false);
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [options, setOptions] = useState<BatchOptions>();
	const [userLevel, setUserLevel] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState({
		product: false,
		supplier: false,
		unit: false,
		type: false,
		price: false,
		classification: false,
		storage: false,
		quantityMax: false,
		harvestDate: false,
		expirationDate: false,
	});
	const [formData, setFormData] = useState<FormDataBatch>({
		lote_id: 0,
		lote_codigo: "",
		produto: "",
		fornecedor: "",
		dt_colheita: "",
		quant_max: 0,
		quant_atual: 0,
		unidade: "",
		preco: 0.0,
		tipo: "",
		dt_validade: "",
		classificacao: "",
		localArmazenado: "",
		obs: "",
	});
	const [deleteBatch, setDeleteBatch] = useState<DeleteBatch>({
		lote_id: 0,
		lote_codigo: "",
		dproduto: "",
		reason: "",
	});
	const [rowData, setRowData] = useState<Batch[]>([]);
	const [isFiltered, setIsFiltered] = useState(false);

	/* ----- useEffects e Requisições via Axios ----- */

	//Checa a autenticação do usuário, se for false expulsa o usuário da sessão
	const navigate = useNavigate();

	// Seta o state do noticeModal para false após 5 segundos
	const handleNoticeModal = useCallback(() => {
		setTimeout(() => setOpenNoticeModal(false), 5000);
	}, []);

	const fetchData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "batches", "options"]));
			const [lotesResponse, userLevelResponse] = await Promise.all([
				axios.get("http://localhost/BioVerde/back-end/lotes/listar_lotes.php", {
					withCredentials: true,
					headers: { Accept: "application/json" },
				}),
				axios.get(
					"http://localhost/BioVerde/back-end/auth/usuario_logado.php",
					{
						withCredentials: true,
						headers: { "Content-Type": "application/json" },
					}
				),
			]);
			await fetchOptions();
			if (userLevelResponse.data.success) {
				setUserLevel(userLevelResponse.data.userLevel);
			} else {
				setOpenNoticeModal(true);
				setMessage(
					userLevelResponse.data.message || "Erro ao carregar nível do usuário"
				);
			}
			if (lotesResponse.data.success) {
				setRowData(lotesResponse.data.lotes);
			} else {
				setOpenNoticeModal(true);
				setMessage(lotesResponse.data.message || "Erro ao carregar lotes");
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				["batches", "options"].forEach((item) => newLoading.delete(item));
				return newLoading;
			});
		}
	};

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "batches"]));
			const lotesResponse = await axios.get(
				"http://localhost/BioVerde/back-end/lotes/listar_lotes.php",
				{ withCredentials: true }
			);
			if (lotesResponse.data.success) {
				setRowData(lotesResponse.data.lotes);
			} else {
				setMessage(lotesResponse.data.message || "Erro ao carregar dados");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("batches");
				return newLoading;
			});
		}
	};

	// Função que busca as opções
	const fetchOptions = async () => {
		try {
			setLoading((prev) => new Set([...prev, "options"]));
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/lotes/listar_opcoes.php",
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
					produtos: response.data.produtos,
					unidade_medida: response.data.unidade_medida,
					tipos: response.data.tp_produto,
					fornecedores: response.data.fornecedores,
					classificacoes: response.data.classificacao,
					locaisArmazenamento: response.data.localArmazenado,
				});
				setRowDataProduct(response.data.produtos);
			} else {
				setOpenNoticeModal(true);
				setMessage(response.data.message || "Erro ao carregar opções");
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("options");
				return newLoading;
			});
		}
	};

	/* ----- Função para Cadastro de Lotes ----- */

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		// Validações
		const errors = {
			product: !formData.produto,
			supplier: !formData.fornecedor,
			unit: !formData.unidade,
			type: !formData.tipo,
			price: !formData.preco,
			classification: !formData.classificacao,
			storage: !formData.localArmazenado,
			quantityMax: !formData.quant_max,
			harvestDate: !formData.dt_colheita,
			expirationDate: !formData.dt_validade,
		};
		setErrors(errors);
		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) {
			return;
		}

		setLoading((prev) => new Set([...prev, "register"]));
		console.log("Dados enviados no formData:", formData);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/cadastrar_lotes.php",
				formData,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setOpenRegisterModal(false);
				setSuccessMsg(true);
				setMessage(
					`Lote ${response.data.lote_codigo} foi cadastrado com sucesso!`
				);
				setOpenNoticeModal(true);
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message ?? "Erro ao cadastrar lote");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("register");
				return newLoading;
			});
		}
	};

	/* ----- Funções para Atualizar Lote após edição ----- */

	//Formata as Datas
	const formatDate = (dateString: string) =>
		new Date(dateString).toISOString().split("T")[0];

	//função para puxar os dados do lote que será editado
	const handleEdit = (lote: Batch) => {
		setFormData({
			lote_id: lote.lote_id,
			lote_codigo: lote.lote_codigo,
			produto: String(lote.produto_id),
			fornecedor: String(lote.fornecedor_id),
			quant_max: lote.lote_quantMax,
			quant_atual: lote.lote_quantAtual,
			unidade: String(lote.uni_id),
			preco: lote.produto_preco,
			dt_colheita: formatDate(lote.lote_dtColheita),
			tipo: String(lote.tproduto_id),
			dt_validade: formatDate(lote.lote_dtValidade),
			classificacao: String(lote.classificacao_id),
			localArmazenado: String(lote.localArmazenamento_id),
			obs: lote.lote_obs,
		});
		setOpenEditModal(true);
	};

	// função para atualizar o lote após a edição dele
	const handleUpdateBatch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "updateBatch"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/editar_lote.php",
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
				setOpenNoticeModal(true);
				setSuccessMsg(true);
				setMessage(
					`Lote ${response.data.lote_codigo} foi atualizado com sucesso!`
				);
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar lote.");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("updateBatch");
				return newLoading;
			});
		}
	};

	/* ----- Funções para Excluir Lote ----- */

	//função para puxar os dados do lote que será excluido
	const handleDelete = (lote: Batch) => {
		setDeleteBatch({
			lote_id: lote.lote_id,
			lote_codigo: lote.lote_codigo,
			dproduto: lote.produto_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	// função para excluir um lote
	const handleDeleteBatch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteBatch"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/excluir_lote.php",
				deleteBatch,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log(response.data);
			if (response.data.success) {
				await refreshData();
				setOpenConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Lote excluído com sucesso!");
				setOpenNoticeModal(true);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir lote.");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setMessage("Erro ao conectar com o servidor");
			setOpenNoticeModal(true);
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("deleteBatch");
				return newLoading;
			});
			handleNoticeModal();
		}
	};

	/* ----- Funções para CRUD de Produtos ----- */

	//Função para criar produto
	const createProduct = async (produtoNome: string) => {
		setLoading((prev) => new Set([...prev, "options"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/cadastrar_produto.php",
				{ produto: produtoNome },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await fetchOptions();
				setSuccessMsg(true);
				setMessage("Produto cadastrado com sucesso!");
				setOpenNoticeModal(true);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar Produto");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setMessage("Erro ao conectar com o servidor");
			setOpenNoticeModal(true);
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("options");
				return newLoading;
			});
		}
	};
	//Função para editar produto
	const updateProduct = async (id: number, editedValue: string) => {
		setLoading((prev) => new Set([...prev, "options"]));
		try {
			const dataToSend = {
				produto_id: id,
				produto_nome: editedValue,
			};

			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/editar_produto.php",
				dataToSend,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await fetchOptions();
				setSuccessMsg(true);
				setMessage("Produto atualizado com sucesso!");
				setOpenNoticeModal(true);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar Produto.");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setMessage("Erro ao conectar com o servidor");
			setOpenNoticeModal(true);
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("options");
				return newLoading;
			});
		}
	};

	//Função para excluir produto
	const [deletedId, setDeletedId] = useState<number | null>(null);

	const handleDeleteProduct = (produto: Product) => {
		setDeletedId(produto.produto_id);
		setOpenProductConfirmModal(true);
	};

	const deleteProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteProduct"]));

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/excluir_produto.php",
				{ produto_id: deletedId },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			if (response.data.success) {
				await fetchOptions();
				setOpenProductConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Produto excluído com sucesso!");
				setOpenNoticeModal(true);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir Produto.");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setSuccessMsg(false);
			setMessage("Erro ao conectar com o servidor");
			setOpenNoticeModal(true);
		} finally {
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("deleteProduct");
				return newLoading;
			});
		}
	};

	/* ----- Outras Funções ----- */

	//Verifica nível de acesso do usuário
	useCheckAccessLevel();

	//Para remover a barrinha vertical e a seta do select
	const customComponents = {
		DropdownIndicator: () => null,
		IndicatorSeparator: () => null,
	};

	//OnChange dos campos
	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| SelectEvent
	) => {
		const { name, value } = event.target;
		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in deleteBatch) {
			setDeleteBatch({ ...deleteBatch, [name]: value });
		}
		setErrors(
			(prevErrors) =>
				Object.fromEntries(
					Object.keys(prevErrors).map((key) => [key, false])
				) as typeof prevErrors
		);
	};

	//Capturar valor no campo de Preço
	const handlePriceChange = ({ value }: { value: string }) => {
		const formattedValue = parseFloat(value);

		setFormData({ ...formData, preco: formattedValue });
		setErrors((errors) => ({ ...errors, price: false }));
	};

	//Limpar FormData
	const clearFormData = () => {
		setFormData(
			Object.fromEntries(
				Object.entries(formData).map(([key, value]) => {
					return [key, typeof value === "number" ? 0 : ""];
				})
			) as unknown as FormDataBatch
		);
	};

	//Gerar Relatório
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");

	const generateReport = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));
		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/lotes.rel.php",
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
			handleNoticeModal();
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("reports");
				return newLoading;
			});
		}
	};

	/* ----- Definição de colunas e dados que a tabela de lotes vai receber ----- */

	const gridRef = useRef<AgGridReact>(null);
	const [columnDefs] = useState<ColDef[]>([
		{
			field: "lote_codigo",
			headerName: "ID do Lote",
			filter: true,
			width: 180,
		},
		{ field: "produto_nome", headerName: "Produto", filter: true, width: 200 },
		{
			field: "fornecedor_nome",
			headerName: "Fornecedor",
			filter: true,
			width: 200,
		},
		{
			headerName: "Data De Colheita",
			field: "lote_dtColheita",
			cellDataType: "date",
			filterParams: { maxNumConditions: 1 },
			filter: true,
			width: 200,
			valueGetter: (params) => new Date(params.data.lote_dtColheita),
			valueFormatter: (params) => {
				const date = params.value;
				return date instanceof Date && !isNaN(date.getTime())
					? date.toLocaleDateString("pt-BR")
					: "";
			},
		},
		{
			headerName: "Data De Validade",
			field: "lote_dtValidade",
			cellDataType: "date",
			filterParams: { maxNumConditions: 1 },
			filter: true,
			width: 180,
			valueGetter: (params) => new Date(params.data.lote_dtValidade),
			valueFormatter: (params) => {
				const date = params.value;
				return date instanceof Date && !isNaN(date.getTime())
					? date.toLocaleDateString("pt-BR")
					: "";
			},
		},
		{
			headerName: "Capacidade Máxima",
			width: 180,
			valueGetter: (params) => {
				const value = Number(params.data.lote_quantMax);
				return `${Number.isInteger(value) ? value : value.toFixed(2)}${
					params.data.uni_sigla
				}`;
			},
		},
		{
			headerName: "Quantidade Atual",
			width: 180,
			valueGetter: (params) => {
				const value = Number(params.data.lote_quantAtual);
				return `${Number.isInteger(value) ? value : value.toFixed(2)}${
					params.data.uni_sigla
				}`;
			},
		},
		{
			field: "produto_preco",
			headerName: "Preço Unitário",
			width: 150,
			filter: true,
			valueFormatter: (params) => {
				return `R$ ${Number(params.value).toFixed(2).replace(".", ",")}`;
			},
		},
		{
			field: "lote_preco",
			headerName: "Preço Total",
			width: 150,
			filter: true,
			valueFormatter: (params) => {
				return `R$ ${Number(params.value).toFixed(2).replace(".", ",")}`;
			},
		},
		{ field: "tproduto_nome", headerName: "Tipo", width: 150 },
		{ field: "classificacao_nome", headerName: "Classificação", width: 130 },
		{
			field: "localArmazenamento_nome",
			headerName: "Local Armazenado",
			width: 180,
		},
		{ field: "lote_obs", headerName: "Observação", width: 300 },
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellRenderer: (params: ICellRendererParams<Batch>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Editar Lote"
						onClick={() => {
							if (params.data) handleEdit(params.data);
							setSuccessMsg(true);
						}}
					>
						<Pencil size={18} />
					</button>
					{params.context.userLevel === "Administrador" && (
						<button
							className="text-red-600 hover:text-red-800 cursor-pointer"
							title="Excluir Lote"
							onClick={() => {
								if (params.data) handleDelete(params.data);
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

	/* ----- Definição de colunas e dados que da tabela de produtos ----- */

	const [rowDataProduct, setRowDataProduct] = useState<Product[]>([]);
	const [columnDefsProduct] = useState<ColDef[]>([
		{
			field: "produto_nome",
			headerName: "Produto",
			filter: true,
			flex: 1,
			editable: true,
		},
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellStyle: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			},
			cellRenderer: (params: ICellRendererParams) => {
				return (
					<div className="flex gap-2 items-center justify-center">
						<button
							className="text-blue-600 hover:text-blue-800 cursor-pointer"
							title="Editar Produto"
							onClick={() => {
								params.api.startEditingCell({
									rowIndex: Number(params.node.rowIndex),
									colKey: "produto_nome",
								});
							}}
						>
							<Pencil size={18} />
						</button>
						{params.context.userLevel === "Administrador" && (
							<button
								className="text-red-600 hover:text-red-800 cursor-pointer"
								title="Excluir Produto"
								onClick={() => handleDeleteProduct(params.data)}
							>
								<Trash2 size={18} />
							</button>
						)}
					</div>
				);
			},
			sortable: false,
			filter: false,
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
	const calculateMonthRange = useMemo(() => {
		const fullMonths = [0, 2, 4, 6, 7, 9, 11];

		const date = new Date();
		const month = date.getMonth();
		const year = date.getFullYear();

		const limit = fullMonths.includes(month)
			? date.getDate() - 31
			: date.getDate() - 30;

		const firstDay = date.getDate() / date.getDate();
		const lastDay = date.getDate() - limit;

		const start = new Date(year, month, firstDay).toISOString();
		const end = new Date(year, month, lastDay).toISOString();

		return { start, end };
	}, []);

	// Filtra lotes deste mês perto da data de validade
	const getExpiringBatches = useCallback(() => {
		try {
			// Checa se já tem um filtro
			if (gridRef.current?.api.isAnyFilterPresent()) return;

			const { start, end } = calculateMonthRange;

			gridRef.current?.api.setFilterModel({
				lote_dtValidade: {
					filterType: "date",
					type: "inRange",
					dateFrom: start,
					dateTo: end,
				},
			});

			setIsFiltered(true);
		} catch (error) {
			console.error(error);
		}
	}, [clearFilter]);

	useEffect(() => {
		checkAuth({ navigate, setMessage, setOpenNoticeModal });

		if (rowData.length > 0 && !message.includes(" sucesso!")) {
			rowData.map((row: Batch) => {
				if (
					row.lote_quantAtual >=
					row.lote_quantMax - row.lote_quantMax * 0.9
				) {
					try {
						setOpenNoticeModal(true);
						setMessage(row.lote_codigo + " está quase lotado!");
					} catch (err) {
						console.error(err);
					} finally {
						handleNoticeModal();
					}
				}
			});
		}
	}, [navigate, rowData]);

	//Carrega a lista os lotes e as opções nos selects ao renderizar a página
	useEffect(() => {
		fetchData();
	}, []);

	return (
		<>
			<Tabs.Content
				value="list"
				className="w-full flex flex-col py-2 lg:px-4 px-2"
			>
				{/* Botões de Exportar CSV e Novo Lote */}
				<div className="flex justify-between py-2">
					{/* Botão de Abrir Modal de Cadastro de Lote */}
					<div className="flex items-center gap-2">
						<button
							type="button"
							title="Novo Lote"
							disabled={loading.size > 0}
							className={`bg-verdePigmento font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed  place-content-center gap-2 ${
								window.innerWidth < 768 ? "p-2" : "py-2.5 px-4"
							}`}
							onClick={() => {
								setOpenRegisterModal(true);
								clearFormData();
							}}
						>
							<Plus />
							{window.innerWidth >= 768 && "Novo lote"}
						</button>
						<button
							onClick={() => setOpenFilterModal(true)}
							disabled={loading.size > 0 || isFiltered}
							title="Filtros"
							className={`md:hidden bg-gray-200 p-2 text-black font-semibold rounded cursor-pointer hover:bg-gray-300 flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
						>
							<ListFilter />
						</button>
						<button
							onClick={clearFilter}
							disabled={loading.size > 0 || !isFiltered}
							title="Limpar Filtros"
							className={`md:hidden bg-gray-200 p-2 text-black font-semibold rounded cursor-pointer hover:bg-gray-300 flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
						>
							<X />
						</button>
						<button
							className="bg-gray-100 hover:bg-gray-200 hidden md:flex transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed truncate"
							disabled={loading.size > 0 || isFiltered}
							onClick={() => {
								getExpiringBatches();
								reorderColumn("lote_dtValidade", "asc");
							}}
						>
							Expira esse mês
						</button>
						<button
							className="bg-gray-100 hover:bg-gray-200 hidden md:flex transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							disabled={loading.size > 0 || isFiltered}
							onClick={() => reorderColumn("lote_dtColheita", "desc")}
						>
							Recentes
						</button>
						<button
							className="bg-gray-100 hover:bg-gray-200 hidden md:flex transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
							disabled={loading.size > 0 || !isFiltered}
							onClick={clearFilter}
						>
							Limpar
						</button>
					</div>
					{/* Botão de exportar para CSV e PDF dos dados da tabela */}
					<div className="flex items-center gap-2">
						<button
							onClick={generateReport}
							disabled={loading.size > 0}
							className={`bg-red-700 font-semibold rounded text-white cursor-pointer hover:bg-red-800 flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
								window.innerWidth < 1024 ? "p-2" : "py-2.5 px-3 w-[165.16px]"
							}`}
						>
							{loading.has("reports") ? (
								<Loader2 className="animate-spin h-6 w-6" />
							) : (
								<>
									<FileText />
									{window.innerWidth >= 1024 && "Exportar PDF"}
								</>
							)}
						</button>
						<button
							className={`bg-verdeGrama font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
								window.innerWidth < 1024 ? "p-2" : "py-2.5 px-3 w-[165.16px]"
							}`}
							disabled={loading.size > 0}
							onClick={() => {
								const params = {
									fileName: "lotes.csv",
									columnSeparator: ";",
								};
								gridRef.current?.api.exportDataAsCsv(params);
							}}
						>
							<FileSpreadsheet />
							{window.innerWidth >= 1024 && "Exportar CSV"}
						</button>
					</div>
				</div>

				{/* Tabela de Lotes */}
				<div className="md:h-[75vh] h-[63vh]">
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
						loading={loading.has("batches")}
						overlayLoadingTemplate={overlayLoadingTemplate}
						overlayNoRowsTemplate={overlayNoRowsTemplate}
					/>
				</div>
			</Tabs.Content>

			{/* Modal de Cadastro de Lotes */}
			<Modal
				openModal={openRegisterModal}
				setOpenModal={setOpenRegisterModal}
				modalTitle="Cadastro de Lotes"
				withXButton
				isRegister
				registerButtonText="Cadastrar Lote"
				modalWidth="w-full md:w-4/5 lg:w-1/2"
				isLoading={loading.has("register")}
				onSubmit={handleRegister}
			>
				<BatchRegister
					formData={formData}
					options={options}
					loading={loading}
					errors={errors}
					userLevel={userLevel}
					openProductModal={() => setOpenProductModal(true)}
					createProduct={createProduct}
					handleChange={handleChange}
					handlePriceChange={handlePriceChange}
				/>
			</Modal>

			{/* Modal de Edição de Lotes */}
			<Modal
				openModal={openEditModal}
				setOpenModal={setOpenEditModal}
				modalTitle="Editar Lote"
				withXButton
				rightButtonText="Editar"
				leftButtonText="Cancelar"
				modalWidth="w-full md:w-4/5 lg:w-1/2"
				isLoading={loading.has("updateBatch")}
				onSubmit={handleUpdateBatch}
			>
				<BatchUpdate
					formData={formData}
					options={options}
					loading={loading}
					customComponents={customComponents}
					handleChange={handleChange}
					handlePriceChange={handlePriceChange}
				/>
			</Modal>

			{/* Modal de Exclusão */}
			<Modal
				openModal={openDeleteModal}
				setOpenModal={setOpenDeleteModal}
				modalTitle="Excluir Lote"
				withXButton
				rightButtonText="Excluir"
				leftButtonText="Cancelar"
				modalWidth="w-full md:w-4/5 lg:w-auto"
				onDelete={() => {
					setOpenConfirmModal(true);
					setOpenDeleteModal(false);
				}}
			>
				<BatchDelete
					deleteBatch={deleteBatch}
					loading={loading}
					handleChange={handleChange}
				/>
			</Modal>

			{/* Alert para confirmar exclusão do lote */}
			<ConfirmationModal
				openModal={openConfirmModal}
				setOpenModal={setOpenConfirmModal}
				confirmationModalTitle="Tem certeza que deseja excluir o lote?"
				confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
				onConfirm={handleDeleteBatch}
				isLoading={loading.has("deleteBatch")}
				confirmationLeftButtonText="Cancelar"
				confirmationRightButtonText="Sim, excluir lote"
			/>

			{/* Modal de Avisos */}
			{openNoticeModal && (
				<NoticeModal
					successMsg={successMsg}
					message={message}
					setOpenNoticeModal={setOpenNoticeModal}
				/>
			)}

			{/* Modal de Gerencimento de Produtos */}
			<Modal
				openModal={openProductModal}
				setOpenModal={setOpenProductModal}
				modalTitle="Gerenciamento de Produtos:"
				modalWidth="w-full md:w-4/5 lg:w-auto"
				withExitButton
				withXButton
				isLoading={loading.has("options")}
			>
				{/* Tabela de Produtos */}
				<div className="h-[65vh]">
					<AgGridReact
						modules={[AllCommunityModule]}
						theme={myTheme}
						ref={gridRef}
						rowData={rowDataProduct}
						columnDefs={columnDefsProduct}
						context={{ userLevel }}
						localeText={agGridTranslation}
						pagination
						paginationPageSize={10}
						paginationPageSizeSelector={[10, 25, 50, 100]}
						loading={loading.has("options")}
						overlayLoadingTemplate={overlayLoadingTemplate}
						overlayNoRowsTemplate={overlayNoRowsTemplate}
						onCellValueChanged={(params) => {
							updateProduct(params.data.produto_id, params.data.produto_nome);
						}}
					/>
				</div>
			</Modal>

			{/* Alert para confirmar exclusão do produto */}
			<ConfirmationModal
				openModal={openProductConfirmModal}
				setOpenModal={setOpenProductConfirmModal}
				confirmationModalTitle="Tem certeza que deseja excluir o produto?"
				confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
				onConfirm={deleteProduct}
				isLoading={loading.has("deleteProduct")}
				confirmationLeftButtonText="Cancelar"
				confirmationRightButtonText="Sim, excluir produto"
			/>

			{/* Modal de Filtros dos Lotes (Apenas Mobile) */}
			<FilterBatchModal
				openFilterModal={openFilterModal}
				setOpenFilterModal={setOpenFilterModal}
				loading={loading}
				isFiltered={isFiltered}
				getExpiringBatches={getExpiringBatches}
				reorderColumn={reorderColumn}
			/>

			{/* Modal de Relatório */}
			<ReportModal
				openModal={relatorioModalOpen}
				setOpenModal={setRelatorioModalOpen}
				reportUrl={relatorioContent}
				reportTitle="Relatório de Lotes"
				fileName="relatorio_lotes.pdf"
			/>
		</>
	);
}
