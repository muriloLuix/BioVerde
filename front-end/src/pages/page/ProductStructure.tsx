import { Tabs, Form, Dialog } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash, Eye } from "lucide-react";

export default function ProductStructure() {
    const [activeTab, setActiveTab] = useState("list");

    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (title: string, content: string) => {
      setModalTitle(title);
      setModalContent(content);
      setIsModalOpen(true);
    };

    const produtos = [
        {
          id: "001",
          produto: "Tomate Orgânico",
          insumos: "Laranja, Açúcar",
          quantidade: "3kg, 599g",
          etapasproducao: "Extração, Filtragem",
          observacoes: "Armazenar em local fresco e arejado."
        },
        {
          id: "002",
          produto: "Alface Orgânico",
          insumos: "Sementes, Fertilizantes",
          quantidade: "50g, ",
          etapasproducao: "Plantio, Colheita",
          observacoes: "Manter refrigerado a 10°C."
        },
        {
          id: "003",
          produto: "Suco de Laranja",
          insumos: "Sementes, Fertilizantes",
          quantidade: "50g, 200g",
          etapasproducao: "Plantio, Colheita",
          observacoes: "Evitar exposição direta ao sol."
        },
      ];

    return (
      <div className="px-6 font-[inter]">
        <h1 className=" text-[40px] font-semibold text-center">Estrutura de Produtos</h1>
  
        <Tabs.Root
          defaultValue="list"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
          
        >
          <Tabs.List className="flex gap-5 border-b border-verdePigmento relative mb-7">
            <Tabs.Trigger
              value="list"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "list" ? "select animation-tab" : ""
              }`}
            >
              Lista de Estrutura de Produtos
            </Tabs.Trigger>
  
            <Tabs.Trigger
              value="register"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "register" ? "select animation-tab" : ""
              }`}
            >
              Adicionar Nova Estrutura de Produtos
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content 
            value="list"
            className="flex flex-col w-full"
          > 
            <Form.Root className="flex flex-col gap-4 ">
              <h2 className="text-3xl">Filtros:</h2>
              <div className="flex flex-col gap-7">
  
                <div className="flex gap-9 mb-2">
  
                  <Form.Field name="filter-prod-name" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        ID:
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="number"
                        name="filter-prod-name"
                        id="filter-prod-name"
                        placeholder="ID"
                        className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>
  
                  <Form.Field name="filter-prod-code" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Quantidade:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-prod-code"
                        id="filter-prod-code"
                        placeholder="Quantidade"
                        className="bg-white w-[210px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="product-prod-category" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">
                        ...
                        </span>
                    </Form.Label>
                    <Form.Control asChild>
                        <select
                        name="product-prod-category"
                        id="product-prod-category"
                        className="bg-white w-[210px] border border-separator rounded-lg p-2.5 shadow-xl"
                        >
                        <option value="todas">Todas</option>
                        <option value="materia-prima">Matéria-Prima</option>
                        <option value="produto-semiacabado">Produto Semiacabado</option>
                        <option value="produto-acabado">Produto Acabado</option>
                        </select>
                    </Form.Control>
                    </Form.Field>

                  <Form.Field name="filter-prod-type" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Etapa:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-email"
                        id="filter-email"
                        placeholder="Etapa de Produto"
                        className="bg-white w-[210px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>
  
                </div>
  
                <div className="flex gap-7 mb-2">
                  <Form.Field name="filter-prod-quantity" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Insumo:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-prod-quantity"
                        id="filter-prod-quantity"
                        placeholder="Insumos"
                        className="bg-white border w-[181px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filter-prod-unit" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        ...
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <select
                        name="filter-prod-unit"
                        id="filter-prod-unit"
                        className="bg-white w-[181px] border border-separator rounded-lg p-2.5 shadow-xl"
                      >
                        <option value="todas">Todas</option>
                        <option value="un">un</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="l">L</option>
                        <option value="ml">ml</option>
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                        <option value="t">t</option>
                      </select>
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filter-prod-minimum" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Produto:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-prod-minimum"
                        id="filter-prod-minimum"
                        placeholder="Produto"
                        className="bg-white border w-[181px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filter-prod-maximum" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">...</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-prod-maximum"
                        id="filter-prod-maximum"
                        placeholder="..."
                        className="bg-white border w-[181px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filter-prod-status" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        ...
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <select
                        name="filter-prod-status"
                        id="filter-prod-status"
                        className="bg-white w-[181px] border border-separator rounded-lg p-2.5 shadow-xl"
                      >
                        <option value="todos">Todos</option>
                        <option value="valido">Válido</option>
                        <option value="invalido">Inválido</option>
                      </select>
                    </Form.Control>
                  </Form.Field>
  
                  
                </div>
  
                <div className="flex gap-8 mb-10">
                    <Form.Field name="filter-prod-supplier" className="flex flex-col">
                        <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">...</span>
                        </Form.Label>
                        <Form.Control asChild>
                        <input
                            type="text"
                            name="filter-prod-supplier"
                            id="filter-prod-supplier"
                            placeholder="..."
                            className="bg-white border w-[350px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                        </Form.Control>
                    </Form.Field>
  

                    <Form.Field name="product-prod-date" className="flex flex-col">
                        <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">...</span>
                        </Form.Label>
                        <Form.Control asChild>
                            <input 
                                type="date" 
                                name="product-prod-date" 
                                id="product-prod-date"
                                className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                        </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-prod-validity" className="flex flex-col">
                        <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">...</span>
                        </Form.Label>
                        <Form.Control asChild>
                            <input 
                                type="date" 
                                name="product-prod-validity" 
                                id="product-prod-validity"
                                className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                        </Form.Control>
                    </Form.Field>

                    <Form.Submit asChild >
                    <div className="flex place-content-center mt-9 ml-4">
                      <button
                        type="submit"
                        className="bg-verdeMedio p-3 w-[140px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
                      >
                        <Search />
                        Pesquisar
                      </button>
                    </div>
                  </Form.Submit>

  
                </div>
  
  
              </div>
            </Form.Root>
          
            <div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
              <table className="w-full border-collapse">
                <thead>
                <tr className="bg-verdePigmento text-white shadow-thead">
                    {[
                        "ID", "Produto", "Insumos", "Quantidade", "Etapas de Produção", "Observações","Visualizar", "Ações"
                    ].map((header) => (
                        <th key={header} className="border border-black px-4 py-4 whitespace-nowrap">{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                  {produtos.map((produto, index) => (
                  <tr key={produto.id} className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}>
                    {Object.values(produto).slice(0, 15).map((value, idx) => (
                    <td key={idx} className="border border-black px-4 py-4 whitespace-nowrap">{value}</td>
                    ))}
                    <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button 
                          className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          onClick={() => openModal("Observações", produto.observacoes)}
                        >
                            <Eye />
                            <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Ver
                            </div>
                        </button>
                    </td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button className="mr-4 text-black cursor-pointer relative group">
                            <PencilLine />
                            <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Editar
                            </div>
                        </button>
                        <button className="text-red-500 cursor-pointer relative group">
                            <Trash />
                            <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Excluir
                            </div>
                        </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Modal (Pop-up) */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
                    <Dialog.Title className="text-xl font-bold mb-4">{modalTitle}</Dialog.Title>
                    <Dialog.Description className="text-gray-700">
                    {modalContent}
                    </Dialog.Description>
                    <div className="mt-4 flex justify-end">
                    <button
                        className="bg-verdeMedio text-white px-4 py-2 rounded-lg hover:bg-verdeEscuro cursor-pointer"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Fechar
                    </button>
                    </div>
                </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
       
          </Tabs.Content>
          

            <Tabs.Content
            value="register"
            className="flex items-center justify-center"
            >
                <Form.Root className="flex flex-col">
                <h2 className="text-3xl mb-8">Adicionar Novo Produto</h2>
    
                <div className="flex gap-x-25 mb-10">
                    <Form.Field name="product-name" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">
                        Nome do Produto:
                        </span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-name"
                        id="product-name"
                        placeholder="Nome do Produto"
                        required
                        className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                    
                    <Form.Field name="product-description" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Insumos</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-description"
                        id="product-description"
                        placeholder="Insumos de Produtos"
                        className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                </div>
                
                <div className="flex gap-21 mb-10 ">
                    <Form.Field name="produto-code"className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">ID:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="number"
                        name="produto-code"
                        id="produto-code"
                        placeholder="ID"
                        required
                        className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-category" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">
                        ...
                        </span>
                    </Form.Label>
                    <Form.Control asChild>
                        <select
                        name="product-category"
                        id="product-category"
                        required
                        className="bg-white w-[240px] border border-separator rounded-lg p-2.5 shadow-xl"
                        >
                        <option value="materia-prima">Matéria-Prima</option>
                        <option value="produto-semiacabado">Produto Semiacabado</option>
                        <option value="produto-acabado">Produto Acabado</option>
                        </select>
                    </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-type" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Quantidade:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-type"
                        id="product-type"
                        placeholder="Quantidade"
                        className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                </div>
                
                <div className="flex gap-x-15 mb-10 items-center">
                    <Form.Field name="product-quantity" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Etapas da Produção:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-quantity"
                        id="product-quantity"
                        placeholder="Etapas da Produção"
                        required
                        className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-unit" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">
                        ....
                        </span>
                    </Form.Label>
                    <Form.Control asChild>
                        <select
                        name="product-unit"
                        id="product-unit"
                        required
                        className="bg-white w-[180px] border border-separator rounded-lg p-2.5 shadow-xl"
                        >
                        <option value="un">un</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="l">L</option>
                        <option value="ml">ml</option>
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                        <option value="t">t</option>
                        </select>
                    </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-weight" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">...</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-weight"
                        id="product-weight"
                        placeholder="..."
                        className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>

                    <Form.Field name="product-price" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">...</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="product-price"
                        id="product-price"
                        placeholder="Preço"
                        required
                        className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>

                </div>

                <div className="flex gap-21 mb-10 justify-between">
                        <Form.Field name="product-stock-minimum"className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">...</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="product-stock-minimum"
                                id="product-stock-minimum"
                                placeholder="Estoque mínimo"
                                required
                                className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                        </Form.Field>

                        <Form.Field name="product-stock-maximum"className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">...</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="product-stock-maximum"
                                id="product-stock-maximum"
                                placeholder="Estoque máximo"
                                required
                                className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                        </Form.Field>

                        <Form.Field name="product-validity" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">...</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input 
                                    type="date" 
                                    name="product-validity" 
                                    id="product-validity"
                                    required
                                    className="bg-white border w-[240px] border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                        </Form.Field>
                    </div>

                    <div className="flex mb-10 justify-between">
                        <Form.Field name="product-supplier"className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">...</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="product-supplier"
                                id="product-supplier"
                                placeholder="Fornecedor"
                                className="bg-white border w-[580px] border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                        </Form.Field>

                        <Form.Field name="produto-status" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">
                                ...
                                </span>
                            </Form.Label>
                            <Form.Control asChild>
                                <select
                                name="produto-status"
                                id="produto-status"
                                required
                                className="bg-white w-[240px] border border-separator rounded-lg p-2.5 shadow-xl"
                                >
                                <option value="valido">Válido</option>
                                <option value="invalido">Inválido</option>
                                </select>
                            </Form.Control>
                        </Form.Field>
                        
                    </div>

                    <div className="flex mb-10 ">
                        <Form.Field name="product-observation"className="w-full flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">Observações:</span>
                            </Form.Label>
                            <Form.Control asChild>
                            <textarea
                                id="product-observation"
                                name="product-observation"
                                rows={3}
                                cols={50}
                                placeholder="Digite as observações do produto"
                                maxLength={500}
                                className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                            ></textarea>
                            </Form.Control>
                        </Form.Field>
                        
                    </div>


                    <Form.Submit asChild >
                    <div className="flex place-content-center mb-10 ">
                        <button
                        type="submit"
                        className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
                        >
                        Adicionar Estrutura
                        </button>
                    </div>
                    </Form.Submit>
                </Form.Root>
    
                  
            </Tabs.Content>
          
        </Tabs.Root>
      </div>
    );

}