import { AlertDialog } from "radix-ui";
import { Loader2 } from "lucide-react";

type ConfirmationModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  confirmationText: string;
  confirmationButtonName?: string;
  confirmationButtonClassname: string;
  confirmationLeftButtonText: string;
  confirmationRightButtonText: string;
  confirmationModalTitle?: string;
  onCancel?: () => void;
  onConfirm?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: Set<string>;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ConfirmationModal = ({
  openModal,
  setOpenModal,
  confirmationText,
  confirmationButtonName,
  confirmationButtonClassname,
  confirmationLeftButtonText,
  confirmationRightButtonText,
  confirmationModalTitle,
  onCancel,
  onConfirm,
  isLoading,
  loading,
}: ConfirmationModalProps) => {

  return (
    <AlertDialog.Root open={openModal} onOpenChange={setOpenModal}>
      <AlertDialog.Trigger asChild>
        <button className={confirmationButtonClassname}>
          {confirmationButtonName}
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
        <AlertDialog.Content
          className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-brancoSal rounded-xl shadow-lg`}
        >
          <AlertDialog.Title className="text-xl font-[inter] font-bold">
            {confirmationModalTitle}
          </AlertDialog.Title>
          <AlertDialog.Description className="py-3 px-2 my-2 text-gray-800">
            {confirmationText}
          </AlertDialog.Description>
          <div className="gap-3 flex justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className=" py-2 px-3 h-10 rounded text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-300"
                onClick={onCancel}
              >
                {confirmationLeftButtonText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                className="bg-red-700 py-2 px-3 w-[186px] h-10 rounded text-white cursor-pointer flex place-content-center gap-2 hover:bg-red-800"
                onClick={onConfirm}
                disabled={!!loading?.size}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  confirmationRightButtonText
                )}
              </button> 
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmationModal;
