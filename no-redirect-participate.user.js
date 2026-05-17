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

  // Central configuration: edit these values to tune selectors and timing.
  const scriptConfig = {
    participateButtonSelector: "button.button.validate",
    socialRewardSelector: "a.button.reward",
    socialRewardsWaitTimeoutMs: 10000,
    beforeParticipateClickDelayMs: { min: 1500, max: 5000 },
    betweenSocialClicksDelayMs: { min: 300, max: 1700 },
  };

  console.log("[IG-Auto] Script loaded, running main body");

  function isGiveawayPage() {
    // True only on an Instant Gaming giveaway page (not on the GitHub list page).
    return window.location.hostname === "www.instant-gaming.com"
      && window.location.pathname.includes("/giveaway/");
  }

  function delay(durationMs) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  function getRandomDelayBiasedShort(range) {
    // Squaring biases the uniform [0, 1[ distribution toward 0: shorter delays become more frequent.
    const biasedFraction = Math.random() ** 2;
    return range.min + biasedFraction * (range.max - range.min);
  }

  function getRandomDelayUniform(range) {
    return range.min + Math.random() * (range.max - range.min);
  }

  function shuffleArray(sourceArray) {
    // Fisher-Yates shuffle on a copy (the source array is left untouched).
    const shuffled = [...sourceArray];
    for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex--) {
      const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
      [shuffled[currentIndex], shuffled[randomIndex]] =
        [shuffled[randomIndex], shuffled[currentIndex]];
    }
    return shuffled;
  }

  function openInNewTab(url) {
       window.open(url, '_blank');
  }

  async function participate(){
    console.log("[IG-Auto] participate() called");

    const beforeClickDelayMs = getRandomDelayUniform(scriptConfig.beforeParticipateClickDelayMs);
    console.log("[IG-Auto] waiting before participate click:", Math.round(beforeClickDelayMs), "ms");
    await delay(beforeClickDelayMs);

    // Get the participate button element.
    const participateButton = document.querySelector(scriptConfig.participateButtonSelector);
    // Click on participate if it exists.
    if (participateButton !== null) {
      participateButton.click();
      console.log("[IG-Auto] participate button found and clicked");
    } else {
      console.log("[IG-Auto] participate button NOT FOUND");
    }
    waitForSocialRewardsThenClick();
  }

  function waitForSocialRewardsThenClick(){
    // Case 1: social links are already in the DOM.
    if (document.querySelectorAll(scriptConfig.socialRewardSelector).length > 0) {
      console.log("[IG-Auto] social links already present, clicking now");
      socials();
      return;
    }

    // Case 2: links not present yet, wait for them to appear.
    let safetyTimeoutId = null;

    const domObserver = new MutationObserver(() => {
      const socialRewardLinks = document.querySelectorAll(scriptConfig.socialRewardSelector);
      if (socialRewardLinks.length > 0) {
        console.log("[IG-Auto] social links detected by observer:", socialRewardLinks.length);
        domObserver.disconnect();
        clearTimeout(safetyTimeoutId);
        socials();
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Safety net: stop observing if no link ever appears.
    safetyTimeoutId = setTimeout(() => {
      domObserver.disconnect();
      console.log("[IG-Auto] safety timeout reached, no social link detected");
    }, scriptConfig.socialRewardsWaitTimeoutMs);
  }

  async function socials(){
    const socialRewardLinks = document.querySelectorAll(scriptConfig.socialRewardSelector);
    console.log("[IG-Auto] socials() called, links found:", socialRewardLinks.length);

    // Click links in a non-deterministic order.
    const linksInRandomOrder = shuffleArray(Array.from(socialRewardLinks));

    for (const socialLink of linksInRandomOrder) {
      const betweenClicksDelayMs = getRandomDelayBiasedShort(scriptConfig.betweenSocialClicksDelayMs);
      console.log("[IG-Auto] waiting before next social click:", Math.round(betweenClicksDelayMs), "ms");
      await delay(betweenClicksDelayMs);
      socialLink.click();
    }
    console.log("[IG-Auto] all social links have been clicked");
  }

  function openAllGiveawayLinksInTabs(){
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
  GM_registerMenuCommand("Open ALL Links", openAllGiveawayLinksInTabs);

  if (isGiveawayPage()) {
    participate();
  }

})();