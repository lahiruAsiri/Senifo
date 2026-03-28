'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Used', value: 82, color: '#3b82f6' },
  { name: 'Remaining', value: 18, color: '#f1f5f9' },
];

export default function CapacityGauge() {
  return (
    <div className="h-full w-full min-h-[300px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
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
                    <span className="text-[10px] font-bold uppercase">{data?.name}: {data?.value}%</span>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-x-0 bottom-4 text-center">
         <span className="text-2xl font-black text-slate-900 dark:text-slate-100">82%</span>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilized</p>
      </div>
    </div>
  );
}
