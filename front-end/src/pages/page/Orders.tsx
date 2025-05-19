import { useState, useEffect } from "react";

import axios from "axios";
import { Tabs, Form } from "radix-ui";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { useNavigate } from "react-router-dom";
import { OnChangeValue } from "react-select";
import {
	Eye,
	PencilLine,
	Trash,
	Search,
	Loader2,
	FilterX,
	Printer, X,
} from "lucide-react";

import { Option, OrderStatus } from "../../utils/types";
import { cepApi } from "../../utils/cepApi";
import {
	SmartField,
	ConfirmationModal,
	Modal,
	NoticeModal,
} from "../../shared";

interface Estado {
	estado_id: number;
	pedido_estado: string;
}

interface Cliente {
	cliente_id: number;
	cliente_nome_ou_empresa: string;
	pedido_telefone: string;
}

interface Unidade {
	unidade_id: number;
	unidade_nome: string;
}

interface Pedido {
	pedido_id: number;
	cliente_nome_ou_empresa: string;
	pedido_telefone: string;
	pedido_cep: string;
	pedido_endereco: string;
	pedido_num_endereco: string;
	pedido_complemento: string;
	pedido_cidade: string;
	pedido_estado: string;
	pedido_prevEntrega: string;
	pedido_dtCadastro: string;
	pedido_observacoes: string;
	pedido_valor_total: number;
	stapedido_nome: string;
	stapedido_id: number;
	pedidoitem_id?: number;
	pedido_itens: PedidoItem[];
}

interface PedidoItem {
	pedidoitem_id: number;
	produto_nome: string;
	pedidoitem_quantidade: number;
	unidade_nome: string;
	pedidoitem_preco: number;
	pedidoitem_subtotal: number;
}

