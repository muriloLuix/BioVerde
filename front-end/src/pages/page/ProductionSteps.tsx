import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tabs } from "radix-ui";
import { Plus, PencilLine, Trash, Search, Loader2, Pencil, Trash2} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { SmartField, Modal, NoticeModal, ConfirmationModal } from "../../shared";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../utils/checkAuth";
// import { BatchRegister, BatchUpdate, BatchDelete } from "../pageComponents";
import { SelectEvent, FormDataSteps, ProductsWithSteps, Steps, StepOptions } from "../../utils/types";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function ProductionSteps() {
	const [activeTab, setActiveTab] = useState("list");
	// const [showStepForm, setShowStepForm] = useState<boolean>(false);
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openNewProductModal, setOpenNewProductModal] = useState(false);
	// const [keepProduct, setKeepProduct] = useState(false);
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [options, setOptions] = useState<StepOptions>();
	const [productsWithSteps, setProductsWithSteps] = useState<ProductsWithSteps[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<ProductsWithSteps | null>(null);
	const [newProduct, setNewProduct] = useState({ produto: "" });
	const [errors, setErrors] = useState({
        product: false,
    });
	const [formData, setFormData] = useState<FormDataSteps>({
		etor_id: 0,
		etor_ordem: 0,
		etor_etapa_nome: "",
		etor_tempo: "",
		etor_insumos: "",
		etor_observacoes: "",
	});
	const [deleteStep, setDeleteStep] = useState({
		etor_id: 0,
		dproduct: "",
		dstep: "",
		reason: "",
	});

	/* ----- useEffects e Requisições via Axios ----- */

    //Checa a autenticação do usuário, se for false expulsa o usuário da sessão
    const navigate = useNavigate();
    useEffect(() => {
        checkAuth({ navigate, setMessage, setOpenNoticeModal });
    }, [navigate]);

    //Carrega a lista os lotes e as opções nos selects ao renderizar a página
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading((prev) => new Set([...prev, "steps"]));
                const [stepsResponse, userLevelResponse] = await Promise.all([
                    axios.get(
                        "http://localhost/BioVerde/back-end/etapas/listar_etapas.php",
                        { withCredentials: true, headers: { Accept: "application/json" }}
                    ),
                    axios.get(
                        "http://localhost/BioVerde/back-end/auth/usuario_logado.php",
                        { withCredentials: true, headers: { "Content-Type": "application/json" }}
                    ),
                ]);
                await fetchOptions();
                if (userLevelResponse.data.success) {
                    setUserLevel(userLevelResponse.data.userLevel);
                } else {
                    setOpenNoticeModal(true);
                    setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário" );
                }
                if (stepsResponse.data.success) {
                    const formattedData = stepsResponse.data.etapas.map((item: ProductsWithSteps) => ({
						produto_id: item.produto_id,	
						produto_nome: item.produto_nome,
						etapas: item.etapas,
					}));
					setProductsWithSteps(formattedData);
                } else {
                    setOpenNoticeModal(true);
                    setMessage(stepsResponse.data.message || "Erro ao carregar lotes" );
                }
            } catch (error) {
                console.error(error);
                setOpenNoticeModal(true);
                setMessage("Erro ao conectar com o servidor");
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

	useEffect(() => {
		if (selectedProduct) {
			setRowData(selectedProduct.etapas);
		} else {
			setRowData([]);
		}
	}, [selectedProduct]);

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
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao carregar etapas");
				setOpenNoticeModal(true);
			}
		} catch (error) {
			setSuccessMsg(false);
			console.error(error);
			setOpenNoticeModal(true);
			setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("steps");
				return newLoading;
			});
		}
	};

    // Função que busca as opções
    const fetchOptions = async () => {
        try {
            setLoading((prev) => new Set([...prev, "options"]));
            const response = await axios.get(
                "http://localhost/BioVerde/back-end/etapas/listar_opcoes.php",
                { withCredentials: true, headers: { Accept: "application/json", "Content-Type": "application/json" }}
            );
            if (response.data.success) {
                setOptions({
                    produtos: response.data.produtos,
                });
            } else {
				setSuccessMsg(false);
                setOpenNoticeModal(true);
                setMessage(response.data.message || "Erro ao carregar opções");
            }
        } catch (error) {
            setSuccessMsg(false);
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

	/* ----- Função para Cadastro de Produtos ----- */

	//Submit de cadastrar a etapa de produção completa
	const handleProductSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = { product: !newProduct.produto };
		setErrors(errors);
		if (Object.values(errors).some((error) => error)) { return; }

		setLoading((prev) => new Set([...prev, "registerProduct"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/cadastrar_produto.php",
				{ produto_id: newProduct.produto },
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Produto cadastrado com sucesso!");
				setOpenNewProductModal(false);
				setNewProduct({ produto: "" });
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar Produto");
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
				newLoading.delete("registerProduct");
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
            | React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement> 
            | SelectEvent
    ) => {
        const { name, value } = event.target;
		if (name in newProduct) { setNewProduct({ ...newProduct, [name]: value }) }
        if (name in formData) { setFormData({ ...formData, [name]: value }) }
        // if (name in deleteBatch) { setDeleteBatch({ ...deleteBatch, [name]: value }) }
        setErrors((prevErrors) =>
            Object.fromEntries(
                Object.keys(prevErrors).map((key) => [key, false])
            ) as typeof prevErrors
		);
    };

    //Limpar FormData
	const clearFormData = () => {
        setFormData(
            Object.fromEntries(
                Object.entries(formData).map(([key, value]) => {
                    return [key, typeof value === "number" ? 0 : ""];
                })
            ) as unknown as FormDataSteps
        );
    };

	/* ----- Definição de colunas e dados que a tabela de lotes vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Steps[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "etor_ordem", headerName: "Ordem", filter: true, width: 110 },
        { field: "etor_etapa_nome",headerName: "Nome da Etapa", filter: true, width: 180 },
        { field: "etor_tempo", headerName: "Tempo Estimado", width: 180 },
        {field: "etor_insumos", headerName: "Insumos Utilizados", filter: true, width: 260},
        {field: "etor_responsavel", headerName: "Responsável", filter: true, width: 200},
		{
            headerName: "Data de Cadastro", field: "etor_dtCadastro", width: 180, filter: true,
            valueGetter: (params) => new Date(params.data.etor_dtCadastro).toLocaleDateString("pt-BR")
        },
        {field: "etor_observacoes", headerName: "Observações", width: 300},
        {
            headerName: "Ações",
            field: "acoes",
            width: 100,
            cellRenderer: (params: ICellRendererParams) => (
                <div className="flex gap-2 mt-2.5 items-center justify-center">
                    <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="Editar Lote"
                        // onClick={() => { if(params.data) handleEdit(params.data) }}
                    >
                        <Pencil size={18} />
                    </button>
                    {params.context.userLevel === "Administrador" && (
                        <button
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Excluir Lote"
                            // onClick={() => { if(params.data) handleDelete(params.data) }}
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
		<div className="flex-1 p-6 pl-[280px] h-screen">
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
					</Tabs.List>

					{/* Listar Etapas */}
					<Tabs.Content value="list" className="flex flex-col w-full">
						<div className="flex items-center justify-start">
							<div className="flex gap-10 ">
								{/* SideBar Estrutura de produtos */}
								<div className="bg-gray-200 rounded-xl max-w-[350px] sombra flex flex-col h-[70vh]">
									{/* Cabeçalho */}
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

									{/* Lista rolável */}
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

									{/* Botão fixo */}
									<div className="p-1 bg-gray-300 hover:bg-gray-400 rounded-b-xl">
										<button
											onClick={() => {setOpenNewProductModal(true); setNewProduct({ produto: "" });}}
											className="w-full cursor-pointer flex place-content-center gap-2 text-black font-semibold py-2 rounded-lg"
										>
											<Plus />
											Novo Produto
										</button>
									</div>
								</div>


								{/* Tabela de Etapas */}
								<div className="w-[60vw]">
									{loading.has("steps") ? (
										<div className="flex justify-center items-center h-full w-[50vw]">
											<Loader2 className="animate-spin h-8 w-8 mx-auto" />
										</div>
									) : selectedProduct ? (
										<>
											<div className="flex items-center justify-between mb-4">
												<h2 className="text-2xl flex items-center gap-2">
													<strong>Produto Final:</strong>{" "}
													{selectedProduct.produto_nome}
													<button 
														className="cursor-pointer ml-1 text-blue-600" 
														title="Editar Produto"
													>
														<PencilLine size={21} />
													</button>
													<button 
														className="text-red-500 cursor-pointer" 
														title="Excluir Produto"
													>
														<Trash size={21} />
													</button>
												</h2>
												<button
												onClick={() => setOpenRegisterModal(true)}
												className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
												>
													<Plus />
													Nova Etapa
												</button>
											</div>
											{/* Tabela de Lotes */}
											<div className="h-[63vh]">
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

				</Tabs.Root>

				{/* Modal de Cadastro de Produto */}
				<Modal
					openModal={openNewProductModal}
					setOpenModal={setOpenNewProductModal}
					modalTitle="Cadastrar Novo Produto"
					withXButton
					isRegister
            		registerButtonText="Cadastrar Produto"
					modalWidth="w-1/2 h-[450px]"
					isSideButton
					isLoading={loading.has("registerProduct")}
					onSubmit={handleProductSubmit}
				>
					<SmartField
						fieldName="produto"
						fieldText="Produto"
						isSelect
						fieldClassname="flex flex-col flex-1"
						error={errors.product ? "*" : undefined}
						isLoading={loading.has("options")}
						value={newProduct.produto}
						placeholder="Selecione o novo Produto"
						onChangeSelect={handleChange}
						options={options?.produtos.map((produto) => ({
							label: produto.produto_nome,
							value: String(produto.produto_id),
						}))}
					/>
				</Modal>

				{/* Modal de Cadastro de Nova Etapa */}
				<Modal
					openModal={openRegisterModal}
					setOpenModal={setOpenRegisterModal}
					modalTitle="Cadastrar Nova Etapa"
					withXButton
					isRegister
            		registerButtonText="Cadastrar Etapa"
					modalWidth="w-1/2"
					isLoading={loading.has("registerStep")}
					// onSubmit={handleStepSubmit}
				>	
					<div className="flex flex-col gap-4">
						<SmartField
							fieldName="produto"
							fieldText="Produto Final"
							fieldClassname="flex flex-col flex-1"
							type="text"
							value={selectedProduct?.produto_nome}
							onChange={handleChange}
							readOnly
						/>
						<SmartField
							fieldName="nome_etapa"
							fieldText="Nome da Etapa"
							fieldClassname="flex flex-col w-full"
							type="text"
							required
							placeholder="Digite o Nome da Etapa"
							value={formData.etor_etapa_nome}
							onChange={handleChange}
						/>
						<SmartField
							fieldName="tempo"
							fieldText="Tempo Estimado"
							type="text"
							required
							placeholder="Tempo Estimado da etapa"
							value={formData.etor_tempo}
							onChange={handleChange}
							inputWidth="w-[250px]"
						/>
						<SmartField
							fieldName="insumos"
							fieldText="Insumos Utilizados"
							fieldClassname="flex flex-col w-full"
							type="text"
							required
							placeholder="Insumos Utilizados na etapa"
							value={formData.etor_insumos}
							onChange={handleChange}
						/>
						<SmartField
							isTextArea
							fieldName="obs"
							fieldText="Observações"
							fieldClassname="flex flex-col w-full"
							placeholder="Digite as observações da Etapa"
							value={formData.etor_observacoes}
							onChange={handleChange}
							rows={2}
						/>
					</div>
				</Modal>

				{/* Modal de Avisos */}
				<NoticeModal
					openModal={openNoticeModal}
					setOpenModal={setOpenNoticeModal}
					successMsg={successMsg}
					message={message}
				/>

				{/* Alert para confirmar exclusão da etapa */}
				<ConfirmationModal
					openModal={openConfirmModal}
					setOpenModal={setOpenConfirmModal}
					confirmationModalTitle="Tem certeza que deseja excluir a etapa?"
					confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					// onConfirm={handleDeleteStep}
					isLoading={loading.has("deleteStep")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir etapa"
				/>
			</div>
		</div>
	);
}
