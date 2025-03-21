const Dashboard = () => {
  return (
    <div className="h-screen w-full flex flex-wrap justify-around items-center px-10 py-5">
      <div className="h-1/4 w-2/5 basis-3xl bg-gray-300 rounded-lg p-4">
        <div className="h-1/4 w-full">
          <span className="font-medium text-2xl">Produtos em estoque</span>
        </div>
        <div className="h-3/4 w-full text-center place-content-center">
          <span className="font-medium text-6xl">20</span>
        </div>
      </div>
      <div className="h-1/4 w-2/5 basis-3xl bg-gray-300 rounded-lg p-4">
        <div className="h-1/4 w-full">
          <span className="font-medium text-2xl">
            Produtos em desenvolvimento
          </span>
        </div>
        <div className="h-3/4 w-full text-center place-content-center">
          <span className="font-medium text-6xl">20</span>
        </div>
      </div>
      <div className="h-1/4 w-2/5 basis-3xl bg-gray-300 rounded-lg p-4">
        <div className="h-1/4 w-full">
          <span className="font-medium text-2xl">Pedidos pendentes</span>
        </div>
        <div className="h-3/4 w-full text-center place-content-center">
          <span className="font-medium text-6xl">20</span>
        </div>
      </div>
      <div className="h-1/4 w-2/5 basis-3xl bg-gray-300 rounded-lg p-4">
        <div className="h-1/4 w-full">
          <span className="font-medium text-2xl">
            Pedidos concluídos (por mês)
          </span>
        </div>
        <div className="h-3/4 w-full text-center place-content-center">
          <span className="font-medium text-6xl">20</span>
        </div>
      </div>
      <div className="h-1/3 w-full bg-gray-300 rounded-lg p-4">
        <span>grafico muito louco</span>
      </div>
    </div>
  );
};

export default Dashboard;
