import { Tabs, Form } from "radix-ui";
import { useState, useEffect } from "react";
import {Plus, Eye, PencilLine, Trash, Search, Loader2 } from "lucide-react";
import { InputMaskChangeEvent } from "primereact/inputmask";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { SmartField } from "../../shared";
import { ConfirmationModal } from "../../shared";
import { Modal } from "../../shared";
import { NoticeModal } from "../../shared";
import { cepApi } from "../../utils/cepApi";

const orders = [
  {
    numero: 1,
    data: "23/03/2025",
    hora: "14:30",
    status: "Pendente",
    cliente: "Fernando Kotinda",
    previsaoEntrega: "27/03/2025",
    itens:
      "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Total Pedido: R$ 35.00",
    valorTotal: 35.0,
    endereco: "Rua das Flores, 123",
    telefone: "(11) 98765-4321",
    cep: "12345-678",
    observacoes: "Atentar para a qualidade dos itens orgânicos.",
  },
  {
    numero: 2,
    data: "22/03/2025",
    hora: "10:15",
    status: "Entregue",
    cliente: "Carlos Bandeira",
    previsaoEntrega: "26/03/2025",
    itens:
      "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Produto: Cenoura Qtd: 40kg  Preço Unitário: R$5  Subtotal: R$ 200.00 <br> Total Pedido: R$ 235.00",
    valorTotal: 235.0,
    endereco: "Av. Central, 456",
    telefone: "(21) 91234-5678",
    cep: "87654-321",
    observacoes: "Atentar para a qualidade dos itens orgânicos.",
  },
  {
    numero: 3,
    data: "23/03/2025",
    hora: "15:15",
    status: "Em produção",
    cliente: "Murilo Luiz",
    previsaoEntrega: "28/03/2025",
    itens:
      "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Produto: Batata Orgânico Qtd: 10un  Preço Unitário: R$10  Subtotal: R$ 100.00 <br> Produto: Cenoura Qtd: 40kg  Preço Unitário: R$5  Subtotal: R$ 200.00 <br> Total Pedido: R$ 335.00",
    valorTotal: 335.0,
    endereco: "Av. Principal, 456",
    telefone: "(41) 93224-5608",
    cep: "31232-321",
    observacoes: "Atentar para a qualidade dos itens orgânicos.",
  },
];

interface Estado {
  estado_id: number;
  cliente_estado: string;
}

interface Status {
  sta_id: number;
  sta_nome: string;
}

interface Unidade {
  unidade_id: number;
  unidade_nome: string;
}

interface Pedido {
  pedido_id: number;
  pedido_num: number;
  pedido_cliente: string;
  pedido_telefone: string;
  pedido_cep: string;
  pedido_endereco: string;
  pedido_num_endereco: string;
  pedido_cidade: string;
  pedido_estado: string;
  pedido_prevEntrega: string;
  pedido_dtCadastro: string;
  pedido_horaCadastro: string;
  pedido_observacoes: string;
  pedido_valor_total: number;
  sta_id?: number;
  pedido_itens: PedidoItem[];
}

