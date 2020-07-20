module.exports = class Calculator {

  constructor(){}

  getSubTotal = function (values, qty) {
    return values.reduce((acc, current) => acc + current) * qty;
  };

  getTaxes = function (subTotal) {
    subTotal = (subTotal * 0.05).toFixed(2);
    return parseFloat(subTotal);
  };

  getTotal = function (subTotal, totalTaxes) {
    return subTotal + totalTaxes;
  };
}