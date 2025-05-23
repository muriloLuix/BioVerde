import {useState, useRef, useEffect} from "react";
import axios from "axios";
import {Tabs} from "radix-ui";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { Pencil, Trash2, Plus } from 'lucide-react';
import { agGridTranslation } from "../../utils/agGridTranslation";


import {Modal, SmartField, NoticeModal} from "../../shared";
import {Batch, Product, Unit, ProductType, ProductStatus, Supplier, SelectEvent} from "../../utils/types";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";

interface BatchOptions {
    produtos: Product[];
    unidade_medida: Unit[];
    tipos: ProductType[];
    status: ProductStatus[];
    fornecedores: Supplier[];
}

const Batchs = () => {
    const [activeTab, setActiveTab] = useState("list");
    const [handleModal, setHandleModal] = useState(false);
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<BatchOptions>();
    const [userLevel, setUserLevel] = useState("");
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        lote_id: 0,
        produto_nome: "",
        fornecedor_nome: "",
        dtColheita: "",
        quantidade: "",
        uni_sigla: "",
        tipo: "",
        dtValidade: "",
        status: "",
        classificacao: "",
        localArmazenado: "",
        obs: "",
    });

    // Definição de colunas e dados estáticos (você pode também buscar do backend aqui)
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Batch[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_id", headerName: "ID", filter: true, width: 100 },
        { field: "produto_nome", headerName: "Produto", filter: true, width: 250 },
        { field: "fornecedor_nome", headerName: "Fornecedor", filter: true, width: 230 },
        { field: "dtColheita", headerName: "Data De Colheita", width: 180 },
        { field: "quantidade", headerName: "Quantidade", width: 150 },
        { field: "tipo", headerName: "Tipo", width: 150 },
        { field: "dtValidade", headerName: "Data De Validade", width: 180 },
        { field: "status", headerName: "Status", width: 150 },
        { field: "classificacao", headerName: "Classificação", width: 180 },
        { field: "localArmazenado", headerName: "Local Armazenado", width: 180 },
        { field: "obs", headerName: "Observação", width: 300 },
        {
            headerName: "Ações",
            field: "acoes",
            width: 100,
            cellRenderer: (params: ICellRendererParams<Batch>) => (
                <div className="flex gap-2 mt-2.5 items-center justify-center">
                <button
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => handleEdit(params.data)}
                >
                    <Pencil size={18} />
                </button>
                {params.context.userLevel === "Administrador" && (
                    <button
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => handleDelete(params.data)}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
                </div>
            ),
            pinned: "right",
            sortable: false,
            filter: false,
        }


    ]);

    const myTheme = themeQuartz.withParams({
        spacing: 9,
        headerBackgroundColor: '#89C988',
        foregroundColor: '#1B1B1B',
        rowHoverColor: '#E2FBE2',
        oddRowBackgroundColor: '#f5f5f5',
        fontFamily: '"Inter", sans-serif',
    });


    //Carrega a lista os lotes e as opções nos selects ao renderizar a página
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading((prev) => new Set([...prev, "batches", "options"]));

				const [lotesResponse, userLevelResponse] = await Promise.all([
					axios.get(
						"http://localhost/BioVerde/back-end/lotes/listar_lotes.php",
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

				if (lotesResponse.data.success) {
					const lotesCampos = lotesResponse.data.lotes.map((lote: Batch) => ({
                        lote_id: lote.lote_id,
                        produto_nome: lote.produto_nome,
                        fornecedor_nome: lote.fornecedor_nome_ou_empresa,
                        dtColheita: new Date(lote.lote_dtFabricacao).toLocaleDateString("pt-BR"),
                        quantidade: lote.lote_quantidade + lote.uni_sigla,
                        tipo: lote.tproduto_nome,
                        dtValidade: new Date(lote.lote_dtExpiracao).toLocaleDateString("pt-BR"),
                        status: lote.staproduto_nome,
                        classificacao: lote.lote_classificacao,
                        localArmazenado: lote.lote_localArmazenado,
                        obs: lote.lote_obs,
                    }));
                    setRowData(lotesCampos);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						lotesResponse.data.message || "Erro ao carregar lotes"
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
					["batches", "options"].forEach((item) => newLoading.delete(item));
					return newLoading;
				});
			}
		};
		fetchData();
	}, []);

    // Função que busca as opções de produto
    const fetchOptions = async () => {
        try {
            setLoading((prev) => new Set([...prev, "options"]));

            const response = await axios.get(
                "http://localhost/BioVerde/back-end/lotes/listar_opcoes.php",
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
                    produtos: response.data.produtos,
                    unidade_medida: response.data.unidade_medida,
                    tipos: response.data.tp_produto,
                    status: response.data.status_produto,
                    fornecedores: response.data.fornecedores,
                });
            } else {
                setOpenNoticeModal(true);
                setMessage(response.data.message || "Erro ao carregar opções");
            }
        } catch (error) {
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");

            if (axios.isAxiosError(error)) {
                console.error(
                    "Erro na requisição (options):",
                    error.response?.data || error.message
                );
                if (error.response?.data?.message) {
                    setMessage(error.response.data.message);
                }
            } else {
                console.error("Erro desconhecido (options):", error);
            }
        } finally {
            setLoading((prev) => {
                const newLoading = new Set(prev);
                newLoading.delete("options");
                return newLoading;
            });
        }
    };

    const handleChange = (
        event: 
            | React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement
              > 
            | SelectEvent
    ) => {

        const { name, value } = event.target;
        if (name in formData) {
			setFormData({ ...formData, [name]: value });
		}
    };

    return (
        <div className="h-screen w-full flex-1 p-6 pl-[280px]">
            <div className="h-10 w-full flex items-center justify-center">
                <span className="text-4xl font-semibold text-center">Lotes</span>
            </div>
            <Tabs.Root
                defaultValue="list"
                className="w-full"
                onValueChange={(v) => setActiveTab(v)}
            >
                <Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
                    <Tabs.Trigger
                        value="list"
                        className={`relative px-4 py-2 text-verdePigmento text-lg font-semibold cursor-pointer ${
                            activeTab === "list" ? "select animation-tab" : ""
                        }`}
                    >
                        Lista de Lotes
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content
                    value="list"
                    className="w-full flex flex-col py-2 px-4"
                >
                    {/* Botão de Abrir Modal de Cadastro de Lote */}
                    <div className="w-full flex items-center justify-end">
                        <div className="flex justify-end mt-1 mb-3"> 
                            <button
                                type="button"
                                className="bg-verdePigmento p-2.5 font-bold rounded-lg text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
                                onClick={() => setHandleModal(true)}
                            >
                                <Plus />
                                Novo Lote
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabela de Lotes */}
                    <div className="h-[70vh]"> 
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
            </Tabs.Root>
            
            {/* Modal de Cadastro de Lotes */}
            <Modal
                openModal={handleModal}
                setOpenModal={setHandleModal}
                modalTitle="Adicione as informações"
                modalWidth="w-1/2"
                leftButtonText="Criar"
                rightButtonText="Cancelar"
            >

                <SmartField
                    fieldName="produto_nome"
                    fieldText="Produto"
                    isSelect
                    placeholder="Selecione o produto"
                    isLoading={loading.has("options")}
                    value={formData.produto_nome}
                    onChangeSelect={handleChange}
                    options={
                        options?.produtos.map((produto) => ({
                            label: produto.produto_nome,
                            value: produto.produto_nome,
                        }))
                    }
                />
                <SmartField
                    fieldName="quantidade"
                    type="number"
                    fieldText="Quantidade"
                    value={formData.quantidade}
                    onChange={handleChange}
                />
                <SmartField
                    fieldName="dtFabricacao"
                    fieldText="Data de fabricação"
                    type="date"
                    value={formData.dtColheita}
                    onChange={handleChange}
                />
                <SmartField
                    fieldName="dtExpiracao"
                    fieldText="Data de validade"
                    type="date"
                    value={formData.dtValidade}
                    onChange={handleChange}
                />
                <SmartField
                    fieldName="obs"
                    fieldText="Observações"
                    isTextArea
                    placeholder="Adicione informações sobre o lote"
                    value={formData.obs}
                    onChange={handleChange}
                />
            </Modal>

            {/* Modal de Avisos */}
            <NoticeModal
                openModal={openNoticeModal}
                setOpenModal={setOpenNoticeModal}
                successMsg={false}
                message={message}
            />

        </div>
    );
};

export default Batchs;
