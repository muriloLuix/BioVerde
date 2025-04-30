import {
  Mail,
  Package2,
  PackageCheck,
  PackageOpen,
  PackageSearch,
} from "lucide-react";
import { Separator } from "radix-ui";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const Dashboard = () => {
  const cardsNames = [
    {
      title: "EM ESTOQUE",
      icon: <PackageSearch className="text-white" />,
      quantity: Math.floor(Math.random() * 100),
    },
    {
      title: "EM DESENVOLVIMENTO",
      icon: <Package2 className="text-white" />,
      quantity: Math.floor(Math.random() * 100),
    },
    {
      title: "PENDENTES",
      icon: <PackageOpen className="text-white" />,
      quantity: Math.floor(Math.random() * 100),
    },
    {
      title: "CONCLUÍDOS (P/MÊS)",
      icon: <PackageCheck className="text-white" />,
      quantity: Math.floor(Math.random() * 100),
    },
  ];

  const data = [
    {
      name: "MAIO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "JUNHO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "JULHO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "AGOSTO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "SETEMBRO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "OUTUBRO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
    {
      name: "NOVEMBRO",
      pedidosTotal: Math.floor(Math.random() * 5000),
      estoqueOcupado: Math.floor(Math.random() * 5000),
    },
  ];

  const messages = [
    "Alerta! Escassez de Milho Verde no estoque",
    "Atualização! Aveia está nos processos finais",
    "URGENTE! Queijo está vencido",
    "Alerta! Excesso de Batata no estoque",
  ];

  const occupation = [
    {
      name: "OCUPADO",
      value: Math.floor(Math.random() * 1000),
    },
    {
      name: "LIVRE",
      value: Math.floor(Math.random() * 1000),
    },
  ];

  const colors = ["#dddddd", "#32CD32"];

  return (
    <div className="pl-64">
      <div className="h-screen w-full flex flex-wrap items-start p-4">
        <div className="h-3/12 w-full flex items-center justify-around p-2 shadow-2xl rounded-lg bg-verdeEscuroForte">
          {cardsNames.map((card, index) => (
            <>
              <div key={index} className="h-full w-1/5 flex flex-col p-2">
                <div className="h-1/4 w-full flex p-1 item-center justify-center gap-2 font-medium">
                  {card.icon}
                  <span className="text-white">{card.title}</span>
                </div>
                <div className="h-3/4 w-full flex items-center justify-center font-medium">
                  <span className="text-5xl text-white">{card.quantity}</span>
                </div>
              </div>
              {index < 3 ? (
                <Separator.Root
                  className="bg-white data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0.25"
                  decorative
                  orientation="vertical"
                />
              ) : null}
            </>
          ))}
        </div>

        <div className="h-4/12 w-full flex items-center justify-around">
          <div className="h-full w-5/11 p-3 bg-verdeEscuroForte rounded-lg overflow-auto">
            <div className="h-1/5 w-full flex items-center p-2 gap-2">
              <Mail className="text-white" />
              <span className="text-lg font-semibold text-white">
                NOTIFICAÇÕES
              </span>
            </div>
            <Separator.Root className="h-0.25 w-full m-auto bg-white" />
            {messages.map((msg, index) => (
              <div
                key={index}
                className="h-1/5 w-full my-1 flex items-center p-2 bg-verdeMedio hover:bg-verdeEscuro rounded-lg cursor-pointer"
              >
                <span className="text-sm text-white">{msg}</span>
              </div>
            ))}
          </div>
          <div className="h-full w-5/11 flex flex-col items-center justify-center p-5 bg-verdeEscuroForte rounded-lg">
            <span className="mb-2 font-semibold text-xl text-white">
              ESTOQUE
            </span>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                
                    const colors = ["#344E41", "#ffffff"]
                    
                    return (
                      <text
                        key={index}
                        x={x}
                        y={y}
                        fill={colors[index]}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="14"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  stroke="none"
                  isAnimationActive
                  animationEasing="linear"
                  labelLine={false}
                >
                  {occupation.map((__, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]}  stroke="none" />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-4/12 w-full rounded-lg p-2 box-border text-center shadow-xl bg-verdeEscuroForte">
          <span className="font-semibold text-xl text-white">
            PREVISÃO 2025
          </span>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={data}
              style={{ fontSize: "1.1rem", fontWeight: "lighter" }}
            >
              <CartesianGrid strokeDasharray="5 5" />
              <XAxis dataKey="name" tick={{ stroke: "white" }} />
              <YAxis tick={{ stroke: "white" }} tickCount={4} />
              <Legend verticalAlign="top" height={30} />
              <Line type="monotone" dataKey="pedidosTotal" name="TOTAL DE PEDIDOS" stroke="#32CD32" />
              <Line type="monotone" dataKey="estoqueOcupado" name="PRODUTOS EM ESTOQUE" stroke="#DDDDDD" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
