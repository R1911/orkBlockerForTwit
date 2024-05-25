browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeFollowers") {
        createScrapingTab(message.username);
    }
});

function createScrapingTab(username) {
    browser.tabs.create({ url: `https://twitter.com/${username}/followers` }).then(tab => {
        // Optionally, keep track of the tab ID to close it later or inject scripts
        console.log(`Created tab for username: ${username} with tab ID: ${tab.id}`);
        // You can also inject scripts here if needed
    });
}
