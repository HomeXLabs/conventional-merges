window.addEventListener('DOMContentLoaded', function() {
  const checkBox = document.getElementById('suffix-checkbox');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { toDo: 'getSuffix' }, function(
      response,
    ) {
      checkBox.checked = response.useSuffix;
    });
  });

  checkBox.addEventListener('change', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { useSuffix: checkBox.checked });
    });
  });
});
