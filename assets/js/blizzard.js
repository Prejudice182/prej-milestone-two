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
        console.log(response.files[0].url);
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
let baseImgDir = "./assets/img/";

let names = ["coarseLeather", "tidesprayLinen", "deepSeaSatin", "shimmerscale", "mistscale", "bloodStainedBone", "calcifiedBone", "tempestHide", "nylonThread"];
let ids = [152541, 152576, 152577, 153050, 153051, 154164, 154165, 154722, 159959];
let icons = ["coarseleather.jpg", "tidespraylinen.jpg", "deepseasatin.jpg", "shimmerscale.jpg", "mistscale.jpg", "bloodstainedbone.jpg", "calcifiedbone.jpg", "tempesthide.jpg", "nylonthread.jpg"];

const items = ids.reduce((o, k, i) => ({...o, [k]: {icon: baseImgDir + icons[i], name: names[i], prices: [], average: 0, id: ids[i]}}), {});

const getItemsData = auctions => {
  $.each(auctions, (i, v) => {
    let pricePerItem = v.buyout / v.quantity;
    if (items.hasOwnProperty(v.item))
      items[v.item].prices.push(pricePerItem);
  });
}

const getGSCString = value => {
  let gold = Math.floor(value / 10000);
  let silver = Math.floor((value % 10000) / 100);
  let copper = Math.floor(value % 100);
  return `${gold}g ${silver}s ${copper}c`;
}

const arrSum = arr => arr.reduce((a, b) => a + b, 0);

const getAveragePrice = () => {
  $.each(items, (i, v) => {
    let tot = arrSum(v.prices);
    let avg = tot / v.prices.length;
    v.average = avg;
  });
}

const getItemIcon = itemID => {
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

let tsBIcon = baseImgDir + "tsbracers.jpg";
let ssBIcon = baseImgDir + "ssbracers.jpg";
let clBIcon = baseImgDir + "clbracers.jpg";
let expIcon = baseImgDir + "expulsom.jpg";

$.getJSON("./assets/js/auctions.json", ahData => {
  let auctions = ahData.auctions;
  getItemsData(auctions);
  getAveragePrice();

  $.each(items, (i, v) => {
    items[v.name] = v;
    delete items[i];
  });

  let linenBracers = (items.tidesprayLinen.average * 10) + 30000;
  let scaleBracers = (items.shimmerscale.average * 6) + (items.bloodStainedBone.average * 4);
  let leatherBracers = (items.coarseLeather.average * 6) + (items.bloodStainedBone.average * 4);

  let expulsom = Math.min(linenBracers, scaleBracers, leatherBracers) / 0.15;
  let expItem;
  if (linenBracers < scaleBracers && linenBracers < leatherBracers)
    expItem = "Tidespray Linen Bracers";
  else if (scaleBracers < linenBracers && scaleBracers < leatherBracers)
    expItem = "Shimmerscale Armguards";
  else
    expItem = "Coarse Leather Armguards";

  $(`<div class="row" id="stepOneRow"></div>`).appendTo("#root");
  $(`<div class="col" id="stepOneCol"></div>`).appendTo("#stepOneRow");
  $(`<div class="card-group" id="stepOneCardGroup"></div>`).appendTo("#stepOneCol");
  $(`<div class="card">
      <div class="card-header">
        <a href="#" data-wowhead="item=154692"><img src="${tsBIcon}" alt="Tidespray Linen Bracers">Tidespray Linen Bracers</a>
      </div>
      <div class="card-body">
        <p><a href="#" data-wowhead="item=${items.tidesprayLinen.id}"><img src="${items.tidesprayLinen.icon}" alt="Tidespray Linen">Tidespray Linen</a> x 10 - Average Price: ${getGSCString(items.tidesprayLinen.average)}</p>
        <p><a href="#" data-wowhead="item=${items.nylonThread.id}"><img src="${items.nylonThread.icon}" alt="Nylon Thread">Nylon Thread</a> x 5 - Vendor Buy: 60s</p>
        <p class="text-center">Crafting Cost: ${getGSCString(linenBracers)}</p>
      </div>
    </div>`).appendTo("#stepOneCardGroup");
  $(`<div class="card">
      <div class="card-header">
        <a href="#" data-wowhead="item=154153"><img src="${ssBIcon}" alt="Shimmerscale Armguards">Shimmerscale Armguards</a>
      </div>
      <div class="card-body">
        <p><a href="#" data-wowhead="item=${items.shimmerscale.id}"><img src="${items.shimmerscale.icon}" alt="Shimmerscale">Shimmerscale</a> x 6 - Average Price: ${getGSCString(items.shimmerscale.average)}</p>
        <p><a href="#" data-wowhead="item=${items.bloodStainedBone.id}"><img src="${items.bloodStainedBone.icon}" alt="Blood-stained Bone">Blood-stained Bone</a> x 4 - Average Price: ${getGSCString(items.bloodStainedBone.average)}</p>
        <p class="text-center">Crafting Cost: ${getGSCString(scaleBracers)}</p>
      </div>
    </div>`).appendTo("#stepOneCardGroup");
  $(`<div class="card">
        <div class="card-header">
          <a href="#" data-wowhead="item=154145"><img src="${clBIcon}" alt="Coarse Leather Armguards">Coarse Leather Armguards</a>
        </div>
        <div class="card-body">
          <p><a href="#" data-wowhead="item=${items.coarseLeather.id}"><img src="${items.coarseLeather.icon}" alt="Coarse Leather">Coarse Leather</a> x 6 - Average Price: ${getGSCString(items.coarseLeather.average)}</p>
          <p><a href="#" data-wowhead="item=${items.bloodStainedBone.id}"><img src="${items.bloodStainedBone.icon}" alt="Blood-stained Bone">Blood-stained Bone</a> x 4 - Average Price: ${getGSCString(items.bloodStainedBone.average)}</p>
          <p class="text-center">Crafting Cost: ${getGSCString(leatherBracers)}</p>
        </div>
      </div>`).appendTo("#stepOneCardGroup");
  $(`<div class="row justify-content-center">
      <div class="col-4">
        <p><img src="${expIcon}" alt="Expulsom">Expulsom - Craft ${expItem} - Crafting Cost: ${getGSCString(expulsom)}</p>
      </div>
    </div>`).appendTo("#root");
});