interface PedidoItem {
  id: number;
  nome_produto: string;
  quantidade: number;
  unidade_medida: string;
  preco: string;
  subtotal: number;
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState("list");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openNoticeModal, setOpenNoticeModal] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [showNewItemForm, setShowNewItemForm] = useState<boolean>(false);
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [errors, setErrors] = useState({
    status: false,
    unit: false,
    states: false,
    price: false,
  });
  const [formData, setFormData] = useState({
    pedido_id: 0,
    nome_cliente: "",
    tel: "",
    cep: "",
    status: "",
    endereco: "",
    num_endereco: "",
    estado: "",
    cidade: "",
    prev_entrega: "",
    obs: "",
  });
  const [newItem, setNewItem] = useState<Omit<PedidoItem, "subtotal">>({
    id: 0,
    nome_produto: "",
    quantidade: 0,
    unidade_medida: "",
    preco: "",
  });
  const [options, setOptions] = useState<{
    estados: Estado[];
    status: Status[];
    unidades_medida: Unidade[];
  }>({
    estados: [],
    status: [],
    unidades_medida: [],
  });
  const [filters, setFilters] = useState({
    fnum_pedido: 0,
    fnome_cliente: "",
    ftel: "",
    fstatus: "",
    fcep: "",
    festado: "",
    fcidade: "",
    fprev_entrega: "",
    fdt_cadastro: "",
  });
  const [deleteOrder, setDeleteOrder] = useState({
    pedido_id: 0,
    dnum_pedido: 0,
    dnome_cliente: "",
    reason: "",
  });

  console.log(formData)
  console.log(newItem)

  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => new Set([...prev, "orders", "options"]));
    
        const [optionsResponse, pedidosResponse] = await Promise.all([
          axios.get("http://localhost/BioVerde/back-end/pedidos/listar_opcoes.php", {
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get("http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php", {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        // console.log("Resposta do back-end:", pedidosResponse.data);
        
        if (optionsResponse.data.success) {
          setOptions({
            estados: optionsResponse.data.estados || [],
            status: optionsResponse.data.status || [],
            unidades_medida: optionsResponse.data.unidades_medida || [],
          });
        } else {
          setOpenNoticeModal(true);
          setMessage(optionsResponse.data.message || "Erro ao carregar opções");
        }
    
        if (pedidosResponse.data.success) {
          setPedidos(pedidosResponse.data.pedidos || []);
        } else {
          setOpenNoticeModal(true);
          setMessage(pedidosResponse.data.message || "Erro ao carregar pedidos");
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
          ["orders", "options"].forEach((item) => newLoading.delete(item));
          return newLoading;
        });
      }
    };

    fetchData();
  }, []);

  //Função para Atualizar a Tabela após ação
  const refreshData = async () => {
    try {
      setLoading((prev) => new Set([...prev, "orders"]));
  
      const response = await axios.get(
        "http://localhost/BioVerde/back-end/pedidos/listar_pedidos.php",
        { withCredentials: true }
      );
  
      if (response.data.success) {
        setPedidos(response.data.pedidos || []);
        return true;
      } else {
        setMessage(response.data.message || "Erro ao carregar pedidos");
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
        newLoading.delete("orders");
        return newLoading;
      });
    }
  };

  // //função para puxar os dados do pedido que será editado
  // const handleEditClick = (pedido: Pedido) => {

  //   setFormData({
  //     fornecedor_id: pedido.fornecedor_id,
  //     nome_empresa: pedido.fornecedor_nome,
  //     razao_social: pedido.fornecedor_razao_social,
  //     email: pedido.fornecedor_email,
  //     tel: pedido.fornecedor_telefone,
  //     cnpj: pedido.fornecedor_CNPJ,
  //     responsavel: pedido.fornecedor_responsavel,
  //     status: pedido.sta_id?.toString() || "",
  //     cep: pedido.fornecedor_cep,
  //     endereco: pedido.fornecedor_endereco,
  //     estado: pedido.fornecedor_estado,
  //     cidade: pedido.fornecedor_cidade,
  //     num_endereco: pedido.fornecedor_num_endereco,
  //   });
  //   setOpenEditModal(true);
  // };

  // //função para puxar o nome do pedido que será excluido
  // const handleDeleteClick = (pedido: Pedido) => {
  //   setDeleteOrder({
  //     fornecedor_id: pedido.fornecedor_id,
  //     dnome_empresa: pedido.fornecedor_nome,
  //     reason: "",
  //   });
  //   setOpenDeleteModal(true);
  // };
  
  //OnChange dos campos
  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | InputMaskChangeEvent
  ) => {
    const { name, value } = event.target;

    if (name in formData) { setFormData({ ...formData, [name]: value }) }
    if (name in newItem) { setNewItem({ ...newItem, [name]: value }) }
    if (name in filters) { setFilters({ ...filters, [name]: value }) }
    if (name in deleteOrder) {setDeleteOrder({ ...deleteOrder, [name]: value }) }

    setErrors(
      (prevErrors) =>
        Object.fromEntries(Object.keys(prevErrors).map((key) => [key, false])
      ) as typeof prevErrors
    );
  };

  // Calcula Valor total do pedido
  const totalPedido = itens.reduce((total, itens) => total + itens.subtotal,0);

  //Capturar valor no campo de Preço
  const handlePriceChange = ({ value }: { value: string }) => {
    setNewItem({ ...newItem, preco: value });
    setErrors(errors => ({ ...errors, price: false }));
  };

  //Função de define qual será o submir que será enviado  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const submitEvent = e.nativeEvent as SubmitEvent;
    const buttonClicked = (submitEvent.submitter as HTMLButtonElement).name;
  
    if (buttonClicked === "saveItem") {
      handleSaveItem(e); //Submit de cadastrar um item no pedido 
    } else if (buttonClicked === "submitForm") {
      handleOrdersSubmit(e); //Submit de cadastrar o pedido completo
    }
  };

  //Função para Cadastrar Item no Pedido
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    const errors  = {
      states: false,
      status: false,
      unit: !newItem.unidade_medida,
      price: !newItem.preco,
    };
    setErrors(errors);
    if (errors.unit || errors.price) {return;}

    setItens([
      ...itens,
      { ...newItem, id: itens.length, subtotal: newItem.quantidade * Number(newItem.preco) },
    ]);
    setShowNewItemForm(false);
    clearNewItem();
    
  };

  //Submit de cadastrar pedidos
  const handleOrdersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //Validações
    const errors  = {
      states: !formData.estado,
      status: !formData.status,
      unit: false,
      price: false,
    };
    setErrors(errors);
    if (errors.states || errors.status) {return;}

    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);

    const completeOrder = {
      ...formData,
      valor_total: totalPedido,
      num_pedido: pedidos.length + 1,
      itens: itens,
    };

    console.log(completeOrder)

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/pedidos/cadastrar_pedidos.php",
        completeOrder,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        await refreshData();
        setSuccessMsg(true);
        setMessage(`Pedido número ${completeOrder.num_pedido} cadastrado com sucesso!`);
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao cadastrar pedido");
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

  // submit de Filtrar pedidos
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "filterSubmit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/pedidos/filtro.pedido.php",
        filters,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        setPedidos(response.data.pedidos);
      } else {
        setOpenNoticeModal(true);
        setMessage(
          response.data.message || "Nenhum pedido encontrado com esse filtro"
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

  // submit para atualizar o pedido após a edição dele
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados sendo enviados:", formData); // <-- Adicione esta linha

    setLoading((prev) => new Set([...prev, "updateOrder"]));
    setSuccessMsg(false);

    try {

      const response = await axios.post(
        "http://localhost/BioVerde/back-end/pedidos/editar.pedido.php",
        formData,
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
        setMessage("Pedido atualizado com sucesso!");
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao atualizar pedido.");
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
        newLoading.delete("updateOrder");
        return newLoading;
      });
    }
  };

  // submit para excluir um pedido
  const handleDeleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "deleteOrder"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/pedidos/excluir.pedido.php",
        deleteOrder,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        await refreshData();
        setSuccessMsg(true);
        setMessage("Pedido Excluído com sucesso!");
        setOpenConfirmModal(false);
      } else {
        setMessage(response.data.message || "Erro ao excluir pedido.");
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
      setOpenNoticeModal(true);
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete("deleteOrder");
        return newLoading;
      });
    }
  };

  //Scrolla a pagina para baixo quando clicar em "Adicionar Item"
  const handleOpenChange = (open: boolean) => {
    if (open) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  //Função para chamar a api de CEP
  const handleCepBlur = () => {
    setSuccessMsg(false);
    cepApi(formData.cep, setFormData, setOpenNoticeModal, setMessage);
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

  //Limpar NewItem
  const clearNewItem = () => {
    setNewItem((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, value]) => [
          key,
          typeof value === "number" ? 0 : "",
        ])
      ) as typeof prev
    );
  };

  return (
    <div className="flex-1 p-6 pl-[280px]">
      <div className="px-6 font-[inter] bg-brancoSal">
        <h1 className=" text-[40px] font-semibold text-center mb-3">Pedidos</h1>

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
              Lista de Pedidos
            </Tabs.Trigger>

            <Tabs.Trigger
              value="register"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "register" ? "select animation-tab" : ""
              }`}
            >
              Cadastrar Novo Pedido
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="list" className="flex flex-col w-full">
            <Form.Root className="flex flex-col gap-4 ">
              <h2 className="text-3xl">Filtros:</h2>
              <div className="flex flex-col gap-7">
                <div className="flex gap-9 mb-0">
                  <Form.Field name="filterReqNum" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Número:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="number"
                        name="filterReqNum"
                        id="filterReqNum"
                        placeholder="Nº Pedido"
                        className="bg-white border w-[120px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filterReqCliente" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Cliente:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="filterReqCliente"
                        id="filterReqCliente"
                        placeholder="Cliente"
                        className="bg-white w-[350px] border border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filterReqTel" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Telefone:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="tel"
                        name="filterReqTel"
                        id="filterReqTel"
                        placeholder="(xx)xxxxx-xxxx"
                        autoComplete="tel"
                        className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="FilterReqCep" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">CEP:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="text"
                        name="FilterReqCep"
                        id="FilterReqCep"
                        placeholder="xxxxx-xxx"
                        autoComplete="postal-code"
                        className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>
                </div>

                <div className="flex gap-7 mb-8">
                  <Form.Field name="filterReqStatus" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">Status:</span>
                    </Form.Label>
                    <Form.Control asChild>
                      <select
                        name="filterReqStatus"
                        id="filterReqStatus"
                        className="bg-white w-[200px] border border-separator rounded-lg p-2.5 shadow-xl"
                      >
                        <option value="todos">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="producao">Em Produção</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </Form.Control>
                  </Form.Field>

                  <Form.Field name="filterCreation" className="flex flex-col">
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        Data de Criação:
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="date"
                        name="filterCreationDate"
                        id="filterCreationDate"
                        className="bg-white border w-[240px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Field
                    name="filterDeliveryForecast"
                    className="flex flex-col"
                  >
                    <Form.Label asChild>
                      <span className="text-xl pb-2 font-light">
                        Previsão de entrega:
                      </span>
                    </Form.Label>
                    <Form.Control asChild>
                      <input
                        type="date"
                        name="filterDeliveryForecast"
                        id="filterDeliveryForecast"
                        className="bg-white border w-[240px] border-separator rounded-lg p-2.5 shadow-xl"
                      />
                    </Form.Control>
                  </Form.Field>

                  <Form.Submit asChild>
                    <div className="flex place-content-center mt-9 ml-4">
                      <button
                        type="submit"
                        className="bg-verdeMedio p-3 w-[140px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro "
                      >
                        <Search />
                        Pesquisar
                      </button>
                    </div>
                  </Form.Submit>
                </div>
              </div>
            </Form.Root>

            <div className="max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-15">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-verdePigmento text-white shadow-thead">
                    {[
                      "Número",
                      "Data",
                      "Hora",
                      "Status",
                      "Cliente",
                      "Previsão de Entrega",
                      "Itens do Pedido",
                      "Valor Total",
                      "Endereço",
                      "Telefone",
                      "CEP",
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
                  {orders.map((pedido, index) => (
                    <tr
                      key={pedido.numero}
                      className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                    >
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.numero}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.data}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.hora}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.status}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.cliente}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.previsaoEntrega}
                      </td>

                      {/* Itens do Pedido */}
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <Eye />
                          <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Ver
                          </div>
                        </button>
                      </td>

                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        R$ {pedido.valorTotal.toFixed(2)}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.endereco}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.telefone}
                      </td>
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        {pedido.cep}
                      </td>

                      {/* Observações */}
                      <td className="border border-black px-4 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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

              {/* Modal (Pop-up) */}
              {/* <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
                    <Dialog.Title className="text-xl font-bold mb-4">
                      {modalTitle}
                    </Dialog.Title>
                    <Dialog.Description
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: formatItens(modalContent),
                      }}
                    />
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
              </Dialog.Root> */}
            </div>
          </Tabs.Content>

          <Tabs.Content
            value="register"
            className="flex items-center justify-center"
          >
            <Form.Root className="flex flex-col mb-10" onSubmit={handleSubmit}>
              <h2 className="text-3xl mb-8">Cadastrar Novo Pedido:</h2>

              <div className="flex gap-10 mb-8">

                <SmartField
                  fieldName="nome_cliente"
                  fieldText="Cliente"
                  fieldClassname="flex flex-col flex-1"
                  required={showNewItemForm ? false : true}
                  type="text"
                  placeholder="Digite o nome do Cliente"
                  autoComplete="name"
                  value={formData.nome_cliente}
                  onChange={handleChange}
                />

                <SmartField
                  fieldName="cep"
                  fieldText="CEP"
                  withInputMask
                  required={showNewItemForm ? false : true}
                  type="text"
                  mask="99999-999"
                  autoClear={false}
                  pattern="^\d{5}-\d{3}$"
                  placeholder="Digite o CEP"
                  autoComplete="postal-code"
                  value={formData.cep}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  inputWidth="w-[200px]"
                />  

              </div>

              <div className="flex gap-10 mb-8">

                <SmartField
                  fieldName="endereco"
                  fieldText="Endereço"
                  required={showNewItemForm ? false : true}
                  type="text"
                  placeholder="Endereço"
                  value={formData.endereco}
                  onChange={handleChange}
                  autoComplete="street-address"
                  inputWidth="w-[300px]"
                />
                <SmartField
                  fieldName="num_endereco"
                  fieldText="Número"
                  required={showNewItemForm ? false : true}
                  type="text"
                  placeholder="Número"
                  value={formData.num_endereco}
                  onChange={handleChange}
                  autoComplete="address-line1"
                  inputWidth="w-[90px]"
                />

                <SmartField
                  fieldName="estado"
                  fieldText="Estado"
                  isSelect
                  value={formData.estado}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  isLoading={loading.has("options")}
                  error={errors.states ? "*" : undefined}
                  placeholderOption="Selecione o Estado"
                  inputWidth="w-[200px]"
                > 
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
                </SmartField> 

                <SmartField
                  fieldName="cidade"
                  fieldText="Cidade"
                  required={showNewItemForm ? false : true}
                  type="text"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  inputWidth="w-[200px]"
                />

              </div>

              <div className="flex mb-5 justify-between">

                <SmartField
                  fieldName="tel"
                  fieldText="Telefone"
                  withInputMask
                  required={showNewItemForm ? false : true}
                  type="tel"
                  mask="(99) 9999?9-9999"
                  autoClear={false}
                  pattern="^\(\d{2}\) \d{5}-\d{3,4}$"
                  placeholder="Digite o Telefone"
                  autoComplete="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  inputWidth="w-[250px]"
                /> 

                <SmartField
                  isDate
                  required={showNewItemForm ? false : true}
                  fieldName="prev_entrega"
                  fieldText="Previsão de entrega"
                  value={formData.prev_entrega}
                  onChange={handleChange}
                  inputWidth="w-[250px]"
                />

                <SmartField
                  fieldName="status"
                  fieldText="Status"
                  isSelect
                  value={formData.status}
                  onChange={handleChange}
                  isLoading={loading.has("options")}
                  error={errors.status ? "*" : undefined}
                  placeholderOption="Selecione o status"
                  inputWidth="w-[250px]"
                > 
                  {options.status?.map((status) => (
                    <option key={status.sta_id} value={status.sta_id}>
                      {status.sta_nome}
                    </option>
                  ))}
                </SmartField> 

              </div>

              <div className="flex mb-5">

                <SmartField
                  isTextArea
                  fieldName="obs"
                  fieldText="Observações"
                  fieldClassname="flex flex-col w-full"
                  placeholder="Digite as observações do pedido"
                  value={formData.obs}
                  onChange={handleChange}
                  rows={2}
                />
              </div>

              {/* Itens adicionados */}
              <h3 className="text-xl font-semibold mb-5">Itens do Pedido:</h3>
              {itens.length > 0 && (
                <div className="max-w-[910px] overflow-x-auto overflow-y-auto mb-8">
                  <table className="w-full border-collapse">
                    <thead className="bg-verdePigmento text-white shadow-thead">
                      <tr>
                      {[
                        "#",
                        "Produto",
                        "Qtd.",
                        "Preço Unitário",
                        "Subtotal",
                      ].map((header) => (
                        <th
                          key={header}
                          className="border border-black px-2 py-3 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => {
                        const itemData = [
                          index + 1, 
                          item.nome_produto, 
                          `${item.quantidade} ${item.unidade_medida}`,
                          `R$ ${item.preco}`,
                          `R$ ${item.subtotal.toFixed(2)}`,
                        ];
                        return(
                          <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                          >
                            {itemData.map((value, i) => (
                              <td
                                key={i}
                                className="border border-black px-3 py-3 text-center whitespace-nowrap"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Formulário de novo item */}
              {showNewItemForm ? ( 
                <div className="bg-gray-100 p-5 rounded-md shadow-xl mb-10">
                  <div className="flex gap-10 mb-8">

                    <SmartField
                      fieldName="nome_produto"
                      fieldText="Nome do Produto"
                      fieldClassname="flex flex-col w-full"
                      required
                      type="text"
                      placeholder="Digite o nome do Produto"
                      value={newItem.nome_produto}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="flex gap-10 mb-8 justify-between">

                    <SmartField
                      fieldName="quantidade"
                      fieldText="Quantidade"
                      required
                      type="number"
                      min="1"
                      placeholder="Digite a Quantidade"
                      value={newItem.quantidade}
                      onChange={handleChange}
                      inputWidth="w-[220px]"
                    />

                    <SmartField
                      fieldName="unidade_medida"
                      fieldText="Unidade de Medida"
                      isSelect
                      value={newItem.unidade_medida}
                      onChange={handleChange}
                      isLoading={loading.has("options")}
                      error={errors.unit ? "*" : undefined}
                      placeholderOption="Selecione a Unidade"
                      inputWidth="w-[220px]"
                    > 
                      <option value="un">un</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="l">L</option>
                      <option value="ml">ml</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="t">t</option>
                    </SmartField> 


                    <SmartField
                      isPrice
                      fieldName="preco"
                      fieldText="Preço Unitário"
                      type="text"
                      placeholder="Preço"
                      error={errors.price ? "*" : undefined}
                      value={newItem.preco}
                      onValueChange={handlePriceChange}
                      inputWidth="w-[220px]"
                    />
                  </div>

                  <div className="flex justify-center items-center gap-5">
                    <Form.Submit asChild>
                      <button
                        type="submit"
                        name="saveItem"
                        className="bg-verdeMedio p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro"
                      >
                        Salvar
                      </button>
                    </Form.Submit>
                    <button
                      type="button"
                      onClick={() => {setShowNewItemForm(false); clearNewItem()}}
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
                        setShowNewItemForm(true);
                        setTimeout(() => handleOpenChange(true), 100);
                      }}
                      className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
                    >
                      <Plus /> Adicionar Item
                    </button>
                    {itens.length > 0 && (
                      <span className="text-lg">
                        Total do Pedido:{" "}
                        <strong>R$ {totalPedido.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                  {itens.length > 0 && (
                    <Form.Submit asChild>
                      <div className="flex place-content-center mt-10">
                        <button
                          type="submit"
                          name="submitForm"
                          className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center w-64"
                        >
                        {loading.has("submit") ? (
                          <Loader2 className="animate-spin h-6 w-6" />
                        ) : (
                          "Cadastrar Pedido e Gerar NF"
                        )}
                        </button>
                      </div>
                    </Form.Submit>
                  )}
                </div>
              )}
            </Form.Root>
          </Tabs.Content>
        </Tabs.Root>


        {/* Modal de Avisos */}
        <NoticeModal
          openModal={openNoticeModal}
          setOpenModal={setOpenNoticeModal}
          successMsg={successMsg}
          message={message}
        />
        
        {/* Modal de Edição */}
        <Modal
          openModal={openEditModal}
          setOpenModal={setOpenEditModal}
          modalTitle="Editar Pedido:"
          leftButtonText="Editar"
          rightButtonText="Cancelar"
          loading={loading}
          isLoading={loading.has("updateOrder")}
          onCancel={() => clearFormData()}
          onSubmit={handleUpdateOrder}
        >

        </Modal>

        <Modal
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          modalTitle="Excluir Pedido:"
          leftButtonText="Excluir"
          rightButtonText="Cancelar"
          onDelete={() => {
            setOpenConfirmModal(true);
            setOpenDeleteModal(false);  
          }}
        >
          <div className="flex mb-8">

            <SmartField
              fieldName="dnum_pedido"
              fieldText="Nome do Pedido"
              fieldClassname="flex flex-col w-full"
              type="text"
              required
              readOnly
              value={deleteOrder.dnum_pedido}
              onChange={handleChange}
            />

          </div>

          <div className="flex mb-8">

            <SmartField
              fieldName="dnome_cliente"
              fieldText="Nome do Cliente"
              fieldClassname="flex flex-col w-full"
              type="text"
              required
              readOnly
              value={deleteOrder.dnome_cliente}
              onChange={handleChange}
            />

          </div>

          <div className="flex mb-8 ">

            <SmartField
              isTextArea
              fieldName="reason"
              required
              autoFocus
              fieldText="Motivo da Exclusão"
              fieldClassname="flex flex-col w-full"
              placeholder="Digite o motivo da exclusão do pedido"
              value={deleteOrder.reason}
              onChange={handleChange}
            />

          </div>

        </Modal>

        {/* Alert para confirmar exclusão do fornecedor */}
        <ConfirmationModal
          openModal={openConfirmModal}
          setOpenModal={setOpenConfirmModal}
          confirmationModalTitle="Tem certeza que deseja excluir o pedido?"
          confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
          onConfirm={handleDeleteOrder}
          loading={loading}
          isLoading={loading.has("deleteOrder")}
          confirmationLeftButtonText="Cancelar"
          confirmationRightButtonText="Sim, excluir pedido"
        />        
      </div>
    </div>
  );
}


