console.log('Conventional Merges 1.0');

const titlePattern = /^(feat|chore|fix|ci|build|docs|style|refactor|perf|test)(\([a-z]+\)(!?):|(!?):) (.*)[^\.]$/;
const titlePatternWithMandatorySuffix = /^(feat|chore|fix|ci|build|docs|style|refactor|perf|test)(\([a-z]+\)(!?):|(!?):) (.*)(\(#[0-9a-zA-Z]+\))$/;
let mergeTitleField, mergeButtons, mergeTypeButtons, useSuffix;
/**
 * "run_at": "document_end" wasn't operating as expected, instead we run at
 * initial page load and attach a 'DOMContentLoaded' event to the window.
 *
 * This ensures the existence of each of our required elements.
 */
window.addEventListener('DOMContentLoaded', () => {
  console.log('loaded');
  useSuffix = JSON.parse(localStorage.getItem('useSuffix'));
  console.log('useSuffix from local storage:', useSuffix);

  // Send message to show extension popup (background script is listening).
  chrome.runtime.sendMessage({ toDo: 'showPopup' });

  // Receive messages (popup script send these).
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.toDo == 'getSuffix') {
      sendResponse({
        useSuffix: JSON.parse(localStorage.getItem('useSuffix')),
      });
    } else {
      const newSuffix = request.useSuffix;
      localStorage.setItem('useSuffix', newSuffix);
      useSuffix = newSuffix;
      console.log('Update useSuffix', useSuffix);
      handleMergeTitleChange();
    }
  });

  locateFields();

  if (!mergeTitleField) {
    window.setTimeout(secondAttemptLocateFields, 3000);
  } else {
    console.log('found em!');
    applyEventListeners();
  }
});

function locateFields() {
  mergeTitleField = document.getElementById('merge_title_field');
  mergeButtons = document.querySelectorAll('button.js-merge-commit-button');

  /**
   * The 'change' event isn't triggered when the value is programatically updated
   * after selected a new merge type.
   *
   * (i.e. 'Merge pull request', 'Squash and merge').
   *
   * To resolve this, we add 'click' event listeners to each of these buttons to
   * check the title again.
   */
  mergeTypeButtons = document.querySelectorAll(
    "button[data-details-container='.js-merge-pr']",
  );
}

function secondAttemptLocateFields() {
  console.log('Trying again.');
  mergeTitleField = document.getElementById('merge_title_field');
  mergeButtons = document.querySelectorAll('button.js-merge-commit-button');
  mergeTypeButtons = document.querySelectorAll(
    "button[data-details-container='.js-merge-pr']",
  );
  if (!mergeTitleField) {
    window.setTimeout(secondAttemptLocateFields, 3000);
  } else {
    console.log('found em!');
    applyEventListeners();
  }
}

function applyEventListeners() {
  mergeTypeButtons.forEach(mergeTypeButton => {
    mergeTypeButton.addEventListener('click', () => {
      const { value } = mergeTitleField;
      console.log('click', value);
      handleMergeTitleChange();
    });
  });

  // Initial page load check.
  handleMergeTitleChange();

  /**
   * Add the various even listeners to the input field ('change', and 'input')
   */
  mergeTitleField.addEventListener('change', e => {
    const { value } = e.target;
    handleMergeTitleChange();
    console.log('change', value);
  });

  mergeTitleField.addEventListener('input', e => {
    const { value } = e.target;
    handleMergeTitleChange();
    console.log('input', value);
  });
}

/**
 * Updates the input field with styles and disables the 'Confirm merge' buttons
 * if the RegEx test fails.
 */
function handleMergeTitleChange() {
  const { value } = mergeTitleField;
  const patternMatches = useSuffix
    ? titlePatternWithMandatorySuffix.test(value)
    : titlePattern.test(value);
  if (!patternMatches) {
    mergeButtons.forEach(mergeButton => {
      mergeButton.setAttribute('disabled', 'disabled');
      mergeButton.style.backgroundColor = '#d39494';
    });
    mergeTitleField.style.border = '1px solid red';
    return;
  }

  mergeTitleField.style.border = '';
  mergeButtons.forEach(mergeButton => {
    mergeButton.removeAttribute('disabled');
  });
}
