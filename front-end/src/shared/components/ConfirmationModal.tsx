import { useState } from "react";
import { AlertDialog, Separator } from "radix-ui";

type ConfirmationModalProps = {
  confirmationChildren?: React.ReactNode;
  confirmationButtonName: string;
  confirmationButtonClassname: string;
  confirmationLeftButtonText?: string;
  confirmationRightButtonText?: string;
  confirmationModalWidth?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ConfirmationModal = ({
  confirmationChildren,
  confirmationButtonName,
  confirmationButtonClassname,
  confirmationLeftButtonText,
  confirmationRightButtonText,
  ...rest
}: ConfirmationModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className={confirmationButtonClassname}>
          {confirmationButtonName}
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-black/50 fixed inset-0 z-40" />
        <AlertDialog.Content
          className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 p-6 bg-white rounded-xl shadow-lg`}
        >
          <AlertDialog.Title className="text-xl font-[inter] font-bold">
            CONFIRMATION
          </AlertDialog.Title>
          <Separator.Root
            decorative
            orientation="horizontal"
            className="w-full h-[0.1px] bg-black"
          />
          <AlertDialog.Description className="py-4 px-2 gap-2 my-2">
            {confirmationChildren ? (
              confirmationChildren
            ) : (
              <>
                <span>
                  Are you sure you want to proceed with this action? This change
                  can't be undone
                </span>
              </>
            )}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 bg-red-500 text-white font-[inter] rounded cursor-pointer hover:bg-red-600">
                {confirmationLeftButtonText
                  ? confirmationLeftButtonText
                  : "Cancel"}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="px-4 py-2 bg-green-500 text-white font-[inter] rounded cursor-pointer hover:bg-green-600"
                {...rest}
              >
                {confirmationRightButtonText
                  ? confirmationRightButtonText
                  : "Confirm"}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmationModal;
