/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tabs, Form } from "radix-ui";
import { useState, useEffect } from "react";
import { Plus, PencilLine, Trash, Eye, Search, Loader2 } from "lucide-react";
import axios from "axios";

import {
	SmartField,
	ConfirmationModal,
	Modal,
	NoticeModal,
} from "../../shared";

type FormData = {
	produto_id: number;
	produto_nome: string;
	etor_id: number;
	ordem: number;
	nome_etapa: string;
	tempo: string;
	insumos: string;
	responsavel: string;
	obs: string;
};

type ProductsWithSteps = {
	produto_id: number;
	produto_nome: string;
	etapas: Etapa[];
};

type Etapa = Omit<FormData, "produto_nome" | "produto_id"> & {
	etor_id: number;
	dtCadastro?: string;
};

export default function ProductionSteps() {
	const [activeTab, setActiveTab] = useState("list");
	const [showStepForm, setShowStepForm] = useState<boolean>(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	const [keepProduct, setKeepProduct] = useState(false);
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [search, setSearch] = useState("");
	const [currentObs, setCurrentObs] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [productsWithSteps, setProductsWithSteps] = useState<
		ProductsWithSteps[]
	>([]);
	const [selectedProduct, setSelectedProduct] =
		useState<ProductsWithSteps | null>(null);
	const [formData, setFormData] = useState<FormData>({
		produto_id: 0,
		produto_nome: "",
		etor_id: 0,
		ordem: 0,
		nome_etapa: "",
		tempo: "",
		insumos: "",
		responsavel: "",
		obs: "",
	});
	const [stepData, setStepData] = useState<Etapa[]>([]);
	const [deleteStep, setDeleteStep] = useState({
		etor_id: 0,
		dproduct: "",
		dstep: "",
		reason: "",
	});

	// Carrega os produtos e suas etapas cadastradas
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading((prev) => new Set([...prev, "steps", "options"]));

				const [stepsResponse, userLevelResponse] = await Promise.all([
					axios.get(
					"http://localhost/BioVerde/back-end/etapas/listar_etapas.php",
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

				console.log("Resposta do back-end:", stepsResponse.data);

				if (stepsResponse.data.success) {
					const formattedData = stepsResponse.data.etapas.map((item: any) => ({
						produto_nome: item.produto_nome,
						etapas: item.etapas,
					}));
					setProductsWithSteps(formattedData);
				} else {
					setOpenNoticeModal(true);
					setMessage(stepsResponse.data.message || "Erro ao carregar etapas");
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
					newLoading.delete("steps");
					return newLoading;
				});
			}
		};

		fetchData();
	}, []);

	// Verifica se existe pelo menos um produto e seleciona o primeiro por padrão
	useEffect(() => {
		if (productsWithSteps.length > 0) {
			setSelectedProduct(productsWithSteps[0]);
		}
	}, [productsWithSteps]);

	//Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "steps"]));

			const response = await axios.get(
				"http://localhost/BioVerde/back-end/etapas/listar_etapas.php",
				{ withCredentials: true }
			);

			if (response.data.success) {
				setProductsWithSteps(response.data.etapas || []);
				return true;
			} else {
				setMessage(response.data.message || "Erro ao carregar etapas");
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
				newLoading.delete("steps");
				return newLoading;
			});
		}
	};

	//OnChange dos campos
	const handleChange = (
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = event.target;

		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in deleteStep) {
			setDeleteStep({ ...deleteStep, [name]: value });
		}
	};

	//função para puxar os dados da etapa que será editada
	const handleEditClick = (
		etapa: Etapa,
		nome_produto: string,
		produto_id: number
	) => {
		console.log("Dados completos da etapa:", etapa);

		setFormData({
			produto_id: produto_id,
			produto_nome: nome_produto,
			etor_id: etapa.etor_id,
			ordem: etapa.ordem,
			nome_etapa: etapa.nome_etapa,
			tempo: etapa.tempo,
			insumos: etapa.insumos,
			responsavel: etapa.responsavel,
			obs: etapa.obs,
		});
		setOpenEditModal(true);
	};

	//função para puxar o nome da etapa que será excluida
	const handleDeleteClick = (etapa: Etapa, nome_produto: string) => {
		setDeleteStep({
			etor_id: etapa.etor_id,
			dproduct: nome_produto,
			dstep: etapa.nome_etapa,
			reason: "",
		});
		setOpenDeleteModal(true);
	};

	//Função de define qual será o submir que será enviado
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const submitEvent = e.nativeEvent as SubmitEvent;
		const buttonClicked = (submitEvent.submitter as HTMLButtonElement).name;

		if (buttonClicked === "saveStep") {
			handleSaveStep(e); //Submit de salvar uma etapa
		} else if (buttonClicked === "submitForm") {
			handleStepsSubmit(e); //Submit de cadastrar a etapa de produção completa
		}
	};

	//Função para cadastrar uma etapa de um produto
	const handleSaveStep = (e: React.FormEvent) => {
		e.preventDefault();

		const { produto_id, produto_nome, ...stepFields } = formData;

		const newStep = {
			...stepFields,
			etor_id: stepData.length,
			ordem: stepData.length + 1,
		};

		setStepData([...stepData, newStep]);
		clearFormData(keepProduct);
		setShowStepForm(false);
	};

	//Submit de cadastrar a etapa de produção completa
	const handleStepsSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "submit"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/cadastrar_etapas.php",
				{
					produto_id: formData.produto_id,
					produto_nome: formData.produto_nome,
					etapas: stepData,
				},
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Etapa cadastrada com sucesso!");
				clearFormData(keepProduct);
				setStepData([]);
			} else {
				setMessage(response.data.message || "Erro ao cadastrar etapa");
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

	//submit para atualizar a etapa após a edição dela
	const handleUpdateStep = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "updateStep"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/editar.etapa.php",
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
				setMessage("Etapa atualizada com sucesso!");
				clearFormData(keepProduct);
			} else {
				setMessage(response.data.message || "Erro ao atualizar etapa.");
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
				newLoading.delete("updateStep");
				return newLoading;
			});
		}
	};

	//submit para excluir um etapa
	const handleDeleteStep = async (e: React.FormEvent) => {
		e.preventDefault();

		setLoading((prev) => new Set([...prev, "deleteStep"]));
		setSuccessMsg(false);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/excluir.etapas.php",
				deleteStep,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				await refreshData();
				setOpenConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Etapa excluída com sucesso!");
			} else {
				setMessage(response.data.message || "Erro ao excluir etapa.");
			}
		} catch (error) {
			let errorMessage = "Erro ao conectar com o servidor";
			if (axios.isAxiosError(error)) {
				errorMessage = error.response?.data?.message || "Erro no servidor";
				console.error("Erro na resposta:", error.response?.data);
			} else {
				console.error("Erro na requisição:", error);
			}
			setMessage(errorMessage);
		} finally {
			setOpenNoticeModal(true);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("deleteStep");
				return newLoading;
			});
		}
	};

	//Limpar FormData]
	const clearFormData = (keepProduct: boolean) => {
		if (keepProduct) {
			setFormData({
				produto_id: formData.produto_id,
				produto_nome: formData.produto_nome,
				etor_id: 0,
				ordem: 0,
				nome_etapa: "",
				tempo: "",
				insumos: "",
				responsavel: "",
				obs: "",
			});
		} else {
			setFormData(
				(prev) =>
					Object.fromEntries(
						Object.entries(prev).map(([key, value]) => [
							key,
							typeof value === "number" ? 0 : "",
						])
					) as typeof prev
			);
		}
	};

	//Scrolla a pagina para baixo quando clicar em "Adicionar Etapa"
	const handleOpenChange = (open: boolean) => {
		if (open) {
			window.scrollTo({
				top: 340,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="flex-1 p-6 pl-[280px]">
			<div className="px-6 font-[inter] bg-brancoSal">
				<h1 className=" text-[40px] font-semibold text-center mb-3">
					Etapas de Produção
				</h1>

				<Tabs.Root
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full"
				>
					<Tabs.List className="flex gap-5 border-b border-verdePigmento relative mb-7">
						<Tabs.Trigger
							value="list"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "list" ? "select animation-tab" : ""
							}`}
							onClick={() => setActiveTab("list")}
						>
							Lista de Etapas de Produção
						</Tabs.Trigger>

						<Tabs.Trigger
							value="register"
							className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
								activeTab === "register" ? "select animation-tab" : ""
							}`}
							onClick={() => setActiveTab("register")}
						>
							Cadastrar Etapa de Produção
						</Tabs.Trigger>
					</Tabs.List>

					{/* Listar Etapas */}
					<Tabs.Content value="list" className="flex flex-col w-full">
						<div className="flex items-center justify-start">
							<div className="flex gap-10 max-h-[500px] h-[68vh]">
								{/* SideBar Estrutura de produtos */}
								<div className=" bg-gray-200 rounded-xl max-w-[350px] sombra flex flex-col h-full">
									<div className="bg-green-800 p-4 rounded-t-xl">
										<h2 className="text-white text-center text-lg font-semibold">
											Etapas de Produção
										</h2>
										<div className="flex items-center gap-2 relative">
											<Search className="text-black w-5 h-5 absolute right-2 bottom-2.5" />
											<input
												type="text"
												name="searchProduct"
												id="searchProduct"
												placeholder="Buscar Produto"
												value={search}
												onChange={(e) => setSearch(e.target.value)}
												className="bg-white text-black w-full pr-9 border border-separator rounded-lg text-base mt-3 p-1.5 shadow-xl"
											/>
										</div>
									</div>
									<div className="flex-1 overflow-y-auto custom-scrollbar-products">
										{loading.has("steps") ? (
											<div className="flex justify-center items-center h-full">
												<Loader2 className="animate-spin h-8 w-8 mx-auto" />
											</div>
										) : productsWithSteps.length === 0 ? (
											<div className="flex justify-center items-center h-full">
												<p className="text-center text-gray-700">
													Nenhum Produto Cadastrado
												</p>
											</div>
										) : (
											<ul className="flex flex-col gap-2 m-4">
												{productsWithSteps
													.filter((produto) =>
														produto.produto_nome
															.toLowerCase()
															.includes(search.toLowerCase())
													)
													.map((produto, index) => (
														<li
															key={index}
															className={`break-words px-4 py-2 text-black font-medium cursor-pointer hover:bg-gray-300 rounded-lg ${
																selectedProduct?.produto_nome ===
																produto.produto_nome
																	? "bg-gray-300"
																	: ""
															}`}
															onClick={() => setSelectedProduct(produto)}
														>
															{produto.produto_nome}
														</li>
													))}
											</ul>
										)}
									</div>
								</div>

								{/* Tabela de Etapas */}
								<div className="max-w-[50vw]">
									{loading.has("steps") ? (
										<div className="flex justify-center items-center h-full w-[50vw]">
											<Loader2 className="animate-spin h-8 w-8 mx-auto" />
										</div>
									) : selectedProduct ? (
										<>
											<h2 className="text-2xl mb-4">
												<strong>Produto Final:</strong>{" "}
												{selectedProduct.produto_nome}
											</h2>
											<div className="max-h-[62vh] overflow-x-auto overflow-y-auto">
												<table className="w-full border-collapse">
													{/* Tabela Cabeçalho */}
													<thead>
														<tr className="bg-verdePigmento text-white shadow-thead">
															{[
																"Ordem",
																"Nome da Etapa",
																"Tempo Estimado",
																"Insumos Utilizados",
																"Responsável",
																"Data de Cadastro",
																"Observações",
																"Ações",
															].map((header) => (
																<th
																	key={header}
																	className="border border-black p-4 whitespace-nowrap"
																>
																	{header}
																</th>
															))}
														</tr>
													</thead>
													<tbody>
														{/* Tabela Dados */}
														{selectedProduct.etapas.map((etapa) => (
															<tr key={etapa.ordem}>
																{" "}
																{/* Faltava a tag <tr> de abertura */}
																<td className="border border-black p-4 whitespace-nowrap">
																	{etapa.ordem}
																</td>
																<td className="border border-black p-4 whitespace-nowrap">
																	{etapa.nome_etapa}
																</td>
																<td className="border border-black p-4 whitespace-nowrap">
																	{etapa.tempo}
																</td>
																<td className="border border-black p-4 whitespace-nowrap">
																	{etapa.insumos}
																</td>
																<td className="border border-black p-4 whitespace-nowrap">
																	{etapa.responsavel}
																</td>
																<td className="border border-black p-4 text-center whitespace-nowrap">
																	{etapa.dtCadastro
																		? new Date(
																				etapa.dtCadastro
																		  ).toLocaleDateString()
																		: "N/A"}
																</td>
																<td className="border border-black p-4 text-center">
																	<button
																		type="button"
																		className="text-blue-600 cursor-pointer"
																		title="Ver observações"
																		onClick={() => {
																			setCurrentObs(etapa.obs);
																			setOpenObsModal(true);
																		}}
																	>
																		<Eye />
																	</button>
																</td>
																<td className="border border-black p-4 text-center whitespace-nowrap">
																	<button
																		className="text-black cursor-pointer"
																		title="Editar produto"
																		onClick={() => {
																			handleEditClick(
																				etapa,
																				selectedProduct.produto_nome,
																				selectedProduct.produto_id
																			);
																			setKeepProduct(false);
																		}}
																	>
																		<PencilLine />
																	</button>
																	{userLevel === "Administrador" && (
																		<button
																			className="text-red-500 cursor-pointer ml-3"
																			title="Excluir produto"
																			onClick={() =>
																				handleDeleteClick(
																					etapa,
																					selectedProduct.produto_nome
																				)
																			}
																		>
																			<Trash />
																		</button>
																	)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</>
									) : (
										<p className="text-gray-600 flex justify-center items-center h-full text-lg w-[680px]">
											Selecione um produto na lista para ver suas etapas
										</p>
									)}
								</div>
							</div>
						</div>
					</Tabs.Content>

					{/* Cadastro de etapa */}
					<Tabs.Content
						value="register"
						className="flex items-center justify-center"
					>
						<div className="flex items-center justify-center">
							<Form.Root
								className="flex flex-col mb-10"
								onSubmit={handleSubmit}
							>
								<h2 className="text-3xl mb-8">Cadastrar Etapa de Produção</h2>
								<div className="flex mb-8">
									<SmartField
										fieldName="produto_nome"
										fieldText="Produto Final"
										type="text"
										required
										placeholder="Nome do Produto final a ser produzido"
										value={formData.produto_nome}
										onChange={handleChange}
										inputWidth="w-[500px]"
									/>
								</div>
								<div>
									{/* Tabela de Etapas */}
									<div>
										<h3 className="text-xl font-semibold mb-5">
											Etapas de produção:
										</h3>
										{stepData.length !== 0 && (
											<div className="max-w-[60vw] overflow-x-auto overflow-y-auto mb-10">
												<table className="w-full border-collapse">
													{/* Tabela Cabeçalho */}
													<thead>
														<tr className="bg-verdePigmento text-white shadow-thead">
															{[
																"Ordem",
																"Nome da Etapa",
																"Tempo Estimado",
																"Insumos Utilizados",
																"Responsável",
																"Observações",
																// "Ações",
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
														{/* Tabela Dados */}
														{stepData.map((step) => (
															<tr key={step.ordem}>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	{step.ordem}
																</td>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	{step.nome_etapa}
																</td>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	{step.tempo}
																</td>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	{step.insumos}
																</td>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	{step.responsavel}
																</td>
																<td className="border border-black px-4 py-4 whitespace-nowrap">
																	<button
																		type="button"
																		className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
																		onClick={() => {
																			setCurrentObs(step.obs);
																			setOpenObsModal(true);
																		}}
																	>
																		<Eye />
																		<div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
																			Ver
																		</div>
																	</button>
																</td>
																{/* <td className="border border-black px-4 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  className="mr-4 text-black cursor-pointer relative group"
                                  onClick={() => {handleEditClick(step, formData.produto_nome); setKeepProduct(true)}}
                                >
                                  <PencilLine />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Editar
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  className="text-red-500 cursor-pointer relative group"
                                  onClick={() => handleDeleteClick(step, formData.produto_nome)}
                                >
                                  <Trash />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Excluir
                                  </div>
                                </button>
                              </td> */}
															</tr>
														))}
													</tbody>
												</table>
											</div>
										)}
									</div>
									{showStepForm ? (
										<div className="bg-gray-100 w-[816px] p-5 rounded-md shadow-xl mb-10">
											<div className="flex gap-10 mb-8">
												<SmartField
													fieldName="nome_etapa"
													fieldText="Nome da Etapa"
													fieldClassname="flex flex-col w-full"
													type="text"
													required
													placeholder="Digite o Nome da Etapa"
													value={formData.nome_etapa}
													onChange={handleChange}
												/>
											</div>

											<div className="flex gap-10 mb-8">
												<SmartField
													fieldName="responsavel"
													fieldText="Responsável"
													fieldClassname="flex flex-col w-full"
													type="text"
													required
													placeholder="Digite o Nome do Responsável"
													value={formData.responsavel}
													onChange={handleChange}
												/>

												<SmartField
													fieldName="tempo"
													fieldText="Tempo Estimado"
													type="text"
													required
													placeholder="Tempo Estimado da etapa"
													value={formData.tempo}
													onChange={handleChange}
													inputWidth="w-[250px]"
												/>
											</div>

											<div className="flex mb-8">
												<SmartField
													fieldName="insumos"
													fieldText="Insumos Utilizados"
													fieldClassname="flex flex-col w-full"
													type="text"
													required
													placeholder="Insumos Utilizados na etapa"
													value={formData.insumos}
													onChange={handleChange}
												/>
											</div>

											<div className="flex mb-8">
												<SmartField
													isTextArea
													fieldName="obs"
													fieldText="Observações"
													fieldClassname="flex flex-col w-full"
													placeholder="Digite as observações da Etapa"
													value={formData.obs}
													onChange={handleChange}
													rows={2}
												/>
											</div>

											<div className="flex justify-center items-center gap-5">
												<Form.Submit asChild>
													<button
														type="submit"
														name="saveStep"
														className="bg-verdeMedio p-3 px-7 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
													>
														Salvar
													</button>
												</Form.Submit>

												<button
													type="button"
													onClick={() => setShowStepForm(false)}
													className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400"
												>
													Cancelar
												</button>
											</div>
										</div>
									) : (
										<div>
											<div className="flex justify-between items-center gap-5 ">
												<button
													type="button"
													onClick={() => {
														setShowStepForm(true);
														setKeepProduct(true);
														setTimeout(() => handleOpenChange(true), 100);
													}}
													className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
												>
													<Plus /> Adicionar Etapa
												</button>
											</div>
											{stepData.length !== 0 && (
												<Form.Submit asChild>
													<div className="flex place-content-center mt-10 ">
														<button
															type="submit"
															name="submitForm"
															className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra w-[278.72px]  hover:bg-verdeGrama flex place-content-center"
															onClick={() => setKeepProduct(false)}
														>
															{loading.has("submit") ? (
																<Loader2 className="animate-spin h-6 w-6" />
															) : (
																"Cadastrar Etapas de Produção"
															)}
														</button>
													</div>
												</Form.Submit>
											)}
										</div>
									)}
								</div>
							</Form.Root>
						</div>
					</Tabs.Content>
				</Tabs.Root>

				{/* Modal de Avisos */}
				<NoticeModal
					openModal={openNoticeModal}
					setOpenModal={setOpenNoticeModal}
					successMsg={successMsg}
					message={message}
				/>

				{/* Modal de Observações */}
				<Modal
					withExitButton
					isObsModal
					openModal={openObsModal}
					setOpenModal={setOpenObsModal}
					modalWidth="min-w-[300px] max-w-[500px]"
					modalTitle="Observações"
					obsText={currentObs}
				/>

				{/* Modal de Edição */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Etapa:"
					rightButtonText="Editar"
					leftButtonText="Cancelar"
					isLoading={loading.has("updateStep")}
					onCancel={() => clearFormData(keepProduct)}
					onSubmit={handleUpdateStep}
				>
					<div className="flex gap-10 mb-6 justify-between w-2xl">
						<SmartField
							fieldName="nome_etapa"
							fieldText="Nome da Etapa"
							fieldClassname="flex flex-col flex-1"
							type="text"
							required
							placeholder="Digite o Nome da Etapa"
							value={formData.nome_etapa}
							onChange={handleChange}
						/>
					</div>

					<div className="flex gap-10 mb-6 justify-between">
						<SmartField
							fieldName="responsavel"
							fieldText="Responsável"
							fieldClassname="flex flex-col flex-1"
							type="text"
							required
							placeholder="Digite o Nome do Responsável"
							value={formData.responsavel}
							onChange={handleChange}
						/>

						<SmartField
							fieldName="tempo"
							fieldText="Tempo Estimado"
							fieldClassname="flex flex-col flex-1"
							type="text"
							required
							placeholder="Tempo Estimado da etapa"
							value={formData.tempo}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-6">
						<SmartField
							fieldName="insumos"
							fieldText="Insumos Utilizados"
							fieldClassname="flex flex-col w-full"
							type="text"
							required
							placeholder="Insumos Utilizados na etapa"
							value={formData.insumos}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-8">
						<SmartField
							isTextArea
							fieldName="obs"
							fieldText="Observações"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite as observações da Etapa"
							value={formData.obs}
							onChange={handleChange}
							rows={2}
						/>
					</div>
				</Modal>

				{/* Modal de Exclusão */}
				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Etapa:"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<div className="flex mb-8">
						<SmartField
							fieldName="dproduct"
							fieldText="Produto Final"
							fieldClassname="flex flex-col w-full"
							type="text"
							readOnly
							value={deleteStep.dproduct}
							onChange={handleChange}
						/>
					</div>

					<div className="flex mb-8">
						<SmartField
							fieldName="dstep"
							fieldText="Nome da Etapa"
							fieldClassname="flex flex-col w-full"
							type="text"
							readOnly
							value={deleteStep.dstep}
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
							placeholder="Digite o motivo da exclusão da etapa"
							value={deleteStep.reason}
							onChange={handleChange}
						/>
					</div>
				</Modal>

				{/* Alert para confirmar exclusão da etapa */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir a etapa?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={handleDeleteStep}
					isLoading={loading.has("deleteStep")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir etapa"
				/>
			</div>
		</div>
	);
}
