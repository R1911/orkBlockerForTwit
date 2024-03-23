// Content script (content.js)
let processedUsernames = new Set();

function processTweets() {
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  const conversationTweets = document.querySelectorAll(
    '[aria-label="Timeline: Conversation"] [data-testid="tweet"]'
  );

  // Combine both types of tweets
  const allTweets = Array.from(tweets).concat(Array.from(conversationTweets));

  allTweets.forEach((tweet) => {
    const isAd = tweet.querySelector('[data-testid="promoted-icon"]');
    if (isAd) {
      removeTweet(tweet); // Remove the tweet if it's identified as an ad
    } else {
      const usernameElement = tweet.querySelector(
        '[data-testid="User-Name"] a'
      );
      const displayNameElement = tweet.querySelector(
        '[data-testid="User-Name"] span'
      );

      if (usernameElement && displayNameElement) {
        const username = usernameElement.getAttribute("href").split("/")[1];
        const displayNameText = displayNameElement.textContent.trim();
        const displayNameEmojis = getDisplayNameEmojis(displayNameElement);

        const displayName =
          displayNameEmojis.length > 0
            ? `${displayNameText} ${displayNameEmojis.join(" ")}`
            : displayNameText;
        if (
          displayName.includes("☭") ||
          displayName.includes("🇷🇺") ||
          displayName.includes("🇿")
        ) {
          if (!processedUsernames.has(username)) {
            console.log(
              "Tibla Tuvastatud 🚨:",
              username,
              "Display Name:",
              displayName
            );
            processedUsernames.add(username);
          } else {
            removeTweet(tweet);
            console.log("Tibla Content Blocker 🛡️");
          }
        }
      } else {
        console.error(
          "Error: Username or display name element not found in tweet:",
          tweet
        );
      }
    }
  });
}

function getDisplayNameEmojis(displayNameElement) {
  const emojiElements = displayNameElement.querySelectorAll("img");
  return Array.from(emojiElements).map((emojiElement) => emojiElement.alt);
}

function removeTweet(tweet) {
  tweet.parentNode.parentNode.remove();
}

processTweets();

window.addEventListener("scroll", processTweets);
