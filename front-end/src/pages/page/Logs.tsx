import React, { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ValueFormatterParams } from "ag-grid-community";
import axios from "axios";
import { Tabs } from "radix-ui";
import { useNavigate } from "react-router-dom";
import { NoticeModal } from "../../shared";
import {
    Eye
} from "lucide-react";

interface Log {
    log_id: number;
    log_user_nome: string;
    log_datahora: string;
    log_pag_id: string;
    log_url: string;
    log_acao: string;
    log_conteudo: string;
}

function formatDateBR(value?: string): string {
    if (!value) return "";
    const d = new Date(value.replace(" ", "T"));
    return d.toLocaleString("pt-BR", {
        day:   "2-digit",
        month: "2-digit",
        year:  "numeric",
        hour:   "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

export default function Orders() {
    const [activeTab, setActiveTab] = useState("list");
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [rowData, setRowData] = useState<Log[]>([]);
    const [openNoticeModal, setOpenNoticeModal] = useState(false);
    const [message, setMessage] = useState("");
    const gridRef = useRef<AgGridReact>(null);
    const navigate = useNavigate();

    const columnDefs: ColDef[] = [
        { field: "log_id",        headerName: "Id",        filter: true, width: 100 },
        { field: "log_user_nome", headerName: "Usuário",   filter: true, width: 230 },
        {
            field: "log_datahora",
            headerName: "Data/hora",
            width: 170,
            valueFormatter: (params: ValueFormatterParams) =>
                formatDateBR(params.value as string),
        },
        { field: "log_pag_id",    headerName: "Página",    width: 200 },
        { field: "log_url",       headerName: "URL",       width: 200 },
        { field: "log_acao",      headerName: "Ação",      width: 300 },
        { field: "log_conteudo",  headerName: "Conteúdo",  width: 300 },
        {
            headerName: "Ações",
            width: 100,
            cellRendererFramework: (params) => (
                <Eye
                    size={18}
                    className="cursor-pointer text-verdePigmento"
                    onClick={() => {
                        // Exemplo: console.log(params.data);
                        // aqui você pode abrir um modal ou redirecionar
                        console.log("Visualizar log:", params.data);
                    }}
                />
            ),
        },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const resp = await axios.get(
                    "http://localhost/BioVerde/back-end/auth/check_session.php",
                    { withCredentials: true }
                );
                if (!resp.data.loggedIn) {
                    setMessage("Sessão expirada. Por favor, faça login novamente.");
                    setOpenNoticeModal(true);
                    setTimeout(() => navigate("/"), 1900);
                }
            } catch {
                setMessage("Sessão expirada. Por favor, faça login novamente.");
                setOpenNoticeModal(true);
                setTimeout(() => navigate("/"), 1900);
            }
        };
        checkAuth();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(prev => new Set([...prev, "logs"]));
            const resp = await axios.get(
                "http://localhost/BioVerde/back-end/log/listar_log.php",
                { withCredentials: true, headers: { Accept: "application/json" } }
            );
            if (resp.data.success) {
                setRowData(resp.data.logs);
            } else {
                setOpenNoticeModal(true);
                setMessage(resp.data.message || "Erro ao carregar logs");
            }
        } catch (err) {
            console.error(err);
            setOpenNoticeModal(true);
            setMessage("Erro ao conectar com o servidor");
        } finally {
            setLoading(prev => {
                const next = new Set(prev);
                next.delete("logs");
                return next;
            });
        }
    };

    return (
        <div className="h-screen w-full flex-1 p-6 pl-[280px]">
            <div className="h-10 w-full flex items-center justify-center">
                <span className="text-4xl font-semibold text-center">Logs</span>
            </div>

            <Tabs.Root
                defaultValue="list"
                className="h-full w-full"
                onValueChange={setActiveTab}
            >
                <Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
                    <Tabs.Trigger
                        value="list"
                        className={`relative px-4 py-2 text-verdePigmento text-lg font-semibold cursor-pointer ${
                            activeTab === "list" ? "select animation-tab" : ""
                        }`}
                    >
                        Lista de Logs
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content
                    value="list"
                    className="h-full w-full flex flex-col py-2 px-4"
                >
                    <AgGridReact
                        modules={[AllCommunityModule]}
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        pagination
                        paginationPageSize={20}
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
}
