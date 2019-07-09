/* 
I know this isn't good practice, but this is just for educational purposes!
The following code will allow me to retrieve the latest AH data for a chosen realm.
For the purposes of this project, I will use a static copy, as retrieval by automated means
requires the use of a Node.js server as CORS headers are not enabled on these files.
*/
const client_id = "9f6b9ba0b39245708f42e5f93cd1114f";
const client_secret = "gR6CowcHZDJa5LU348yBI0uhDkGSzTbn";

let formData = new FormData();
formData.append("grant_type", "client_credentials");

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

const getDumpURL = realm => {
  return getToken().then(token => {
    return window
      .fetch(
        `https://eu.api.blizzard.com/wow/auction/data/${realm}?locale=en_GB`, {
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

/*
End of retrieval code. You can test this in your console if you would like to see it running.
Do this by running the command: 
getDumpURL("ragnaros")
and checking the response URL.
You can replace "ragnaros" with any other available EU realm for World of Warcraft, found here:
https://worldofwarcraft.com/en-gb/game/status
*/

let items = [coarseLeather = [],
  tidesprayLinen = [],
  deepSeaSatin = [],
  shimmerscale = [],
  mistscale = [],
  bloodStainedBone = [],
  calcifiedBone = [],
  tempestHide = []
];

const getItemsData = auctions => {
  $.each(auctions, (index, value) => {
    let pricePerItem = value.buyout / value.quantity;
    switch (value.item) {
      case 152541:
        coarseLeather.push(pricePerItem);
        break;
      case 152576:
        tidesprayLinen.push(pricePerItem);
        break;
      case 152577:
        deepSeaSatin.push(pricePerItem);
        break;
      case 153050:
        shimmerscale.push(pricePerItem);
        break;
      case 153051:
        mistscale.push(pricePerItem);
        break;
      case 154164:
        bloodStainedBone.push(pricePerItem);
        break;
      case 154165:
        calcifiedBone.push(pricePerItem);
        break;
      case 154722:
        tempestHide.push(pricePerItem);
        break;
    }
  });
}

const getGSCString = (value) => {
  let gold = Math.floor(value / 10000);
  let silver = Math.floor((value % 10000) / 100);
  let copper = Math.floor(value % 100);
  return `${gold}g ${silver}s ${copper}c`;
}

const getAveragePrice = () => {
  for (let i = 0; i < items.length; i++) {
    let total = 0;
    for (let j = 0; j < items[i].length; j++) {
      total += items[i][j];
    }
    let average = total / items[i].length;
    items[i].push(average);
    items[i].splice(0, items[i].length - 1);
  }
}

const getItemIcon = (itemID) => {
  return getToken().then(token => {
    return window.fetch(
        `https://eu.api.blizzard.com/data/wow/media/item/${itemID}?namespace=static-eu&locale=en_GB`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then(response => response.json())
      .then(response => {
        console.log(response.assets[0].value);
      });
  });
}

let baseImgDir = "./assets/img/";
let bsbIcon = baseImgDir + "bloodsoakedbone.jpg";
let cbIcon = baseImgDir + "calcifiedbone.jpg";
let clIcon = baseImgDir + "coarseleather.jpg";
let dssIcon = baseImgDir + "deepseasatin.jpg";
let msIcon = baseImgDir + "mistscale.jpg";
let ntIcon = baseImgDir + "nylonthread.jpg";
let ssIcon = baseImgDir + "shimmerscale.jpg";
let thIcon = baseImgDir + "tempesthide.jpg";
let tsIcon = baseImgDir + "tidespraylinen.jpg";
let tsBIcon = baseImgDir + "tsbracers.jpg";

$.getJSON("./assets/js/auctions.json", ahData => {
  let auctions = ahData.auctions;
  getItemsData(auctions);
  getAveragePrice();
  $("#root").html(`<p><img src="${tsIcon}" alt="Tidespray Linen">Tidespray Linen - Average Price: ${getGSCString(tidesprayLinen[0])}</p>
  <p><img src="${ntIcon}" alt="Nylon Thread">Nylon Thread - Vendor Buy: 60s</p>
  <p><img src="${tsBIcon}" alt="Tidespray Linen Bracers">Tidespray Linen Bracers - Crafting Cost: ${getGSCString((tidesprayLinen[0]*10)+30000)}</p>`);
});