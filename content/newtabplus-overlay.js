'use strict';

window.addEventListener('DOMContentLoaded', (function() {
  Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
  let ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
      .getService(Components.interfaces.nsISessionStore);


  let BLANK_SRC = 'data:image/gif;base64,'
      + 'R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  let chromeWin = window
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIWebNavigation)
      .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIDOMWindow);

  if (PrivateBrowsingUtils.isWindowPrivate(window)
      || ss.getClosedTabCount(chromeWin) == 0
  ) {
    document.getElementById('newtabplus-recently-closed').style.display = 'none';
    return;
  }

  function nav(event) {
    chromeWin.undoCloseTab(parseInt(event.target.getAttribute('index'), 10));
    window.close();
  }

  let cont = document.getElementById('newtabplus-recently-closed-list');
  let undoItems = JSON.parse(ss.getClosedTabData(chromeWin));
  for (let i = 0; i < undoItems.length; i++) {
    let undoItem = undoItems[i];
    let li = document.createElement('li');
    li.setAttribute('index', i);
    li.addEventListener('click', nav, false);

    let img = document.createElement('image');
    img.setAttribute('src', BLANK_SRC);
    if (undoItem.image) {
      let iconUrl = undoItem.image;
      if (/^https?:/.test(iconUrl)) iconUrl = 'moz-anno:favicon:' + iconUrl;
      img.setAttribute('src', iconUrl);
    }
    li.appendChild(img);

    li.appendChild(document.createTextNode(undoItem.title));
    cont.appendChild(li);
  }
}), false);
