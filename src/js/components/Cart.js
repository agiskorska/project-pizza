import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

  }

  initActions() {
    const thisCart = this;
    const clickableTrigger = thisCart.dom.toggleTrigger;
    clickableTrigger.addEventListener('click', function() {
      const clickedElement = this;
      clickedElement.parentNode.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice =  0;
    thisCart.totalPrice = 0;

    for (let product of thisCart.products) {
      if (product) {
        totalNumber += product.amount;
        subtotalPrice += product.amount * product.priceSingle;
      }
    }
    if (subtotalPrice != 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }
    for (let element of thisCart.dom.totalPrice) {
      element.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    if (thisCart.totalPrice != 0) {
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0;
    }
  }

  remove(arg) {
    const thisCart = this;
    let productIndex = '';
    for (let product of thisCart.products) {
      if (product == arg) {
        console.log(product.ui, arg.ui);
        productIndex = thisCart.products.indexOf(product);
      }
    }
    arg.dom.wrapper.innerHTML = '';
    delete thisCart.products[productIndex];
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {};
    payload.products = [];

    payload.address = thisCart.dom.form.querySelector(select.cart.address).value;
    payload.phone = thisCart.dom.form.querySelector(select.cart.phone).value;
    payload.totalPrice = thisCart.totalPrice;
    payload.deliveryFee = settings.cart.defaultDeliveryFee;
    payload.subtotalPrice = payload.totalPrice - payload.deliveryFee;
    payload.totalNumber = thisCart.dom.totalNumber.innerHTML;
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log('ordersent: ', payload);
    const options =  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);

  }
}

export default Cart;
