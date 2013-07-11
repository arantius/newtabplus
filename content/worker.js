'use strict';

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://services-sync/main.js");
//Cu.import("resource:///modules/PlacesUIUtils.jsm");
//Cu.import("resource://gre/modules/Services.jsm");

let tabsEngine = Weave.Engines.get("tabs");
let tabs = [];

function getTabs() {
  let newTabs = [];
  let seenUrls = {};

  for each (let client in tabsEngine.getAllClients()) {
    /*
    client.tabs.forEach(function({title, urlHistory, icon}) {
      let url = urlHistory[0];
      if (tabsEngine.locallyOpenTabMatchesURL(url) || url in seenUrls) {
        return;
      }
      seenUrls[url] = 1;
    }
    */
    dump('sync ' + client.clientName ' ...\n');
  }
}

getTabs();
setInterval(getTabs, 1000 * 60 * 30);
