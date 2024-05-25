function initializeDefaultFilters() {
  const defaultFilters = ["☭", "🇷🇺", "🇿"];
  browser.storage.local.get(["defaultFilters", "disabledDefaultFilters"], function (data) {
    if (!data.defaultFilters) { // Set default filters if they are not initialized
      browser.storage.local.set({ defaultFilters: defaultFilters, disabledDefaultFilters: [] });
    }
  });
}

function loadFilters() {
  browser.storage.local.get(["defaultFilters", "customFilters", "disabledDefaultFilters"], function(data) {
    const defaultFilters = data.defaultFilters || [];
    const customFilters = data.customFilters || [];
    const disabledFilters = data.disabledDefaultFilters || [];

    const defaultFiltersList = document.getElementById("defaultFilters");
    defaultFiltersList.innerHTML = '';
    defaultFilters.forEach(filter => {
      const isEnabled = !disabledFilters.includes(filter);
      addFilterToList(filter, "defaultFilters", true, false, isEnabled);
    });

    const customFiltersList = document.getElementById("customFilters");
    customFiltersList.innerHTML = '';
    customFilters.forEach(filter => {
      addFilterToList(filter, "customFilters", false, true, true);
    });
  });
}

function addFilterToList(filter, listId, isDefault = false, isCustom = false, isEnabled = true) {
  const list = document.getElementById(listId);
  const li = document.createElement("li");
  li.className = isEnabled ? '' : 'disabled'; // Apply disabled class at the li level

  const textSpan = document.createElement("span");
  textSpan.className = 'filter-text';
  textSpan.textContent = filter;

  const actionIcon = document.createElement("span");
  actionIcon.className = 'action-icon';

  // Use textContent for setting icons
  if (isEnabled) {
    actionIcon.textContent = isCustom ? "❌" : "🚫";
  } else {
    actionIcon.textContent = "✅";
  }

  actionIcon.onclick = function() {
    if (isCustom) {
      deleteCustomFilter(filter);
    } else {
      toggleDefaultFilter(filter, !isEnabled); // Toggle the state
    }
  };

  li.appendChild(textSpan);
  li.appendChild(actionIcon);
  list.appendChild(li);
}





function saveCustomFilter(filter) {
  browser.storage.local.get("customFilters", function (data) {
    const customFilters = data.customFilters || [];
    if (!customFilters.includes(filter)) {
      customFilters.push(filter);
      browser.storage.local.set({ customFilters: customFilters });
    }
  });
}

function deleteCustomFilter(filter) {
  browser.storage.local.get("customFilters", function (data) {
    let customFilters = data.customFilters || [];
    customFilters = customFilters.filter(f => f !== filter);
    browser.storage.local.set({ customFilters: customFilters }, loadFilters);
  });
}

function toggleDefaultFilter(filter, enable) {
  browser.storage.local.get(["defaultFilters", "disabledDefaultFilters"], function(data) {
    let disabledFilters = data.disabledDefaultFilters || [];
    if (enable) {
      disabledFilters = disabledFilters.filter(f => f !== filter); // Enable the filter
    } else {
      disabledFilters.push(filter); // Disable the filter
    }
    browser.storage.local.set({disabledDefaultFilters: disabledFilters}, function() {
      loadFilters(); // Reload filters to reflect changes
    });
  });
}


document.addEventListener("DOMContentLoaded", function () {
  initializeDefaultFilters();
  loadFilters();
  document.getElementById("addCustomFilter").addEventListener("click", function () {
    const filter = document.getElementById("customFilterInput").value.trim();
    if (filter) {
      addFilterToList(filter, "customFilters", false, true);
      document.getElementById("customFilterInput").value = "";
      saveCustomFilter(filter);
    }
  });
});
