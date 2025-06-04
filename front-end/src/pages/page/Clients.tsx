import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { checkAuth } from "../../utils/checkAuth";
import { Tabs } from "radix-ui";
import { useNavigate } from "react-router-dom";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, CellValueChangedEvent, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { Pencil, Trash2, Plus, FileSpreadsheet, Loader2, FileText } from "lucide-react";
import { cepApi } from "../../utils/cepApi";
import { Client, UF, City, SelectEvent, FormDataClient, DeleteClient } from "../../utils/types";
import { ClientRegister, ClientUpdate, ClientDelete } from "../pageComponents";
import { ConfirmationModal, Modal, NoticeModal, ReportModal } from "../../shared";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function Clients() {
	const [activeTab, setActiveTab] = useState("list");
	const [clientType, setClientType] = useState("juridica");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
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
	});
	const [formData, setFormData] = useState<FormDataClient>({
		cliente_id: 0,
		nome_empresa_cliente: "",
		razao_social: "",
		email: "",
		tel: "",
		tipo: "juridica",
		cpf_cnpj: "",
		status: "1",
		cep: "",
		endereco: "",
		num_endereco: 0,
		complemento: "",
		estado: "",
		cidade: "",
		obs: "",
	});
	const [deleteClient, setDeleteClient] = useState<DeleteClient>({
		cliente_id: 0,
		dnome_cliente: "",
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
				setLoading((prev) => new Set([...prev, "clients", "ufs", "cities"]));
				const [clientesResponse, userLevelResponse, ufsResponse, citiesResponse] = await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/clientes/listar_clientes.php",
						{ withCredentials: true, headers: { Accept: "application/json" } }
					),
					axios.get(
						"http://localhost/BioVerde/back-end/auth/usuario_logado.php",
						{ withCredentials: true, headers: { "Content-Type": "application/json" } }
					),
					axios.get(
						"https://servicodados.ibge.gov.br/api/v1/localidades/estados"
					),
					axios.get(
						"https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
					),
				]);
				console.log("Resposta do back-end:", clientesResponse.data);

				if (clientesResponse.data.success) {
					setRowData(clientesResponse.data.clientes || []);
				} else {
					setOpenNoticeModal(true);
					setMessage(clientesResponse.data.message || "Erro ao carregar clientes");
				}

				if (userLevelResponse.data.success) {
					setUserLevel(userLevelResponse.data.userLevel);
				} else {
					setOpenNoticeModal(true);
					setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário");
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
					["clients", "ufs", "cities"].forEach((item) => newLoading.delete(item));
					return newLoading;
				});
			}
		};
		fetchData();
	}, []);

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "clients"]));
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/clientes/listar_clientes.php",
				{ withCredentials: true }
			);
			if (response.data.success) {
				setRowData(response.data.clientes || []);
			} else {
				setMessage(response.data.message || "Erro ao carregar clientes");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("clients");
				return newLoading;
			});
		}
	};

	/* ----- Funções para CRUD de Clientes ----- */

	//Submit de cadastrar clientes
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const error = {
			states: !formData.estado,
			cities: !formData.cidade,
		};
		setErrors(error);
		if (Object.values(error).some((error) => error)) {return}

		setLoading((prev) => new Set([...prev, "submit"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/cadastrar_clientes.php",
				formData,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setOpenRegisterModal(false);
				setMessage("Cliente cadastrado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar cliente");
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

		//função para puxar os dados do cliente que será editado
	const handleEditClick = (cliente: Client) => {
		cepApi(
			cliente.cliente_cep,
			setFormData,
			setOpenNoticeModal,
			setMessage,
			setSuccessMsg,
			setCities,
			setErrors
		);
		setFormData({
			cliente_id: 			cliente.cliente_id,
			nome_empresa_cliente: 	cliente.cliente_nome,
			razao_social: 			cliente.cliente_razao_social,
			email: 					cliente.cliente_email,
			tel: 					cliente.cliente_telefone,
			cpf_cnpj: 				cliente.cliente_documento,
			status: 				String(cliente.estaAtivo),
			cep: 					cliente.cliente_cep,
			endereco: 				cliente.cliente_endereco,
			estado: 				cliente.cliente_estado,
			cidade: 				cliente.cliente_cidade,
			num_endereco: 			Number(cliente.cliente_numendereco),
			complemento: 			cliente.cliente_complemento,
			obs: 					cliente.cliente_observacoes,
			tipo: 					cliente.cliente_tipo,
		});
		setClientType(cliente.cliente_tipo);
		setOpenEditModal(true);
	};

	// submit para atualizar o cliente após a edição dele
	const handleUpdateClient = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "updateClient"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/editar.cliente.php",
				formData,
				{headers: { "Content-Type": "application/json" }, withCredentials: true}
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setOpenEditModal(false);
				setSuccessMsg(true);
				setMessage("Cliente atualizado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar cliente.");
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
				newLoading.delete("updateClient");
				return newLoading;
			});
		}
	};

	//função para puxar o nome do cliente que será excluido
	const handleDeleteClick = (cliente: Client) => {
		setDeleteClient({
			cliente_id: cliente.cliente_id,
			dnome_cliente: cliente.cliente_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	//submit para excluir um cliente
	const handleDeleteClient = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteClient"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/excluir.cliente.php",
				deleteClient,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Cliente Excluído com sucesso!");
				setOpenConfirmModal(false);
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir cliente.");
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
				newLoading.delete("deleteClient");
				return newLoading;
			});
		}
	};

	//Função para Atualizar o Status do cliente
	const handleStatusChange = async (params: CellValueChangedEvent<Client>) => {
		if (params.colDef?.field === "estaAtivo") {
			const dataToSend = {
				cliente_id: params.data?.cliente_id,
				estaAtivo: params.data?.estaAtivo
			};
			try {
				const response = await axios.post(
					"http://localhost/BioVerde/back-end/clientes/atualizar.status.cliente.php",
					dataToSend,
					{ headers: { "Content-Type": "application/json" }, withCredentials: true }
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
			| React.ChangeEvent<
					HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			  >
			| InputMaskChangeEvent
			| SelectEvent
	) => {
		const { name, value } = event.target;

		if (name === "tipo") {
			const tipo = value ?? "juridica";
			setClientType(String(tipo));
			if (tipo === "fisica") {
				setFormData((prev) => ({
					...prev,
					tipo,
					cpf_cnpj: "",
					razao_social: "",
					nome_empresa_cliente: "",
				}));
			} else if (tipo === "juridica") {
				setFormData((prev) => ({
					...prev,
					tipo,
					cpf_cnpj: "",
					nome_empresa_cliente: "",
				}));
			}
			return;
		}

		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in deleteClient) {
			setDeleteClient({ ...deleteClient, [name]: value });
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
	const clearFormData = () => {
		setFormData(
			(prev) =>
				Object.fromEntries(
					Object.entries(prev).map(([key, value]) => {
						if (key === "tipo") return [key, "juridica"];
						if (key === "status") return [key, "1"];
						return [key, typeof value === "number" ? 0 : ""];
					})
				) as unknown as FormDataClient
		);
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

	// Função para Gerar Relatório PDF
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const gerarRelatorio = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));

		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/cli.rel.php",
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

	/* ----- Definição de colunas e dados que a tabela de lotes vai receber ----- */

	const gridRef = useRef<AgGridReact>(null);
	const [rowData, setRowData] = useState<Client[]>([]);
	const [columnDefs] = useState<ColDef[]>([
		{ field: "cliente_id", headerName: "ID", filter: true, width: 100 },
		{ field: "cliente_nome", headerName: "Nome Cliente/Empresa", filter: true, width: 250 },
		{
			field: "cliente_tipo",
			headerName: "Tipo",
			filter: true,
			width: 150,
			valueGetter: (params) => 
				params.data.cliente_tipo === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"
		},
		{field: "cliente_documento", headerName: "CPF/CNPJ", filter: true, width: 180},
		{field: "cliente_email", headerName: "Email", filter: true, width: 180},
		{
			field: "estaAtivo", headerName: "Ativo / Inativo", width: 130,
			cellRenderer: 'agCheckboxCellRenderer',
			cellRendererParams: { disabled: false },
			valueGetter: (params) => params.data.estaAtivo === "1",
			valueSetter: (params) => {
				params.data.estaAtivo = params.newValue ? "1" : "0";
				return true;
			},
			editable: true,
			cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
		},
		{field: "cliente_telefone", headerName: "Telefone", filter: true, width: 180},
		{field: "cliente_razao_social", headerName: "Razão Social", width: 180},
		{field: "cliente_cep", headerName: "CEP", filter: true, width: 150},
		{field: "cliente_endereco", headerName: "Endereço", width: 180},
		{field: "cliente_numendereco", headerName: "Nº", width: 100},
		{field: "cliente_complemento", headerName: "Complemento", width: 180},
		{field: "cliente_cidade", headerName: "Cidade", width: 180},
		{field: "cliente_estado", headerName: "Estado", width: 100},
		{
			field: "cliente_data_cadastro", headerName: "Data de Cadastro", width: 180,
			valueGetter: (params) => new Date(params.data.cliente_data_cadastro).toLocaleDateString("pt-BR")
		},
		{field: "cliente_observacoes", headerName: "Observações", width: 200},
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellRenderer: (params: ICellRendererParams<Client>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Editar Lote"
						onClick={() => { if(params.data) handleEditClick(params.data) }}
					>
						<Pencil size={18} />
					</button>
					{params.context.userLevel === "Administrador" && (
						<button
							className="text-red-600 hover:text-red-800 cursor-pointer"
							title="Excluir Lote"
							onClick={() => { if(params.data) handleDeleteClick(params.data) }}
						>
							<Trash2 size={18} />
						</button>
					)}
				</div>
			),
			pinned: "right",
			sortable: false,
			filter: false
		}
	]);

	//Esilos da Tabela
	const myTheme = themeQuartz.withParams({
		spacing: 9,
		headerBackgroundColor: '#89C988',
		foregroundColor: '#1B1B1B',
		rowHoverColor: '#E2FBE2',
		oddRowBackgroundColor: '#f5f5f5',
		fontFamily: '"Inter", sans-serif',
	});

	return (
		<div className="flex-1 p-6 pl-[280px]">
			<div className="px-6 font-[inter]">
				<h1 className="h-10 w-full flex items-center justify-center mb-3">
					<span className="text-4xl font-semibold text-center">Clientes</span>
				</h1>

				{/* Selelcionar Abas */}
				<Tabs.Root defaultValue="list" className="w-full" onValueChange={(value) => setActiveTab(value)}>
					<Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
						<Tabs.Trigger
							value="list"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "list" ? "select animation-tab" : ""
							}`}
						>
							Lista de Clientes
						</Tabs.Trigger>
					</Tabs.List>

					{/* Aba de Lista de Clientes */}
					<Tabs.Content value="list" className="w-full flex flex-col py-2 px-4">
						<div className="flex justify-between">
							{/* Botão de Abrir Modal de Cadastro de Cliente */}
							<div className="mt-1 mb-3">
								<button
									type="button"
									className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
									onClick={() => {
										setOpenRegisterModal(true); 
										clearFormData(); 
										setClientType("juridica");
									}}
								>
									<Plus />
									Novo Cliente
								</button>
							</div>
							{/* Botão de exportar para CSV e PDF dos dados da tabela */}
							<div className="flex items-center gap-5 mt-1 mb-3">
								<button
									onClick={gerarRelatorio}
									className="bg-red-700 py-2.5 px-4 w-[165.16px] font-semibold rounded text-white cursor-pointer hover:bg-red-800 flex sombra-botao place-content-center gap-2"
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
									onClick={() => {
										const params = {
											fileName: "clientes.csv",
											columnSeparator: ";",
										};
										gridRef.current?.api.exportDataAsCsv(params);
									}}
									className="bg-verdeGrama py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex sombra-botao place-content-center gap-2"
								>
									<FileSpreadsheet />
									Exportar CSV
								</button>
							</div>
						</div>
				
						{/* Tabela de Clientes */}
						<div className="h-[75vh]">
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
								loading={loading.has("clients")}
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{/* Modal de Cadastro de Clientes */}
				<Modal
					isRegister
					withXButton
					openModal={openRegisterModal}
					setOpenModal={setOpenRegisterModal}
					modalTitle="Cadastrar Cliente:"
					modalWidth="w-1/2"
					registerButtonText="Cadastrar Cliente"
					isLoading={loading.has("submit")}
					onSubmit={handleSubmit}
				>	
					<ClientRegister
						formData={formData}
						loading={loading}
						errors={errors}
						ufs={ufs}
						cities={cities}
						clientType={clientType}
						handleCities={handleCities}
						handleCepBlur={handleCepBlur}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Cliente:"
					rightButtonText="Editar"
					leftButtonText="Cancelar"
					modalWidth="w-1/2"
					isLoading={loading.has("updateClient")}
					onSubmit={handleUpdateClient}
				>
					<ClientUpdate
						formData={formData}
						loading={loading}
						ufs={ufs}
						cities={cities}
						clientType={clientType}
						handleCities={handleCities}
						handleCepBlur={handleCepBlur}
						handleChange={handleChange}
					/>
				</Modal>

				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Cliente:"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<ClientDelete
						deleteClient={deleteClient}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Alert para confirmar exclusão do cliente */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o cliente?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteClient}
					isLoading={loading.has("deleteClient")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir cliente"
				/>

				{/* Modal de Relatório */}
				<ReportModal
					openModal={relatorioModalOpen}
					setOpenModal={setRelatorioModalOpen}
					reportUrl={relatorioContent}
					reportTitle="Relatório de Clientes"
					fileName="relatorio_clientes.pdf"
				/>

				{/* Modal de Avisos */}
				<NoticeModal
					openModal={openNoticeModal}
					setOpenModal={setOpenNoticeModal}
					successMsg={successMsg}
					message={message}
				/>
			</div>
		</div>
	);
}
