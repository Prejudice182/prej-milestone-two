# World of Warcraft Bracer Shuffle

Milestone Project Two: Interactive Frontend Development - Code Institute

I made this page as my submission for my second milestone project for Code Institute's diploma in software development. This page lays out the steps necessary to perform the "Bracer Shuffle" in World of Warcraft.

The "Bracer Shuffle" is a means of making gold in the in game economy of World of Warcraft. The basic idea is to take cheap, readily available materials and craft them into bracers, a piece of armor in the game. This piece can then be broken down via a mechanic known as scrapping. Doing so results in part of the materials used in crafting being refunded, with a small chance of an item called "Expulsom" also being awarded.

"Expulsom" is needed for higher end crafting, and is not tradable between users. It can be obtained through scrapping, world quests, or a daily transmute for players with the "Alchemy" profession.

A live version can be found on [Github Pages](https://prejudice182.github.io/prej-milestone-two/).

## UX

When I was laying out this project, I wanted to make it as simple as possible, so I chose a one page layout, and broke the page down into steps needed for the shuffle.

- As a user, I want to be able to see which bracer is the cheapest to make.

- As a user, I want to know what the chance of receiving expulsom is per scrap.

- As a user, I want to know if the materials returned at the end of the shuffle are profitable.


I mocked up an early desktop-first layout using Balsamiq, which can be found [here](https://github.com/Prejudice182/prej-milestone-one/assets/mockups/mockup-1.png).

## Features

### Existing Features

- Cards - shows the materials used to craft each item and quantity needed
- Links - lets users browse on to Wowhead, a fansite with a wealth of information on each item
- Icons - lets players quickly identify an item if they are used to the game

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

## Testing

## Deployment

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

- All other content was written by myself

### Media

- Links to the icons for the items displayed were retrieved from the Blizzard API, using my code, and saved locally to avoid hotlinking.

### Acknowledgements

- I received inspiration for this site from visiting various World of Warcraft fan sites.
- Thanks to my mentor, [Oluwaseun Owonikoko](https://github.com/seunkoko)
- Thanks to all members of the Code Institute Slack workspace