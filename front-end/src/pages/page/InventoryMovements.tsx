import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { checkAuth } from "../../utils/checkAuth";
import { useNavigate } from "react-router-dom";
import { Tabs } from "radix-ui";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, themeQuartz } from "ag-grid-community";
import { agGridTranslation } from "../../utils/agGridTranslation";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";
import { PackagePlus, PackageMinus, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { Modal, NoticeModal, SmartField } from "../../shared";
import { SelectEvent, Movements, FormDataMovements } from "../../utils/types";
// import { BatchRegister, BatchUpdate, BatchDelete } from "../pageComponents";
import useCheckAccessLevel from "../../hooks/useCheckAccessLevel";

export default function InventoryMovements() {
    const [openStockInModal, setOpenStockInModal] = useState(false);
    const [openStockOutModal, setOpenStockOutModal] = useState(false);
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<Movements>();
    const [formData, setFormData] = useState<FormDataMovements>({
        produto: "",
        motivo: "",
        lote: "",
        quantidade: 0,
        unidade: "",
        pedido: "",
        destino: "",
        obs: "",
    });
    const [errors, setErrors] = useState({
        product: false,
        batch: false,
        quantity: false,
        destination: false,
        reason: false,
        order: false,
    });

    /* ----- useEffects e Requisições via Axios ----- */

    //Checa a autenticação do usuário, se for false expulsa o usuário da sessão
    const navigate = useNavigate();
    useEffect(() => {
        checkAuth({ navigate, setMessage, setOpenNoticeModal });
    }, [navigate]);

    console.log(formData)

    //Carrega a lista os lotes e as opções nos selects ao renderizar a página
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading((prev) => new Set([...prev, "movements", "options"]));
                const [movimentacoesResponse] = await Promise.all([
                    axios.get(
                        "http://localhost/BioVerde/back-end/movimentacoes/listar_movimentacoes.php",
                        { withCredentials: true, headers: { Accept: "application/json" }}
                    ),
                    // axios.get(
                    //     "http://localhost/BioVerde/back-end/auth/usuario_logado.php",
                    //     { withCredentials: true, headers: { "Content-Type": "application/json" }}
                    // ),
                ]);
                await fetchOptions();
                // if (userLevelResponse.data.success) {
                //     setUserLevel(userLevelResponse.data.userLevel);
                // } else {
                //     setOpenNoticeModal(true);
                //     setMessage(userLevelResponse.data.message || "Erro ao carregar nível do usuário" );
                // }
                if (movimentacoesResponse.data.success) {
                    setRowData(movimentacoesResponse.data.movimentacoes);
                } else {
                    setOpenNoticeModal(true);
                    setMessage(movimentacoesResponse.data.message || "Erro ao carregar lotes" );
                }
            } catch (error) {
                console.error(error);
                setOpenNoticeModal(true);
                setMessage("Erro ao conectar com o servidor");
            } finally {
                setLoading((prev) => {
                    const newLoading = new Set(prev);
                    ["movements", "options"].forEach((item) => newLoading.delete(item));
                    return newLoading;
                });
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetchOptions();
    }, []);

    //Função para Atualizar a Tabela após ação
	const refreshData = async () => {
		try {
			setLoading((prev) => new Set([...prev, "movements"]));
			const movimentacoesResponse = await axios.get(
				"http://localhost/BioVerde/back-end/movimentacoes/listar_movimentacoes.php",
				{ withCredentials: true }
			);
			if (movimentacoesResponse.data.success) {
                setRowData(movimentacoesResponse.data.movimentacoes);
			} else {
                setMessage(movimentacoesResponse.data.message || "Erro ao carregar dados");
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

    // Função que busca as opções 
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
                    motivos:             response.data.motivos,
                    pedidos:             response.data.pedidos,
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

    /* ----- Função para Efetuar entrada de produtos ----- */

    const lotesFiltrados = options?.lotes.filter(
        (lote) => String(lote.produto_id) === formData.produto
    );

	const handleStockInProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		// Validações
		const errors = {
            product:        !formData.produto,
            batch:          !formData.lote,
            quantity:       !formData.quantidade,
            destination:    haveDestination ? !formData.destino : false,
            reason:         !formData.motivo,
            order:          isSaleCliente ? !formData.pedido : false,  
		};
		setErrors(errors);
		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) { return; }

		setLoading((prev) => new Set([...prev, "stockIn"]));
		
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/movimentacoes/cadastrar_entrada.php",
				formData,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
                setOpenStockInModal(false);
				setMessage(`Entrada Efetuada com Sucesso!`);
				clearFormData();
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message ?? "Erro ao cadastrar Entrada");
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
				newLoading.delete("stockIn");
				return newLoading;
			});
		}
	};

    /* ----- Função para Efetuar saída de produtos ----- */
    const isSaleCliente = formData.motivo === "9";
    const [haveDestination, setHaveDestination] = useState(false);

    const handleStockOutProduct = async (e: React.FormEvent) => {
		e.preventDefault();
		// Validações
		const errors = {
            product:        !formData.produto,
            batch:          !formData.lote,
            quantity:       !formData.quantidade,
            destination:    haveDestination ? !formData.destino : false,
            reason:         !formData.motivo,
            order:          isSaleCliente ? !formData.pedido : false,  
		};
		setErrors(errors);
		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) { return; }

		setLoading((prev) => new Set([...prev, "stockOut"]));
		
		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/movimentacoes/cadastrar_saida.php",
				formData,
				{ headers: { "Content-Type": "application/json" }, withCredentials: true }
			);
			console.log("Resposta do back-end:", response.data);
			if (response.data.success) {
				await refreshData();
				setSuccessMsg(true);
                setOpenStockOutModal(false);
				setMessage(`Saída Efetuada com Sucesso!`);
				clearFormData();
			} else {
                setSuccessMsg(false);
				setMessage(response.data.message ?? "Erro ao cadastrar Entrada");
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
				newLoading.delete("stockOut");
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
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectEvent
    ) => {
        const { name, value } = event.target;

        let newFormData = { ...formData, [name]: value };
        if (name === "produto" && value === "") {
            newFormData.lote = "";
        }
        if (name === "lote") {
            const loteSelecionado = options?.lotes.find(
                (lote) => String(lote.lote_id) === value
            );
            if (loteSelecionado) {
                newFormData = {
                    ...newFormData,
                    unidade: String(loteSelecionado.uni_id), 
                };
            }
        }
        setFormData(newFormData);

        setErrors((prevErrors) =>
            Object.fromEntries(Object.keys(prevErrors).map((key) => [key, false])) as typeof prevErrors
        );
    };

    
    //Limpar formData
    const clearFormData = () => {
        setFormData(
            Object.fromEntries(
                Object.entries(formData).map(([key, value]) => {
                    return [key, typeof value === "number" ? 0 : ""];
                })
            ) as unknown as FormDataMovements
        );
    };

    //Gerar Relatório
    const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
	const [relatorioContent, setRelatorioContent] = useState<string>("");
	const gerarRelatorio = async () => {
		setLoading((prev) => new Set([...prev, "reports"]));
		try {
			const response = await axios.get(
				"http://localhost/BioVerde/back-end/rel/mov.rel.php",
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

    /* ----- Definição de colunas e dados que a tabela de movimentações vai receber ----- */

    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "mov_id", headerName: "ID", filter: true, width: 100 },
        { 
            headerName: "Data De Movimentação", field: "mov_data", filter: true, width: 220,
            valueGetter: (params) => new Date(params.data.mov_data).toLocaleDateString("pt-BR")
        },
        { field: "mov_tipo_label",headerName: "Tipo de Movimentação", filter: true, width: 230 },
        { field: "produto_nome", headerName: "Produto", filter: true, width: 230 },
        {
            headerName: "Quantidade Movimentada",
            width: 210,
            valueGetter: (params) => {
                const value = Number(params.data.mov_quantidade);
                return `${Number.isInteger(value) ? value : value.toFixed(2)}${params.data.uni_sigla}`;
            }
        },
        {
            field: "preco_movimentado", 
            headerName: "Preço Movimentado", 
            width: 180,
            valueFormatter: (params) => {
                return `R$ ${Number(params.value).toFixed(2).replace('.', ',')}`;
            }
        },
        {field: "lote_codigo", headerName: "Lote", filter: true, width: 170},
        {
            headerName: "Destino",
            field: "localArmazenamento_nome",
            filter: true,
            width: 180,
            valueGetter: (params) => {
                return params.data.mov_tipo === "entrada"
                ? params.data.localArmazenamento_nome
                : params.data.destino;
            }
        },
        {field: "pedido_id", headerName: "Nº do Pedido", filter: true, width: 150},
        {field: "user_nome", headerName: "Responsável", filter: true, width: 180},
        {field: "mov_obs", headerName: "Observação", width: 300},
    
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

    return(
        <>
        <Tabs.Content value="movements" className="w-full flex flex-col py-2 px-4">
            {/* Botões de Exportar CSV e Novo Lote */}
            <div className="flex justify-between">
                {/* Botão de Abrir Modal de Cadastro de Entrada e Saída de Produtos */}
                <div className="flex items-center gap-5 mt-1 mb-3">
                    <button
                        type="button"
                        className="bg-verdePigmento py-2.5 px-4 font-semibold rounded text-white cursor-pointer hover:bg-verdeGrama flex sombra-botao place-content-center gap-2"
                        onClick={() => {
                            setOpenStockInModal(true); 
                            setHaveDestination(false);
                            clearFormData();
                        }}
                    >
                        <PackagePlus  />
                        Adicionar Produto
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 py-2.5 px-4 font-semibold rounded text-black cursor-pointer hover:bg-gray-400 flex sombra-botao2 place-content-center gap-2"
                        onClick={() => {
                            setOpenStockOutModal(true); 
                            setHaveDestination(true);
                            clearFormData();
                        }}
                    >
                        <PackageMinus />
                        Retirar Produto
                    </button>
                </div>
                {/* Botão de exportar para CSV e PDF dos dados da tabela */}
                <div className="flex items-center gap-5 mt-1 mb-3">
                    <button
                        onClick={gerarRelatorio}
                        className="bg-red-700 py-2.5 px-4 w-[165.16px] font-semibold rounded text-white cursor-pointer hover:bg-red-800 flex sombra-botao place-content-center gap-2"
                    >
                        {loading.has("reports") ? (
                            <Loader2 className="animate-spin h-6 w-6" />
                        ) : (
                            <>
                                <FileText />
                                Exportar PDF
                            </>
                        )}
                    </button>
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

        {/* Modal de Efetuar Entrada de produto */}
        <Modal
            openModal={openStockInModal}
            setOpenModal={setOpenStockInModal}
            modalTitle="Efetuar Entrada de Produto"
            withXButton
            isRegister
            registerButtonText="Efetuar Entrada"
            modalWidth="w-1/2"
            isLoading={loading.has("stockIn")}
            onSubmit={handleStockInProduct}
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
                    noOptionsMessage={() => "Nenhum Lote encontrado com o Produto selecionado"}
                    placeholder="Selecione o lote"
                    onChangeSelect={handleChange}
                    options={lotesFiltrados?.map((lote) => ({
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
                    {formData.lote && (
                        <SmartField
                            fieldName="unidade"
                            fieldText="Unidade de Medida"
                            isDisable
                            inputWidth="w-[200px]"
                            placeholder="Unidade de Medida"
                            readOnly
                            value={
                                options?.unidade_medida.find(
                                    (u) => String(u.uni_id) === formData.unidade
                                )?.uni_nome || ""
                            }
                        />
                    )}
                </div>

                <SmartField
                    fieldName="motivo"
                    fieldText="Motivo da Entrada"
                    isSelect
                    fieldClassname="flex flex-col flex-1"
                    isLoading={loading.has("options")}
                    error={errors.reason ? "*" : undefined}
                    value={formData.motivo}
                    placeholder="Selecione o Motivo"
                    onChangeSelect={handleChange}
                    options={options?.motivos
                        .filter((motivo) => motivo.mov_tipo === "entrada")
                        .map((motivo) => ({
                            label: motivo.motivo,
                            value: String(motivo.motivo_id),
                        }))
                    }
                />

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

         {/* Modal de Efetuar Saída de produto */}
        <Modal
            openModal={openStockOutModal}
            setOpenModal={setOpenStockOutModal}
            modalTitle="Efetuar Saída de Produto"
            withXButton
            isRegister
            registerButtonText="Efetuar Saída"
            modalWidth="w-1/2"
            isLoading={loading.has("stockOut")}
            onSubmit={handleStockOutProduct}
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
                    noOptionsMessage={() => "Nenhum Lote encontrado com o Produto selecionado"}
                    onChangeSelect={handleChange}
                    options={lotesFiltrados?.map((lote) => ({
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
                    {formData.lote && (
                        <SmartField
                            fieldName="unidade"
                            fieldText="Unidade de Medida"
                            isDisable
                            inputWidth="w-[200px]"
                            placeholder="Unidade de Medida"
                            readOnly
                            value={
                                options?.unidade_medida.find(
                                    (u) => String(u.uni_id) === formData.unidade
                                )?.uni_nome || ""
                            }
                        />
                    )}
                </div>
                
                <div className="flex gap-10">
                    <SmartField
                        fieldName="motivo"
                        fieldText="Motivo da Saída"
                        isSelect
                        fieldClassname="flex flex-col flex-1"
                        isLoading={loading.has("options")}
                        error={errors.reason ? "*" : undefined}
                        value={formData.motivo}
                        placeholder="Selecione o Motivo"
                        onChangeSelect={handleChange}
                        options={options?.motivos
                            .filter((motivo) => motivo.mov_tipo === "saida")
                            .map((motivo) => ({
                                label: motivo.motivo,
                                value: String(motivo.motivo_id),
                            }))
                        }
                    />
                    {isSaleCliente && (
                        <SmartField
                            fieldName="pedido"
                            fieldText="Nº do Pedido"
                            isSelect
                            inputWidth="w-[180px]"
                            isLoading={loading.has("options")}
                            error={errors.order ? "*" : undefined}
                            value={formData.pedido}
                            placeholder="Selecione"
                            onChangeSelect={handleChange}
                            options={options?.pedidos.map((pedido) => ({
                                label: String(pedido.pedido_id),
                                value: String(pedido.pedido_id),
                            }))}
                        />
                    ) }
                </div>

                <SmartField
                    fieldName="destino"
                    fieldText="Destino do Produto"
                    error={errors.destination ? "*" : undefined}
                    placeholder="Digite o Destino do Produto"
                    value={formData.destino}
                    onChange={handleChange}
                />

                <SmartField
                    fieldName="obs"
                    fieldText="Observações"
                    rows={2}
                    isTextArea
                    placeholder="Adicione informações sobre a saída do produto"
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

        {/* Modal de Relatório */}
        {relatorioModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Relatório de Movimentações</h2>
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
                                title="Relatório de Movimentações"
                            />
                        ) : (
                            <p>Carregando relatório...</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-4">
                        <a
                            href={relatorioContent}
                            download="relatorio_movimentacoes.pdf"
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
        </>
    );
}