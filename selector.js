document.addEventListener("DOMContentLoaded", function(event) {
    document.getElementById("emote-search").oninput = updateSearchSchedule;
    document.getElementById("emote-delete").onclick = deleteEmote;
    document.getElementById("emote-delete").ondblclick = clearEmotes;
    document.getElementById("emote-overwrite").onclick = overwriteEmote;
    browser.storage.local.get().then(res => {
        update(res.emotes);
    });
    
    document.addEventListener("keydown", function(e) {
        if (e.key == "Escape") {
            window.close();
        }
    });

    document.getElementById("emote-search").focus();
});


function emotesearch() {
    let search = document.getElementById("emote-search").value;
    if (!search) {
        browser.storage.local.get().then(res => {
            update(res.emotes);
        });
        return false;
    }
    browser.storage.local.get().then(res => {
        let searchinstance = new Fuse(res.emotes, {keys: ["name"]});
        let result = searchinstance.search(search);
        for (let i in result) {
            result[i] = result[i].item;
        };
        update(result);
    });
};


function update(emotes) {
    /*
     * updates the selector emote list, given a list of emotes
     */
    let emotelist = document.getElementById("emote-list");
    emotelist.innerHTML = "";
    for (let value of Object.values(emotes)) {
        let emote = document.createElement("img");
        emote.src = value.url;
        emote.alt = value.name;
        emote.title = value.name;
        emote.id = value.id;
        emote.classList.add("emote");
        emote.tabIndex = 0;
        emote.onclick = function() {selectEmote(value.id); previewEmote()};
        emote.ondblclick = function() {navigator.clipboard.writeText(value.url); recentEmote(value.id); window.close();};
        emotelist.appendChild(emote);
    };
};


function selectEmote(emoteId) {
    let emotes = document.getElementsByClassName("emote");
    for (let i in emotes) {
        if (typeof emotes[i] == "object") {
            emotes[i].classList.remove("selected");
        }
    };

    document.getElementById(emoteId).classList.add("selected");
};


function deleteEmote() {
    let selected = document.getElementsByClassName("selected");
    if (selected.length == 0) {
        return;
    }
    let emoteId = selected[0].id;
    browser.storage.local.get().then(res => {
        res.emotes.splice(emoteId, 1);
        browser.storage.local.set({emotes: res.emotes}).then(() => {

            // re-order emote ids
            browser.storage.local.get().then(res => {
                let emotes = res.emotes;
                for (let i in emotes) {
                    emotes[i].id = i;
                }
                browser.storage.local.set({emotes: emotes}).then(() => {
                    browser.storage.local.get().then(res => {update(res.emotes)});
                });
            });
        });
    });
};


function previewEmote() {
    let selected = document.getElementsByClassName("selected");
    if (selected.length == 0) {
        return;
    };
    let emoteId = selected[0].id;
    browser.storage.local.get().then(res => {
        let emote = res.emotes[emoteId];
        document.getElementById("emote-preview").style = "background-image: url("+ emote.url +"); background-repeat: no-repeat; background-position: center; width: 48px; height: 48px;"
        document.getElementById("emote-pr-name").value = emote.name;
        document.getElementById("emote-pr-url").value = emote.url;
    });
};


function overwriteEmote() {
    let selected = document.getElementsByClassName("selected");
    if (selected.length == 0) {
        return;
    };
    let emoteId = selected[0].id;
    let name = escapeHTML(document.getElementById("emote-pr-name").value);
    let url = escapeHTML(document.getElementById("emote-pr-url").value);
    browser.storage.local.get().then(res => {
        res.emotes[emoteId].name = name;
        res.emotes[emoteId].url = url;
        browser.storage.local.set({emotes: res.emotes}).then(() => {
            update(res.emotes);
        });
    });
};


function recentEmote(id) {
    browser.storage.local.get().then(res => {
        res.emotes[id].count += 1;
        browser.storage.local.set({emotes: res.emotes});
    });
};


function clearEmotes() {
    if (window.confirm("Are you sure you want to clear all emotes?")) {
        browser.storage.local.set({emotes: []}).then(() => {
            browser.storage.local.get().then(res => {update(res.emotes)});
        });
    };
};


let updateSearchTask = null;
function updateSearchSchedule(){
    if (updateSearchTask != null) {
        clearTimeout(updateSearchTask);
    }
    
    updateSearchTask = setTimeout(function(){
        updateSearchTask = null;
        emotesearch();
    }, 500);
}


// https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
function escapeHTML(str) {
    // Note: string cast using String; may throw if `str` is non-serializable, e.g. a Symbol.
    // Most often this is not the case though.
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}