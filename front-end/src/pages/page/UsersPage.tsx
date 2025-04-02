import { useState, useEffect } from "react";
import { Tabs, Form, Toast } from "radix-ui";
import { Search, PencilLine, Trash, X, Loader2} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InputMaskChangeEvent } from 'primereact/inputmask';
import axios from "axios";

import NameField from "../../shared/components/usersComponents/NameField";
import EmailField from "../../shared/components/usersComponents/EmailField";
import { Email } from "../../shared";
import PhoneField from "../../shared/components/usersComponents/PhoneField";
import Phone from "../../shared/components/Phone";
import CpfField from "../../shared/components/usersComponents/CpfField";
import Cpf from "../../shared/components/Cpf";
import { Password } from "../../shared";
                
interface Cargo {
  car_id: number;
  car_nome: string;
}

interface NivelAcesso {
  nivel_id: number;
  nivel_nome: string;
}

interface Usuario {
  user_id: number;
  user_nome: string;
  user_email: string;
  user_telefone: string;
  user_CPF: string;
  car_nome: string;
  nivel_nome: string;
  user_dtcadastro: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  // const [isHidden, setIsHidden] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(new Set());
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [errors, setErrors] = useState({
    position: false,
    level: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tel: "",
    cpf: "",
    cargo: "",
    nivel: "",
    password: "",
  });
  const [options, setOptions] = useState<{
    cargos: Cargo[];
    niveis: NivelAcesso[];
  }>({
    cargos: [],
    niveis: [],
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        
        setLoading((prev) => new Set([...prev, "users", "options"]));

        const [optionsResponse, usuariosResponse] = await Promise.all([
          axios.get("http://localhost/BioVerde/back-end/usuarios/listar_opcoes.php", {
            withCredentials: true,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }),
          axios.get("http://localhost/BioVerde/back-end/usuarios/listar_usuarios.php", {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          })
        ]);
  
        if (optionsResponse.data.success) {
          setOptions({
            cargos: optionsResponse.data.cargos,
            niveis: optionsResponse.data.niveis,
          });
        } else {
          setOpenModal(true);
          setMessage(optionsResponse.data.message || "Erro ao carregar opções");
        }
  
        if (usuariosResponse.data.success) {
          setUsuarios(usuariosResponse.data.usuarios);
        } else {
          setOpenModal(true);
          setMessage(usuariosResponse.data.message || "Erro ao carregar usuários");
        }
  
      } catch (error) {
        setOpenModal(true);
        setMessage("Erro ao conectar com o servidor");
  
        if (axios.isAxiosError(error)) {
          console.error("Erro na requisição:", error.response?.data || error.message);
          if (error.response?.data?.message) {
            setMessage(error.response.data.message);
          }
        } else {
          console.error("Erro desconhecido:", error);
        }
      } finally {
        setLoading((prev) => {
          const newLoading = new Set(prev);
          ["users", "options"].forEach((item) => newLoading.delete(item));
          return newLoading;
        });
      }
    };
  
