import { Dialog, Form } from "radix-ui";
import { Loader2 } from "lucide-react";

type ModalProps = {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
  buttonName?: string;
  buttonClassname?: string;
  modalTitle: string;
  obsText?: string;
  withExitButton?: boolean;
  leftButtonText?: string;
  rightButtonText?: string;
  modalWidth?: string;
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
  obsText,
  rightButtonText,
  leftButtonText,
  isLoading,
  loading,
  onCancel,
  onSubmit,
  onDelete,
}: ModalProps) => {

  return (
    <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
      <Dialog.Trigger asChild>
        <button className={buttonClassname ? buttonClassname : "hidden"}>{buttonName}</button>
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
            {withExitButton ? (
              <>
                {obsText 
                  ? <p className="text-gray-800 break-words">{obsText}</p> 
                  : <p className="text-gray-800 break-words">Não há nenhuma observação.</p>
                }
              <Dialog.Close asChild>
                <div className="mt-4 flex justify-end"> 
                  <button
                    className="bg-verdeMedio p-3 px-6 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                    aria-label="Close"
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Close>
              </>
            ) : (
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
                  <>
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

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      onClick={onCancel}
                      className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400"
                      aria-label="Close"
                    >
                      {rightButtonText}
                    </button>
                  </Dialog.Close>
                  </>
                </div>
              </Form.Root>
            )}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
