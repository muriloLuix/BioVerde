import { Tabs, Form } from "radix-ui";
import { useState, useEffect } from "react";
import { Search, PencilLine, Trash, Loader2, Eye, FilterX, Printer } from "lucide-react";
import { InputMaskChangeEvent } from "primereact/inputmask";
import axios from "axios";

import { SmartField } from "../../shared";
import { ConfirmationModal } from "../../shared";
import { NoticeModal } from "../../shared";
import { Modal } from "../../shared";

interface Tipo {
  tproduto_id: number;
  tproduto_nome: string;
}
interface Unidade {
  unidade_id: number;
  unidade_nome: string;
}

interface Status {
  sta_id: number;
  sta_nome: string;
}

interface Produto {
  produto_id: number;
  produto_nome: string;
  tproduto_id?: number;
  produto_lote: string;
  produto_quantidade: string;
  produto_unidade_medida: string;
  produto_preco: string;
  fornecedor_nome: string;
  produto_dtProducao: string;
  produto_dtValidade: string;
  produto_dtCadastro: string;
  produto_observacoes: string;
  sta_id?: number;
}

export default function InventoryControl() {
  const [activeTab, setActiveTab] = useState("list");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openObsModal, setOpenObsModal] = useState(false);
  const [openNoticeModal, setOpenNoticeModal] = useState(false);
  const [currentObs, setCurrentObs] = useState("");
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const [suggestions, setSuggestions] = useState<Produto[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [errors, setErrors] = useState({
    type: false,
    unit: false,
    status: false,
    price: false,
    supplier: false,
  });
  const [formData, setFormData] = useState({
    produto_id: 0,
    nome_produto: "",
    tipo: "",
    lote: "",
    quantidade: "",
    unid_medida: "",
    status: "",
    preco: "",
    dt_producao: "",
    dt_validade: "",
    fornecedor: "",
    obs: "",
  });
  const [options, setOptions] = useState<{
    tipos: Tipo[];
    unidades_medida: Unidade[];
    status: Status[];
  }>({
    tipos: [],
    unidades_medida: [],
    status: [],
  });
  const [filters, setFilters] = useState({
    fnome_produto: "",
    ffornecedor: "",
    ftipo: "",
    flote: "",
    fquantidade: "",
    funid_medida: "",
    fdt_producao: "",
    fdt_validade: "",
    fdt_cadastro: "",
    fstatus: "",
  });
  const [deleteProduct, setDeleteProduct] = useState({
    produto_id: 0,
    dnome_produto: "",
    reason: "",
  });

  //Para quando digitar no campo de fornecedores, fazer a listagem deles
  useEffect(() => {
    const delayDebounce = setTimeout(() => {

      if (formData.fornecedor.trim().length > 0) {
        axios
          .get("http://localhost/BioVerde/back-end/produtos/listar_fornecedores.php",
            {
              params: { q: formData.fornecedor },
            }
          )
          .then((res) => {
            console.log(res.data);
            setSuggestions(res.data);
            setShowSuggestions(true);
          })
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [formData.fornecedor]);

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
    if (name in deleteProduct) {setDeleteProduct({ ...deleteProduct, [name]: value }) }

    setErrors(
      (prevErrors) =>
        Object.fromEntries(
          Object.keys(prevErrors).map((key) => [key, false])
        ) as typeof prevErrors
    );
  };

  //Capturar valor no campo de Preço
  const handlePriceChange = ({ value }: { value: string }) => {
    setFormData({ ...formData, preco: value });
    setErrors(errors => ({ ...errors, price: false }));
  };

  //função para puxar os dados do produto que será editado
  const handleEditClick = (produto: Produto) => {

    setFormData({
      produto_id: produto.produto_id,
      nome_produto: produto.produto_nome,
      tipo: produto.tproduto_id?.toString() || "",
      lote: produto.produto_lote,
      quantidade: produto.produto_quantidade,
      unid_medida: produto.produto_unidade_medida,
      status: produto.sta_id?.toString() || "",
      preco: produto.produto_preco,
      dt_producao: produto.produto_dtProducao,
      dt_validade: produto.produto_dtValidade,
      fornecedor: produto.fornecedor_nome,
      obs: produto.produto_observacoes,
    });
    setOpenEditModal(true);
  };

  //função para puxar o nome do produto que será excluido
  const handleDeleteClick = (produto: Produto) => {
    setDeleteProduct({
      produto_id: produto.produto_id,
      dnome_produto: produto.produto_nome,
      reason: "",
    });
    setOpenDeleteModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => new Set([...prev, "products", "options"]));
    
        const [optionsResponse, produtosResponse] = await Promise.all([
          axios.get("http://localhost/BioVerde/back-end/produtos/listar_opcoes.php", {
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }),
          axios.get("http://localhost/BioVerde/back-end/produtos/listar_produtos.php", {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

         console.log("Resposta do back-end:", produtosResponse.data);
        
        if (optionsResponse.data.success) {
          setOptions({
            tipos: optionsResponse.data.tipos || [],
            unidades_medida: optionsResponse.data.unidades_medida || [],
            status: optionsResponse.data.status || [],
          });
        } else {
          setOpenNoticeModal(true);
          setMessage(optionsResponse.data.message || "Erro ao carregar opções");
        }
    
        if (produtosResponse.data.success) {
          setProdutos(produtosResponse.data.produtos || []);
        } else {
          setOpenNoticeModal(true);
          setMessage(produtosResponse.data.message || "Erro ao carregar produtos");
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
          ["products", "options"].forEach((item) => newLoading.delete(item));
          return newLoading;
        });
      }
    };

    fetchData();
  }, []);

  //Função para Atualizar a Tabela após ação
  const refreshData = async () => {
    try {
      setLoading((prev) => new Set([...prev, "products"]));
  
      const response = await axios.get(
        "http://localhost/BioVerde/back-end/produtos/listar_produtos.php",
        { withCredentials: true }
      );
  
      if (response.data.success) {
        setProdutos(response.data.produtos || []);
        return true;
      } else {
        setMessage(response.data.message || "Erro ao carregar produtos");
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
        newLoading.delete("products");
        return newLoading;
      });
    }
  };

  //Submit de cadastrar produtos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const errors  = {
      type: !formData.tipo,
      unit: !formData.unid_medida,
      status: !formData.status,
      price: !formData.preco,
      supplier: !formData.fornecedor,
    };
    setErrors(errors);

    // Se algum erro for true, interrompe a execução
    if (Object.values(errors).some((error) => error)) {
      return;
    }

    setLoading((prev) => new Set([...prev, "submit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/produtos/cadastrar_produtos.php",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        await refreshData();
        setSuccessMsg(true);
        setMessage("Produto cadastrado com sucesso!");
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao cadastrar produto");
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

  // submit de Filtrar produtos
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "filterSubmit"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/produtos/filtro.produto.php",
        filters,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        setProdutos(response.data.produtos);
      } else {
        setOpenNoticeModal(true);
        setMessage(
          response.data.message || "Nenhum produto encontrado com esse filtro"
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

  // submit para atualizar o produto após a edição dele
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const errors  = {
      type: false,
      unit: false,
      status: false,
      price: !formData.preco,
      supplier: !formData.fornecedor,
    };
    setErrors(errors);

    if (errors.price) {return;}

    console.log("Dados sendo enviados:", formData); 

    setLoading((prev) => new Set([...prev, "updateProduct"]));
    setSuccessMsg(false);

    try {

      const response = await axios.post(
        "http://localhost/BioVerde/back-end/produtos/editar.produto.php",
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
        setMessage("Produto atualizado com sucesso!");
        clearFormData();
      } else {
        setMessage(response.data.message || "Erro ao atualizar produto.");
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
        newLoading.delete("updateProduct");
        return newLoading;
      });
    }
  };

  // submit para excluir um produto
  const handleDeleteProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => new Set([...prev, "deleteProduct"]));
    setSuccessMsg(false);

    try {
      const response = await axios.post(
        "http://localhost/BioVerde/back-end/produtos/excluir.produto.php",
        deleteProduct,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Resposta do back-end:", response.data);

      if (response.data.success) {
        await refreshData();
        setSuccessMsg(true);
        setMessage("Produto Excluído com sucesso!");
        setOpenConfirmModal(false);
      } else {
        setMessage(response.data.message || "Erro ao excluir produto.");
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
        newLoading.delete("deleteProduct");
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

  const handleObsClick = (produto: Produto) => {
    setCurrentObs(produto.produto_observacoes);
    setOpenObsModal(true);
  };
  
  return (
    <div className="flex-1 p-6 pl-[280px]">
      <div className="px-6 font-[inter]">
        <h1 className=" text-[40px] font-semibold text-center mb-3">
          Controle de Estoque
        </h1>

        <Tabs.Root
          defaultValue="list"
          className="h-full w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <Tabs.List className="flex gap-5 mb-6 border-b border-verdePigmento relative">
            <Tabs.Trigger
              value="list"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "list" ? "select animation-tab" : ""
              }`}
            >
              Lista de Estoque
            </Tabs.Trigger>

            <Tabs.Trigger
              value="register"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "register" ? "select animation-tab" : ""
              }`}
            >
              Adicionar Novo Produto
            </Tabs.Trigger>

            <Tabs.Trigger
              value="prices"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "prices" ? "select animation-tab" : ""
              }`}
            >
              Histórico de Preços
            </Tabs.Trigger>

            <Tabs.Trigger
              value="movements"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "movements" ? "select animation-tab" : ""
              }`}
            >
              Movimentações do Estoque
            </Tabs.Trigger>
          </Tabs.List>
          
          {/* Filtros */}
          <Tabs.Content value="list" className="flex flex-col w-full">
            <Form.Root className="flex flex-col gap-4" onSubmit={handleFilterSubmit}>
              <h2 className="text-3xl">Filtros:</h2>
              <div className="flex flex-col gap-8 max-w-[996px]">
                <div className="flex justify-between">

                  <SmartField
                    fieldName="fnome_produto"
                    fieldText="Nome do Produto"
                    type="text"
                    placeholder="Nome do produto"
                    value={filters.fnome_produto}
                    onChange={handleChange}
                    inputWidth="w-[345px]"
                  />

                  <SmartField
                    fieldName="ffornecedor"
                    fieldText="Fornecedor"
                    type="text"
                    placeholder="Nome do fornecedor"
                    autoComplete="name"
                    value={filters.ffornecedor}
                    onChange={handleChange}
                    inputWidth="w-[345px]"
                  />

                  <SmartField
                    fieldName="ftipo"
                    fieldText="Tipo"
                    isSelect
                    value={filters.ftipo}
                    onChange={handleChange}
                    isLoading={loading.has("options")}
                    inputWidth="w-[215px]"
                  > 
                    <option value="">Todos</option>
                    <option value="materia-prima">Matéria-Prima</option>
                    <option value="semiacabado">Semiacabado</option>
                    <option value="acabado">Acabado</option>
                  </SmartField> 

                </div>

                <div className="flex justify-between">

                  <SmartField
                    fieldName="flote"
                    fieldText="Lote"
                    type="text"
                    placeholder="Lote do produto"
                    value={filters.flote}
                    onChange={handleChange}
                    inputWidth="w-[215px]"
                  />

                  <SmartField
                    fieldName="fquantidade"
                    fieldText="Quantidade"
                    type="text"
                    placeholder="Quantidade"
                    value={filters.fquantidade}
                    onChange={handleChange}
                    inputWidth="w-[215px]"
                  />

                  <SmartField
                    fieldName="funid_medida"
                    fieldText="Uni. de Medida"
                    isSelect
                    value={filters.funid_medida}
                    onChange={handleChange}
                    isLoading={loading.has("options")}
                    inputWidth="w-[215px]"
                  > 
                    <option value="">Todos</option>
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
                    fieldName="fstatus"
                    fieldText="Status"
                    isSelect
                    value={filters.fstatus}
                    onChange={handleChange}
                    isLoading={loading.has("options")}
                    inputWidth="w-[215px]"
                  > 
                    <option value="">Todos</option>
                    {options.status?.map((status) => (
                      <option key={status.sta_id} value={status.sta_id}>
                        {status.sta_nome}
                      </option>
                    ))}
                  </SmartField> 

                </div>

                <div className="flex justify-between mb-10">
                  
                  <SmartField
                    isDate
                    fieldName="fdt_producao"
                    fieldText="Data de Produção"
                    value={filters.fdt_producao}
                    onChange={handleChange}
                    inputWidth="w-[215px]"
                  />

                  <SmartField
                    isDate
                    fieldName="fdt_validade"
                    fieldText="Data de Validade"
                    value={filters.fdt_validade}
                    onChange={handleChange}
                    inputWidth="w-[215px]"
                  />

                  <SmartField
                    isDate
                    fieldName="fdt_cadastro"
                    fieldText="Data de Cadastro"
                    value={filters.fdt_cadastro}
                    onChange={handleChange}
                    inputWidth="w-[215px]"
                  />

                  <Form.Submit asChild>
                    <div className="flex place-content-center gap-4 w-[215px] mt-9">
                      <button
                        type="submit"
                        className="bg-verdeMedio p-3 w-[115px] rounded-full text-white cursor-pointer flex place-content-center gap-2  sombra hover:bg-verdeEscuro"
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
                        className="bg-verdeLimparFiltros p-3 w-[115px] rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-hoverLimparFiltros"
                        disabled={loading.size > 0}
                        onClick={() =>
                          setFilters((prev) =>
                            Object.fromEntries(
                              Object.keys(prev).map((key) => [key, ""])
                            ) as typeof prev
                          )
                        }
                      >
                        <FilterX size={23} />
                        Limpar
                      </button>
                    </div>
                  </Form.Submit>
                </div>
              </div>
            </Form.Root>

            <div className="min-w-[966px] max-w-[73vw] overflow-x-auto max-h-[570px] overflow-y-auto mb-5">
            <table className="w-full border-collapse">
                {/* Tabela Cabeçalho */}
                <thead>
                  <tr className="bg-verdePigmento text-white shadow-thead">
                    {[
                      "ID",
                      "Nome Produto",
                      "Tipo",
                      "Lote",
                      "Quantidade",
                      "Uni. de Medida",
                      "Preço",
                      "Fornecedor",
                      "Status",
                      "Data de Produção",
                      "Data de Validade",
                      "Data de Cadastro",
                      "Observações",
                      "Ações"
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
                  {loading.has("products") ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                      </td>
                    </tr>
                  ) : produtos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    //Tabela Dados
                    produtos.map((produto, index) => (
                      <tr
                        key={produto.produto_id}
                        className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                      >
                        {Object.values(produto)
                          .slice(0, 9)
                          .map((value, idx) => (
                            <td
                              key={idx}
                              className="border border-black px-4 py-4 whitespace-nowrap"
                            >
                              {value}
                            </td>
                          ))
                        }
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          {new Date(produto.produto_dtProducao).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          {new Date(produto.produto_dtValidade).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          {new Date(produto.produto_dtCadastro).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                          <button
                            className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            onClick={() => handleObsClick(produto)}
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
                            onClick={() => handleEditClick(produto)}
                          >
                            <PencilLine />
                            <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                              Editar
                            </div>
                          </button>
                          <button
                            className="text-red-500 cursor-pointer relative group"
                            onClick={() => handleDeleteClick(produto)}
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
            {produtos.length !== 0 && (
              <div className="min-w-[966px] max-w-[73vw]">
                <button
                  type="button"
                  className="bg-verdeGrama p-3 w-[180px] ml-auto mb-5 rounded-full text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-[#246127]"
                >
                  <Printer />
                  Gerar Relatório
                </button>
              </div>
            )}

            {/* Modal de Observações */}
            <Modal
              withExitButton
              openModal={openObsModal}
              setOpenModal={setOpenObsModal}
              modalWidth="min-w-[300px] max-w-[500px]"
              modalTitle="Observações"
              obsText={currentObs}
            />
          </Tabs.Content>

          {/* Cadastrar Produto */}
          <Tabs.Content
            value="register"
            className="flex items-center justify-center"
          >
            <Form.Root className="flex flex-col" onSubmit={handleSubmit}>
              <h2 className="text-3xl mb-8">Adicionar Novo Produto</h2>

              <div className="flex gap-x-15 mb-8">

                <SmartField
                  fieldName="nome_produto"
                  fieldText="Nome do Produto"
                  fieldClassname="flex flex-col flex-1"
                  required
                  type="text"
                  placeholder="Digite o nome do produto"
                  value={formData.nome_produto}
                  onChange={handleChange}
                />
  
                <SmartField
                  isDatalist
                  fieldName="fornecedor"
                  fieldText="Fornecedor"
                  fieldClassname="flex flex-col flex-1"
                  error={errors.supplier ? "*" : undefined}
                  placeholder="Digite o nome do fornecedor"
                  inputWidth="w-[440px]"
                  autoComplete="off"
                  value={formData.fornecedor}
                  onChange={handleChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                  onFocus={() => formData.fornecedor && setShowSuggestions(true)}
                >
                  {showSuggestions && suggestions.length > 0 && (() => {
                    const filteredSuggestions = suggestions.filter(
                      (item) => item.fornecedor_nome !== formData.fornecedor
                    );

                    if (filteredSuggestions.length === 0) {
                      setShowSuggestions(false);
                      return null;
                    }

                    return (
                      <ul className="absolute z-10 w-full bg-white border border-t-0 rounded shadow max-h-60 overflow-auto">
                        {filteredSuggestions.map((item, index) => (
                          <li
                            key={index}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, fornecedor: item.fornecedor_nome }));
                              setShowSuggestions(false);
                            }}
                          >
                            {item.fornecedor_nome}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </SmartField>

              </div>

              <div className="flex gap-x-15 mb-8 items-center">

                <SmartField
                  fieldName="lote"
                  fieldText="Lote"
                  required
                  type="text"
                  placeholder="Lote do produto"
                  value={formData.lote}
                  onChange={handleChange}
                  inputWidth="w-[190px]"
                />

                <SmartField
                  fieldName="quantidade"
                  fieldText="Quantidade"
                  required
                  type="text"
                  placeholder="Quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  inputWidth="w-[190px]"
                />

                <SmartField
                  fieldName="unid_medida"
                  fieldText="Uni. de Medida"
                  isSelect
                  value={formData.unid_medida}
                  onChange={handleChange}
                  isLoading={loading.has("options")}
                  error={errors.unit ? "*" : undefined}
                  placeholderOption="Selecione a Unid."
                  inputWidth="w-[190px]"
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
                  fieldText="Preço"
                  type="text"
                  placeholder="Preço"
                  error={errors.price ? "*" : undefined}
                  value={formData.preco}
                  onValueChange={handlePriceChange}
                  inputWidth="w-[190px]"
                />

              </div>

              <div className="flex mb-8 justify-between">
                
                <SmartField
                  isDate
                  fieldName="dt_producao"
                  fieldText="Data de Produção"
                  required
                  value={formData.dt_producao}
                  onChange={handleChange}
                  inputWidth="w-[190px]"
                />

                <SmartField
                  isDate
                  fieldName="dt_validade"
                  fieldText="Data de Validade"
                  required
                  value={formData.dt_validade}
                  onChange={handleChange}
                  inputWidth="w-[190px]"
                />

                  <SmartField
                    fieldName="tipo"
                    fieldText="Tipo"
                    isSelect
                    value={formData.tipo}
                    onChange={handleChange}
                    isLoading={loading.has("options")}
                    error={errors.type ? "*" : undefined}
                    placeholderOption="Selecione o Tipo"
                    inputWidth="w-[190px]"
                  > 
                    {options.tipos?.map((tipo) => (
                      <option key={tipo.tproduto_id} value={tipo.tproduto_id}>
                        {tipo.tproduto_nome}
                      </option>
                    ))}
                  </SmartField>


                <SmartField
                  fieldName="status"
                  fieldText="Status"
                  isSelect
                  value={formData.status}
                  onChange={handleChange}
                  isLoading={loading.has("options")}
                  error={errors.status ? "*" : undefined}
                  placeholderOption="Selecione o Status"
                  inputWidth="w-[190px]"
                > 
                  {options.status?.map((status) => (
                    <option key={status.sta_id} value={status.sta_id}>
                      {status.sta_nome}
                    </option>
                  ))}
                </SmartField> 
              </div>

              <div className="flex mb-10 ">
                <SmartField
                  isTextArea
                  fieldName="obs"
                  fieldText="Observações"
                  fieldClassname="flex flex-col w-full"
                  placeholder="Digite as observações do produto"
                  value={formData.obs}
                  onChange={handleChange}
                />
              </div>

              <Form.Submit asChild>
                <div className="flex place-content-center mb-5">
                  <button
                    type="submit"
                    className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama flex place-content-center w-52"
                    disabled={loading.size > 0}
                  >
                    {loading.has("submit") ? (
                      <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                      " Adicionar Produto"
                    )}
                  </button>
                </div>
              </Form.Submit>

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
          modalTitle="Editar Produto:"
          leftButtonText="Editar"
          rightButtonText="Cancelar"
          loading={loading}
          isLoading={loading.has("updateProduct")}
          onCancel={() => {clearFormData(); errors.price = false}}
          onSubmit={handleUpdateProduct}
        >
          <div className="flex gap-x-15 mb-6">

            <SmartField
              fieldName="nome_produto"
              fieldText="Nome do Produto"
              fieldClassname="flex flex-col flex-1"
              required
              type="text"
              placeholder="Digite o nome do produto"
              value={formData.nome_produto}
              onChange={handleChange}
              inputWidth="w[340px]"
            />

            <SmartField
              fieldName="fornecedor"
              fieldText="Fornecedor"
              fieldClassname="flex flex-col flex-1"
              required
              type="text"
              placeholder="Digite o nome do fornecedor"
              autoComplete="name"
              value={formData.fornecedor}
              onChange={handleChange}
              inputWidth="w[340px]"
            />
            </div>

          <div className="flex gap-x-15 mb-6 items-center">

            <SmartField
              fieldName="lote"
              fieldText="Lote"
              required
              type="text"
              placeholder="Lote do produto"
              value={formData.lote}
              onChange={handleChange}
              inputWidth="w-[175px]"
            />

            <SmartField
              fieldName="quantidade"
              fieldText="Quantidade"
              required
              type="text"
              placeholder="Quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              inputWidth="w-[175px]"
            />

            <SmartField
              fieldName="unid_medida"
              fieldText="Uni. de Medida"
              isSelect
              value={formData.unid_medida}
              onChange={handleChange}
              isLoading={loading.has("options")}
              inputWidth="w-[175px]"
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
              fieldText="Preço"
              type="text"
              placeholder="Preço"
              error={errors.price ? "*" : undefined}
              value={formData.preco}
              onValueChange={handlePriceChange}
              inputWidth="w-[175px]"
            />

          </div>

          <div className="flex mb-6 justify-between">

            <SmartField
              isDate
              fieldName="dt_producao"
              fieldText="Data de Produção"
              required
              value={formData.dt_producao}
              onChange={handleChange}
              inputWidth="w-[175px]"
            />

            <SmartField
              isDate
              fieldName="dt_validade"
              fieldText="Data de Validade"
              required
              value={formData.dt_validade}
              onChange={handleChange}
              inputWidth="w-[175px]"
            />

            <SmartField
              fieldName="tipo"
              fieldText="Tipo"
              isSelect
              value={formData.tipo}
              onChange={handleChange}
              isLoading={loading.has("options")}
              inputWidth="w-[175px]"
            > 
              <option value="materia-prima">Matéria-Prima</option>
              <option value="semiacabado">Semiacabado</option>
              <option value="acabado">Acabado</option>
            </SmartField> 

            <SmartField
              fieldName="status"
              fieldText="Status"
              isSelect
              value={formData.status}
              onChange={handleChange}
              isLoading={loading.has("options")}
              inputWidth="w-[175px]"
            > 
              {options.status?.map((status) => (
                <option key={status.sta_id} value={status.sta_id}>
                  {status.sta_nome}
                </option>
              ))}
            </SmartField> 
          </div>

          <div className="flex mb-8 ">
            <SmartField
              isTextArea
              fieldName="obs"
              fieldText="Observações"
              fieldClassname="flex flex-col w-full"
              placeholder="Digite as observações do produto"
              value={formData.obs}
              onChange={handleChange}
              rows={2}
            />
          </div>

        </Modal>

        <Modal
          openModal={openDeleteModal}
          setOpenModal={setOpenDeleteModal}
          modalTitle="Excluir Produto:"
          leftButtonText="Excluir"
          rightButtonText="Cancelar"
          onDelete={() => {
            setOpenConfirmModal(true);
            setOpenDeleteModal(false);  
          }}
        >
          <div className="flex mb-10">

            <SmartField
              fieldName="dnome_empresa"
              fieldText="Nome do Produto"
              fieldClassname="flex flex-col w-full"
              type="text"
              autoComplete="name"
              required
              readOnly
              value={deleteProduct.dnome_produto}
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
              placeholder="Digite o motivo da exclusão do produto"
              value={deleteProduct.reason}
              onChange={handleChange}
            />

          </div>

        </Modal>

        {/* Alert para confirmar exclusão do produto */}
        <ConfirmationModal
          openModal={openConfirmModal}
          setOpenModal={setOpenConfirmModal}
          confirmationModalTitle="Tem certeza que deseja excluir o produto?"
          confirmationText="Essa ação não pode ser desfeita. Tem certeza que deseja continuar?"
          onConfirm={handleDeleteProduct}
          loading={loading}
          isLoading={loading.has("deleteProduct")}
          confirmationLeftButtonText="Cancelar"
          confirmationRightButtonText="Sim, excluir produto"
        />
      </div>
    </div>
  );
}
