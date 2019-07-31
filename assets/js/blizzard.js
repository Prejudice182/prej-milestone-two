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
let qualities = ["common", "common", "uncommon", "common", "uncommon", "common", "uncommon", "uncommon", "common", "common", "rare", "epic", "uncommon", "uncommon", "uncommon", "rare", "rare", "rare", "rare"];

// Combine above arrays into objects
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

// Loop through auctions, check if ID matches one in items array
const getItemsData = auctions => {
  $.each(auctions, (i, v) => {
    let pricePerItem = v.buyout / v.quantity;
    if (items.hasOwnProperty(v.item))
      items[v.item].prices.push(pricePerItem);
  });
}

// Convert number in readable string of gold, silver and copper
const getGSCString = value => {
  let gold = Math.floor(value / 10000);
  let silver = Math.floor((value % 10000) / 100);
  let copper = Math.floor(value % 100);
  return `${gold}<span class="gold">g</span> ${silver}<span class="silver">s</span> ${copper}<span class="copper">c</span>`;
}

// Get average value of an array (Credit: https://codeburst.io/javascript-arrays-finding-the-minimum-maximum-sum-average-values-f02f1b0ce332)
const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

// Get median value of an array (Credit: https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-88.php)
const arrMedian = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

// Get both average and median, set value to lowest
const getAveragePrice = () => {
  $.each(items, (i, v) => {
    let avg = arrAvg(v.prices);
    let med = arrMedian(v.prices);
    v.average = (avg < med) ? avg : med;
  });
}

// Takes an array of items, and prints their information to the page using jQuery
const printItemCard = (item, element) => {
  $(`
  <div class="col-xl-4 py-2">
    <div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${item.id}" class="${item.quality}" target="blank" rel="noopener"><img src="${item.icon}" alt="${item.alt}" class="img-fluid img-header"><span class="float-right">${item.alt}</span></a>
      </div>
      <div class="card-body" id="${item.id}">
      </div>
      <div class="card-footer text-center">
        Crafting Cost: ${getGSCString(item.average)}
      </div>
    </div>
  </div>`).appendTo($(element));
  for (let i = 0; i < item.materials.length; i++) {
    $(`<div class="row align-items-baseline py-1">
        <div class="col-6">
          <a href="https://www.wowhead.com/item=${item.materials[i].id}" class="${item.materials[i].quality}" target="blank" rel="noopener"><img src="${item.materials[i].icon}" alt="${item.materials[i].alt}">${item.materials[i].alt}</a> x ${item.quantities[i]}
        </div>
        <div class="col-6">
          Average Price: ${getGSCString(item.materials[i].average)}
        </div>
      </div>`).appendTo($("#" + item.id));
  }
}

// Takes a single item and prints a card with its information using jQuery
const printMaterialCard = (mat, element) => {
  $(`
  <div class="col-xl-4 py-3">
    <div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${mat.id}" class="${mat.quality}"><img src="${mat.icon}" alt="${mat.alt}" class="img-header"><span class="float-right">${mat.alt}</span></a>
      </div>
      <div class="card-body text-center pb-3">
        Average Price: ${getGSCString(mat.average)}
      </div>
    </div>
  </div>`).appendTo($(element));
}

