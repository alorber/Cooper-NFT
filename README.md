###### NFT Marketplace for The Cooper Union

## Table of Contents
1. [Introduction](#introduction)
2. [Project Description](#project-description)  
    a. [Tech Stack](#tech-stack)  
    b. [Role System](#role-system)  
    c. [Royalties](#royalties)  
    d. [IPFS](#description-ipfs)  
    e. [MetaMask](#description-metamask)
3. [Features](#features)  
    a. [Backend](#features-backend)  
    b. [Frontend](#features-frontend)  
4. [Future Work](#future-work)
5. [How to Run](#how-to-run)  
    a. [Backend](#how-to-run-backend)  
    b. [MetaMask](#how-to-run-metamask)  
    c. [IPFS](#how-to-run-ipfs)  
    d. [Frontend](#how-to-run-frontend)

---

## Introduction

<p align="justify">
&emsp; Building a reputation early is extremely important for all aspiring artists. However, in order to do so while still in school, students would need to produce artwork to meet fair and museum schedules while also completing their regular coursework. This overload of work is not sustainable for most full-time students and can lead to negative consequences, including burnout. Yet, if students wait until graduation to begin entering the industry, they will likely have a period of minimal income, as they create art and wait for sales to increase. Lack of income combined with a possible debt from student loans can form a massive barrier of entry for recent graduates. Therefore, a solution is needed that would allow students to begin exposing themselves to the industry on their schedule, while also fulfilling their own responsibilities and coursework.</br></br>
&emsp; One such solution is a digital NFT marketplace, which allows artists to create unique digital artworks and sell them online. However, while students could list on such marketplaces, their art would be hidden amongst thousands of more well-known digital artists. For this reason, we wish to create a Cooper Union NFT marketplace with the sole purpose of giving Cooper Union artists a platform on which their art can be seen and purchased.</br></br>
&emsp; The purpose of this project was to develop an Ethereum-based NFT marketplace following the ERC-1155 token standard. The marketplace would restrict minting to Cooper Union students alone and would be driven by the Cooper Union name brand. This proof-of-concept would display the possibilities of applying an NFT marketplace to an academic institution and would initiate conversations within Cooper Union on its development.

The full project paper can be read [here]().
</p>

## Project Description

### Tech Stack

<p align="justify">
The marketplace was developed on the Ethereum blockchain using the <a href="https://docs.soliditylang.org/en/v0.8.13/">Solidity</a> language, the <a href="https://eips.ethereum.org/EIPS/eip-1155">ERC1155 token standard</a>, and the <a href="https://eips.ethereum.org/EIPS/eip-2981">EIP2981 royalty standard</a>. NFTs are stored on <a href="https://ipfs.io/">IPFS</a>, <a href="https://metamask.io/">MetaMask</a> is used to interact with users' Ethereum wallets, and the frontend was developed in <a href="https://reactjs.org/">React</a>.
</p>

<p align="center">
  <img alt="Tech Stack" width="650px" src="https://user-images.githubusercontent.com/13024480/168460639-692eb268-d0ce-4837-9552-bf2580270e56.png">
</p>
  
### Role System

<p align="justify">
&emsp; The core feature of this marketplace is the restriction of minting art to current students. This is accomplished through a system of account roles built into the marketplace smart contract, which is implemented using <a href="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl">OpenZeppelin’s AccessControl library</a>. Users are not required to have a role, but the available roles are: Cooper Union, Admin, Current Student, and Previous Student.</br></br> 
&emsp; The Cooper Union role is automatically assigned to the account that deploys the marketplace contract. This account, presumably run by Cooper Union administration, would have control over main aspects of the marketplace; currently, this is limited to the marketplace transaction fee, but more customizability could be added in the future as required. The marketplace owner also has the ability to assign the Admin role to other accounts; these admin accounts would be responsible for validating students, assigning them the Current Student role, and changing the role to Previous Student upon graduation. Realistically, these admins would be Cooper Union administrators working in tandem with the registrar. Current students have the ability to mint new artwork, while previous students have no distinct functionality, but are tracked in case future features require it. All accounts, though, including those without a specified role, have the ability to purchase art on the marketplace and resell all owned art.
</p>
  
<p align="center">
  <img width="500px" alt="Marketplace Role Hierarchy" src="https://user-images.githubusercontent.com/13024480/168460754-9e5b09b0-adce-4eef-a39f-06d2c26a4348.png">
</p>

### Royalties

<p align="justify">
&emsp; Another essential feature of the marketplace is creator royalties; when an NFT is resold, a percentage of the sale price is paid to the creator of the NFT, or another Ethereum wallet of their choosing. This functionality is accomplished by implementing the EIP-2981 NFT Royalty Standard in the NFT smart contract. When a creator mints a new piece of artwork, they may specify a royalty percentage up to fifteen percent as well as the desired royalty receiver; these fields cannot be changed and are stored within the NFT smart contract, where they can be requested by any marketplace implementing this royalty standard. Therefore, since most marketplaces are adopting EIP-2981, NFTs minted and sold on the Cooper NFT Marketplace can be integrated into the wider Ethereum marketplace network.
</p>

### IPFS <a name="description-ipfs"></a>

<p align="justify">
&emsp; While NFTs can be stored on the blockchain itself, this can become prohibitively expensive as each byte of data used incurs a fee. A more common approach, which is implemented in this project, is storing the NFT elsewhere and storing a hash of the token address on the blockchain. At first glance, this may appear less secure, but platforms exist that solve these issues. The system used in this project, and promoted by Ethereum, is <a href="https://ipfs.io/">InterPlanetary File System (IPFS)</a>.</br></br>
&emsp; IPFS is a distributed system for storing and accessing files, websites, applications, and data. The two main features of IPFS are decentralization and content addressing. Files are stored across all nodes participating in the system, allowing for data resiliency, so if a server goes down, the token will not be lost. Additionally, tokens are addressed by hashes of the content contained. Therefore, the address for a given block of data, or token, will never change, and if the content of the data changes, it will be given a new address. Meaning, once an IPFS address is stored on the blockchain, the content it references cannot be modified or tampered with.</br></br>
&emsp; The pipeline for minting an NFT on this marketplace is as follows: Once the necessary information is acquired, the file or artwork is uploaded to IPFS. IPFS, as described above, will return a content id (CID) referring to the file. This CID is packaged with other information to create the NFT metadata, which is then uploaded to IPFS. The CID referring to the metadata is passed to the NFT contract where it is used as the token ID of the newly minted NFT.</br></br>
&emsp; For the purposes of this project, <a href="https://infura.io/">Infura</a> was used to access IPFS. Infura is a platform that provides dedicated IPFS nodes for blockchain-based applications; testing of the marketplace did not reach the threshold of Infura’s free tier, but constant access from the Cooper Union student body most likely would. Therefore, if this project is further developed upon and ultimately deployed, Cooper Union would benefit from hosting their own IPFS node, which they could use to store all NFTs listed on their marketplace. 
</p>

### MetaMask <a name="description-metamask"></a>

<p align="justify">
&emsp; Many choices exist for connecting Ethereum wallets to marketplaces, but one of the most popular options, which is used in this project, is <a href="https://metamask.io/">MetaMask</a>. MetaMask is a crypto wallet browser extension that allows users to link their Ethereum wallets with websites. Wallets, on this marketplace and most others, act as a user’s unique identifier and account. Once linked, this marketplace will have the ability to initiate Ethereum transactions on behalf of the user, which must then be accepted and paid for through MetaMask; no transaction can occur without the user explicitely accepting. In order to access any account-based functionality, including viewing owned NFTs and purchasing NFTs, users would have to connect their MetaMask wallet. 
</p>

## Features

### Backend <a name="features-backend"></a>

<p align="justify">
&emsp; The backend of the marketplace consists of two Ethereum smart contracts; one smart contract controls the minting and ownership of NFTs, while the other contract runs the marketplace. Functionality of the marketplace contract includes: assigning roles; creating, editing, selling, and canceling market listings; and various methods to fetch desired information.
</p>

### Frontend <a name="features-frontend"></a>

<p align="justify">
&emsp; The marketplace frontend was developed with ReactJS and interacts with the Ethereum smart contracts using the <a href="https://docs.ethers.io/v5/">EthersJS</a> library. All pages of the marketplace are responsive to screen size and will work on mobile devices. Regardless of whether a user has connected a wallet or not, they will be able to access the home page, the about page, the explore page, and individual NFT pages.
</p>

#### Home Page

<p align="justify">
&emsp; When entering the site, users will be greeted with a home page containing a ‘Discover New Art’ button that redirects to the explore page, a carousel displaying recently listed NFTs, and basic information for sellers and buyers.
</p>

<p align="center">
  <img width="500px" alt="Home Page" src="https://user-images.githubusercontent.com/13024480/168486802-66ea23fb-e207-42ec-9c2c-ba4b26fa6378.png">
</p>

https://user-images.githubusercontent.com/13024480/168486708-e043828e-27e9-4a7a-81e0-f527957e0dff.mp4

#### Explore Page

<p align="justify">
&emsp; On the explore page, users can view all NFTs currently listed on the marketplace, displayed as a grid of NFT cards. Each NFT card displays the NFT image, which will enlarge on hover, the seller, the price in ETH, and an approximate price in USD, using a conversation rate from the Coinbase API. If a user has connected a wallet, they will be able to click on the heart icon to add the NFT to their favorites, so that it can be viewed at a later time on the favorites page.</br>
&emsp; Any page that displays NFTs, like the explore page, will contain a filter bar that allows the user to search NFT names and descriptions, or select a desired sort order; the possible fields to sort by are date listed and price, ascending and descending. Selecting the icon right of the sort selector will open a filters modal with more filter options depending on the page, and clicking the rightmost button will reset all filters.
</p>

<p align="center">
  <img width="500px" alt="Explore Page" src="https://user-images.githubusercontent.com/13024480/168486916-cdf8a405-26b5-4567-9089-00d6ad9ed713.png">
</p>

https://user-images.githubusercontent.com/13024480/168486921-269bb63a-9912-4e71-ab23-98ca62f8f82e.mp4

#### NFT Page

<p align="justify">
&emsp; If a user selects an NFT image, they will be redirected to that NFT’s page, which will display all information shown on the NFT card as well as the NFT’s description. The buttons, or actions, available on the individual NFT page will depend on if the user owns the given NFT. If the user does not own the viewed NFT, then it will be available to purchase; clicking the purchase button will open a prompt from MetaMask to accept the transaction and pay the desired sale price. If the user owns the NFT, then they will have access to a <i>cancel listing</i> button and an <i>edit listing</i> button, if listed, or a <i>list NFT</i> button if not listed.
</p>

<p align="center">
  <img width="500px" alt="NFT Page" src="https://user-images.githubusercontent.com/13024480/168486950-0c7047ba-739e-4409-b212-44bd7e54c047.png">
</p>

https://user-images.githubusercontent.com/13024480/168486959-4bc5e8ba-47e0-44e1-b0f8-625b478574df.mp4

#### Login Page

<p align="justify">
&emsp; If a user has not connected their MetaMask account, a login button will appear in the navbar and all attempts to access wallet-required pages will redirect to the login page. On the login page, if the user has installed the MetaMask browser, a button will appear that will open a MetaMask connection prompt; this MetaMask prompt will ask the user to select which wallets they would like to connect. If the user has not previously installed MetaMask, the page will supply a short description of the extension and offer a link to its download page.
</p>

https://user-images.githubusercontent.com/13024480/168487785-818fb892-6a96-46ce-8b4e-93560e177fd3.mp4

#### My NFTs Page

<p align="justify">
&emsp; Once a wallet is connected, users will be able to access the favorites page and the My NFTs page, which allow them to view NFTs they have favorited and NFTs they own, respectively. On the My NFTs page, users can toggle between viewing listed and unlisted NFT, as well as set a maximum and minimum price, through the filters modal.</br>
&emsp; If an NFT is unlisted, the NFT card will display a “List NFT” button instead of the price. Selecting this button will open a modal that will allow the user to easily list the NFT.
</p>

https://user-images.githubusercontent.com/13024480/168488239-f2243eb8-5b4a-41de-91b0-05e4ba2712a4.mp4


#### Create Page

<p align="justify">
&emsp; On the create page, if the current user has been assigned the student role, then the create NFT form will be displayed. This easy-to-use form will walk the user through submitting all the necessary information to mint an NFT of their artwork. At the top of the form, users can drag and drop a file or click on the box to open a file viewer. Once uploaded, a preview of the file will be displayed. Selecting the “What are Royalties?” button will open a modal containing a short description of marketplace royalties. It is possible to opt-out of royalties, if the user is not interested; however, if the user decides to add a royalty percentage, which maxes out at fifteen percent, they can select to send the royalties to their own wallet, to Cooper Union, or to a wallet they write in. Listing the to-be-minted NFT on the marketplace is opt-in. If the user opts not to list the NFT, it will be minted and added to their owned, and unlisted, NFTs; if the user adds a sale price, then the minted NFT will be immediately listed on the marketplace. Listing the NFT at the time of minting saves the user some gas fees as one less transaction is required.</br>
&emsp; If a non-student account attempts to mint an NFT, the page will instead display the option to request access. If selected, a modal will open requesting the student’s information, which would then be sent to the marketplace admins.
</p>

<p align="center">
  <img width="500px" alt="Create Page - NFT Form" src="https://user-images.githubusercontent.com/13024480/168488117-a87b0ecd-7f1c-491c-9a57-72532fbeb30e.png">
  <img width="300px" alt="Create Page - Request Access" src="https://user-images.githubusercontent.com/13024480/168488198-0e406d6b-e5bf-447c-acdf-a3d4091a8e4d.png">
</p>

https://user-images.githubusercontent.com/13024480/168488263-c4b5c4d1-269f-45b6-8916-447a0462ac06.mp4

https://user-images.githubusercontent.com/13024480/168488267-8b761810-e3f6-40df-9ad6-d2a1126f6685.mp4

#### Admin Page

<p align="justify">
&emsp; If the current user has been assigned as an admin, then they will have access to an admin page, which will appear in their navbar. This admin page would contain any settings relevant to admins, but at the moment only contains a form to update users’ roles. In this form, an admin can add as many valid wallet addresses, or accounts, as they wish, and the selector options will display all role-changing actions applicable to all wallet addresses given.
</p>

<p align="center">
  <img width="500px" alt="Admin Page - NFT Form" src="https://user-images.githubusercontent.com/13024480/168488343-fd7ae5ca-da6c-4cbd-a2dc-5bb6d83456bf.png">
</p>

https://user-images.githubusercontent.com/13024480/168488392-b922a4ff-852a-463d-90f5-3d2e87b33421.mp4

## Future Work

<p align="justify">
&emsp; Although the core implementation of the desired marketplace has been completed, there is still a lot more to accomplish. Future work on the current marketplace design would include fleshing out incomplete features and adding new ones that could not be completed in the allotted time. These additional features include user profiles, minting multiple NFTs in a single batch operation, minting fungible tokens with a specified edition size, auction style sales, listing end-times, favorited counter, and NFT collections. These features are similar to larger marketplaces and would greatly benefit this marketplace’s user experience.</br></br>
&emsp; The current design of the marketplace requires the user to pay for all minting. However, in a marketplace run by an academic institution, this would create an unfair advantage to wealthier students who can afford to list more artwork. Two possible solutions to this issue were discussed, along with their drawbacks. The first possibility was to have Cooper Union pay for all gas fees; the issue with this system, though, is that Cooper Union would want to confirm that the art they are paying for is actual art, and not someone attempting to mess with the system and waste money. Determining this, however, would require a staff member acting as a marketplace gatekeeper, approving NFTs they believe to be genuine, and a database to store the NFTs until they are approved and minted. Implementing this would require hiring someone for the gatekeeper position, as well as open up the school to issues with determining which art is truly genuine.</br></br>
&emsp; An alternative solution would be to have Cooper Union allot each student a specific minting allowance. No gatekeeper would be required, since students attempting to waste money would just be wasting their own. If this could be implemented within the smart contract, then the school wouldn’t need to be involved in the minting process other than supplying the funds. This is a promising solution, but would require significantly more discussion and thought before it would be approved by the school administration.</br></br>
&emsp; Connecting the marketplace to the institution’s website is another potential application of our project. The donation page could have a section to donate NFTs; these NFT would be sold on the marketplace and all proceeds and future royalties would go to Cooper Union.</br></br>
&emsp; Finally, the largest change that would need to be completed in the future, is moving the marketplace to an alternate blockchain. Throughout our discussions with students and faculty of the School of Art and Architecture, we received pushback for using the Ethereum blockchain, because of its environmental implications. Since this project was meant as a proof-of-concept to present to administration, Ethereum was chosen due to the abundance of documentation. However, if Cooper Union wishes to proceed with this marketplace, the smart contracts will need to be rewritten for a blockchain that better aligns with the institution's values.
</p>

## How to Run

##### This section will detail how the code can be run once the repository is cloned.

Both the frontend & backend use [NodeJS v16.13.0](https://nodejs.org/ko/blog/release/v16.13.0/) and the [Yarn Package Manager](https://yarnpkg.com/).

Ensure the correct version of Node is installed and active, and then use `yarn install` in each directory to install all dependencies.

### Backend <a name="how-to-run-backend"></a>

###### Run the following commands in the backend directory.

[Hardhat](https://hardhat.org/getting-started/) is used to compile, deploy, and test the Ethereum smart contracts.

In order to deploy a local Ethereum network node to test smart contracts on, run `npx hardhat node`. 
If successful, hardhat will print a series of test Ethereum wallets that can be imported into MetaMask.

Once the Ethereum node is set up, the contracts can be deployed with `npx hardhat run scripts/deploy.ts --network localhost`. 
This will run the deploy script and, if successful, will print the addresses of both contracts.

To allow the frontend to send requests to the smart contracts, create a file named *CONTRACT_ADDRESSES.ts* in the `frontend/src/services` directory and paste the following code, filling in the contract addresses printed by Hardhat.

```javaScript
// Blockchain Addresses for Smart Contracts

export const CU_NFT_ADDRESS = '0x#############################';
export const CU_MARKETPLACE_ADDRESS = '0x#############################';
```

### MetaMask <a name="how-to-run-metamask"></a>

To connect MetaMask to the test network, *Show Test Networks* will need to be enabled in **Settings -> Advanced**. Once enabled, use the network dropdown menu to select *Localhost 8545*. 

The test Ethereum wallets printed by Hardhat can now be added to MetaMask by selecting **Import Accounts** and pasting the private keys of the accounts desired. When testing, *Account 0* will be the account that deployed the contract and will be given the *Cooper Union* & *Admin* marketplace roles.

### IPFS <a name="how-to-run-ipfs"></a>

<a href="https://infura.io/">Infura</a> was used to access IPFS in this project. To connect this project to Infura, create an Infura account and a free-tier IPFS project. 

In the `frontend/src/services` directory, create a file named *IPFS_AUTH.ts* and paste the following code, filling in the project ID & secret:

```javaScript
// Project ID & Secret for Infura

export const IPFS_PROJECT_ID = '####################';
export const IPFS_PROJECT_SECRET = '####################';
```

### Frontend <a name="how-to-run-frontend"></a>

###### Run the following commands in the frontend directory.

Use `yarn start` to deploy the react server and start the frontend on *http://localhost:3000/*.
