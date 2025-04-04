import { Dialog } from "radix-ui";
import React from "react";

type ModalProps = {
  children: React.ReactElement;
  externalName: string;
  externalClassname: string;
  modalTitle: string;
  exitButton?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Modal = ({
  children,
  externalName,
  externalClassname,
  modalTitle,
  exitButton,
  ...rest
}: ModalProps) => {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button className={externalClassname} {...rest}>
            {externalName}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>{modalTitle}</Dialog.Title>
            <Dialog.Description>{children}</Dialog.Description>
            <Dialog.Close asChild>
              <>
                <button>Cancel</button>
                <button>Send</button>
              </>
            </Dialog.Close>
            {exitButton ? (
              <Dialog.Close>
                <button {...rest}>X</button>
              </Dialog.Close>
            ) : (
              <></>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default Modal;
