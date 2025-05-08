import { useState, useRef } from "react";

import { Tabs } from "radix-ui";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { Modal, SmartField } from "../../shared";

interface IRow {
	id: number;
	produtos: string[];
	quantidade: number[];
	dataDeFabricacao: Date;
	dataDeValidade: Date;
	observacao: string;
}

const Batch = () => {
	const [activeTab, setActiveTab] = useState("list");
	const [handleModal, setHandleModal] = useState(false);

	const gridRef = useRef<AgGridReact>(null);
	const [columnDefs, setColumnDef] = useState<ColDef[]>([
		{ field: "id", filter: true, width: 100 },
		{ field: "produtos", filter: true, width: 230 },
		{ field: "quantidade", width: 150 },
		{
			field: "dataDeFabricacao",
			filter: "agDateColumnFilter",
			width: 200,
		},
		{
			field: "dataDeValidade",
			filter: "agDateColumnFilter",
			width: 200,
		},
		{ field: "observacao", width: 300 },
	]);
	const [rowData, setRowData] = useState<IRow[]>([
		{
			id: 1,
			produtos: ["banana", "pera"],
			quantidade: [12, 10],
			dataDeFabricacao: new Date("2004-01-22"),
			dataDeValidade: new Date("2004-01-22"),
			observacao: "",
		},
		{
			id: 2,
			produtos: ["maçã", "brocolis"],
			quantidade: [12, 10],
			dataDeFabricacao: new Date("2023-01-01"),
			dataDeValidade: new Date("2023-01-01"),
			observacao: "",
		},
		{
			id: 3,
			produtos: ["batata", "beterraba"],
			quantidade: [10, 10],
			dataDeFabricacao: new Date("2023-01-02"),
			dataDeValidade: new Date("2023-01-02"),
			observacao: "",
		},
	]);

	return (
		<div className="h-screen w-full flex-1 p-6 pl-[280px]">
			<div className="h-10 w-full flex items-center justify-center">
				<span className="text-4xl font-semibold text-center">Lotes</span>
			</div>
			<Tabs.Root
				defaultValue="list"
				className="h-full w-full"
				onValueChange={(value) => setActiveTab(value)}
			>
				<Tabs.List className="flex gap-5 border-b border-verdePigmento relative">
					<Tabs.Trigger
						className={`relative px-4 py-2 text-verdePigmento text-lg font-semibold cursor-pointer ${
							activeTab === "list" ? "select animation-tab" : ""
						}`}
						value="list"
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
							submitButtonText="Criar"
							cancelButtonText="Cancelar"
							children={
								<>
									<SmartField
										fieldName="produto"
										fieldText="Produto"
										isSelect
									/>
									<SmartField
										fieldName="quantidade"
										type="number"
										fieldText="Quantidade"
									/>
									<SmartField
										fieldName="fabricacao"
										fieldText="Data de fabricação"
										isDate
									/>
									<SmartField
										fieldName="validade"
										fieldText="Data de validade"
										isDate
									/>
									<SmartField
										fieldName="observacoes"
										fieldText="Observações"
										isTextArea
										placeholder="Adicione informações sobre o lote"
									/>
								</>
							}
						/>
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
		</div>
	);
};

export default Batch;
