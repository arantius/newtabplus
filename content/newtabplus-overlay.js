window.addEventListener('DOMContentLoaded', (function() {
  Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
  let ss = Components.classes["@mozilla.org/browser/sessionstore;1"]
      .getService(Components.interfaces.nsISessionStore);

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
    document.getElementById('newtab-recently-closed').style.display = 'none';
    return;
  }

  function nav(event) {
    chromeWin.undoCloseTab(parseInt(event.target.getAttribute('index'), 10));
    window.close();
  }

  let cont = document.getElementById('newtab-recently-closed-list');
  let undoItems = JSON.parse(ss.getClosedTabData(chromeWin));
  for (let i = 0; i < undoItems.length; i++) {
    let undoItem = undoItems[i];
    let li = document.createElement('li');
    li.textContent = undoItem.title;
    li.setAttribute('index', i);
    li.addEventListener('click', nav, false);

    if (undoItem.image) {
      let img = document.createElement('img');
      let iconUrl = undoItem.image;
      if (/^https?:/.test(iconUrl)) iconUrl = 'moz-anno:favicon:' + iconUrl;
      img.setAttribute('src', iconUrl);
      img.setAttribute('width', '16');
      img.setAttribute('height', '16');
      li.appendChild(img);
    }

    cont.appendChild(li);
  }
}), false);
