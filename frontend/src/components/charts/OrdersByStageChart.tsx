'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Pending', value: 5, color: '#94a3b8' },
  { name: 'Designing', value: 8, color: '#3b82f6' },
  { name: 'Production', value: 12, color: '#f97316' },
  { name: 'Payment', value: 6, color: '#e11d48' },
  { name: 'Completed', value: 15, color: '#10b981' },
];

export default function OrdersByStageChart() {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase text-muted-foreground font-bold">{data?.name}</span>
                       <span className="font-bold">{data?.value} Orders</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
