import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// import { Separator } from "radix-ui";
export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center">Usuários</h1>
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

        <Tabs.Content value="list">
          <h2 className="text-3xl">Lista de usuários:</h2>
        </Tabs.Content>

        <Tabs.Content
          value="register"
          className="flex items-center justify-center"
        >
          <Form.Root className="flex flex-col">
            <h2 className="text-3xl mb-8">Cadastro de usuários:</h2>
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

            <div className="flex place-content-center mb-10 mt-5">
              <button
                type="submit"
                className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
              >
                Cadastrar Usuário
              </button>
            </div>

            <Form.Submit />
          </Form.Root>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
