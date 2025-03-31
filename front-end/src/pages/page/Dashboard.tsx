const Dashboard = () => {
  const cardsNames = [
    { title: "Produtos em estoque", color: "bg-blue-500", quantity: 45 },
    {
      title: "Produtos em desenvolvimento",
      color: "bg-yellow-300",
      quantity: 12,
    },
    { title: "Pedidos pendentes", color: "bg-red-500", quantity: 20 },
    {
      title: "Pedidos concluídos (por mês)",
      color: "bg-green-600",
      quantity: 5,
    },
  ];

  const messages = [
    {
      title: "Novo Pedido",
      content: "Cliente solicitou 10 unidades de alface.",
      time: "10:30 AM",
    },
    {
      title: "Estoque Baixo",
      content: "Tomates quase acabando!",
      time: "11:00 AM",
    },
    {
      title: "Reunião",
      content: "Lembre-se da reunião às 15h.",
      time: "12:15 PM",
    },
  ];

  const feedbacks = [
    { user: "João Silva", message: "Ótima qualidade dos produtos!", rating: 5 },
    {
      user: "Ana Souza",
      message: "Entrega poderia ser mais rápida.",
      rating: 3,
    },
    {
      user: "Carlos Pereira",
      message: "Muito satisfeito com o atendimento!",
      rating: 4,
    },
  ];

  return (
    <div className="h-screen w-full flex flex-wrap justify-evenly p-5">
      {cardsNames.map((card, index) => (
        <div
          key={index}
          className={`h-1/4 w-1/5 ${card.color} rounded-lg p-4 text-white shadow-2xl`}
        >
          <div className="h-1/4 w-full">
            <span className="font-medium text-2xl block truncate">
              {card.title}
            </span>
          </div>
          <div className="h-3/4 w-full text-center flex items-center justify-center">
            <span className="font-medium text-6xl">{card.quantity}</span>
          </div>
        </div>
      ))}

      <div className="h-1/4 w-2/4 bg-gray-300 rounded-lg p-4 text-black overflow-auto">
        <span className="font-bold text-xl">Mensagens</span>
        <div className="mt-2 space-y-2">
          {messages.map((msg, index) => (
            <div key={index} className="bg-white p-2 rounded-lg shadow-md">
              <span className="font-semibold">{msg.title}</span>
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs text-gray-500">{msg.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-1/4 w-1/3 bg-gray-300 rounded-lg p-4 text-black overflow-auto">
        <span className="font-bold text-xl">Feedback</span>
        <div className="mt-2 space-y-2">
          {feedbacks.map((fb, index) => (
            <div key={index} className="bg-white p-2 rounded-lg shadow-md">
              <span className="font-semibold">{fb.user}</span>
              <p className="text-sm">{fb.message}</p>
              <span className="text-yellow-500">{"⭐".repeat(fb.rating)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-1/3 w-full rounded-lg p-4 box-border text-center bg-gray-300">
        <span className="font-bold text-xl">Previsão de demandas</span>
        <strong>Grafico</strong>
      </div>
    </div>
  );
};

export default Dashboard;
