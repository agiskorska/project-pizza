import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;

    thisBooking.render();
    thisBooking.initWidgets();
  }

  render() {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;
    const generatedHTML = templates.bookingWidget();
    const toDOM = utils.createDOMFromHTML(generatedHTML);
    const wrapper = thisBooking.dom.wrapper;
    wrapper.appendChild(toDOM);

    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    console.log(thisBooking.dom.peopleAmount);
  }

  initWidgets() {
    const thisBooking = this;
    new AmountWidget(thisBooking.dom.hoursAmount);
    new AmountWidget(thisBooking.dom.peopleAmount);
  }
}

export default Booking;
