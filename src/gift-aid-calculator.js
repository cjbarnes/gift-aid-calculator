/**
 * All JavaScript for the Gift Aid calculator.
 * @author cJ barnes mail@cjbarnes.co.uk
 * @version 1.0.0
 * @license MIT
 */
(function giftAidCalculator() {
  'use strict';

  /**
   * On DOM ready, hook up the events that make the Gift Aid calculator work,
   * and set initial values and styling.
   */
  function initGiftAidCalculator() {

    /**
     * For each Gift Aid calculator on this page, replace the initial `.no-js`
     * class with `.js` to flag that JavaScript is on.
     */
    (function setJSFlag() {
      var i, l;
      var calculators = document.querySelectorAll('.js-gift-aid-calculator');
      var re = /(^|[^\S])no-js($|[^\S])/;
      for (i = 0, l = calculators.length; i < l; i++) {
        calculators[i].className = calculators[i].className.replace(re, ' js ');
      }
    })();

  }

  /*
   * Initialize on DOM ready. All of this block is the equivalent of jQuery's
   * `$(document).ready(initGiftAidCalculator)`.
   */
  if ('loading' !== document.readyState) {
    initGiftAidCalculator();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', initGiftAidCalculator);
  } else {
    document.attachEvent('onreadystatechange', function () {
      if ('loading' !== document.readyState) {
        initGiftAidCalculator();
      }
    });
  }

})();
