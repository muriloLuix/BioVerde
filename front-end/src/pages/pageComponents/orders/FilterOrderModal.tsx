import React from "react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";

interface FilterModalProps {
  loading: Set<string>;
  openFilterModal: boolean;
  setOpenFilterModal: React.Dispatch<React.SetStateAction<boolean>>;
  isFiltered: boolean;
  reorderColumn: (columnName: string, type: "asc" | "desc" | null) => void;
  getMonthOrdersByStatus: (type: string, filter: string) => void;
}

const FilterOrderModal: React.FC<FilterModalProps> = ({
  loading,
  openFilterModal,
  setOpenFilterModal,
  isFiltered,
  reorderColumn,
  getMonthOrdersByStatus,
}) => {
  return (
    <Dialog.Root open={openFilterModal} onOpenChange={setOpenFilterModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 bg-opacity-50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-h-[95vh] md:w-[60vw] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6  shadow-lg focus:outline-none">
            <Dialog.Title className="text-2xl font-[inter] font-semibold flex justify-between items-center mb-6">
                <span>Filtros:</span>
                <Dialog.Close asChild>
                    <button className="text-gray-700 hover:text-gray-800 cursor-pointer rounded-full p-1 hover:bg-gray-200">
                        <X />
                    </button>
                </Dialog.Close>
            </Dialog.Title>
            <div className="flex flex-col gap-4">
                <button
                    disabled={loading.size > 0 || isFiltered}
                    className="bg-gray-100 hover:bg-gray-200 transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => {
                        getMonthOrdersByStatus("lessThan", "Entregue");
                        reorderColumn("pedido_prevEntrega", "asc");
                        setOpenFilterModal(false);
                    }}
                >
                    Concluídos no último mês
                </button>
                <button
                    disabled={loading.size > 0 || isFiltered}
                    className="bg-gray-100 hover:bg-gray-200 transition-colors delay-75 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => {
                        getMonthOrdersByStatus("notEqual", "Entregue");
                        reorderColumn("pedido_prevEntrega", "asc");
                        setOpenFilterModal(false);
                    }}
                >
                    Entrega próxima
                </button>
                <button
                    disabled={loading.size > 0 || isFiltered}
                    className="bg-gray-100 hover:bg-gray-200 transition-colors delay-100 py-2.5 px-4 rounded cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => {
                        reorderColumn("pedido_dtCadastro", "asc");
                        setOpenFilterModal(false);
                    }}
                >
                    Recentes
                </button>
            </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FilterOrderModal;
