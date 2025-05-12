import React from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const BarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="categoria" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" fill="#3b82f6" />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
