import { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
	AllCommunityModule,
	ColDef,
	themeQuartz,
	ValueFormatterParams,
	ICellRendererParams,
} from "ag-grid-community";
import axios from "axios";
import { Tabs } from "radix-ui";
import { useNavigate } from "react-router-dom";
import { Modal, NoticeModal } from "../../shared";
import { Eye, FileSpreadsheet } from "lucide-react";
import { Logs } from "../../utils/types.ts";
import { agGridTranslation } from "../../utils/agGridTranslation.ts";
import {
	overlayLoadingTemplate,
	overlayNoRowsTemplate,
} from "../../utils/gridOverlays.ts";

function formatDateBR(value?: string): string {
	if (!value) return "";
	const d = new Date(value.replace(" ", "T"));
	return d.toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export default function Orders() {
	const [activeTab, setActiveTab] = useState("list");
	const [loading, setLoading] = useState<Set<string>>(new Set());
	const [rowData, setRowData] = useState<Logs[]>([]);
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [openLogModal, setOpenModal] = useState(false);
	const [message, setMessage] = useState("");
	const [selectedLog, setSelectedLog] = useState<Logs | null>(null);
	const gridRef = useRef<AgGridReact>(null);
	const navigate = useNavigate();

	const handleViewClick = (log: Logs) => {
		setSelectedLog(log);
		setOpenModal(true);
	};

	const isMobile = window.innerWidth < 1024;

	const columnDefs: ColDef[] = [
		{
			field: "log_id",
			headerName: "Id",
			filter: true,
			...(isMobile ? { width: 100 } : { flex: 0.5 }),
		},
		{
			field: "log_user_nome",
			headerName: "Usuário",
			filter: true,
			...(isMobile ? { width: 180 } : { flex: 1 }),
		},
		{
			field: "log_datahora",
			headerName: "Data/hora",
			...(isMobile ? { width: 180 } : { flex: 1 }),
			valueFormatter: (params: ValueFormatterParams) =>
				formatDateBR(params.value as string),
		},
		{
			field: "log_pag_id",
			headerName: "Página",
			...(isMobile ? { width: 180 } : { flex: 1 }),
		},
		{
			field: "log_url",
			headerName: "URL",
			...(isMobile ? { width: 180 } : { flex: 1 }),
		},
		{
			field: "log_acao",
			headerName: "Ação",
			...(isMobile ? { width: 200 } : { flex: 1.2 }),
		},
		{
			field: "log_conteudo",
			headerName: "Conteúdo",
			...(isMobile ? { width: 250 } : { flex: 2 }),
		},
		{
			headerName: "Ações",
			field: "acoes",
			cellRenderer: (params: ICellRendererParams) => (
				<div
					className="flex gap-2 mt-2.5 items-center justify-center"
					onClick={() => handleViewClick(params.data)}
				>
					<Eye
						size={18}
						className="text-blue-600 hover:text-blue-800 cursor-pointer"
					/>
				</div>
			),
			pinned: "right",
			sortable: false,
			filter: false,
			...(isMobile ? { width: 80 } : { width: 100 }),
		},
	];

	const myTheme = themeQuartz.withParams({
		spacing: 9,
		headerBackgroundColor: "#89C988",
		foregroundColor: "#1B1B1B",
		rowHoverColor: "#E2FBE2",
		oddRowBackgroundColor: "#f5f5f5",
		fontFamily: '"Inter", sans-serif',
	});

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
			setLoading((prev) => new Set([...prev, "logs"]));
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
			setLoading((prev) => {
				const next = new Set(prev);
				next.delete("logs");
				return next;
			});
		}
	};

	return (
		<div className="flex-1 lg:p-6 lg:pl-[280px] pt-20 font-[inter]">
			<div className="lg:px-6 px-3 h-10 w-full flex items-center justify-center mb-3">
				<span className="text-4xl font-semibold text-center ">Logs</span>
			</div>

			<Tabs.Root
				defaultValue="list"
				className="w-full"
				onValueChange={setActiveTab}
			>
				<Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
					<Tabs.Trigger
						value="list"
						className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
							activeTab === "list" ? "select animation-tab" : ""
						}`}
					>
						Lista
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content
					value="list"
					className="w-full flex flex-col py-2 lg:px-4 px-2"
				>
					<div className="flex justify-end mb-3">
						<button
							onClick={() => {
								const params = {
									fileName: "logs.csv",
									columnSeparator: ";",
								};
								gridRef.current?.api.exportDataAsCsv(params);
							}}
							title="Exportar CSV"
							disabled={loading.size > 0}
							className={`bg-verdeGrama font-semibold rounded text-white cursor-pointer hover:bg-[#246227] flex place-content-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 
							disabled:cursor-not-allowed 
							${
								window.innerWidth < 1024 ? "p-2" : "py-2.5 px-3 w-[165.16px]"
							}`}
						>
							<FileSpreadsheet />
							{window.innerWidth >= 1024 && "Exportar CSV"}
						</button>
					</div>

					<div className="md:h-[75vh] h-[63vh]">
						<AgGridReact
							modules={[AllCommunityModule]}
							theme={myTheme}
							ref={gridRef}
							rowData={rowData}
							defaultColDef={{ resizable: true }}
							columnDefs={columnDefs}
							localeText={agGridTranslation}
							pagination
							paginationPageSize={10}
							paginationPageSizeSelector={[10, 25, 50, 100]}
							loading={loading.has("logs")}
							overlayLoadingTemplate={overlayLoadingTemplate}
							overlayNoRowsTemplate={overlayNoRowsTemplate}
						/>
					</div>
				</Tabs.Content>

				<Modal
					openModal={openLogModal}
					setOpenModal={setOpenModal}
					modalTitle="Visualizar Log"
					modalWidth="w-full md:w-4/5 lg:w-1/2"
					isLoading={false}
					withExitButton
					isRegister={true}
					registerButtonText="Fechar"
					onSubmit={(e) => {
						e.preventDefault();
						setOpenModal(false);
					}}
				>
					{selectedLog && (
						<div className="space-y-2 text-gray-800">
							<p>
								<strong>Usuário:</strong> {selectedLog.log_user_nome}
							</p>
							<p>
								<strong>Data/hora:</strong>{" "}
								{formatDateBR(selectedLog.log_datahora)}
							</p>
							<p>
								<strong>Página:</strong> {selectedLog.log_pag_id}
							</p>
							<p>
								<strong>URL:</strong> {selectedLog.log_url}
							</p>
							<p>
								<strong>Ação:</strong> {selectedLog.log_acao}
							</p>
							<p>
								<strong>Conteúdo:</strong>
							</p>
							<div className="bg-gray-100 p-2 rounded text-sm font-mono">
								{selectedLog.log_conteudo.split("\n").map((linha, index) => (
									<p key={index}>{linha}</p>
								))}
							</div>
						</div>
					)}
				</Modal>
			</Tabs.Root>

			{openNoticeModal && <NoticeModal successMsg={false} message={message} />}
		</div>
	);
}
