'use strict';
(function() {

Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
Components.utils.import("resource://services-sync/main.js");
Components.utils.import("resource://services-sync/service.js");

const ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
    .getService(Components.interfaces.nsISessionStore);

const BLANK_SRC = 'data:image/gif;base64,'
    + 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// Find the chrome window that contains this "content" window.
const chromeWin = window
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIWebNavigation)
    .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
    .rootTreeItem
    .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
    .getInterface(Components.interfaces.nsIDOMWindow);

function addListItem(aList, aTitle, aIcon) {
  let li = document.createElement('li');

  let img = document.createElement('image');
  img.setAttribute('src', BLANK_SRC);
  if (aIcon) {
    let iconUrl = aIcon;
    if (/^https?:/.test(iconUrl)) iconUrl = 'moz-anno:favicon:' + iconUrl;
    img.setAttribute('src', iconUrl);
  }
  li.appendChild(img);

  li.appendChild(document.createTextNode(aTitle));
  aList.appendChild(li);

  return li;
}

function loadRecent() {
  let cont = document.getElementById('newtabplus-recently-closed-list');
  let undoItems = JSON.parse(ss.getClosedTabData(chromeWin));
  let seenUrls = {};
  for (let i = 0; i < undoItems.length; i++) {
    let undoItem = undoItems[i];
    let url = undoItem.state.entries[0].url;
    if ('about:newtab' == url) continue;
    if (url in seenUrls) continue;
    seenUrls[url] = 1;

    let li = addListItem(cont, undoItem.title, undoItem.image);
    li.setAttribute('index', i);
    li.addEventListener('click', navRecent, false);
  }
}

function navRecent(event) {
  chromeWin.undoCloseTab(parseInt(event.target.getAttribute('index'), 10));
  window.close();
}

function loadSync() {
  let tabsEngine = Weave.Service.engineManager.get("tabs");
  let tabs = {};
  for each (let client in tabsEngine.getAllClients()) {
    client.tabs.forEach(function(tab) {
      let url = tab.urlHistory[0];
      if (!(url in tabs) || tab.lastUsed > tabs[url].lastUsed) {
        tabs[url] = tab;
      }
    });
  }

  let cont = document.getElementById('newtabplus-sync-list');
  let tabsArray = [];
  for (let i in tabs) tabsArray.push(tabs[i]);
  tabsArray.sort(function(a, b) { return b.lastUsed - a.lastUsed; });
  for (let i = 0; i < tabsArray.length; i++) {
    if (10 == i) break;
    let tab = tabsArray[i];
    let li = addListItem(cont, tab.title, tab.icon);
    li.setAttribute('href', tab.urlHistory[0]);
    li.addEventListener('click', navSync, false);
  }
}

function navSync(aEvent) {
  let url = aEvent.target.getAttribute('href');
  chromeWin.openLinkIn(
      url, 'tab', {'inBackground': false, 'relatedToCurrent': true});
  window.close();
}

window.addEventListener('DOMContentLoaded', (function() {
  if (PrivateBrowsingUtils.isWindowPrivate(window)
      || ss.getClosedTabCount(chromeWin) == 0
  ) {
    document.getElementById('newtabplus-wrapper').style.display = 'none';
    return;
  }

  loadRecent();

  // TODO: Force first-launch log in/sync/refresh?
  let tabSyncEnabled = Weave.Service.isLoggedIn
      && Weave.Service.engineManager.get("tabs")
      && Weave.Service.engineManager.get("tabs").enabled;
  if (tabSyncEnabled) {
    loadSync();
  } else {
    document.getElementById('newtabplus-section-sync').style.display = 'none';
  }

}), false);

})();
