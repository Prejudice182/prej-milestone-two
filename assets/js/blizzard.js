/* global $ */

// I know this isn't good practice, but this is just for educational purposes!
const client_id = "9f6b9ba0b39245708f42e5f93cd1114f";
const client_secret = "gR6CowcHZDJa5LU348yBI0uhDkGSzTbn";

let formData = new FormData();
formData.append("grant_type", "client_credentials");

// No CORS headers on auction house data request. This proxies the request to bypass this.
const proxyURL = "https://cors-anywhere.herokuapp.com/";

let token = null;

const getToken = () => {
  if (token === null || token.expires_at < Date.now()) {
    return window
      .fetch("https://eu.battle.net/oauth/token", {
        method: "POST",
        headers: {
          Authorization: "Basic " + window.btoa(`${client_id}:${client_secret}`)
        },
        body: formData
      })
      .then(response => response.json())
      .then(response => {
        token = {
          access_token: response.access_token,
          expires_at: Date.now() + parseInt(response.expires_in * 1000, 10)
        };
        return response.access_token;
      });
  } else {
    return Promise.resolve(token.access_token);
  }
};

const getDumpURL = () => {
  return getToken().then(token => {
    return window
      .fetch(
        "https://eu.api.blizzard.com/wow/auction/data/ragnaros?locale=en_GB",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(response => response.json())
      .then(response => {
        return response.files[0].url;
      });
  });
};

const getAHData = () => {
  return getDumpURL().then(dumpURL => {
    return window
      .fetch(proxyURL + dumpURL)
      .then(response => response.json())
      .then(response => {
        console.log(response.auctions);
        return response.auctions;
      });
  });
};

const getItems = itemID => {
  return getAHData().then(data => {
    let count = 0,
      cost = 0;
    data.forEach(d => {
      if (d.item == itemID) {
        count += d.quantity;
        cost += d.buyout;
      }
    });
    let average = cost / count;
    let gold = Math.trunc(average / 10000);
    let silver = Math.trunc((average % 10000) / 100);
    let copper = Math.trunc((average % 10000) % 100);
    $("#root").html(
      `There is ${count} of Tidespray Linen available on AH, at an average price of ${gold} g ${silver} s ${copper} c.`
    );
  });
};

const parseData = data;

getItems(152576);
