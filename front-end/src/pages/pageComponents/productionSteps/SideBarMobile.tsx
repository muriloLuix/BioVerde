import React from "react";
import { Search, Loader2, X, Plus } from "lucide-react";
import { ProductsWithSteps } from "../../../utils/types";
import { Dialog } from "radix-ui";

interface SideBarProps {
  loading: Set<string>;
  showMobileSidebar: boolean;
  setShowMobileSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productsWithSteps: ProductsWithSteps[];
  selectedProduct: ProductsWithSteps | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<ProductsWithSteps | null>>;
  setOpenNewProductModal: React.Dispatch<React.SetStateAction<boolean>>
  setNewProduct: React.Dispatch<React.SetStateAction<{produto: string;}>>
}

const SideBarMobile: React.FC<SideBarProps> = ({
  loading,
  showMobileSidebar,
  setShowMobileSidebar,
  search,
  setSearch,
  productsWithSteps,
  selectedProduct,
  setSelectedProduct,
  setOpenNewProductModal,
  setNewProduct,
}) => {
  return (
    <Dialog.Root open={showMobileSidebar} onOpenChange={setShowMobileSidebar}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 bg-opacity-50 z-50" />
        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-h-[95vh] md:w-[60vw] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6  shadow-lg focus:outline-none">
          <div className="flex justify-end items-center mb-4">
            <Dialog.Close asChild>
                <button className="text-gray-700 hover:text-gray-800 cursor-pointer rounded-full p-1 hover:bg-gray-200">
                    <X />
                </button>
            </Dialog.Close>
          </div>
            {/* Conteúdo da sidebar aqui (copie o conteúdo da sua sidebar atual) */}
            <div className="bg-green-800 p-4 rounded-t-xl">
                <h2 className="text-white text-center text-lg font-semibold">
                Etapas de Produção
                </h2>
                <div className="flex items-center gap-2 relative">
                <Search className="text-black w-5 h-5 absolute right-2 bottom-2.5" />
                <input
                    type="text"
                    name="searchProduct"
                    id="searchProduct"
                    placeholder="Buscar Produto"
                    value={search}
                    onChange={setSearch}
                    className="bg-white text-black w-full pr-9 border border-separator rounded-lg text-base mt-3 p-1.5 shadow-xl"
                />
                </div>
            </div>

            <div className="h-[50vh]">
                <div className="flex-1 overflow-y-auto h-[40vh] custom-scrollbar-products">
                    {loading.has("steps") ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                    </div>
                    ) : productsWithSteps.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-center text-gray-700">
                        Nenhum Produto Cadastrado
                        </p>
                    </div>
                    ) : (
                    <ul className="flex flex-col gap-2 m-4">
                        {productsWithSteps
                        .filter((produto) =>
                            produto.produto_nome
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((produto, index) => (
                            <li
                            key={index}
                            className={`break-words px-4 py-2 text-black font-medium cursor-pointer hover:bg-gray-300 rounded-lg ${
                                selectedProduct?.produto_nome === produto.produto_nome
                                ? "bg-gray-300"
                                : ""
                            }`}
                            onClick={() => {
                                setSelectedProduct(produto);
                                setShowMobileSidebar(false);
                            }}
                            >
                            {produto.produto_nome}
                            </li>
                        ))}
                    </ul>
                    )}
                </div>
                <div className="p-1 bg-gray-300 hover:bg-gray-400 rounded-b-xl">
                    <button
                        onClick={() => { setOpenNewProductModal(true); setNewProduct({ produto: "" }); }}
                        className="w-full cursor-pointer flex place-content-center gap-2 text-black font-semibold py-2 rounded-lg"
                    >
                        <Plus />
                        Novo Produto
                    </button>
                </div>
            </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SideBarMobile;
