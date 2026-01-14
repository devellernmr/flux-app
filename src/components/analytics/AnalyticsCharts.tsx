import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface AnalyticsChartsProps {
  dateRange: string;
  uploadData?: any[];
  statusData?: any[];
  projectPerformance?: any[];
}

export function AnalyticsCharts({
  uploadData = [],
  statusData = [],
  projectPerformance = [],
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. FLUXO DE UPLOADS (Area Chart) */}
      <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-6 min-h-[400px]">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          Fluxo de Entregas
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-normal">
            Arquivos
          </span>
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={uploadData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <SortDefs />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="uploads"
                stroke="#3b82f6"
                fill="url(#colorUploads)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO (Donut Chart) */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-6 min-h-[400px]">
        <h3 className="text-lg font-semibold text-white mb-6">Status Geral</h3>
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Legend */}
          <div className="absolute bottom-0 w-full flex justify-center gap-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] text-zinc-400 uppercase font-bold">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE POR PROJETO (Bar Chart) - ROW 2 */}
      <div className="lg:col-span-3 bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-6 min-h-[350px]">
        <h3 className="text-lg font-semibold text-white mb-6">
          Performance por Projeto
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectPerformance}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#27272a", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "#0a0a0a",
                  borderColor: "#27272a",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="completed"
                name="Concluídos"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="pending"
                name="Em Andamento"
                fill="#27272a"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const SortDefs = () => (
  <defs>
    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
    </linearGradient>
  </defs>
);
