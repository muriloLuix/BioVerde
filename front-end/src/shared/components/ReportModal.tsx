import { Dialog } from "radix-ui";
import { X } from "lucide-react";

interface ReportModalProps {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  reportUrl: string | null;
  reportTitle: string;
  fileName: string;
}

const ReportModal = ({ 
    openModal, 
    setOpenModal, 
    reportUrl,
    reportTitle,
    fileName
}:ReportModalProps) => {

  return (
    <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-h-[95vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-2xl font-bold">{reportTitle}</Dialog.Title>
            <Dialog.Close asChild>
                <button className="text-gray-700 hover:text-gray-800 cursor-pointer rounded-full p-1 hover:bg-gray-200">
                    <X />
                </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-auto">
            {reportUrl ? (
              <iframe
                src={reportUrl}
                className="w-full h-full min-h-[70vh] border"
                title={reportTitle}
              />
            ) : (
              <p>Carregando relatório...</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <a
              href={reportUrl ?? "#"}
              download={fileName}
              className={`px-4 py-2 rounded text-white ${
                reportUrl
                  ? "bg-verdeGrama hover:bg-[#246127]"
                  : "bg-gray-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              Baixar Relatório
            </a>
            <Dialog.Close asChild>
                <button
                className="bg-gray-300 px-4 py-2 rounded cursor-pointer hover:bg-gray-400"
                >
                    Fechar
                </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ReportModal;
