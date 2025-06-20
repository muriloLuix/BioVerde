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
import {
	UserOptions,
	FormDataUser,
	User,
	SelectEvent,
	JobPosition,
	DeleteUser,
} from "../../utils/types";
import { UserRegister, UserUpdate, UserDelete } from "../pageComponents";
import {
	ConfirmationModal,
	Modal,
	NoticeModal,
	ReportModal,
} from "../../shared";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function UsersPage() {
	const [activeTab, setActiveTab] = useState("list");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openPositionModal, setOpenPositionModal] = useState(false);
	const [openPostionConfirmModal, setOpenPostionConfirmModal] = useState(false);
	const [message, setMessage] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [options, setOptions] = useState<UserOptions>();
	const [errors, setErrors] = useState({
		position: false,
		level: false,
		password: false,
	});
	const [formData, setFormData] = useState<FormDataUser>({
		user_id: 0,
		name: "",
		email: "",
		tel: "",
		cpf: "",
		cargo: "",
		nivel: "",
		password: "",
		status: "1",
	});
	const [deleteUser, setDeleteUser] = useState<DeleteUser>({
		user_id: 0,
		dname: "",
		reason: "",
	});

	/* ----- useEffects e Requisições via Axios ----- */

	//Checa a autenticação do usuário, se for false expulsa o usuário da sessão
	const navigate = useNavigate();
	useEffect(() => {
		checkAuth({ navigate, setMessage, setOpenNoticeModal });
	}, [navigate]);

	//Carrega a lista de usuario e as opções nos selects ao renderizar a página
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading((prev) => new Set([...prev, "users", "options"]));
				const [usuariosResponse, userLevelResponse] = await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/usuarios/listar_usuarios.php",
						{ withCredentials: true, headers: { Accept: "application/json" } }
					),
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
						userLevelResponse.data.message ||
							"Erro ao carregar nível do usuário"
					);
				}
				if (usuariosResponse.data.success) {
					setRowData(usuariosResponse.data.usuarios);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						usuariosResponse.data.message || "Erro ao carregar usuários"
					);
				}
			} catch (error) {
				console.error(error);
				setOpenNoticeModal(true);
				setMessage("Erro ao conectar com o servidor");
			} finally {
				setLoading((prev) => {
					const newLoading = new Set(prev);
					["users", "options"].forEach((item) => newLoading.delete(item));
					return newLoading;
				});
			}
		};
		fetchData();
	}, []);

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "users"]));
			const usuariosResponse = await axios.get(
				"http://localhost/BioVerde/back-end/usuarios/listar_usuarios.php",
				{ withCredentials: true }
			);
			if (usuariosResponse.data.success) {
				setRowData(usuariosResponse.data.usuarios);
			} else {
				const errorMessage =
					usuariosResponse.data.message || "Erro ao carregar dados";
				setMessage(errorMessage);
				setOpenNoticeModal(true);
			}
		} catch (error) {
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("users");
				return newLoading;
			});
		}
	};

	//Carrega os cargos e níveis de acesso
	const fetchOptions = async () => {
		try {
			setLoading((prev) => new Set([...prev, "options"]));

			const response = await axios.get(
				"http://localhost/BioVerde/back-end/usuarios/listar_opcoes.php",
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
					cargos: response.data.cargos,
					niveis: response.data.niveis,
				});
				setRowDataPosition(response.data.cargos);
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

	/* ----- Funções para CRUD de Usuários ----- */

	//Submit de cadastrar usuários
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		// Validações
		const errors = {
			position: !formData.cargo,
			level: !formData.nivel,
			password: !formData.password || formData.password.length < 8,
		};
		setErrors(errors);
		if (Object.values(errors).some((error) => error)) {
			return;
		}
		setLoading((prev) => new Set([...prev, "submit"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/usuarios/cadastrar.usuario.php",
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
					"Usuário cadastrado com sucesso! O login e senha foram enviados por email."
				);
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar usuário");
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

	//função para puxar os dados do usuario que será editado
	const handleEditClick = (usuario: User) => {
		setFormData({
			user_id: usuario.user_id,
			name: usuario.user_nome,
			email: usuario.user_email,
			tel: usuario.user_telefone,
			cpf: usuario.user_CPF,
			cargo: usuario.car_nome,
			nivel: usuario.nivel_nome,
			status: String(usuario.estaAtivo),
			password: "",
		});
		setOpenEditModal(true);
	};

	//submit para atualizar o usuário após a edição dele
	const handleUpdateUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "updateUser"]));
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...dataWithoutPassword } = formData;
			const dataToSend = formData.user_id ? dataWithoutPassword : formData;
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/usuarios/editar.usuario.php",
				dataToSend,
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
				setMessage("Usuário atualizado com sucesso!");
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar usuário.");
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
				newLoading.delete("updateUser");
				return newLoading;
			});
		}
	};

	//função para puxar o nome do usuário que será excluido
	const handleDeleteClick = (usuario: User) => {
		setDeleteUser({
			user_id: usuario.user_id,
			dname: usuario.user_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	//submit para excluir um usuário
	const handleDeleteUser = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteUser"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/usuarios/excluir.usuario.php",
				deleteUser,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log("Resposta da exclusão:", response.data);
			if (response.data.success) {
				await refreshData();
				setOpenConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Usuário excluído com sucesso!");
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir usuário.");
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
				newLoading.delete("deleteUser");
				return newLoading;
			});
		}
	};

	//Função para Atualizar o Status do usuário
	const handleStatusChange = async (params: CellValueChangedEvent<User>) => {
		if (params.colDef?.field === "estaAtivo") {
			const dataToSend = {
				user_id: params.data?.user_id,
				estaAtivo: params.data?.estaAtivo,
			};
			try {
				const response = await axios.post(
					"http://localhost/BioVerde/back-end/usuarios/atualizar.status.usuario.php",
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

	/* ----- Funções para CRUD de Cargos ----- */
	const [deletedId, setDeletedId] = useState<number | null>(null);

	const handleDeletePosition = (cargo: JobPosition) => {
		setDeletedId(cargo.car_id);
		setOpenPostionConfirmModal(true);
	};

	//Criar Novo Cargo
	const createPosition = async (cargoNome: string) => {
		setLoading((prev) => new Set([...prev, "options"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/cargos/cadastrar_cargo.php",
				{ cargo: cargoNome },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await fetchOptions();
				setSuccessMsg(true);
				setMessage("Cargo cadastrado com sucesso!");
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar Cargo");
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
				newLoading.delete("options");
				return newLoading;
			});
		}
	};

	//Atualizar Cargo
	const updatePosition = async (id: number, editedValue: string) => {
		setLoading((prev) => new Set([...prev, "options"]));
		try {
			const dataToSend = {
				car_id: id,
				car_nome: editedValue,
			};
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/cargos/editar_cargo.php",
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
				setMessage("Cargo atualizado com sucesso!");
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar cargo.");
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
				newLoading.delete("options");
				return newLoading;
			});
		}
	};

	//Excluir Cargo
	const deletePosition = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deletePosition"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/cargos/excluir_cargo.php",
				{ car_id: deletedId },
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			if (response.data.success) {
				await fetchOptions();
				setOpenPostionConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Cargo excluído com sucesso!");
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir cargo.");
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
				newLoading.delete("deletePosition");
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
		if (name in deleteUser) {
			setDeleteUser({ ...deleteUser, [name]: value });
		}
		setErrors(
			(prevErrors) =>
				Object.fromEntries(
					Object.keys(prevErrors).map((key) => [key, false])
				) as typeof prevErrors
		);
	};

	//Gerar Relatório
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");

	const gerarRelatorio = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));
		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/usu.rel.php",
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

	//Gerar Senha Aleatória
	const generatePassword = () => {
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
		let newPassword = "";
		for (let i = 0; i < 12; i++) {
			newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		setFormData({ ...formData, password: newPassword });
		setErrors((prevErrors) => ({ ...prevErrors, password: false }));
	};

	//Limpar FormData
	const clearFormData = () => {
		setFormData(
			(prev) =>
				Object.fromEntries(
					Object.entries(prev).map(([key, value]) => [
						key,
						typeof value === "number" ? 0 : "",
					])
				) as unknown as FormDataUser
		);
	};

	/* ----- Definição de colunas e dados que a tabela de usuarios vai receber ----- */

	const gridRef = useRef<AgGridReact>(null);
	const [rowData, setRowData] = useState<User[]>([]);
	const [columnDefs] = useState<ColDef[]>([
		{ field: "user_id", headerName: "ID", filter: true, width: 100 },
		{ field: "user_nome", headerName: "Nome", filter: true, width: 250 },
		{ field: "user_email", headerName: "Email", filter: true, width: 250 },
		{ field: "user_telefone", headerName: "Telefone", width: 160 },
		{ field: "user_CPF", headerName: "CPF", filter: true, width: 180 },
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
		{ field: "car_nome", headerName: "Cargo", width: 180 },
		{ field: "nivel_nome", headerName: "Nível de Acesso", width: 180 },
		{
			field: "user_dtcadastro",
			headerName: "Data de Cadastro",
			width: 180,
			valueGetter: (params) =>
				new Date(params.data.user_dtcadastro).toLocaleDateString("pt-BR"),
		},
		{
			headerName: "Ações",
			field: "acoes",
			width: 100,
			cellRenderer: (params: ICellRendererParams<User>) => (
				<div className="flex gap-2 mt-2.5 items-center justify-center">
					<button
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
						title="Editar Usuário"
						onClick={() => {
							if (params.data) handleEditClick(params.data);
						}}
					>
						<Pencil size={18} />
					</button>
					{params.context.userLevel === "Administrador" && (
						<button
							className="text-red-600 hover:text-red-800 cursor-pointer"
							title="Excluir Usuário"
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

	/* ----- Definição de colunas e dados que da tabela de cargos ----- */

	const [rowDataPosition, setRowDataPosition] = useState<JobPosition[]>([]);
	const [columnDefsPosition] = useState<ColDef[]>([
		{
			field: "car_nome",
			headerName: "Cargo",
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
							title="Editar Cargo"
							onClick={() => {
								params.api.startEditingCell({
									rowIndex: Number(params.node.rowIndex),
									colKey: "car_nome",
								});
							}}
						>
							<Pencil size={18} />
						</button>
						{params.context.userLevel === "Administrador" && (
							<button
								className="text-red-600 hover:text-red-800 cursor-pointer"
								title="Excluir Cargo"
								onClick={() => handleDeletePosition(params.data)}
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

	return (
		<div className="flex-1 lg:p-6 lg:pl-[280px] pt-20">
			<div className="lg:px-6 px-3 font-[inter]">
				<h1 className="h-10 w-full flex items-center justify-center mb-3">
					<span className="text-4xl font-semibold text-center">Usuários</span>
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

					{/* Aba de Lista de Usuários */}
					<Tabs.Content
						value="list"
						className="w-full flex flex-col py-2 lg:px-4 px-2"
					>
						<div className="flex justify-between">
							{/* Botão de Abrir Modal de Cadastro de Usuário */}
							<div className="mt-1 mb-3">
								<button
									type="button"
									disabled={loading.size > 0}
									className={`bg-verdePigmento font-semibold py-2.5 px-4 rounded text-white cursor-pointer hover:bg-verdeGrama flex disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed  place-content-center gap-2`}
									onClick={() => {
										setOpenRegisterModal(true);
										clearFormData();
									}}
								>
									<Plus />
									Novo Usuário
								</button>
							</div>
							{/* Botão de exportar para CSV e PDF dos dados da tabela */}
							<div className="flex items-center gap-5 mt-1 mb-3">
								<button
									title="Exportar PDF"
									onClick={gerarRelatorio}
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
									onClick={() => {
										const params = {
											fileName: "usuarios.csv",
											columnSeparator: ";",
										};
										gridRef.current?.api.exportDataAsCsv(params);
									}}
									title="Exportar CSV"
									disabled={loading.size > 0}
									className={`bg-verdeGrama font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
										window.innerWidth < 1024 ? "p-2" : "py-2.5 px-3 w-[165.16px]"
									}`}
								>
									<FileSpreadsheet />
									{window.innerWidth >= 1024 && "Exportar CSV"}
								</button>
							</div>
						</div>

						{/* Tabela de Usuários */}
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
								loading={loading.has("users")}
								overlayLoadingTemplate={overlayLoadingTemplate}
								overlayNoRowsTemplate={overlayNoRowsTemplate}
							/>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{/* ----- Modais ----- */}

				{/* Modal de Cadastro de Usuários */}
				<Modal
					isRegister
					withXButton
					openModal={openRegisterModal}
					setOpenModal={setOpenRegisterModal}
					modalTitle="Cadastrar Usuário:"
					modalWidth="w-full md:w-4/5 lg:w-1/2"
					registerButtonText="Cadastrar Usuário"
					isLoading={loading.has("submit")}
					onSubmit={handleSubmit}
				>
					<UserRegister
						formData={formData}
						options={options}
						userLevel={userLevel}
						loading={loading}
						errors={errors}
						generatePassword={generatePassword}
						openPositionModal={() => setOpenPositionModal(true)}
						createPosition={createPosition}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					withXButton
					modalTitle="Editar Usuário:"
					modalWidth="w-full md:w-4/5 lg:w-1/2"
					rightButtonText="Editar"
					leftButtonText="Cancelar"
					isLoading={loading.has("updateUser")}
					onCancel={() => clearFormData()}
					onSubmit={handleUpdateUser}
				>
					<UserUpdate
						formData={formData}
						options={options}
						loading={loading}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Exclusão */}
				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Usuário:"
					withXButton
					modalWidth="w-full md:w-4/5 lg:w-auto"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<UserDelete deleteUser={deleteUser} handleChange={handleChange} />
				</Modal>

				{/* Alert para confirmar exclusão do usuário */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o usuário?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteUser}
					isLoading={loading.has("deleteUser")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir usuário"
				/>

				{/* Modal de Cadastro de Cargo */}
				<Modal
					openModal={openPositionModal}
					setOpenModal={setOpenPositionModal}
					modalTitle="Gerenciamento de Cargos:"
					modalWidth="w-full md:w-4/5 lg:w-auto"
					withExitButton
					withXButton
					isLoading={loading.has("options")}
				>
					{/* Tabela de Cargos */}
					<div className="h-[65vh]">
						<AgGridReact
							modules={[AllCommunityModule]}
							theme={myTheme}
							ref={gridRef}
							rowData={rowDataPosition}
							columnDefs={columnDefsPosition}
							context={{ userLevel }}
							localeText={agGridTranslation}
							pagination
							paginationPageSize={10}
							paginationPageSizeSelector={[10, 25, 50, 100]}
							loading={loading.has("options")}
							overlayLoadingTemplate={overlayLoadingTemplate}
							overlayNoRowsTemplate={overlayNoRowsTemplate}
							onCellValueChanged={(params) => {
								updatePosition(params.data.car_id, params.data.car_nome);
							}}
						/>
					</div>
				</Modal>

				{/* Alert para confirmar exclusão do cargo */}
				<ConfirmationModal
					openModal={openPostionConfirmModal}
					setOpenModal={setOpenPostionConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o cargo?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={deletePosition}
					isLoading={loading.has("deletePosition")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir cargo"
				/>

				{/* Modal de Relatório */}
				<ReportModal
					openModal={relatorioModalOpen}
					setOpenModal={setRelatorioModalOpen}
					reportUrl={relatorioContent}
					reportTitle="Relatório de Usuários"
					fileName="relatorio_usuarios.pdf"
				/>

				{/* Modal de Avisos */}
				{openNoticeModal && (
					<NoticeModal successMsg={successMsg} message={message} />
				)}
			</div>
		</div>
	);
}
