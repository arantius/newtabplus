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

  let undoItems = JSON.parse(ss.getClosedTabData(chromeWin));
  for (let i = 0; i < undoItems.length; i++) {
  }
}), false);
