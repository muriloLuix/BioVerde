import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { checkAuth } from "../../utils/checkAuth";
import { useNavigate } from "react-router-dom";
import { Tabs } from "radix-ui";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { PackagePlus, PackageMinus, FileSpreadsheet } from "lucide-react";
import { Modal, NoticeModal, SmartField } from "../../shared";
import { SelectEvent, AddProducts } from "../../utils/types";

export default function InventoryMovements() {
    const [openAddProductModal, setOpenAddProductModal] = useState(false);
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [userLevel, setUserLevel] = useState("");
    const [options, setOptions] = useState<AddProducts>();
    const [formData, setFormData] = useState({
        produto: "",
        lote: "",
        quantidade: 0,
        unidade: "",
        obs: "",
    });
    const [errors, setErrors] = useState({
        product: false,
        batch: false,
        quantity: false,
        unit: false,
    });

    /* ----- useEffects e Requisições via Axios ----- */

    //Checa a autenticação do usuário, se for false expulsa o usuário da sessão
    const navigate = useNavigate();
    useEffect(() => {
        checkAuth({ navigate, setMessage, setOpenNoticeModal });
    }, [navigate]);

    //Carrega a lista os lotes e as opções nos selects ao renderizar a página
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setLoading((prev) => new Set([...prev, "movements", "options"]));
    //             const [movimentacoesResponse, userLevelResponse] = await Promise.all([
    //                 axios.get(
    //                     "http://localhost/BioVerde/back-end/movimentacoes/listar_movimentacoes.php",
    //                     { withCredentials: true, headers: { Accept: "application/json" }}
    //                 ),
    //                 axios.get(
    //                     "http://localhost/BioVerde/back-end/auth/usuario_logado.php",
    //                     { withCredentials: true, headers: { "Content-Type": "application/json" }}
    //                 ),
    //             ]);
    //             await fetchOptions();
    //             if (userLevelResponse.data.success) {
    //                 setUserLevel(userLevelResponse.data.userLevel);
    //             } else {
    //                 setOpenNoticeModal(true);
    //                 setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário" );
    //             }
    //             if (movimentacoesResponse.data.success) {
    //                 setRowData(movimentacoesResponse.data.lotes);
    //             } else {
    //                 setOpenNoticeModal(true);
    //                 setMessage(movimentacoesResponse.data.message || "Erro ao carregar lotes" );
    //             }
    //         } catch (error) {
    //             console.error(error);
    //             setOpenNoticeModal(true);
    //             setMessage("Erro ao conectar com o servidor");
    //         } finally {
    //             setLoading((prev) => {
    //                 const newLoading = new Set(prev);
    //                 ["movements", "options"].forEach((item) => newLoading.delete(item));
    //                 return newLoading;
    //             });
    //         }
    //     };
    //     fetchData();
    // }, []);

    useEffect(() => {
        fetchOptions();
    }, []);

    //Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "movements"]));
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
				newLoading.delete("movements");
				return newLoading;
			});
		}
	};

    // Função que busca as opções de produto
    const fetchOptions = async () => {
        try {
            setLoading((prev) => new Set([...prev, "options"]));
            const response = await axios.get(
                "http://localhost/BioVerde/back-end/movimentacoes/listar_opcoes.php",
                { withCredentials: true, headers: { Accept: "application/json", "Content-Type": "application/json" }}
            );
            if (response.data.success) {
                setOptions({
                    produtos:            response.data.produtos,
                    unidade_medida:      response.data.unidade_medida,
                    lotes:               response.data.lotes,
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

    /* ----- Definição de colunas e dados que a tabela de movimentações vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "", headerName: "ID", filter: true, width: 100 },
        { 
            headerName: "Data De Movimentação", field: "", width: 200,
            valueGetter: (params) => new Date(params.data.lote_dtColheita).toLocaleDateString("pt-BR")
        },
        { field: "",headerName: "Tipo de Movimentação", filter: true, width: 230 },
        { field: "", headerName: "Produto", filter: true, width: 230 },
        {
            headerName: "Quantidade",
            width: 180,
            valueGetter: (params) => {
                const value = Number(params.data.lote_quantInicial);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {field: "", headerName: "Preço Movimentado", width: 180},
        {field: "", headerName: "Lote", filter: true, width: 150},
        {field: "", headerName: "Responsável", filter: true, width: 180},
        {field: "", headerName: "Observação", width: 300},
    
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

    //OnChange dos campos
    const handleChange = (
        event: 
            | React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement> 
            | SelectEvent
    ) => {
        const { name, value } = event.target;
        if (name in formData) { setFormData({ ...formData, [name]: value }) }
        setErrors((prevErrors) =>
            Object.fromEntries(
                Object.keys(prevErrors).map((key) => [key, false])
            ) as typeof prevErrors
        );
    };

    return(
        <>
        <Tabs.Content value="movements" className="w-full flex flex-col py-2 px-4">
            {/* Botões de Exportar CSV e Novo Lote */}
            <div className="flex justify-between">
                {/* Botão de Abrir Modal de Cadastro de Lote */}
                <div className="flex gap-8">
                    <div className="mt-1 mb-3">
                        <button
                            type="button"
                            className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
                            onClick={() => setOpenAddProductModal(true)}
                        >
                            <PackagePlus  />
                            Adicionar Produto
                        </button>
                    </div>
                    <div className="mt-1 mb-3">
                        <button
                            type="button"
                            className="bg-gray-300 py-2.5 px-4 font-semibold rounded text-black cursor-pointer hover:bg-gray-400 flex sombra-botao2 place-content-center gap-2"
                            // onClick={() => {setOpenRegisterModal(true); clearFormData()}}
                        >
                            <PackageMinus />
                            Retirar Produto
                        </button>
                    </div>
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
                    localeText={agGridTranslation}
                    pagination
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 25, 50, 100]}
                    loading={loading.has("movements")}
                    overlayLoadingTemplate={overlayLoadingTemplate}
                    overlayNoRowsTemplate={overlayNoRowsTemplate}
                />
            </div>
        </Tabs.Content>

        {/* Modal de Cadastro de Lotes */}
        <Modal
            openModal={openAddProductModal}
            setOpenModal={setOpenAddProductModal}
            modalTitle="Adicionar Entrada de Produto"
            withXButton
            isRegister
            registerButtonText="Adicionar Entrada"
            modalWidth="w-1/2"
            isLoading={loading.has("add")}
            // onSubmit={handleRegister}
        >
            <div className="flex flex-col gap-4">
                <SmartField
                    fieldName="produto"
                    fieldText="Produto"
                    isSelect
                    error={errors.product ? "*" : undefined}
                    placeholder="Selecione o produto"
                    isLoading={loading.has("options")}
                    value={formData.produto}
                    onChangeSelect={handleChange}
                    options={options?.produtos.map((produto) => ({
                        label: produto.produto_nome,
                        value: String(produto.produto_id),
                    }))}
                />

                <SmartField
                    fieldName="lote"
                    fieldText="Lote"
                    isSelect
                    isLoading={loading.has("options")}
                    error={errors.batch ? "*" : undefined}
                    value={formData.lote}
                    placeholder="Selecione o lote"
                    onChangeSelect={handleChange}
                    options={options?.lotes.map((lote) => ({
                        label: lote.lote_codigo,
                        value: String(lote.lote_id),
                    }))}
                />

                <div className="flex gap-10">
                    <SmartField
                    fieldName="quantidade"
                    fieldText="Quantidade"
                    error={errors.quantity ? "*" : undefined}
                    fieldClassname="flex flex-col flex-1"
                    type="number"
                    value={formData.quantidade}
                    onChange={handleChange}
                    placeholder="Quantidade"
                    />
                    <SmartField
                    fieldName="unidade"
                    fieldText="Unidade de Medida"
                    isSelect
                    fieldClassname="flex flex-col flex-1"
                    isLoading={loading.has("options")}
                    error={errors.unit ? "*" : undefined}
                    value={formData.unidade}
                    placeholder="Selecione"
                    onChangeSelect={handleChange}
                    options={options?.unidade_medida.map((unidade) => ({
                        label: unidade.uni_nome,
                        value: String(unidade.uni_id),
                    }))}
                    />
                </div>

                <SmartField
                    fieldName="obs"
                    fieldText="Observações"
                    rows={2}
                    isTextArea
                    placeholder="Adicione informações sobre a entrada do produto"
                    value={formData.obs}
                    onChange={handleChange}
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
        </>
    );
}