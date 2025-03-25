import { Tabs, Form, Select, Dialog } from "radix-ui";
import { useState } from "react";
import { Plus, ChevronDown, Check, PencilLine, Eye, Trash, Search } from "lucide-react";

interface Material {
    name: string;
    code: string;
    quantity: string;
    unit: string;
    category: string;
    obs: string;
}

export default function ProductStructure() {
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

    const [showStructureForm, setShowStructureForm] = useState<boolean>(false);
    const [structure, setStructure] = useState<Material[]>([]);
    const [newStructure, setNewStructure] = useState<Material>({
        name: "",
        code: "",
        quantity: "",
        category: "materia-prima",
        unit: "un",
        obs: "",
    });

    const handleStructureChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setNewStructure((prev) => ({
            ...prev,
            [name === "MaterialName" ? "name" :
            name === "MaterialCode" ? "code" :
            name === "MaterialQuantity" ? "quantity": 
            name === "MaterialObservations" ? "obs": name]: value
        }));
    };

    const handleCategoryChange = (value: string) => {
        setNewStructure((prev) => ({ ...prev, category: value }));
    };

    const handleUnitChange = (value: string) => {
        setNewStructure((prev) => ({ ...prev, unit: value }));
    };

    const handleSaveStructure = () => {
        if (newStructure.name && newStructure.code && newStructure.quantity && newStructure.unit) {
            setStructure([...structure, { ...newStructure}]);
            setShowStructureForm(false);
            setNewStructure({
                name: "",
                code: "",
                quantity: "",
                category: "materia-prima",
                unit: "un",
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
        { id: "1", name: "Laranja Orgânica" },
        { id: "2", name: "Açúcar Orgânico" },
        { id: "3", name: "Tomate Orgânico" },
      ];
    
      const ListMaterial = [
        {
          id: 1,
          material: "Muda de laranjeira orgânica",
          code: "ML-ORG-001",
          quantity: "1",
          unit: "unidade",
          category: "Plantio",
          obs: "Certificada como orgânica",
        },
        {
          id: 2,
          material: "Composto orgânico",
          code: "COMP-ORG-005",
          quantity: "5",
          unit: "kg",
          category: "Fertilização",
          obs: "Produzido com resíduos vegetais",
        },
        {
          id: 3,
          material: "Biofertilizante líquido",
          code: "BIOF-002",
          quantity: "2",
          unit: "litros",
          category: "Nutrição",
          obs: "A base de algas marinhas",
        },
        {
          id: 4,
          material: "Cobertura morta (palha)",
          code: "COB-ORG-010",
          quantity: "10",
          unit: "kg",
          category: "Proteção do solo",
          obs: "Palha de arroz ou serragem",
        },
        {
          id: 5,
          material: "Calda bordalesa",
          code: "CALDA-ORG-003",
          quantity: "1",
          unit: "litro",
          category: "Controle de pragas",
          obs: "Preparo natural para prevenção de fungos",
        },
      ];

      

    return (
      <div className="px-6 font-[inter] bg-brancoSal">
        <h1 className=" text-[40px] font-semibold text-center mb-3">Estrutura de Produtos</h1>
  
        <Tabs.Root
            value={activeTab} onValueChange={setActiveTab} className="w-full"
        >
          <Tabs.List className="flex gap-5 border-b border-verdePigmento relative mb-7">
            <Tabs.Trigger
              value="list"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "list" ? "select animation-tab" : ""
              }`}
              onClick={() => setActiveTab("list")}
            >
              Lista de Estrutura de Produtos
            </Tabs.Trigger>
  
            <Tabs.Trigger
              value="register"
              className={`relative px-4 py-2 text-verdePigmento font-medium cursor-pointer ${
                activeTab === "register" ? "select animation-tab" : ""
              }`}
              onClick={() => setActiveTab("register")}
            >
              Cadastrar Estrutura de Produto
            </Tabs.Trigger>
          </Tabs.List>
            
         {activeTab === "list" && (
          <div className="flex items-center justify-center">
          <div className="flex flex-col w-full">
              <div className="flex w-full max-w-[1100px] h-[68vh] mb-10">
                {/* NavBar Estrutura de produtos */}
                <div className="w-1/4 bg-gray-200 rounded-xl sombra">
                    <div className="bg-green-800 p-4 rounded-t-xl">
                        <h2 className="text-white text-center text-lg font-semibold">Estrutura de Produtos</h2>
                        <div className="flex items-center gap-2 relative">
                            <Search className="text-black w-5 h-5 absolute right-2 bottom-2.5"/>
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
                            product.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((product) => (
                        <button
                            key={product.id}
                            value={product.id}
                            onClick={() => setActiveProductTab(product.id)}
                            className={`relative px-4 py-2 text-black font-medium cursor-pointer hover:bg-gray-300 rounded-lg ${
                            activeProductTab === product.id ? "bg-gray-300" : "" }`}
                            >
                            {product.name}
                        </button>
                        ))}
                    </div>
                </div>
                <div className="w-3/4 px-15">
                    {products.map((product) => (
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
                                        "ID",
                                        "Nome do Insumo",
                                        "Código",
                                        "Quantidade",
                                        "Uni. de Medida",
                                        "Categoria",
                                        "Observações",
                                        "Ações",
                                        ].map((header) => (
                                        <th key={header} className="border border-black px-2 py-2">
                                            {header}
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {ListMaterial.map((material, index) => (
                                        <tr
                                        key={material.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}
                                        >
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.id}</td>
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.material}</td>
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.code}</td>
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.quantity}</td>
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.unit}</td>
                                        <td className="border border-black px-4 py-2 whitespace-nowrap">{material.category}</td>
                                        <td className="border border-black px-4 py-2 text-center">
                                            <button
                                            className="text-blue-600 cursor-pointer group relative"
                                            onClick={() => alert(`Observações: ${material.obs}`)}
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
                    ))}
                </div>
                </div>
          </div>
          </div>
          )} 
         
         {activeTab === "register" && (
            <div className="flex items-center justify-center">
                <Form.Root className="flex flex-col mb-10">
                <h2 className="text-3xl mb-8">Cadastrar Estrutura de Produtos</h2>
                <div className="flex gap-10 mb-8">
                    <Form.Field name="structureProduct" className="flex flex-col">
                    <Form.Label asChild>
                        <span className="text-xl pb-2 font-light">Produto Final:</span>
                    </Form.Label>
                    <Form.Control asChild>
                        <input
                        type="text"
                        name="structureProduct"
                        id="structureProduct"
                        placeholder="Nome do Produto"
                        required
                        className="bg-white w-[500px] border border-separator rounded-lg p-2.5 shadow-xl"
                        />
                    </Form.Control>
                    </Form.Field>
                </div>
                <div>
                    <div>
                        <h3 className="text-xl font-semibold mb-5">Estrutura do Produto:</h3>
                        {structure.length !== 0 && (
                        <div className="max-w-[60vw] overflow-x-auto max-h-[300px] overflow-y-auto mb-10">
                            <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-verdePigmento text-white shadow-thead">
                                {["ID","Nome do Insumo", "Código", "Quantidade","Uni. de Medida", "Categorio", "Observações", "Ações",
                                ].map((header) => (
                                    <th key={header} className="border border-black px-2 py-2 whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                                {structure.map((material, index) => (
                                <tr key={material.code} className={index % 2 === 0 ? "bg-white" : "bg-[#E7E7E7]"}>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">{index + 1}</td>
                                <td className="border border-black px-2 py-2 whitespace-nowrap">{material.name}</td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">{material.code}</td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">{material.quantity}</td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">{material.unit}</td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">{material.category}</td>
                                <td className="border border-black px-4 py-4 whitespace-nowrap">
                                <button
                                    className="text-blue-600 cursor-pointer relative group top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    onClick={() => openModal("Observações", material.obs)}
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
                    {showStructureForm ? (
                    <div className="bg-gray-100 p-5 rounded-md shadow-xl mb-10">
                        <div className="flex gap-10 mb-8">
                            <Form.Field name="MaterialName" className="flex flex-col w-full">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">
                                Nome do Insumo:
                                </span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="MaterialName"
                                id="MaterialName"
                                placeholder="Nome do Insumo"
                                value={newStructure.name}
                                onChange={handleStructureChange}
                                required
                                className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                            </Form.Field>

                            <Form.Field name="MaterialCode" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">
                                Código:
                                </span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="MaterialCode"
                                id="MaterialCode"
                                placeholder="Código"
                                value={newStructure.code}
                                onChange={handleStructureChange}
                                required
                                className="bg-white border border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                            </Form.Field>
 
                        </div>
                        <div className="flex gap-10 mb-8">
                            <Form.Field name="MaterialQuantity" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">Quantidade:</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <input
                                type="text"
                                name="MaterialQuantity"
                                id="MaterialQuantity"
                                placeholder="Quantidade"
                                value={newStructure.quantity}
                                onChange={handleStructureChange}
                                required
                                className="bg-white border w-[180px] border-separator rounded-lg p-2.5 shadow-xl"
                                />
                            </Form.Control>
                            </Form.Field>

                            <Form.Field name="MaterialUnit" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">Uni. de Medida:</span>
                            </Form.Label>
                            <Form.Control asChild>
                                <Select.Root value={newStructure.unit} onValueChange={handleUnitChange}>
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

                            <Form.Field name="MaterialCategory" className="flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">Categoria:</span>
                            </Form.Label>
                            <Select.Root value={newStructure.category} onValueChange={handleCategoryChange}>
                                <Form.Control asChild>
                                <Select.Trigger className="bg-white w-[250px] border border-separator rounded-lg p-2.5 shadow-xl flex justify-between items-center cursor-pointer">
                                    <Select.Value placeholder="Selecione a categoria" />
                                    <Select.Icon className="ml-2">
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </Select.Icon>
                                </Select.Trigger>
                                </Form.Control>
                                <Select.Portal>
                                <Select.Content className="bg-white border border-separator rounded-lg shadow-xl w-[250px]">
                                    <Select.Viewport className="p-2">
                                    {[
                                        { value: "materia-prima", label: "Matéria-Prima" },
                                        { value: "produto-semiacabado", label: "Produto Semiacabado" },
                                        { value: "produto-acabado", label: "Produto Acabado" },
                                    ].map((category) => (
                                        <Select.Item
                                        key={category.value}
                                        value={category.value}
                                        className="p-2 flex items-center justify-between cursor-pointer hover:bg-gray-200 rounded-md"
                                        >
                                        <Select.ItemText>{category.label}</Select.ItemText>
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
                            <Form.Field name="MaterialObservations"className="w-full flex flex-col">
                            <Form.Label asChild>
                                <span className="text-xl pb-2 font-light">Observações:</span>
                            </Form.Label>
                            <Form.Control asChild>
                            <input
                                id="MaterialObservations"
                                name="MaterialObservations"
                                // rows={3}
                                // cols={50}
                                value={newStructure.obs}
                                onChange={handleStructureChange}
                                placeholder="Digite as observações do Insumo"
                                maxLength={500}
                                className="g-white border resize-none border-separator rounded-lg p-2.5 shadow-xl"
                            ></input>
                            </Form.Control>
                            </Form.Field>
                        </div>
                
                        <div className="flex justify-center items-center gap-5">
                            <button type="button" onClick={handleSaveStructure}  className="bg-verdeMedio p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-verdeEscuro">Salvar</button>
                            <button type="button" onClick={() => setShowStructureForm(false)} className="bg-red-700 p-3 px-7 rounded-xl text-white cursor-pointer flex place-content-center gap-2  hover:bg-red-800">Cancelar</button>
                        </div>
                    </div>
                    ) : (
                    <div>
                        <div className="flex justify-between items-center gap-5 ">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStructureForm(true);
                                    setTimeout(() => handleOpenChange(true), 100);
                                }}
                                className="bg-verdeMedio p-3 rounded-2xl text-white cursor-pointer flex place-content-center gap-2 sombra hover:bg-verdeEscuro"
                            >
                            <Plus /> Adicionar Insumo
                            </button>
                        </div>
                        {structure.length !== 0 && (
                            <Form.Submit asChild >
                                <div className="flex place-content-center mt-10 ">
                                    <button
                                    type="submit"
                                    className="bg-verdePigmento p-5 rounded-lg text-white cursor-pointer sombra  hover:bg-verdeGrama "
                                    >
                                    Cadastrar Estrutura de Produto
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
                        <Dialog.Title className="text-xl font-bold mb-4">{modalTitle}</Dialog.Title>
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
    );

}