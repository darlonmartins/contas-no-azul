import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../ui/card";


const data = [
  { name: "Jan", despesas: 1200 },
  { name: "Fev", despesas: 1500 },
  { name: "Mar", despesas: 1000 },
  { name: "Abr", despesas: 1800 },
];

const ExpensesChart = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Despesas por Mês</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="despesas" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensesChart;
