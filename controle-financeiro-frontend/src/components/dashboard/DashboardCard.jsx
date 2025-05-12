import React from 'react';

const DashboardCard = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl text-blue-600 font-bold">R$ {value}</p>
    </div>
  );
};

export default DashboardCard;