    fetchData();
  }, []);
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | InputMaskChangeEvent ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setErrors((prevErrors) => ({ ...prevErrors, position: false, level: false, password: false }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.cargo) { 
      setErrors((prevErrors) => ({ ...prevErrors, position: true })); 
      return; 
    }
    if (!formData.nivel) { 
      setErrors((prevErrors) => ({ ...prevErrors, level: true })); 
      return; 
    }
    if (!formData.password || formData.password.length < 8) { 
      setErrors((prevErrors) => ({ ...prevErrors, password: true })); 
      return; 
    }

    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/cadastrar.usuario.php", 
        formData, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        setSuccessMsg(true);
        setMessage("Usuário cadastrado com sucesso! O login e senha foram enviados por email.");
        setFormData({
          name: "",
          email: "",
          tel: "",
          cpf: "",
          cargo: "",
          nivel: "",
          password: "",
        });
      } else {
        setMessage(response.data.message || "Erro ao cadastrar usuário");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message || "Erro no servidor");
        console.error("Erro na resposta:", error.response.data);
      } else {
        setMessage("Erro ao conectar com o servidor");
        console.error("Erro na requisição:", error);
      }
    } finally {
      setOpenModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("submit");
        return newLoading;
      });
    }
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) { 
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  
    setFormData({ ...formData, password: newPassword });
    setErrors((prevErrors) => ({ ...prevErrors, password: false }));  
  };

  console.log("Usuários:", JSON.stringify(usuarios, null, 2));

  return (
    <div className="px-6 font-[inter]">
      <h1 className=" text-[40px] font-semibold text-center mb-3">Usuários</h1>

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
                    <span className="text-xl pb-2 font-light">
                      Cargo:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <select
                      name="filter-cargo"
                      id="filter-cargo"
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="todos">Todos</option>
                      <option value="funcionario">Analista de Vendas</option>
                      <option value="funcionario">Analista de Estoque</option>
                      <option value="funcionario">Técnico em Agropecuária</option>
                      <option value="funcionario">Engenheiro Agrônomo</option>
                      <option value="funcionario">Engenheiro de Alimentos</option>
                      <option value="gerente">Gerente Administrativo</option>
                      <option value="gerente">Gerente Financeiro</option>
                      <option value="gerente">Gerente Comercial</option>
                      <option value="gerente">Gerente Qualidade </option>
                      <option value="gerente">Coordenador</option>
                      <option value="admin">Diretor</option>
                    </select>
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
                      <option value="todos">Todos</option>
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
              {/* Tabela Cabeçalho */}
              <thead>
                <tr className="bg-verdePigmento text-white shadow-thead">
                  {[
                    "ID", "Nome", "Email", "Telefone", "CPF", "Cargo", "Nível de Acesso",
                    "Data de Cadastro", "Ações"
                  ].map((header) => (
                    <th key={header} className="border border-black px-4 py-4 whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading.has("users") ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  //Tabela Dados
                  usuarios.map((usuario) => (
                    <tr
                      key={usuario.user_id}
                      className={usuario.user_id % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                    >
                      {Object.values(usuario).slice(0, 7).map((value, idx) => (
                        <td key={idx} className="border border-black px-4 py-4 whitespace-nowrap">{value}</td>
                      ))}
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {new Date(usuario.user_dtcadastro).toLocaleDateString('pt-BR')}
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
                  ))
                )}
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
          <Form.Root className="flex flex-col" onSubmit={handleSubmit}>
            <h2 className="text-3xl mb-8">Cadastro de usuários:</h2>

            {/* Linha Nome e Email*/} 
            <div className="flex mb-10 justify-between">
              <NameField
                value={formData.name}
                onChange={handleChange}
                required
              />

              <EmailField>
                <Email 
                  placeholder="Digite o email"
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                />
              </EmailField>
            </div>
            
            {/* Linha Telefone, CPF, e Cargo*/} 
            <div className="flex gap-x-15 mb-10 justify-between">
              
              <PhoneField>
                <Phone
                  required  
                  phoneValue={formData.tel}
                  setPhone={handleChange}
                />
              </PhoneField>

              <CpfField>
                <Cpf
                  required  
                  cpfValue={formData.cpf}
                  setCpf={handleChange}
                />
              </CpfField>

              <Form.Field name="cargo" className="flex flex-col">
                <Form.Label className="flex justify-between items-center">
                  <span className="text-xl pb-2 font-light">Cargo:</span>
                  {errors.position && <span className="text-red-500 text-xs">Campo obrigatório*</span>}
                </Form.Label>
                {loading.has("options") ? (
                  <div className="bg-white w-[275px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5" />
                  </div>
                ) : (
                  <select
                    name="cargo"
                    id="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    className="bg-white w-[275px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="" disabled>Selecione o cargo</option>
                    {options.cargos.map((cargo) => (
                      <option key={cargo.car_id} value={cargo.car_nome}>
                        {cargo.car_nome}
                      </option>
                    ))}
                  </select>
                )}
              </Form.Field>
                
            </div>
            
            {/* Linha Nivel de Acesso e Senha*/} 
            <div className="flex gap-x-15 mb-10 items-center">
            <Form.Field name="nivel" className="flex flex-col">
              <Form.Label className="flex justify-between items-center gap-3">
                <span className="text-xl pb-2 font-light">Nível de Acesso:</span>
                {errors.level && <span className="text-red-500 text-xs">Campo obrigatório*</span>}
              </Form.Label>
              {loading.has("options") ? (
                <div className="bg-white w-[275px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5" />
                </div>
              ) : (
                <select
                  name="nivel"
                  id="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  className="bg-white w-[275px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl"
                >
                  <option value="" disabled>Selecione o nível de acesso</option>
                  {options.niveis.map((nivel) => (
                    <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                      {nivel.nivel_nome}
                    </option>
                  ))}
                </select>
              )}
            </Form.Field>

              <Form.Field name="password" className="flex flex-col">
                <Form.Label className="flex gap-25 items-center">
                  <span className="text-xl pb-2 font-light">Senha:</span>
                  {errors.password && <span className="text-red-500 text-xs">A senha deve ter pelo menos 8 caracteres*</span>}
                </Form.Label>
                <div className="flex gap-4">
                  <Password
                    placeholder="Digite ou Gere a senha"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-white w-[275px] border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                  {/* Botão de Gerar Senha Aleatoria */}
                  <button 
                    type="button"
                    className="bg-verdeMedio p-2.5 rounded-2xl text-white cursor-pointer hover:bg-verdeEscuro"
                    onClick={generatePassword}
                  >
                    Gerar Senha
                  </button>
                </div>
              </Form.Field>
            </div>

            <Form.Submit asChild >
            <div className="flex place-content-center mb-10 mt-5">
              <button
                type="submit"
                className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center w-50"
                disabled={loading.size > 0}
              >
                {loading.has("submit") ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  "Cadastrar Usuário"
                )}
              </button>
            </div>
            </Form.Submit>
          </Form.Root>

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
                    className={`fixed bottom-4 right-4 w-95 p-4 rounded-lg text-white sombra ${successMsg ? "bg-verdePigmento" : "bg-ErroModal" }`}
                  >
                    <div className="flex justify-between items-center pb-2">
                      <Toast.Title className="font-bold text-lg">
                        {successMsg ? "Sucesso!" : "Erro!" }
                      </Toast.Title>
                      <Toast.Close className="ml-4 p-1 rounded-full hover:bg-white/20 cursor-pointer">
                        <X size={25} />
                      </Toast.Close>
                    </div>
                    <Toast.Description>
                      {message}
                    </Toast.Description>

                  </motion.div>
                </Toast.Root>
              )}
            </AnimatePresence>
     
            <Toast.Viewport className="fixed bottom-4 right-4" />
          </Toast.Provider>

        {/* Fim aba de cadastro de usuários*/} 
        </Tabs.Content>
        
      </Tabs.Root>
    </div>
  );
}
