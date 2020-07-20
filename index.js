/**
 * @author Marcos Garcia (A01080115)
 * @version July/02/2020
 * @description hbs server side rendering app of pizza delivery service
 */

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const pizza = require("./pizza.json");
const Calculator = require("./priceCalculator");
const url = require("url");

const {validate} = require('validate-phone-number-node-js');
const regexNumb = new RegExp("^[0-9]{10}$");

const app = express();

//define pizza attributes
let pizzaSize;
let pizzaSizeValue;
let pizzaCrust;
let pizzaCrustValue;
let pizzaTopping;
let pizzaToppingValue;

//define client's order
let firstName;
let lastName;
let address;
let phone;
let toppings;
let crust;
let size;
let qty;

//define price
let sizePrice = 0;
let crustPrice = 0;
let pricePizza = [];

//define final values
let taxesValue = 0;
let subtotal = 0;
let arrayTotal = [];
let totalValue = 0;

let order = {}

app.use(express.json());
app.set("view engine", "hbs");
app.use(bodyParser.urlencoded({ extended: false }));

const pizzaData = (data) => {
  let pizzaSizes;
  let pizzaCrusts;
  let pizzaToppings;

  data !== undefined &&
    data.length > 0 &&
    data.map((pAttribute) => {
      pizzaSizes = pAttribute.size;
      pizzaCrusts = pAttribute.crust;
      pizzaToppings = pAttribute.toppings;
    });

  pizzaSize = Object.keys(pizzaSizes);
  pizzaSizeValue = Object.values(pizzaSizes);
  pizzaCrust = Object.keys(pizzaCrusts);
  pizzaCrustValue = Object.values(pizzaCrusts);
  pizzaTopping = Object.keys(pizzaToppings);
  pizzaToppingValue = Object.values(pizzaToppings);
};

pizza && pizzaData(pizza);

/**
 * @route    Get
 * @desc     
 * @access   Private
 */
app.get("/", (req, res) => {
  let pToppings = pizzaTopping;
  let pCrust = pizzaCrust;
  let pSize = pizzaSize;

  res.render("index", { pToppings, pCrust, pSize });
});

/**
 * @route    POST
 * @desc     
 * @access   Private
 */
app.post("/confirmation", (req, res) => {
  let {
    firstName,
    lastName,
    address,
    phone,
    toppings,
    crust,
    size,
    qty,
  } = req.body;

  if (
    !firstName||
    !lastName||
    !toppings ||
    !crust ||
    !size  ||
    !phone||
    !address||
    !validate(phone) ||
    !regexNumb.test(phone)
  ) {
    res.redirect(
      url.format({
        pathname: "/",
        error: "InvalidInput",
      })
    );
  } else {

    order = {
      NAME: `${firstName} ${lastName}`,
      ADDRESS: address,
      PHONE: phone,
      ORDER: [toppings, size, crust],
      QTY: qty,
    };

    try {
      for (let i = 0; i < pizzaTopping.length; i++) {
        pizzaToppingValue[pizzaTopping.indexOf(toppings[i])] !== undefined &&
          pricePizza.push(pizzaToppingValue[pizzaTopping.indexOf(toppings[i])]);
      }
      if (
        pizzaSizeValue[pizzaSize.indexOf(size)] !== undefined &&
        pizzaCrustValue[pizzaCrust.indexOf(crust)] !== undefined
      ) {
        sizePrice = pizzaSizeValue[pizzaSize.indexOf(size)];
        crustPrice = pizzaCrustValue[pizzaCrust.indexOf(crust)];
      }

      arrayTotal = arrayTotal.concat(pricePizza, sizePrice, crustPrice);

      const cal = new Calculator;

      subtotal = cal.getSubTotal(arrayTotal, qty);
      taxesValue = cal.getTaxes(subtotal);
      totalValue = cal.getTotal(subtotal, taxesValue);

      res.render("confirmation", {
        firstName: firstName,
        lastName: lastName,
        address: address,
        phone: phone,
        toppings: toppings,
        crust: crust,
        size: size,
        qty: qty,
        suTotal: subtotal,
        sizePrice: sizePrice,
        pizzaPrice: pricePizza,
        crustPrice: crustPrice,
        taxesValue: taxesValue,
        totalValue: totalValue,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
});

/**
 * @route    POST
 * @desc     
 * @access   Private
 */
app.post("/thankyou", (req, res) => { 
  // write json file
  let data = JSON.stringify(order, null, 2);
  fs.writeFileSync("orders.json", data);
  res.render("thankyou", { firstName: firstName, lastName: lastName });
});

const port = process.env.PORT || 3333;

app.listen(port, () =>
  console.log(`The web server has started on port ${port}`)
);
