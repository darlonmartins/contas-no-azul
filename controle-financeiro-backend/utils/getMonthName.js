const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const getMonthName = (monthNumber) => {
    return monthNames[monthNumber - 1] || '';
  };
  
  module.exports = getMonthName;
  