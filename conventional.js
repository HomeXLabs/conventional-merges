/**
 * "run_at": "document_end" wasn't operating as expected, instead we run at
 * initial page load and attach a 'DOMContentLoaded' event to the window.
 *
 * This ensures the existence of each of our required elements.
 */
window.addEventListener('DOMContentLoaded', () => {
  locateFields(githubFields =>
    conventionalMerges({
      ...githubFields,
      useSuffix: JSON.parse(localStorage.getItem('useSuffix')),
    }),
  );
});

function conventionalMerges(githubFields) {
  addEventListeners(githubFields);

  // Send message to show extension popup (background script is listening).
  chrome.runtime.sendMessage({ toDo: 'showPopup' });

  // Receive messages (popup script send these).
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.toDo == 'getSuffix') {
      sendResponse({
        useSuffix: JSON.parse(localStorage.getItem('useSuffix')),
      });
    } else {
      const { useSuffix } = request;
      localStorage.setItem('useSuffix', useSuffix);
      githubFields.useSuffix = useSuffix;
      handleMergeTitleChange(githubFields);
    }
  });

  handleMergeTitleChange(githubFields);
}

function locateFields(callback) {
  let mergeTitleField = document.getElementById('merge_title_field');
  let mergeButtons = document.querySelectorAll('button.js-merge-commit-button');
  let mergeTypeButtons = document.querySelectorAll(
    "button[data-details-container='.js-merge-pr']",
  );

  if (!mergeTitleField || !mergeButtons.length || !mergeTypeButtons.length) {
    window.setTimeout(locateFields.bind(null, callback), 3000);
  } else {
    callback({ mergeTitleField, mergeButtons, mergeTypeButtons });
  }
}

function addEventListeners(githubFields) {
  const { mergeTitleField, mergeTypeButtons } = githubFields;
  mergeTypeButtons.forEach(mergeTypeButton =>
    mergeTypeButton.addEventListener('click', () =>
      handleMergeTitleChange(githubFields),
    ),
  );
  mergeTitleField.addEventListener('change', () =>
    handleMergeTitleChange(githubFields),
  );
  mergeTitleField.addEventListener('input', () =>
    handleMergeTitleChange(githubFields),
  );
}

function getRegExpPattern({ useSuffix }) {
  const mandatorySuffixRegexp = useSuffix
    ? `(\\(#[0-9a-zA-Z]+[^.]{0}\\))`
    : `[^.]`;
  const finalRegexp = `^(feat|chore|fix|ci|build|docs|style|refactor|perf|test)(\\([a-z\\-]+\\)(!?):|(!?):) (.*)${mandatorySuffixRegexp}$`;
  return new RegExp(finalRegexp);
}

function handleMergeTitleChange({ mergeTitleField, mergeButtons, useSuffix }) {
  const { value } = mergeTitleField;
  const regexpPattern = getRegExpPattern({ useSuffix });
  const patternMatches = regexpPattern.test(value);
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
