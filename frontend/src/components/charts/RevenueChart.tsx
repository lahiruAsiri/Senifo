import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

const data = [
  { name: 'Sep 07', income: 4000, orders: 2400 },
  { name: 'Sep 08', income: 7000, orders: 4500 },
  { name: 'Sep 09', income: 6500, orders: 3800 },
  { name: 'Sep 10', income: 9000, orders: 5200 },
  { name: 'Sep 11', income: 7200, orders: 4800 },
  { name: 'Sep 12', income: 8500, orders: 5900 },
  { name: 'Sep 13', income: 10000, orders: 6800 },
];

export default function RevenueChart() {
  return (
    <div className="h-full w-full min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="#94A3B8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 shadow-2xl ring-1 ring-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{payload[0].payload.name}</p>
                    <div className="space-y-1.5">
                       <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Income
                          </span>
                          <span className="text-xs font-black">LKR {payload[0].value?.toLocaleString()}</span>
                       </div>
                       <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Orders
                          </span>
                          <span className="text-xs font-black">LKR {payload[1].value?.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area 
            type="monotone" 
            dataKey="orders" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorOrders)" 
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
