/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tabs, Form } from "radix-ui";
import { useState, useEffect } from "react";
import { Plus, PencilLine, Trash, Eye, Search, Loader2 } from "lucide-react";
import axios from "axios";

import { SmartField } from "../../shared";
// import { ConfirmationModal } from "../../shared";
import { Modal } from "../../shared";
import { NoticeModal } from "../../shared";

type ProductsWithSteps = {
  produto_nome: string;
  etapas: Etapa[];
};  

type FormData = {
  produto_nome: string;
  id: number;
  ordem: number;
  nome_etapa: string;
  tempo: string;
  insumos: string;
  responsavel: string;
  obs: string;
};

type Etapa = Omit<FormData, "produto_nome">;

export default function ProductionSteps() {
  const [activeTab, setActiveTab] = useState("list");
  const [productsWithSteps, setProductsWithSteps] = useState<ProductsWithSteps[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductsWithSteps | null>(null);
  const [search, setSearch] = useState("");
  const [showStepForm, setShowStepForm] = useState<boolean>(false);
  // const [openEditModal, setOpenEditModal] = useState(false);
  // const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openObsModal, setOpenObsModal] = useState(false);
  const [currentObs, setCurrentObs] = useState("");
  const [openNoticeModal, setOpenNoticeModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<FormData>({
    produto_nome: "",
    id: 0,
    ordem: 0,
    nome_etapa: "",
    tempo: "",
    insumos: "",
    responsavel: "",
    obs: "",
  });
  const [stepData, setStepData] = useState<Etapa[]>([]);
  const [deleteStep, setDeleteStep] = useState({
    step_id: 0,
    dnome_cliente: "",
    reason: "",
  });

  console.log(formData)
  console.log(stepData)

  //função para puxar os dados do usuario que será editado
  // const handleEditClick = (etapa: Etapa) => {
  //   console.log("Dados completos da etapa:", etapa); 

  //   setFormData({
  //     user_id: usuario.user_id,
  //     name: usuario.user_nome,
  //     email: usuario.user_email,
  //     tel: usuario.user_telefone,
  //     cpf: usuario.user_CPF,
  //     cargo: usuario.car_nome,
  //     nivel: usuario.nivel_nome,
  //     status: usuario.sta_id?.toString() || "",
  //     password: "",
  //   });
  //   setOpenEditModal(true);
  // };

  // //função para puxar o nome do usuário que será excluido
  // const handleDeleteClick = (usuario: Usuario) => {
  //   setDeleteUser({
  //     user_id: usuario.user_id,
  //     dname: usuario.user_nome,
  //     reason: "",
  //   });
  //   setOpenDeleteModal(true);
  // };

  //  //submit para atualizar o usuário após a edição dele
  //  const handleUpdateUser = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   setLoading((prev) => new Set([...prev, "updateUser"]));
  //   setSuccessMsg(false);

  //   try {
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { password, ...dataWithoutPassword } = formData;
  //     const dataToSend = formData.user_id ? dataWithoutPassword : formData;

  //     const response = await axios.post(
  //       "http://localhost/BioVerde/back-end/usuarios/editar.usuario.php",
  //       dataToSend,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       }
  //     );

  //     if (response.data.success) {
  //       await refreshData(); 
  //       setOpenEditModal(false);
  //       setSuccessMsg(true);
  //       setMessage("Usuário atualizado com sucesso!");
  //       clearFormData();
  //     } else {
  //       setMessage(response.data.message || "Erro ao atualizar usuário.");
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       setMessage(error.response?.data?.message || "Erro no servidor");
  //       console.error("Erro na resposta:", error.response?.data);
  //     } else {
  //       setMessage("Erro ao conectar com o servidor");
  //       console.error("Erro na requisição:", error);
  //     }
  //   } finally {
  //     setOpenNoticeModal(true);
  //     setLoading((prev) => {
  //       const newLoading = new Set(prev);
  //       newLoading.delete("updateUser");
  //       return newLoading;
  //     });
  //   }
  // };

  // //submit para excluir um usuário
  // const handleDeleteUser = async (e: React.FormEvent) => {
  //   e.preventDefault();
  
  //   setLoading((prev) => new Set([...prev, "deleteUser"]));
  //   setSuccessMsg(false);
  
  //   try {
  //     const dataToSend = {
  //       user_id: Number(deleteUser.user_id),
  //       dname: String(deleteUser.dname),
  //       reason: String(deleteUser.reason),
  //     };
  
  //     const response = await axios.post(
  //       "http://localhost/BioVerde/back-end/usuarios/excluir.usuario.php",
  //       dataToSend,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       }
  //     );
  
  //     if (response.data.success) {
  //       await refreshData(); 
  //       setOpenConfirmModal(false);       
  //       setSuccessMsg(true);
  //       setMessage("Usuário excluído com sucesso!");
  //       setUsuarios(prevUsuarios => 
  //         prevUsuarios.filter(user => user.user_id !== deleteUser.user_id)
  //       );
  //     } else {
  //       setMessage(response.data.message || "Erro ao excluir usuário.");
  //     }
  //   } catch (error) {
  //     let errorMessage = "Erro ao conectar com o servidor";
  //     if (axios.isAxiosError(error)) {
  //       errorMessage = error.response?.data?.message || "Erro no servidor";
  //       console.error("Erro na resposta:", error.response?.data);
  //     } else {
  //       console.error("Erro na requisição:", error);
  //     }
  //     setMessage(errorMessage);
  //   } finally {
  //     setOpenNoticeModal(true);
  //     setLoading((prev) => {
  //       const newLoading = new Set(prev);
  //       newLoading.delete("deleteUser");
  //       return newLoading;
  //     });
  //   }
  // };

  // const handleObsClick = (etapa: Etapa) => {
  //   setCurrentObs(etapa.etapa_observacoes);
  //   setOpenObsModal(true);
  // };

  // useEffect(() => {
  //   const fetchProdutos = async () => {
  //     try {
  //       const res = await axios.get("/api/produtos-com-etapas"); // ou o endpoint real
  //       setProductsWithSteps(res.data);
  //     } catch (error) {
  //       console.error("Erro ao buscar produtos:", error);
  //     }
  //   };
  
  //   fetchProdutos();
  // }, []);

  const prod = {
    "produto_nome": "Suco Orgânico",
    "etapas": [
      {
        "id": 1,
        "ordem": 1,
        "nome_etapa": "Corte das frutas",
        "tempo": "20min",
        "insumos": "Facas, tábua, frutas",
        "responsavel": "Carlos",
        "obs": "Cuidado com o corte"
      },
      {
        "id": 2,
        "ordem": 2,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 3,
        "ordem": 3,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 4,
        "ordem": 4,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 5,
        "ordem": 5,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 6,
        "ordem": 6,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 7,
        "ordem": 7,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 8,
        "ordem": 8,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },

    ]
  }
  const prod1 = {
    "produto_nome": "Limão Orgânico",
    "etapas": [
      {
        "id": 1,
        "ordem": 1,
        "nome_etapa": "Corte das frutas",
        "tempo": "20min",
        "insumos": "Facas, tábua, frutas",
        "responsavel": "Carlos",
        "obs": "Cuidado com o corte"
      },
      {
        "id": 2,
        "ordem": 2,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 3,
        "ordem": 3,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 4,
        "ordem": 4,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 5,
        "ordem": 5,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
    ]
  }
  const prod2 = {
    "produto_nome": "Banana Orgânico",
    "etapas": [
      {
        "id": 1,
        "ordem": 1,
        "nome_etapa": "Corte das frutas",
        "tempo": "20min",
        "insumos": "Facas, tábua, frutas",
        "responsavel": "Carlos",
        "obs": "Cuidado com o corte"
      },
      {
        "id": 2,
        "ordem": 2,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
      {
        "id": 3,
        "ordem": 3,
        "nome_etapa": "Bater no liquidificador",
        "tempo": "10min",
        "insumos": "Liquidificador",
        "responsavel": "Ana",
        "obs": "Verificar consistência"
      },
    ]
  }
  
  useEffect(() => {
    setProductsWithSteps([prod, prod1, prod2]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleChange = (
    event: | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
    setDeleteStep({ ...deleteStep, [name]: value });
  };

  //Função de define qual será o submir que será enviado  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const submitEvent = e.nativeEvent as SubmitEvent;
    const buttonClicked = (submitEvent.submitter as HTMLButtonElement).name;
  
    if (buttonClicked === "saveStep") {
      handleSaveStep(e); //Submit de salvar uma etapa 
    } else if (buttonClicked === "submitForm") {
      handleStepsSubmit(e); //Submit de cadastrar a etapa de produção completa
    }
  };

  //Função para cadastrar uma etapa de um produto
  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();

    const { produto_nome, ...stepFields } = formData;

    const newStep = {
      ...stepFields,
      id: stepData.length,
      ordem: stepData.length + 1,
    };
  
    setStepData([...stepData, newStep]);
  
    setFormData({
      produto_nome: formData.produto_nome,
      id: 0,
      ordem: 0,
      nome_etapa: "",
      tempo: "",
      insumos: "",
      responsavel: "",
      obs: "",
    });
  
    setShowStepForm(false); 
  };
  
  //Submit de cadastrar a etapa de produção completa
  const handleStepsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/etapas/cadastrar_etapas.php",
        {
          produto_nome: formData.produto_nome,
          etapas: stepData,
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        // await refreshData(); 
        setSuccessMsg(true);
        setMessage("Etapa cadastrada com sucesso!");
        clearFormData(); //Limpa o formData
        setStepData([]);
      } else {
        setMessage(response.data.message || "Erro ao cadastrar etapa");
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
      setOpenNoticeModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("submit");
        return newLoading;
      });
    }
  };

  //Limpar FormData
  const clearFormData = () => {
    setFormData((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [
          key,
          typeof value === "number" ? 0 : "",
        ])
      ) as typeof prev
    );
  };

  //Scrolla a pagina para baixo quando clicar em "Adicionar Etapa"
  const handleOpenChange = (open: boolean) => {
    if (open) {
      window.scrollTo({
        top: 340,
        behavior: "smooth",
      });
    }
  };
  
  return (
    <div className="flex-1 p-6 pl-[280px]">
      <div className="px-6 font-[inter] bg-brancoSal">
        <h1 className=" text-[40px] font-semibold text-center mb-3">
          Etapas de Produção
        </h1>

        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <Tabs.List className="flex gap-5 border-b border-verdePigmento relative mb-7">
            <Tabs.Trigger
              value="list"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "list" ? "select animation-tab" : ""
              }`}
              onClick={() => setActiveTab("list")}
            >
              Lista de Etapas de Produção
            </Tabs.Trigger>

            <Tabs.Trigger
              value="register"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "register" ? "select animation-tab" : ""
              }`}
              onClick={() => setActiveTab("register")}
            >
              Cadastrar Etapa de Produção
            </Tabs.Trigger>
          </Tabs.List>

          {/* Listar Etapas */}
          <Tabs.Content
            value="list"
            className="flex flex-col w-full"
          >
            <div className="flex items-center justify-start">
              <div className="flex gap-10 max-h-[500px] h-[68vh]">
                {/* SideBar Estrutura de produtos */}
                <div className=" bg-gray-200 rounded-xl max-w-[350px] sombra flex flex-col h-full">
                  <div className="bg-green-800 p-4 rounded-t-xl">
                    <h2 className="text-white text-center text-lg font-semibold">
                      Etapas de Produção
                    </h2>
                    <div className="flex items-center gap-2 relative">
                      <Search className="text-black w-5 h-5 absolute right-2 bottom-2.5" />
                      <input
                        type="text"
                        name="searchProduct"
                        id="searchProduct"
                        placeholder="Buscar Produto"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white text-black w-full pr-9 border border-separator rounded-lg text-base mt-3 p-1.5 shadow-xl"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar-products">
                    <ul className="flex flex-col gap-2 m-4">
                      {productsWithSteps
                        .filter((produto) =>
                          produto.produto_nome
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((produto, index) => (
                          <li
                            key={index}
                            className={`break-words px-4 py-2 text-black font-medium cursor-pointer hover:bg-gray-300 rounded-lg ${
                              selectedProduct?.produto_nome === produto.produto_nome ? "bg-gray-300" : ""
                            }`}
                            onClick={() => setSelectedProduct(produto)}
                          >
                            {produto.produto_nome}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Tabela de Etapas */}
                <div className="max-w-[50vw]">
                {selectedProduct ? (
                  <>
                    <h2 className="text-2xl mb-4">
                    <strong>Produto Final:</strong> {selectedProduct.produto_nome}
                    </h2>
                    <div className="max-h-[62vh] overflow-x-auto overflow-y-auto">
                    <table className="w-full border-collapse">
                      {/* Tabela Cabeçalho */}
                      <thead>
                        <tr className="bg-verdePigmento text-white shadow-thead">
                          {[
                            "Ordem",
                            "Nome da Etapa",
                            "Tempo Estimado",
                            "Insumos Utilizados",
                            "Responsável",
                            "Observações",
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
                        {/* Tabela Dados */}
                        {selectedProduct.etapas.map((etapa, index) => (
                          <tr
                            key={etapa.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
                            }
                          >
                            <td className="border border-black px-4 py-4 whitespace-nowrap">{etapa.ordem}</td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">{etapa.nome_etapa}</td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">{etapa.tempo}</td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">{etapa.insumos}</td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">{etapa.responsavel}</td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                onClick={() => {setCurrentObs(etapa.obs); setOpenObsModal(true)}}
                              >
                                <Eye />
                                <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                  Ver
                                </div>
                              </button>
                            </td>
                            <td className="border border-black px-4 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                className="mr-4 text-black cursor-pointer relative group"
                                // onClick={() => handleEditClick(step)}
                              >
                                <PencilLine />
                                <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                  Editar
                                </div>
                              </button>
                              <button
                                type="button"
                                className="text-red-500 cursor-pointer relative group"
                                // onClick={() => handleDeleteClick(step)}
                              >
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
                  </>
                ) : (
                  <p className="text-gray-600 flex justify-center items-center h-full text-lg w-[680px]">
                    Selecione um produto na lista para ver suas etapas
                  </p>
                )}
                </div>

              </div>
            </div>
          </Tabs.Content>
          
          {/* Cadastro de etapa */}
          <Tabs.Content
            value="register"
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center">
              <Form.Root className="flex flex-col mb-10" onSubmit={handleSubmit}>
                <h2 className="text-3xl mb-8">Cadastrar Etapa de Produção</h2>
                <div className="flex mb-8">

                  <SmartField
                    fieldName="produto_nome"
                    fieldText="Produto Final"
                    type="text"
                    required
                    placeholder="Nome do Produto final a ser produzido"
                    value={formData.produto_nome}
                    onChange={handleChange}
                    inputWidth="w-[500px]"
                  />

                </div>
                <div>
                  {/* Tabela de Etapas */}
                  <div>
                    <h3 className="text-xl font-semibold mb-5">
                      Etapas de produção:
                    </h3>
                    {stepData.length !== 0 && (
                      <div className="max-w-[60vw] overflow-x-auto overflow-y-auto mb-10">
                        <table className="w-full border-collapse">
                        {/* Tabela Cabeçalho */}
                        <thead>
                          <tr className="bg-verdePigmento text-white shadow-thead">
                            {[
                              "Ordem",
                              "Nome da Etapa",
                              "Tempo Estimado",
                              "Insumos Utilizados",
                              "Responsável",
                              "Observações",
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
                          {/* Tabela Dados */}
                          {stepData.map((step, index) => (
                            <tr
                              key={step.id}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
                              }
                            >
                              <td className="border border-black px-4 py-4 whitespace-nowrap">{step.ordem}</td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">{step.nome_etapa}</td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">{step.tempo}</td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">{step.insumos}</td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">{step.responsavel}</td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                  onClick={() => {setCurrentObs(step.obs); setOpenObsModal(true)}}
                                >
                                  <Eye />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Ver
                                  </div>
                                </button>
                              </td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">
                                <button
                                  type="button"
                                  className="mr-4 text-black cursor-pointer relative group"
                                  // onClick={() => handleEditClick(step)}
                                >
                                  <PencilLine />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Editar
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  className="text-red-500 cursor-pointer relative group"
                                  // onClick={() => handleDeleteClick(step)}
                                >
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
                    )}
                  </div>
                  {showStepForm ? (
                    <div className="bg-gray-100 w-[816px] p-5 rounded-md shadow-xl mb-10">
                      <div className="flex gap-10 mb-8">

                        <SmartField
                          fieldName="nome_etapa"
                          fieldText="Nome da Etapa"
                          fieldClassname="flex flex-col w-full"
                          type="text"
                          required
                          placeholder="Digite o Nome da Etapa"
                          value={formData.nome_etapa}
                          onChange={handleChange}
                        />

                      </div>

                      <div className="flex gap-10 mb-8">

                        <SmartField
                          fieldName="responsavel"
                          fieldText="Responsável"
                          fieldClassname="flex flex-col w-full"
                          type="text"
                          required
                          placeholder="Digite o Nome do Responsável"
                          value={formData.responsavel}
                          onChange={handleChange}
                        />

                        <SmartField
                          fieldName="tempo"
                          fieldText="Tempo Estimado"
                          type="text"
                          required
                          placeholder="Tempo Estimado da etapa"
                          value={formData.tempo}
                          onChange={handleChange}
                          inputWidth="w-[250px]"
                        />

                      </div>

                      <div className="flex mb-8">

                        <SmartField
                          fieldName="insumos"
                          fieldText="Insumos Utilizados"
                          fieldClassname="flex flex-col w-full"
                          type="text"
                          required
                          placeholder="Insumos Utilizados na etapa"
                          value={formData.insumos}
                          onChange={handleChange}
                        />
                      
                      </div>

                      <div className="flex mb-8">

                        <SmartField
                          isTextArea
                          fieldName="obs"
                          fieldText="Observações"
                          fieldClassname="flex flex-col w-full"
                          placeholder="Digite as observações da Etapa"
                          value={formData.obs}
                          onChange={handleChange}
                          rows={2}
                        />

                      </div>

                      <div className="flex justify-center items-center gap-5">
                        <Form.Submit asChild>
                          <button
                            type="submit"
                            name="saveStep"
                            className="bg-verdeMedio p-3 px-7 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                          >
                            Salvar
                          </button>
                        </Form.Submit>

                        <button
                          type="button"
                          onClick={() => setShowStepForm(false)}
                          className="bg-gray-300 p-3 px-6 rounded-xl text-black cursor-pointer flex place-content-center gap-2 hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center gap-5 ">
                        <button
                          type="button"
                          onClick={() => {
                            setShowStepForm(true);
                            setTimeout(() => handleOpenChange(true), 100);
                          }}
                          className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
                        >
                          <Plus /> Adicionar Etapa
                        </button>
                      </div>
                      {stepData.length !== 0 && (
                        <Form.Submit asChild>
                          <div className="flex place-content-center mt-10 ">
                            <button
                              type="submit"
                              name="submitForm"
                              className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra w-[278.72px]  hover:bg-verdeGrama "
                            >
                              {loading.has("submit") ? (
                                <Loader2 className="animate-spin h-6 w-6" />
                              ) : (
                                "Cadastrar Etapas de Produção"
                              )}
                            </button>
                          </div>
                        </Form.Submit>
                      )}
                    </div>
                  )}
                </div>
              </Form.Root>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        {/* Modal de Avisos */}
        <NoticeModal
          openModal={openNoticeModal}
          setOpenModal={setOpenNoticeModal}
          successMsg={successMsg}
          message={message}
        />

        {/* Modal de Observações */}
        <Modal
          withExitButton
          openModal={openObsModal}
          setOpenModal={setOpenObsModal}
          modalWidth="min-w-[300px] max-w-[500px]"
          modalTitle="Observações"
          obsText={currentObs}
        />

        {/* Modal de Edição */}
        {/* <Modal
          openModal={openEditModal}
          setOpenModal={setOpenEditModal}
          modalTitle="Editar Usuário:"
          leftButtonText="Editar"
          rightButtonText="Cancelar"
          loading={loading}
          isLoading={loading.has("updateUser")}
          onCancel={() => clearFormData()}
          onSubmit={handleUpdateUser}
        > */}
        {/* Linha Nome e Email*/} 
          {/* <div className="flex mb-10 justify-between">

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
          </div> */}

          {/* Linha Telefone, CPF, e status*/}
          {/* <div className="flex gap-x-15 mb-10 justify-between">

            <SmartField
              fieldName="tel"
              fieldText="Telefone"
              withInputMask
              required
              type="tel"
              mask="(99) 9999?9-9999"
              autoClear={false}
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
              {options.status?.map((status) => (
                <option key={status.sta_id} value={status.sta_id}>
                  {status.sta_nome}
                </option>
              ))}
            </SmartField> 

          </div> */}

          {/* Linha Cargo e Nivel de Acesso */}
          {/* <div className="flex gap-x-15 mb-10 items-center justify-between">

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
        </Modal> */}

        {/* Modal de Exclusão */}
        {/* <Modal
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          modalTitle="Excluir Usuário:"
          leftButtonText="Excluir"
          rightButtonText="Cancelar"
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

        </Modal> */}

        {/* Alert para confirmar exclusão do usuário */}
        {/* <ConfirmationModal
          openModal={openConfirmModal}
          setOpenModal={setOpenConfirmModal}
          confirmationModalTitle="Tem certeza que deseja excluir o usuário?"
          confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
          onConfirm={handleDeleteUser}
          loading={loading}
          isLoading={loading.has("deleteUser")}
          confirmationLeftButtonText="Cancelar"
          confirmationRightButtonText="Sim, excluir usuário"
        /> */}

      </div>
    </div>
  );
}
