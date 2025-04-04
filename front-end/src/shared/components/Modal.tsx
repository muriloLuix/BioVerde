import React, { useState } from "react";
import { Separator, Dialog } from "radix-ui";
import { X } from "lucide-react";

type ModalProps = {
  children: React.ReactNode;
  externalName: string;
  externalClassname: string;
  modalTitle: string;
  exitButton?: boolean;
  leftButtonName?: string;
  rightButtonName?: string;
  modalWidth?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Modal = ({
  children,
  externalName,
  externalClassname,
  modalTitle,
  exitButton = true,
  modalWidth = "w-1/3",
  rightButtonName = "Send",
  leftButtonName = "Cancel",
  ...rest
}: ModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className={externalClassname} {...rest}>
          {externalName}
        </button>
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
          <Dialog.Close asChild>
            <div className="flex justify-end items-center gap-3">
              <button className="px-4 py-2 bg-red-500 text-white font-[inter] rounded cursor-pointer hover:bg-red-600">
                {leftButtonName ? leftButtonName : "Cancel"}
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white font-[inter] rounded cursor-pointer hover:bg-blue-600">
                {rightButtonName ? rightButtonName : "Send"}
              </button>
            </div>
          </Dialog.Close>
          {exitButton && (
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