export default function Orders() {
	const [activeTab, setActiveTab] = useState("list");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	const [currentObs, setCurrentObs] = useState("");
	const [userLevel, setUserLevel] = useState("");
	const [suggestions, setSuggestions] = useState<Cliente[]>([]);
	const [openOrderModal, setOpenOrderModal] = useState(false);
	const [numOrder, setNumOrder] = useState(0);
	const [clientOrder, setClientOrder] = useState("");
	const [totalOrder, setTotalOrder] = useState(0);
	const [selectedOrder, setSelectedOrder] = useState<PedidoItem[]>([]);
	const [message, setMessage] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [pedidos, setPedidos] = useState<Pedido[]>([]);
	const [errors, setErrors] = useState({
		status: false,
		unit: false,
		states: false,
	});
	const [formData, setFormData] = useState({
		pedido_id: 0,
		nome_cliente: "",
		tel: "",
		cep: "",
		status: "",
		endereco: "",
		num_endereco: "",
		estado: "",
		cidade: "",
		prev_entrega: "",
		obs: "",
	});
	const [options, setOptions] = useState<{
		estados: Estado[];
		status: OrderStatus[];
		unidades_medida: Unidade[];
	}>({
		estados: [],
		status: [],
		unidades_medida: [],
	});
	const [filters, setFilters] = useState({
		fnum_pedido: "",
		fnome_cliente: "",
		ftel: "",
		fstatus: "",
		fcep: "",
		festado: "",
		fcidade: "",
		fprev_entrega: "",
		fdt_cadastro: "",
	});
	const [deleteOrder, setDeleteOrder] = useState({
		pedido_id: 0,
		dnum_pedido: 0,
		dnome_cliente: "",
		reason: "",
	});

	//Função para buscar os clientes cadastrados e fazer a listagem deles
	const fetchClientes = (query: string) => {
		axios
			.get("http://localhost/BioVerde/back-end/pedidos/listar_clientes.php", {
				params: { q: query },
			})
			.then((res) => {
				console.log(res.data);
				setSuggestions(res.data);
			})
			.catch((err) => {
				console.error(err);
				setSuggestions([]);
			});
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

	const fetchData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "orders", "options"]));

			const [optionsResponse, pedidosResponse, userLevelResponse] =
				await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/pedidos/listar_opcoes.php",
						{
							withCredentials: true,
							headers: {
								Accept: "application/json",
								"Content-Type": "application/json",
							},
						}
					),
					axios.get(
						"http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php",
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

			console.log("Resposta do back-end Pedidos:", pedidosResponse.data);
			console.log("Resposta do back-end Options:", optionsResponse.data);

			if (optionsResponse.data.success) {
				setOptions({
					estados: optionsResponse.data.estados || [],
					status: optionsResponse.data.status || [],
					unidades_medida: optionsResponse.data.unidades_medida || [],
				});
			} else {
				setOpenNoticeModal(true);
				setMessage(optionsResponse.data.message || "Erro ao carregar opções");
			}

			if (pedidosResponse.data.success) {
				setPedidos(pedidosResponse.data.pedidos || []);
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
				["orders", "options"].forEach((item) => newLoading.delete(item));
				return newLoading;
			});
		}
	};

	useEffect(() => {
		fetchData();
		fetchClientes("");
	}, []);

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "orders"]));

			const response = await axios.get(
				"http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php",
				{ withCredentials: true }
			);

			if (response.data.success) {
				setPedidos(response.data.pedidos || []);
				return true;
			} else {
				setMessage(response.data.message || "Erro ao carregar pedidos");
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
				newLoading.delete("orders");
				return newLoading;
			});
		}
	};

	//função para puxar os dados do pedido que será editado
	const handleEditClick = (pedido: Pedido) => {
		const formatDate = (isoDate: string) => {
			const date = new Date(isoDate);
			// Retorna no formato YYYY-MM-DD
			return date.toISOString().split("T")[0];
		};

		setFormData({
			pedido_id: pedido.pedido_id,
			nome_cliente: pedido.cliente_nome_ou_empresa,
			tel: pedido.pedido_telefone,
			cep: pedido.pedido_cep,
			status:
				options.status
					.find((status) => status.stapedido_nome === pedido.stapedido_nome)
					?.stapedido_id.toString() ?? "",
			endereco: pedido.pedido_endereco,
			num_endereco: pedido.pedido_num_endereco,
			estado: pedido.pedido_estado,
			cidade: pedido.pedido_cidade,
			prev_entrega: formatDate(pedido.pedido_prevEntrega),
			obs: pedido.pedido_observacoes,
		});
		setOpenEditModal(true);
	};

	//função para puxar o nome do pedido que será excluido
	const handleDeleteClick = (pedido: Pedido) => {
		setDeleteOrder({
			pedido_id: pedido.pedido_id,
			dnum_pedido: pedido.pedido_id,
			dnome_cliente: pedido.cliente_nome_ou_empresa,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	//OnChange dos campos
	const handleChange = (
		event:
			| React.ChangeEvent<
					HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			  >
			| InputMaskChangeEvent
	) => {
		const { name, value } = event.target;

		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in filters) {
			setFilters({ ...filters, [name]: value });
		}
		if (name in deleteOrder) {
			setDeleteOrder({ ...deleteOrder, [name]: value });
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

	// submit de Filtrar pedidos
	const handleFilterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "filterSubmit"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/pedidos/filtro.pedido.php",
				filters,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				setPedidos(response.data.pedidos);
			} else {
				setOpenNoticeModal(true);
				setMessage(
					response.data.message || "Nenhum pedido encontrado com esse filtro"
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

	// submit para atualizar o pedido após a edição dele
	const handleUpdateOrder = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Dados sendo enviados:", formData); // <-- Adicione esta linha

		setLoading((prev) => new Set([...prev, "updateOrder"]));
		setSuccessMsg(false);

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
				setMessage(response.data.message || "Erro ao atualizar pedido.");
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
				newLoading.delete("updateOrder");
				return newLoading;
			});
		}
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

	//Função para chamar a api de CEP
	const handleCepBlur = () => {
		setSuccessMsg(false);
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
					Object.entries(prev).map(([key, value]) => {
						if (key === "nome_cliente") {
							return [key, { value: "", label: "" }];
						}
						return [key, typeof value === "number" ? 0 : ""];
					})
				) as typeof prev
		);
	};

	const handleObsClick = (pedido: Pedido) => {
		setCurrentObs(pedido.pedido_observacoes);
		setOpenObsModal(true);
	};

	const handleSeeOrderClick = (pedido: Pedido) => {
		setNumOrder(pedido.pedido_id);
		setClientOrder(pedido.cliente_nome_ou_empresa);
		setTotalOrder(pedido.pedido_valor_total);
		setSelectedOrder(pedido.pedido_itens);
		setOpenOrderModal(true);
	};

	return (
		<div className="flex-1 p-6 pl-[280px]">
			<div className="px-6 font-[inter] bg-brancoSal">
				<h1 className=" text-[40px] font-semibold text-center mb-3">Pedidos</h1>

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
							Lista de Pedidos
						</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="list" className="flex flex-col w-full">
						<Form.Root
							className="flex flex-col gap-4"
							onSubmit={handleFilterSubmit}
						>
							<h2 className="text-3xl">Filtros:</h2>
							<div className="flex flex-col gap-7 max-w-[996px]">
								<div className="flex gap-7 justify-between">
									<SmartField
										fieldName="fnum_pedido"
										fieldText="Nº Pedido"
										type="number"
										placeholder="Nº Pedido"
										value={filters.fnum_pedido}
										onChange={handleChange}
										inputWidth="w-[120px]"
									/>

									<SmartField
										fieldName="fnome_cliente"
										fieldText="Cliente"
										fieldClassname="flex flex-col flex-1"
										isCreatableSelect
										placeholder="Selecione um cliente"
										isLoading={loading.has("orders")}
										value={suggestions
											.map((cliente: Cliente) => ({
												value: cliente.cliente_nome_ou_empresa,
												label: cliente.cliente_nome_ou_empresa,
											}))
											.find(
												(opt) => opt.value === formData.nome_cliente || null
											)}
										options={suggestions.map((cliente: Cliente) => ({
											value: cliente.cliente_nome_ou_empresa,
											label: cliente.cliente_nome_ou_empresa,
										}))}
										onChange={(option: OnChangeValue<Option, false>) => {
											setFilters({
												...filters,
												fnome_cliente: option?.value.toString() ?? "",
											});
										}}
									>
										{suggestions.map((cliente) => (
											<option
												key={cliente.cliente_id}
												value={cliente.cliente_nome_ou_empresa}
											>
												{cliente.cliente_nome_ou_empresa}
											</option>
										))}
									</SmartField>

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
										inputWidth="w-[220px]"
									/>
								</div>

								<div className="flex justify-between">
									<SmartField
										fieldName="fstatus"
										fieldText="Status"
										isSelect
										value={filters.fstatus}
										onChange={handleChange}
										isLoading={loading.has("options")}
										inputWidth="w-[220px]"
									>
										<option value="todos">Todos</option>
										{options.status?.map((status) => (
											<option
												key={status.stapedido_id}
												value={status.stapedido_id}
											>
												{status.stapedido_nome}
											</option>
										))}
									</SmartField>

									<SmartField
										fieldName="fcep"
										fieldText="CEP"
										withInputMask
										unstyled
										type="text"
										mask="99999-999"
										autoClear={false}
										placeholder="Digite o CEP"
										autoComplete="postal-code"
										value={filters.fcep}
										onChange={handleChange}
										onBlur={handleCepBlur}
										inputWidth="w-[220px]"
									/>

									<SmartField
										fieldName="festado"
										fieldText="Estado"
										isSelect
										value={filters.festado}
										onChange={handleChange}
										autoComplete="address-level1"
										isLoading={loading.has("options")}
										inputWidth="w-[220px]"
									>
										<option value="">Todos</option>
										<option value="AC">Acre</option>
										<option value="AL">Alagoas</option>
										<option value="AP">Amapá</option>
										<option value="AM">Amazonas</option>
										<option value="BA">Bahia</option>
										<option value="CE">Ceará</option>
										<option value="DF">Distrito Federal</option>
										<option value="ES">Espírito Santo</option>
										<option value="GO">Goiás</option>
										<option value="MA">Maranhão</option>
										<option value="MT">Mato Grosso</option>
										<option value="MS">Mato Grosso do Sul</option>
										<option value="MG">Minas Gerais</option>
										<option value="PA">Pará</option>
										<option value="PB">Paraíba</option>
										<option value="PR">Paraná</option>
										<option value="PE">Pernambuco</option>
										<option value="PI">Piauí</option>
										<option value="RJ">Rio de Janeiro</option>
										<option value="RN">Rio Grande do Norte</option>
										<option value="RS">Rio Grande do Sul</option>
										<option value="RO">Rondônia</option>
										<option value="RR">Roraima</option>
										<option value="SC">Santa Catarina</option>
										<option value="SP">São Paulo</option>
										<option value="SE">Sergipe</option>
										<option value="TO">Tocantins</option>
									</SmartField>

									<SmartField
										fieldName="fcidade"
										fieldText="Cidade"
										type="text"
										placeholder="Cidade"
										value={filters.fcidade}
										onChange={handleChange}
										autoComplete="address-level2"
										inputWidth="w-[220px]"
									/>
								</div>

								<div className="flex justify-between mb-8">
									<SmartField
										type="date"
										fieldName="fprev_entrega"
										fieldText="Previsão de entrega"
										value={filters.fprev_entrega}
										onChange={handleChange}
										inputWidth="w-[220px]"
									/>

									<SmartField
										type="date"
										fieldName="fdt_cadastro"
										fieldText="Data de Cadastro"
										value={filters.fdt_cadastro}
										onChange={handleChange}
										inputWidth="w-[220px]"
									/>

									<Form.Submit asChild>
										<div className="flex gap-5 mt-8 w-[220px]">
											<button
												type="submit"
												className="bg-verdeMedio p-3 w-[120px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
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
												className="bg-verdeLimparFiltros p-3 w-[120px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-hoverLimparFiltros "
												disabled={loading.size > 0}
												onClick={() =>
													setFilters(
														(prev) =>
															Object.fromEntries(
																Object.entries(prev).map(([key, value]) => [
																	key,
																	typeof value === "number" ? 0 : "",
																])
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

						<div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-verdePigmento text-white shadow-thead">
										{[
											"ID",
											"Cliente",
											"Data",
											"Status",
											"Previsão de Entrega",
											"Itens do Pedido",
											"Valor Total",
											"Telefone",
											"CEP",
											"Endereço",
											"Nº",
											"Complemento",
											"Cidade",
											"Estado",
											"Observações",
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
									{loading.has("orders") ? (
										<tr>
											<td colSpan={9} className="text-center py-4">
												<Loader2 className="animate-spin h-8 w-8 mx-auto" />
											</td>
										</tr>
									) : pedidos.length === 0 ? (
										<tr>
											<td colSpan={9} className="text-center py-4">
												Nenhum pedido encontrado
											</td>
										</tr>
									) : (
										//Tabela Dados
										pedidos.map((pedido, index) => (
											<tr
												key={pedido.pedido_id}
												className={
													index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
												}
											>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_id}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.cliente_nome_ou_empresa}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{new Date(
														pedido.pedido_dtCadastro
													).toLocaleDateString("pt-BR")}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.stapedido_nome}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{new Date(
														pedido.pedido_prevEntrega
													).toLocaleDateString("pt-BR")}
												</td>
												{/* Itens do Pedido */}
												<td className="border border-black p-4 text-center">
													<button
														className="text-blue-600 cursor-pointer"
														onClick={() => handleSeeOrderClick(pedido)}
														title="Ver Itens"
													>
														<Eye />
													</button>
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													R$ {pedido.pedido_valor_total.toFixed(2)}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_telefone}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_cep}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_endereco}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_num_endereco}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_complemento}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_cidade}
												</td>
												<td className="border border-black px-4 py-4 whitespace-nowrap">
													{pedido.pedido_estado}
												</td>

												{/* Observações */}
												<td className="border border-black p-4 text-center">
													<button
														className="text-blue-600 cursor-pointer"
														onClick={() => handleObsClick(pedido)}
														title="Ver observações"
													>
														<Eye />
													</button>
												</td>
												<td className="border border-black p-4 text-center whitespace-nowrap">
													<button
														className="text-black cursor-pointer"
														onClick={() => handleEditClick(pedido)}
														title="Editar produto"
													>
														<PencilLine />
													</button>
													{userLevel === "Administrador" && (
														<button
															className="text-red-500 cursor-pointer ml-3"
															onClick={() => handleDeleteClick(pedido)}
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
						{pedidos.length !== 0 && (
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

						{/* Modal de Pedidos */}
						<Modal
							isOrderModal
							withExitButton
							openModal={openOrderModal}
							setOpenModal={setOpenOrderModal}
							modalWidth="min-w-[700px]"
							modalTitle={
								<>
									Nº do Pedido: <span className="font-normal">{numOrder}</span>
								</>
							}
							modalSecondTitle={
								<>
									Cliente: <span className="font-normal">{clientOrder}</span>
								</>
							}
							totalPedido={totalOrder}
						>
							<div className="max-w-[910px] max-h-[300px] overflow-x-auto overflow-y-auto">
								<table className="w-full border-collapse">
									<thead className="bg-verdePigmento text-white shadow-thead">
										<tr>
											{[
												"#",
												"Produto",
												"Qtd.",
												"Preço Unitário",
												"Subtotal",
											].map((header) => (
												<th
													key={header}
													className="border border-black px-2 py-3 whitespace-nowrap"
												>
													{header}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{selectedOrder.map((item, index) => {
											const itemData = [
												index + 1,
												item.produto_nome,
												`${item.pedidoitem_quantidade} ${item.pedidoitem_quantidade}`,
												`R$ ${item.pedidoitem_preco}`,
												`R$ ${item.pedidoitem_subtotal.toFixed(2)}`,
											];
											return (
												<tr
													key={index}
													className={
														index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
													}
												>
													{itemData.map((value, i) => (
														<td
															key={i}
															className="border border-black px-3 py-3 text-center whitespace-nowrap"
														>
															{value}
														</td>
													))}
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</Modal>

						{/* Modal de Relatório */}
						{relatorioModalOpen && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
								<div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-xl font-bold">Relatório de Usuários</h2>
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
												title="Relatório de Usuários"
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
				</Tabs.Root>

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
					leftButtonText="Editar"
					rightButtonText="Cancelar"
					loading={loading}
					isLoading={loading.has("updateOrder")}
					onCancel={() => clearFormData()}
					onSubmit={handleUpdateOrder}
				>
					<div className="flex gap-10 mb-8">
						<SmartField
							fieldName="num_pedido"
							fieldText="Nº Pedido"
							type="number"
							required
							placeholder="Nº Pedido"
							value={formData.pedido_id}
							onChange={handleChange}
							inputWidth="w-[120px]"
						/>

						<SmartField
							fieldName="nome_cliente"
							fieldText="Cliente"
							fieldClassname="flex flex-col flex-1"
							isCreatableSelect
							placeholder="Selecione um cliente"
							isLoading={loading.has("orders")}
							defaultValue={formData.nome_cliente}
							options={suggestions.map((cliente: Cliente) => ({
								value: cliente.cliente_nome_ou_empresa,
								label: cliente.cliente_nome_ou_empresa,
							}))}
							onChange={(newValue: any) =>
								setFormData({
									...formData,
									nome_cliente: newValue.value ?? "",
								})
							}
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
							inputWidth="w-[200px]"
						/>
					</div>

					<div className="flex gap-10 mb-8">
						<SmartField
							fieldName="endereco"
							fieldText="Endereço"
							required
							type="text"
							placeholder="Endereço"
							value={formData.endereco}
							onChange={handleChange}
							autoComplete="street-address"
							inputWidth="w-[300px]"
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
							value={formData.estado}
							onChange={handleChange}
							autoComplete="address-level1"
							isLoading={loading.has("options")}
							error={errors.states ? "*" : undefined}
							placeholderOption="Selecione o Estado"
							inputWidth="w-[200px]"
						>
							<option value="AC">Acre</option>
							<option value="AL">Alagoas</option>
							<option value="AP">Amapá</option>
							<option value="AM">Amazonas</option>
							<option value="BA">Bahia</option>
							<option value="CE">Ceará</option>
							<option value="DF">Distrito Federal</option>
							<option value="ES">Espírito Santo</option>
							<option value="GO">Goiás</option>
							<option value="MA">Maranhão</option>
							<option value="MT">Mato Grosso</option>
							<option value="MS">Mato Grosso do Sul</option>
							<option value="MG">Minas Gerais</option>
							<option value="PA">Pará</option>
							<option value="PB">Paraíba</option>
							<option value="PR">Paraná</option>
							<option value="PE">Pernambuco</option>
							<option value="PI">Piauí</option>
							<option value="RJ">Rio de Janeiro</option>
							<option value="RN">Rio Grande do Norte</option>
							<option value="RS">Rio Grande do Sul</option>
							<option value="RO">Rondônia</option>
							<option value="RR">Roraima</option>
							<option value="SC">Santa Catarina</option>
							<option value="SP">São Paulo</option>
							<option value="SE">Sergipe</option>
							<option value="TO">Tocantins</option>
						</SmartField>

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

					<div className="flex mb-5 justify-between">
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
							inputWidth="w-[250px]"
						/>

						<SmartField
							type="date"
							required
							fieldName="prev_entrega"
							fieldText="Previsão de entrega"
							value={formData.prev_entrega}
							onChange={handleChange}
							inputWidth="w-[250px]"
						/>

						<SmartField
							fieldName="status"
							fieldText="Status"
							isSelect
							value={formData.status}
							onChange={handleChange}
							isLoading={loading.has("options")}
							inputWidth="w-[250px]"
						>
							{options.status?.map((status) => (
								<option key={status.stapedido_id} value={status.stapedido_id}>
									{status.stapedido_nome}
								</option>
							))}
						</SmartField>
					</div>

					<div className="flex mb-5">
						<SmartField
							isTextArea
							fieldName="obs"
							fieldText="Observações"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite as observações do pedido"
							value={formData.obs}
							onChange={handleChange}
							rows={2}
						/>
					</div>
				</Modal>

				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Pedido:"
					leftButtonText="Excluir"
					rightButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<div className="flex mb-8">
						<SmartField
							fieldName="dnum_pedido"
							fieldText="Nome do Pedido"
							fieldClassname="flex flex-col w-full"
							type="text"
							required
							readOnly
							value={deleteOrder.dnum_pedido}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-8">
						<SmartField
							fieldName="dnome_cliente"
							fieldText="Nome do Cliente"
							fieldClassname="flex flex-col w-full"
							type="text"
							required
							readOnly
							value={deleteOrder.dnome_cliente}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-8 ">
						<SmartField
							isTextArea
							fieldName="reason"
							required
							autoFocus
							fieldText="Motivo da Exclusão"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite o motivo da exclusão do pedido"
							value={deleteOrder.reason}
							onChange={handleChange}
						/>
					</div>
				</Modal>

				{/* Alert para confirmar exclusão do fornecedor */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir o pedido?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteOrder}
					loading={loading}
					isLoading={loading.has("deleteOrder")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir pedido"
				/>
			</div>
		</div>
	);
}
