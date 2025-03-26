import { Tabs, Form, Select, Dialog } from "radix-ui";
import { useState } from "react";
import { Plus, Check, ChevronDown, Eye, PencilLine, Trash, Search } from "lucide-react";

const pedidos = [
    {
      numero: 1,
      data: "23/03/2025",
      hora: "14:30",
      status: "Pendente",
      cliente: "Fernando Kotinda",
      previsaoEntrega: "27/03/2025",
      itens: "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Total Pedido: R$ 35.00",    
      valorTotal: 35.00,
      endereco: "Rua das Flores, 123",
      telefone: "(11) 98765-4321",
      cep: "12345-678",
      observacoes: "Atentar para a qualidade dos produtos orgânicos.",
    },
    {
      numero: 2,
      data: "22/03/2025",
      hora: "10:15",
      status: "Entregue",
      cliente: "Carlos Bandeira",
      previsaoEntrega: "26/03/2025",
      itens: "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Produto: Cenoura Qtd: 40kg  Preço Unitário: R$5  Subtotal: R$ 200.00 <br> Total Pedido: R$ 235.00",    
      valorTotal: 235.00,
      endereco: "Av. Central, 456",
      telefone: "(21) 91234-5678",
      cep: "87654-321",
      observacoes: "Atentar para a qualidade dos produtos orgânicos.",
    },
    {
      numero: 3,
      data: "23/03/2025",
      hora: "15:15",
      status: "Em produção",
      cliente: "Murilo Luiz",
      previsaoEntrega: "28/03/2025",
      itens: "Produto: Pão integral Orgânico  Qtd: 10un  Preço Unitário: R$2  Subtotal: R$ 20.00 <br> Produto: Tomate Orgânico Qtd: 5un  Preço Unitário: R$3  Subtotal: R$ 15.00 <br> Produto: Batata Orgânico Qtd: 10un  Preço Unitário: R$10  Subtotal: R$ 100.00 <br> Produto: Cenoura Qtd: 40kg  Preço Unitário: R$5  Subtotal: R$ 200.00 <br> Total Pedido: R$ 335.00",    
      valorTotal: 335.00,
      endereco: "Av. Principal, 456",
      telefone: "(41) 93224-5608",
      cep: "31232-321",
      observacoes: "Atentar para a qualidade dos produtos orgânicos.",
    },

  ];

interface Product {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    subtotal: number;
}

