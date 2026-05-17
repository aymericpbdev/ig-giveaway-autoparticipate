# Instant Gaming Giveaway, Auto Participate

A userscript that automatically clicks the participation button on Instant Gaming giveaway pages, then the social reward links once they appear.

This is a fork of [enzomtpYT/InstantGaming-Giveaway-AutoParticipate](https://github.com/enzomtpYT/InstantGaming-Giveaway-AutoParticipate), focused on a more reliable waiting mechanism, human-like action timing, and a centralized configuration. See [Why this fork](#why-this-fork) for details.

## Credits & License

This project is a fork of
[enzomtpYT/InstantGaming-Giveaway-AutoParticipate](https://github.com/enzomtpYT/InstantGaming-Giveaway-AutoParticipate),
originally created by enzomtp. All credit for the original script goes to them.

The original repository does not include a license file. As a result, no explicit license terms are provided. Refer to the upstream repository for any licensing questions.

## Why this fork

The original script works, but a few aspects could be made more reliable and easier to maintain. This fork focuses on four changes:

- **More reliable waiting for social rewards.** The original used a fixed 1-second delay before clicking the social reward links. This fork waits for the links to actually appear in the DOM, using a `MutationObserver`, with a safety timeout as a fallback.

- **Human-like action timing.** Clicks are no longer fired instantly. A randomized delay is applied before the participation click and between each social reward click, to avoid a perfectly regular, machine-like click pattern.

- **Centralized configuration.** Selectors and timing values are grouped in a single `scriptConfig` object at the top of the file, so they can be adjusted or fixed in one place.

- **English comments and logs.** Comments and console output were rewritten in English for easier reuse.

The affiliate-link variant of the original script (`participate.user.js`) has been removed from this fork; only the no-redirect version is kept.

## What it does

When you open an Instant Gaming giveaway page, the script runs automatically:

1. It waits a short randomized delay, then clicks the **Participate** button.
2. Once participation is validated, Instant Gaming reveals the social reward links. The script waits for these links to appear.
3. It clicks each social reward link, in a random order, with a randomized delay between clicks.

If the giveaway page has no social reward links, or if they never appear, the script stops waiting after a safety timeout.

The script also adds three commands to the userscript manager menu (**Participate**, **Socials**, **Open ALL Links**) if you want to trigger an action manually.

## What it does not do

- **It does not complete actions on external platforms.** Some giveaways reward you for following a content creator on Twitch, YouTube, X, etc. The script clicks these reward links, which opens the external platform, but it does not perform the follow/subscribe action there. That part still has to be done manually.

- **It does not detect or list new giveaways.** The script only acts on the giveaway page you open. Finding active giveaways is not part of its scope.

- **It is not configurable from a user interface.** Timing and selectors can be changed by editing the `scriptConfig` object in the source file, but there is no settings panel.

## Installation

1. Install a userscript manager: [Tampermonkey](https://tampermonkey.net/) (Chromium-based browsers) or [Violentmonkey](https://violentmonkey.github.io/) (Firefox).

2. Open the [no-redirect-participate.user.js](https://github.com/aymericpbdev/ig-giveaway-autoparticipate/raw/main/no-redirect-participate.user.js) file. Your userscript manager will detect it and offer to install it.

That's it. The script runs automatically when you open an Instant Gaming giveaway page.

## Configuration

All adjustable values are grouped in a `scriptConfig` object at the top of the script file. To change the script's behavior, edit this object directly in the installed userscript (via your userscript manager's editor).

| Setting | Description |
|---|---|
| `participateButtonSelector` | CSS selector for the participate button. |
| `socialRewardSelector` | CSS selector for the social reward links. |
| `socialRewardsWaitTimeoutMs` | How long to wait for social links to appear before giving up (milliseconds). |
| `beforeParticipateClickDelayMs` | Random delay range before clicking the participate button (`min` / `max`, in milliseconds). |
| `betweenSocialClicksDelayMs` | Random delay range between two social reward clicks (`min` / `max`, in milliseconds). |

The two selector settings are also the first things to check if the script stops working: if Instant Gaming changes its page structure, updating these selectors is usually enough to fix it.

## A note on auditing userscripts

A userscript runs with full access to your session on the pages it matches. Before adopting this script, I reviewed it to check a few basic points:

- The `@match` rules are limited to Instant Gaming giveaway pages and the upstream GitHub list page, not arbitrary domains.
- The script makes no network requests of its own (no `fetch`, no `XMLHttpRequest`) and uses no remote code execution (`eval` and similar).
- The only granted permission is `GM_registerMenuCommand`, used to add the menu entries.

This is not a complete security guide, just the checks I did here. If you install any userscript, from this fork or elsewhere, reading its source first is always reasonable.

## Usage

Open an Instant Gaming giveaway page and let the script run. Note that automating giveaway participation may go against the rules of some giveaways or platforms, so use it knowingly.

## Debugging

The script logs each step of its execution to the browser console, prefixed with `[IG-Auto]`. To follow what it does:

1. Open your browser's developer tools (`F12`) and go to the Console tab.
2. Filter the console on `IG-Auto` to hide unrelated messages.
3. Reload an Instant Gaming giveaway page.

The logs show when the participate button is clicked, when the social reward links are detected, how long each delay lasts, and when the safety timeout is reached. If the script does not behave as expected, these logs are the first place to look. For example, a missing "participate button found" line points to an outdated `participateButtonSelector`.