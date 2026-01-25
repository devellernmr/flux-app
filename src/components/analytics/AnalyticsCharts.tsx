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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* 1. FLUXO DE UPLOADS (Area Chart) */}
      <div className="lg:col-span-2 bg-[#0A0A0A] border border-zinc-800/60 rounded-[32px] p-6 md:p-8 min-h-[350px] md:min-h-[380px] flex flex-col group hover:border-zinc-700/80 transition-colors">
        <h3 className="text-base md:text-lg font-black text-white mb-6 md:mb-8 flex items-center gap-3 tracking-tight">
          Fluxs. de Entregas
          <span className="hidden sm:inline-block text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-lg font-bold uppercase tracking-widest">
            Tempo Real
          </span>
        </h3>
        <div className="flex-1 w-full relative min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={uploadData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <SortDefs />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#18181b"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
                tick={{ fill: '#52525b', fontSize: 10 }}
              />
              <YAxis
                stroke="#52525b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                tick={{ fill: '#52525b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  borderColor: "#27272a",
                  borderRadius: "16px",
                  color: "#fff",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                  padding: "12px 16px"
                }}
                itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}
              />
              <Area
                type="monotone"
                dataKey="uploads"
                stroke="#3b82f6"
                fill="url(#colorUploads)"
                strokeWidth={4}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO (Donut Chart) */}
      <div className="bg-[#0A0A0A] border border-zinc-800/60 rounded-[32px] p-6 md:p-8 min-h-[350px] md:min-h-[380px] flex flex-col group hover:border-zinc-700/80 transition-colors">
        <h3 className="text-base md:text-lg font-black text-white mb-6 md:mb-8 tracking-tight">Status Geral</h3>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
                cornerRadius={8}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  borderColor: "#27272a",
                  borderRadius: "16px",
                  color: "#fff",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                  padding: "12px 16px"
                }}
                itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Absolute Legend */}
          <div className="absolute bottom-2 md:bottom-4 w-full flex flex-wrap justify-center gap-3 md:gap-4 px-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full ring-2 ring-offset-2 ring-offset-[#0A0A0A]"
                  style={{ backgroundColor: item.color, "--tw-ring-color": item.color } as any}
                />
                <span className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE POR PROJETO (Bar Chart) - ROW 2 */}
      <div className="lg:col-span-3 bg-[#0A0A0A] border border-zinc-800/60 rounded-[32px] p-6 md:p-8 min-h-[300px] flex flex-col group hover:border-zinc-700/80 transition-colors">
        <h3 className="text-base md:text-lg font-black text-white mb-6 md:mb-8 tracking-tight">
          Performance por Projeto
        </h3>
        <div className="flex-1 w-full relative min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={projectPerformance}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#18181b"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
                tick={{ fill: '#52525b', fontSize: 10 }}
              />
              <YAxis
                stroke="#52525b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#52525b', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#18181b", opacity: 0.5 }}
                contentStyle={{
                  backgroundColor: "#000000",
                  borderColor: "#27272a",
                  borderRadius: "16px",
                  color: "#fff",
                  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                  padding: "12px 16px"
                }}
                itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                labelStyle={{ color: "#a1a1aa", fontSize: "10px", fontWeight: "bold", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}
              />
              <Bar
                dataKey="completed"
                name="Concluídos"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
              <Bar
                dataKey="pending"
                name="Em Andamento"
                fill="#27272a"
                radius={[6, 6, 0, 0]}
                barSize={32}
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