export default function Requests() {
    const [activeTab, setActiveTab] = useState("list");

    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const [showProductForm, setShowProductForm] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Omit<Product, "subtotal">>({
      name: "",
      quantity: 0,
      unit: "un",
      price: 0,
    });

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setNewProduct((prev) => ({
            ...prev,
            [name === "requestProduct" ? "name" :
             name === "requestQuantity" ? "quantity" :
             name === "requestPrice" ? "price" : name]:     
            name === "requestQuantity" || name === "requestPrice" ? Number(value) : value,
        }));

    };

    const handleUnitChange = (value: string) => {
        setNewProduct((prev) => ({ ...prev, unit: value }));
      };
    
    const handleSaveProduct = () => {
        if (newProduct.name && newProduct.quantity > 0 && newProduct.price > 0) {
        setProducts([...products, { ...newProduct, subtotal: newProduct.quantity * newProduct.price }]);
        setShowProductForm(false);
        setNewProduct({ name: "", quantity: 0, unit: "un", price: 0 });
        }
    };

    const totalPedido = products.reduce((total, product) => total + product.subtotal, 0);

    const handleOpenChange = (open: boolean) => {
        if (open) {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth", 
          });
        }
    };

    const openModal = (title: string, content: string) => {
        setModalTitle(title);
        setModalContent(content);
        setIsModalOpen(true);
    };

    const formatItens = (itens: string) => {
        return itens
          .replace(/(Produto:)/g, "<strong>$1</strong>")
          .replace(/(Qtd:)/g, "<strong>$1</strong>")
          .replace(/(Preço Unitário:)/g, "<strong>$1</strong>")
          .replace(/(Subtotal:)/g, "<strong>$1</strong>")
          .replace(/(Total Pedido:.*?R\$ \d+\.\d{2})/g, '<div class="pt-4 text-xl font-bold">$1</div>')
          .replace(/\n/g, "<br>");
    };
      
    
    return (
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

          <Tabs.Content 
            value="list"
            className="flex flex-col w-full"
          > 
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
                      <span className="text-xl pb-2 font-light">
                        Status:
                      </span>
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
                        <span className="text-xl pb-2 font-light">Data de Criação:</span>
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

                   <Form.Field name="filterDeliveryForecast" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Previsão de entrega:</span>
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

                   <Form.Submit asChild >
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
                        {["Número","Data", "Hora", "Status", "Cliente", "Previsão de Entrega", "Itens do Pedido", "Valor Total", "Endereço", "Telefone", "CEP", "Observações", "Ações",
                        ].map((header) => (
                            <th key={header} className="border border-black px-4 py-4 whitespace-nowrap">{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                        {pedidos.map((pedido, index) => (
                        <tr key={pedido.numero} className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}>

                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.numero}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.data}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.hora}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.status}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.cliente}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.previsaoEntrega}</td>

                        {/* Itens do Pedido */}
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                            <button 
                                className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                onClick={() => openModal("Itens do Pedido", pedido.itens)}
                            >
                                <Eye />
                                <div className="absolute right-0 bottom-5 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                Ver
                                </div>
                            </button>
                        </td>

                        <td className="border border-black px-4 py-4 whitespace-nowrap">R$ {pedido.valorTotal.toFixed(2)}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.endereco}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.telefone}</td>
                        <td className="border border-black px-4 py-4 whitespace-nowrap">{pedido.cep}</td>

                        {/* Observações */}
                        <td className="border border-black px-4 py-4 whitespace-nowrap">
                            <button 
                                className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                onClick={() => openModal("Observações", pedido.observacoes)}
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
                <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
                        <Dialog.Title className="text-xl font-bold mb-4">{modalTitle}</Dialog.Title>
                        <Dialog.Description 
                            className="text-gray-700"
                            dangerouslySetInnerHTML={{ __html: formatItens(modalContent) }}
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
                </Dialog.Root>
              </div>
          </Tabs.Content>
         
          <Tabs.Content
          value="register"
          className="flex items-center justify-center"
          >
            <Form.Root className="flex flex-col mb-10">
            <h2 className="text-3xl mb-8">Cadastrar Novo Pedido:</h2>

            <div className="flex gap-10 mb-8">
                <Form.Field name="request-client" className="flex flex-col">
                <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">
                    Cliente:
                    </span>
                </Form.Label>
                <Form.Control asChild>
                    <input
                    type="text"
                    name="request-client"
                    id="request-client"
                    placeholder="Cliente"
                    required
                    className="bg-white w-[400px] border border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>
                </Form.Field>
                
                <Form.Field name="request-tel" className="flex flex-col">
                <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Telefone:</span>
                </Form.Label>
                <Form.Control asChild>
                    <input
                    type="tel"
                    name="request-tel"
                    id="request-tel"
                    placeholder="(xx)xxxxx-xxxx"
                    required
                    autoComplete="tel"
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>
                </Form.Field>
                
                <Form.Field name="request-cep" className="flex flex-col">
                <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">CEP:</span>
                </Form.Label>
                <Form.Control asChild>
                    <input
                    type="text"
                    name="request-cep"
                    id="request-cep"
                    placeholder="xxxxx-xxx"
                    autoComplete="postal-code"
                    required
                    className="bg-white border w-[200px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>
                </Form.Field>
            </div>
            
            <div className="flex gap-11 mb-8">
                <Form.Field name="request-address"className="flex flex-col">
                <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Endereço Completo:</span>
                </Form.Label>
                <Form.Control asChild>
                    <input
                    type="text"
                    name="request-address"
                    id="request-address"
                    placeholder="Endereço Completo"
                    autoComplete="address-line1"
                    required
                    className="bg-white border w-[600px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>
                </Form.Field>

                <Form.Field name="date-forecast" className="flex flex-col">
                <Form.Label asChild>
                    <span className="text-xl pb-2 font-light">Previsão de entrega:</span>
                </Form.Label>
                <Form.Control asChild>
                    <input
                    type="date"
                    name="delivery-forecast"
                    id="delivery-forecast"
                    placeholder="Previsão de entrega"
                    required
                    className="bg-white border w-[239px] border-separator rounded-lg p-2.5 shadow-xl"
                    />
                </Form.Control>
                </Form.Field>
            </div>

            <div className="flex mb-5 ">
                <Form.Field name="request-observation"className="w-full flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Observações:</span>
                    </Form.Label>
                    <Form.Control asChild>
                    <textarea
                        id="request-observation"
                        name="request-observation   "
                        rows={3}
                        cols={50}
                        placeholder="Digite as observações do pedido"
                        maxLength={500}
                        className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                    ></textarea>
                    </Form.Control>
                </Form.Field>        
            </div>


            {/* Produtos adicionados */}
            <div>
                <h3 className="text-xl font-semibold mb-5">Itens do Pedido:</h3>
                {products.map((product, index) => (
                <span key={index} className="mt-2 flex gap-3">
                    <div><span className="font-semibold">Produto:</span> {product.name}</div> 
                    <div><span className="font-semibold"> Qtd:</span> {product.quantity} {product.unit}</div> 
                    <div><span className="font-semibold"> Preço Unitário:</span> R$ {product.price}</div>
                    <div><span className="font-semibold">Subtotal:</span> R$ {product.subtotal.toFixed(2)}</div>
                </span>
                ))}
                {products.length > 0 && <hr className="my-5" />}
            </div>

            {/* Formulário de novo produto */}
            {showProductForm ? (
            <div className="bg-gray-100 p-5 rounded-md shadow-xl mb-10">
                <div className="flex gap-10 mb-8">
                    <Form.Field name="requestProduct" className="flex flex-col w-full">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">
                        Nome do Produto:
                        </span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="requestProduct"
                        id="requestProduct"
                        placeholder="Nome do Produto"
                        value={newProduct.name} 
                        onChange={handleProductChange}
                        required
                        className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                </div>  

                <div className="flex gap-10 mb-8 justify-between">
                    <Form.Field name="requestQuantity" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Quantidade:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="number"
                        name="requestQuantity"
                        id="requestQuantity"
                        placeholder="Quantidade"
                        value={newProduct.quantity}
                        onChange={handleProductChange}
                        required
                        className="bg-white border w-[220px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                    
                    <Form.Field name="requestUnit" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Uni. de Medida:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <Select.Root value={newProduct.unit} onValueChange={handleUnitChange} onOpenChange={handleOpenChange}>
                        <Select.Trigger className="bg-white w-[220px] border border-separator rounded-lg p-2.5 shadow-xl flex items-center justify-between">
                            <Select.Value placeholder="Selecione a unidade" />
                            <Select.Icon className="ml-2">
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                            </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content className="bg-white border border-separator rounded-lg shadow-xl w-[220px] absolute bottom-54 left-2">
                                <Select.Viewport className="p-2">
                                {["un", "g", "kg", "l", "ml", "cm", "m", "t"].map((unit) => (
                                    <Select.Item
                                    key={unit}
                                    value={unit}
                                    className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded-md"
                                    >
                                    <Select.ItemText>{unit}</Select.ItemText>
                                    <Select.ItemIndicator>
                                        <Check className="w-4 h-4 text-green-500" />
                                    </Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                        </Select.Root>
                    </Form.Control>
                    </Form.Field>
                    
                    <Form.Field name="requestPrice" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Preço Unitário:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="number"
                        name="requestPrice"
                        id="requestPrice"
                        placeholder="Preço Unitário"
                        value={newProduct.price} 
                        onChange={handleProductChange}
                        required
                        className="bg-white border w-[220px] border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                    
                </div>  
                
                <div className="flex justify-center items-center gap-5">
                    <button type="button" onClick={handleSaveProduct} className="bg-verdeMedio p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro">Salvar</button>
                    <button type="button" onClick={() => setShowProductForm(false)} className="bg-red-700 p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-red-800">Cancelar</button>
                </div> 
            </div>
            ) : (
            <div>
                <div className="flex justify-between items-center gap-5 ">
                    <button 
                        type="button" 
                        onClick={() => {
                            setShowProductForm(true);
                            setTimeout(() => handleOpenChange(true), 100); 
                          }}
                        className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
                    >
                    <Plus /> Adicionar Produto
                    </button>
                    {products.length !== 0 && (
                    <span className="text-lg">Total do Pedido: <strong>R$ {totalPedido.toFixed(2)}</strong></span>
                    )}
                </div>
                {products.length !== 0 && (

                    <Form.Submit asChild >
                        <div className="flex place-content-center mt-10 ">
                            <button
                            type="submit"
                            className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
                            >
                            Cadastrar Pedido e Gerar NF
                            </button>
                        </div>
                    </Form.Submit>
                )}
            </div>
            )}

            </Form.Root>
                
          </Tabs.Content>
          
        </Tabs.Root>
  </div>
    );

}