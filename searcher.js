// track active element
var embeddedemotesActive;

document.addEventListener("contextmenu", e => {
    if (e.ctrlKey) {
        e.stopPropagation();
    };
}, true);

document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key == ";") {
        if (embeddedemotesActive) {return ;}
        embeddedemotesActive = document.activeElement;
        createSearch(document.activeElement.parentElement.parentElement.getBoundingClientRect());
    }
    if (!embeddedemotesActive) {
        return ;
    }
    if (e.key == "Escape") {
        removeSearch();
    }
    if (e.key == "ArrowDown") {
        e.preventDefault();
        setSelection("down", document.getElementById("embeddedemotes-search-result"));
    }
    else if (e.key == "ArrowUp") {
        e.preventDefault();
        setSelection("up", document.getElementById("embeddedemotes-search-result"));
    }
    else if (e.key == "Enter" || e.key == "Tab") {
        let selected = document.getElementsByClassName("embeddedemotes-selected")[0].id;
        browser.storage.local.get().then(res => {
            navigator.clipboard.writeText(res.emotes[selected].url);
            updateEmoteCount(selected);
            removeSearch();
        });
    }
});

function createSearch(inputrect) {
    console.log(inputrect);
    let searchContainer = document.createElement("div");
    searchContainer.id = "embeddedemotes-search-container";
    searchContainer.style = "position: fixed; display: flex; flex-direction: column-reverse; background-color: rgb(47, 49, 54); border-radius: 5px; z-index: 9999;";
    searchContainer.style.width = inputrect.width + "px";
    searchContainer.style.left = inputrect.left + "px";

    let resultContainer = document.createElement("div");
    resultContainer.id = "embeddedemotes-search-result";
    resultContainer.style.width = "100%";

    let searchInput = document.createElement("input");
    searchInput.id = "embeddedemotes-search-input";
    searchInput.placeholder = "Search for emotes...";
    searchInput.style = "box-sizing: border-box; width: 100%; padding: 10px; margin: 0; border: none; border-radius: 5px; font-size: 16px; background-color: rgb(64, 68, 75); color: rgb(215, 215, 215);";
    searchInput.oninput = function() {
        populateSearchResult(searchInput.value, resultContainer).then(() => {
            searchContainer.style.top = inputrect.top - searchContainer.getBoundingClientRect().height - 5 + "px";
        });
    };
    searchInput.onblur = function() {removeSearch();};

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(resultContainer);
    document.body.appendChild(searchContainer);

    populateSearchResult("", resultContainer).then(() => {
        searchContainer.style.top = inputrect.top - searchContainer.getBoundingClientRect().height - 5 + "px";
    });
    searchInput.focus();
}

function populateSearchResult(query, reselem) {
    return browser.storage.local.get().then(res => {
        let result;

        if (!query) {
            // Populate with 5 most used emotes
            res.emotes.sort(function(a, b) {return b.count - a.count}).splice(5);
            result = res.emotes;
        } else {
            let searchinstance = new Fuse(res.emotes, {keys: ["name"]});
            result = searchinstance.search(query);
            result.splice(10);

            for (let i in result) {
                result[i] = result[i].item;
            };
        };

        reselem.innerHTML = "";
        for (let emote in result) {
            emoteResult = document.createElement("div");
            emoteResult.classList.add("embeddedemotes-emote");
            emoteResult.id = result[emote].id;
            if (emote == 0) {emoteResult.classList.add("embeddedemotes-selected");};
            emoteResult.onmousedown = function() {navigator.clipboard.writeText(result[emote].url); updateEmoteCount(result[emote].id); removeSearch();};

            let emoteImg = document.createElement("img");
            emoteImg.style = "width: 24px; height: 24px; padding-right: 5px;";
            emoteImg.src = result[emote].url;

            let emoteName = document.createElement("span");
            emoteName.style = "font-size: 16px; color: rgb(255, 255, 255);";
            emoteName.textContent = result[emote].name;

            emoteResult.appendChild(emoteImg);
            emoteResult.appendChild(emoteName);
            reselem.appendChild(emoteResult);
        }
        reselem.append(...Array.from(reselem.childNodes).reverse());
    });
}

function setSelection(direction, parentElem) {
    /*
     * Arrow key navigation for search results
     */
    let selected = document.getElementsByClassName("embeddedemotes-selected")[0];
    selected.classList.remove("embeddedemotes-selected");
    if (direction == "up") {
        if (selected.previousSibling) {
            selected.previousSibling.classList.add("embeddedemotes-selected");
        }
        else {
            parentElem.lastChild.classList.add("embeddedemotes-selected");
        }
    }
    else if (direction == "down") {
        if (selected.nextSibling) {
            selected.nextSibling.classList.add("embeddedemotes-selected");
        }
        else {
            parentElem.firstChild.classList.add("embeddedemotes-selected");
        }
    }
}

function removeSearch() {
    /*
     * Remove the search container and return focus to the input field (last element)
     */
    document.body.removeChild(document.getElementById("embeddedemotes-search-container"));
    embeddedemotesActive.focus();
    embeddedemotesActive = undefined;
}

function updateEmoteCount(emoteid) {
    /*
     * Update count used for most used emotes
     */
    browser.storage.local.get().then(res => {
        res.emotes[emoteid].count++;
        browser.storage.local.set({emotes: res.emotes});
    });
}