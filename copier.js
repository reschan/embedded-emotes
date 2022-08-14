document.addEventListener("mousedown", (e) => {
    if (e.target.getAttribute('data-type') != "emoji" || e.ctrlKey == false) {return;}
    let targetElement = e.target;
    let imgSrc = "";


    if (targetElement.tagName == "BUTTON") {
        imgSrc = targetElement.children[0].src;
    } else {
        imgSrc = targetElement.src
    }

    navigator.clipboard.writeText(parseEmoteUrl(imgSrc));

    document.body.appendChild(copySuccess(e.clientX, e.clientY));

});

function parseEmoteUrl(url) {
    // sample: https://images-ext-1.discordapp.net/external/4Ffyh1-msFOxj_6OuVMBU_PjoTzy6KjWhMIUfX-xof0/%3Fsize%3D48/https/cdn.discordapp.com/emojis/720638944357646436.png
    if (url.includes("/https/")) {
        url = "https://" + url.split("/https/")[1];
    };

    return url.split("?")[0] + "?size=48";
}

function copySuccess(elmPosX, elmPosY) {
    let rtnelem = document.createElement("p");

    rtnelem.style.borderRadius = "10px"
    rtnelem.style.padding = "2px"
    rtnelem.style.backgroundColor = "rgb(50, 53, 59)";
    rtnelem.style.color = "white";
    rtnelem.style.position = "absolute";
    rtnelem.style.top = elmPosY + "px";
    rtnelem.style.left = elmPosX + "px";
    rtnelem.style.zIndex = "9999";

    rtnelem.textContent = "Successfully copied";
    setTimeout(() => {
        rtnelem.remove();
    }, 1000);
    return rtnelem;
};