const getCraftingCost = item => {
  let cost = 0;
  for (let i = 0; i < item.materials.length; i++)
    cost += item.quantities[i] * item.materials[i].average;
  item.average = cost;
  return cost;
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
  items.tidesprayLinenBracers.materials = [items.tidesprayLinen, items.nylonThread];
  items.tidesprayLinenBracers.quantities = [10, 5];

  items.shimmerscaleArmguards.materials = [items.shimmerscale, items.bloodStainedBone];
  items.shimmerscaleArmguards.quantities = [6, 4];

  items.coarseLeatherArmguards.materials = [items.coarseLeather, items.bloodStainedBone];
  items.coarseLeatherArmguards.quantities = [6, 4];

  $.each([items.tidesprayLinenBracers, items.shimmerscaleArmguards, items.coarseLeatherArmguards], (i, v) => {
    getCraftingCost(v);
    printItemCard(v, "#stepOneInnerRow");
  });

  let stepOneItem;
  if (items.tidesprayLinenBracers.average < items.shimmerscaleArmguards.average && items.tidesprayLinenBracers.average < items.coarseLeatherArmguards.average)
    stepOneItem = items.tidesprayLinenBracers;
  else if (items.shimmerscaleArmguards.average < items.tidesprayLinenBracers.average && items.shimmerscaleArmguards.average < items.coarseLeatherArmguards.average)
    stepOneItem = items.shimmerscaleArmguards;
  else
    stepOneItem = items.coarseLeatherArmguards;

  $(`#stepOneInnerRow .card:contains('${stepOneItem.alt}')`).addClass("cheapest");

  /* End of Step One */

  /* Step Two Calculations and Display */

  // Set Expulsom average to the cheapest bracer crafting cost, minus the cost of returned materials, multiplied by 6.55 as the chance of getting one is on average 1 in 6.55
  let scrapReturn = (stepOneItem.alt === "Tidespray Linen Bracers") ? 1.51*(stepOneItem.materials[0].average + stepOneItem.materials[1].average) : (1.55 * stepOneItem.materials[0].average) + (0.6 * stepOneItem.materials[1].average);
  items.expulsom.average = (stepOneItem.average - scrapReturn) * 6.55; 

  // Special case for expulsom being the only item in a row
  $(`<div class="card">
    <div class="card-header">
      <a href="https://www.wowhead.com/item=${items.expulsom.id}" class="${items.expulsom.quality}" target="blank" rel="noopener"><img src="${items.expulsom.icon}" alt="${items.expulsom.alt}" class="img-header"><span class="float-right">${items.expulsom.alt}</span></a>
    </div>
    <div class="card-body text-center pb-3">
      Min Crafting Cost: ${getGSCString(items.expulsom.average)}
    </div>
  </div>`).appendTo("#stepTwoCol");

  /* End of Step Two */

  /* Step Three Calculations and Display */

  items.honorSatin.materials = [items.deepSeaSatin, items.nylonThread, items.expulsom];
  items.honorSatin.quantities = [22, 8, 1];

  items.honorMail.materials = [items.mistscale, items.calcifiedBone, items.expulsom];
  items.honorMail.quantities = [12, 8, 1];

  items.honorLeather.materials = [items.tempestHide, items.calcifiedBone, items.expulsom];
  items.honorLeather.quantities = [12, 8, 1];

  $.each([items.honorSatin, items.honorMail, items.honorLeather], (i, v) => {
    getCraftingCost(v);
    printItemCard(v, "#stepThreeInnerRow");
  });

  let stepThreeItem;
  if (items.honorSatin.average < items.honorMail.average && items.honorSatin.average < items.honorLeather.average)
    stepThreeItem = items.honorSatin;
  else if (items.honorMail.average < items.honorSatin.average && items.honorMail.average < items.honorLeather.average)
    stepThreeItem = items.honorMail;
  else
    stepThreeItem = items.honorLeather;

  $(`#stepThreeInnerRow .card:contains("${stepThreeItem.alt}")`).addClass("cheapest");

  /* End of Step Three */

  /* Step Four Calculations and Display */
  let stepFourItems = [items.gloomDust, items.umbraShard, items.veiledCrystal];

  $.each(stepFourItems, (i, v) => printMaterialCard(v, "#stepFourInnerRow"));

  /* End of Step Four */

  // Move the price columns to the right
  $(".col-6:odd").addClass("text-right");

  $(".modal input:submit").click(() => {
    $(".results").empty();
    let numBracers = $("#numBracers").val();
    let greenBracers = Math.floor(numBracers * 0.85);
    let blueBracers = numBracers - greenBracers;
    let gloomReturn = Math.floor(greenBracers * 0.27);
    let umbraReturn = Math.floor(blueBracers * 2.2);
    let veiledReturn = Math.floor(blueBracers * 0.25);
    let total = numBracers * stepOneItem.average;

    for (let i = 0; i < stepOneItem.materials.length; i++) {
      $(`<p>You will need ${numBracers * stepOneItem.quantities[i]} ${stepOneItem.materials[i].alt} = ${getGSCString((numBracers * stepOneItem.quantities[i]) * stepOneItem.materials[i].average)}</p>`).appendTo(".results");
    }
    $(`<p>Total Cost: ${getGSCString(total)}</p>`).appendTo(".results");

    let expReturn = Math.floor(greenBracers * .15);
    $(`<p>Assuming a rate of 15% rare bracers, you will have:</p><p>${greenBracers} green bracers to scrap</p><p>${blueBracers} rare bracers to disenchant</p>`).appendTo(".results");
    $(`<p>After processing, this will yield:</p>`).appendTo(".results");
    $(`<p>${expReturn} Expulsom = ${getGSCString(expReturn * items.expulsom.average)}</p>`).appendTo(".results");
    $(`<p>${gloomReturn} Gloom Dust = ${getGSCString(gloomReturn * items.gloomDust.average)}</p>`).appendTo(".results");
    $(`<p>${umbraReturn} Umbra Shard = ${getGSCString(umbraReturn * items.umbraShard.average)}</p>`).appendTo(".results");
    $(`<p>${veiledReturn} Veiled Crystal = ${getGSCString(veiledReturn * items.veiledCrystal.average)}</p>`).appendTo(".results");
  });
});