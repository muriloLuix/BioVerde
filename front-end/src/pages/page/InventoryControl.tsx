import { useState, useEffect } from "react";

import axios from "axios";
import { OnChangeValue } from "react-select";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { Tabs, Form } from "radix-ui";
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
	Option,
	Product,
	ProductType,
	ProductStatus,
	Supplier,
} from "../../utils/types";
import {
	SmartField,
	Modal,
	NoticeModal,
	ConfirmationModal,
} from "../../shared";

interface ProductOptions {
	tipos: ProductType[];
	status: ProductStatus[];
}

export default function InventoryControl() {
	const [activeTab, setActiveTab] = useState("list");
	const [openEditModal, setOpenEditModal] = useState(false);
	const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [currentObs, setCurrentObs] = useState("");
	const [message, setMessage] = useState("");
	const [userLevel, setUserLevel] = useState("");
	const [successMsg, setSuccessMsg] = useState(false);
	const [suggestions, setSuggestions] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [produtos, setProdutos] = useState<Product[]>([]);
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
	const [options, setOptions] = useState<ProductOptions>();
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

	const gerarRelatorio = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));

		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/control.rel.php",
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

	//Capturar valor no campo de Preço
	const handlePriceChange = ({ value }: { value: string }) => {
		setFormData({ ...formData, preco: parseFloat(value) });
		setErrors((errors) => ({ ...errors, price: false }));
	};

	//função para puxar os dados do produto que será editado
	const handleEditClick = (produto: Product) => {
		console.log("Dados completos do produto:", produto);

		// Encontra o tipo correspondente nas opções carregadas
		setFormData({
			produto_id: produto.produto_id ?? 0,
			nome_produto: produto.produto_nome,
			tipo:
				options?.tipos
					.find((tipo) => tipo.tproduto_nome === produto.tproduto_nome)
					?.tproduto_id.toString() ?? "",
			status:
				options?.status
					.find((status) => status.staproduto_nome === produto.staproduto_nome)
					?.staproduto_id.toString() ?? "",
			lote: produto.lote_id,
			preco: parseFloat(produto.produto_preco) ?? 0.0,
			fornecedor: produto.fornecedor_nome_ou_empresa,
			obs: produto.produto_observacoes,
		});

		setOpenEditModal(true);
	};

	//função para puxar o nome do produto que será excluido
	const handleDeleteClick = (produto: Product) => {
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
					Object.entries(prev).map(([key, value]) => {
						return [key, typeof value === "number" ? 0 : ""];
					})
				) as typeof prev
		);
	};

	const handleObsClick = (produto: Product) => {
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
						<div className="w-4/5 flex items-center gap-4">
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
								isSelect
								isClearable
								fieldName="ftipo"
								fieldText="Tipo"
								placeholder="Selecione tipo"
								isLoading={loading.has("products")}
								value={
									options?.tipos
										.map((tipo) => ({
											value: tipo.tproduto_id,
											label: tipo.tproduto_nome,
										}))
										.find((opt) => opt.value.toString() === filters.ftipo) ||
									null
								}
								onChange={(option: OnChangeValue<Option, false>) => {
									setFilters({
										...filters,
										ftipo: option?.value.toString() ?? "",
									});
								}}
								options={options?.tipos.map((tipo) => ({
									value: tipo.tproduto_id,
									label: tipo.tproduto_nome,
								}))}
							/>

							<SmartField
								isSelect
								isClearable
								fieldName="status"
								fieldText="Status"
								placeholder="Selecione status"
								isLoading={loading.has("products")}
								value={
									options?.status
										.map((stt: ProductStatus) => ({
											value: stt.staproduto_nome,
											label: stt.staproduto_nome,
										}))
										.find(
											(option: OnChangeValue<Option, false>) =>
												option?.value === filters.fstatus
										) || null
								}
								options={options?.status.map((stt: ProductStatus) => ({
									value: stt.staproduto_nome,
									label: stt.staproduto_nome,
								}))}
								onChange={(option: OnChangeValue<Option, false>) => {
									setFilters({
										...filters,
										fstatus: option?.value.toString() ?? "",
									});
								}}
							/>
						</div>
						<Form.Submit asChild>
							<div className="w-1/5 flex items-center justify-end gap-2">
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
										"Fornecedor",
										"Status",
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
												))}
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
							onClick={gerarRelatorio}
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
								isCreatableSelect
								fieldName="fornecedor"
								fieldText="Fornecedor"
								fieldClassname="flex flex-col flex-1"
								inputWidth="min-w-3xs"
								placeholder="Selecione um fornecedor"
								isLoading={loading.has("products")}
								value={suggestions
									.map((fornecedor: Supplier) => ({
										value: fornecedor.fornecedor_nome_ou_empresa,
										label: fornecedor.fornecedor_nome_ou_empresa,
									}))
									.find((opt) => opt.value === formData.fornecedor)}
								options={suggestions.map((fornecedor: Supplier) => ({
									value: fornecedor.fornecedor_nome_ou_empresa,
									label: fornecedor.fornecedor_nome_ou_empresa,
								}))}
								onChange={(option: OnChangeValue<Option, false>) => {
									setFormData({
										...formData,
										fornecedor: option?.value.toString() ?? "",
									});
								}}
							/>
						</div>

						<div className="flex gap-x-15 mb-8 items-center">
							<SmartField
								isSelect
								isClearable
								fieldName="tipo"
								fieldText="Tipo"
								fieldClassname="flex flex-col flex-2"
								placeholder="Selecione um tipo"
								isLoading={loading.has("products")}
								value={options?.tipos
									.map((tipo: ProductType) => ({
										value: tipo.tproduto_nome,
										label: tipo.tproduto_nome,
									}))
									.find(
										(option: OnChangeValue<Option, false>) =>
											option?.value === formData.tipo
									)}
								options={options?.tipos.map((tipo: ProductType) => ({
									value: tipo.tproduto_nome,
									label: tipo.tproduto_nome,
								}))}
								onChange={(option: OnChangeValue<Option, false>) => {
									setFormData({
										...formData,
										tipo: option?.value.toString() ?? "",
									});
								}}
							/>

							<SmartField
								fieldName="lote"
								fieldText="Lote"
								fieldClassname="flex flex-col flex-1"
								type="number"
								required
								placeholder="Nº do Lote"
								value={formData.lote}
								onChange={handleChange}
								inputWidth="w-[150px]"
							/>

							<SmartField
								isSelect
								isClearable
								fieldName="status"
								fieldText="Status"
								placeholder="Selecione um status"
								isLoading={loading.has("products")}
								value={options?.status
									.map((stt: ProductStatus) => ({
										value: stt.staproduto_nome,
										label: stt.staproduto_nome,
									}))
									.find(
										(option: OnChangeValue<Option, false>) =>
											option?.value === formData.status
									)}
								options={options?.status.map((stt: ProductStatus) => ({
									value: stt.staproduto_nome,
									label: stt.staproduto_nome,
								}))}
								onChange={(option: OnChangeValue<Option, false>) => {
									setFormData({
										...formData,
										status: option?.value.toString() ?? "",
									});
								}}
							/>

							<SmartField
								isPrice
								fieldName="preco"
								fieldText="Preço"
								fieldClassname="flex flex-col flex-1"
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
						options={suggestions.map((fornecedor: Supplier) => ({
							value: fornecedor.fornecedor_nome_ou_empresa,
							label: fornecedor.fornecedor_nome_ou_empresa,
						}))}
						onChange={(newValue: any) =>
							setFormData({
								...formData,
								fornecedor: newValue?.value || "",
							})
						}
					/>
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
						{options?.tipos?.map((tipo) => (
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
						{options?.status?.map((status) => (
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
