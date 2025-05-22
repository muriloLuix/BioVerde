import {useState, useRef, useEffect} from "react";
import axios from "axios";
import {Tabs} from "radix-ui";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ColDef} from "ag-grid-community";

import {Modal, SmartField, NoticeModal} from "../../shared";
import {Batch, Product, Unit, SelectEvent} from "../../utils/types";
import { overlayLoadingTemplate, overlayNoRowsTemplate } from "../../utils/gridOverlays";

interface BatchOptions {
    produtos: Product[];
    unidade_medida: Unit[];
}

const Batchs = () => {
    const [activeTab, setActiveTab] = useState("list");
    const [handleModal, setHandleModal] = useState(false);
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<BatchOptions>();
    // const [userLevel, setUserLevel] = useState("");
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        lote_id: 0,
        dtFabricacao: "",
        dtExpiracao: "",
        quantidade: "",
        obs: "",
        produto_nome: "",
        uni_nome: "",
    });

    // Definição de colunas e dados estáticos (você pode também buscar do backend aqui)
    const gridRef = useRef<AgGridReact>(null);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_id", headerName: "ID", filter: true, width: 100 },
        { field: "produto_nome", headerName: "Produto", filter: true, width: 230 },
        { field: "uni_sigla", headerName: "Unid. de Medida", filter: true, width: 170 },
        { field: "quantidade", headerName: "Quantidade", width: 150 },
        { field: "dtFabricacao", headerName: "Data De Fabricação", width: 200 },
        { field: "dtExpiracao", headerName: "Data De Validade", width: 200 },
        { field: "obs", headerName: "Observação", width: 300 },
    ]);

    const [rowData, setRowData] = useState<Batch[]>([]);

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
					// setUserLevel(userLevelResponse.data.userLevel);
				} else {
					setOpenNoticeModal(true);
					setMessage(
						userLevelResponse.data.message ||
							"Erro ao carregar nível do usuário"
					);
				}

				if (lotesResponse.data.success) {
					const lotesConvertidos = lotesResponse.data.lotes.map((lote: Batch) => ({
                        lote_id: lote.lote_id,
                        produto_nome: lote.produto_nome,
                        uni_sigla: lote.uni_sigla,
                        quantidade: lote.lote_quantidade,
                        dtFabricacao: lote.lote_dtFabricacao,
                        dtExpiracao: lote.lote_dtExpiracao,
                        obs: lote.lote_obs,
                    }));
                    setRowData(lotesConvertidos);
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
                className="h-full w-full"
                onValueChange={(v) => setActiveTab(v)}
            >
                <Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
                    <Tabs.Trigger
                        value="list"
                        className={`relative px-4 py-2 text-verdePigmento text-lg font-semibold cursor-pointer ${
                            activeTab === "list" ? "select animation-tab" : ""
                        }`}
                    >
                        Lista
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content
                    value="list"
                    className="h-full w-full flex flex-col py-2 px-4"
                >
                    <div className="h-1/12 w-full flex items-center justify-end">
                        <Modal
                            openModal={handleModal}
                            setOpenModal={setHandleModal}
                            buttonClassname="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg cursor-pointer"
                            buttonName="+ Novo lote"
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
								// error={errors.supplier ? "*" : undefined}
								// inputWidth="w-[300px]"
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
                                value={formData.dtFabricacao}
                                onChange={handleChange}
                            />
                            <SmartField
                                fieldName="dtExpiracao"
                                fieldText="Data de validade"
                                type="date"
                                value={formData.dtExpiracao}
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
                    </div>

                    <AgGridReact
                        modules={[AllCommunityModule]}
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 25, 50, 100]}
                        loading={loading.has("batches")}
                        overlayLoadingTemplate={overlayLoadingTemplate}
                        overlayNoRowsTemplate={overlayNoRowsTemplate}
                    />
                </Tabs.Content>
            </Tabs.Root>

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
