import { Dialog, Form } from "radix-ui";
import { X, Loader2 } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

type ModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  buttonName?: string;
  buttonClassname: string;
  modalTitle: string;
  withExitButton?: boolean;
  leftButtonText?: string;
  rightButtonText?: string;
  modalWidth?: string;
  withConfirmationModal?: boolean;
  loading?: Set<string>;
  isLoading?: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Modal = ({
  openModal,
  setOpenModal,
  children,
  buttonName,
  buttonClassname,
  modalTitle,
  withExitButton,
  modalWidth,
  rightButtonText,
  leftButtonText,
  withConfirmationModal,
  isLoading,
  loading,
  onCancel,
  onSubmit,
  onDelete,
  ...rest
}: ModalProps) => {

  return (
    <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
      <Dialog.Trigger asChild>
        <button className={buttonClassname}>{buttonName}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
        <Dialog.Content
          className={`fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${modalWidth} p-6 bg-brancoSal rounded-xl shadow-lg`}
        >
          <Dialog.Title className="text-2xl font-[inter] font-semibold">
            {modalTitle}
          </Dialog.Title>
          <Dialog.Description className="py-4 px-2 pb-0 flex flex-col gap-2">
            <Form.Root 
            className="flex flex-col"   
            onSubmit={(e) => {
                if (onSubmit) {onSubmit(e)} 
                else if (onDelete) {
                  e.preventDefault();
                  onDelete(); 
                }
              }}
            >
              {children}
              <div className="flex justify-center items-center gap-5">

                {withConfirmationModal ? (
                  <ConfirmationModal
                    confirmationButtonName={rightButtonText || "Send"}
                    confirmationButtonClassname={
                      "px-4 py-2 bg-green-500 text-white font-[inter] rounded cursor-pointer hover:bg-green-600"
                    }
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    confirmationModalTitle=""
                    confirmationText=""
                    confirmationLeftButtonText=""
                    confirmationRightButtonText=""
                    {...rest}
                  />
                ) : (
                  <Form.Submit>
                    <button
                      type="submit"
                      className="bg-verdeMedio p-3 px-6 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                      disabled={!!loading?.size}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        leftButtonText
                      )}
                    </button>
                  </Form.Submit>
                )}

                <Dialog.Close asChild>
                  <button
                      type="button"
                      onClick={onCancel}
                      className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400"
                    >
                      {rightButtonText}
                    </button>
                </Dialog.Close>

                {withExitButton && (
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-black hover:bg-gray-200 hover:rounded-lg cursor-pointer"
                      aria-label="Close"
                    >
                      <X />
                    </button>
                  </Dialog.Close>
                )}
              </div>
            </Form.Root>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
