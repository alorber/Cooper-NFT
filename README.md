###### NFT Marketplace for The Cooper Union

## Table of Contents
1. [Introduction](#introduction)

2. [Project Description](#project-description)

    a. [Tech Stack](#tech-stack)
    
    b. [Role System](#role-system)
    
    c. [Royalties](#royalties)

    d. [IPFS](#ipfs)
    
    e. [MetaMask](#metamask)
    
3. [Features](#features)

    c. [Backend](#backend)
  
    c. [Frontend](#frontend)

3. [Future Work](#future-work)

4. [How to Run](#how-to-run)

## Introduction

<p align="justify">
&emsp; Building a reputation early is extremely important for all aspiring artists. However, in order to do so while still in school, students would need to produce artwork to meet fair and museum schedules while also completing their regular coursework. This overload of work is not sustainable for most full-time students and can lead to negative consequences, including burnout. Yet, if students wait until graduation to begin entering the industry, they will likely have a period of minimal income, as they create art and wait for sales to increase. Lack of income combined with a possible debt from student loans can form a massive barrier of entry for recent graduates. Therefore, a solution is needed that would allow students to begin exposing themselves to the industry on their schedule, while also fulfilling their own responsibilities and coursework.</br>
&emsp; One such solution is a digital NFT marketplace, which allows artists to create unique digital artworks and sell them online. However, while students could list on such marketplaces, their art would be hidden amongst thousands of more well-known digital artists. For this reason, we wish to create a Cooper Union NFT marketplace with the sole purpose of giving Cooper Union artists a platform on which their art can be seen and purchased.</br>
&emsp; The purpose of this project was to develop an Ethereum-based NFT marketplace following the ERC-1155 token standard. The marketplace would restrict minting to Cooper Union students alone and would be driven by the Cooper Union name brand. This proof-of-concept would display the possibilities of applying an NFT marketplace to an academic institution and would initiate conversations within Cooper Union on its development.

The full project paper can be read [here]().
</p>

## Project Description

### Tech Stack

<p align="justify">
The marketplace was developed on the Ethereum blockchain using the <a href="https://docs.soliditylang.org/en/v0.8.13/">Solidity</a> language, the <a href="https://eips.ethereum.org/EIPS/eip-1155">ERC1155 token standard</a>, and the <a href="https://eips.ethereum.org/EIPS/eip-2981">EIP2981 royalty standard</a>. NFTs are stored on <a href="https://ipfs.io/">IPFS</a>, <a href="https://metamask.io/">MetaMask</a> is used to interact with users' Ethereum wallets, and the frontend was developed in <a href="https://reactjs.org/">React</a>.
</p>

<p align="center">
  <img alt="Profile Page, Profile View" src="https://user-images.githubusercontent.com/13024480/168460639-692eb268-d0ce-4837-9552-bf2580270e56.png">
</p>
  
### Role System

<p align="justify">
&emsp; The core feature of this marketplace is the restriction of minting art to current students. This is accomplished through a system of account roles built into the marketplace smart contract, which is implemented using <a href="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl">OpenZeppelin’s AccessControl library</a>. Users are not required to have a role, but the available roles are: Cooper Union, Admin, Current Student, and Previous Student.</br> 
&emsp; The Cooper Union role is automatically assigned to the account that deploys the marketplace contract. This account, presumably run by Cooper Union administration, would have control over main aspects of the marketplace; currently, this is limited to the marketplace transaction fee, but more customizability could be added in the future as required. The marketplace owner also has the ability to assign the Admin role to other accounts; these admin accounts would be responsible for validating students, assigning them the Current Student role, and changing the role to Previous Student upon graduation. Realistically, these admins would be Cooper Union administrators working in tandem with the registrar. Current students have the ability to mint new artwork, while previous students have no distinct functionality, but are tracked in case future features require it. All accounts, though, including those without a specified role, have the ability to purchase art on the marketplace and resell all owned art.
</p>
  
<p align="center">
  <img width="500px" alt="Profile Page, Profile View" src="https://user-images.githubusercontent.com/13024480/168460754-9e5b09b0-adce-4eef-a39f-06d2c26a4348.png">
</p>

### Royalties

<p align="justify">
&emsp; Another essential feature of the marketplace is creator royalties; when an NFT is resold, a percentage of the sale price is paid to the creator of the NFT, or another Ethereum wallet of their choosing. This functionality is accomplished by implementing the EIP-2981 NFT Royalty Standard in the NFT smart contract. When a creator mints a new piece of artwork, they may specify a royalty percentage up to fifteen percent as well as the desired royalty receiver; these fields cannot be changed and are stored within the NFT smart contract, where they can be requested by any marketplace implementing this royalty standard. Therefore, since most marketplaces are adopting EIP-2981, NFTs minted and sold on the Cooper NFT Marketplace can be integrated into the wider Ethereum marketplace network.
</p>

### IPFS

<p align="justify">
&emsp; While NFTs can be stored on the blockchain itself, this can become prohibitively expensive as each byte of data used incurs a fee. A more common approach, which is implemented in this project, is storing the NFT elsewhere and storing a hash of the token address on the blockchain. At first glance, this may appear less secure, but platforms exist that solve these issues. The system used in this project, and promoted by Ethereum, is <a href="https://ipfs.io/">InterPlanetary File System (IPFS)</a>.</br>
&emsp; IPFS is a distributed system for storing and accessing files, websites, applications, and data. The two main features of IPFS are decentralization and content addressing. Files are stored across all nodes participating in the system, allowing for data resiliency, so if a server goes down, the token will not be lost. Additionally, tokens are addressed by hashes of the content contained. Therefore, the address for a given block of data, or token, will never change, and if the content of the data changes, it will be given a new address. Meaning, once an IPFS address is stored on the blockchain, the content it references cannot be modified or tampered with.</br>
&emsp; The pipeline for minting an NFT on this marketplace is as follows: Once the necessary information is acquired, the file or artwork is uploaded to IPFS. IPFS, as described above, will return a content id (CID) referring to the file. This CID is packaged with other information to create the NFT metadata, which is then uploaded to IPFS. The CID referring to the metadata is passed to the NFT contract where it is used as the token ID of the newly minted NFT.</br>
&emsp; For the purposes of this project, <a href="https://infura.io/">Infura</a> was used to access IPFS. Infura is a platform that provides dedicated IPFS nodes for blockchain-based applications; testing of the marketplace did not reach the threshold of Infura’s free tier, but constant access from the Cooper Union student body most likely would. Therefore, if this project is further developed upon and ultimately deployed, Cooper Union would benefit from hosting their own IPFS node, which they could use to store all NFTs listed on their marketplace. 
</p>

### MetaMask

<p align="justify">
&emsp; Many choices exist for connecting Ethereum wallets to marketplaces, but one of the most popular options, which is used in this project, is <a href="https://metamask.io/">MetaMask</a>. MetaMask is a crypto wallet browser extension that allows users to link their Ethereum wallets with websites. Wallets, on this marketplace and most others, act as a user’s unique identifier and account. Once linked, this marketplace will have the ability to initiate Ethereum transactions on behalf of the user, which must then be accepted and paid for through MetaMask; no transaction can occur without the user explicitely accepting. In order to access any account-based functionality, including viewing owned NFTs and purchasing NFTs, users would have to connect their MetaMask wallet. 
</p>

