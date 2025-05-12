// utils/getMonthName.js
export const getMonthName = (month) => {
  const nomes = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return nomes[month - 1];
};
