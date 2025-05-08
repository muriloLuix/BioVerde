import { useState, useEffect, useCallback } from "react";
import { Tabs, Form } from "radix-ui";
import {Search, PencilLine, Trash, Loader2, FilterX, Printer, X, Plus } from "lucide-react";
import { InputMaskChangeEvent } from "primereact/inputmask";
import axios from "axios";
import { ConfirmationModal } from "../../shared";
import { SmartField } from "../../shared";
import { Modal } from "../../shared";
import { NoticeModal } from "../../shared";
import { useNavigate } from "react-router-dom";

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
  estaAtivo: number;        
  status_ativo: string;     
}
export default function UsersPage() {
  const [relatorioModalOpen, setRelatorioModalOpen] = useState(false);
  const [relatorioContent, setRelatorioContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("list");
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openNoticeModal, setOpenNoticeModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const navigate = useNavigate();
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
  }>({
    cargos: [],
    niveis: [],
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
    user_id: 0,
    dname: "",
    reason: "",
  });

  console.log(formData)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost/BioVerde/back-end/auth/check_session.php",
          { withCredentials: true }
        );
  
        if (!response.data.loggedIn) {
          setMessage("Sessão expirada. Por favor, faça login novamente.");
          setOpenNoticeModal(true);
  
          setTimeout(() => {
            navigate("/");
          }, 1900);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setMessage("Sessão expirada. Por favor, faça login novamente.");
        setOpenNoticeModal(true);
  
        setTimeout(() => {
          navigate("/");
        }, 1900);
      }
    };
  
    checkAuth();
  }, [navigate]);

  //OnChange dos campos
  const handleChange = (
    event:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | InputMaskChangeEvent
  ) => {
    const { name, value } = event.target;

    if (name in formData) { setFormData({ ...formData, [name]: value }) }
    if (name in filters) { setFilters({ ...filters, [name]: value }) }
    if (name in deleteUser) {setDeleteUser({ ...deleteUser, [name]: value }) }
    
    setErrors(
      (prevErrors) =>
        Object.fromEntries(
          Object.keys(prevErrors).map((key) => [key, false])
        ) as typeof prevErrors
    );
  };

  const gerarRelatorio = async () => {
    setLoading((prev) => new Set([...prev, "reports"]));

    try {
      const response = await axios.get(
        "http://localhost/BioVerde/back-end/rel/usu.rel.php",
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const contentType = response.headers["content-type"];

      if (contentType !== "application/pdf") {
        const errorText = await response.data.text();
        throw new Error(`Erro ao gerar relatório: ${errorText}`);
      }

      const fileURL = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      setRelatorioContent(fileURL);
      setRelatorioModalOpen(true);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setMessage("Erro ao gerar relatório");
      setOpenNoticeModal(true);
    } finally {
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("reports");
        return newLoading;
      });
    }
  };
  

  //função para puxar os dados do usuario que será editado
  const handleEditClick = (usuario: Usuario) => {

    setFormData({
      user_id:   usuario.user_id,
      name:      usuario.user_nome,
      email:     usuario.user_email,
      tel:       usuario.user_telefone,
      cpf:       usuario.user_CPF,
      cargo:     usuario.car_nome,
      nivel:     usuario.nivel_nome,
      status:    String(usuario.estaAtivo),
      password:  "",
    });
    setOpenEditModal(true);
  };
  

  //função para puxar o nome do usuário que será excluido
  const handleDeleteClick = (usuario: Usuario) => {
    setDeleteUser({
      user_id: usuario.user_id,
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
          axios.get(
            "http://localhost/BioVerde/back-end/usuarios/listar_opcoes.php",
            {
              withCredentials: true,
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          ),
          axios.get(
            "http://localhost/BioVerde/back-end/usuarios/listar_usuarios.php",
            {
              withCredentials: true,
              headers: {
                Accept: "application/json",
              },
            }
          ),
        ]);

        if (optionsResponse.data.success) {
          setOptions({
            cargos: optionsResponse.data.cargos,
            niveis: optionsResponse.data.niveis,
          });
        } else {
          setOpenNoticeModal(true);
          setMessage(optionsResponse.data.message || "Erro ao carregar opções");
        }

        if (usuariosResponse.data.success) {
          setUsuarios(usuariosResponse.data.usuarios);
        } else {
          setOpenNoticeModal(true);
          setMessage(
            usuariosResponse.data.message || "Erro ao carregar usuários"
          );
        }
      } catch (error) {
        setOpenNoticeModal(true);
        setMessage("Erro ao conectar com o servidor");

        if (axios.isAxiosError(error)) {
          console.error(
            "Erro na requisição:",
            error.response?.data || error.message
          );
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
  
  //Função para Atualizar a Tabela após ação
  const refreshData = async () => {
    try {
      setLoading((prev) => new Set([...prev, "users", "options"]));
  
      const [optionsResponse, usuariosResponse] = await Promise.all([
        axios.get(
          "http://localhost/BioVerde/back-end/usuarios/listar_opcoes.php",
          { withCredentials: true }
        ),
        axios.get(
          "http://localhost/BioVerde/back-end/usuarios/listar_usuarios.php",
          { withCredentials: true }
        ),
      ]);
  
      if (optionsResponse.data.success && usuariosResponse.data.success) {
        setOptions({
          cargos: optionsResponse.data.cargos,
          niveis: optionsResponse.data.niveis,
        });
        setUsuarios(usuariosResponse.data.usuarios);
        return true;
      } else {
        const errorMessage = 
          optionsResponse.data.message  || 
          usuariosResponse.data.message || 
          "Erro ao carregar dados";
        setMessage(errorMessage);
        setOpenNoticeModal(true);
        return false;
      }
    } catch (error) {
      let errorMessage = "Erro ao conectar com o servidor";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      setMessage(errorMessage);
      setOpenNoticeModal(true);
      return false;
    } finally {
      setLoading((prev) => {
        const newLoading = new Set(prev);
        ["users", "options"].forEach((item) => newLoading.delete(item));
        return newLoading;
      });
    }
  };
  
  //Submit de cadastrar usuários
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validações 
    const errors = {
      position: !formData.cargo,
      level: !formData.nivel,
      password: !formData.password || formData.password.length < 8,
    };
    setErrors(errors);
  
    if (Object.values(errors).some((error) => error)) {
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
          withCredentials: true,
        }
      );
      
      console.log("Resposta do back-end:", response.data);
  
      if (response.data.success) {
        setOpenRegisterModal(false);
        setSuccessMsg(true);
        setMessage("Usuário cadastrado com sucesso! O login e senha foram enviados por email.");
        await refreshData();
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao cadastrar usuário");
        setSuccessMsg(false);
    }
    } catch (error) {
      let errorMessage = "Erro ao conectar com o servidor";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      setMessage(errorMessage);
    } finally {
      setOpenNoticeModal(true);
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

    setLoading((prev) => new Set([...prev, "filterSubmit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/filtro.usuario.php",
        filters,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        setUsuarios(response.data.usuarios);
      } else {
        setOpenNoticeModal(true);
        setMessage(
          response.data.message || "Nenhum usuário encontrado com esse filtro"
        );
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...dataWithoutPassword } = formData;
      const dataToSend = formData.user_id ? dataWithoutPassword : formData;

      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/editar.usuario.php",
        dataToSend,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        await refreshData(); 
        setOpenEditModal(false);
        setSuccessMsg(true);
        setMessage("Usuário atualizado com sucesso!");
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao atualizar usuário.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Erro no servidor");
        console.error("Erro na resposta:", error.response?.data);
      } else {
        setMessage("Erro ao conectar com o servidor");
        console.error("Erro na requisição:", error);
      }
    } finally {
      setOpenNoticeModal(true);
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
      const dataToSend = {
        user_id: Number(deleteUser.user_id),
        dname: String(deleteUser.dname),
        reason: String(deleteUser.reason),
      };
  
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/usuarios/excluir.usuario.php",
        dataToSend,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
  
      if (response.data.success) {
        await refreshData(); 
        setOpenConfirmModal(false);       
        setSuccessMsg(true);
        setMessage("Usuário excluído com sucesso!");
        setUsuarios(prevUsuarios => 
          prevUsuarios.filter(user => user.user_id !== deleteUser.user_id)
        );
      } else {
        setMessage(response.data.message || "Erro ao excluir usuário.");
      }
    } catch (error) {
      let errorMessage = "Erro ao conectar com o servidor";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || "Erro no servidor";
        console.error("Erro na resposta:", error.response?.data);
      } else {
        console.error("Erro na requisição:", error);
      }
      setMessage(errorMessage);
    } finally {
      setOpenNoticeModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("deleteUser");
        return newLoading;
      });
    }
  };

  const generatePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setFormData({ ...formData, password: newPassword });
    setErrors((prevErrors) => ({ ...prevErrors, password: false }));
  };

  //Limpar FormData
  const clearFormData = useCallback(() => {
    setFormData((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [
          key,
          typeof value === "number" ? 0 : "",
        ])
      ) as typeof prev
    );
  }, []);

  return (
    <div className="flex-1 p-6 pl-[280px]">
      <div className="px-6 font-[inter]">
        <h1 className=" text-[40px] font-semibold text-center mb-3">
          Usuários
        </h1>

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
          </Tabs.List>

          {/* Aba de Lista de Usuários */}
          <Tabs.Content value="list" className="flex flex-col w-full">
            <div className="flex justify-end m-1"> 
              <button
                type="button"
                className="bg-verdePigmento p-3 font-bold rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center gap-2"
                onClick={() => setOpenRegisterModal(true)}
              >
                <Plus />
                Novo Usuário
              </button>
            </div>
            {/* Filtro de Usuários */}
            <Form.Root onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
              <h2 className="text-3xl">Filtros:</h2>
              <div className="flex gap-7">
                {/* Coluna Nome e Email */}
                <div className="flex flex-col gap-7 mb-10 justify-between">

                  <SmartField
                    fieldName="fname"
                    fieldText="Nome Completo"
                    type="text"
                    placeholder="Nome completo"
                    autoComplete="name"
                    value={filters.fname}
                    onChange={handleChange}
                    inputWidth="w-[280px]"
                  />

                  <SmartField
                    fieldName="fcargo"
                    fieldText="Cargo"
                    isSelect
                    isLoading={loading.has("options")}
                    value={filters.fcargo}
                    onChange={handleChange}
                    inputWidth="w-[280px]"
                  >  
                    <option value="">Todos</option>
                    {options.cargos.map((cargo) => (
                      <option key={cargo.car_id} value={cargo.car_nome}>
                        {cargo.car_nome}
                      </option>
                    ))}
                  </SmartField> 
                </div>

                {/* Coluna CPF e Cargo */}
                <div className="flex flex-col gap-7 mb-10 justify-between">

                  <SmartField
                    fieldName="fcpf"
                    fieldText="CPF"
                    withInputMask
                    type="text"
                    mask="999.999.999-99"
                    autoClear={false}
                    unstyled
                    placeholder="Digite o CPF"
                    value={filters.fcpf}
                    onChange={handleChange}
                    inputWidth="w-[200px]"
                  />  

                  <SmartField
                    fieldName="fnivel"
                    fieldText="Nível de Acesso"
                    isSelect
                    isLoading={loading.has("options")}
                    value={filters.fnivel}
                    onChange={handleChange}
                    inputWidth="w-[200px]"
                  >  
                    <option value="">Todos</option>
                    {options.niveis.map((nivel) => (
                      <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                        {nivel.nivel_nome}
                      </option>
                    ))}
                  </SmartField> 

                </div>

                {/* Coluna Telefone e Nivel de Acesso */}
                <div className="flex flex-col gap-7 mb-10 justify-between">

                  <SmartField
                    fieldName="ftel"
                    fieldText="Telefone"
                    withInputMask
                    type="text"
                    mask="(99) 9999?9-9999"
                    autoClear={false}
                    unstyled
                    placeholder="Digite o Telefone"
                    autoComplete="tel"
                    value={filters.ftel}
                    onChange={handleChange}
                    inputWidth="w-[200px]"
                  />  

                <SmartField
                  fieldName="fstatus"
                  fieldText="Status"
                  isSelect
                  value={filters.fstatus}
                  onChange={handleChange}
                  inputWidth="w-[200px]"
                >
                  <option value="">Todos</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </SmartField>

                </div>

                {/* Coluna Data de Cadastro e Botão Pesquisar */}
                <div className="flex flex-col gap-7 mb-10 justify-between">
                  <Form.Field name="fdataCadastro" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        Data de Cadastro:
                      </span>
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

                  <Form.Submit asChild>
                    <div className="flex gap-4 mt-5">
                      <button
                        type="submit"
                        className="bg-verdeMedio p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
                        disabled={loading.size > 0}
                      >
                        {loading.has("filterSubmit") ? (
                          <Loader2 className="animate-spin h-6 w-6" />
                        ) : (
                          <>
                            <Search size={23} />
                            Filtrar
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="bg-verdeLimparFiltros p-3 w-[105px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-hoverLimparFiltros "
                        disabled={loading.size > 0}
                        onClick={async () => {
                          setFilters((prev) =>
                            Object.fromEntries(Object.keys(prev).map((key) => [key, ""])) as typeof prev
                          );
                        }}
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
            <div className="min-w-[966px] max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-5">
              <table className="w-full border-collapse">
                {/* Tabela Cabeçalho */}
                <thead>
                  <tr className="bg-verdePigmento text-white shadow-thead">
                    {[
                      "ID",
                      "Nome",
                      "Email",
                      "Telefone",
                      "CPF",
                      "Cargo",
                      "Nível de Acesso",
                      "Status",
                      "Data de Cadastro",
                      "Ações",
                    ].map((header) => (
                      <th
                        key={header}
                        className="border border-black px-4 py-4 whitespace-nowrap"
                      >
                        {header}
                      </th>
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
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
                        }
                      >
                        {Object.values(usuario)
                          .slice(0, 8)
                          .map((value, idx) => (
                            <td
                              key={idx}
                              className="border border-black px-4 py-4 whitespace-nowrap"
                            >
                              {value}
                            </td>
                          ))}
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          {new Date(usuario.user_dtcadastro).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          <button
                            className="mr-4 text-black cursor-pointer relative group"
                            onClick={() => handleEditClick(usuario)}
                          >
                            <PencilLine />
                            <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                              Editar
                            </div>
                          </button>
                          <button
                            className="text-red-500 cursor-pointer relative group"
                            onClick={() => handleDeleteClick(usuario)}
                          >
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
            {usuarios.length !== 0 && (
              <div className="min-w-[966px] max-w-[73vw]">
                <button
                  type="button"
                  className="bg-verdeGrama p-3 w-[180px] ml-auto mb-5 rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-[#246127]"
                  onClick={gerarRelatorio}
                  disabled={loading.size > 0}
                >
                  {loading.has("reports") ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                  ) : (
                    <>
                      <Printer />
                      Gerar Relatório
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Fim aba de Lista de Usuários */}
          </Tabs.Content>

        </Tabs.Root>

        {/* Modal de Avisos */}
        <NoticeModal
          openModal={openNoticeModal}
          setOpenModal={setOpenNoticeModal}
          successMsg={successMsg}
          message={message}
        />

        {/* Modal de Relatório */}
        {relatorioModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Relatório de Usuários</h2>
                <button 
                  onClick={() => setRelatorioModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto mb-4">
                {relatorioContent ? (
                  <iframe 
                    src={relatorioContent} 
                    className="w-full h-full min-h-[70vh] border"
                    title="Relatório de Usuários"
                  />
                ) : (
                  <p>Carregando relatório...</p>
                )}
              </div>
              
              <div className="flex justify-end gap-4">
                <a
                  href={relatorioContent}
                  download="relatorio_usuarios.pdf"
                  className="bg-verdeGrama text-white px-4 py-2 rounded hover:bg-[#246127]"
                >
                  Baixar Relatório
                </a>
                <button
                  onClick={() => setRelatorioModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Usuários */}
        <Modal
          isRegister
          withXButton
          openModal={openRegisterModal}
          setOpenModal={setOpenRegisterModal}
          modalTitle="Cadastrar Usuário:"
          modalWidth="w-1/2"
          registerButtonText="Cadastrar Usuário"
          isLoading={loading.has("submit")}
          onExit={clearFormData}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4">
            <SmartField
              fieldName="name"
              fieldText="Nome Completo"
              placeholder="Digite o nome completo"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <SmartField
              fieldName="email"
              fieldText="Email"
              type="email"
              placeholder="Digite o email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="flex gap-7">
              <SmartField
                fieldName="tel"
                fieldText="Telefone"
                fieldClassname="flex flex-col w-1/2"
                withInputMask
                type="tel"
                mask="(99) 9999?9-9999"
                autoClear={false}
                unstyled
                pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                required
                autoComplete="tel"
                placeholder="Digite o Telefone"
                value={formData.tel}
                onChange={handleChange}
              />
              <SmartField
                fieldName="cpf"
                fieldText="CPF"
                fieldClassname="flex flex-col w-1/2"
                withInputMask
                type="text"
                mask="999.999.999-99"
                autoClear={false}
                unstyled
                pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
                required
                placeholder="Digite o CPF"
                value={formData.cpf}
                onChange={handleChange}
                inputWidth="w-full"
              />
            </div>

            <div className="flex gap-7">
              <SmartField
                fieldName="cargo"
                fieldText="Cargo"
                fieldClassname="flex flex-col w-1/2"
                isSelect
                isLoading={loading.has("options")}
                error={errors.position ? "*" : undefined}
                value={formData.cargo}
                onChange={handleChange}
                placeholderOption="Selecione o cargo"
              >
                {options.cargos.map((cargo) => (
                  <option key={cargo.car_id} value={cargo.car_nome}>
                    {cargo.car_nome}
                  </option>
                ))}
              </SmartField>
              <SmartField
                fieldName="nivel"
                fieldText="Nível de Acesso"
                fieldClassname="flex flex-col w-1/2"
                isSelect
                isLoading={loading.has("options")}
                error={errors.level ? "*" : undefined}
                value={formData.nivel}
                onChange={handleChange}
                placeholderOption="Selecione o nível de acesso"
              >
                {options.niveis.map((nivel) => (
                  <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                    {nivel.nivel_nome}
                  </option>
                ))}
              </SmartField>
            </div>
            <SmartField
              isPassword
              fieldName="password"
              fieldText="Senha"
              placeholder="Digite ou Gere a senha"
              error={errors.password ? "A senha deve ter pelo menos 8 caracteres*" : undefined}
              value={formData.password}
              onChange={handleChange}
              generatePassword={generatePassword}
              inputWidth="w-full"
            />
          </div>

        </Modal>

        {/* Modal de Edição */}
        <Modal
          openModal={openEditModal}
          setOpenModal={setOpenEditModal}
          modalTitle="Editar Usuário:"
          submitButtonText="Editar"
          cancelButtonText="Cancelar"
          isLoading={loading.has("updateUser")}
          onExit={() => clearFormData()}
          onSubmit={handleUpdateUser}
        >
        {/* Linha Nome e Email*/} 
          <div className="flex mb-10 justify-between">

            <SmartField
              fieldName="name"
              fieldText="Nome Completo"
              required
              type="text"
              placeholder="Digite o nome completo"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              inputWidth="w-[300px]"
            />

            <SmartField
              fieldName="email"
              fieldText="Email"
              required
              type="email"
              placeholder="Digite o email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              inputWidth="w-[300px]"
            />  
          </div>

          {/* Linha Telefone, CPF, e status*/}
          <div className="flex gap-x-15 mb-10 justify-between">

            <SmartField
              fieldName="tel"
              fieldText="Telefone"
              withInputMask
              required
              type="tel"
              mask="(99) 9999?9-9999"
              autoClear={false}
              unstyled
              pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
              placeholder="Digite o Telefone"
              autoComplete="tel"
              value={formData.tel}
              onChange={handleChange}
              inputWidth="w-[190px]"
            />  

            <SmartField
              fieldName="cpf"
              fieldText="CPF"
              withInputMask
              required
              type="text"
              mask="999.999.999-99"
              autoClear={false}
              unstyled
              pattern="^\d{3}\.\d{3}\.\d{3}-\d{2}$"
              placeholder="Digite o CPF"
              value={formData.cpf}
              onChange={handleChange}
              inputWidth="w-[190px]"
            />  

            <SmartField
              fieldName="status"
              fieldText="Status"
              isSelect
              value={formData.status}
              onChange={handleChange}
              inputWidth="w-[190px]"
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </SmartField>



          </div>

          {/* Linha Cargo e Nivel de Acesso */}
          <div className="flex gap-x-15 mb-10 items-center justify-between">

            <SmartField
              fieldName="cargo"
              fieldText="Cargo"
              isSelect
              value={formData.cargo}
              onChange={handleChange}
              inputWidth="w-[300px]"
            > 
              {options.cargos.map((cargo) => (
                <option key={cargo.car_id} value={cargo.car_nome}>
                  {cargo.car_nome}
                </option>
              ))}
            </SmartField> 

            <SmartField
              fieldName="nivel"
              fieldText="Nível de Acesso"
              isSelect
              value={formData.nivel}
              onChange={handleChange}
              inputWidth="w-[300px]"
              > 
              {options.niveis.map((nivel) => (
                <option key={nivel.nivel_id} value={nivel.nivel_nome}>
                  {nivel.nivel_nome}
                </option>
              ))}
            </SmartField> 

          </div>
        </Modal>

        {/* Modal de Exclusão */}
        <Modal
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          modalTitle="Excluir Usuário:"
          submitButtonText="Excluir"
          cancelButtonText="Cancelar"
          onDelete={() => {
            setOpenConfirmModal(true);
            setOpenDeleteModal(false);  
          }}
        >
          <div className="flex mb-10">

            <SmartField
              fieldName="dname"
              fieldText="Nome Completo"
              fieldClassname="flex flex-col w-full"
              type="text"
              autoComplete="name"
              required
              readOnly
              value={deleteUser.dname}
              onChange={handleChange}
            />

          </div>

          <div className="flex mb-10 ">

            <SmartField
              isTextArea
              fieldName="reason"
              required
              autoFocus
              fieldText="Motivo da Exclusão"
              fieldClassname="flex flex-col w-full"
              placeholder="Digite o motivo da exclusão do usuário"
              value={deleteUser.reason}
              onChange={handleChange}
            />

          </div>

        </Modal>

        {/* Alert para confirmar exclusão do usuário */}
        <ConfirmationModal
          openModal={openConfirmModal}
          setOpenModal={setOpenConfirmModal}
          confirmationModalTitle="Tem certeza que deseja excluir o usuário?"
          confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
          onConfirm={handleDeleteUser}
          loading={loading}
          isLoading={loading.has("deleteUser")}
          confirmationLeftButtonText="Cancelar"
          confirmationRightButtonText="Sim, excluir usuário"
        />

      </div>
    </div>
  );
}
