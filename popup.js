window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('status').textContent = 'Extension is loaded';

  // Get the suffix checkbox
  const checkBox = document.getElementById('suffix-checkbox');

  checkBox.addEventListener('change', function() {
    // Gets the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      document.getElementById('status').textContent = `${checkBox.checked}`;
      chrome.tabs.sendMessage(
        tabs[0].id,
        { useSuffix: checkBox.checked },
        function(response) {
          console.log('success');
        },
      );
    });
  });
});
