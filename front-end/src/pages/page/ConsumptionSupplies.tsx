import { Tabs, Form, Dialog } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash, Eye } from "lucide-react";

export default function ConsumptionSupplies() {
  const [activeTab, setActiveTab] = useState("list");

  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center mb-3">Consumo de Insumos</h1>

      {/* Selelcionar Abas */}
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
            Lista de Consumo de Insumos
          </Tabs.Trigger>

          <Tabs.Trigger
            value="register"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "register" ? "select animation-tab" : ""
            }`}
          >
            Cadastrar Consumo de Insumos
          </Tabs.Trigger>
        </Tabs.List>

        {/* Aba de Lista de Usuários */}
        <Tabs.Content 
          value="list"
          className="flex flex-col w-full"
        > 
          {/* Filtro de Insumos */}
          <Form.Root className="flex flex-col gap-4 ">
            <h2 className="text-3xl">Filtros:</h2>
            <div className="flex flex-col">

              <div className="flex gap-10 mb-5 ">

                <Form.Field name="filter-insumo" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Insumo:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-insumo"
                      id="filter-insumo"
                      placeholder="Insumo utilizado"
                      className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-code" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Codigo do Insumo:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-code"
                      id="filter-code"
                      placeholder="Código do Insumo"
                      className="bg-white w-[240px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>


                <Form.Field name="filter-data" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Data de Consumo:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="date"
                      name="filter-data"
                      id="filter-data"
                      placeholder="dd/mm/aa"
                      autoComplete="date"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>
              </div>

              {/* Quantidade Consumida e unidade */}
              <div className="flex gap-10 mb-5 items-center">
 
              <Form.Field name="filter-resp" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Responsável:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-resp"
                      id="filter-resp"
                      placeholder="Nome do Responsável"
                      className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                    </input>
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-QtdConsumida" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Quantidade Consumida:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="number"
                      name="filter-QtdConsumida"
                      id="filter-QtdConsumida"
                      placeholder="Apenas números"
                      className="bg-white border w-[240px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="unit" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Uni. de Medida
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="unit"
                    id="unit"
                    className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
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

                <Form.Submit asChild >
                  <div className="flex place-content-center mb-6">
                    <button
                      type="submit"
                      className="bg-verdeMedio p-3 w-[100%] mt-15 rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro"
                    >
                      <Search />
                      Pesquisar
                    </button>
                  </div>
                </Form.Submit>
              </div>

            </div>
          </Form.Root>
        
          {/* Tabela Lista de Insumos */}
          <div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-verdePigmento text-white shadow-thead">
                  <th className="border border-black px-4 py-4 whitespace-nowrap">ID</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Insumo Utilizado</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Código</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Quantidade Consumida</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Uni. de Medida</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Responsável</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Data de Consumo</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Observações</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: "1",
                    insumo: "Farinha de trigo",
                    codigo: "INS-001",
                    qtdConsumida: "10",
                    unidade: "KG",
                    dataConsumo: "20/03/2025",
                    responsavel: "Guilherme Anholeto",
                    obs: "Observação do consumo de Insumo"
                  },
                  {
                    id: "2",
                    insumo: "Óleo Vegetal",
                    codigo: "INS-002",
                    qtdConsumida: "2",
                    unidade: "L",
                    dataConsumo: "24/03/2025",
                    responsavel: "Fernando Kotinda",
                    obs: "Observação do consumo de Insumo"
                  },
                  {
                    id: "3",
                    insumo: "Fermento Biológico",
                    codigo: "INS-003",
                    qtdConsumida: "500",
                    unidade: "G",
                    dataConsumo: "18/03/2025",
                    responsavel: "Carlos Bandeira",
                    obs: "Observação do consumo de Insumo"
                  },
                  {
                    id: "4",
                    insumo: "Tomate",
                    codigo: "INS-004",
                    qtdConsumida: "20",
                    unidade: "KG",
                    dataConsumo: "22/03/2025",
                    responsavel: "Ana Beatriz",
                    obs: "Observação do consumo de Insumo"
                  },
                  
                ].map((insumo, index) => (
                  <tr
                    key={insumo.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                  >
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.id}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.insumo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.codigo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.qtdConsumida}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.unidade}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.responsavel}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{insumo.dataConsumo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button 
                          className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          onClick={() => openModal("Observações", insumo.obs)}
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

         {/* Fim aba de Lista de Insumos */}         
        </Tabs.Content>
        
        {/* Aba de Cadastro de Consumo */}  
        <Tabs.Content
          value="register"
          className="flex items-center justify-center"
        >
          <Form.Root className="flex flex-col">
            <h2 className="text-3xl mb-8">Cadastro de Consumo:</h2>

            {/* Linha ID e Insumo utilizado*/} 
            <div className="flex gap-x-25 mb-10 items-center">
              <Form.Field name="id" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Código do insumo:
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="id"
                    id="id"
                    placeholder="Digite o código do insumo"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
              
              <Form.Field name="insumo" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Insumo Utilizado:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="insumo"
                    id="insumo"
                    placeholder="Digite o insumo utilizado"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
            </div>
            
            {/* Linha Quantidade e unidade*/} 
            <div className="flex gap-x-25 mb-10 items-center">
              <Form.Field name="quantidade" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Quantidade:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="number"
                    name="quantidade"
                    id="quantidade"
                    placeholder="Digite a quantidade utilizada"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="unit" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Uni. de Medida
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="unit"
                    id="unit"
                    className="bg-white w-[248px] border border-separator rounded-lg p-2.5 shadow-xl"
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

            </div>
            
            {/* Linha Responsável e data*/} 
            <div className="flex gap-x-25 mb-10 items-center">
              <Form.Field name="responsavel" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Responsável:
                  </span>
                  </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="responsavel"
                    id="responsavel"
                    placeholder="Digite o nome do Responsável"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="data" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Data do consumo:</span>
                </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="date"
                        name="data"
                        id="data"
                        required
                        className="bg-white border border-separator rounded-lg p-2.5 shadow-xl w-61"
                      />
                    </Form.Control>
                    </Form.Field>
            </div>
            <div className="flex gap-x-25 mb-5 items-center">
            <Form.Field name="ClientObservation"className="w-full flex flex-col col-span-full">
                  <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Observações:</span>
                  </Form.Label>
                  <Form.Control asChild>
                  <textarea
                      id="ClientObservation"
                      name="ClientObservation"
                      rows={2}
                      cols={50}
                      placeholder="Digite as observações do consumo de insumo"
                      maxLength={500}
                      className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                  ></textarea>
                  </Form.Control>
              </Form.Field>    
            </div>
            <Form.Submit asChild >
            <div className="flex place-content-center mb-10 mt-5">
              <button
                type="submit"
                className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
              >
                Cadastrar Consumo
              </button>
            </div>
            </Form.Submit>
          </Form.Root>

        {/* Fim aba de cadastro de Insumos*/} 
        </Tabs.Content>
        
      </Tabs.Root>
    </div>
  );
}
