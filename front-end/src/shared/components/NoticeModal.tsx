import { Toast } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type NoticeModalProps = {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    successMsg: boolean;
    message: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const NoticeModal = ({
    openModal,
    setOpenModal,
    successMsg,
    message,
}: NoticeModalProps) => {
    return (
      <Toast.Provider swipeDirection="right">
      <AnimatePresence>
        {openModal && (
        <Toast.Root
            open={openModal}
            onOpenChange={setOpenModal}
            duration={5000}
            asChild
        >
            <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-4 right-4 sm:w-95 w-[90vw] p-4 rounded-lg text-white sombra z-102 ${
                successMsg ? "bg-verdePigmento" : "bg-ErroModal"
            }`}
            >
            <div className="flex justify-between items-center pb-2">
                <Toast.Title className="font-bold text-lg">
                {successMsg ? "Sucesso!" : "Erro!"}
                </Toast.Title>
                <Toast.Close className="ml-4 p-1 rounded-full hover:bg-white/20 cursor-pointer">
                <X size={25} />
                </Toast.Close>
            </div>
            <Toast.Description>{message}</Toast.Description>
            </motion.div>
        </Toast.Root>
        )}
      </AnimatePresence>

      <Toast.Viewport className="fixed bottom-4 right-4 z-1000" />
      </Toast.Provider>
    );
};

export default NoticeModal;