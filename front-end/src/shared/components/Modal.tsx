import React, { useState } from "react";
import { Separator, Dialog } from "radix-ui";
import { X } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

type ModalProps = {
  children: React.ReactNode;
  buttonName: string;
  buttonClassname: string;
  modalTitle: string;
  withExitButton?: boolean;
  leftButtonText?: string;
  rightButtonText?: string;
  modalWidth?: string;
  withConfirmationModal?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Modal = ({
  children,
  buttonName,
  buttonClassname,
  modalTitle,
  withExitButton = true,
  modalWidth = "w-1/3",
  rightButtonText,
  leftButtonText,
  withConfirmationModal = false,
  ...rest
}: ModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className={buttonClassname}>{buttonName}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
        <Dialog.Content
          className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${modalWidth} p-6 bg-white rounded-xl shadow-lg`}
        >
          <Dialog.Title className="text-xl font-[inter] font-bold">
            {modalTitle.toUpperCase()}
          </Dialog.Title>
          <Separator.Root
            decorative
            orientation="horizontal"
            className="w-full h-[0.1px] bg-black"
          />
          <Dialog.Description className="py-4 px-2 flex flex-col gap-2">
            {children}
          </Dialog.Description>
          <div className="flex justify-end items-center gap-3">
            <Dialog.Close asChild>
              <button className="px-4 py-2 bg-red-500 text-white font-[inter] rounded cursor-pointer hover:bg-red-600">
                {leftButtonText ? leftButtonText : "Cancel"}
              </button>
            </Dialog.Close>

            {withConfirmationModal ? (
              <ConfirmationModal
                confirmationButtonName={rightButtonText || "Send"}
                confirmationButtonClassname={
                  "px-4 py-2 bg-green-500 text-white font-[inter] rounded cursor-pointer hover:bg-green-600"
                }
                {...rest}
              />
            ) : (
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 bg-green-500 text-white font-[inter] rounded cursor-pointer hover:bg-green-600"
                  {...rest}
                >
                  {rightButtonText ? rightButtonText : "Send"}
                </button>
              </Dialog.Close>
            )}
          </div>

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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
