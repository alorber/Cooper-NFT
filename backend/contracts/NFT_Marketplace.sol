// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "./CU_NFT.sol";
import "hardhat/console.sol";

contract NFT_Marketplace is Ownable, ERC1155Holder {
    // Counters for IDs
    using Counters for Counters.Counter;
    Counters.Counter private _marketItemId;
    Counters.Counter private _itemsSold;

    // Listing fee is percentage of sale price (10000 = 100%)
    uint256 listingFee = 250;
    // Account that receives the listing fee
    address payable private _feeRecipient;
    // Address of NFT Contract [In constructor for testing - in future will be preset]
    address private _nftContract;
    // Maps ItemIds to market items
    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated (
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    modifier onlyStudent {
        require((CU_NFT(_nftContract).getContractRoles(_msgSender()) & 2) == 2, "Must be current student to mint");
        _;
    }

    constructor(address nftContract) {
        _feeRecipient = payable(owner());
        _nftContract = nftContract;
    }

    // Updates the listing fee of the contract
    function updateListingFee(uint _listingFee) external payable onlyOwner() {
        listingFee = _listingFee;
    }

    // Returns the listing fee of the contract
    function getListingFee() external view returns (uint256) {
        return listingFee;
    }

    // Creates Market Item - Mints NFT & adds to system
    // If price is > 0 wei, will list also
    function mintAndCreateMarketItem(address nftOwner, uint256 tokenId, address royaltyRecipient, 
            uint96 royaltyValue, uint256 price) public onlyStudent {
        // Mints token (gives ownership to marketplace, if being listed)
        CU_NFT(_nftContract).mint(price > 0 ? address(this) : nftOwner, tokenId, 1, royaltyRecipient, royaltyValue);
        
        // Determines if item is being listed
        if(price > 0) {
            // Lists on marketplace
            _createMarketItem(tokenId, _msgSender(), address(this), price, false);
        } else {
            // Adds token to system, but doesn't list
            _createMarketItem(tokenId, address(0), _msgSender(), 0, true);
            _itemsSold.increment();
        }
    }

    // Internal function to create market item (doesn't list)
    function _createMarketItem(
        uint256 tokenId, address seller, address owner, uint256 price, bool isSold
    ) internal {
        // Get new item ID
        _marketItemId.increment();
        uint256 itemId = _marketItemId.current();

        // Create market item
        idToMarketItem[itemId] =  MarketItem(
                itemId,
                tokenId,
                payable(seller),
                payable(owner),
                price,
                isSold
        );
        
        emit MarketItemCreated(
                itemId,
                tokenId,
                payable(seller),
                payable(owner),
                price,
                isSold
        );
    }

    // List marketplace item on marketplace
    function listMarketItem(uint256 marketItemId, uint256 tokenId, uint256 price) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");
        // Confirms item is being listed by seller
        require(idToMarketItem[tokenId].owner == msg.sender, "Only item owner can perform this operation");

        // Updates contract
        idToMarketItem[marketItemId].sold = false;
        idToMarketItem[marketItemId].price = price;
        idToMarketItem[marketItemId].seller = payable(msg.sender);
        idToMarketItem[marketItemId].owner = payable(address(this));
        _itemsSold.decrement();

        // Transfers token to marketplace
        ERC1155(_nftContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, '');
    }

    // Creates sale
    function createMarketSale(uint256 marketItemId, uint256 tokenId) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");

        uint256 price = idToMarketItem[marketItemId].price;
        address seller = idToMarketItem[marketItemId].seller;
        // Confirms correct price was paid
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        
        // Pays listing fee to marketplace owner
        uint fee = _calculateFee(price);
        payable(_feeRecipient).transfer(fee);
        // Pays royalties
        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(_nftContract).royaltyInfo(tokenId, price);
        payable(royaltyReceiver).transfer(royaltyAmount);
        // Pays remaining money to seller
        payable(seller).transfer(msg.value);

        // Transfers ownership of NFT to buyer
        ERC1155(_nftContract).safeTransferFrom(address(this), msg.sender, tokenId, 1, '');

        // Updates contract
        idToMarketItem[marketItemId].owner = payable(msg.sender);
        idToMarketItem[marketItemId].sold = true;
        idToMarketItem[marketItemId].seller = payable(address(0));
        _itemsSold.increment();
    }

    // Gets all active marketplace listings
    function fetchMarketItems() external view returns (MarketItem[] memory) {
        uint itemCount = _marketItemId.current();
        uint unsoldItemCount = _marketItemId.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Gets NFTs owned by user (unlisted)
    function fetchMyNFTs() external view returns (MarketItem[] memory) {
        uint totalItemCount = _marketItemId.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Gets NFTs listed by user
    function fetchItemsListed() external view returns (MarketItem[] memory) {
        uint totalItemCount = _marketItemId.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Calculates listing fee given price
    function _calculateFee(uint256 price) internal view returns (uint256) {
        return ((listingFee / 10000) * price);
    }
}
