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

/*
End of retrieval code. You can test this in your console if you would like to see it running.
Do this by running the command: 
getDumpURL("ragnaros")
and checking the response URL.
You can replace "ragnaros" with any other available EU realm for World of Warcraft, found here:
https://worldofwarcraft.com/en-gb/game/status
*/
let baseImgDir = "./assets/img/";

let names = ["coarseLeather", "tidesprayLinen", "deepSeaSatin", "shimmerscale", "mistscale", "bloodStainedBone", "calcifiedBone", "tempestHide", "nylonThread", "gloomDust", "umbraShard", "veiledCrystal"];
let ids = [152541, 152576, 152577, 153050, 153051, 154164, 154165, 154722, 159959, 152875, 152876, 152877];
let icons = ["coarseleather.jpg", "tidespraylinen.jpg", "deepseasatin.jpg", "shimmerscale.jpg", "mistscale.jpg", "bloodstainedbone.jpg", "calcifiedbone.jpg", "tempesthide.jpg", "nylonthread.jpg", "gloomdust.jpg", "umbrashard.jpg", "veiledcrystal.jpg"];

const items = ids.reduce((o, k, i) => ({
  ...o,
  [k]: {
    icon: baseImgDir + icons[i],
    name: names[i],
    prices: [],
    average: 0,
    id: ids[i]
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

$.getJSON("./assets/js/auctions.json", ahData => {
  let auctions = ahData.auctions;
  getItemsData(auctions);
  getAveragePrice();

  $.each(items, (i, v) => {
    items[v.name] = v;
    delete items[i];
  });

  // Nylon Thread is vendor item, set price to hard value of 60 silver
  items.nylonThread.average = 6000;

  /* Step One Calculations and Display */

  let linenBracers = (items.tidesprayLinen.average * 10) + (items.nylonThread.average * 5);
  let scaleBracers = (items.shimmerscale.average * 6) + (items.bloodStainedBone.average * 4);
  let leatherBracers = (items.coarseLeather.average * 6) + (items.bloodStainedBone.average * 4);

  let tsBIcon = baseImgDir + "tsbracers.jpg";
  let ssBIcon = baseImgDir + "ssbracers.jpg";
  let clBIcon = baseImgDir + "clbracers.jpg";

  $(`<div class="card-deck" id="stepOneCardDeck"></div>`).appendTo("#stepOneCol");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=154692" class="q2"><img src="${tsBIcon}" alt="Tidespray Linen Bracers" class="img-header"><span class="float-right">Tidespray Linen Bracers</span></a>
      </div>
      <div class="card-body">
        <div class="row align-items-baseline py-2">
          <div class="col-6">
            <a href="https://www.wowhead.com/item=${items.tidesprayLinen.id}" class="q1"><img src="${items.tidesprayLinen.icon}" alt="Tidespray Linen">Tidespray Linen</a> x 10
          </div>
          <div class="col-6">
            Average Price: ${getGSCString(items.tidesprayLinen.average)}
          </div>
        </div>
        <div class="row align-items-baseline py-2">
          <div class="col-6">
            <a href="https://www.wowhead.com/item=${items.nylonThread.id}" class="q1"><img src="${items.nylonThread.icon}" alt="Nylon Thread">Nylon Thread</a> x 5
          </div>
          <div class="col-6">
            Vendor Buy: ${getGSCString(items.nylonThread.average)}
          </div>
        </div>
      </div>
      <div class="card-footer text-center">
        Crafting Cost: ${getGSCString(linenBracers)}
      </div>
    </div>`).appendTo("#stepOneCardDeck");

  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=154153" class="q2"><img src="${ssBIcon}" alt="Shimmerscale Armguards" class="img-header"><span class="float-right">Shimmerscale Armguards</span></a>
      </div>
      <div class="card-body">
        <div class="row align-items-baseline py-2">
          <div class="col-6">
            <a href="https://www.wowhead.com/item=${items.shimmerscale.id}" class="q1"><img src="${items.shimmerscale.icon}" alt="Shimmerscale">Shimmerscale</a> x 6
          </div>
          <div class="col-6">
            Average Price: ${getGSCString(items.shimmerscale.average)}
          </div>
        </div>
        <div class="row align-items-baseline py-2">
          <div class="col-6">
            <a href="https://www.wowhead.com/item=${items.bloodStainedBone.id}" class="q1"><img src="${items.bloodStainedBone.icon}" alt="Blood-stained Bone">Blood-stained Bone</a> x 4
          </div>
          <div class="col-6">
            Average Price: ${getGSCString(items.bloodStainedBone.average)}
          </div>
        </div>
      </div>
      <div class="card-footer text-center">
          Crafting Cost: ${getGSCString(scaleBracers)}
      </div>
    </div>`).appendTo("#stepOneCardDeck");
  $(`<div class="card">
        <div class="card-header">
          <a href="https://www.wowhead.com/item=154145" class="q2"><img src="${clBIcon}" alt="Coarse Leather Armguards" class="img-header"><span class="float-right">Coarse Leather Armguards</span></a>
        </div>
        <div class="card-body">
          <div class="row align-items-baseline py-2">
            <div class="col-6">
              <a href="https://www.wowhead.com/item=${items.coarseLeather.id}" class="q1"><img src="${items.coarseLeather.icon}" alt="Coarse Leather">Coarse Leather</a> x 6
            </div>
            <div class="col-6">
              Average Price: ${getGSCString(items.coarseLeather.average)}
            </div>
          </div>
          <div class="row align-items-baseline py-2">
            <div class="col-6">
              <a href="https://www.wowhead.com/item=${items.bloodStainedBone.id}" class="q1"><img src="${items.bloodStainedBone.icon}" alt="Blood-stained Bone">Blood-stained Bone</a> x 4
            </div>
            <div class="col-6">
              Average Price: ${getGSCString(items.bloodStainedBone.average)}
            </div>
          </div>
        </div>
        <div class="card-footer text-center">
          Crafting Cost: ${getGSCString(leatherBracers)}
        </div>
      </div>`).appendTo("#stepOneCardDeck");

  /* End of Step One */

  /* Step Two Calculations and Display */

  let expulsom = Math.min(linenBracers, scaleBracers, leatherBracers) / 0.15;
  let expIcon = baseImgDir + "expulsom.jpg";
  let expItem, expItemID, expItemIcon;
  
  if (linenBracers < scaleBracers && linenBracers < leatherBracers) {
    expItem = "Tidespray Linen Bracers";
    expItemID = 154692;
    expItemIcon = tsBIcon;
  } else if (scaleBracers < linenBracers && scaleBracers < leatherBracers) {
    expItem = "Shimmerscale Armguards";
    expItemID = 154153;
    expItemIcon = ssBIcon;
  } else if (leatherBracers < linenBracers && leatherBracers < scaleBracers) {
    expItem = "Coarse Leather Armguards";
    expItemID = 154145;
    expItemIcon = clBIcon;
  }

  $(`<div class="row justify-content-center">
      <div class="col-4">
        <div class="card">
          <div class="card-header">
            <a href="https://www.wowhead.com/item=152668" class="q3"><img src="${expIcon}" alt="Expulsom">Expulsom</a>
          </div>
          <div class="card-body">
            <p>Cost @ 15% chance of receiving Expulsom: ${getGSCString(expulsom)}</p>
          </div>
        </div>
      </div>
    </div>`).appendTo("#stepTwoCol");

  /* End of Step Two */

  /* Step Three Calculations and Display */

  let honorSatin = (items.deepSeaSatin.average * 22) + (items.nylonThread.average * 8) + expulsom;
  let honorMail = (items.mistscale.average * 12) + (items.calcifiedBone.average * 8) + expulsom;
  let honorLeather = (items.tempestHide.average * 12) + (items.calcifiedBone.average * 8) + expulsom;

  let hSBIcon = baseImgDir + "honorSatin.jpg";
  let hMBIcon = baseImgDir + "honorMail.jpg";
  let hLBIcon = baseImgDir + "honorLeather.jpg";

  let honorItemPrice = Math.min(honorSatin, honorMail, honorLeather);
  let honorItem = "Honorable Combatant's ";
  if (honorSatin < honorMail && honorSatin < honorLeather)
    honorItem += "Satin Bracers";
  else if (honorMail < honorSatin && honorMail < honorLeather)
    honorItem += "Mail Armguards";
  else if (honorLeather < honorSatin && honorLeather < honorMail)
    honorItem += "Leather Armguards";

  $(`<div class="card-deck" id="stepThreeCardDeck"></div>`).appendTo("#stepThreeCol");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=159916" class="q3"><img src="${hSBIcon}" alt="Honorable Combantant's Satin Bracers">Honorable Combantant's Satin Bracers</a>
      </div>
      <div class="card-body">
        <p><a href="https://www.wowhead.com/item=${items.deepSeaSatin.id}" class="q2"><img src="${items.deepSeaSatin.icon}" alt="Deep Sea Satin">Deep Sea Satin</a> x 22 - Average Price: ${getGSCString(items.deepSeaSatin.average)}</p>
        <p><a href="https://www.wowhead.com/item=${items.nylonThread.id}" class="q1"><img src="${items.nylonThread.icon}" alt="Nylon Thread">Nylon Thread</a> x 8 - Average Price: ${getGSCString(items.nylonThread.average)}</p>
        <p><a href="https://www.wowhead.com/item=152668" class="q3"><img src="${expIcon}" alt="Expulsom">Expulsom</a> x 1 - Crafting Cost: ${getGSCString(expulsom)}</p>
        <p class="text-center">Crafting Cost: ${getGSCString(honorSatin)}</p>
      </div>
    </div>`).appendTo("#stepThreeCardDeck");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=159888" class="q3"><img src="${hLBIcon}" alt="Honorable Combantant's Leather Armguards">Honorable Combantant's Leather Armguards</a>
      </div>
      <div class="card-body">
        <p><a href="https://www.wowhead.com/item=${items.tempestHide.id}" class="q2"><img src="${items.tempestHide.icon}" alt="Tempest Hide">Tempest Hide</a> x 12 - Average Price: ${getGSCString(items.tempestHide.average)}</p>
        <p><a href="https://www.wowhead.com/item=${items.calcifiedBone.id}" class="q2"><img src="${items.calcifiedBone.icon}" alt="Calcified Bone">Calcified Bone</a> x 8 - Average Price: ${getGSCString(items.calcifiedBone.average)}</p>
        <p><a href="https://www.wowhead.com/item=152668" class="q3"><img src="${expIcon}" alt="Expulsom">Expulsom</a> x 1 - Crafting Cost: ${getGSCString(expulsom)}</p>
        <p class="text-center">Crafting Cost: ${getGSCString(honorLeather)}</p>
      </div>
    </div>`).appendTo("#stepThreeCardDeck");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=159893" class="q3"><img src="${hMBIcon}" alt="Honorable Combantant's Mail Armguards">Honorable Combantant's Mail Armguards</a>
      </div>
      <div class="card-body">
        <p><a href="https://www.wowhead.com/item=${items.mistscale.id}" class="q2"><img src="${items.mistscale.icon}" alt="Mistscale">Mistscale</a> x 12 - Average Price: ${getGSCString(items.mistscale.average)}</p>
        <p><a href="https://www.wowhead.com/item=${items.calcifiedBone.id}" class="q2"><img src="${items.calcifiedBone.icon}" alt="Calcified Bone">Calcified Bone</a> x 8 - Average Price: ${getGSCString(items.calcifiedBone.average)}</p>
        <p><a href="https://www.wowhead.com/item=152668" class="q3"><img src="${expIcon}" alt="Expulsom">Expulsom</a> x 1 - Crafting Cost: ${getGSCString(expulsom)}</p>
        <p class="text-center">Crafting Cost: ${getGSCString(honorMail)}</p>
      </div>
    </div>`).appendTo("#stepThreeCardDeck");

  /* End of Step Three */

  /* Step Four Calculations and Display */

  $(`<div class="card-deck" id="stepFourCardDeck"></div>`).appendTo("#stepFourCol");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${items.gloomDust.id}" class="q1"><img src="${items.gloomDust.icon}" alt="Gloom Dust">Gloom Dust</a>
      </div>
      <div class="card-body">
        <p class="text-center">Average Price: ${getGSCString(items.gloomDust.average)}</p>
      </div>
    </div>`).appendTo("#stepFourCardDeck");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${items.umbraShard.id}" class="q3"><img src="${items.umbraShard.icon}" alt="Umbra Shard">Umbra Shard</a>
      </div>
      <div class="card-body">
        <p class="text-center">Average Price: ${getGSCString(items.umbraShard.average)}</p>
      </div>
    </div>`).appendTo("#stepFourCardDeck");
  $(`<div class="card">
      <div class="card-header">
        <a href="https://www.wowhead.com/item=${items.veiledCrystal.id}" class="q4"><img src="${items.veiledCrystal.icon}" alt="Veiled Crystal">Veiled Crystal</a>
      </div>
      <div class="card-body">
        <p class="text-center">Average Price: ${getGSCString(items.veiledCrystal.average)}</p>
      </div>
    </div>`).appendTo("#stepFourCardDeck");
});