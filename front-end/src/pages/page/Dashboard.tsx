import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

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

  const data = [
    {
      name: "Janeiro",
      Concluido: 4000,
      Pendente: 2400,
      Desenvolvendo: 2000,
      Estoque: 750,
      amt: 2400,
    },
    {
      name: "Fevereiro",
      Concluido: 3000,
      Pendente: 1398,
      Desenvolvendo: 1200,
      Estoque: 9000,
      amt: 2210,
    },
    {
      name: "Março",
      Concluido: 2000,
      Pendente: 9800,
      Desenvolvendo: 900,
      Estoque: 900,
      amt: 2290,
    },
    {
      name: "Abril",
      Concluido: 6780,
      Pendente: 3908,
      Desenvolvendo: 1000,
      Estoque: 200,
      amt: 2000,
    },
    {
      name: "Maio",
      Concluido: 1890,
      Pendente: 4800,
      Desenvolvendo: 1000,
      Estoque: 2000,
      amt: 2181,
    },
    {
      name: "Junho",
      Concluido: 2390,
      Pendente: 3800,
      Desenvolvendo: 1000,
      Estoque: 5000,
      amt: 2500,
    },
    {
      name: "Julho",
      Concluido: 6490,
      Pendente: 4300,
      Desenvolvendo: 1000,
      Estoque: 300,
      amt: 2100,
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

      <div className="h-1/3 w-full rounded-lg p-4 box-border text-center shadow-xl bg-[#F5F5F5]">
        <span className="font-bold text-xl">Previsão de demandas 2025</span>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="Concluido" stroke="#00FF00" />
            <Line type="monotone" dataKey="Pendente" stroke="#FF0000	" />
            <Line type="monotone" dataKey="Desenvolvendo" stroke="#FFFF00" />
            <Line type="monotone" dataKey="Estoque" stroke="#0000FF" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
