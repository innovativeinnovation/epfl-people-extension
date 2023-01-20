'use strict';

const PEOPLE_URL = 'https://people.epfl.ch';
const SEARCH_URL = 'https://search.epfl.ch/?filter=people';
const SOURCE_URL = 'https://search-api.epfl.ch/api/ldap?';

const MAX_RESULTS = 7;

// Provide help text to the user
chrome.omnibox.setDefaultSuggestion({
  description: 'Search EPFL People directory'
});

// Update the suggestions whenever the input is changed
chrome.omnibox.onInputChanged.addListener((text, addSuggestions) => {
  const headers = new Headers({ Accept: 'application/json' });
  const init = { method: 'GET', headers };
  const url = `${SOURCE_URL}&q=${text}`;
  const request = new Request(url, init);

  fetch(request)
    .then(createSuggestionsFromResponse)
    .then(addSuggestions);
});

// Open the page based on how the user clicks on a suggestion
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = text;
  if (!text.startsWith(PEOPLE_URL)) {
    // Update the url if the user clicks on the default suggestion
    url = `${SEARCH_URL}&q=${text}`;
  }
  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url, active: false });
      break;
  }
});

function createSuggestionsFromResponse (response) {
  return new Promise(resolve => {
    const suggestions = [];
    const suggestionsOnEmptyResults = [{
      content: SOURCE_URL,
      description: 'no results found'
    }];
    response.json().then(json => {
      if (!json || json.length === 0) {
        return resolve(suggestionsOnEmptyResults);
      }

      for (let i = 0; i < MAX_RESULTS; i++) {
        try {
          suggestions.push({
            content: PEOPLE_URL + '/' + json[i].profile,
            description: json[i].firstname + ' ' + json[i].name +
              ' - #' + json[i].sciper
          });
        } catch {}
      }

      return resolve(suggestions);
    });
  });
}
