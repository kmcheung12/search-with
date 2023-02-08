/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}


/*
Create all the context menu items.
*/
browser.menus.create({
  id: "audible",
  title: browser.i18n.getMessage("menuItemAudible"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "goodreads",
  title: browser.i18n.getMessage("menuItemGoodreads"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "hn",
  title: browser.i18n.getMessage("menuItemHockernews"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "google",
  title: browser.i18n.getMessage("menuItemGoogle"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "wiki",
  title: browser.i18n.getMessage("menuItemWiki"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "youtube",
  title: browser.i18n.getMessage("menuItemYoutube"),
  contexts: ["selection"]
}, onCreated);
browser.menus.create({
  id: "stackoverflow",
  title: browser.i18n.getMessage("menuItemStackoverflow"),
  contexts: ["selection"]
}, onCreated);

browser.menus.create({
  id: "github",
  title: browser.i18n.getMessage("menuItemGithub"),
  contexts: ["selection"]
}, onCreated);


browser.menus.create({
  id: "separator-2",
  type: "separator",
  contexts: ["all"]
}, onCreated);

const windowIdTabIdsMapping = new Map();
const knownTabIds = [];

function setCurrentTabId(windowId, tabId) {
    if (!windowIdTabIdsMapping.has(windowId)) {
        windowIdTabIdsMapping.set(windowId, []);
    }
    windowIdTabIdsMapping.get(windowId).unshift(tabId);
}


function initializeCurrentTabId() {
    const query = {
        active: true,
        currentWindow: true,
    };
    browser.tabs.query(query).then(
        ([tab]) => {
            if (!tab) {
                return;
            }
            setCurrentTabId(tab.windowId, tab.id);
        }
    );
}

function moveTab(newTab) {
    browser.windows.getCurrent({ populate: true })
        .then(
            (currentWindow) => {
                const tabIds = windowIdTabIdsMapping.get(currentWindow.id);
                // handle tab being activated before being "created"
                const currentTabId = tabIds[0] == newTab.id ? tabIds[1] : tabIds[0];
                return Promise.all([
                    currentWindow,
                    browser.tabs.get(currentTabId),
                ]);
            }
        )
        .then(
            ([currentWindow, currentTab]) => {
                browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
            }
        );
}
function forgetTab(tabId) {
    delete knownTabIds[tabId];
}

function handleTabActivated(activeInfo) {
    setCurrentTabId(activeInfo.windowId, activeInfo.tabId);
}
initializeCurrentTabId();

browser.tabs.onActivated.addListener(handleTabActivated);
browser.tabs.onCreated.addListener(moveTab);
browser.tabs.onRemoved.addListener(forgetTab);

function getNewIndex(currentWindow, currentTab) {
    if (!currentTab.pinned) {
        return currentTab.index + 1;
    }

    let lastPinnedTab = undefined;
    for (const tab of currentWindow.tabs) {
        if (tab.pinned) {
            lastPinnedTab = tab;
        } else {
            return lastPinnedTab.index + 1;
        }
    }
}
/*
The click event listener, where we perform the appropriate action given the
ID of the menu item that was clicked.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}
browser.menus.onClicked.addListener((info) => {
  let creating;
  switch (info.menuItemId) {
    case "audible":
      creating = browser.tabs.create({url: "https://duckduckgo.com/?q=!audible " + info.selectionText, openInReaderMode: false});
      creating.then(moveTab, onError)
    break;
    case "goodreads":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!goodreads " + info.selectionText, openInReaderMode: false});
    break;
    case "hn":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!hn " + info.selectionText, openInReaderMode: false});
    break;
    case "google":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!g " + info.selectionText, openInReaderMode: false});
    break;
    case "wiki":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!w " + info.selectionText, openInReaderMode: false});
    break;
    case "youtube":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!yt " + info.selectionText, openInReaderMode: false});
    break;
    case "stackoverflow":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!so " + info.selectionText, openInReaderMode: false});
    break;
    case "github":
      browser.tabs.create({url: "https://duckduckgo.com/?q=!gh " + info.selectionText, openInReaderMode: false});
    break;
  }
});
