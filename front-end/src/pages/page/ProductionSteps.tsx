import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tabs, Form } from "radix-ui";
import { Plus, PencilLine, Trash, Eye, Search, Loader2, Pencil, Trash2} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { SmartField, Modal, NoticeModal, ConfirmationModal } from "../../shared";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../utils/checkAuth";
// import { BatchRegister, BatchUpdate, BatchDelete } from "../pageComponents";
import { SelectEvent, FormDataSteps, ProductsWithSteps, Etapa } from "../../utils/types";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function ProductionSteps() {
	const [activeTab, setActiveTab] = useState("list");
	// const [showStepForm, setShowStepForm] = useState<boolean>(false);
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openObsModal, setOpenObsModal] = useState(false);
	// const [keepProduct, setKeepProduct] = useState(false);
	const [successMsg, setSuccessMsg] = useState(false);
	const [userLevel, setUserLevel] = useState("");
	const [search, setSearch] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	// const [options, setOptions] = useState<BatchOptions>();
	const [productsWithSteps, setProductsWithSteps] = useState<ProductsWithSteps[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<ProductsWithSteps | null>(null);
	const [formData, setFormData] = useState<FormDataSteps>({
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
					setSuccessMsg(false);
					setOpenNoticeModal(true);
					setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário");
				}

			} catch (error) {
				setSuccessMsg(false);
				console.error(error);
				setOpenNoticeModal(true);
				setMessage("Erro ao conectar com o servidor");
				return false;
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
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao carregar etapas");
				setOpenNoticeModal(true);
				return false;
			}
		} catch (error) {
			setSuccessMsg(false);
            console.error(error);
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");
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
		event: 
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| SelectEvent
	) => {
		const { name, value } = event.target;

		if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
		if (name in deleteStep) {
			setDeleteStep({ ...deleteStep, [name]: value });
		}
		// setErrors((prevErrors) =>
        //     Object.fromEntries(
        //         Object.keys(prevErrors).map((key) => [key, false])
        //     ) as typeof prevErrors
		// );
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

	/* ----- Definição de colunas e dados que a tabela de lotes vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Batch[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_codigo", headerName: "ID do Lote", filter: true, width: 180 },
        { field: "produto_nome",headerName: "Produto", filter: true, width: 250 },
        { field: "fornecedor_nome", headerName: "Fornecedor", filter: true, width: 230 },
        { 
            headerName: "Data De Colheita", field: "lote_dtColheita", width: 180, filter: true,
            valueGetter: (params) => new Date(params.data.lote_dtColheita).toLocaleDateString("pt-BR")
        },
        {
            headerName: "Capacidade Máxima", width: 180,
            valueGetter: (params) => {
                const value = Number(params.data.lote_quantMax);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {
            headerName: "Quantidade Atual", width: 180,
            valueGetter: (params) => {
                const value = Number(params.data.lote_quantAtual);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {
            headerName: "Data De Validade", field: "lote_dtValidade", width: 180, filter: true,
            valueGetter: (params) => new Date(params.data.lote_dtValidade).toLocaleDateString("pt-BR")
        },
        {   field: "produto_preco", headerName: "Preço do Produto", width: 160, filter: true,
            valueFormatter: (params) => {
                return `R$ ${Number(params.value).toFixed(2).replace('.', ',')}`;
            }
        },
        {   field: "lote_preco", headerName: "Preço Total do Lote", width: 180, filter: true,
            valueFormatter: (params) => {
                return `R$ ${Number(params.value).toFixed(2).replace('.', ',')}`;
            }
        },
        {field: "tproduto_nome", headerName: "Tipo", width: 150},
        {field: "classificacao_nome", headerName: "Classificação", width: 180},
        {field: "localArmazenamento_nome", headerName: "Local Armazenado", width: 180},
        {field: "lote_obs", headerName: "Observação", width: 300},
        {
            headerName: "Ações",
            field: "acoes",
            width: 100,
            cellRenderer: (params: ICellRendererParams) => (
                <div className="flex gap-2 mt-2.5 items-center justify-center">
                    <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="Editar Lote"
                        onClick={() => { if(params.data) handleEdit(params.data) }}
                    >
                        <Pencil size={18} />
                    </button>
                    {params.context.userLevel === "Administrador" && (
                        <button
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Excluir Lote"
                            onClick={() => { if(params.data) handleDelete(params.data) }}
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
							<div className="flex gap-10 max-h-[500px] h-[68vh]">
								{/* SideBar Estrutura de produtos */}
								<div className="bg-gray-200 rounded-xl max-w-[350px] sombra flex flex-col h-full">
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
											// onClick={handleNovoProduto}
											className="w-full cursor-pointer flex place-content-center gap-2 text-black font-semibold py-2 rounded-lg"
										>
											<Plus />
											Novo Produto
										</button>
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
											<div className="flex items-center justify-between mb-4">
												<h2 className="text-2xl flex items-center gap-2">
													<strong>Produto Final:</strong>{" "}
													{selectedProduct.produto_nome}
													<PencilLine size={21} className="cursor-pointer ml-1"/>
													<Trash size={21} className="text-red-500 cursor-pointer"/>
												</h2>
												<button
												// onClick={gerarRelatorio}
												className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
												>
													<Plus />
													Nova Etapa
												</button>
											</div>
											{/* Tabela de Lotes */}
											<div className="h-[75vh]">
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
					onConfirm={handleDeleteStep}
					isLoading={loading.has("deleteStep")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir etapa"
				/>
			</div>
		</div>
	);
}
