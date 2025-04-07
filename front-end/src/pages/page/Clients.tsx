import { Tabs, Form, Dialog } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash, Eye } from "lucide-react";

export default function Clients() {
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
    <div className="flex-1 p-6 pl-[280px]">
      <div className="px-6 font-[inter]">
        <h1 className="text-[40px] font-semibold text-center mb-3">Clientes</h1>

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
                      <span className="text-xl pb-2 font-light">
                        Nome do Cliente:
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-name"
                        id="filter-name"
                        placeholder="Nome completo"
                        autoComplete="name"
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
                        autoComplete="tel"
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
                      <span className="text-xl pb-2 font-light">CPF/CNPJ:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filter-cpf"
                        id="filter-cpf"
                        placeholder="Digite o CPF ou CNPJ"
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
                        autoComplete="postal-code"
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
                      <span className="text-xl pb-2 font-light">
                        Data de Cadastro:
                      </span>
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
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      ID
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Nome
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      E-mail
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Telefone
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      CPF
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      CEP
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Tipo
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Cidade
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Status
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Data de Cadastro
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Observações
                    </th>
                    <th className="border border-black px-4 py-4 whitespace-nowrap">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 1,
                      nome: "André Maia",
                      email: "andre@email.com",
                      telefone: "(11)99999-9999",
                      cpf: "123.456.789-00",
                      cep: "01234-567",
                      tipo: "Pessoa Física",
                      cidade: "Curitiba",
                      status: "Ativo",
                      dataCadastro: "01/01/2025",
                      obs: "Observações do Cliente",
                    },
                    {
                      id: 2,
                      nome: "Empresa XYZ Ltda",
                      email: "contato@xyz.com",
                      telefone: "(21)3333-4444",
                      cpf: "00.000.000/0001-00",
                      cep: "20000-000",
                      tipo: "Pessoa Jurídica",
                      cidade: "Rio de Janeiro",
                      status: "Ativo",
                      dataCadastro: "15/02/2025",
                      obs: "Observações do Cliente",
                    },
                  ].map((cliente, index) => (
                    <tr
                      key={cliente.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                    >
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.id}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.nome}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.email}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.telefone}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.cpf}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.cep}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.tipo}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.cidade}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.status}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {cliente.dataCadastro}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          onClick={() => openModal("Observações", cliente.obs)}
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
                  <Dialog.Title className="text-xl font-bold mb-4">
                    {modalTitle}
                  </Dialog.Title>
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

          {/* Aba de Cadastro de Clientes */}
          <Tabs.Content
            value="register"
            className="flex items-center justify-center"
          >
            <Form.Root className="flex flex-col w-full max-w-4xl">
              <h2 className="text-3xl mb-8">Cadastro de clientes:</h2>

              <div className="grid grid-cols-2 gap-x-10 gap-y-6 mb-10">
                <Form.Field name="nome" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Nome do cliente:
                    </span>
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
                      placeholder="(XX)XXXXX-XXXX"
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
                      autoComplete="postal-code"
                      required
                      className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="cpf" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">CPF/CNPJ:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="cpf"
                      id="cpf"
                      placeholder="Digite seu CPF ou CNPJ"
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
                      autoComplete="address-level1"
                      className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="">Selecionar</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
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
                      autoComplete="address-level2"
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
                      autoComplete="street-address"
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

                <Form.Field
                  name="ClientObservation"
                  className="w-full flex flex-col col-span-full"
                >
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Observações:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <textarea
                      id="ClientObservation"
                      name="ClientObservation"
                      rows={3}
                      cols={50}
                      placeholder="Digite as observações do cliente"
                      maxLength={500}
                      className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                    ></textarea>
                  </Form.Control>
                </Form.Field>
              </div>

              <Form.Submit asChild>
                <div className="flex place-content-center mb-10 mt-0">
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
    </div>
  );
}
