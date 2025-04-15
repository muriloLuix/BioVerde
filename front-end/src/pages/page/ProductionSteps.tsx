import { Tabs, Form } from "radix-ui";
import { useState } from "react";
import { Plus, PencilLine, Trash, Eye, Search, Loader2 } from "lucide-react";
import axios from "axios";

import { SmartField } from "../../shared";
// import { ConfirmationModal } from "../../shared";
import { Modal } from "../../shared";
import { NoticeModal } from "../../shared";

// interface Etapa {
//   etapa_id: number;
//   etapa_ordem: number;
//   produto_nome: string;
//   etapa_nome: string;
//   etapa_responsavel: string;
//   etapa_tempo: string;
//   etapa_observacoes: string;
// }

export default function ProductionSteps() {
  const [activeTab, setActiveTab] = useState("list");
  const [activeProductTab, setActiveProductTab] = useState("1");
  const [showStepForm, setShowStepForm] = useState<boolean>(false);
  // const [openEditModal, setOpenEditModal] = useState(false);
  // const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openObsModal, setOpenObsModal] = useState(false);
  // const [currentObs, setCurrentObs] = useState("");
  const [openNoticeModal, setOpenNoticeModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  // const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [formData, setFormData] = useState({
    produto_nome: "",
    id: 0,
    ordem: 0,
    nome_etapa: "",
    tempo: "",
    insumos: "",
    responsavel: "",
    obs: "",
  });
  const [stepData, setStepData] = useState<typeof formData[]>([]);  
  const [deleteStep, setDeleteStep] = useState({
    step_id: 0,
    dnome_cliente: "",
    reason: "",
  });

  // const handleObsClick = (etapa: Etapa) => {
  //   setCurrentObs(etapa.etapa_observacoes);
  //   setOpenObsModal(true);
  // };

  const handleChange = (
    event: | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
    setDeleteStep({ ...deleteStep, [name]: value });
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      window.scrollTo({
        top: 340,
        behavior: "smooth",
      });
    }
  };

  console.log(stepData)

  //Função ap cadastrar uma etapa de um produto
  const handleSaveStep = () => {
    const newStep = {
      ...formData,
      id: Date.now(), // id temporário
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/etapas/cadastrar_etapas.php",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        // await refreshData();
        setSuccessMsg(true);
        setMessage("Etapa cadastrado com sucesso!");
        // clearFormData();
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
  

  const [search, setSearch] = useState("");
  const products = [
    { id: "1", name: "Tomate Orgânico" },
    { id: "2", name: "Pão Integral Orgânico" },
    { id: "3", name: "Café Orgânico" },
  ];

  const ListSteps = [
    {
      order: 1,
      name: "Preparação",
      code: "PR001",
      time: "2h",
      material: "Adubo orgânico",
      responsible: "João",
      obs: "Precisa monitorar o crescimento",
    },
    {
      order: 2,
      name: "Colheita",
      code: "CL002",
      time: "3h",
      material: "Tesoura agrícola",
      responsible: "Maria",
      obs: "Esperar maturação total",
    },
    {
      order: 3,
      name: "Seleção",
      code: "SL003",
      time: "1h30",
      material: "Balde e peneira",
      responsible: "Carlos",
      obs: "Selecionar apenas produtos de alta qualidade",
    },
    {
      order: 4,
      name: "Embalagem",
      code: "EM004",
      time: "2h",
      material: "Caixas biodegradáveis",
      responsible: "Ana",
      obs: "Etiquetar corretamente os produtos",
    },
    {
      order: 5,
      name: "Transporte",
      code: "TR005",
      time: "4h",
      material: "Caminhão refrigerado",
      responsible: "Roberto",
      obs: "Manter temperatura adequada durante o transporte",
    },
  ];

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

          {/* Cadastrar Etapa */}
          <Tabs.Content
            value="list"
            className="flex flex-col w-full"
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col">
                <div className="flex w-full max-h-[60vh] mb-10">
                  {/* NavBar Estrutura de produtos */}
                  <div className="max-w-[1100px] bg-gray-200 rounded-xl sombra">
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
                    <div className="flex flex-col gap-2 mt-4 px-4">
                      {products
                        .filter((product) =>
                          product.name
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((product) => (
                          <button
                            key={product.id}
                            value={product.id}
                            onClick={() => setActiveProductTab(product.id)}
                            className={`relative px-4 py-2 text-black font-medium cursor-pointer hover:bg-gray-300 rounded-lg ${
                              activeProductTab === product.id
                                ? "bg-gray-300"
                                : ""
                            }`}
                          >
                            {product.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="w-3/4 px-15">
                    {products.map(
                      (product) =>
                        activeProductTab === product.id && (
                          <div key={product.id}>
                            <h1 className="text-xl mb-5">
                              <strong>Produto Final:</strong> {product.name}
                            </h1>

                            <div className="max-w-[50vw] overflow-x-auto max-h-[400px] overflow-y-auto mb-10">
                              <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                  <tr className="bg-green-700 text-white">
                                    {[
                                      "Ordem",
                                      "Nome da Etapa",
                                      "Código",
                                      "Tempo Estimado",
                                      "Insumos Utilizados",
                                      "Responsável",
                                      "Data de Cadastro",
                                      "Observações",
                                      "Ações",
                                    ].map((header) => (
                                      <th
                                        key={header}
                                        className="border border-black px-2 py-2"
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {ListSteps.map((step, index) => (
                                    <tr
                                      key={step.order}
                                      className={
                                        index % 2 === 0
                                          ? "bg-white"
                                          : "bg-[#E7E7E7]"
                                      }
                                    >
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.order}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.name}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.code}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.time}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.material}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {step.responsible}
                                      </td>
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        {new Date().toLocaleDateString("pt-BR")}
                                      </td>
                                      <td className="border border-black px-4 py-2 text-center">
                                        <button
                                          className="text-blue-600 cursor-pointer group relative"
                                          onClick={() =>
                                            alert(`Observações: ${step.obs}`)
                                          }
                                        >
                                          <Eye />
                                          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 bg-black text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                                            Ver
                                          </div>
                                        </button>
                                      </td>
                                      <td className="border border-black px-4 py-2 text-center whitespace-nowrap">
                                        <button className="mr-4 text-black cursor-pointer group relative">
                                          <PencilLine />
                                          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 bg-black text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                                            Editar
                                          </div>
                                        </button>
                                        <button className="text-red-500 cursor-pointer group relative">
                                          <Trash />
                                          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 bg-black text-white text-xs rounded py-1 px-2 hidden group-hover:block">
                                            Excluir
                                          </div>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                    )}
                  </div>

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
                  <div>
                    <h3 className="text-xl font-semibold mb-5">
                      Etapas de produção:
                    </h3>
                    {stepData.length !== 0 && (
                      <div className="max-w-[60vw] overflow-x-auto max-h-[300px] overflow-y-auto mb-10">
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
                                  className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                  // onClick={() => handleObsClick(step)}
                                  onClick={() => setOpenObsModal(true)}
                                >
                                  <Eye />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Ver
                                  </div>
                                </button>
                              </td>
                              <td className="border border-black px-4 py-4 whitespace-nowrap">
                                <button
                                  className="mr-4 text-black cursor-pointer relative group"
                                  // onClick={() => handleEditClick(step)}
                                >
                                  <PencilLine />
                                  <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Editar
                                  </div>
                                </button>
                                <button
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
                    {/* Modal de Observações */}
                    <Modal
                      withExitButton
                      openModal={openObsModal}
                      setOpenModal={setOpenObsModal}
                      modalWidth="min-w-[300px] max-w-[500px]"
                      modalTitle="Observações"
                      obsText={formData.obs}
                    />
                  </div>
                  {showStepForm ? (
                    <div className="bg-gray-100 p-5 rounded-md shadow-xl mb-10">
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
                          inputWidth="w-[700px]"
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

                        <button
                          type="button"
                          className="bg-verdeMedio p-3 px-7 w-[88.52px] rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                          onClick={handleSaveStep}
                        >
                          Salvar
                        </button>

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
                              className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
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

      </div>
    </div>
  );
}
