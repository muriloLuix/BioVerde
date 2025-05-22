import {useState, useRef, useEffect} from "react";
import axios from "axios";
import {Tabs} from "radix-ui";
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ColDef} from "ag-grid-community";

import {Modal, SmartField, NoticeModal} from "../../shared";
import {Batch, JobPosition, Product, SelectEvent} from "../../utils/types";

interface BatchForm {
    lote_id: 0;
    lote_dtFabricacao: string;
    lote_dtExpiracao: string;
    lote_quantidade: string;
    lote_obs: string;
    produto_id: number;
    produto_nome: string;
    uni_id: number;
}

interface BatchOptions {
    produtos: Product[];
}

const Batchs = () => {
    const [activeTab, setActiveTab] = useState("list");
    const [handleModal, setHandleModal] = useState(false);
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [options, setOptions] = useState<BatchOptions>();
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState<BatchForm>({
        lote_id: 0,
        lote_dtFabricacao: "",
        lote_dtExpiracao: "",
        lote_quantidade: "",
        lote_obs: "",
        produto_id: 0,
        produto_nome: "",
        uni_id: 0,
    });

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

    // Carrega opções ao montar o componente
    useEffect(() => {
        fetchOptions();
        fetchLotes();
    }, []);


    // Definição de colunas e dados estáticos (você pode também buscar do backend aqui)
    const gridRef = useRef<AgGridReact>(null);
    const [columnDefs] = useState<ColDef[]>([
        { field: "lote_id", headerName: "Id", filter: true, width: 100 },
        { field: "produto_nome", headerName: "Produtos", filter: true, width: 230 },
        { field: "lote_quantidade", headerName: "Quantidade", width: 150 },
        { field: "lote_dtFabricacao", headerName: "Data De Fabricação", width: 200 },
        { field: "lote_dtExpiracao", headerName: "Data De Validade", width: 200 },
        { field: "lote_obs", headerName: "Observação", width: 300 },
    ]);

    const [rowData, setRowData] = useState<Batch[]>([]);

    const fetchLotes = async () => {
        try {

            setLoading((prev) => new Set([...prev, "lotes"]));

            const response = await axios.get(
                "http://localhost/BioVerde/back-end/lotes/listar_lotes.php",
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (response.data.success) {
                const lotesConvertidos = response.data.lotes.map((lote: BatchForm) => ({
                    id: lote.lote_id,
                    produtos: lote.produto_nome,
                    quantidade: lote.lote_quantidade,
                    dataDeFabricacao: lote.lote_dtFabricacao,
                    dataDeValidade: lote.lote_dtExpiracao,
                    observacao: lote.lote_obs,
                }));

                setRowData(lotesConvertidos);
            } else {
                setOpenNoticeModal(true);
                setMessage(response.data.message || "Erro ao carregar lotes");
            }
        } catch (error) {
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");

            if (axios.isAxiosError(error)) {
                console.error("Erro na requisição (lotes):", error.response?.data || error.message);
            } else {
                console.error("Erro desconhecido (lotes):", error);
            }
        } finally {
            setLoading((prev) => {
                const newLoading = new Set(prev);
                newLoading.delete("lotes");
                return newLoading;
            });
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
                                options={
                                    Array.isArray(options?.produtos)
                                        ? options.produtos.map((p) => ({
                                            value: p.produto_id.toString(),
                                            label: p.produto_nome,
                                        }))
                                        : []
                                }

                                value={formData.produto_nome}
                                onChangeSelect={handleChange}
                            />
                            <SmartField
                                fieldName="quantidade"
                                type="number"
                                fieldText="Quantidade"
                                value={formData.quantidade}
                                onChange={handleChange}
                            />
                            <SmartField
                                fieldName="fabricacao"
                                fieldText="Data de fabricação"
                                type="date"
                                value={formData.fabricacao}
                                onChange={handleChange}
                            />
                            <SmartField
                                fieldName="validade"
                                fieldText="Data de validade"
                                type="date"
                                value={formData.validade}
                                onChange={handleChange}
                            />
                            <SmartField
                                fieldName="observacoes"
                                fieldText="Observações"
                                isTextArea
                                placeholder="Adicione informações sobre o lote"
                                value={formData.observacoes}
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
