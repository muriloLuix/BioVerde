import { useState, useEffect } from "react";
import { Tabs, Form, Toast, Dialog, AlertDialog } from "radix-ui";
import { Search, PencilLine, Trash, X, Loader2, FilterX, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask';
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

interface Status{
  sta_id: number;
  sta_nome: string;
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
  sta_id?: number;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [errors, setErrors] = useState({
    position: false,
    level: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    user_id: 0,
    name: "",
    email: "",
    tel: "",
    cpf: "",
    cargo: "",
    nivel: "",
    password: "",
    status: "",
  });
  const [options, setOptions] = useState<{
    cargos: Cargo[];
    niveis: NivelAcesso[];
    status: Status[];
  }>({
    cargos: [],
    niveis: [],
    status: [] 
  });
  const [filters, setFilters] = useState({
    fname: "",
    fcargo: "",
    fcpf: "",
    fnivel: "",
    ftel: "",
    fstatus: "",
    fdataCadastro: "",
  });
  const [deleteUser, setDeleteUser] = useState({
    dname: "",
    reason: "",
  })

  //OnChange dos campos
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | InputMaskChangeEvent ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setFilters({ ...filters, [event.target.name]: event.target.value });
    setErrors((prevErrors) => ({ ...prevErrors, position: false, level: false, password: false }));
    setDeleteUser({ ...deleteUser, [event.target.name]: event.target.value });
  };

  //função para puxar os dados do usuario que será editado
  const handleEditClick = (usuario: Usuario) => {
    setFormData({
      user_id: usuario.user_id, 
      name: usuario.user_nome,
      email: usuario.user_email,
      tel: usuario.user_telefone, 
      cpf: usuario.user_CPF,
      cargo: usuario.car_nome,
      nivel: usuario.nivel_nome,
      status: usuario.sta_id?.toString() || usuario.user_status,
      password: "",
    });
    setOpenEditModal(true);
  };

  //função para puxar o nome do usuário que será excluido
  const handleDeleteClick = (usuario: Usuario) => {
    setDeleteUser({
      dname: usuario.user_nome,
      reason: "",
    });
    setOpenDeleteModal(true);
  };

  //Carrega a lista de usuario e as opções nos selects ao renderizar a página
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
            status: optionsResponse.data.status || [] 
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
  

  //Submit de cadastrar usuários
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validações
    setErrors({
      position: !formData.cargo,
      level: !formData.nivel,
      password: !formData.password || formData.password.length < 8
    });
  
    // Verifica se há erros
    if (!formData.cargo || !formData.nivel || !formData.password || formData.password.length < 8) {
      setOpenModal(true);
      setMessage("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }
  
    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);
  
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        tel: formData.tel,
        cpf: formData.cpf,
        cargo: formData.cargo,
        nivel: formData.nivel,
        password: formData.password,
        status: formData.status || "ativo" // Valor padrão se não informado
      };
  
      console.log("Dados sendo enviados:", payload); // Para debug
  
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/cadastrar.usuario.php", 
        payload, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
  
      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        setSuccessMsg(true);
        setMessage("Usuário cadastrado com sucesso! O login e senha foram enviados por email.");
        // Limpa o formulário
        setFormData({
          name: "",
          email: "",
          tel: "",
          cpf: "",
          cargo: "",
          nivel: "",
          password: "",
          status: ""
        });
      } else {
        setMessage(response.data.message || "Erro ao cadastrar usuário");
      }
    } catch (error) {
      let errorMessage = "Erro ao conectar com o servidor";
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data.message || "Erro no servidor";
          console.error("Erro na resposta:", error.response.data);
        } else {
          console.error("Erro na requisição:", error.message);
        }
      } else {
        console.error("Erro desconhecido:", error);
      }
      
      setMessage(errorMessage);
    } finally {
      setOpenModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("submit");
        return newLoading;
      });
    }
  };


  //submit de Filtrar usuários
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(filters)

    setLoading((prev) => new Set([...prev, "filterSubmit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/filtro.usuario.php", 
        filters, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      console.log("Filtros enviados:", filters);
      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        console.log("Query executada:", response.data.debug?.sql);
        console.log("Valores usados:", response.data.debug?.valores);
        setUsuarios(response.data.usuarios);
    }else {
        setMessage(response.data.message || "Nenhum usuário encontrado com esse filtro");
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
        newLoading.delete("filterSubmit");
        return newLoading;
      });
    }
  };

  //submit para atualizar o usuário após a edição dele
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setLoading((prev) => new Set([...prev, "updateUser"]));
    setSuccessMsg(false);
  
    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/editar.usuario.php", 
        formData, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
  
      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        setSuccessMsg(true);
        setMessage("Usuário atualizado com sucesso!");
        setOpenEditModal(false); 
      } else {
        setMessage(response.data.message || "Erro ao atualizar usuário.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) { // Corrigido aqui - faltava o parêntese de fechamento
        setMessage(error.response?.data?.message || "Erro no servidor");
        console.error("Erro na resposta:", error.response?.data);
      } else {
        setMessage("Erro ao conectar com o servidor");
        console.error("Erro na requisição:", error);
      }
    } finally {
      setOpenModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("updateUser");
        return newLoading;
      });
    }
  };

  //submit para excluir um usuário
  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "deleteUser"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/excluir.usuario.php", 
        deleteUser, 
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      console.log("Resposta do back-end:", response.data);
      
      if (response.data.success) {
        setSuccessMsg(true);
        setMessage("Usuário Excluído com sucesso!");
        setOpenConfirmModal(false); 
      } else {
        setMessage(response.data.message || "Erro ao excluir usuário.");
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
        newLoading.delete("deleteUser");
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
          <Form.Root onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
            <h2 className="text-3xl">Filtros:</h2>
            <div className="flex gap-7">

              {/* Coluna Nome e Email */}
              <div className="flex flex-col gap-7 mb-10 justify-between">

                <Form.Field name="fname" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                      Nome Completo:
                    </span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="text"
                      name="fname"
                      id="fname"
                      placeholder="Nome completo"
                      autoComplete="name"
                      value={filters.fname}
                      onChange={handleChange}
                      className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="fcargo" className="flex flex-col">
                <Form.Label className="flex justify-between items-center">
                  <span className="text-xl pb-2 font-light">Cargo:</span>
                </Form.Label>
                {loading.has("options") ? (
                  <div className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5" />
                  </div>
                ) : (
                  <select
                    name="fcargo"
                    id="fcargo"
                    value={filters.fcargo}
                    onChange={handleChange}
                    className="bg-white w-[280px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="">Todos</option>
                    {options.cargos.map((cargo) => (
                      <option key={cargo.car_id} value={cargo.car_nome}>
                        {cargo.car_nome}
                      </option>
                    ))}
                  </select>
                )}
              </Form.Field>

              </div>

              {/* Coluna CPF e Cargo */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="fcpf" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">CPF:</span>
                  </Form.Label>
                  <Form.Control asChild>
                  <InputMask
                    type="text"
                    name="fcpf"
                    id="fcpf"
                    placeholder="xxx.xxx.xxx-xx"
                    mask="999.999.999-99"
                    autoClear={false}
                    // pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    value={filters.fcpf}
                    onChange={handleChange}
                  />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="fnivel" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center gap-3">
                    <span className="text-xl pb-2 font-light">Nível de Acesso:</span>
                  </Form.Label>
                  {loading.has("options") ? (
                    <div className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5" />
                    </div>
                  ) : (
                    <select
                      name="fnivel"
                      id="fnivel"
                      value={filters.fnivel}
                      onChange={handleChange}
                      className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                      <option value="">Todos</option>
                      {options.niveis.map((nivel) => (
                        <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                          {nivel.nivel_nome}
                        </option>
                      ))}
                    </select>
                  )}
                </Form.Field>

              </div>

              {/* Coluna Telefone e Nivel de Acesso */}
              <div className="flex flex-col gap-7 mb-10 justify-between">

                <Form.Field name="ftel" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">Telefone:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <InputMask
                      type="tel"
                      name="ftel"
                      id="ftel"
                      placeholder="(xx)xxxxx-xxxx"
                      mask="(99) 9999?9-9999"
                      autoClear={false}
                      // pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                      autoComplete="tel"
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                      value={filters.ftel}
                      onChange={handleChange}
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="fstatus" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">
                  Status:
                  </span>
                </Form.Label>
                  <select
                  name="fstatus"
                  id="fstatus"
                  value={filters.fstatus}
                  onChange={handleChange}
                  className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </Form.Field>

              </div>

              {/* Coluna Data de Cadastro e Botão Pesquisar */}
              <div className="flex flex-col gap-7 mb-10 justify-between">
                <Form.Field name="fdataCadastro" className="flex flex-col">
                  <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Data de Cadastro:</span>
                  </Form.Label>
                  <Form.Control asChild>
                    <input 
                      type="date" 
                      name="fdataCadastro" 
                      id="fdataCadastro"
                      value={filters.fdataCadastro}
                      onChange={handleChange}
                      className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>

                <Form.Submit asChild >
                  <div className="flex gap-4 mt-5">
                    <button
                      type="submit"
                      className="bg-verdeMedio p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
                      disabled={loading.size > 0}
                    >
                      <Search />
                      {loading.has("filterSubmit") ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        "Filtrar"
                      )}
                    </button>
                    <button
                      type="button"
                      className="bg-verdeLimparFiltros p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-hoverLimparFiltros "
                      disabled={loading.size > 0}
                      onClick={() => setFilters((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, ""])) as typeof prev)}
                    >
                      <FilterX />
                      Limpar
                    </button>
                  </div>
                </Form.Submit>
              </div>

            </div>
          </Form.Root>
        
          {/* Tabela Lista de Usuários */}
          <div className="min-w-[1088px] max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-5">
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
                  usuarios.map((usuario, index) => (
                    <tr
                      key={usuario.user_id}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                    >
                      {Object.values(usuario).slice(0, 7).map((value, idx) => (
                        <td key={idx} className="border border-black px-4 py-4 whitespace-nowrap">{value}</td>
                      ))}
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {new Date(usuario.user_dtcadastro).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button className="mr-4 text-black cursor-pointer relative group" onClick={() => handleEditClick(usuario)}>
                          <PencilLine /> 
                          <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Editar
                          </div>
                        </button>
                        <button className="text-red-500 cursor-pointer relative group" onClick={() => handleDeleteClick(usuario)}>
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
          <div className="min-w-[1088px] max-w-[73vw]">
            <button type="button" className="bg-verdeGrama p-3 w-[180px] ml-auto mb-5 rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-[#246127]">
              <Printer />
              Gerar Relatório
            </button>
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
                    className="bg-white w-[243px] border border-separator rounded-lg p-2.5 shadow-xl"
                  />
                  {/* Botão de Gerar Senha Aleatoria */}
                  <button 
                    type="button"
                    className="bg-verdeMedio p-2.5 rounded-2xl whitespace-nowrap text-white cursor-pointer hover:bg-verdeEscuro"
                    onClick={generatePassword}
                  >
                    Gerar Senha
                  </button>
                </div>
              </Form.Field>

              <Form.Field name="status" className="flex flex-col">
                <Form.Label asChild>
                  <span className="text-xl pb-2 font-light">Status:</span>
                </Form.Label>
                {loading.has("options") ? (
                  <div className="bg-white w-[180px] h-[46px] flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <select
                    name="status"
                    id="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-white w-[180px] h-[46px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                    <option value="" disabled>Selecione o status</option>
                    {options.status?.map((status) => (
                      <option key={status.sta_id} value={status.sta_id}>
                        {status.sta_nome}
                      </option>
                    ))}
                  </select>
                )}
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

        {/* Fim aba de cadastro de usuários*/} 
        </Tabs.Content>

        {/* Modal de Avisos */}
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
                  className={`fixed bottom-4 right-4 w-95 p-4 rounded-lg text-white sombra z-102 ${successMsg ? "bg-verdePigmento" : "bg-ErroModal" }`}
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
    
          <Toast.Viewport className="fixed bottom-4 right-4 z-1000" />
        </Toast.Provider>
        
      </Tabs.Root>
      
      {/* Todo esse código abaixo será refatorado mais tarde! */}
            
      {/* Pop up de Edição */}
      <Dialog.Root open={openEditModal} onOpenChange={setOpenEditModal}>
        <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-100" />
        <Dialog.Content className="fixed bg-brancoSal p-6 rounded-lg shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-101">
            <Dialog.Title className="text-3xl mb-5">Editar Usuário:</Dialog.Title>
            <Dialog.Description>
            <Form.Root className="flex flex-col" onSubmit={handleUpdateUser}>

                {/* Linha Nome e Email*/} 
                <div className="flex mb-10 justify-between">

                <Form.Field name="name" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">Nome Completo:</span>
                    <Form.Message className="text-red-500 text-xs" match="valueMissing">
                    Campo obrigatório*
                    </Form.Message>
                  </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Digite o nome completo"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>  
                </Form.Field>

                <Form.Field name="email" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">Email:</span>
                    <Form.Message className="text-red-500 text-xs" match="valueMissing">
                      O e-mail é obrigatório* 
                    </Form.Message>
                    <Form.Message className="text-red-500 text-xs" match="typeMismatch">
                      Insira um e-mail válido* 
                    </Form.Message>
                  </Form.Label>
                  <Form.Control asChild>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Digite o email"
                      className="bg-white w-[300px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                  </Form.Control>
                </Form.Field>
                </div>
                
                {/* Linha Telefone, CPF, e status*/} 
                <div className="flex gap-x-15 mb-10 justify-between">
                
                <Form.Field name="tel" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">Telefone:</span>
                    <Form.Message className="text-red-500 text-xs" match="valueMissing">
                    Campo obrigatório*
                    </Form.Message>
                    <Form.Message className="text-red-500 text-xs" match="patternMismatch">
                    Formato inválido*
                    </Form.Message>
                  </Form.Label>
                  <Form.Control asChild>
                  <InputMask
                    type="tel"
                    name="tel"
                    id="tel"
                    placeholder="(xx)xxxxx-xxxx"
                    mask="(99) 9999?9-9999"
                    autoClear={false}
                    pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                    autoComplete="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="cpf" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                    <span className="text-xl pb-2 font-light">CPF:</span>
                    <Form.Message className="text-red-500 text-xs" match="valueMissing">
                      Campo obrigatório*
                    </Form.Message>
                    <Form.Message className="text-red-500 text-xs" match="patternMismatch">
                      Formato inválido*
                    </Form.Message>
                  </Form.Label>
                  <Form.Control asChild>
                  <InputMask
                    type="text"
                    name="cpf"
                    id="cpf"
                    placeholder="xxx.xxx.xxx-xx"
                    mask="999.999.999-99"
                    autoClear={false}
                    pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                    value={formData.cpf}
                    onChange={handleChange}
                    className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                  />
                  </Form.Control>
                </Form.Field>

                <Form.Field name="status" className="flex flex-col">
                    <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                    Status:
                    </span>
                    </Form.Label>
                    <select
                    name="status"
                    id="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-white w-[180px] h-[46px] border border-separator rounded-lg p-2.5 shadow-xl"
                    >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                    </select>
                </Form.Field>
                    
                </div>
                
                {/* Linha Cargo e Nivel de Acesso */} 
                <div className="flex gap-x-15 mb-10 items-center justify-between">
                <Form.Field name="cargo" className="flex flex-col">
                  <Form.Label className="flex justify-between items-center">
                  <span className="text-xl pb-2 font-light">Cargo:</span>
                  {errors.position && <span className="text-red-500 text-xs">Campo obrigatório*</span>}
                  </Form.Label>
                  <select
                      name="cargo"
                      id="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      className="bg-white w-[300px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                  <option value="" disabled>Selecione o cargo</option>
                  {options.cargos.map((cargo) => (
                  <option key={cargo.car_id} value={cargo.car_nome}>
                      {cargo.car_nome}
                  </option>
                  ))}
                  </select>
                </Form.Field>

                <Form.Field name="nivel" className="flex flex-col">
                <Form.Label className="flex justify-between items-center gap-3">
                    <span className="text-xl pb-2 font-light">Nível de Acesso:</span>
                    {errors.level && <span className="text-red-500 text-xs">Campo obrigatório*</span>}
                </Form.Label>
                  <select
                  name="nivel"
                  id="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  className="bg-white w-[300px] h-[45.6px] border border-separator rounded-lg p-2.5 shadow-xl"
                  >
                  <option value="" disabled>Selecione o nível de acesso</option>
                  {options.niveis.map((nivel) => (
                      <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                      {nivel.nivel_nome}
                      </option>
                  ))}
                  </select>
                </Form.Field>

                </div>

            <div className="flex justify-center items-center gap-5">
                <Form.Submit asChild>
                  <button type="submit" className="bg-verdeMedio p-3 px-6 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro" disabled={loading.size > 0}>
                    {loading.has("uptadeUser") ? (
                      <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                      "Editar"
                    )}
                  </button>
                </Form.Submit>
                <Dialog.Close asChild>
                  <button type="button" onClick={() => setOpenEditModal(false)} className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400">Cancelar</button>   
                </Dialog.Close>  
            </div>
            </Form.Root>
            </Dialog.Description>
        </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Pop up de Exclusão */}
      <Dialog.Root open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-100" />
        <Dialog.Content className="fixed bg-brancoSal p-6 rounded-lg shadow-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-101">
            <Dialog.Title className="text-3xl mb-5">Excluir Usuário:</Dialog.Title>
            <Dialog.Description>
            <Form.Root className="flex flex-col">

            <div className="flex mb-10">

            <Form.Field name="dname" className="flex flex-col w-full">
              <Form.Label className="flex justify-between items-center">
                <span className="text-xl pb-2 font-light">Nome Completo:</span>
                <Form.Message className="text-red-500 text-xs" match="valueMissing">
                Campo obrigatório*
                </Form.Message>
              </Form.Label>
                <Form.Control asChild>
                    <input
                    type="text"
                    name="dname"
                    id="dname"
                    placeholder="Digite o nome completo"
                    autoComplete="name"
                    readOnly
                    value={deleteUser.dname}
                    onChange={handleChange}
                    className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>  
            </Form.Field>

            </div>
            
            <div className="flex mb-10 ">
              <Form.Field name="reason"className="w-full flex flex-col">
                  <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Motivo da exclusão:</span>
                  </Form.Label>
                  <Form.Control asChild>
                  <textarea
                      id="reason"
                      name="reason"
                      rows={3}
                      cols={50}
                      autoFocus
                      placeholder="Digite o motivo da exclusão do usuário"
                      maxLength={500}
                      value={deleteUser.reason}
                      onChange={handleChange}
                      className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                  ></textarea>
                  </Form.Control>
              </Form.Field>
            </div>

            <div className="flex justify-center items-center gap-5">
                <button 
                  type="button" 
                  className="bg-red-700 p-3 px-6 rounded-xl text-white cursor-pointer text-center gap-2 hover:bg-red-800" 
                  onClick={() => {setOpenConfirmModal(true); setOpenDeleteModal(false)}}
                >
                  Excluir
                </button>
                <Dialog.Close asChild>
                  <button type="button" onClick={() => setOpenDeleteModal(false)} className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer text-center gap-2 hover:bg-gray-400">Cancelar</button>   
                </Dialog.Close>  
            </div>
            </Form.Root>
            </Dialog.Description>
        </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Alert para confirmar exclusão do usuário */}
      <AlertDialog.Root open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-100"/>
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brancoSal p-6 rounded-lg shadow-lg min-w-[440px] w-96 z-101">
          <AlertDialog.Title className="text-xl font-bold">
            Tem certeza que deseja excluir o usuário?  
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-gray-600">
            Essa ação não pode ser desfeita. Tem certeza que deseja continuar?
          </AlertDialog.Description>
          <div className="mt-4 gap-3 flex justify-end items-baseline">
            <AlertDialog.Cancel asChild>
            <button type="button"className=" py-2 px-3 h-10 rounded text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-300" onClick={() => setOpenConfirmModal(false)}>Cancelar</button>   
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
            <button type="button"className="bg-red-700 py-2 px-3 w-[160px] h-10 rounded text-white cursor-pointer flex place-content-center gap-2 hover:bg-red-800" onClick={handleDeleteUser} disabled={loading.size > 0} >
              {loading.has("deleteUser") ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                "Sim, excluir usuário"
              )}
              </button>  
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
      
    </div>
  );
}

