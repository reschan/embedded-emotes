// FUTURE IDEA: INJECT SELECTOR DIRECTLY INTO DISCORD EMOTE SELECTOR.

// initialize context menus
browser.contextMenus.create({
    id: "new-emote",
    title: "Add emote..",
    documentUrlPatterns: ["*://*.discord.com/*"],
});

// initialize emote storage, if it does not exist
browser.storage.local.get().then(res => {
    if (!res.emotes) {
        browser.storage.local.set({emotes: []});
    };
});

browser.contextMenus.onClicked.addListener(function(info, tab){
    if (info.menuItemId == "new-emote") {
        let emotedata = getEmoteData(info, tab);
        emotedata.then(res => {
            if (!res[0] || !res[0][0].includes("cdn.discordapp.com")) {
                return;
            };

            let data = {name: res[0][1], url: parseEmoteUrl(res[0][0]), count: 0};
            browser.storage.local.get().then(res => {
                let emotes = res.emotes;
                emotes.push(data);
                browser.storage.local.set({emotes: emotes}).then(() => {
                    // reassigns emote ids
                    browser.storage.local.get().then(res => {
                        let emotes = res.emotes;
                        for (let i in emotes) {
                            emotes[i].id = i;
                        };
                        browser.storage.local.set({emotes: emotes});
                    });
                });
            });
        });
    };
});

function parseEmoteUrl(url) {
    // sample: https://images-ext-1.discordapp.net/external/4Ffyh1-msFOxj_6OuVMBU_PjoTzy6KjWhMIUfX-xof0/%3Fsize%3D48/https/cdn.discordapp.com/emojis/720638944357646436.png
    if (url.includes("/https/")) {
        url = "https://" + url.split("/https/")[1];
    };

    return url.split("?")[0] + "?size=48";
}

function getEmoteData(info, tab) {
    let emotedata;
    if (!info.srcUrl) {
        emotedata = browser.tabs.executeScript(tab.id, {
            code: `if (browser.menus.getTargetElement(${info.targetElementId}).tagName == "BUTTON") {[browser.menus.getTargetElement(${info.targetElementId}).children[0].src, browser.menus.getTargetElement(${info.targetElementId}).children[0].alt]} else {false};`,
        });
    } else {
        emotedata = browser.tabs.executeScript(tab.id, {
            code: `[browser.menus.getTargetElement(${info.targetElementId}).src, browser.menus.getTargetElement(${info.targetElementId}).alt];`,
        });
    }
    return emotedata;
}