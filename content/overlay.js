'use strict';
(function() {

Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://services-sync/main.js");
Components.utils.import("resource://services-sync/service.js");

const ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
    .getService(Components.interfaces.nsISessionStore);
const BLANK_SRC = 'data:image/gif;base64,'
    + 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const $ = function(aId) { return document.getElementById(aId); };

let chromeWin = getChromeWin();

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

function getChromeWin() {
  return Components.classes["@mozilla.org/appshell/window-mediator;1"]
      .getService(Components.interfaces.nsIWindowMediator)
      .getMostRecentWindow('navigator:browser');
}

function loadRecent() {
  let undoItems;
  try {
    undoItems = JSON.parse(ss.getClosedTabData(chromeWin));
  } catch (e) {
    return;
  }
  if (!undoItems) return;
  $('newtabplus-wrapper').style.display = '-moz-box';
  $('newtabplus-section-recent').style.display = '-moz-box';


  let cont = document.getElementById('newtabplus-recently-closed-list');
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

function loadSync() {
  // TODO: Force first-launch log in/sync/refresh?
  let tabSyncEnabled = Weave.Service.isLoggedIn
      && Weave.Service.engineManager.get("tabs")
      && Weave.Service.engineManager.get("tabs").enabled;
  if (!tabSyncEnabled) return;

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
  let tabsArray = [];
  for (let i in tabs) tabsArray.push(tabs[i]);
  tabsArray.sort(function(a, b) { return b.lastUsed - a.lastUsed; });

  if (0 == tabsArray.length) return;
  $('newtabplus-wrapper').style.display = '-moz-box';
  $('newtabplus-section-sync').style.display = '-moz-box';

  let cont = document.getElementById('newtabplus-sync-list');
  let urlsSeen = {};
  let count = 0
  for (let i = 0; i < tabsArray.length; i++) {
    let tab = tabsArray[i];
    let url = url;
    if (url in urlsSeen) continue;
    urlsSeen[url] = 1;

    count += 1;
    if (10 == count) break;

    let li = addListItem(cont, tab.title || url, tab.icon);
    li.setAttribute('href', url);
    li.addEventListener('click', navSync, false);
  }
}

function navRecent(event) {
  chromeWin.undoCloseTab(parseInt(event.target.getAttribute('index'), 10));
  window.close();
}

function navSync(aEvent) {
  let url = aEvent.target.getAttribute('href');
  chromeWin.openLinkIn(
      url, 'tab', {'inBackground': false, 'relatedToCurrent': true});
  window.close();
}

window.addEventListener('DOMContentLoaded', (function() {
  loadRecent();
  loadSync();
}), false);

})();
