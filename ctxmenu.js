// initialize context menus
browser.contextMenus.create({
    id: "new-emote",
    title: "Add emote..",
    contexts: ["image", "link"],
    targetUrlPatterns: ["*://cdn.discordapp.com/*"]
});

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