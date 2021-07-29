// ==UserScript==
// @name         IPPC.no Enhancements
// @namespace    https://limanovember.aero/
// @version      0.1
// @description  Try to make ippc.no a tiny bit better
// @author       thomfre
// @run-at       document-start
// @match        https://www.ippc.no/ippc/index.jsp
// @icon         https://limanovember.aero/images/icon.png
// @grant       GM_xmlhttpRequest
// ==/UserScript==

var _aisUrl;
var _aisUrlBase;

const parseAisFrontPage = (aisUrl, html) => {
  const links = /<a href="([0-9a-z\-\/\.]+)">/i.exec(html);
  const urlBase = aisUrl.slice(0, aisUrl.lastIndexOf("/"));

  _aisUrl = `${urlBase}/${links[1]}`;
  _aisUrlBase = _aisUrl.slice(0, _aisUrl.lastIndexOf("/"));

  addAipButtonToMenu();
};

const loadAisUrl = () => {
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://ais.avinor.no/no/AIP/",
    onload: (responseDetails) => {
      parseAisFrontPage(responseDetails.finalUrl, responseDetails.responseText);
    },
  });
};

const addAipButtonToMenu = () => {
  const menuItem = document.createElement("li");
  const link = document.createElement("a");

  link.href = _aisUrl;
  link.innerText = "Current AIP";
  link.target = "_blank";

  menuItem.appendChild(link);
  document.querySelector("#mainmenu ul").appendChild(menuItem);
};

const createAipButton = (icaoCode) => {
  const button = document.createElement("button");
  button.innerText = "Open AIP";
  button.style = "margin: 2px;";
  button.className = "submitbutton_gm";
  button.onclick = () => {
    window.open(
      `${_aisUrlBase}/eAIP/EN-AD-2.${icaoCode}-no-NO.html#AD-2.${icaoCode}`,
      "_blank"
    );
    return false;
  };

  return button;
};

const mutationHandler = (mutationRecords) => {
  for (let i = 0, len = mutationRecords.length; i < len; i++) {
    const added = mutationRecords[i].addedNodes;
    for (var j = 0, addedNode; (addedNode = added[j]); j++) {
      if (
        addedNode &&
        addedNode.classList &&
        addedNode.classList.contains("gm-style-iw-c")
      ) {
        const h2 = addedNode.querySelector("h2");
        if (addedNode.querySelector("h2")) {
          const titleText = h2.textContent;
          if (!titleText || titleText.trim() === "") return;

          const icaoSearch = /Information for (EN[A-Z][A-Z]) -/.exec(titleText);
          if (!icaoSearch || icaoSearch.length < 1) return;

          const button = createAipButton(icaoSearch[1]);

          const treeWalker = document.createTreeWalker(
            addedNode,
            NodeFilter.SHOW_ALL
          );

          let n;
          while ((n = treeWalker.nextNode())) {
            if (n && n.classList && n.classList.contains("ad-info-buttons")) {
              n.prepend(button);
            }
          }
        }
      }
    }
  }
};

const observeAndAct = () => {
  var MutationObserver = window.MutationObserver;
  var myObserver = new MutationObserver(mutationHandler);
  var obsConfig = {
    childList: true,
    attributes: true,
    subtree: true,
  };

  myObserver.observe(document, obsConfig);
};

(() => {
  "use strict";

  observeAndAct();

  loadAisUrl();
})();
