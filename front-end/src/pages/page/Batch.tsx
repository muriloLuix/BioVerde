import {useState, useRef, useEffect} from "react";
import axios from "axios";
import {Tabs} from "radix-ui";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ICellRendererParams, ColDef, themeQuartz } from "ag-grid-community";
import { Pencil, Trash2, Plus } from 'lucide-react';
import { agGridTranslation } from "../../utils/agGridTranslation";


import {Modal, SmartField, NoticeModal} from "../../shared";
import {Batch, Product, Unit, Classification, Storage, ProductType, Supplier, SelectEvent} from "../../utils/types";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";

interface BatchOptions {
    produtos: Product[];
    unidade_medida: Unit[];
    tipos: ProductType[];
    fornecedores: Supplier[];
    classificacoes: Classification[];
    locaisArmazenamento: Storage[];
}

const Batchs = () => {
    const [activeTab, setActiveTab] = useState("list");
    const [openRegisterModal, setOpenRegisterModal] = useState(false);
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<BatchOptions>();
    const [userLevel, setUserLevel] = useState("");
    const [successMsg, setSuccessMsg] = useState(false);
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({
		product: false,
		supplier: false,
		unit: false,
		type: false,
		classification: false,
		storage: false,
		quantity: false,
		harvestDate: false,
		expirationDate: false,
	});
    const [formData, setFormData] = useState({
        lote_codigo: "",
        produto: "",
        fornecedor: "",
        dtColheita: "",
        quantidade: 0,
        unidade: "",
        tipo: "",
        dtValidade: "",
        classificacao: "",
        localArmazenado: "",
        obs: "",
    });

    // Definição de colunas e dados estáticos (você pode também buscar do backend aqui)
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Batch[]>([]);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_codigo", headerName: "ID", filter: true, width: 180 },
        { field: "produto_nome", headerName: "Produto", filter: true, width: 250 },
        { field: "fornecedor", headerName: "Fornecedor", filter: true, width: 230 },
        { field: "dtColheita", headerName: "Data De Colheita", width: 180 },
        { field: "quantInicial", headerName: "Quantidade Inicial", width: 180 },
        { field: "quantAtual", headerName: "Quantidade Atual", width: 180 },
        { field: "tipo", headerName: "Tipo", width: 150 },
        { field: "dtValidade", headerName: "Data De Validade", width: 180 },
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
                    title="Editar Lote"
                    // onClick={() => handleEdit(params.data)}
                >
                    <Pencil size={18} />
                </button>
                {params.context.userLevel === "Administrador" && (
                    <button
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        title="Excluir Lote"
                        // onClick={() => handleDelete(params.data)}
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
                        lote_codigo:     lote.lote_codigo,
                        produto_nome:    lote.produto_nome,
                        fornecedor:      lote.fornecedor_nome_ou_empresa,
                        dtColheita:      new Date(lote.lote_dtFabricacao).toLocaleDateString("pt-BR"),
                        quantInicial:    parseFloat(lote.lote_quantInicial) + lote.uni_sigla,
                        quantAtual:      parseFloat(lote.lote_quantAtual) + lote.uni_sigla,
                        tipo:            lote.tproduto_nome,
                        dtValidade:      new Date(lote.lote_dtExpiracao).toLocaleDateString("pt-BR"),
                        classificacao:   lote.classificacao_nome,
                        localArmazenado: lote.localArmazenamento_nome,
                        obs:             lote.lote_obs,
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

    console.log(formData)

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
                    fornecedores: response.data.fornecedores,
                    classificacoes: response.data.classificacao,
                    locaisArmazenamento: response.data.localArmazenado,
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

    //Submit de cadastrar produtos
	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validações
		const errors = {
            product: !formData.produto,
            supplier: !formData.fornecedor,
            unit: !formData.unidade,
            type: !formData.tipo,
            classification: !formData.classificacao,
            storage: !formData.localArmazenado,
            quantity: !formData.quantidade,
            harvestDate: !formData.dtColheita,
            expirationDate: !formData.dtValidade,
		};
		setErrors(errors);

		// Se algum erro for true, interrompe a execução
		if (Object.values(errors).some((error) => error)) {
			return;
		}

		setLoading((prev) => new Set([...prev, "register"]));
		setSuccessMsg(false);

		// Log formData for debugging
		console.log("Dados enviados no formData:", formData);

		try {
			const response = await axios.post(
				"http://localhost/BioVerde/back-end/lotes/cadastrar_lotes.php",
				formData,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);

			console.log("Resposta do back-end:", response.data);

			if (response.data.success) {
				// await refreshData();
				setSuccessMsg(true);
				setMessage("Lote cadastrado com sucesso!");
				clearFormData();
			} else {
				setMessage(response.data.message ?? "Erro ao cadastrar lote");
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
				newLoading.delete("register");
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

        setErrors(
			(prevErrors) =>
				Object.fromEntries(
					Object.keys(prevErrors).map((key) => [key, false])
				) as typeof prevErrors
		);
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
                                onClick={() => {setOpenRegisterModal(true); clearFormData()}}
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
                        options={
                            options?.produtos.map((produto) => ({
                                label: produto.produto_nome,
                                value: String(produto.produto_id),
                            }))
                        }
                    />
                    <SmartField
                        fieldName="fornecedor"
                        fieldText="Fornecedor"
                        isSelect
                        isLoading={loading.has("options")}
                        error={errors.supplier ? "*" : undefined}
                        value={formData.fornecedor}
                        placeholder="Selecione o fornecedor"
                        onChangeSelect={handleChange}
                        options={
                            options?.fornecedores.map((fornecedor) => ({
                                label: fornecedor.fornecedor_nome_ou_empresa,
                                value: String(fornecedor.fornecedor_id),
                            }))
                        }
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
                            placeholder="Quantidade no lote"
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
                            options={
                                options?.unidade_medida.map((unidade) => ({
                                    label: unidade.uni_nome,
                                    value: String(unidade.uni_id),
                                }))
                            }
                        />
                    </div>
                    <div className="flex gap-10">
                        <SmartField
                            type="date"
                            fieldName="dtColheita"
                            error={errors.harvestDate ? "*" : undefined}
                            fieldText="Data de Colheita"
                            value={formData.dtColheita}
                            onChange={handleChange}
                            fieldClassname="flex flex-col flex-1"
                        />
                        <SmartField
                            fieldName="tipo"
                            fieldText="Tipo"
                            isSelect
                            isLoading={loading.has("options")}
                            error={errors.type ? "*" : undefined}
                            fieldClassname="flex flex-col flex-1"
                            value={formData.tipo}
                            placeholder="Selecione"
                            onChangeSelect={handleChange}
                            options={
                                options?.tipos.map((tipo) => ({
                                    label: tipo.tproduto_nome,
                                    value: String(tipo.tproduto_id),
                                }))
                            }
                        />
                    </div>
                    <div className="flex gap-10">
                        <SmartField
                            type="date"
                            error={errors.expirationDate ? "*" : undefined}
                            fieldName="dtValidade"
                            fieldText="Data de Validade"
                            value={formData.dtValidade}
                            onChange={handleChange}
                            fieldClassname="flex flex-col flex-1"
                        />
                        <SmartField
                            fieldName="classificacao"
                            fieldText="Classificação"
                            isSelect
                            isLoading={loading.has("options")}
                            error={errors.classification ? "*" : undefined}
                            fieldClassname="flex flex-col flex-1"
                            value={formData.classificacao}
                            placeholder="Selecione"
                            onChangeSelect={handleChange}
                            options={
                                options?.classificacoes.map((classificacao) => ({
                                    label: classificacao.classificacao_nome,
                                    value: String(classificacao.classificacao_id),
                                }))
                            }
                        />
                    </div>
                    <SmartField
                        fieldName="localArmazenado"
                        fieldText="Local de Armazenamento"
                        isSelect
                        isLoading={loading.has("options")}
                        error={errors.storage ? "*" : undefined}
                        value={formData.localArmazenado}
                        placeholder="Selecione o local"
                        onChangeSelect={handleChange}
                        options={
                            options?.locaisArmazenamento.map((locais) => ({
                                label: locais.localArmazenamento_nome,
                                value: String(locais.localArmazenamento_id),
                            }))
                        }
                    />
                    <SmartField
                        fieldName="obs"
                        fieldText="Observações"
                        rows={2}
                        isTextArea
                        placeholder="Adicione informações sobre o lote"
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

        </div>
    );
};

export default Batchs;
