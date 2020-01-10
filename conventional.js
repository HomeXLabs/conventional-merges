console.log('Conventional Merges 1.0')

const mergeTitleField = document.getElementById('merge_title_field');
const mergeButtons = document.querySelectorAll("button[data-disable-with='Merging…']");
const titlePattern = /^(feat|chore|fix|ci|build|docs|style|refactor|perf|test)(\([a-z]+\)(!?):|(!?):) (.*)[^\.]$/;

mergeTitleField.addEventListener('change', e => {
  const mergeTitleValue = e.target.value;
  if (!titlePattern.test(mergeTitleValue)) {
    console.log('INVALID')
    mergeButtons.forEach(mergeButton => {
      mergeButton.setAttribute('disabled', 'disabled');
      mergeButton.style.backgroundColor = '#d39494';
    })
  } else {
    console.log('VALID')
    mergeButtons.forEach(mergeButton => {
      mergeButton.removeAttribute('disabled');
    })
  }
  console.log('change', mergeTitleValue)
});

mergeTitleField.addEventListener('input', e => {
  const mergeTitleValue = e.target.value;
  if (!titlePattern.test(mergeTitleValue)) {
    console.log('INVALID')
    mergeButtons.forEach(mergeButton => {
      mergeButton.setAttribute('disabled', 'disabled');
      mergeButton.style.backgroundColor = '#d39494';
    })
  } else {
    console.log('VALID')
    mergeButtons.forEach(mergeButton => {
      mergeButton.removeAttribute('disabled');
    })
  }
  console.log('input', mergeTitleValue)
});
