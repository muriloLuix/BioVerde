import { useState, useEffect } from "react";

import axios from "axios";
import { Tabs, Form } from "radix-ui";
import { useNavigate } from "react-router-dom";
import { InputMaskChangeEvent } from "primereact/inputmask";
import {
	Search,
	PencilLine,
	Trash,
	Loader2,
	Eye,
	FilterX,
	Printer, X,
} from "lucide-react";

import {
	SmartField,
	ConfirmationModal,
	NoticeModal,
	Modal,
} from "../../shared";
import { switchCpfCnpjMask } from "../../utils/switchCpfCnpjMask";
import { cepApi } from "../../utils/cepApi";
import { Client, SelectEvent } from "../../utils/types";

export default function Clients() {
	const [activeTab, setActiveTab] = useState("list");
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const [cpfCnpjMask, setCpfCnpjMask] = useState("");
	const [clientType, setClientType] = useState("juridica");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [message, setMessage] = useState("");
	const [currentObs, setCurrentObs] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [clientes, setClientes] = useState<Client[]>([]);
	const [errors, setErrors] = useState({
		states: false,
	});
	const [formData, setFormData] = useState({
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
		num_endereco: "",
		estado: "",
		cidade: "",
		obs: "",
	});
	const [filters, setFilters] = useState({
		fnome_cliente: "",
		fcpf_cnpj: "",
		ftel: "",
		fcidade: "",
		festado: "",
		fdataCadastro: "",
		fstatus: "",
	});
	const [deleteClient, setDeleteClient] = useState({
		cliente_id: 0,
		dnome_cliente: "",
		reason: "",
	});

	const handleObsClick = (cliente: Client) => {
		setCurrentObs(cliente.cliente_observacoes);
		setOpenObsModal(true);
	};

	const navigate = useNavigate();
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await axios.get(
					"http://localhost/BioVerde/back-end/auth/check_session.php",
					{ withCredentials: true }
				);

				if (!response.data.loggedIn) {
					setMessage("Sessão expirada. Por favor, faça login novamente.");
					setOpenNoticeModal(true);

					setTimeout(() => {
						navigate("/");
					}, 1900);
				}
			} catch (error) {
				console.error("Erro ao verificar sessão:", error);
				setMessage("Sessão expirada. Por favor, faça login novamente.");
				setOpenNoticeModal(true);

				setTimeout(() => {
					navigate("/");
				}, 1900);
			}
		};

		checkAuth();
	}, [navigate]);

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

		//Função para alternar o campo entre cpf e cnjp dependendo do número de caracteres
		switchCpfCnpjMask(name, value, setCpfCnpjMask);

		if (name === "tipo") {
			const tipo = value ?? "juridica";
			setClientType(tipo);

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
		if (name in filters) {
			setFilters({ ...filters, [name]: value });
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

	//função para puxar os dados do cliente que será editado
	const handleEditClick = (cliente: Client) => {
		console.log("Dados completos do cliente:", cliente);

		setFormData({
			cliente_id: cliente.cliente_id,
			nome_empresa_cliente: cliente.cliente_nome_ou_empresa,
			razao_social: cliente.cliente_razao_social,
			email: cliente.cliente_email,
			tel: cliente.cliente_telefone,
			cpf_cnpj: cliente.cliente_cpf_ou_cnpj,
			status: String(cliente.estaAtivo),
			cep: cliente.cliente_cep,
			endereco: cliente.cliente_endereco,
			estado: cliente.cliente_estado,
			cidade: cliente.cliente_cidade,
			num_endereco: cliente.cliente_numendereco,
			obs: cliente.cliente_observacoes,
			tipo: cliente.cliente_tipo,
		});
		setClientType(cliente.cliente_tipo);
		setOpenEditModal(true);
	};

	//função para puxar o nome do cliente que será excluido
	const handleDeleteClick = (cliente: Client) => {
		setDeleteClient({
			cliente_id: cliente.cliente_id,
			dnome_cliente: cliente.cliente_nome_ou_empresa,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading((prev) => new Set([...prev, "clients", "options"]));

				const [clientesResponse, userLevelResponse] = await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/clientes/listar_clientes.php",
						{
							withCredentials: true,
							headers: {
								Accept: "application/json",
							},
						}
					),
					axios.get(
						"http://localhost/BioVerde/back-end/auth/usuario_logado.php",
						{
							withCredentials: true,
							headers: { "Content-Type": "application/json" },
						}
					),
				]);

				console.log("Resposta do back-end:", clientesResponse.data);

				if (clientesResponse.data.success) {
					setClientes(clientesResponse.data.clientes || []);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						clientesResponse.data.message || "Erro ao carregar clientes"
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
			} catch (error) {
				setOpenNoticeModal(true);
				setMessage("Erro ao conectar com o servidor");

				if (axios.isAxiosError(error)) {
					console.error(
						"Erro na requisição:",
						error.response?.data || error.message
					);
					if (error.response?.data?.message) {
						setMessage(error.response.data.message);
					}
				} else {
					console.error("Erro desconhecido:", error);
				}
			} finally {
				setLoading((prev) => {
					const newLoading = new Set(prev);
					["clients", "options"].forEach((item) => newLoading.delete(item));
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
				setClientes(response.data.clientes || []);
				return true;
			} else {
				setMessage(response.data.message || "Erro ao carregar clientes");
				setOpenNoticeModal(true);
				return false;
			}
		} catch (error) {
			let errorMessage = "Erro ao conectar com o servidor";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.message || error.message;
			}
			setMessage(errorMessage);
			setOpenNoticeModal(true);
			return false;
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("clients");
				return newLoading;
			});
		}
	};

	//Submit de cadastrar clientes
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const errors = {
			states: !formData.estado,
		};
		setErrors(errors);

		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) {
			return;
		}

		setLoading((prev) => new Set([...prev, "submit"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/cadastrar_clientes.php",
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
				setMessage("Cliente cadastrado com sucesso!");
				clearFormData();
			} else {
				setMessage(response.data.message || "Erro ao cadastrar cliente");
			}
		} catch (error) {
			let errorMessage = "Erro ao conectar com o servidor";

			if (axios.isAxiosError(error)) {
				if (error.response) {
					errorMessage = error.response.data.message || "Erro no servidor";
					console.error("Erro na resposta:", error.response.data);
				} else {
					console.error("Erro na requisição:", error.message);
				}
			} else {
				console.error("Erro desconhecido:", error);
			}

			setMessage(errorMessage);
		} finally {
			setOpenNoticeModal(true);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("submit");
				return newLoading;
			});
		}
	};

	// submit de Filtrar clientes
	const handleFilterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		console.log(filters);
		setLoading((prev) => new Set([...prev, "filterSubmit"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/filtro.cliente.php",
				filters,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				setClientes(response.data.clientes);
			} else {
				setOpenNoticeModal(true);
				setMessage(
					response.data.message || "Nenhum cliente encontrado com esse filtro"
				);
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
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("filterSubmit");
				return newLoading;
			});
		}
	};

	// submit para atualizar o cliente após a edição dele
	const handleUpdateClient = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "updateClient"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/editar.cliente.php",
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
				setMessage("Cliente atualizado com sucesso!");
				clearFormData();
			} else {
				setMessage(response.data.message || "Erro ao atualizar cliente.");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setMessage(error.response?.data?.message || "Erro no servidor");
				console.error("Erro na resposta:", error.response?.data);
			} else {
				setMessage("Erro ao conectar com o servidor");
				console.error("Erro na requisição:", error);
			}
		} finally {
			setOpenNoticeModal(true);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("updateClient");
				return newLoading;
			});
		}
	};

	// submit para excluir um cliente
	const handleDeleteClient = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "deleteClient"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/clientes/excluir.cliente.php",
				deleteClient,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Cliente Excluído com sucesso!");
				setOpenConfirmModal(false);
			} else {
				setMessage(response.data.message || "Erro ao excluir cliente.");
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
				newLoading.delete("deleteClient");
				return newLoading;
			});
		}
	};

	//Função para chamar a api de CEP
	const handleCepBlur = () => {
		cepApi(
			formData.cep,
			setFormData,
			setOpenNoticeModal,
			setMessage,
			setSuccessMsg
		);
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
				) as typeof prev
		);
	};

	return (
		<div className="flex-1 p-6 pl-[280px]">
			<div className="px-6 font-[inter]">
				<h1 className="text-[40px] font-semibold text-center mb-3">Clientes</h1>

				{/* Selelcionar Abas */}
				<Tabs.Root
					defaultValue="list"
					className="w-full"
					onValueChange={(value) => setActiveTab(value)}
				>
					<Tabs.List className="flex gap-5 border-b border-verdePigmento relative mb-7">
						<Tabs.Trigger
							value="list"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "list" ? "select animation-tab" : ""
							}`}
						>
							Lista de Clientes
						</Tabs.Trigger>

						<Tabs.Trigger
							value="register"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "register" ? "select animation-tab" : ""
							}`}
						>
							Cadastrar Clientes
						</Tabs.Trigger>
					</Tabs.List>

					{/* Aba de Lista de Clientes */}
					<Tabs.Content value="list" className="flex flex-col w-full">
						{/* Filtro de Clientes */}
						<Form.Root
							className="flex flex-col gap-4"
							onSubmit={handleFilterSubmit}
						>
							<h2 className="text-3xl">Filtros:</h2>
							<div className="flex gap-7">
								{/* Coluna Nome e Cidade */}
								<div className="flex flex-col gap-7 mb-10 justify-between">
									<SmartField
										fieldName="fnome_cliente"
										fieldText="Nome do cliente"
										type="text"
										placeholder="Nome completo do Cliente"
										autoComplete="name"
										value={filters.fnome_cliente}
										onChange={handleChange}
										inputWidth="w-[280px]"
									/>

									<SmartField
										fieldName="fcidade"
										fieldText="Cidade"
										type="text"
										placeholder="Cidade"
										autoComplete="address-level2"
										value={filters.fcidade}
										onChange={handleChange}
										inputWidth="w-[280px]"
									/>
								</div>

								{/* Coluna CPF e Estado */}
								<div className="flex flex-col gap-7 mb-10 justify-between">
									<SmartField
										fieldName="fcpf_cnpj"
										fieldText="CPF/CNPJ"
										withInputMask
										unstyled
										type="text"
										mask={cpfCnpjMask}
										autoClear={false}
										placeholder="Digite o CPF/CNPJ"
										value={filters.fcpf_cnpj}
										onChange={handleChange}
										inputWidth="w-[200px]"
									/>

									<SmartField
										fieldName="festado"
										fieldText="Estado"
										isSelect
										isLoading={loading.has("options")}
										value={filters.festado}
										placeholder="Selecione"
										autoComplete="address-level1"
										inputWidth="w-[200px]"
										onChangeSelect={handleChange}
										options={[
											{ value: "AC", label: "Acre" },
											{ value: "AL", label: "Alagoas" },
											{ value: "AP", label: "Amapá" },
											{ value: "AM", label: "Amazonas" },
											{ value: "BA", label: "Bahia" },
											{ value: "CE", label: "Ceará" },
											{ value: "DF", label: "Distrito Federal" },
											{ value: "ES", label: "Espírito Santo" },
											{ value: "GO", label: "Goiás" },
											{ value: "MA", label: "Maranhão" },
											{ value: "MT", label: "Mato Grosso" },
											{ value: "MS", label: "Mato Grosso do Sul" },
											{ value: "MG", label: "Minas Gerais" },
											{ value: "PA", label: "Pará" },
											{ value: "PB", label: "Paraíba" },
											{ value: "PR", label: "Paraná" },
											{ value: "PE", label: "Pernambuco" },
											{ value: "PI", label: "Piauí" },
											{ value: "RJ", label: "Rio de Janeiro" },
											{ value: "RN", label: "Rio Grande do Norte" },
											{ value: "RS", label: "Rio Grande do Sul" },
											{ value: "RO", label: "Rondônia" },
											{ value: "RR", label: "Roraima" },
											{ value: "SC", label: "Santa Catarina" },
											{ value: "SP", label: "São Paulo" },
											{ value: "SE", label: "Sergipe" },
											{ value: "TO", label: "Tocantins" },
										]}
									/>
								</div>

								{/* Coluna Telefone e Status */}
								<div className="flex flex-col gap-7 mb-10 justify-between">
									<SmartField
										fieldName="ftel"
										fieldText="Telefone"
										withInputMask
										unstyled
										type="tel"
										mask="(99) 9999?9-9999"
										autoClear={false}
										placeholder="Digite o Telefone"
										autoComplete="tel"
										value={filters.ftel}
										onChange={handleChange}
										inputWidth="w-[200px]"
									/>

									<SmartField
										fieldName="fstatus"
										fieldText="Status"
										isSelect
										isLoading={loading.has("options")}
										value={filters.fstatus}
										placeholder="Selecione"
										inputWidth="w-[200px]"
										onChangeSelect={handleChange}
										options={[
											{ value: "1", label: "Ativo" },
											{ value: "0", label: "Inativo" },
										]}
									/>
								</div>

								{/* Coluna Data de Cadastro e Botão Filtrar */}
								<div className="flex flex-col gap-7 mb-10 justify-between">
									<Form.Field name="fdataCadastro" className="flex flex-col">
										<Form.Label asChild>
											<span className="text-xl pb-2 font-light">
												Data de Cadastro:
											</span>
										</Form.Label>
										<Form.Control asChild>
											<input
												type="date"
												name="fdataCadastro"
												id="fdataCadastro"
												value={filters.fdataCadastro}
												onChange={handleChange}
												className="bg-white border w-[200px] border-separator rounded-lg p-2.5"
											/>
										</Form.Control>
									</Form.Field>

									<Form.Submit asChild>
										<div className="flex gap-4 mt-8">
											<button
												type="submit"
												className="bg-verdeMedio p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
												disabled={loading.size > 0}
											>
												{loading.has("filterSubmit") ? (
													<Loader2 className="animate-spin h-6 w-6" />
												) : (
													<>
														<Search size={23} />
														Filtrar
													</>
												)}
											</button>
											<button
												type="button"
												className="bg-verdeLimparFiltros p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-hoverLimparFiltros "
												disabled={loading.size > 0}
												onClick={() =>
													setFilters(
														(prev) =>
															Object.fromEntries(
																Object.keys(prev).map((key) => [key, ""])
															) as typeof prev
													)
												}
											>
												<FilterX />
												Limpar
											</button>
										</div>
									</Form.Submit>
								</div>
							</div>
						</Form.Root>

						{/* Tabela Lista de Clientes */}
						<div className="min-w-[966px] max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-5">
							<table className="w-full border-collapse">
								{/* Tabela Cabeçalho */}
								<thead>
									<tr className="bg-verdePigmento text-white shadow-thead">
										{[
											"ID",
											"Nome Cliente/Empresa",
											"Tipo",
											"CPF/CNPJ",
											"Email",
											"Telefone",
											"CEP",
											"Endereço",
											"Nº",
											"Estado",
											"Cidade",
											"Status",
											"Observações",
											"Data de Cadastro",
											"Ações",
										].map((header) => (
											<th
												key={header}
												className="border border-black px-4 py-4 whitespace-nowrap"
											>
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{loading.has("clients") ? (
										<tr>
											<td colSpan={9} className="text-center py-4">
												<Loader2 className="animate-spin h-8 w-8 mx-auto" />
											</td>
										</tr>
									) : clientes.length === 0 ? (
										<tr>
											<td colSpan={9} className="text-center py-4">
												Nenhum cliente encontrado
											</td>
										</tr>
									) : (
										//Tabela Dados
										clientes.map((cliente, index) => (
											<tr
												key={cliente.cliente_id}
												className={
													index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
												}
											>
												{Object.values(cliente)
													.slice(0, 12)
													.map((value, idx) => (
														<td
															key={idx}
															className="border border-black p-4 whitespace-nowrap"
														>
															{value}
														</td>
													))}
												<td className="border border-black p-4 text-center">
													<button
														className="text-blue-600 cursor-pointer"
														onClick={() => handleObsClick(cliente)}
														title="Ver observações"
													>
														<Eye />
													</button>
												</td>
												<td className="border border-black p-4 text-center whitespace-nowrap">
													{new Date(
														cliente.cliente_data_cadastro
													).toLocaleDateString("pt-BR")}
												</td>
												<td className="border border-black p-4 text-center whitespace-nowrap">
													<button
														className="text-black cursor-pointer"
														onClick={() => handleEditClick(cliente)}
														title="Editar produto"
													>
														<PencilLine />
													</button>
													{userLevel === "Administrador" && (
														<button
															className="text-red-500 cursor-pointer ml-3"
															onClick={() => handleDeleteClick(cliente)}
															title="Excluir produto"
														>
															<Trash />
														</button>
													)}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
						{clientes.length !== 0 && (
							<div className="min-w-[966px] max-w-[73vw]">
								<button
									type="button"
									className="bg-verdeGrama p-3 w-[180px] ml-auto mb-5 rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-[#246127]"
									onClick={gerarRelatorio}
								>
									<Printer />
									Gerar Relatório
								</button>
							</div>
						)}

						{/* Modal de Observações */}
						<Modal
							withExitButton
							openModal={openObsModal}
							setOpenModal={setOpenObsModal}
							modalWidth="min-w-[300px] max-w-[500px]"
							modalTitle="Observações"
							obsText={currentObs}
						/>
					</Tabs.Content>

					{/* Aba de Cadastro de Clientes */}
					<Tabs.Content
						value="register"
						className="flex items-center justify-center"
					>
						<Form.Root className="flex flex-col" onSubmit={handleSubmit}>
							<h2 className="text-3xl mb-8">Cadastro de clientes:</h2>

							<div className="flex mb-8 gap-x-7 justify-between">

								<SmartField
									fieldName="tipo"
									fieldText="Tipo"
									isClearable={false}
									isSelect
									value={formData.tipo}
									inputWidth="w-[220px]"
									onChangeSelect={handleChange}
									options={[
										{ value: "juridica", label: "Pessoa Jurídica" },
										{ value: "fisica", label: "Pessoa Física" },
									]}
								/>

								{clientType === "juridica" && (
									<SmartField
										fieldName="cpf_cnpj"
										fieldText="CNPJ"
										withInputMask
										unstyled
										required
										type="text"
										mask="99.999.999/9999-99"
										autoClear={false}
										pattern="^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$"
										placeholder="Digite o CNPJ"
										value={formData.cpf_cnpj}
										onChange={handleChange}
										inputWidth="w-[220px]"
									/>
								)}

								{clientType === "fisica" && (
									<SmartField
										fieldName="cpf_cnpj"
										fieldText="CPF"
										withInputMask
										unstyled
										required
										type="text"
										mask="999.999.999-99"
										autoClear={false}
										pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
										placeholder="Digite o CPF"
										value={formData.cpf_cnpj}
										onChange={handleChange}
										inputWidth="w-[220px]"
									/>
								)}

								{clientType === "fisica" && (
									<SmartField
										fieldName="email"
										fieldText="Email"
										fieldClassname="flex flex-col flex-1"
										required
										type="email"
										placeholder="Digite o e-mail do cliente"
										autoComplete="email"
										value={formData.email}
										onChange={handleChange}
									/>
								)}

								{clientType === "juridica" && (
									<SmartField
										fieldName="razao_social"
										fieldText="Razão Social"
										fieldClassname="flex flex-col flex-1"
										required
										type="text"
										placeholder="Digite a Razão Social da Empresa"
										autoComplete="name"
										value={formData.razao_social}
										onChange={handleChange}
									/>
								)}
							</div>

							<div className="flex mb-8 gap-x-7 justify-between">
								{clientType === "fisica" && (
									<SmartField
										fieldName="nome_empresa_cliente"
										fieldText="Nome do cliente"
										type="text"
										required
										placeholder="Digite o nome completo do Cliente"
										autoComplete="name"
										value={formData.nome_empresa_cliente}
										onChange={handleChange}
										inputWidth="w-[472px]"
									/>
								)}

								{clientType === "juridica" && (
									<SmartField
										fieldName="nome_empresa_cliente"
										fieldText="Nome Fantasia da Empresa"
										required
										type="text"
										placeholder="Digite o nome Fantasia da empresa"
										autoComplete="name"
										value={formData.nome_empresa_cliente}
										onChange={handleChange}
										inputWidth="w-[300px]"
									/>
								)}

								{clientType === "juridica" && (
									<SmartField
										fieldName="email"
										fieldText="Email"
										required
										type="email"
										placeholder="Digite o e-mail do cliente"
										autoComplete="email"
										value={formData.email}
										onChange={handleChange}
										inputWidth="w-[250px]"
									/>
								)}

								<SmartField
									fieldName="tel"
									fieldText="Telefone"
									withInputMask
									unstyled
									required
									type="tel"
									mask="(99) 9999?9-9999"
									autoClear={false}
									pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
									placeholder="Digite o Telefone"
									autoComplete="tel"
									value={formData.tel}
									onChange={handleChange}
									inputWidth="w-[190px]"
								/>

								<SmartField
									fieldName="cep"
									fieldText="CEP"
									withInputMask
									unstyled
									required
									type="text"
									mask="99999-999"
									autoClear={false}
									pattern="^\d{5}-\d{3}$"
									placeholder="Digite o CEP"
									autoComplete="postal-code"
									value={formData.cep}
									onChange={handleChange}
									onBlur={handleCepBlur}
									inputWidth="w-[150px]"
								/>
							</div>

							<div className="flex mb-8 gap-x-7 justify-between">
								<SmartField
									fieldName="endereco"
									fieldText="Endereço"
									fieldClassname="flex flex-col flex-1"
									required
									type="text"
									placeholder="Endereço Completo"
									value={formData.endereco}
									onChange={handleChange}
									autoComplete="street-address"
								/>

								<SmartField
									fieldName="num_endereco"
									fieldText="Número"
									required
									type="text"
									placeholder="Número"
									value={formData.num_endereco}
									onChange={handleChange}
									autoComplete="address-line1"
									inputWidth="w-[90px]"
								/>

								<SmartField
									fieldName="estado"
									fieldText="Estado"
									isSelect
									isLoading={loading.has("options")}
									value={formData.estado}
									placeholder="Selecione"
									autoComplete="address-level1"
									error={errors.states ? "*" : undefined}
									inputWidth="w-[200px]"
									onChangeSelect={handleChange}
									options={[
										{ value: "AC", label: "Acre" },
										{ value: "AL", label: "Alagoas" },
										{ value: "AP", label: "Amapá" },
										{ value: "AM", label: "Amazonas" },
										{ value: "BA", label: "Bahia" },
										{ value: "CE", label: "Ceará" },
										{ value: "DF", label: "Distrito Federal" },
										{ value: "ES", label: "Espírito Santo" },
										{ value: "GO", label: "Goiás" },
										{ value: "MA", label: "Maranhão" },
										{ value: "MT", label: "Mato Grosso" },
										{ value: "MS", label: "Mato Grosso do Sul" },
										{ value: "MG", label: "Minas Gerais" },
										{ value: "PA", label: "Pará" },
										{ value: "PB", label: "Paraíba" },
										{ value: "PR", label: "Paraná" },
										{ value: "PE", label: "Pernambuco" },
										{ value: "PI", label: "Piauí" },
										{ value: "RJ", label: "Rio de Janeiro" },
										{ value: "RN", label: "Rio Grande do Norte" },
										{ value: "RS", label: "Rio Grande do Sul" },
										{ value: "RO", label: "Rondônia" },
										{ value: "RR", label: "Roraima" },
										{ value: "SC", label: "Santa Catarina" },
										{ value: "SP", label: "São Paulo" },
										{ value: "SE", label: "Sergipe" },
										{ value: "TO", label: "Tocantins" },
									]}
								/>

								<SmartField
									fieldName="cidade"
									fieldText="Cidade"
									required
									type="text"
									placeholder="Cidade"
									value={formData.cidade}
									onChange={handleChange}
									autoComplete="address-level2"
									inputWidth="w-[200px]"
								/>
							</div>

							<div className="flex mb-10">
								<SmartField
									isTextArea
									fieldName="obs"
									fieldText="Observações"
									fieldClassname="flex flex-col w-full"
									placeholder="Digite as observações do cliente"
									value={formData.obs}
									onChange={handleChange}
								/>
							</div>

							<Form.Submit asChild>
								<div className="flex place-content-center mb-5">
									<button
										type="submit"
										className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center w-52"
										disabled={loading.size > 0}
									>
										{loading.has("submit") ? (
											<Loader2 className="animate-spin h-6 w-6" />
										) : (
											"Cadastrar Cliente"
										)}
									</button>
								</div>
							</Form.Submit>
						</Form.Root>
					</Tabs.Content>
				</Tabs.Root>

				{/* Modal de Avisos */}
				<NoticeModal
					openModal={openNoticeModal}
					setOpenModal={setOpenNoticeModal}
					successMsg={successMsg}
					message={message}
				/>

				{/* Modal de Relatório */}
				{relatorioModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold">Relatório de Clientes</h2>
								<button
									onClick={() => setRelatorioModalOpen(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X size={24} />
								</button>
							</div>

							<div className="flex-1 overflow-auto mb-4">
								{relatorioContent ? (
									<iframe
										src={relatorioContent}
										className="w-full h-full min-h-[70vh] border"
										title="Relatório de Clientes"
									/>
								) : (
									<p>Carregando relatório...</p>
								)}
							</div>

							<div className="flex justify-end gap-4">
								<a
									href={relatorioContent}
									download="relatorio_usuarios.pdf"
									className="bg-verdeGrama text-white px-4 py-2 rounded hover:bg-[#246127]"
								>
									Baixar Relatório
								</a>
								<button
									onClick={() => setRelatorioModalOpen(false)}
									className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
								>
									Fechar
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Cliente:"
					leftButtonText="Editar"
					rightButtonText="Cancelar"
					loading={loading}
					isLoading={loading.has("updateClient")}
					onCancel={() => {
						clearFormData();
						setClientType("juridica");
					}}
					onSubmit={handleUpdateClient}
				>
					<div className="flex mb-6 gap-x-8 justify-between">
						{clientType === "juridica" && (
							<>
								<SmartField
									fieldName="nome_empresa_cliente"
									fieldText="Nome Fantasia da Empresa"
									required
									type="text"
									placeholder="Digite o nome Fantasia da empresa"
									autoComplete="name"
									value={formData.nome_empresa_cliente}
									onChange={handleChange}
									inputWidth="w-[300px]"
								/>
								<SmartField
									fieldName="razao_social"
									fieldText="Razão Social"
									fieldClassname="flex flex-col flex-1"
									required
									type="text"
									placeholder="Digite a Razão Social da Empresa"
									autoComplete="name"
									value={formData.razao_social}
									onChange={handleChange}
								/>
							</>
						)}

						{clientType === "fisica" && (
							<SmartField
								fieldName="nome_empresa_cliente"
								fieldText="Nome do cliente"
								fieldClassname="flex flex-col flex-1"
								type="text"
								required
								placeholder="Digite o nome completo do Cliente"
								autoComplete="name"
								value={formData.nome_empresa_cliente}
								onChange={handleChange}
							/>
						)}

						<SmartField
							fieldName="tipo"
							fieldText="Tipo"
							inputWidth="w-[220px]"
							isClearable={false}
							isSelect
							value={formData.tipo}
							onChangeSelect={handleChange}
							options={[
								{ value: "juridica", label: "Pessoa Jurídica" },
								{ value: "fisica", label: "Pessoa Física" },
							]}
						/>
					</div>

					<div className="flex mb-6 gap-x-7 justify-between">
						<SmartField
							fieldName="email"
							fieldText="Email"
							required
							type="email"
							placeholder="Digite o e-mail do cliente"
							autoComplete="email"
							value={formData.email}
							onChange={handleChange}
							inputWidth="w-[300px]"
						/>

						{clientType === "juridica" && (
							<SmartField
								fieldName="cpf_cnpj"
								fieldText="CNPJ"
								withInputMask
								unstyled
								required
								type="text"
								mask="99.999.999/9999-99"
								autoClear={false}
								pattern="^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$"
								placeholder="Digite o CNPJ"
								value={formData.cpf_cnpj}
								onChange={handleChange}
								inputWidth="w-[180px]"
							/>
						)}

						{clientType === "fisica" && (
							<SmartField
								fieldName="cpf_cnpj"
								fieldText="CPF"
								withInputMask
								unstyled
								required
								type="text"
								mask="999.999.999-99"
								autoClear={false}
								pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
								placeholder="Digite o CPF"
								value={formData.cpf_cnpj}
								onChange={handleChange}
								inputWidth="w-[160px]"
							/>
						)}

						<SmartField
							fieldName="tel"
							fieldText="Telefone"
							withInputMask
							unstyled
							required
							type="tel"
							mask="(99) 9999?9-9999"
							autoClear={false}
							pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
							placeholder="Digite o Telefone"
							autoComplete="tel"
							value={formData.tel}
							onChange={handleChange}
							inputWidth="w-[180px]"
						/>

						<SmartField
							fieldName="status"
							fieldText="Status"
							isSelect
							isClearable={false}
							isLoading={loading.has("options")}
							value={formData.status}
							inputWidth="w-[150px]"
							onChangeSelect={handleChange}
							options={[
								{ value: "1", label: "Ativo" },
								{ value: "0", label: "Inativo" },
							]}
						/>

						<SmartField
							fieldName="cep"
							fieldText="CEP"
							withInputMask
							unstyled
							required
							type="text"
							mask="99999-999"
							autoClear={false}
							pattern="^\d{5}-\d{3}$"
							placeholder="Digite o CEP"
							autoComplete="postal-code"
							value={formData.cep}
							onChange={handleChange}
							onBlur={handleCepBlur}
							inputWidth="w-[150px]"
						/>
					</div>

					<div className="flex mb-6 gap-x-7 justify-between">
						<SmartField
							fieldName="endereco"
							fieldText="Endereço"
							fieldClassname="flex flex-col flex-1"
							required
							type="text"
							placeholder="Endereço Completo"
							value={formData.endereco}
							onChange={handleChange}
							autoComplete="street-address"
						/>

						<SmartField
							fieldName="num_endereco"
							fieldText="Número"
							required
							type="text"
							placeholder="Número"
							value={formData.num_endereco}
							onChange={handleChange}
							autoComplete="address-line1"
							inputWidth="w-[90px]"
						/>

						<SmartField
							fieldName="estado"
							fieldText="Estado"
							isSelect
							isClearable={false}
							isLoading={loading.has("options")}
							value={formData.estado}
							autoComplete="address-level1"
							inputWidth="w-[195px]"
							onChangeSelect={handleChange}
							options={[
								{ value: "AC", label: "Acre" },
								{ value: "AL", label: "Alagoas" },
								{ value: "AP", label: "Amapá" },
								{ value: "AM", label: "Amazonas" },
								{ value: "BA", label: "Bahia" },
								{ value: "CE", label: "Ceará" },
								{ value: "DF", label: "Distrito Federal" },
								{ value: "ES", label: "Espírito Santo" },
								{ value: "GO", label: "Goiás" },
								{ value: "MA", label: "Maranhão" },
								{ value: "MT", label: "Mato Grosso" },
								{ value: "MS", label: "Mato Grosso do Sul" },
								{ value: "MG", label: "Minas Gerais" },
								{ value: "PA", label: "Pará" },
								{ value: "PB", label: "Paraíba" },
								{ value: "PR", label: "Paraná" },
								{ value: "PE", label: "Pernambuco" },
								{ value: "PI", label: "Piauí" },
								{ value: "RJ", label: "Rio de Janeiro" },
								{ value: "RN", label: "Rio Grande do Norte" },
								{ value: "RS", label: "Rio Grande do Sul" },
								{ value: "RO", label: "Rondônia" },
								{ value: "RR", label: "Roraima" },
								{ value: "SC", label: "Santa Catarina" },
								{ value: "SP", label: "São Paulo" },
								{ value: "SE", label: "Sergipe" },
								{ value: "TO", label: "Tocantins" },
							]}
						/>

						<SmartField
							fieldName="cidade"
							fieldText="Cidade"
							required
							type="text"
							placeholder="Cidade"
							value={formData.cidade}
							onChange={handleChange}
							autoComplete="address-level2"
							inputWidth="w-[195px]"
						/>
					</div>

					<div className="flex mb-6">
						<SmartField
							isTextArea
							fieldName="obs"
							fieldText="Observações"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite as observações do cliente"
							value={formData.obs}
							onChange={handleChange}
							rows={2}
						/>
					</div>
				</Modal>

				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Cliente:"
					leftButtonText="Excluir"
					rightButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<div className="flex mb-10">
						<SmartField
							fieldName="dnome_cliente"
							fieldText="Nome do Cliente"
							fieldClassname="flex flex-col w-full"
							type="text"
							autoComplete="name"
							required
							readOnly
							value={deleteClient.dnome_cliente}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-10 ">
						<SmartField
							isTextArea
							fieldName="reason"
							required
							autoFocus
							fieldText="Motivo da Exclusão"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite o motivo da exclusão do cliente"
							value={deleteClient.reason}
							onChange={handleChange}
						/>
					</div>
				</Modal>

				{/* Alert para confirmar exclusão do cliente */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o cliente?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteClient}
					loading={loading}
					isLoading={loading.has("deleteClient")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir cliente"
				/>
			</div>
		</div>
	);
}
