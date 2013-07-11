'use strict';

const EXPORTED_SYMBOLS = ['getSyncTabs'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

var worker = new ChromeWorker('chrome://newtabplus/content/worker.js');

let tabsCallback = function() {};

function getSyncTabs(aCallback) {
  tabsCallback = aCallback;
  worker.postMessage('get tabs');
}

worker.onmessage = function(aEvent) {
  if (aEvent == 'tabs list') {
  }
}
