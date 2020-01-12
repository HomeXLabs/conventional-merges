window.addEventListener('DOMContentLoaded', function() {
  const checkBox = document.getElementById('suffix-checkbox');

  checkBox.addEventListener('change', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { useSuffix: checkBox.checked });
    });
  });
});
