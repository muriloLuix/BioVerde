import { Tabs, Form, Select, Dialog } from "radix-ui";
import { useState } from "react";
import {
  Plus,
  ChevronDown,
  Check,
  PencilLine,
  Eye,
  Trash,
  Search,
} from "lucide-react";

interface Step {
  name: string;
  code: string;
  order: number;
  responsible: string;
  status: string;
  material: string;
  time: string;
  obs: string;
}

export default function ProductionSteps() {
  const [activeTab, setActiveTab] = useState("list");
  const [activeProductTab, setActiveProductTab] = useState("1");

  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const [showStepForm, setShowStepForm] = useState<boolean>(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [newStep, setNewStep] = useState<Step>({
    name: "",
    code: `ETP-${steps.length + 1}`,
    order: 0,
    responsible: "",
    status: "pendente",
    material: "",
    time: "",
    obs: "",
  });

  const handleStepChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setNewStep((prev) => ({
      ...prev,
      [name === "stepName"
        ? "name"
        : name === "stepCode"
        ? "code"
        : name === "stepOrder"
        ? "order"
        : name === "stepResponsible"
        ? "responsible"
        : name === "stepMaterial"
        ? "material"
        : name === "stepEstimatedTime"
        ? "time"
        : name === "stepObservations"
        ? "obs"
        : name]: name === "requestOrder" ? Number(value) : value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setNewStep((prev) => ({ ...prev, status: value }));
  };

  const handleSaveStep = () => {
    if (newStep.name && newStep.order > 0 && newStep.responsible) {
      setSteps([...steps, { ...newStep, code: `ETP-${steps.length + 1}` }]);
      setShowStepForm(false);
      setNewStep({
        name: "",
        code: `ETP-${steps.length + 2}`,
        order: 0,
        responsible: "",
        status: "pendente",
        material: "",
        time: "",
        obs: "",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      window.scrollTo({
        top: 340,
        behavior: "smooth",
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
      status: "Em andamento",
      time: "2h",
      material: "Adubo orgânico",
      responsible: "João",
      obs: "Precisa monitorar o crescimento",
    },
    {
      order: 2,
      name: "Colheita",
      code: "CL002",
      status: "Pendente",
      time: "3h",
      material: "Tesoura agrícola",
      responsible: "Maria",
      obs: "Esperar maturação total",
    },
    {
      order: 3,
      name: "Seleção",
      code: "SL003",
      status: "Não iniciado",
      time: "1h30",
      material: "Balde e peneira",
      responsible: "Carlos",
      obs: "Selecionar apenas produtos de alta qualidade",
    },
    {
      order: 4,
      name: "Embalagem",
      code: "EM004",
      status: "Não iniciado",
      time: "2h",
      material: "Caixas biodegradáveis",
      responsible: "Ana",
      obs: "Etiquetar corretamente os produtos",
    },
    {
      order: 5,
      name: "Transporte",
      code: "TR005",
      status: "Não iniciado",
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

          {activeTab === "list" && (
            <div className="flex items-center justify-center">
              <div className="flex flex-col w-full">
                <div className="flex w-full max-w-[1100px] h-[68vh] mb-10">
                  {/* NavBar Estrutura de produtos */}
                  <div className="w-1/4 bg-gray-200 rounded-xl sombra">
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
                                      "Status",
                                      "Tempo Estimado",
                                      "Insumos Utilizados",
                                      "Responsável",
                                      "Data Início",
                                      "Data Conclusão",
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
                                        {step.status}
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
                                      <td className="border border-black px-4 py-2 whitespace-nowrap">
                                        27/03/2025
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
          )}

          {activeTab === "register" && (
            <div className="flex items-center justify-center">
              <Form.Root className="flex flex-col mb-10">
                <h2 className="text-3xl mb-8">Cadastrar Etapa de Produção</h2>
                <div className="flex gap-10 mb-8">
                  <Form.Field name="stepProduct" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        Produto Final:
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="stepProduct"
                        id="stepProduct"
                        placeholder="Nome do Produto"
                        required
                        className="bg-white w-[500px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>
                </div>
                <div>
                  <div>
                    <h3 className="text-xl font-semibold mb-5">
                      Etapas de produção:
                    </h3>
                    {steps.length !== 0 && (
                      <div className="max-w-[60vw] overflow-x-auto max-h-[300px] overflow-y-auto mb-10">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-verdePigmento text-white shadow-thead">
                              {[
                                "Ordem",
                                "Nome da Etapa",
                                "Código",
                                "Status",
                                "Tempo Estimado",
                                "Insumos Utilizados",
                                "Responsável",
                                "Data Início",
                                "Data Conclusão",
                                "Observações",
                                "Ações",
                              ].map((header) => (
                                <th
                                  key={header}
                                  className="border border-black px-2 py-2 whitespace-nowrap"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {steps.map((step, index) => (
                              <tr
                                key={step.order}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"
                                }
                              >
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.order}
                                </td>
                                <td className="border border-black px-2 py-2 whitespace-nowrap">
                                  {step.name}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.code}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.status}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.time}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.material}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {step.responsible}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {new Date().toLocaleDateString("pt-BR")}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  {"27/03/2025"}
                                </td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                  <button
                                    className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    onClick={() =>
                                      openModal("Observações", step.obs)
                                    }
                                  >
                                    <Eye />
                                    <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                      Ver
                                    </div>
                                  </button>
                                </td>

                                {/* Ações */}
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
                    )}
                  </div>
                  {showStepForm ? (
                    <div className="bg-gray-100 p-5 rounded-md shadow-xl mb-10">
                      <div className="flex gap-10 mb-8">
                        <Form.Field
                          name="stepName"
                          className="flex flex-col w-full"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Nome da Etapa:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="text"
                              name="stepName"
                              id="stepName"
                              placeholder="Nome da Etapa"
                              value={newStep.name}
                              onChange={handleStepChange}
                              required
                              className="bg-white border w-[400px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                        <Form.Field
                          name="stepCode"
                          className="flex flex-col w-full"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Código:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="text"
                              name="stepCode"
                              id="stepCode"
                              placeholder="Código"
                              value={newStep.code}
                              onChange={handleStepChange}
                              required
                              className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                        <Form.Field
                          name="stepOrder"
                          className="flex flex-col w-full"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Ordem Etapa:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="number"
                              name="stepOrder"
                              id="stepOrder"
                              placeholder="Ordem da Etapa"
                              value={newStep.order}
                              onChange={handleStepChange}
                              required
                              className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                      </div>
                      <div className="flex gap-10 mb-8">
                        <Form.Field
                          name="stepResponsible"
                          className="flex flex-col w-full"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Responsável:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="text"
                              name="stepResponsible"
                              id="stepResponsible"
                              placeholder="Nome do Responsável"
                              value={newStep.responsible}
                              onChange={handleStepChange}
                              required
                              className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                        <Form.Field name="stepStatus" className="flex flex-col">
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Status:
                            </span>
                          </Form.Label>
                          <Select.Root
                            value={newStep.status}
                            onValueChange={handleStatusChange}
                          >
                            <Form.Control asChild>
                              <Select.Trigger className="bg-white w-[250px] border border-separator rounded-lg p-2.5 shadow-xl flex justify-between items-center cursor-pointer">
                                <Select.Value placeholder="Selecione um status" />
                                <Select.Icon className="ml-2">
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                </Select.Icon>
                              </Select.Trigger>
                            </Form.Control>
                            <Select.Portal>
                              <Select.Content className="bg-white border border-separator rounded-lg shadow-xl w-[250px]">
                                <Select.Viewport className="p-2">
                                  {[
                                    { value: "pendente", label: "Pendente" },
                                    {
                                      value: "andamento",
                                      label: "Em andamento",
                                    },
                                    { value: "concluido", label: "Concluído" },
                                  ].map((status) => (
                                    <Select.Item
                                      key={status.value}
                                      value={status.value}
                                      className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded-md"
                                    >
                                      <Select.ItemText>
                                        {status.label}
                                      </Select.ItemText>
                                      <Select.ItemIndicator>
                                        <Check className="w-4 h-4 text-green-500" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </Form.Field>
                      </div>
                      <div className="flex gap-10 mb-8">
                        <Form.Field
                          name="stepMaterial"
                          className="flex flex-col w-full"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Insumos Utilizados:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="text"
                              name="stepMaterial"
                              id="stepMaterial"
                              placeholder="Insumos Utilizados"
                              value={newStep.material}
                              onChange={handleStepChange}
                              required
                              className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                        <Form.Field
                          name="stepEstimatedTime"
                          className="flex flex-col"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Tempo Estimado:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              type="text"
                              name="stepEstimatedTime"
                              id="stepEstimatedTime"
                              placeholder="Tempo Estimado"
                              value={newStep.time}
                              onChange={handleStepChange}
                              required
                              className="bg-white border w-[250px] border-separator rounded-lg p-2.5 shadow-xl"
                            />
                          </Form.Control>
                        </Form.Field>
                      </div>

                      <div className="flex gap-10 mb-8">
                        <Form.Field
                          name="stepObservations"
                          className="w-full flex flex-col"
                        >
                          <Form.Label asChild>
                            <span className="text-xl pb-2 font-light">
                              Observações:
                            </span>
                          </Form.Label>
                          <Form.Control asChild>
                            <input
                              id="stepObservations"
                              name="stepObservations"
                              // rows={3}
                              // cols={50}
                              value={newStep.obs}
                              onChange={handleStepChange}
                              placeholder="Digite as observações da Etapa"
                              maxLength={500}
                              className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                            ></input>
                          </Form.Control>
                        </Form.Field>
                      </div>

                      <div className="flex justify-center items-center gap-5">
                        <button
                          type="button"
                          onClick={handleSaveStep}
                          className="bg-verdeMedio p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowStepForm(false)}
                          className="bg-red-700 p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-red-800"
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
                      {steps.length !== 0 && (
                        <Form.Submit asChild>
                          <div className="flex place-content-center mt-10 ">
                            <button
                              type="submit"
                              className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
                            >
                              Cadastrar Etapas de Produção
                            </button>
                          </div>
                        </Form.Submit>
                      )}
                    </div>
                  )}
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
              </Form.Root>
            </div>
          )}
        </Tabs.Root>
      </div>
    </div>
  );
}
