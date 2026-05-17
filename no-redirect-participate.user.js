// ==UserScript==
// @name         Instant Gaming Auto Giveaway
// @description  A script that automatically click on participate buttons on Instant-Gaming.
// @version      1.4.6
// @author       enzomtp
// @namespace    https://github.com/enzomtpYT/InstantGamingGiveawayList
// @match        *://www.instant-gaming.com/*/giveaway/*
// @match        *://github.com/enzomtpYT/*
// @run-at       document-idle
// @grant        GM_registerMenuCommand
// @license      MIT
// @downloadURL https://github.com/enzomtpYT/InstantGaming-Giveaway-AutoParticipate/raw/refs/heads/main/no-redirect-participate.user.js
// @updateURL https://github.com/enzomtpYT/InstantGaming-Giveaway-AutoParticipate/raw/refs/heads/main/no-redirect-participate.user.js
// ==/UserScript==

(function() {
  "use strict";

  console.log("[IG-Auto] Script charge, execution du corps principal");

  function openInNewTab(url) {
       window.open(url, '_blank');
  }

  function participate(){
    console.log("[IG-Auto] participate() appelee");
    // Get the participate button element.
    const participate = document.querySelector("button.button.validate");
    // Click on participate if it exists.
    if (participate !== null) {
      participate.click();
      console.log("[IG-Auto] bouton trouve et clique");
    } else {
      console.log("[IG-Auto] bouton ABSENT");
    }
    waitForSocialRewardsThenClick();
  }

  function waitForSocialRewardsThenClick(){
    const socialRewardSelector = "a.button.reward";
    const maxWaitDurationMs = 10000;

    // Cas 1 : les liens sociaux sont deja dans le DOM au moment de l'appel.
    if (document.querySelectorAll(socialRewardSelector).length > 0) {
      console.log("[IG-Auto] liens sociaux deja presents, clic immediat");
      socials();
      return;
    }

    // Cas 2 : les liens ne sont pas encore la, on attend leur apparition.
    let safetyTimeoutId = null;

    const domObserver = new MutationObserver(() => {
      const socialRewardLinks = document.querySelectorAll(socialRewardSelector);
      if (socialRewardLinks.length > 0) {
        console.log("[IG-Auto] liens sociaux detectes par l'observer :", socialRewardLinks.length);
        domObserver.disconnect();
        clearTimeout(safetyTimeoutId);
        socials();
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Filet de securite : si aucun lien n'apparait, on arrete d'observer.
    safetyTimeoutId = setTimeout(() => {
      domObserver.disconnect();
      console.log("[IG-Auto] timeout de securite atteint, aucun lien social detecte");
    }, maxWaitDurationMs);
  }

  function socials(){
    const socialRewardLinks = document.querySelectorAll("a.button.reward");
    console.log("[IG-Auto] socials() appelee, liens trouves :", socialRewardLinks.length);
    // Click on each socials
    socialRewardLinks.forEach((e) => e.click())
  }

  function giveawayList(){
    // Open giveaway links from the new README layout, with fallback to legacy selectors.
    getGiveawayLinks().forEach((a) => a.click())
  }

  function openall(){
      getGiveawayLinks().forEach((a) => { openInNewTab(a.href); })
  }

  function getGiveawayLinks() {
    const activeSummary = Array.from(document.querySelectorAll("details > summary")).find((summary) =>
      summary.textContent.toLowerCase().includes("active giveaway links")
    );

    if (activeSummary) {
      return activeSummary.parentElement.querySelectorAll('a[href*="/giveaway/"]');
    }

    const activeSectionLinks = document.querySelectorAll('#user-content-active-giveaways ~ details a[href*="/giveaway/"]');
    if (activeSectionLinks.length > 0) {
      return activeSectionLinks;
    }

    return document.querySelectorAll('#user-content-giveaways ~ p a, #user-content-giveaways>a, a.giveaway');
  }

  // Register the menu command
  GM_registerMenuCommand("Participate", participate);
  GM_registerMenuCommand("Socials", socials);
  GM_registerMenuCommand("Giveaway List", giveawayList);
  GM_registerMenuCommand("Open ALL Links", openall);
  participate();

})();