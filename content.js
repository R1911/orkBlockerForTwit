let processedUsernames = new Set();

// Function to fetch and parse the usernames from the file
async function fetchBlockedUsernames() {
  const response = await fetch(browser.runtime.getURL('usernames.txt')); // Adjust the path as necessary
  if (!response.ok) {
    throw new Error(`Failed to fetch usernames: ${response.statusText}`);
  }
  const text = await response.text();
  const usernames = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  return new Set(usernames);
}

// Initialize the blocked usernames set
let blockedUsernames = new Set();

fetchBlockedUsernames().then(usernames => {
  blockedUsernames = usernames;
}).catch(error => {
  console.error('Error fetching blocked usernames:', error);
});

function containsFilter(displayName, filters) {
  return filters.some(filter => displayName.includes(filter));
}

// Function to process tweets
async function processTweets() {
  // Fetch all filters from storage
  const { defaultFilters, customFilters } = await browser.storage.local.get(["defaultFilters", "customFilters"]);
  const allFilters = (defaultFilters || []).concat(customFilters || []);
  
  const tweets = document.querySelectorAll('[data-testid="tweet"]');
  Array.from(tweets).forEach(tweet => {
    const usernameElement = tweet.querySelector('[data-testid="User-Name"] a');
    const displayNameElement = tweet.querySelector('[data-testid="User-Name"] span');

    if (usernameElement && displayNameElement) {
      const username = usernameElement.getAttribute("href").split("/")[1];
      const displayNameText = displayNameElement.textContent.trim();
      const displayNameEmojis = getDisplayNameEmojis(displayNameElement);
      const displayName = displayNameEmojis.length > 0 ? `${displayNameText} ${displayNameEmojis.join(" ")}` : displayNameText;

      if (blockedUsernames.has(`@${username}`) || containsFilter(displayName, allFilters)) {
        if (!processedUsernames.has(username)) {
          console.log("Filtered User Detected:", username, "Display Name:", displayName);
          processedUsernames.add(username);
        } else {
          //removeTweet(tweet);
          replaceTweetWithMessage(tweet);
        }
      }
    }
    tweet.setAttribute('data-processed', 'true'); // Mark the tweet as processed
  });
}

function getDisplayNameEmojis(displayNameElement) {
  const emojiElements = displayNameElement.querySelectorAll("img");
  return Array.from(emojiElements).map(emojiElement => emojiElement.alt);
}

// old implementation, just delete the tweet from rendering
function removeTweet(tweet) {
  tweet.parentNode.parentNode.remove();
}

// most of this code is now just trying to recreate the native Twitter look for blocked tweets lmao

