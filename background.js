browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "uploadFile") {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
          const usernames = e.target.result.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          browser.storage.local.set({ usernames: usernames, uploadedFileName: file.name });
          browser.tabs.sendMessage(sender.tab.id, { action: "updateFileName", fileName: file.name });
        };
        reader.readAsText(file);
      };
      input.click();
    }
  });
  
  // Ensure to listen to messages only from your extension
  