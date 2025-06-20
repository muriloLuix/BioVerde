import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { checkAuth } from "../../utils/checkAuth";
import { Tabs } from "radix-ui";
import { useNavigate } from "react-router-dom";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ICellRendererParams,
	CellValueChangedEvent,
	ColDef,
	themeQuartz,
} from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import {
	overlayLoadingTemplate,
	overlayNoRowsTemplate,
} from "../../utils/gridOverlays";
import {
	Pencil,
	Trash2,
	Plus,
	FileSpreadsheet,
	Loader2,
	FileText,
} from "lucide-react";
import { cepApi } from "../../utils/cepApi";
import {
	Supplier,
	SelectEvent,
	UF,
	City,
	FormDataSupplier,
	DeleteSupplier,
} from "../../utils/types";
import {
	SupplierRegister,
	SupplierUpdate,
	SupplierDelete,
} from "../pageComponents";
import {
	ConfirmationModal,
	Modal,
	NoticeModal,
	ReportModal,
} from "../../shared";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function Suppliers() {
	const [activeTab, setActiveTab] = useState("list");
	const [supplierType, setSupplierType] = useState("juridica");
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [message, setMessage] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [ufs, setUfs] = useState<UF[]>();
	const [cities, setCities] = useState<City[]>();
	const [errors, setErrors] = useState({
		states: false,
		cities: false,
		isCepValid: false,
	});
	const [formData, setFormData] = useState<FormDataSupplier>({
		fornecedor_id: 0,
		nome_empresa_fornecedor: "",
		razao_social: "",
		email: "",
		tel: "",
		cpf_cnpj: "",
		tipo: "juridica",
		cep: "",
		endereco: "",
		estado: "",
		cidade: "",
		num_endereco: 0,
		complemento: "",
		status: "1",
	});
	const [deleteSupplier, setDeleteSupplier] = useState<DeleteSupplier>({
		fornecedor_id: 0,
		dnome_empresa: "",
		reason: "",
	});

	/* ----- useEffects e Requisições via Axios ----- */

	//Checa a autenticação do usuário, se for false expulsa o usuário da sessão
	const navigate = useNavigate();
	useEffect(() => {
		checkAuth({ navigate, setMessage, setOpenNoticeModal });
	}, [navigate]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading((prev) => new Set([...prev, "suppliers", "ufs", "cities"]));
				const [
					fornecedoresResponse,
					userLevelResponse,
					ufsResponse,
					citiesResponse,
				] = await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/fornecedores/listar_fornecedores.php",
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
				console.log("Resposta do back-end:", fornecedoresResponse.data);

				if (fornecedoresResponse.data.success) {
					setRowData(fornecedoresResponse.data.fornecedores || []);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						fornecedoresResponse.data.message || "Erro ao carregar fornecedores"
					);
				}

				if (userLevelResponse.data.success) {
					setUserLevel(userLevelResponse.data.userLevel);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						userLevelResponse.data.message ||
							"Erro ao carregar nível do usuário"
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
					["suppliers", "ufs", "cities"].forEach((item) =>
						newLoading.delete(item)
					);
					return newLoading;
				});
			}
		};
		fetchData();
	}, []);

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "suppliers"]));
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/fornecedores/listar_fornecedores.php",
				{ withCredentials: true }
			);
			if (response.data.success) {
				setRowData(response.data.fornecedores || []);
			} else {
				setMessage(response.data.message || "Erro ao carregar fornecedores");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("suppliers");
				return newLoading;
			});
		}
	};

	/* ----- Funções para CRUD de Fornecedores ----- */

	//Submit de cadastrar fornecedores
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const error = {
			states: !formData.estado,
			cities: !formData.cidade,
			isCepValid: errors.isCepValid,
		};
		setErrors(error);
		if (Object.values(error).some((error) => error)) {
			return;
		}

		setLoading((prev) => new Set([...prev, "submit"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/fornecedores/cadastrar_fornecedores.php",
				formData,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setOpenRegisterModal(false);
				setMessage("Fornecedor cadastrado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar fornecedor");
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
				newLoading.delete("submit");
				return newLoading;
			});
		}
	};

	//função para puxar os dados do fornecedor que será editado
	const handleEditClick = (fornecedor: Supplier) => {
		cepApi(
			fornecedor.fornecedor_cep,
			setFormData,
			setOpenNoticeModal,
			setMessage,
			setSuccessMsg,
			setCities,
			setErrors
		);
		setFormData({
			fornecedor_id: fornecedor.fornecedor_id,
			nome_empresa_fornecedor: fornecedor.fornecedor_nome,
			razao_social: fornecedor.fornecedor_razao_social,
			email: fornecedor.fornecedor_email,
			tel: fornecedor.fornecedor_telefone,
			cpf_cnpj: fornecedor.fornecedor_documento,
			status: String(fornecedor.estaAtivo),
			cep: fornecedor.fornecedor_cep,
			endereco: fornecedor.fornecedor_endereco,
			estado: fornecedor.fornecedor_estado,
			cidade: fornecedor.fornecedor_cidade,
			num_endereco: fornecedor.fornecedor_num_endereco,
			complemento: fornecedor.fornecedor_complemento,
			tipo: fornecedor.fornecedor_tipo,
		});
		setSupplierType(fornecedor.fornecedor_tipo);
		setOpenEditModal(true);
	};

	// submit para atualizar o fornecedor após a edição dele
	const handleUpdateSupplier = async (e: React.FormEvent) => {
		e.preventDefault();
		if (errors.isCepValid) {
			return;
		}
		setLoading((prev) => new Set([...prev, "updateSupplier"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/fornecedores/editar.fornecedor.php",
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
				setMessage("Fornecedor atualizado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar fornecedor.");
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
				newLoading.delete("updateSupplier");
				return newLoading;
			});
		}
	};

	//função para puxar o nome do fornecedor que será excluido
	const handleDeleteClick = (fornecedor: Supplier) => {
		setDeleteSupplier({
			fornecedor_id: fornecedor.fornecedor_id,
			dnome_empresa: fornecedor.fornecedor_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	// submit para excluir um fornecedor
	const handleDeleteSupplier = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteSupplier"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/fornecedores/excluir.fornecedor.php",
				deleteSupplier,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Fornecedor Excluído com sucesso!");
				setOpenConfirmModal(false);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir fornecedor.");
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
				newLoading.delete("deleteSupplier");
				return newLoading;
			});
		}
	};

	//Função para Atualizar o Status do fornecedor
	const handleStatusChange = async (
		params: CellValueChangedEvent<Supplier>
	) => {
		if (params.colDef?.field === "estaAtivo") {
			const dataToSend = {
				fornecedor_id: params.data?.fornecedor_id,
				estaAtivo: params.data?.estaAtivo,
			};
			try {
				const response = await axios.post(
					"http://localhost/BioVerde/back-end/fornecedores/atualizar.status.fornecedor.php",
					dataToSend,
					{
						headers: { "Content-Type": "application/json" },
						withCredentials: true,
					}
				);
				console.log("Resposta do back-end:", response.data);
				if (response.data.success) {
					await refreshData();
				} else {
					setSuccessMsg(false);
					setMessage(response.data.message || "Erro ao atualizar status.");
					setOpenNoticeModal(true);
				}
			} catch (error) {
				console.error(error);
				setMessage("Erro ao conectar com o servidor");
				setOpenNoticeModal(true);
			}
		}
	};

	/* ----- Outras Funções ----- */

	//Verifica nível de acesso do usuário
	useCheckAccessLevel();

	//OnChange dos campos
	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| InputMaskChangeEvent
			| SelectEvent
	) => {
		const { name, value } = event.target;

		if (name === "tipo") {
			const tipo = value ?? "juridica";
			setSupplierType(String(tipo));

			if (tipo === "fisica") {
				setFormData((prev) => ({
					...prev,
					tipo,
					cpf_cnpj: "",
					razao_social: "",
					nome_empresa_fornecedor: "",
				}));
			} else if (tipo === "juridica") {
				setFormData((prev) => ({
					...prev,
					tipo,
					cpf_cnpj: "",
					nome_empresa_fornecedor: "",
				}));
			}
			return;
		}

		if (name in formData) {
			if (name === "num_endereco") {
				setFormData({ ...formData, [name]: value === "" ? 0 : Number(value) });
			} else {
				setFormData({ ...formData, [name]: value });
			}
		}
		if (name in deleteSupplier) {
			setDeleteSupplier({ ...deleteSupplier, [name]: value });
		}
		setErrors(
			(prevErrors) =>
				Object.fromEntries(
					Object.keys(prevErrors).map((key) => [key, false])
				) as typeof prevErrors
		);
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

	// API para buscar cidades de acordo com o estado
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

	// Função para Gerar Relatório PDF
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const gerarRelatorio = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));
		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/for.rel.php",
				{ responseType: "blob", withCredentials: true }
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

	//Limpar FormData
	const clearFormData = () => {
		setFormData(
			(prev) =>
				Object.fromEntries(
					Object.entries(prev).map(([key, value]) => {
						if (key === "tipo") return [key, "juridica"];
						if (key === "status") return [key, "1"];
						return [key, typeof value === "number" ? 0 : ""];
					})
				) as unknown as FormDataSupplier
		);
	};

	/* ----- Definição de colunas e dados que a tabela de Fornecedores vai receber ----- */

	const gridRef = useRef<AgGridReact>(null);
	const [rowData, setRowData] = useState<Supplier[]>([]);
	const [columnDefs] = useState<ColDef[]>([
		{ field: "fornecedor_id", headerName: "ID", filter: true, width: 100 },
		{
			field: "fornecedor_nome",
			headerName: "Nome Fornecedor/Empresa",
			filter: true,
			width: 250,
		},
		{
			field: "fornecedor_tipo",
			headerName: "Tipo",
			filter: true,
			width: 150,
			valueGetter: (params) =>
				params.data.fornecedor_tipo === "juridica"
					? "Pessoa Jurídica"
					: "Pessoa Física",
		},
		{
			field: "fornecedor_documento",
			headerName: "CPF/CNPJ",
			filter: true,
			width: 180,
		},
		{
			field: "fornecedor_email",
			headerName: "Email",
			filter: true,
			width: 180,
		},
		{
			field: "estaAtivo",
			headerName: "Ativo / Inativo",
			width: 130,
			cellRenderer: "agCheckboxCellRenderer",
			cellRendererParams: { disabled: false },
			valueGetter: (params) => params.data.estaAtivo === "1",
			valueSetter: (params) => {
				params.data.estaAtivo = params.newValue ? "1" : "0";
				return true;
			},
			editable: true,
			cellStyle: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			},
		},
		{
			field: "fornecedor_telefone",
			headerName: "Telefone",
			filter: true,
			width: 180,
		},
		{
			field: "fornecedor_razao_social",
			headerName: "Razão Social",
			width: 180,
		},
		{ field: "fornecedor_cep", headerName: "CEP", filter: true, width: 150 },
		{ field: "fornecedor_endereco", headerName: "Endereço", width: 180 },
		{ field: "fornecedor_num_endereco", headerName: "Nº", width: 100 },
		{ field: "fornecedor_complemento", headerName: "Complemento", width: 180 },
		{ field: "fornecedor_cidade", headerName: "Cidade", width: 180 },
		{ field: "fornecedor_estado", headerName: "Estado", width: 100 },
		{
			field: "fornecedor_dtcadastro",
			headerName: "Data de Cadastro",
			width: 180,
			valueGetter: (params) =>
				new Date(params.data.fornecedor_dtcadastro).toLocaleDateString("pt-BR"),
		},
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellRenderer: (params: ICellRendererParams<Supplier>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Editar Fornecedor"
						onClick={() => {
							if (params.data) {
								handleEditClick(params.data);
								setErrors({ ...errors, isCepValid: false });
							}
						}}
					>
						<Pencil size={18} />
					</button>
					{params.context.userLevel === "Administrador" && (
						<button
							className="text-red-600 hover:text-red-800 cursor-pointer"
							title="Excluir Fornecedor"
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

	//Esilos da Tabela
	const myTheme = themeQuartz.withParams({
		spacing: 9,
		headerBackgroundColor: "#89C988",
		foregroundColor: "#1B1B1B",
		rowHoverColor: "#E2FBE2",
		oddRowBackgroundColor: "#f5f5f5",
		fontFamily: '"Inter", sans-serif',
	});

	return (
		<div className="flex-1 lg:p-6 lg:pl-[280px] pt-20">
			<div className="lg:px-6 px-3 font-[inter]">
				<h1 className="h-10 w-full flex items-center justify-center mb-3">
					<span className="text-4xl font-semibold text-center">
						Fornecedores
					</span>
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
							Lista
						</Tabs.Trigger>
					</Tabs.List>
					{/* Aba de Lista de Fornecedores */}
					<Tabs.Content
						value="list"
						className="w-full flex flex-col py-2 lg:px-4 px-2"
					>
						<div className="flex justify-between">
							{/* Botão de Abrir Modal de Cadastro de Fornecedor */}
							<div className="mt-1 mb-3">
								<button
									type="button"
									disabled={loading.size > 0}
									className={`bg-verdePigmento font-semibold py-2.5 px-4 rounded text-white cursor-pointer hover:bg-verdeGrama flex disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed  place-content-center gap-2`}
									onClick={() => {
										setOpenRegisterModal(true);
										clearFormData();
										setSupplierType("juridica");
									}}
								>
									<Plus />
									Novo Fornecedor
								</button>
							</div>
							{/* Botão de exportar para CSV e PDF dos dados da tabela */}
							<div className="flex items-center gap-5 mt-1 mb-3">
								<button
									title="Exportar PDF"
									onClick={gerarRelatorio}
									disabled={loading.size > 0}
									className={`bg-red-700 font-semibold rounded text-white cursor-pointer
									hover:bg-red-800 flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 
									disabled:cursor-not-allowed 
									${
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
									onClick={() => {
										const params = {
											fileName: "fornecedores.csv",
											columnSeparator: ";",
										};
										gridRef.current?.api.exportDataAsCsv(params);
									}}
									title="Exportar CSV"
									disabled={loading.size > 0}
									className={`bg-verdeGrama font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 
									disabled:cursor-not-allowed 
									${
										window.innerWidth < 1024 ? "p-2" : "py-2.5 px-3 w-[165.16px]"
									}`}
								>
									<FileSpreadsheet />
									{window.innerWidth >= 1024 && "Exportar CSV"}
								</button>
							</div>
						</div>

						{/* Tabela de Fornecedores */}
						<div className="md:h-[75vh] h-[63vh]">
							<AgGridReact
								modules={[AllCommunityModule]}
								theme={myTheme}
								ref={gridRef}
								rowData={rowData}
								columnDefs={columnDefs}
								context={{ userLevel }}
								localeText={agGridTranslation}
								onCellValueChanged={handleStatusChange}
								pagination
								paginationPageSize={10}
								paginationPageSizeSelector={[10, 25, 50, 100]}
								loading={loading.has("suppliers")}
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{/* Modal de Cadastro de Fornecedores */}
				<Modal
					isRegister
					withXButton
					openModal={openRegisterModal}
					setOpenModal={setOpenRegisterModal}
					modalTitle="Cadastrar Fornecedor:"
					modalWidth="w-full md:w-4/5 lg:w-1/2"
					registerButtonText="Cadastrar Fornecedor"
					isLoading={loading.has("submit")}
					onSubmit={handleSubmit}
				>
					<SupplierRegister
						formData={formData}
						loading={loading}
						errors={errors}
						ufs={ufs}
						cities={cities}
						supplierType={supplierType}
						handleCities={handleCities}
						handleCepBlur={handleCepBlur}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Fornecedor:"
					withXButton
					rightButtonText="Editar"
					leftButtonText="Cancelar"
					modalWidth="w-full md:w-4/5 lg:w-1/2"
					isLoading={loading.has("updateSupplier")}
					onSubmit={handleUpdateSupplier}
				>
					<SupplierUpdate
						formData={formData}
						loading={loading}
						ufs={ufs}
						cities={cities}
						errors={errors}
						supplierType={supplierType}
						handleCities={handleCities}
						handleCepBlur={handleCepBlur}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Exclusão */}
				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Fornecedor:"
					withXButton
					modalWidth="w-full md:w-4/5 lg:w-auto"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<SupplierDelete
						deleteSupplier={deleteSupplier}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Alert para confirmar exclusão do fornecedor */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o fornecedor?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteSupplier}
					isLoading={loading.has("deleteSupplier")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir fornecedor"
				/>

				{/* Modal de Relatório */}
				<ReportModal
					openModal={relatorioModalOpen}
					setOpenModal={setRelatorioModalOpen}
					reportUrl={relatorioContent}
					reportTitle="Relatório de Fornecedores"
					fileName="relatorio_fornecedores.pdf"
				/>

				{/* Modal de Avisos */}
				{openNoticeModal && (
					<NoticeModal successMsg={successMsg} message={message} />
				)}
			</div>
		</div>
	);
}
