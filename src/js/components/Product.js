import {select, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;
    const generateHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generateHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.dom = {};
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

  }

  initAccordion() {
    const thisProduct = this;
    const clickableTrigger = thisProduct.dom.accordionTrigger;
    clickableTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      const clickedElement = this;
      const activeProducts = document.querySelectorAll('article.'+classNames.menuProduct.wrapperActive);
      for (let activeProduct of activeProducts) {
        if (activeProduct && activeProduct!=thisProduct.element) {
          activeProduct.classList.remove('active');
        }
      }
      clickedElement.parentNode.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm() {
    const thisProduct = this;
    thisProduct.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function() {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addtoCart();
    });

  }

  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    let price = thisProduct.data.price;

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const selector = `.${paramId}-${optionId}`;
        const image = thisProduct.dom.imageWrapper.querySelector(selector);
        if (image) {
          image.classList.remove(classNames.menuProduct.wrapperActive);
        }
        if (formData[paramId].includes(optionId)) {
          if (image) {
            image.classList.add(classNames.menuProduct.wrapperActive);
          }
          if (!option.default) {
            price += option.price;
          }
        } else {
          if (option.default) {
            price -= option.price;
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;

    thisProduct.dom.priceElem.innerHTML = price;
  }

  prepareCartProductParams(params) {
    if (!params) { return;}
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const chosenOptions = {};

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      chosenOptions[paramId] =
        {
          label: param.label,
          options: {}
        };
      for (let optionId in param.options) {
        const option = param.options[optionId];
        if (formData[paramId].includes(optionId)) {
          chosenOptions[paramId].options[optionId] = option.label;
        }
      }
    }
    return chosenOptions;

  }


  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  addtoCart() {
    const thisProduct = this;
    const summary = thisProduct.prepareCartProduct();
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: summary,

      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;
    const productSummary = {};
    productSummary.id  = thisProduct.id;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.name = thisProduct.data.name;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = productSummary.priceSingle * productSummary.amount;
    productSummary.params = thisProduct.prepareCartProductParams(thisProduct.data.params);

    return productSummary;
  }
}

export default Product;
