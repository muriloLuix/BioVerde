import { useState, useEffect } from "react";

import axios from "axios";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { Tabs, Form } from "radix-ui";
import {
	Search,
	PencilLine,
	Trash,
	Loader2,
	Eye,
	FilterX,
	Printer,
} from "lucide-react";

import {
	SmartField,
	Modal,
	NoticeModal,
	ConfirmationModal,
} from "../../shared";

interface Tipo {
	tproduto_id: number;
	tproduto_nome: string;
}
interface Status {
	staproduto_id: number;
	staproduto_nome: string;
}
// interface Lote {
// 	lote_id: number;
// }

interface Produto {
	produto_id: number;
	produto_nome: string;
	tproduto_nome: string;
	produto_preco: string;
	lote_id: number;
	fornecedor_nome_ou_empresa: string;
	produto_observacoes: string;
	staproduto_nome: string;
}

interface Fornecedor {
	fornecedor_id: number;
	fornecedor_nome_ou_empresa: string;
}

export default function InventoryControl() {
	const [activeTab, setActiveTab] = useState("list");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [currentObs, setCurrentObs] = useState("");
	const [message, setMessage] = useState("");
	const [userLevel, setUserLevel] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [suggestions, setSuggestions] = useState<Fornecedor[]>([]);
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [produtos, setProdutos] = useState<Produto[]>([]);
	const [errors, setErrors] = useState({
		type: false,
		status: false,
		price: false,
		supplier: false,
	});
	const [formData, setFormData] = useState({
		produto_id: 0,
		nome_produto: "",
		tipo: "",
		lote: 0,
		status: "",
		preco: 0.0,
		fornecedor: "",
		obs: "",
	});
	const [options, setOptions] = useState({
		tipos: [] as Tipo[],
		status: [] as Status[],
	});
	const [filters, setFilters] = useState({
		fnome_produto: "",
		ffornecedor: "",
		ftipo: "",
		fstatus: "",
	});
	const [deleteProduct, setDeleteProduct] = useState({
		produto_id: 0,
		dnome_produto: "",
		reason: "",
	});

	//Função para buscar os fornecedores cadastrados e fazer a listagem deles
	const fetchFornecedores = (query: string) => {
		axios
			.get(
				"http://localhost/BioVerde/back-end/produtos/listar_fornecedores.php",
				{
					params: { q: query },
				}
			)
			.then((res) => {
				console.log(res.data);
				setSuggestions(res.data);
			})
			.catch((err) => {
				console.error(err);
				setSuggestions([]);
			});
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
			setFormData({
				...formData,
				[name]: value,
			});
		}
		if (name in filters) {
			setFilters({ ...filters, [name]: value });
		}
		if (name in deleteProduct) {
			setDeleteProduct({ ...deleteProduct, [name]: value });
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
		setFormData({ ...formData, preco: parseFloat(value) });
		setErrors((errors) => ({ ...errors, price: false }));
	};

	//função para puxar os dados do produto que será editado
	const handleEditClick = (produto: Produto) => {
		console.log("Dados completos do produto:", produto);

		console.log("Dados do produto:", produto.staproduto_nome);

		// Encontra o tipo correspondente nas opções carregadas
		setFormData({
			produto_id: produto.produto_id ?? 0,
			nome_produto: produto.produto_nome,
			tipo:
				options.tipos
					.find((tipo) => tipo.tproduto_nome === produto.tproduto_nome)
					?.tproduto_id.toString() ?? "",
			status:
				options.status
					.find((status) => status.staproduto_nome === produto.staproduto_nome)
					?.staproduto_id.toString() ?? "",
			lote: produto.lote_id,
			preco: parseFloat(produto.produto_preco) ?? 0.0,
			fornecedor: produto.fornecedor_nome_ou_empresa ?? "",
			obs: produto.produto_observacoes,
		});

		setOpenEditModal(true);
	};

	//função para puxar o nome do produto que será excluido
	const handleDeleteClick = (produto: Produto) => {
		setDeleteProduct({
			produto_id: produto.produto_id,
			dnome_produto: produto.produto_nome,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	const fetchData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "products"]));

			const [productsAndOptions, userLevelResponse] = await Promise.all([
				axios.get(
				"http://localhost/BioVerde/back-end/produtos/listar_produtos.php",
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

			console.log("Resposta do back-end:", productsAndOptions.data);

			if (productsAndOptions.data.success) {
				setProdutos(productsAndOptions.data.produtos ?? []);
				setOptions({
					tipos: productsAndOptions.data.tp_produto ?? [],
					status: productsAndOptions.data.status_produto ?? [],
				});
			} else {
				setOpenNoticeModal(true);
				setMessage(
					productsAndOptions.data.message ?? "Erro ao carregar opções"
				);
			}

			if (userLevelResponse.data.success) {
				setUserLevel(userLevelResponse.data.userLevel)
			} else {
				setOpenNoticeModal(true);
				setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário");
			}
		} catch (error) {
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");

			if (axios.isAxiosError(error)) {
				console.error(
					"Erro na requisição:",
					error.response?.data ?? error.message
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
				["products", "options"].forEach((item) => newLoading.delete(item));
				return newLoading;
			});
		}
	};

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "products"]));

			const response = await axios.get(
				"http://localhost/BioVerde/back-end/produtos/listar_produtos.php",
				{ withCredentials: true }
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				setProdutos(response.data.produtos || []);
				return true;
			} else {
				setMessage(response.data.message || "Erro ao carregar produtos");
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
				newLoading.delete("products");
				return newLoading;
			});
		}
	};

	//Submit de cadastrar produtos
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const errors = {
			status: !formData.status,
			type: !formData.tipo,
			price: !formData.preco,
			supplier: !formData.fornecedor,
		};
		setErrors(errors);

		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) {
			return;
		}

		setLoading((prev) => new Set([...prev, "submit"]));
		setSuccessMsg(false);

		// Log formData for debugging
		console.log("Dados enviados no formData:", formData);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/cadastrar_produtos.php",
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
				setMessage("Produto cadastrado com sucesso!");
				clearFormData();
			} else {
				setMessage(response.data.message ?? "Erro ao cadastrar produto");
			}
		} catch (error) {
			let errorMessage = "Erro ao conectar com o servidor";

			if (axios.isAxiosError(error)) {
				if (error.response) {
					errorMessage = error.response.data.message ?? "Erro no servidor";
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

	// submit de Filtrar produtos
	const handleFilterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "filterSubmit"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/filtro.produto.php",
				filters,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				setProdutos(response.data.produtos);
			} else {
				setOpenNoticeModal(true);
				setMessage(
					response.data.message ?? "Nenhum produto encontrado com esse filtro"
				);
			}
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				setMessage(error.response.data.message ?? "Erro no servidor");
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

	useEffect(() => {
		fetchData();
		fetchFornecedores("");
	}, []);

	// submit para atualizar o produto após a edição dele
	const handleUpdateProduct = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const errors = {
			type: false,
			unit: false,
			status: false,
			price: !formData.preco,
			supplier: !formData.fornecedor,
		};
		setErrors(errors);

		if (errors.price) {
			return;
		}

		console.log("Dados sendo enviados:", formData);

		setLoading((prev) => new Set([...prev, "updateProduct"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/editar.produto.php",
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
				setMessage("Produto atualizado com sucesso!");
				clearFormData();
			} else {
				setMessage(response.data.message || "Erro ao atualizar produto.");
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
				newLoading.delete("updateProduct");
				return newLoading;
			});
		}
	};

	// submit para excluir um produto
	const handleDeleteProduct = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "deleteProduct"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/produtos/excluir.produto.php",
				deleteProduct,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Produto Excluído com sucesso!");
				setOpenConfirmModal(false);
			} else {
				setMessage(response.data.message || "Erro ao excluir produto.");
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
				newLoading.delete("deleteProduct");
				return newLoading;
			});
		}
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

	const handleObsClick = (produto: Produto) => {
		setCurrentObs(produto.produto_observacoes);
		setOpenObsModal(true);
	};

	return (
		<div className="flex-1 p-6 pl-[280px] font-[inter]">
			<h1 className="text-[40px] font-semibold text-center mb-3">
				Controle de Estoque
			</h1>

			<Tabs.Root
				defaultValue="list"
				className="h-screen w-full"
				onValueChange={(value) => setActiveTab(value)}
			>
				<Tabs.List className="flex gap-5 mb-6 border-b border-verdePigmento relative">
					<Tabs.Trigger
						value="list"
						className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
							activeTab === "list" ? "select animation-tab" : ""
						}`}
					>
						Lista de Estoque
					</Tabs.Trigger>

					<Tabs.Trigger
						value="register"
						className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
							activeTab === "register" ? "select animation-tab" : ""
						}`}
					>
						Adicionar Novo Produto
					</Tabs.Trigger>

					<Tabs.Trigger
						value="prices"
						className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
							activeTab === "prices" ? "select animation-tab" : ""
						}`}
					>
						Histórico de Preços
					</Tabs.Trigger>

					<Tabs.Trigger
						value="movements"
						className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
							activeTab === "movements" ? "select animation-tab" : ""
						}`}
					>
						Movimentações do Estoque
					</Tabs.Trigger>
				</Tabs.List>

				{/* Filtros */}
				<Tabs.Content value="list" className="h-full w-full">
					<Form.Root
						className="h-1/6 w-full flex"
						onSubmit={handleFilterSubmit}
					>
						<div className="w-4/5 flex items-center gap-8">
							<SmartField
								fieldName="fnome_produto"
								fieldText="Nome do Produto"
								type="text"
								placeholder="Nome do produto"
								value={filters.fnome_produto}
								onChange={handleChange}
								inputWidth="w-full"
							/>

							<SmartField
								fieldName="ffornecedor"
								fieldText="Fornecedor"
								type="text"
								placeholder="Nome do fornecedor"
								autoComplete="name"
								value={filters.ffornecedor}
								onChange={handleChange}
								inputWidth="w-full"
							/>

							<SmartField
								fieldName="ftipo"
								fieldText="Tipo"
								isSelect
								value={filters.ftipo}
								onChange={handleChange}
								isLoading={loading.has("products")}
								inputWidth="w-full"
							>
								<option>Todos</option>
								{options.tipos.map((tipo) => (
									<option key={tipo.tproduto_id} value={tipo.tproduto_id}>
										{tipo.tproduto_nome}
									</option>
								))}
							</SmartField>

							<SmartField
								fieldName="fstatus"
								fieldText="Status"
								isSelect
								value={filters.fstatus}
								onChange={handleChange}
								isLoading={loading.has("products")}
								inputWidth="w-full"
							>
								<option>Todos</option>
								{options.status.map((status) => (
									<option
										key={status.staproduto_id}
										value={status.staproduto_id}
									>
										{status.staproduto_nome}
									</option>
								))}
							</SmartField>
						</div>
						<Form.Submit className="w-1/5" asChild>
							<div className="flex items-center justify-end gap-6">
								<button
									type="submit"
									className="bg-verdeMedio hover:bg-verdeEscuro flex items-center justify-center px-5 py-3 gap-2 rounded-full cursor-pointer text-white"
									disabled={loading.size > 0}
								>
									{loading.has("filterSubmit") ? (
										<Loader2 className="animate-spin h-6 w-6" />
									) : (
										<>
											<Search size={23} />
											<span>Filtrar</span>
										</>
									)}
								</button>
								<button
									type="button"
									className="bg-gray-200 hover:bg-gray-300 flex items-center justify-center px-5 py-3 gap-2 rounded-full cursor-pointer"
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
									<FilterX size={23} />
									<span>Limpar</span>
								</button>
							</div>
						</Form.Submit>
					</Form.Root>
					<div className="h-5/6 w-full overflow-x-auto overflow-y-auto py-6">
						<table className="w-full border-collapse">
							{/* Tabela Cabeçalho */}
							<thead>
								<tr className="bg-verdePigmento text-white shadow-thead">
									{[
										"ID",
										"Nome Produto",
										"Tipo",
										"Preço",
										"Status",
										"Fornecedor",
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
								{loading.has("products") ? (
									<tr>
										<td colSpan={9} className="text-center py-4">
											<Loader2 className="animate-spin h-8 w-8 mx-auto" />
										</td>
									</tr>
								) : (
									//Tabela Dados
									produtos.map((produto, index) => (
										<tr
											key={produto.produto_id}
											className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
										>
											{Object.values(produto)
												.slice(0, 9)
												.map((value, index) => (
													<td
														key={value}
														className="border border-black p-4 text-center whitespace-nowrap"
													>
														{index === 6 ? (
															<button
																className="text-blue-600 cursor-pointer"
																onClick={() => handleObsClick(produto)}
																title="Ver observações"
															>
																<Eye />
															</button>
														) : (
															value
														)}
													</td>
												))
											}
											<td className="border border-black p-4 text-center whitespace-nowrap">
												<button
													className="text-black cursor-pointer"
													onClick={() => handleEditClick(produto)}
													title="Editar produto"
												>
													<PencilLine />
												</button>
												{userLevel === "Administrador" && (
													<button
														className="text-red-500 cursor-pointer ml-3"
														onClick={() => handleDeleteClick(produto)}
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
						<button
							type="button"
							className="bg-verdeGrama px-5 py-3 rounded-full text-white cursor-pointer flex ml-auto mt-5 gap-2 hover:bg-[#246127]"
							disabled={produtos.length === 0}
						>
							<Printer />
							Gerar Relatório
						</button>
					</div>

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

				{/* Cadastrar Produto */}
				<Tabs.Content
					value="register"
					className="flex items-center justify-center"
				>
					<Form.Root className="flex flex-col" onSubmit={handleSubmit}>
						<h2 className="text-3xl mb-8">Adicionar Novo Produto</h2>

						<div className="flex gap-x-15 mb-8">
							<SmartField
								fieldName="nome_produto"
								fieldText="Nome do Produto"
								fieldClassname="flex flex-col flex-2"
								required
								type="text"
								placeholder="Digite o nome do produto"
								value={formData.nome_produto}
								onChange={handleChange}
							/>

							<SmartField
								fieldName="fornecedor"
								fieldText="Fornecedor"
								fieldClassname="flex flex-col flex-1"
								isCreatableSelect
								placeholder="Selecione um fornecedor"
								isLoading={loading.has("products")}
								defaultValue={formData.fornecedor}
								options={suggestions.map((fornecedor: Fornecedor) => ({
									value: fornecedor.fornecedor_nome_ou_empresa,
									label: fornecedor.fornecedor_nome_ou_empresa,
								}))}
								onChange={(newValue: any) =>
									setFormData({
										...formData,
										fornecedor: newValue.value ?? "",
									})
								}
								/* onCreateOption={async (value: string) => {
									try {
										const response = await axios.post(
											"http://localhost/BioVerde/back-end/fornecedores/cadastrar_fornecedores.php",
											{
												cep: "32044-455",
												cidade: "Contagem",
												cpf_cnpj: "10.200.100/2000-30",
												email: "testes@email.com",
												endereco: "Rua A",
												estado: "MG",
												fornecedor_id: 0,
												num_endereco: "239",
												razao_social: value,
												responsavel: "Fernando",
												status: "1",
												tel: "(41) 00000-0000",
												tipo: "juridica",
											},
											{
												headers: { "Content-Type": "application/json" },
												withCredentials: true,
											}
										);

										console.log(response);
									} catch (err) {
										console.error(err);
									} finally {
										fetchFornecedores("");
										setFormData({ ...formData, fornecedor: "" });
									}
								}} */
							>
								{suggestions.map((fornecedor) => (
									<option
										key={fornecedor.fornecedor_id}
										value={fornecedor.fornecedor_nome_ou_empresa}
									>
										{fornecedor.fornecedor_nome_ou_empresa}
									</option>
								))}
							</SmartField>
						</div>

						<div className="flex gap-x-15 mb-8 items-center">
							<SmartField
								fieldName="tipo"
								fieldText="Tipo"
								isSelect
								value={formData.tipo}
								onChange={handleChange}
								isLoading={loading.has("products")}
								error={errors.type ? "*" : undefined}
								placeholderOption="Selecione o Tipo"
								inputWidth="w-[200px]"
							>
								{options.tipos.map((tipo) => (
									<option key={tipo.tproduto_id} value={tipo.tproduto_nome}>
										{tipo.tproduto_nome}
									</option>
								))}
							</SmartField>

							<SmartField
								fieldName="lote"
								fieldText="Lote"
								type="number"
								required
								placeholder="Nº do Lote"
								value={formData.lote}
								onChange={handleChange}
								inputWidth="w-[150px]"
							/>

							<SmartField
								fieldName="status"
								fieldText="Status"
								isSelect
								value={formData.status}
								error={errors.status ? "*" : undefined}
								onChange={handleChange}
								placeholderOption="Selecione o Status"
								inputWidth="w-[190px]"
							>
								{options.status.map((status) => (
									<option
										key={status.staproduto_id}
										value={status.staproduto_nome}
									>
										{status.staproduto_nome}
									</option>
								))}
							</SmartField>

							<SmartField
								isPrice
								fieldName="preco"
								fieldText="Preço"
								type="text"
								placeholder="Preço"
								error={errors.price ? "*" : undefined}
								value={formData.preco}
								onValueChange={handlePriceChange}
								inputWidth="w-[150px]"
							/>
						</div>

						<div className="flex mb-10 ">
							<SmartField
								isTextArea
								fieldName="obs"
								fieldText="Observações"
								fieldClassname="flex flex-col w-full"
								placeholder="Digite as observações do produto"
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
										"Adicionar Produto"
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

			{/* Modal de Edição */}
			<Modal
				openModal={openEditModal}
				setOpenModal={setOpenEditModal}
				modalTitle="Editar Produto:"
				leftButtonText="Editar"
				rightButtonText="Cancelar"
				loading={loading}
				isLoading={loading.has("updateProduct")}
				onCancel={() => {
					clearFormData();
					errors.price = false;
				}}
				onSubmit={handleUpdateProduct}
			>
				<div className="flex gap-x-15 mb-6">
					<SmartField
						fieldName="nome_produto"
						fieldText="Nome do Produto"
						fieldClassname="flex flex-col flex-1"
						required
						type="text"
						placeholder="Digite o nome do produto"
						value={formData.nome_produto}
						onChange={handleChange}
						inputWidth="w[340px]"
					/>

					<SmartField
						fieldName="fornecedor"
						fieldText="Fornecedor"
						fieldClassname="flex flex-col flex-1"
						isCreatableSelect
						placeholder="Selecione um fornecedor"
						isLoading={loading.has("products")}
						defaultValue={formData.fornecedor}
						options={suggestions.map((fornecedor: Fornecedor) => ({
							value: fornecedor.fornecedor_nome_ou_empresa,
							label: fornecedor.fornecedor_nome_ou_empresa,
						}))}
						onChange={(newValue: any) =>
							setFormData({
								...formData,
								fornecedor: newValue.value ?? "",
							})
						}
					>
						{suggestions.map((fornecedor) => (
							<option
								key={fornecedor.fornecedor_id}
								value={fornecedor.fornecedor_nome_ou_empresa}
							>
								{fornecedor.fornecedor_nome_ou_empresa}
							</option>
						))}
					</SmartField>
						
				</div>

				<div className="flex gap-x-15 mb-6 items-center">
					<SmartField
						fieldName="tipo"
						fieldText="Tipo"
						isSelect
						value={formData.tipo}
						onChange={handleChange}
						isLoading={loading.has("products")}
						inputWidth="w-[200px]"
					>
						{options.tipos?.map((tipo) => (
							<option key={tipo.tproduto_id} value={tipo.tproduto_id}>
								{tipo.tproduto_nome}
							</option>
						))}
					</SmartField>

					<SmartField
						fieldName="lote"
						fieldText="Lote"
						type="number"
						required
						placeholder="Nº do Lote"
						value={formData.lote}
						onChange={handleChange}
						inputWidth="w-[150px]"
					/>

					<SmartField
						fieldName="status"
						fieldText="Status"
						isSelect
						value={formData.status}
						onChange={handleChange}
						isLoading={loading.has("products")}
						inputWidth="w-[150px]"
					>
						{options.status?.map((status) => (
							<option key={status.staproduto_id} value={status.staproduto_id}>
								{status.staproduto_nome}
							</option>
						))}
					</SmartField>

					<SmartField
						isPrice
						fieldName="preco"
						fieldText="Preço"
						type="text"
						placeholder="Preço"
						error={errors.price ? "*" : undefined}
						value={formData.preco}
						onValueChange={handlePriceChange}
						inputWidth="w-[150px]"
					/>
				</div>

				<div className="flex mb-8 ">
					<SmartField
						isTextArea
						fieldName="obs"
						fieldText="Observações"
						fieldClassname="flex flex-col w-full"
						placeholder="Digite as observações do produto"
						value={formData.obs}
						onChange={handleChange}
						rows={2}
					/>
				</div>
			</Modal>

			<Modal
				openModal={openDeleteModal}
				setOpenModal={setOpenDeleteModal}
				modalTitle="Excluir Produto:"
				leftButtonText="Excluir"
				rightButtonText="Cancelar"
				onDelete={() => {
					setOpenConfirmModal(true);
					setOpenDeleteModal(false);
				}}
			>
				<div className="flex mb-10">
					<SmartField
						fieldName="dnome_empresa"
						fieldText="Nome do Produto"
						fieldClassname="flex flex-col w-full"
						type="text"
						autoComplete="name"
						required
						readOnly
						value={deleteProduct.dnome_produto}
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
						placeholder="Digite o motivo da exclusão do produto"
						value={deleteProduct.reason}
						onChange={handleChange}
					/>
				</div>
			</Modal>

			{/* Alert para confirmar exclusão do produto */}
			<ConfirmationModal
				openModal={openConfirmModal}
				setOpenModal={setOpenConfirmModal}
				confirmationModalTitle="Tem certeza que deseja excluir o produto?"
				confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
				onConfirm={handleDeleteProduct}
				loading={loading}
				isLoading={loading.has("deleteProduct")}
				confirmationLeftButtonText="Cancelar"
				confirmationRightButtonText="Sim, excluir produto"
			/>
		</div>
	);
}
