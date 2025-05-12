const compareDates = (a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA - dateB;
  };
  
  module.exports = compareDates;
  