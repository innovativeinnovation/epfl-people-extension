/*
 * (c) William Belle, 2023.
 * See the LICENSE file for more details.
 *
 * See  https://github.com/ponsfrilus/EPFL_People_UserScript
 */

'use strict';

const SOURCE_URL = 'https://search-api.epfl.ch/api/ldap';
const MAP_URL = 'https://plan.epfl.ch/iframe/?map_zoom=10';

function injectSciper (sciper) {
  const h1s = document.getElementsByTagName('h1');
  h1s[1].innerText += ` #${sciper}`;
}

function injectMaps (user) {
  for (const accred in user.accreds) {
    if (user.accreds[accred].officeList.length) {
      for (const office of user.accreds[accred].officeList) {
        document.getElementById(`collapse-${accred}`).innerHTML +=
          `<div>
            <iframe
              id="epfl-map-${accred}"
              height="350px"
              width="100%"
              src="${MAP_URL}&room==${office}">
            </iframe>
          </div>`;
      }
    }
  }
}

function findEmail () {
  var mails = document.querySelectorAll('a[href^=mailto]');
  if (mails[0]) {
    return mails[0].innerText;
  }
  return false;
};

async function getPeopleFromSearchAPI (email) {
  const headers = new Headers({ Accept: 'application/json' });
  const init = { method: 'GET', headers };
  const url = `${SOURCE_URL}?q=${email}`;
  const request = new Request(url, init);

  const response = await fetch(request);
  const users = await response.json();
  return users;
};

async function enhancePeople () {
  var email = findEmail();
  if (email) {
    const users = await getPeopleFromSearchAPI(email);
    if (users[0]) {
      injectSciper(users[0].sciper);
      injectMaps(users[0]);
    }
  }
};

enhancePeople();
