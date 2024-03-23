document.addEventListener("DOMContentLoaded", function () {
  // Load default filters
  const defaultFilters = ["☭", "🇷🇺", "🇿"];
  const defaultFiltersList = document.getElementById("defaultFilters");
  defaultFilters.forEach((filter) => {
    const li = document.createElement("li");
    li.textContent = filter;
    defaultFiltersList.appendChild(li);
  });

  // Load custom filters
  loadCustomFilters();

  // Add custom filter
  const addCustomFilterButton = document.getElementById("addCustomFilter");
  const customFilterInput = document.getElementById("customFilterInput");
  addCustomFilterButton.addEventListener("click", function () {
    const filter = customFilterInput.value.trim();
    if (filter) {
      const li = document.createElement("li");
      li.textContent = filter;
      defaultFiltersList.appendChild(li);
      customFilterInput.value = "";

      // Save custom filter to storage
      saveCustomFilter(filter);
    }
  });
});

// Load custom filters
function loadCustomFilters() {
  browser.storage.local.get("customFilters", function (data) {
    const customFilters = data.customFilters || [];
    const customFiltersList = document.getElementById("customFilters");
    customFilters.forEach((filter) => {
      const li = document.createElement("li");
      li.textContent = filter;
      customFiltersList.appendChild(li);
    });
  });
}

// Save custom filter to storage
function saveCustomFilter(filter) {
  // Use browser storage API to save custom filters
  browser.storage.local.get("customFilters", function (data) {
    const customFilters = data.customFilters || [];
    customFilters.push(filter);
    browser.storage.local.set({ customFilters: customFilters });
  });
}
