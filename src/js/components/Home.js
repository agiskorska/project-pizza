import {select, templates} from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor() {
    const thisHome = this;

    const generatedHTML = templates.home();
    const toDOM = utils.createDOMFromHTML(generatedHTML);
    const wrapper = document.querySelector(select.containerOf.home);
    wrapper.appendChild(toDOM);

    thisHome.initCarousel();

  }

  initCarousel() {
    var elem = document.querySelector('.main-carousel');
    /* eslint-disable no-unused-vars */
    // eslint-disable-next-line no-undef
    var flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      prevNextButtons: false,
      autoPlay: true,
    });
    /* eslint-enable no-unused-vars */
  }
}

export default Home;
