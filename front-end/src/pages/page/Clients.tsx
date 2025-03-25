import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash } from "lucide-react";

export default function Clients() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="px-6 font-[inter]">
      <h1 className="text-[40px] font-semibold text-center">Clientes</h1>

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
            Lista de Clientes
          </Tabs.Trigger>

          <Tabs.Trigger
            value="register"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "register" ? "select animation-tab" : ""
            }`}
          >
            Cadastrar Clientes
          </Tabs.Trigger>
        </Tabs.List>

        {/* Aba de Lista de Clientes */}
        <Tabs.Content value="list" className="flex flex-col w-full">
          {/* Filtro de Clientes */}
          <Form.Root className="flex flex-col gap-4">
            <h2 className="text-3xl">Filtros:</h2>
            <div className="flex gap-7">
              {/* Coluna Nome e Telefone */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="filter-name" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Nome do Cliente:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-name"
                      id="filter-name"
                      placeholder="Nome completo"
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-telefone" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Telefone:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="tel"
                      name="filter-telefone"
                      id="filter-telefone"
                      placeholder="XXXXXXXX-XXXX"
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>
              </div>

              {/* Coluna CPF e CEP */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="filter-cpf" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">CPF:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-cpf"
                      id="filter-cpf"
                      placeholder="XXXXXXXX-XX"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-cep" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">CEP:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-cep"
                      id="filter-cep"
                      placeholder="XXXXX-XXX"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>
              </div>

              {/* Coluna Tipo e Status */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="filter-tipo" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Tipo:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <select
                      name="filter-tipo"
                      id="filter-tipo"
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="todos">Todos</option>
                      <option value="pessoa_fisica">Pessoa Física</option>
                      <option value="pessoa_juridica">Pessoa Jurídica</option>
                    </select>
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-status" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Status:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <select
                      name="filter-status"
                      id="filter-status"
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="todos">Todos</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </Form.Control>
                </Form.Field>
              </div>

              {/* Coluna Data de Cadastro e Botão Pesquisar */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="data-cadastro" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Data de Cadastro:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input 
                      type="date" 
                      name="data-cadastro" 
                      id="data-cadastro"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Submit asChild>
                  <div className="flex place-content-center mt-5">
                    <button
                      type="submit"
                      className="bg-verdeMedio p-3 w-[70%] rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
                    >
                      <Search />
                      Pesquisar
                    </button>
                  </div>
                </Form.Submit>
              </div>
            </div>
          </Form.Root>
        
          {/* Tabela Lista de Clientes */}
          <div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-verdePigmento text-white shadow-thead">
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Nome</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">E-mail</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Telefone</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">CPF</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">CEP</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Tipo</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Cidade</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Status</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    nome: "André Maia",
                    email: "andre@email.com",
                    telefone: "1199999-9999",
                    cpf: "123.456.789-00",
                    cep: "01234-567",
                    tipo: "Pessoa Física",
                    cidade: "curitiba",
                    status: "Ativo",
                    dataCadastro: "01/01/2025",
                  },
                  {
                    nome: "Empresa XYZ Ltda",
                    email: "contato@xyz.com",
                    telefone: "213333-4444",
                    cpf: "00.000.000/0001-00",
                    cep: "20000-000",
                    tipo: "Pessoa Jurídica",
                    cidade: "Rio de Janeiro",
                    status: "Ativo",
                    dataCadastro: "15/02/2025",
                  },
                ].map((cliente, index) => (
                  <tr
                    key={cliente.cpf}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                  >
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.nome}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.email}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.telefone}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.cpf}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.cep}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.tipo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.cidade}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{cliente.status}</td>
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
        </Tabs.Content>
        
        {/* Aba de Cadastro de Clientes */}  
        <Tabs.Content value="register" className="flex items-center justify-center">
          <Form.Root className="flex flex-col w-full max-w-4xl">
            <h2 className="text-3xl mb-8">Cadastro de clientes:</h2>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6 mb-10">
              <Form.Field name="nome" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Nome do cliente:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="nome"
                    id="nome"
                    placeholder="Nome Completo"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="email" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">E-mail:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Digite o e-mail do cliente"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="telefone" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Telefone:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="tel"
                    name="telefone"
                    id="telefone"
                    placeholder="XXXXXXXX-XXXX"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="cep" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">CEP:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cep"
                    id="cep"
                    placeholder="XXXXX-XXX"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="cpf" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">CPF:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cpf"
                    id="cpf"
                    placeholder="XXXXXXXX-XX"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="estado" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Estado:</span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="estado"
                    id="estado"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="">Selecionar</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    {/* outros estados */}
                  </select>
                </Form.Control>
              </Form.Field>

              <Form.Field name="tipo" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Tipo:</span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="tipo"
                    id="tipo"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="">Selecionar</option>
                    <option value="pessoa_fisica">Pessoa Física</option>
                    <option value="pessoa_juridica">Pessoa Jurídica</option>
                  </select>
                </Form.Control>
              </Form.Field>

              <Form.Field name="cidade" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Cidade:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cidade"
                    id="cidade"
                    placeholder="Cidade"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="endereco" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Endereço:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="endereco"
                    id="endereco"
                    placeholder="Endereço completo"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="status" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Status:</span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="status"
                    id="status"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="">Selecionar</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </Form.Control>
              </Form.Field>
            </div>

            <Form.Submit asChild>
              <div className="flex place-content-center mb-10 mt-5">
                <button
                  type="submit"
                  className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra hover:bg-verdeGrama"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </Form.Submit>
          </Form.Root>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}