function replaceTweetWithMessage(tweet) {
  const tweetContainer = tweet.closest('[data-testid="cellInnerDiv"], [data-testid="tweetDetail"], [data-testid="tweet"]');

  if (tweetContainer && !tweetContainer.getAttribute('data-replaced')) {
    // Create a new article element with Twitter's classes
    const messageArticle = document.createElement('article');
    messageArticle.setAttribute('aria-labelledby', 'id__filtered_tweet');
    messageArticle.setAttribute('role', 'article');
    messageArticle.setAttribute('tabindex', '-1');
    messageArticle.className = 'css-175oi2r r-1ut4w64 r-18u37iz r-1udh08x r-1c4vpko r-1c7gwzm r-1ny4l3l';

    // Create the inner div structure
    const outerDiv1 = document.createElement('div');
    outerDiv1.className = 'css-175oi2r r-eqz5dr r-16y2uox r-1wbh5a2';

    const outerDiv2 = document.createElement('div');
    outerDiv2.className = 'css-175oi2r r-16y2uox r-1wbh5a2 r-1ny4l3l';

    const outerDiv3 = document.createElement('div');
    outerDiv3.className = 'css-175oi2r';

    const outerDiv4 = document.createElement('div');
    outerDiv4.className = 'css-175oi2r r-18u37iz';

    const outerDiv5 = document.createElement('div');
    outerDiv5.className = 'css-175oi2r r-1iusvr4 r-16y2uox r-1777fci r-kzbkwu';

    const outerDiv6 = document.createElement('div');
    outerDiv6.className = 'css-175oi2r r-1awozwy r-x572qd r-jxzhtn r-1867qdf r-1phboty r-rs99b7 r-18u37iz r-1wtj0ep r-1mmae3n r-n7gxbd';

    const outerDiv7 = document.createElement('div');
    outerDiv7.className = 'css-175oi2r r-1adg3ll r-1wbh5a2 r-jusfrs';

    // Create the text message container
    const textContainer = document.createElement('div');
    textContainer.className = 'css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-16dba41';
    textContainer.style.textOverflow = 'unset';
    textContainer.style.color = 'rgb(83, 100, 113)';
    textContainer.id = 'id__filtered_tweet';

    const messageText = document.createElement('span');
    messageText.className = 'css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1udh08x';
    messageText.style.textOverflow = 'unset';
    messageText.innerHTML = '<span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">This tweet matches one of your active filters.</span>';

    // Create the "View" button
    const viewButton = document.createElement('button');
    viewButton.role = 'button';
    viewButton.className = 'css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-faml9v r-2dysd3 r-15ysp7h r-4wgw6l r-3pj75a r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l';
    viewButton.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    viewButton.style.borderColor = 'rgba(0, 0, 0, 0)';
    viewButton.type = 'button';

    const viewButtonTextContainer = document.createElement('div');
    viewButtonTextContainer.className = 'css-146c3p1 r-bcqeeo r-qvutc0 r-37j5jr r-q4m81j r-a023e6 r-rjixqe r-b88u0q r-1awozwy r-6koalj r-18u37iz r-16y2uox r-1777fci';
    viewButtonTextContainer.style.textOverflow = 'unset';
    viewButtonTextContainer.style.color = 'rgb(15, 20, 25)';

    const viewButtonText = document.createElement('span');
    viewButtonText.className = 'css-1jxf684 r-dnmrzs r-1udh08x r-3s2u2q r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1b43r93 r-1cwl3u0';
    viewButtonText.style.textOverflow = 'unset';
    viewButtonText.innerHTML = '<span dir="ltr" class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3 r-1udh08x" style="text-overflow: unset;"><span class="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3" style="text-overflow: unset;">View</span></span>';

    // Add event listener to the "View" button to show the tweet
    viewButton.addEventListener('click', () => {
      messageArticle.style.display = 'none';
      tweetContainer.style.display = 'block';
      tweetContainer.removeAttribute('data-processed'); // Allow reprocessing if needed
    });

    // Append elements together
    viewButtonTextContainer.appendChild(viewButtonText);
    viewButton.appendChild(viewButtonTextContainer);
    textContainer.appendChild(messageText);
    outerDiv7.appendChild(textContainer);
    outerDiv6.appendChild(outerDiv7);
    outerDiv6.appendChild(viewButton);
    outerDiv5.appendChild(outerDiv6);
    outerDiv4.appendChild(outerDiv5);
    outerDiv3.appendChild(outerDiv4);
    outerDiv2.appendChild(outerDiv3);
    outerDiv1.appendChild(outerDiv2);
    messageArticle.appendChild(outerDiv1);

    // Hide the original tweet and insert the message div
    tweetContainer.style.display = 'none';
    tweetContainer.parentNode.insertBefore(messageArticle, tweetContainer);

    tweetContainer.setAttribute('data-replaced', 'true'); // Mark the tweet as replaced
  }
}

// Initialize filtering when DOM is fully loaded
window.addEventListener("scroll", processTweets);
document.addEventListener("DOMContentLoaded", async function () {
  blockedUsernames = await fetchBlockedUsernames();
  processTweets();
});