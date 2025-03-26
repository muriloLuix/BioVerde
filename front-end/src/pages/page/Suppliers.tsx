import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Search, PencilLine, Trash } from "lucide-react";

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center mb-3">Fornecedores</h1>

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
            Lista de Fornecedores
          </Tabs.Trigger>

          <Tabs.Trigger
            value="register"
            className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
              activeTab === "register" ? "select animation-tab" : ""
            }`}
          >
            Cadastrar Fornecedores
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
                      Nome Empresa:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-name"
                      id="filter-name"
                      placeholder="Nome completo"
                      className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
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
                      className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

              </div>

              {/* Coluna CPF e Cargo */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="filter-cnpj" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">CPF/CNPJ:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-cnpj"
                      id="filter-cnpj"
                      placeholder="Digite o CPF/CNPJ"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="filter-cidade" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Cidade:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="filter-cidade"
                      id="filter-cidade"
                      placeholder="Cidade"
                      autoComplete="address-level2"
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
                    <option value="" disabled>Selecionar</option>
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
                <th className="border border-black px-4 py-4 whitespace-nowrap">ID</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Nome Empresa</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Email</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Telefone</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">CPF/CNPJ</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Cidade</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Estado</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">CEP</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Responsável</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Status</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Data de Cadastro</th>
                  <th className="border border-black px-4 py-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    nome: "Empresa XYZ Ltda",
                    email: "contato@xyz.com",
                    telefone: "(11) 98765-4321",
                    cnpj: "12.345.678/0001-99",
                    cidade: "São Paulo",
                    estado: "SP",
                    cep: "01311-000",
                    responsavel: "Carlos Bandeira",
                    status: "Ativo",
                    dataCadastro: "15/03/2025"
                  },
                  {
                    id: 2,
                    nome: "Alimentos Saudáveis S.A.",
                    email: "vendas@alimentossaude.com.br",
                    telefone: "(21) 99876-5432",
                    cnpj: "98.765.432/0001-01",
                    cidade: "Rio de Janeiro",
                    estado: "RJ",
                    cep: "20040-010",
                    responsavel: "Leonardo Oliveira",
                    status: "Ativo",
                    dataCadastro: "10/02/2025"
                  },

                  
                ].map((fornecedor, index) => (
                  <tr
                    key={fornecedor.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                  >
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.id}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.nome}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.email}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.telefone}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.cnpj}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.cidade}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.estado}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.cep}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.responsavel}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.status}</td>
                    <td className="border border-black px-4 py-4 whitespace-nowrap">{fornecedor.dataCadastro}</td>
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
            <h2 className="text-3xl mb-8">Cadastro de fornecedores:</h2>

            {/* Linha Nome e Email*/} 
            <div className="flex gap-x-15 mb-10 justify-between">
              <Form.Field name="name" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                  Nome Fantasia da Empresa:
                  </span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Digite Nome Fantasia da Empresa"
                    required
                    className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="razaoSocial" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Razao Social:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="razaoSocial"
                    id="razaoSocial"
                    placeholder="Digite a Razão Social da Empresa"
                    required
                    className="bg-white border w-[460px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              
            </div>
          

            <div className="flex gap-x-15 mb-10 justify-between">
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
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="cnpj" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">CPF/CNPJ:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cnpj"
                    id="cnpj"
                    placeholder="Digite seu CPF/CNPJ"
                    required
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>

            </div>
            <div className="flex gap-x-15 mb-10 justify-between">
              <Form.Field name="resp" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Responsável:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text" 
                    name="resp"
                    id="resp"
                    placeholder="Digite o responsável"
                    required
                    className="bg-white border w-[400px] border-separator rounded-lg p-2.5 shadow-xl"
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
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="" disabled>Selecionar</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </Form.Control>
              </Form.Field>

              <Form.Field name="cargo" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">CEP:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="cep"
                    id="cep"
                    placeholder="xxxxx-xxx"
                    required
                    autoComplete="postal-code"
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                </Form.Control>
              </Form.Field>
            </div>
            
            {/* Linha Nivel de Acesso e Senha*/} 
            <div className="flex gap-x-15 mb-10 items-center">
            <Form.Field name="cargo" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Endereço:</span>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="Endereço"
                    id="Endereço"
                    placeholder="Endereço Completo"
                    required
                    autoComplete="street-address"
                    className="bg-white border w-[400px] border-separator rounded-lg p-2.5 shadow-xl"
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
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
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
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
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
                Cadastrar Fornecedor
              </button>
            </div>
            </Form.Submit>
          </Form.Root>

        </Tabs.Content>
        
      </Tabs.Root>
    </div>
  );
}
