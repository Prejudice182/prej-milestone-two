# World of Warcraft Bracer Shuffle

Milestone Project Two: Interactive Frontend Development - Code Institute

I made this page as my submission for my second milestone project for Code Institute's diploma in software development. This page lays out the steps necessary to perform the "Bracer Shuffle" in World of Warcraft.

The "Bracer Shuffle" is a means of making gold in the in game economy of World of Warcraft. The basic idea is to take cheap, readily available materials and craft them into bracers, a piece of armor in the game. This piece can then be broken down via a mechanic known as scrapping. Doing so results in part of the materials used in crafting being refunded, with a small chance of an item called "Expulsom" also being awarded.

"Expulsom" is needed for higher end crafting, and is not tradable between users. It can be obtained through scrapping, world quests, or a daily transmute for players with the "Alchemy" profession. It is used to craft a different version of bracers, which result in items of epic quality. These items are then broken down by players with the "Enchanting" profession by a mechanic known as "Disenchanting". 

Enchanters can complete a quest line and craft an item known as a "Tool of the Trade". This increase materials returned when disenchanting. It is because of this that allows the shuffle to be more profitable than it was before the introduction of this item.

A live version can be found on [Github Pages](https://prejudice182.github.io/prej-milestone-two/).

## UX

When I was laying out this project, I wanted to make it as simple as possible, so I chose a one page layout, and broke the page down into steps needed for the shuffle.

- As a user, I want to be able to see which bracer is the cheapest to make.

- As a user, I want to know what the chance of receiving expulsom is per scrap.

- As a user, I want to know if the materials returned at the end of the shuffle are profitable.

- As a beginner goldmaker, I want to see if the materials used in the shuffle are worth flipping for a profit

- As an experienced goldmaker, I want to see how much expulsom will cost me to make, for higher end crafting


I mocked up an early desktop-first layout using Balsamiq
![mockup](./assets/img/mockup-1.png)

I tested for responsiveness using the site, [Am I Responsive?](http://ami.responsivedesign.is/)
![responsiveness](./assets/img/responsive.png)

## Features

### Existing Features

- Cards - shows the materials used to craft each item and quantity needed
- Links - lets users browse on to Wowhead, a fansite with a wealth of information on each item
- Icons - lets players quickly identify an item if they are used to the game
- Modals - provide interactiveness with a cost calculator and display help

### Features Left to Implement

- Updating auction house info automatically - Currently the data used is from a static JSON file. The file served by the Blizzard API doesn't serve CORS headers, so the file can't be retrieved by front-end javascript. [SOURCE](https://us.battle.net/forums/en/bnet/topic/20749875317#post-1)
- Ability to chose region and realm - Like above, the data used in the page is from the European realm that I play on, Ragnaros. In the future, there will be two pull down menus to select region (EU, US, CN, KR) and realm.

## Technologies Used

- HTML
    - Used for the structural elements of the site
- CSS
    - Used to style the HTML elements
- [Bootstrap](https://getbootstrap.com/)
    - Used to give access to a multitude of helper classes for CSS
- [jQuery](https://jquery.com/)
    - Used for DOM manipulation
- [Blizzard API](https://develop.battle.net/)
    - Used to retrieve auction house data, item info
- [Am I Responsive](http://ami.responsivedesign.is/)
    - Used to test for responsiveness across different device sizes

## Testing

The first part getting my project underway was getting authorization set up. Blizzard used OAuth to secure their APIs, so I needed to set up a client on [their site](https://develop.battle.net/) to get the requisite credentials. As this is a frontend only application, it is not a great idea to expose API keys in the code served to users, but this is only for educational purposes. The API only offers read permissions anyway, no data can be wrote anywhere with the API.

Blizzard offer two different flows for the API, client credentials or authorization code. The authorization code flow is used to access a player's data on their behalf, which we didn't need to use, so the choice was made to use the client credentials flow. I started coding the request, using the Fetch API. Once I received a token, I then started coding a call to another function to test if it was valid. I called the Auction API and retrieved the URL for an Auction House JSON dump, and the last modified date of it. This indicated my call to get a token was working and my API calls were successful.

I proceeded to try write another function to get the data from the JSON file provided by Blizzard, but was met with an error regarding cross origin resource sharing or CORS. Blizzard don't set CORS headers on the file, therefore it can't be viewed by client-side Javascript, in an effort to limit users exposing their keys client side. I had to settle for getting the link and saving the JSON to my project manually. I hope in the future to use Node.js or some other backend service to obtain the file, and update this project.

As I now had the auctions data, I now had to decided how to look through it for the items I was interested in. I created objects for each item I needed prices for, and looped through the data checking for matching item IDs. Once this was sorted, I needed to average out the prices, but sometimes players can skew this data by putting items on the Auction House for extortionate amounts. I added a median function as well, and choose the cheapest value between the two.

I then set about displaying the data. I chose Bootstrap cards for the layout, and then broke each item down into its respective materials and amounts. I was pretty happy with the page at this point, so I invited some feedback from the slack channel, [#peer-code-review](https://code-institute-room.slack.com/messages/CGWQJQKC5). It was then pointed out that my "interactive" project had no interactivity.

After this, I decided to add a calculate modal, to give users a sense of how much their desired crafting would cost them, and how much they could expect to get in return. I also added a help modal, to let users know the basics of using the page.

## Deployment

This site was coded using Visual Studio Code. It was made initially on Cloud 9, but after Amazon's acquisition and subsequent change to AWS Cloud 9, development is not as easy as it used to be. Code was tested using the Live Server extension of VS Code.

This site is hosted on Github Pages, deployed from the master branch. There are no differences between the development and deployed version.

To clone this repository to run locally, you can do the following:

- Create a new repository on Github
- Clone my repository with the following commands on your local machine:

    ```
    git clone https://github.com/Prejudice182/prej-milestone-two.git
    git remote rename origin upstream
    git remote add origin *URL TO NEW GITHUB REPO*
    git push origin master
    ```
    
- Deploy to Github Pages using the repository settings on Github

## Credits

### Content

- All item names and icons are property of Blizzard Entertainment, from their game, World of Warcraft
- All other content was written by myself

### Media

- Links to the icons for the items displayed were retrieved from the Blizzard API, using my code, and saved locally to avoid hotlinking.

### Acknowledgements

- I received inspiration for this site from visiting various World of Warcraft fan sites.
- Thanks to my mentor, [Oluwaseun Owonikoko](https://github.com/seunkoko)
- Thanks to all members of the Code Institute Slack workspace