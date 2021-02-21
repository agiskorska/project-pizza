import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


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
    thisBooking.dom.date = document.querySelector(select.widgets.datePicker.wrapper);
    console.log(thisBooking.dom.date);
    thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;
    new AmountWidget(thisBooking.dom.hoursAmount);
    new AmountWidget(thisBooking.dom.peopleAmount);
    new DatePicker(thisBooking.dom.date);
    new HourPicker(thisBooking.dom.hour);
  }
}

export default Booking;
