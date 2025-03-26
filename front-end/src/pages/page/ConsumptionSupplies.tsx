import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash } from "lucide-react";

export default function ConsumptionSupplies() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center">Consumo de Insumos</h1>

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
            Cadastrar Consumo
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
            <div className="flex gap-7">

              {/* Coluna Nome e Email */}
              <div className="flex gap-7 mb-10 justify-between">

                <Form.Field name="filter-id" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      ID:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-id"
                      id="filter-id"
                      placeholder="ID"
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
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
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-data" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Data:</span>
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
                </div>

              {/* Quantidade Consumida e unidade */}
              <div className="flex gap-7 mb-10 items-center">
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
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-unidade" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Unidade:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-unidade"
                      id="filter-unidade"
                      placeholder="Ex: G / KG / L"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

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
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                    </input>
                  </Form.Control>
                </Form.Field>

                <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Submit asChild >
                  <div className="flex place-content-center mt-5">
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
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Insumo</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Quantidade Consumida</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Unidade</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Responsável</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Data</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: "1",
                    insumo: "Farinha de trigo",
                    qtdconsumida: "10",
                    unidade: "KG",
                    responsavel: "Guilherme Anholeto",
                    data: "24/02/2025",
                  },
                  {
                    id: "2",
                    insumo: "Óleo Vegetal",
                    qtdconsumida: "2",
                    unidade: "L",
                    responsavel: "Fernando Kotinda",
                    data: "20/12/2024",
                  },
                  {
                    id: "3",
                    insumo: "Fermento Biológico",
                    qtdconsumida: "500",
                    unidade: "G",
                    responsavel: "Carlos Bandeira",
                    data: "01/02/2025",
                  },
                  {
                    id: "4",
                    insumo: "Tomate",
                    qtdconsumida: "20",
                    unidade: "KG",
                    responsavel: "Ana Beatriz",
                    data: "21/01/2025",
                  },
                  
                ].map((usuario, index) => (
                  <tr
                    key={usuario.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                  >
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.id}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.insumo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.qtdconsumida}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.unidade}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.responsavel}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap text-center">{usuario.data}</td>
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
                    ID:
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="number"
                    name="id"
                    id="id"
                    placeholder="Digite um ID para registro"
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

              <Form.Field name="unidade" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Undidade:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="unidade"
                    id="unidade"
                    placeholder="Utilize: KG / G / L"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
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
                  <span className="text-xl pb-2 font-light">Data:</span>
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
