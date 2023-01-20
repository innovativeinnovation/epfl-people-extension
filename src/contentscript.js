'use strict';

const SOURCE_URL = 'https://search-api.epfl.ch/api/ldap';

function findEmailInPeople () {
  var mails = document.querySelectorAll('a[href^=mailto]');
  if (mails[0]) {
    return mails[0].innerText;
  }
  return false;
};

function getPeopleInfo (email) {
  const headers = new Headers({ Accept: 'application/json' });
  const init = { method: 'GET', headers };
  const url = `${SOURCE_URL}?q=${email}`;
  const request = new Request(url, init);

  fetch(request).then(injectSciper);
};

function injectSciper (response) {
  response.json().then(json => {
    if (json[0] && json[0].sciper) {
      const h1s = document.getElementsByTagName('h1');
      const name = h1s[1].innerText;
      h1s[1].innerText = name + ' #' + json[0].sciper;
    }
  });
};

function addSciperAfterName (sciper) {
  var email = findEmailInPeople();
  if (email) {
    getPeopleInfo(email);
  }
};

addSciperAfterName();
