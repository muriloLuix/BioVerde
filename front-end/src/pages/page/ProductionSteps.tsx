import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tabs } from "radix-ui";
import { Plus, PencilLine, Trash, Search, Loader2, Pencil, Trash2, Check, X} from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { Modal, NoticeModal, ConfirmationModal } from "../../shared";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../utils/checkAuth";
import { ProductRegister, NewStep, UpdateStep, DeleteStep } from "../pageComponents";
import { SelectEvent, FormDataSteps, ProductsWithSteps, Steps, StepOptions, DeleteSteps } from "../../utils/types";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function ProductionSteps() {
	const [activeTab, setActiveTab] = useState("list");
	const [openRegisterModal, setOpenRegisterModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openConfirmModal, setOpenConfirmModal] = useState(false);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openNewProductModal, setOpenNewProductModal] = useState(false);
	const [openDeleteProductModal, setOpenDeleteProductModal] = useState(false);
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
        step: false,
        time: false,
        unit: false,
		insoum: false,
    });
	const [formData, setFormData] = useState<FormDataSteps>({
		etor_id: 0,
		etor_ordem: 0,
		etapa_nome_id: "",
		etor_tempo: "",
		etor_insumos: [],
		etor_observacoes: "",
		etor_unidade: "",
	});
	const [deleteStep, setDeleteStep] = useState<DeleteSteps>({
		etor_id: 0,
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
                    setMessage(stepsResponse.data.message || "Erro ao carregar produto com etapas de produção" );
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
			const atual = productsWithSteps.find(
				(p) => p.produto_id === selectedProduct?.produto_id
			);
			setSelectedProduct(atual || productsWithSteps[0]);
		}
	}, [productsWithSteps, selectedProduct]);

	// Para setar os dados que a tabela deve receber após selecionar um produto
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
					nome_etapas: response.data.nome_etapas,
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

	/* ----- Função para Cadastro de Etapas ----- */

	//Submit de cadastrar a etapa de produção completa
	const handleStepSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const errors = { 
			step: !formData.etapa_nome_id,
			time: !formData.etor_tempo,
			unit: !formData.etor_unidade,
			insoum: formData.etor_insumos.length === 0,
			product: false
		};
		setErrors(errors);
		if (Object.values(errors).some((error) => error)) { return; }
		
		const dataToSend = { ...formData, produto_final: selectedProduct?.produto_nome };
		setLoading((prev) => new Set([...prev, "registerStep"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/cadastrar_etapas.php",
				dataToSend,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Etapa cadastrada com sucesso!");
				setOpenRegisterModal(false);
				clearFormData();
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar Etapa");
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
				newLoading.delete("registerStep");
				return newLoading;
			});
		}
	};

	/* ----- Funcões para Edição de Etapas ----- */

	//função para puxar os dados da etapa que será editada
	const handleEdit = (etapa: Steps) => {
		setFormData({
			etor_id: etapa.etor_id,
			etor_ordem: etapa.etor_ordem,
			etapa_nome_id: etapa.etapa_nome_id.toString(),
			etor_tempo: etapa.etor_tempo,
			etor_insumos: etapa.etor_insumos,
			etor_observacoes: etapa.etor_observacoes,
			etor_unidade: etapa.etor_unidade,
		});
		setOpenEditModal(true);
	};

	// função para atualizar o lote após a edição dele
	const handleUpdateStep = async (e: React.FormEvent) => {
		e.preventDefault();

		const NewErrors = { 
			...errors, 
			time: !formData.etor_tempo,
			insoum: formData.etor_insumos.length === 0,
		};
		setErrors(NewErrors);
		if (Object.values(NewErrors).some((error) => error)) { return; }

		const dataToSend = { ...formData, produto_final: selectedProduct?.produto_nome };
		setLoading((prev) => new Set([...prev, "updateStep"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/editar_etapas.php",
				dataToSend,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setOpenEditModal(false);
				setSuccessMsg(true);
				setMessage(`A etapa foi atualizada com sucesso!`);
				clearFormData();
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar etapa.");
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
				newLoading.delete("updateStep");
				return newLoading;
			});
		}
	};

	/* ----- Funcões para Exclusão de Etapas ----- */

	//função para puxar os dados do lote que será excluido
    const handleDelete = (etapa: Steps) => {
        setDeleteStep({
            etor_id: etapa.etor_id,
            dstep: etapa.etapa_nome_id.toString(),
            reason: "",
        });
        setOpenDeleteModal(true);
    }; 
    
    // função para excluir um lote
	const handleDeleteStep = async (e: React.FormEvent) => {
		e.preventDefault();
		const dataToSend = { ...deleteStep, dproduct: selectedProduct?.produto_nome };
		setLoading((prev) => new Set([...prev, "deleteStep"]));
		try {
            const response = await axios.post(
                "http://localhost/BioVerde/back-end/etapas/excluir_etapas.php",
				dataToSend,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
            console.log(response.data);
			if (response.data.success) {
				await refreshData();
				setOpenConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Etapa excluída com sucesso!");
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir etapa.");
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
				newLoading.delete("deleteStep");
				return newLoading;
			});
		}
	};

	/* ----- Funções para CRUD de Produtos com Etapas  ----- */

	const [editingId, setEditingId] = useState<number | null>(null);
	const [deletedId, setDeletedId] = useState<number | null>(null);
	const [editedValue, setEditedValue] = useState<string>("");
    
    const handleEditProduct = (produto: ProductsWithSteps) => {
		setEditingId(produto.produto_id);
		setEditedValue(produto.produto_nome);
	};
	const handleDeleteProduct = (produto: ProductsWithSteps) => {
		setDeletedId(produto.produto_id);
		setOpenDeleteProductModal(true);
	};

	//Submit de cadastrar produto com etapa
	const handleProductSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const NewErrors = { 
			...errors, product: !newProduct.produto
		};
		setErrors(NewErrors);
		if (Object.values(NewErrors).some((error) => error)) { return; }

		setLoading((prev) => new Set([...prev, "registerProduct"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/cadastrar_produto_etapa.php",
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

    //Função para editar produto
	const updateProduct = async (id: number, editedValue: string) => {
		setLoading((prev) => new Set([...prev, "steps"]));
		try {
			const dataToSend = {
				produto_id: id,
				produto_nome: editedValue,
			};
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/editar_produto_etapa.php",
				dataToSend,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
				setMessage("Produto atualizado com sucesso!");
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar Produto.");
			}
		} catch (error) {
            setSuccessMsg(false);
            console.error(error);
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");
		} finally {
			setOpenNoticeModal(true);
			setEditingId(null);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("steps");
				return newLoading;
			});
		}
	};

    //Função para excluir produto
	const deleteProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteProduct"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/excluir_produto_etapa.php",
				{ produto_id: deletedId },
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			if (response.data.success) {
				await refreshData();
				setOpenDeleteProductModal(false);
				setSuccessMsg(true);
				setMessage("Produto excluído com sucesso!");
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir Produto.");
			}
		} catch (error) {
			setSuccessMsg(false);
            console.error(error);
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor")
		} finally {
			setOpenNoticeModal(true);
			setEditingId(null);
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("deleteProduct");
				return newLoading;
			});
		}
	};

	/* ----- Funções para CRUD de Nomes de Etapa  ----- */

	//Função para criar Nome de Etapa
	const createStepName = async (stepName: string) => {
		setLoading((prev) => new Set([...prev, "options"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/etapas/cadastrar_nome_etapa.php",
				{ nomeEtapa: stepName },
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await fetchOptions();
				setSuccessMsg(true);
				setMessage("Nome da Etapa cadastrado com sucesso!");
			} else {
				setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao cadastrar Nome da Etapa");
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

	/* ----- Outras Funções ----- */

    //Verifica nível de acesso do usuário
	useCheckAccessLevel();

	//Para remover a barrinha vertical e a seta do select
	const customComponents = {
		DropdownIndicator: () => null, 
		IndicatorSeparator: () => null, 
	};

    //OnChange dos campos
    const handleChange = (
        event: 
            | React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement> 
            | SelectEvent
    ) => {
        const { name, value } = event.target;
		
		//Para formatar o input de tempo estimado
		let formattedValue = value;
		if (typeof value === "string") {
			formattedValue = name === "etor_tempo" ? value.replace(/[^0-9:]/g, "") : value;
		}

		if (name in newProduct) { setNewProduct({ ...newProduct, [name]: value }) }
        if (name in formData) { setFormData({ ...formData, [name]: formattedValue }) }
        if (name in deleteStep) { setDeleteStep({ ...deleteStep, [name]: value }) }
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
					if (key === "etor_insumos") return [key, []];
                    return [key, typeof value === "number" ? 0 : ""];
                })
            ) as unknown as FormDataSteps
        );
    };

	/* ----- Definição de colunas e dados que a tabela de etapas vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Steps[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "etor_ordem", headerName: "Ordem", filter: true, width: 110 },
        { field: "etapa_nome",headerName: "Nome da Etapa", filter: true, width: 180 },
        {
			headerName: "Tempo Estimado", filter: true, width: 180,
			valueGetter: (params) => {
                return `${params.data.etor_tempo}${params.data.etor_unidade}`;
            }
		},
        {
			field: "etor_insumos", headerName: "Insumos Utilizados", filter: true, width: 260,
			valueGetter: (params) => {
				const insumos = params.data.etor_insumos;
				if (Array.isArray(insumos)) {
					return insumos.join(", ");
				}
				return insumos || ""; 
			}
		},
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
																produto.produto_nome ? "bg-gray-300" : ""
															}`}
															onClick={() => setSelectedProduct(produto)}
														>
															{produto.produto_nome}
														</li>
													))
												}
											</ul>
										)}
									</div>
									{/* Botão fixo */}
									<div className="p-1 bg-gray-300 hover:bg-gray-400 rounded-b-xl">
										<button
											onClick={() => { setOpenNewProductModal(true); setNewProduct({ produto: "" }); }}
											className="w-full cursor-pointer flex place-content-center gap-2 text-black font-semibold py-2 rounded-lg"
										>
											<Plus />
											Novo Produto
										</button>
									</div>
								</div>

								{/* Nome do Produto Final e Botão de Nova Etapa */}
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
													{editingId === selectedProduct.produto_id ? (
														<input
															type="text"
															className="border p-1 text-xl"
															value={editedValue}
															onChange={(e) => setEditedValue(e.target.value)}
															onKeyDown={(e) => {
																if (e.key === "Enter")
																	updateProduct(selectedProduct.produto_id, editedValue);
															}}
															autoFocus
														/>
													) : (
														selectedProduct.produto_nome
													)}
													{editingId === selectedProduct.produto_id ? (
														<>
														<button
															className="cursor-pointer text-xl text-green-700"
															onClick={() =>
																updateProduct(selectedProduct.produto_id, editedValue)
															}
															title="Salvar"
														>
															<Check  />
														</button>
														<button
															className="cursor-pointer text-xl text-red-700"
															onClick={() => setEditingId(null)}
															title="Cancelar"
														>
															<X  />
														</button>
														</>
													) : (
														<>
														<button 
															className="cursor-pointer ml-1 text-blue-600" 
															onClick={() => handleEditProduct(selectedProduct)}
															title="Editar Produto"
														>
															<PencilLine size={21} />
														</button>
														{userLevel === "Administrador" && (
															<button 
																className="text-red-500 cursor-pointer" 
																onClick={() => handleDeleteProduct(selectedProduct)}
																title="Excluir Produto"
															>
																<Trash size={21} />
															</button>
														)}
														</>
													)}
												</h2>
												<button
												onClick={() => {setOpenRegisterModal(true); clearFormData()}}
												className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
												>
													<Plus />
													Nova Etapa
												</button>
											</div>
											{/* Tabela de Etapas */}
											{selectedProduct.etapas && selectedProduct.etapas.length === 0 ? (
												<div className="flex justify-center items-center h-[63vh]">
													<p className="text-gray-800 text-lg text-center px-4">
													Clique em <strong>Nova Etapa</strong> para adicionar etapas a esse produto.
													</p>
												</div>
												) : (
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
													loading={loading.has("steps")}
													overlayLoadingTemplate={overlayLoadingTemplate}
													overlayNoRowsTemplate={overlayNoRowsTemplate}
													/>
												</div>
											)}
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
					<ProductRegister
						newProduct={newProduct}
						options={options}
						loading={loading}
						errors={errors}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Alert para confirmar exclusão do Produto */}
				<ConfirmationModal
					openModal={openDeleteProductModal}
					setOpenModal={setOpenDeleteProductModal}
					confirmationModalTitle="Tem certeza que deseja excluir o produto da lista de produtos com etapas de produção?"
					confirmationText="Todos as etapas desse produto serão excluídas junto com ele. Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
					onConfirm={deleteProduct}
					isLoading={loading.has("deleteProduct")}
					confirmationLeftButtonText="Cancelar"
					confirmationRightButtonText="Sim, excluir Produto"
				/>

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
					onSubmit={handleStepSubmit}
				>	
					<NewStep
						formData={formData}
						selectedProduct={selectedProduct}
						options={options}
						loading={loading}
						errors={errors}
						createStepName={createStepName}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Edição de Etapa */}
				<Modal
					openModal={openEditModal}
					setOpenModal={setOpenEditModal}
					modalTitle="Editar Etapa"
					withXButton
					rightButtonText="Editar"
            		leftButtonText="Cancelar"
					modalWidth="w-1/2"
					isLoading={loading.has("updateStep")}
					onSubmit={handleUpdateStep}
				>	
					<UpdateStep
						formData={formData}
						selectedProduct={selectedProduct}
						options={options}
						loading={loading}
						errors={errors}
						createStepName={createStepName}
						handleChange={handleChange}
					/>
				</Modal>

				{/* Modal de Exclusão de Etapa*/}
				<Modal
					openModal={openDeleteModal}
					setOpenModal={setOpenDeleteModal}
					modalTitle="Excluir Etapa"
					rightButtonText="Excluir"
					leftButtonText="Cancelar"
					onDelete={() => {
						setOpenConfirmModal(true);
						setOpenDeleteModal(false);
					}}
				>
					<DeleteStep
						deleteStep={deleteStep}
						selectedProduct={selectedProduct}
						options={options}
						loading={loading}
						customComponents={customComponents}
						handleChange={handleChange}
					/>
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
