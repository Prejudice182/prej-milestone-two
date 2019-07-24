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

const getDumpURL = (realm = "ragnaros") => {
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

const getItemQuality = itemID => {
  return getToken().then(token => {
    return fetch(
      `https://eu.api.blizzard.com/data/wow/item/${itemID}?namespace=static-eu&locale=en_GB`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(response => response.json())
      .then(response => { 
        return response.quality.name.toLowerCase();
      });
  });
}

/*
End of retrieval code. You can test this in your console if you would like to see it running.
Do this by running the command: 
getDumpURL("ragnaros")
and checking the response URL.
You can replace "ragnaros" with any other available EU realm for World of Warcraft, found here:
https://worldofwarcraft.com/en-gb/game/status
*/
let baseImgDir = "./assets/img/";

let names = ["coarseLeather", "tidesprayLinen", "deepSeaSatin", "shimmerscale", "mistscale", "bloodStainedBone", "calcifiedBone", "tempestHide", "nylonThread", "gloomDust", "umbraShard", "veiledCrystal", "tidesprayLinenBracers", "shimmerscaleArmguards", "coarseLeatherArmguards", "expulsom", "honorSatin", "honorLeather", "honorMail"];
let ids = [152541, 152576, 152577, 153050, 153051, 154164, 154165, 154722, 159959, 152875, 152876, 152877, 154692, 154153, 154145, 152668, 159916, 159888, 159893];
let icons = ["coarseleather.jpg", "tidespraylinen.jpg", "deepseasatin.jpg", "shimmerscale.jpg", "mistscale.jpg", "bloodstainedbone.jpg", "calcifiedbone.jpg", "tempesthide.jpg", "nylonthread.jpg", "gloomdust.jpg", "umbrashard.jpg", "veiledcrystal.jpg", "tsbracers.jpg", "ssbracers.jpg", "clbracers.jpg", "expulsom.jpg", "honorSatin.jpg", "honorLeather.jpg", "honorMail.jpg"];
let alts = ["Coarse Leather", "Tidespray Linen", "Deep Sea Satin", "Shimmerscale", "Mistscale", "Blood-Stained Bone", "Calcified Bone", "Tempest Hide", "Nylon Thread", "Gloom Dust", "Umbra Shard", "Veiled Crystal", "Tidespray Linen Bracers", "Shimmerscale Armguards", "Coarse Leather Armguards", "Expulsom", "Honorable Combatant's Satin Bracers", "Honorable Combatant's Leather Armguards", "Honorable Combatant's Mail Armguards"];
let qualities = ["common", "common", "uncommon", "common","uncommon","common","uncommon","uncommon","common","common","rare","epic","uncommon","uncommon","uncommon","rare","rare","rare","rare"];

const items = ids.reduce((o, k, i) => ({
  ...o,
  [k]: {
    icon: baseImgDir + icons[i],
    name: names[i],
    id: ids[i],
    alt: alts[i],
    quality: qualities[i],
    prices: [],
    average: 0
  }
}), {});

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
  return `${gold}<span class="gold">g</span> ${silver}<span class="silver">s</span> ${copper}<span class="copper">c</span>`;
}

const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

const arrMedian = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const getAveragePrice = () => {
  $.each(items, (i, v) => {
    let avg = arrAvg(v.prices);
    let med = arrMedian(v.prices);
    v.average = (avg < med) ? avg : med;
  });
}

const printItemCard = (arr, element) => {
  let craftedItem = arr.shift();
  $(`
  <div class="col-xl-4 py-3">
    <div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${craftedItem.id}" class="${craftedItem.quality}"><img src="${craftedItem.icon}" alt="${craftedItem.alt}" class="img-fluid img-header"><span class="float-right">${craftedItem.alt}</span></a>
      </div>
      <div class="card-body" id="${craftedItem.id}">
      </div>
      <div class="card-footer text-center">
        Crafting Cost: ${getGSCString(craftedItem.average)}
      </div>
    </div>
  </div>`).appendTo($(element));
  for (let i = 0; i < arr.length - 1; i += 2) {
    $(`<div class="row align-items-baseline py-2">
        <div class="col-6">
          <a href="https://www.wowhead.com/item=${arr[i].id}" class="${arr[i].quality}"><img src="${arr[i].icon}" alt="${arr[i].alt}">${arr[i].alt}</a> x ${arr[i+1]}
        </div>
        <div class="col-6">
          Average Price: ${getGSCString(arr[i].average)}
        </div>
      </div>`).appendTo($("#" + craftedItem.id));
  }
}

const printMaterialCard = (mat, element) => {
  $(`
  <div class="col-xl-4 py-3">
    <div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${mat.id}" class="${mat.quality}"><img src="${mat.icon}" alt="${mat.alt}" class="img-header"><span class="float-right">${mat.alt}</span></a>
      </div>
      <div class="card-body text-center">
        Average Price: ${getGSCString(mat.average)}
      </div>
    </div>
  </div>`).appendTo($(element));
}

$.getJSON("./assets/js/auctions.json", ahData => {
  let auctions = ahData.auctions;
  getItemsData(auctions);
  getAveragePrice();

  // Convert items array to use item names as key instead of id
  $.each(items, (i, v) => {
    items[v.name] = v;
    delete items[i];
  });

  // Nylon Thread is vendor item, set price to hard value of 60 silver
  items.nylonThread.average = 6000;

  /* Step One Calculations and Display */

  // Set average price to crafting cost instead of Auction House price 
  items.tidesprayLinenBracers.average = (items.tidesprayLinen.average * 10) + (items.nylonThread.average * 5);
  items.shimmerscaleArmguards.average = (items.shimmerscale.average * 6) + (items.bloodStainedBone.average * 4);
  items.coarseLeatherArmguards.average = (items.coarseLeather.average * 6) + (items.bloodStainedBone.average * 4);

  let linenBracersArr = [items.tidesprayLinenBracers, items.tidesprayLinen, 10, items.nylonThread, 5];
  let scaleBracersArr = [items.shimmerscaleArmguards, items.shimmerscale, 6, items.bloodStainedBone, 4];
  let leatherBracersArr = [items.coarseLeatherArmguards, items.coarseLeather, 6, items.bloodStainedBone, 4];

  let stepOneItemsArr = [linenBracersArr, scaleBracersArr, leatherBracersArr];

  $.each(stepOneItemsArr, (i, v) => printItemCard(v, "#stepOneInnerRow"));

  /* End of Step One */

  /* Step Two Calculations and Display */

  // Set Expulsom average to the cheapest bracer crafting cost, divided by 0.15 as per chance of receiving one per scrap
  items.expulsom.average = Math.min(items.tidesprayLinenBracers.average, items.shimmerscaleArmguards.average, items.coarseLeatherArmguards.average) / 0.15;

  $(`<div class="card">
    <div class="card-header">
      <a href="https://www.wowhead.com/item=${items.expulsom.id}" class="${items.expulsom.quality}"><img src="${items.expulsom.icon}" alt="${items.expulsom.alt}" class="img-header"><span class="float-right">${items.expulsom.alt}</span></a>
    </div>
    <div class="card-body text-center">
      Cost @ 15% chance of receiving Expulsom: ${getGSCString(items.expulsom.average)}
    </div>
  </div>`).appendTo("#stepTwoCol");

  /* End of Step Two */

  /* Step Three Calculations and Display */

  items.honorSatin.average = (items.deepSeaSatin.average * 22) + (items.nylonThread.average * 8) + items.expulsom.average;
  items.honorLeather.average = (items.tempestHide.average * 12) + (items.calcifiedBone.average * 8) + items.expulsom.average;
  items.honorMail.average = (items.mistscale.average * 12) + (items.calcifiedBone.average * 8) + items.expulsom.average;

  let honorSatinArr = [items.honorSatin, items.deepSeaSatin, 22, items.nylonThread, 8, items.expulsom, 1];
  let honorLeatherArr = [items.honorLeather, items.tempestHide, 12, items.calcifiedBone, 8, items.expulsom, 1];
  let honorMailArr = [items.honorMail, items.mistscale, 12, items.calcifiedBone, 8, items.expulsom, 1];

  let stepThreeItemsArr = [honorSatinArr, honorLeatherArr, honorMailArr];

  $.each(stepThreeItemsArr, (i, v) => printItemCard(v, "#stepThreeInnerRow"));

  /* End of Step Three */

  /* Step Four Calculations and Display */
  let stepFourItems = [items.gloomDust, items.umbraShard, items.veiledCrystal];

  $.each(stepFourItems, (i, v) => printMaterialCard(v, "#stepFourInnerRow"));
  
  $(".col-6:odd").addClass("text-right");
});