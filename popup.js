// Initialize default filters if not already set
function initializeDefaultFilters() {
  const defaultFilters = ["☭", "🇷🇺", "🇿"];
  browser.storage.local.get(["defaultFilters", "disabledDefaultFilters"], function (data) {
    if (!data.defaultFilters) { // Set default filters if they are not initialized
      browser.storage.local.set({ defaultFilters: defaultFilters, disabledDefaultFilters: [] });
    }
  });
}

// Load filters from storage and display them in the popup
function loadFilters() {
  browser.storage.local.get(["defaultFilters", "customFilters", "disabledDefaultFilters", "uploadedFileName"], function(data) {
    const defaultFilters = data.defaultFilters || [];
    const customFilters = data.customFilters || [];
    const disabledFilters = data.disabledDefaultFilters || [];
    const uploadedFileName = data.uploadedFileName || "No file uploaded";

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

    document.getElementById("currentFileName").textContent = `Current file: ${uploadedFileName}`;
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

// Handle file upload
document.getElementById("uploadFile").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const usernames = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      browser.storage.local.set({ usernames: usernames, uploadedFileName: file.name }, function() {
        document.getElementById("currentFileName").textContent = `Current file: ${file.name}`;
        console.log(`Uploaded file: ${file.name}`);
      });
    };
    reader.readAsText(file);
  }
});

// Handle replace button click
document.getElementById("replaceFile").addEventListener("click", function() {
  browser.runtime.sendMessage({ action: "uploadFile" });
});

browser.runtime.onMessage.addListener(function(message) {
  if (message.action === "updateFileName") {
    document.getElementById("currentFileName").textContent = `Current file: ${message.fileName}`;
  }
});

// Initialize filters on DOMContentLoaded
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

// Ensure default filters are set on installation
browser.runtime.onInstalled.addListener(() => {
  initializeDefaultFilters();
});
