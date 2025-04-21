import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";

const LogsPage = () => {
  const products = [
    {
      id: 19,
      url: "Bamboo Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 24,
    },
    {
      id: 12,
      url: "Black Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 61,
    },
    {
      id: 13,
      url: "Blue Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 2,
    },
    {
      id: 14,
      url: "Orange Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 2,
    },
    {
      id: 15,
      url: "Green Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 5,
    },
    {
      id: 16,
      url: "Red Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 8,
    },
    {
      id: 17,
      url: "Yellow Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 12,
    },
    {
      id: 18,
      url: "Purple Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 3,
    },
    {
      id: 20,
      url: "Silver Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 7,
    },
    {
      id: 21,
      url: "Gold Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 9,
    },
    {
      id: 22,
      url: "Platinum Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 15,
    },
    {
      id: 23,
      url: "Diamond Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 18,
    },
    {
      id: 24,
      url: "Leather Watch",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 20,
    },
    {
      id: 25,
      url: "Metal Band",
      made_at: "2023-10-01T12:00:00Z",
      employee_id: 22,
    },
  ];

  return (
    <div className="flex-1 p-6 pl-[280px] w-full h-screen">
      <DataTable
        value={products}
        removableSort
        showGridlines
        stripedRows
        scrollable
        scrollHeight="675px"
        selectionMode="single"
        onRowSelect={(e) => console.log(e.data)}
      >
        <Column field="id" header="ID" sortable />
        <Column field="url" header="URL" sortable />
        <Column field="made_at" header="Horário" sortable />
        <Column field="employee_id" header="Por" sortable />
      </DataTable>
    </div>
  );
};

export default LogsPage;
