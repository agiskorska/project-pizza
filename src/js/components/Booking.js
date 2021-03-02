import {classNames, select, settings, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.booked = {};


    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initBookingButton();
    thisBooking.initActions();

  }

  getData() {
    const thisBooking = this;

    const startDateParams = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParams = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParams,
        endDateParams,

      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParams,
        endDateParams,

      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParams,
      ],

    };

    const urls = {
      booking:        settings.db.url + '/' + settings.db.booking
      + '?' + params.booking.join('&'),
      eventsCurrent:  settings.db.url + '/' + settings.db.event
      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event
      + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),

    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all( [
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1) ) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  render() {
    const thisBooking = this;
    thisBooking.dom = {};
    thisBooking.dom.wrapper = thisBooking.element;

    const generatedHTML = templates.bookingWidget();
    const toDOM = utils.createDOMFromHTML(generatedHTML);
    const wrapper = thisBooking.dom.wrapper;
    wrapper.appendChild(toDOM);

    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.date = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.booking = document.querySelector(select.containerOf.booking);
    thisBooking.dom.button = document.getElementById(select.booking.button);
    thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.floor = document.querySelector(select.containerOf.floor);
  }

  parseValue(value) {
    return value;
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) === true
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  initActions() {
    const thisBooking = this;
    thisBooking.dom.floor.addEventListener('click', function(event) {
      const clickedElement = event.target;
      thisBooking.manageClasses(clickedElement);
      thisBooking.clickedElement = clickedElement;
    });
  }

  manageClasses(clickedElement) {
    const thisBooking = this;
    const tableBooked = clickedElement.getAttribute('class').includes(classNames.booking.tableBooked);
    for (let table of thisBooking.dom.tables) {
      // debugger;
      if (table != clickedElement) {
        table.classList.remove(classNames.booking.active);
      }
    }
    if (!tableBooked) {
      clickedElement.classList.toggle(classNames.booking.active);
      thisBooking.table = clickedElement.getAttribute(settings.booking.tableIdAttribute);
    }
  }

  isValid() {
    return true;
  }

  renderValue() {

  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.duration = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.people = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.date);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hour);


    thisBooking.dom.wrapper.addEventListener('updated', function() {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.active);
      }
      thisBooking.updateDOM();
    });
  }

  initBookingButton() {
    const thisBooking = this;
    thisBooking.dom.button.addEventListener('click', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
    thisBooking.dom.button.addEventListener('submit', function(event) {
      event.preventDefault();
    });

  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const booking = {};
    booking.starters = [];

    booking.id = Math.floor(Math.random()*10000);
    booking.date = thisBooking.date;
    booking.hour = utils.numberToHour(thisBooking.hour);
    booking.table = parseInt(thisBooking.table);
    booking.duration = thisBooking.duration.correctValue;
    booking.people = thisBooking.people.correctValue;
    booking.starter = document.getElementsByName(select.booking.starters);
    for (let starter of booking.starter) {
      if (starter.checked) {
        booking.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options);
    thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    thisBooking.manageClasses(thisBooking.clickedElement);
    thisBooking.updateDOM();

  }
}

export default Booking;
