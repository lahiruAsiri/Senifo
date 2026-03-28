'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const data = [
  { name: 'Jan', revenue: 42000, cost: 18000 },
  { name: 'Feb', revenue: 51000, cost: 22000 },
  { name: 'Mar', revenue: 68000, cost: 28000 },
  { name: 'Apr', revenue: 75000, cost: 31000 },
  { name: 'May', revenue: 84200, cost: 35000 },
];

export default function RevenueChart() {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `LKR ${value / 1000}k`}
          />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            content={({ active, payload }) => {
              if (active && payload && payload.length >= 2) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Revenue</span>
                          <span className="font-bold text-primary">LKR {payload[0].value?.toLocaleString()}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-bold">Cost</span>
                          <span className="font-bold text-rose-500">LKR {payload[1].value?.toLocaleString()}</span>
                       </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
          <Bar dataKey="cost" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-rose-500 opacity-80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
