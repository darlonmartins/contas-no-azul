export const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  export const getMonthName = (month) => {
    const [year, monthIndex] = month.split('-');
    const date = new Date(year, parseInt(monthIndex) - 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };
  