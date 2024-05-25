// Content script (content.js)
let processedUsernames = new Set();

// Extract emojis from image elements within displayNameElement
function getDisplayNameEmojis(displayNameElement) {
  const emojiElements = displayNameElement.querySelectorAll("img");
  return Array.from(emojiElements).map(emojiElement => emojiElement.alt);
}

function containsFilter(displayName, filters) {
  return filters.some(filter => displayName.includes(filter));
}

function processTweets() {
  browser.storage.local.get(["defaultFilters", "customFilters"], function(data) {
    const defaultFilters = data.defaultFilters || [];
    const customFilters = data.customFilters || [];
    const allFilters = defaultFilters.concat(customFilters);

    const tweets = document.querySelectorAll('[data-testid="tweet"]');
    Array.from(tweets).forEach(tweet => {
      const usernameElement = tweet.querySelector('[data-testid="User-Name"] a');
      const displayNameElement = tweet.querySelector('[data-testid="User-Name"] span');

      if (usernameElement && displayNameElement) {
        const username = usernameElement.getAttribute("href").split("/")[1];
        const displayNameText = displayNameElement.textContent.trim();
        const displayNameEmojis = getDisplayNameEmojis(displayNameElement);
        const displayName = displayNameEmojis.length > 0 ? `${displayNameText} ${displayNameEmojis.join(" ")}` : displayNameText;

        if (allFilters.some(filter => displayName.includes(filter))) {
          if (!processedUsernames.has(username)) {
            console.log("Filtered User Detected:", username, "Display Name:", displayName);
            processedUsernames.add(username);
          } else {
            removeTweet(tweet);
          }
        }
      }
    });
  });
}

function removeTweet(tweet) {
  tweet.parentNode.parentNode.remove();
}

window.addEventListener("scroll", processTweets);
document.addEventListener("DOMContentLoaded", processTweets);
