// initialize context menus
browser.contextMenus.create({
    id: "new-emote",
    title: "Add emote..",
    contexts: ["image", "link"],
    targetUrlPatterns: ["*://cdn.discordapp.com/*"]
});

browser.contextMenus.create({
    id: "all-emote",
    title: "All emote",
    contexts: ["editable"],
    documentUrlPatterns: ["*://*.discord.com/*"]
});

browser.contextMenus.create({
    id: "separator-1",
    type: "separator",
    contexts: ["editable"],
    documentUrlPatterns: ["*://*.discord.com/*"]
});

for (i = 0; i < 5; i++) {
    browser.contextMenus.create({
        id: "most-used-" + i,
        title: "",
        contexts: ["editable"],
        documentUrlPatterns: ["*://*.discord.com/*"]
    })
};

// initialize emote storage, if it does not exist
browser.storage.local.get().then(res => {
    if (!res.emotes) {
        browser.storage.local.set({emotes: []});
    };
});

browser.contextMenus.onClicked.addListener(function(info, tab){
    if (info.menuItemId == "new-emote") {
        if (!info.srcUrl.includes("cdn.discordapp.com")) {
            return false;
        };  

        // Assign image alt text as the emote name
        browser.tabs.executeScript(tab.id, {
            code: `browser.menus.getTargetElement(${info.targetElementId}).alt;`,
        }).then(res => { 
            let alt = res[0];
            let data = {name: alt, url: parseEmoteUrl(info.srcUrl), count: 0};
            browser.storage.local.get().then(res => {
                let emotes = res.emotes;
                emotes.push(data);
                browser.storage.local.set({emotes: emotes}).then(() => {
                    // reassigns emote ids
                    browser.storage.local.get().then(res => {
                        let emotes = res.emotes;
                        for (let i in emotes) {
                            emotes[i].id = i;
                        }
                        browser.storage.local.set({emotes: emotes});
                    });
                });
            });
        });
    };

    if (info.menuItemId == "all-emote") {
        browser.windows.create({
            url: "selector.html",
            width: 272,
            height: 300,
            top: 1,
            type: "popup",
        });
    };
});

browser.contextMenus.onShown.addListener(function(info, tab) {    
    if (!tab.url.match(/(https?:\/\/)?discord\.com\//)) {return false};

    browser.storage.local.get().then(res => {
        let emotes = res.emotes;
        emotes.sort(function(a, b) {return b.count - a.count}).splice(5);
        for (i=0; i < 5; i++) {
            if (!emotes[i]) {
                browser.contextMenus.update(
                    "most-used-" + i,
                    {
                        title: "",
                        "icons": undefined,
                    }
                );
            }
            else {
                browser.contextMenus.update(
                    "most-used-" + i,
                    {
                        title: emotes[i].name,
                        "icons": {
                            "48": emotes[i].url,
                            "96": emotes[i].url
                        },
                        onclick: function(info, tab) {
                            id = info.menuItemId.split("-")[2];
                            navigator.clipboard.writeText(emotes[id].url);
                            browser.storage.local.get().then(res => {
                                res.emotes[emotes[id].id].count += 1;
                                browser.storage.local.set({emotes: res.emotes});
                            });
                        }
                    }
                );
            }
        };
    }).then(() => {browser.contextMenus.refresh()});
});

function parseEmoteUrl(url) {
    // sample: https://images-ext-1.discordapp.net/external/4Ffyh1-msFOxj_6OuVMBU_PjoTzy6KjWhMIUfX-xof0/%3Fsize%3D48/https/cdn.discordapp.com/emojis/720638944357646436.png
    if (url.includes("/https/")) {
        url = "https://" + url.split("/https/")[1];
    };

    return url.split("?")[0] + "?size=48";
}