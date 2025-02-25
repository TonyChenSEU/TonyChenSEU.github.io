var BROWSER = {
  OPERA: 'OPERA',
  FIREFOX: 'FIREFOX',
  SAFARI: 'SAFARI',
  CHROME: 'CHROME',
  IE: 'IE',
  EDGE: 'EDGE',
  UNKNOWN: 'UNKNOWN',
};

var getBrowser = function () {
  // Opera 8.0+
  var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === '[object SafariRemoteNotification]';
    })(!window['safari'] || safari.pushNotification);

  var isIosSafari = /Safari/i.test(navigator.userAgent) && /iP(hone|od|ad)/i.test(navigator.userAgent);

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/ false || !!document.documentMode;

  // Edge 20+
  var isEdge = !isIE && /Edg/i.test(navigator.userAgent);

  // Chrome 1+
  var isChrome = /Google Inc/.test(navigator.vendor);

  var isChromeMobileAndroid = /Chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);

  return isOpera
    ? BROWSER.OPERA
    : isFirefox
    ? BROWSER.FIREFOX
    : isSafari
    ? BROWSER.SAFARI
    : isIE
    ? BROWSER.IE
    : isEdge
    ? BROWSER.EDGE
    : isIosSafari
    ? BROWSER.SAFARI
    : isChrome || isChromeMobileAndroid
    ? BROWSER.CHROME
    : BROWSER.UNKNOWN;
};
