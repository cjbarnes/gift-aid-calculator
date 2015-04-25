/**
 * All JavaScript for the Gift Aid calculator
 * {@link https://github.com/cjbarnes/gift-aid-calculator}.
 * @author cJ barnes mail@cjbarnes.co.uk
 * @version 1.0.0
 * @license MIT
 */
(function giftAidCalculator() {
  'use strict';

  /**
   * Convert monetary values (in pence) into properly formatted pounds-and-pence
   * strings, ready for outputting to the user.
   * @param {Number} pence Amount to output, in pence. Anything after the
   *                       decimal point will be discarded.
   * @return {String} Formatted value (e.g. if pence == 173, return '1.73').
   */
  function outputAmount(pence) {
    pence = parseInt(pence, 10) || 0;
    return ((pence / 100).toFixed(2));
  }

  /**
   * Converts a tax rate percentage in (almost) any format and returns it as a
   * simple whole number.
   * @param {Number} taxRate The tax rate to convert.
   * @return {Number|NaN} A valid tax rate number, or NaN on failure.
   */
  function parseTaxRate(taxRate) {
    /*
     * If the taxRate is less than 1, assume it's a US-style percentage (i.e. 0.5 = 50%) and multiply by 100.
     */
    if (('number' === typeof taxRate) && (0 < taxRate) && (1 > taxRate)) {
      taxRate = taxRate * 100;
    }

    /*
     * Fallback to the basicRate if the taxRate is invalid (i.e. not a
     * number or > 100%).
     *
     * Note: (taxRate == taxRate) is a test for !NaN, since parseInt() returns
     * NaN when it fails to find an integer.
     */
    taxRate = parseInt(taxRate, 10);
    if ((taxRate == taxRate) && (taxRate > 100)) {
      taxRate = NaN;
    }

    return taxRate;
  }

  /**
   * Calculate the amounts claimable and total amounts for a gift at the
   * specified tax rate.
   * @param {Number} initialGift The gross value of the gift in pounds.
   * @param {Number} taxRate     The tax band of the giver (as a percentage).
   * @return {Object} Both initial and calculated values for this gift.
   */
  function calculateGiftAid(initialGift, taxRate) {
    /*
     * The standard tax rate. Any tax above this threshold that is paid on the
     * gift is claimed back by the giver, not the charity.
     */
    var _basicRate = 20;

    // Other variables used in the calculation.
    var charityClaimTaxRate,
        charityClaimAmount,
        netGiftGiven,
        netGiftReceived,
        giverClaimAmount = 0;

    // Validate and prepare the given taxRate. Fallback to basicRate if NaN.
    taxRate = parseTaxRate(taxRate) || _basicRate;

    /*
     * Amount of tax the charity can claim back. Is always the basicRate unless
     * the giver's tax burden does not reach that threshold. (This is future-
     * proofing for the introduction of lower tax rates than the basic rate.)
     */
    charityClaimTaxRate = (taxRate < _basicRate) ? taxRate : _basicRate;

    /*
     * Convert gift amount into pence for easier (and more accurate) maths. Fall
     * back to 0 if NaN or less than 1p.
     */
    initialGift = parseInt((initialGift * 100), 10) || 0;

    // Calculate what the charity gets.
    charityClaimAmount = initialGift * charityClaimTaxRate / (100 - charityClaimTaxRate);
    netGiftReceived = initialGift + charityClaimAmount;

    /*
     * Calculate amount of tax the giver can claim back. Works out to the
     * difference between the total tax paid on the gift and the amount claimed
     * by the charity. Is always 0 unless this is a higher-rate tax payer.
     */
    if (charityClaimTaxRate < taxRate) {
      giverClaimAmount = (netGiftReceived * taxRate / 100) - charityClaimAmount;
    }
    netGiftGiven = initialGift - giverClaimAmount;

    // Return an object containing all the amounts involved in this gift.
    return {
      // Initial values passed into this function.
      grossGift:       outputAmount(initialGift),
      taxRate:         taxRate,
      // Calculated values.
      charityClaims:   outputAmount(charityClaimAmount),
      giverClaims:     outputAmount(giverClaimAmount),
      netGiftGiven:    outputAmount(netGiftGiven),
      netGiftReceived: outputAmount(netGiftReceived)
    };
  }

  /**
   * Perform a Gift Aid calculation and output results to the page.
   * @param {Element} calc The Gift Aid calculator parent element.
   */
  function updateGiftAidCalculator(calc) {
    // DOM element variables.
    var giftInput,
        taxRateInput,
        outputs;

    // Other variables.
    var gift,
        field,
        i,
        l,
        classRegex = /(^| )show-giver-claims( |$)/;

    // Check the element in `calc` is a Gift Aid calculator.
    if (!calc.className || !(/(^| )js-giftaid-calculator( |$)/.test(calc.className))) {
      return;
    }

    /*
     * Get the gift/tax amounts chosen by the user. If they don't exist, end
     * here.
     */
    giftInput = calc.querySelector('.js-input-gift');
    taxRateInput = calc.querySelector('.js-input-taxrate');
    if ((null !== giftInput) && (null !== taxRateInput)) {
      // Calculate for this gift.
      gift = calculateGiftAid(giftInput.value, taxRateInput.value);
    } else {
      return;
    }

    /*
     * Show/hide the Giver Claims part of the calculator in CSS, depending on
     * whether the giver can claim back tax on the gift.
     *
     * The class that toggles display of the Giver Claims part is:
     *
     *     `.show-giver-claims`
     *
     * and is applied to the main calculator element (`.js-giftaid-calculator`)
     *
     * To support IE8, **this must be done before we update the DOM**, because
     * IE8 doesn't support `element.textContent` and the equivalent
     * `element.innerText` doesn't update if the element is hidden by CSS (see
     * {@link http://developer.mozilla.org/en-US/docs/Web/API/Node-21.html}).
     */
    if (calc.classList) {
      if ('0.00' !== gift.giverClaims) {
        calc.classList.add('show-giver-claims');
      } else {
        calc.classList.remove('show-giver-claims');
      }
    } else {
      // Fallback for browsers that don't support classList.
      if (('0.00' !== gift.giverClaims) && !classRegex.test(calc.className)) {
        calc.className += ' show-giver-claims';
      } else if (('0.00' === gift.giverClaims) && classRegex.test(calc.className)) {
        calc.className = calc.className.replace(classRegex, ' ');
      }
    }

    /*
     * Update the output on the page. To register an element to be updated with
     * some data from the gift aid calculation, simply:
     *
     * 1. Put the element inside the same `.js-giftaid-calculator` element as
     *    the initialGift and taxRate fields used for the calculation.
     * 2. Give the element one of the 'js-' classes listed below.
     *
     * Note that the property names of this object exactly match the property
     * names of the gift object (returned by `calculateGiftAid()`), which makes
     * looping through these objects easier.
     */
    outputs = {
      grossGift      : calc.querySelectorAll('.js-output-gross-gift'),
      taxRate        : calc.querySelectorAll('.js-output-taxrate'),
      charityClaims  : calc.querySelectorAll('.js-output-charity-claims'),
      giverClaims    : calc.querySelectorAll('.js-output-giver-claims'),
      netGiftGiven   : calc.querySelectorAll('.js-output-net-gift-given'),
      netGiftReceived: calc.querySelectorAll('.js-output-net-gift-received')
    };

    // Loop through the list-of-NodeLists to update each node's contents.
    for (field in outputs) {
      /*
       * Loop through the individual DOM elements in this NodeList and change
       * their contents to = the matching gift-calculation value.
       */
      for (i = 0, l = outputs[field].length; i < l; i++) {
        // Equivalent of jQuery's `$(element).text('string')`.
        if (undefined !== outputs[field][i].textContent) {
          outputs[field][i].textContent = gift[field];
        } else {
          outputs[field][i].innerText = gift[field];
        }
      }
    }

  }

  /**
   * Wrap the update function in a closure, so it can be used in an event
   * listener without losing the reference to the current Gift Aid calculator.
   * @param {Element} calc The Gift Aid calculator parent element.
   * @return {Function} Event handler that calls `updateGiftAidCalculator()`.
   */
  function updateGiftAidDelegate(calc) {
    return function () {
      updateGiftAidCalculator(calc);
    };
  }

  /**
   * Hook into a DOM element event, abstracting around IE8's lack of support
   * for `addEventListener()`.
   * @param {Node}     target   The element that should listen for this event.
   * @param {String}   type     The name of the event type to listen for.
   * @param {Function} listener The function to call when this event occurs.
   */
  function addEventListener(target, type, listener) {
    if (target.addEventListener) {
      target.addEventListener(type, listener);
    } else {
      target.attachEvent('on' + type, function(e) {
        // Prepare the Event object to better match `addEventListener`.
        e.target = e.srcElement;
        e.currentTarget = target;
        e.preventDefault = function() {
          this.returnValue = false;
        };
        // Call the event listener with `this` and Event object set.
        listener.call(target, e);
      });
    }
  }

  /**
   * Quick event listener to prevent form submission (since we are handling all
   * form processing in JavaScript).
   * @this target
   * @param {Event} e Event object.
   */
  function cancelGiftAidFormSubmission(e) {
    e.preventDefault();
  }

  /**
   * On DOM ready, hook up the events that make the Gift Aid calculator work,
   * and set initial values and styling.
   */
  function initGiftAidCalculator() {
    var i,
        l,
        calc,
        giftInput,
        taxRateInput,
        calculators = document.querySelectorAll('.js-giftaid-calculator');

    // End here if there aren't any Gift Aid calculators on the page.
    if (!calculators.length) {
      return false;
    }

    /**
     * For each Gift Aid calculator on this page, replace the initial `.no-js`
     * class with `.js` to flag that JavaScript is on.
     */
    (function setJSFlag() {
      var re = /(^| )no-js( |$)/;
      for (i = 0, l = calculators.length; i < l; i++) {
        if (calculators[i].classList) {
          calculators[i].classList.add('js');
          calculators[i].classList.remove('no-js');
        } else {
          // Fallback for browsers that don't support classList.
          calculators[i].className = calculators[i].className.replace(re, ' js ');
        }
      }
    })();

    /*
     * Initialize events and first calculation for each Gift Aid calculator in
     * turn.
     */
    for (i = 0, l = calculators.length; i < l; i++) {
      calc = calculators[i];

      // Run the Gift Aid calculation for the first time, updating all fields.
      updateGiftAidCalculator(calc);

      // Prevent form submission.
      addEventListener(calc, 'submit', cancelGiftAidFormSubmission);

      /*
       * Attach recalculation-triggering events. Don't bother if this Gift Aid
       * calculator is missing one or both of its inputs.
       *
       * Note that we call the intermediary function `updateGiftAidDelegate()`
       * here to wrap the event listeners in a closure, so the current `calc`
       * element can be passed to `updateGiftAidCalculator()`. See this
       * StackOverflow answer: {@link http://stackoverflow.com/a/19586251}.
       */
      giftInput = calc.querySelector('.js-input-gift');
      taxRateInput = calc.querySelector('.js-input-taxrate');
      if ((null !== giftInput) && (null !== taxRateInput)) {
        addEventListener(giftInput, 'keyup', updateGiftAidDelegate(calc));
        addEventListener(giftInput, 'change', updateGiftAidDelegate(calc));
        addEventListener(taxRateInput, 'change', updateGiftAidDelegate(calc));
      }

    }

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
