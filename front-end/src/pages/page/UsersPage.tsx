import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Eye, EyeOff, Search, PencilLine, Trash } from "lucide-react";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center">Usuários</h1>

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
            Lista de Usuários
          </Tabs.Trigger>

          <Tabs.Trigger
            value="register"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "register" ? "select animation-tab" : ""
            }`}
          >
            Cadastrar Usuários
          </Tabs.Trigger>
        </Tabs.List>

        {/* Aba de Lista de Usuários */}
        <Tabs.Content 
          value="list"
          className="flex flex-col w-full"
        > 
          {/* Filtro de Usuários */}
          <Form.Root className="flex flex-col gap-4 ">
            <h2 className="text-3xl">Filtros:</h2>
            <div className="flex gap-7">

              {/* Coluna Nome e Email */}
              <div className="flex flex-col gap-7 mb-10 justify-between">

                <Form.Field name="filter-name" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Nome Completo:
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

                <Form.Field name="filter-email" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Email:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="email"
                      name="filter-email"
                      id="filter-email"
                      placeholder="Email"
                      autoComplete="email"
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

              </div>

              {/* Coluna CPF e Cargo */}
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
                      placeholder="xxx.xxx.xxx-xx"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-cargo" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Cargo:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-cargo"
                      id="filter-cargo"
                      placeholder="Cargo"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>
              </div>

              {/* Coluna Telefone e Nivel de Acesso */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="filter-tel" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Telefone:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="tel"
                      name="filter-tel"
                      id="filter-tel"
                      placeholder="(xx)xxxxx-xxxx"
                      autoComplete="tel"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-nivel" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Nível de Acesso:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <select
                      name="filter-nivel"
                      id="filter-nivel"
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="funcionario">Funcionário</option>
                      <option value="gerente">Gerente</option>
                      <option value="admin">Administrador</option>
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

                <Form.Submit asChild >
                  <div className="flex place-content-center mt-5">
                    <button
                      type="submit"
                      className="bg-verdeMedio p-3 w-[70%] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
                    >
                      <Search />
                      Pesquisar
                    </button>
                  </div>
                </Form.Submit>
              </div>

            </div>
          </Form.Root>
        
          {/* Tabela Lista de Usuários */}
          <div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-verdePigmento text-white shadow-thead">
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Nome</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Email</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Telefone</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">CPF</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Cargo</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Nível de Acesso</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Data de Cadastro</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    nome: "Fernando Kotinda",
                    email: "fernando@email.com",
                    telefone: "(11) 99999-9999",
                    cpf: "123.456.789-00",
                    cargo: "Gerente",
                    nivelAcesso: "Administrador",
                    dataCadastro: "01/01/2025",
                  },
                  {
                    nome: "Carlos Bandeira",
                    email: "carlos@email.com",
                    telefone: "(21) 98888-8888",
                    cpf: "987.654.321-00",
                    cargo: "Coordenador",
                    nivelAcesso: "Gerente",
                    dataCadastro: "15/02/2025",
                  },
                  {
                    nome: "Murilo Luiz",
                    email: "nurilo@email.com",
                    telefone: "(31) 97777-7777",
                    cpf: "111.222.333-44",
                    cargo: "Analista",
                    nivelAcesso: "Funcionário",
                    dataCadastro: "28/02/2025",
                  },
                  {
                    nome: "Guilherme Santos",
                    email: "guilherme@email.com",
                    telefone: "(41) 96666-6666",
                    cpf: "555.666.777-88",
                    cargo: "Assistente",
                    nivelAcesso: "Funcionário",
                    dataCadastro: "10/03/2025",
                  },
                  
                ].map((usuario, index) => (
                  <tr
                    key={usuario.cpf}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                  >
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.nome}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.email}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.telefone}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.cpf}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.cargo}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.nivelAcesso}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{usuario.dataCadastro}</td>
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

         {/* Fim aba de Lista de Usuários */}         
        </Tabs.Content>
        
        {/* Aba de Cadastro de Usuários */}  
        <Tabs.Content
          value="register"
          className="flex items-center justify-center"
        >
          <Form.Root className="flex flex-col">
            <h2 className="text-3xl mb-8">Cadastro de usuários:</h2>

            {/* Linha Nome e Email*/} 
            <div className="flex gap-x-25 mb-10 justify-between">
              <Form.Field name="name" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Nome Completo:
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Digite seu nome completo"
                    required
                    autoComplete="name"
                    className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
              
              <Form.Field name="email" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Email:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Digite seu email"
                    required
                    autoComplete="email"
                    className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
            </div>
            
            {/* Linha Telefone, CPF, e Cargo*/} 
            <div className="flex gap-x-25 mb-10 justify-between">
              <Form.Field name="tel" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Telefone:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="tel"
                    name="tel"
                    id="tel"
                    placeholder="(xx)xxxxx-xxxx"
                    required
                    autoComplete="tel"
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
                    placeholder="Digite seu CPF"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="cargo" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Cargo:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cargo"
                    id="cargo"
                    placeholder="Digite seu Cargo"
                    required
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
            </div>
            
            {/* Linha Nivel de Acesso e Senha*/} 
            <div className="flex gap-x-25 mb-10 items-center">
              <Form.Field name="nivel" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                    Nível de Acesso:
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <select
                    name="nivel"
                    id="nivel"
                    required
                    className="bg-white w-[240px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </Form.Control>
              </Form.Field>

              <Form.Field name="password" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Senha:</span>
                </Form.Label>
                <div className="flex gap-4">
                  <div className="relative">
                    <Form.Control asChild>
                      <input
                        type={isHidden ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="Gerada aleatoriamente"
                        required
                        className="bg-white w-[240px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                    {/* Botão de Mostrar/Ocultar Senha */}
                    <button
                      type="button"
                      onClick={() => setIsHidden(!isHidden)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                    >
                      {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {/* Botão de Gerar Senha Aleatoria */}
                  <button className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer   hover:bg-verdeEscuro">
                    Gerar Senha
                  </button>
                </div>
              </Form.Field>
            </div>
            <Form.Submit asChild >
            <div className="flex place-content-center mb-10 mt-5">
              <button
                type="submit"
                className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
              >
                Cadastrar Usuário
              </button>
            </div>
            </Form.Submit>
          </Form.Root>

        {/* Fim aba de cadastro de usuários*/} 
        </Tabs.Content>
        
      </Tabs.Root>
    </div>
  );
}
