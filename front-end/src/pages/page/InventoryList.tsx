import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import { InputMaskChangeEvent } from "primereact/inputmask";
import { Tabs } from "radix-ui";
import { Pencil, Trash2, Plus, FileSpreadsheet } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { Modal, NoticeModal, ConfirmationModal } from "../../shared";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../../utils/checkAuth";
import { BatchRegister, BatchUpdate, BatchDelete } from "../pageComponents";
import { Batch, BatchOptions, SelectEvent, FormDataBatch, DeleteBatch } from "../../utils/types";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function InventoryList() {
    const [openRegisterModal, setOpenRegisterModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<BatchOptions>();
    const [userLevel, setUserLevel] = useState("");
    const [successMsg, setSuccessMsg] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({
        product: false,
        supplier: false,
        unit: false,
        type: false,
        price: false,
        classification: false,
        storage: false,
        quantityMax: false,
        harvestDate: false,
        expirationDate: false,
    });
    const [formData, setFormData] = useState<FormDataBatch>({
        lote_id: 0,
        lote_codigo: "",
        produto: "",
        fornecedor: "",
        dt_colheita: "",
        quant_max: 0,
        quant_atual: 0,
        unidade: "",
        preco: 0.0,
        tipo: "",
        dt_validade: "",
        classificacao: "",
        localArmazenado: "",
        obs: "",
    });
    const [deleteBatch, setDeleteBatch] = useState<DeleteBatch>({
        lote_id: 0,
        lote_codigo: "",
        dproduto: "",
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
                setLoading((prev) => new Set([...prev, "batches", "options"]));
                const [lotesResponse, userLevelResponse] = await Promise.all([
                    axios.get(
                        "http://localhost/BioVerde/back-end/lotes/listar_lotes.php",
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
                if (lotesResponse.data.success) {
                    setRowData(lotesResponse.data.lotes);
                } else {
                    setOpenNoticeModal(true);
                    setMessage(lotesResponse.data.message || "Erro ao carregar lotes" );
                }
            } catch (error) {
                console.error(error);
                setOpenNoticeModal(true);
                setMessage("Erro ao conectar com o servidor");
            } finally {
                setLoading((prev) => {
                    const newLoading = new Set(prev);
                    ["batches", "options"].forEach((item) => newLoading.delete(item));
                    return newLoading;
                });
            }
        };
        fetchData();
    }, []);

    //Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "batches"]));
			const lotesResponse = await axios.get(
				"http://localhost/BioVerde/back-end/lotes/listar_lotes.php",
				{ withCredentials: true }
			);
			if (lotesResponse.data.success) {
                setRowData(lotesResponse.data.lotes);
			} else {
                setMessage(lotesResponse.data.message || "Erro ao carregar dados");
				setOpenNoticeModal(true);
			}
		} catch (error) {
            console.error(error);
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");
		} finally {
			setLoading((prev) => {
				const newLoading = new Set(prev);
				newLoading.delete("batches");
				return newLoading;
			});
		}
	};

    // Função que busca as opções de produto
    const fetchOptions = async () => {
        try {
            setLoading((prev) => new Set([...prev, "options"]));
            const response = await axios.get(
                "http://localhost/BioVerde/back-end/lotes/listar_opcoes.php",
                { withCredentials: true, headers: { Accept: "application/json", "Content-Type": "application/json" }}
            );
            if (response.data.success) {
                setOptions({
                    produtos:            response.data.produtos,
                    unidade_medida:      response.data.unidade_medida,
                    tipos:               response.data.tp_produto,
                    fornecedores:        response.data.fornecedores,
                    classificacoes:      response.data.classificacao,
                    locaisArmazenamento: response.data.localArmazenado,
                });
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

    /* ----- Função para Cadastro de Lotes ----- */

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		// Validações
		const errors = {
            product:         !formData.produto,
            supplier:        !formData.fornecedor,
            unit:            !formData.unidade,
            type:            !formData.tipo,
            price:           !formData.preco,   
            classification:  !formData.classificacao,
            storage:         !formData.localArmazenado,
            quantityMax:     !formData.quant_max,
            harvestDate:     !formData.dt_colheita,
            expirationDate:  !formData.dt_validade,
		};
		setErrors(errors);
		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) { return; }

		setLoading((prev) => new Set([...prev, "register"]));
		console.log("Dados enviados no formData:", formData);
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/cadastrar_lotes.php",
				formData,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
                setOpenRegisterModal(false);
				setMessage(`Lote ${response.data.lote_codigo} foi cadastrado com sucesso!`);
				clearFormData();
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message ?? "Erro ao cadastrar lote");
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
				newLoading.delete("register");
				return newLoading;
			});
		}
	};

    /* ----- Funções para Atualizar Lote após edição ----- */

    //Formata as Datas
    const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().split("T")[0];
    };

    //função para puxar os dados do lote que será editado
    const handleEdit = (lote: Batch) => {
        setFormData({
            lote_id: lote.lote_id,
            lote_codigo: lote.lote_codigo,
            produto: String(lote.produto_id),
            fornecedor: String(lote.fornecedor_id),
            quant_max: lote.lote_quantMax,
            quant_atual: lote.lote_quantAtual,
            unidade: String(lote.uni_id),
            preco: lote.produto_preco,
            dt_colheita: formatDate(lote.lote_dtColheita),
            tipo: String(lote.tproduto_id),
            dt_validade: formatDate(lote.lote_dtValidade),
            classificacao: String(lote.classificacao_id),
            localArmazenado: String(lote.localArmazenamento_id),
            obs: lote.lote_obs,
        });
        setOpenEditModal(true);
    };

    // função para atualizar o lote após a edição dele
	const handleUpdateBatch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "updateBatch"]));
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/editar_lote.php",
				formData,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setOpenEditModal(false);
				setSuccessMsg(true);
				setMessage(`Lote ${response.data.lote_codigo} foi atualizado com sucesso!`);
				clearFormData();
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao atualizar lote.");
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
				newLoading.delete("updateBatch");
				return newLoading;
			});
		}
	};

    /* ----- Funções para Excluir Lote ----- */

    //função para puxar os dados do lote que será excluido
    const handleDelete = (lote: Batch) => {
        setDeleteBatch({
            lote_id: lote.lote_id,
            lote_codigo: lote.lote_codigo,
            dproduto: lote.produto_nome,
            reason: "",
        });
        setOpenDeleteModal(true);
    }; 
    
    // função para excluir um lote
	const handleDeleteBatch = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading((prev) => new Set([...prev, "deleteBatch"]));
		try {
            const response = await axios.post(
                "http://localhost/BioVerde/back-end/lotes/excluir_lote.php",
				deleteBatch,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
            console.log(response.data);
			if (response.data.success) {
				await refreshData();
				setOpenConfirmModal(false);
				setSuccessMsg(true);
				setMessage("Lote excluído com sucesso!");
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message || "Erro ao excluir lote.");
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
				newLoading.delete("deleteBatch");
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
        if (name in formData) { setFormData({ ...formData, [name]: value }) }
        if (name in deleteBatch) { setDeleteBatch({ ...deleteBatch, [name]: value }) }
        setErrors((prevErrors) =>
            Object.fromEntries(
                Object.keys(prevErrors).map((key) => [key, false])
            ) as typeof prevErrors
		);
    };

    //Capturar valor no campo de Preço
	const handlePriceChange = ({ value }: { value: string }) => {
		const formattedValue = parseFloat(value);

		setFormData({ ...formData, preco: formattedValue });
		setErrors((errors) => ({ ...errors, price: false }));
	};

    //Limpar FormData
	const clearFormData = () => {
        setFormData(
            Object.fromEntries(
                Object.entries(formData).map(([key, value]) => {
                    return [key, typeof value === "number" ? 0 : ""];
                })
            ) as unknown as FormDataBatch
        );
    };

    /* ----- Definição de colunas e dados que a tabela de lotes vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Batch[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_codigo", headerName: "ID do Lote", filter: true, width: 180 },
        { field: "produto_nome",headerName: "Produto", filter: true, width: 250 },
        { field: "fornecedor_nome", headerName: "Fornecedor", filter: true, width: 230 },
        { 
            headerName: "Data De Colheita", field: "lote_dtColheita", width: 180,
            valueGetter: (params) => new Date(params.data.lote_dtColheita).toLocaleDateString("pt-BR")
        },
        {
            headerName: "Capacidade Máxima",
            width: 180,
            valueGetter: (params) => {
                const value = Number(params.data.lote_quantMax);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {
            headerName: "Quantidade Atual",
            width: 180,
            valueGetter: (params) => {
                const value = Number(params.data.lote_quantAtual);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {
            headerName: "Data De Validade", field: "lote_dtValidade", width: 180,
            valueGetter: (params) => new Date(params.data.lote_dtValidade).toLocaleDateString("pt-BR")
        },
        {
            field: "produto_preco",
            headerName: "Preço do Produto",
            width: 160,
            valueFormatter: (params) => {
                return `R$ ${Number(params.value).toFixed(2).replace('.', ',')}`;
            }
        },
        {
            field: "lote_preco",
            headerName: "Preço Total do Lote",
            width: 180,
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
            cellRenderer: (params: ICellRendererParams<Batch>) => (
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
        <>
        <Tabs.Content value="list" className="w-full flex flex-col py-2 px-4">
            {/* Botões de Exportar CSV e Novo Lote */}
            <div className="flex justify-between">
                {/* Botão de Abrir Modal de Cadastro de Lote */}
                <div className="mt-1 mb-3">
                    <button
                        type="button"
                        className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
                        onClick={() => {setOpenRegisterModal(true); clearFormData()}}
                    >
                        <Plus />
                        Novo Lote
                    </button>
                </div>
                {/* Botão de exportar para CSV dos dados da tabela */}
                <div className="mt-1 mb-3">
                    <button
                        onClick={() => {
                            const params = {
                                fileName: "lotes.csv",
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
        </Tabs.Content>
        {/* Modal de Cadastro de Lotes */}
        <Modal
            openModal={openRegisterModal}
            setOpenModal={setOpenRegisterModal}
            modalTitle="Cadastro de Lotes"
            withXButton
            isRegister
            registerButtonText="Cadastrar Lote"
            modalWidth="w-1/2"
            isLoading={loading.has("register")}
            onSubmit={handleRegister}
        >
            <BatchRegister
                formData={formData}
                options={options}
                loading={loading}
                errors={errors}
                handleChange={handleChange}
                handlePriceChange={handlePriceChange}
            />
        </Modal>
        {/* Modal de Edição de Lotes */}
        <Modal
            openModal={openEditModal}
            setOpenModal={setOpenEditModal}
            modalTitle="Editar Lote"
            withXButton
            rightButtonText="Editar"
            leftButtonText="Cancelar"
            modalWidth="w-1/2"
            isLoading={loading.has("updateBatch")}
            onSubmit={handleUpdateBatch}
        >
            <BatchUpdate
                formData={formData}
                options={options}
                loading={loading}
                handleChange={handleChange}
                handlePriceChange={handlePriceChange}
            />
        </Modal>
        {/* Modal de Exclusão */}
        <Modal
            openModal={openDeleteModal}
            setOpenModal={setOpenDeleteModal}
            modalTitle="Excluir Lote"
            rightButtonText="Excluir"
            leftButtonText="Cancelar"
            onDelete={() => {
                setOpenConfirmModal(true);
                setOpenDeleteModal(false);
            }}
        >
            <BatchDelete
                deleteBatch={deleteBatch}
                loading={loading}
                handleChange={handleChange}
            />
        </Modal>
        {/* Alert para confirmar exclusão do lote */}
        <ConfirmationModal
            openModal={openConfirmModal}
            setOpenModal={setOpenConfirmModal}
            confirmationModalTitle="Tem certeza que deseja excluir o lote?"
            confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
            onConfirm={handleDeleteBatch}
            isLoading={loading.has("deleteBatch")}
            confirmationLeftButtonText="Cancelar"
            confirmationRightButtonText="Sim, excluir lote"
        />
        {/* Modal de Avisos */}
        <NoticeModal
            openModal={openNoticeModal}
            setOpenModal={setOpenNoticeModal}
            successMsg={successMsg}
            message={message}
        />
        </>
    );
}