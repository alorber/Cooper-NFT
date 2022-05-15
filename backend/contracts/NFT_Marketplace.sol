// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./CU_NFT.sol";

contract NFT_Marketplace is Ownable, ERC1155Holder, AccessControl {
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

    // ------ Roles ------
    // Cooper: Can add / remove admins
    bytes32 public constant _COOPER = keccak256("_COOPER");
    // Admins: Can add / remove / expire students
    bytes32 public constant _ADMIN = keccak256("_ADMIN");
    // Current Students: Can mint tokens & list on marketplace
    bytes32 public constant _CURRENT_STUDENT = keccak256("_CURRENT_STUDENT");
    // Previous Students: Cannot list on marketplace, but can still get royalties
    bytes32 public constant _PREVIOUS_STUDENT = keccak256("_PREVIOUS_STUDENT");

    // Custom error for fetching functions
    error invalidItemId();

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        uint256 timeBought;
        uint256 timeListed;
    }

    event MarketItemCreated (
        uint256 indexed itemId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        uint256 timeBought,
        uint256 timeListed
    );

    constructor(address nftContract) {
        _feeRecipient = payable(owner());
        _nftContract = nftContract;

        // Sets role hierarchy
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(_COOPER, _msgSender());
        _setupRole(_ADMIN, _msgSender());
        _setRoleAdmin(_ADMIN, _COOPER);
        _setRoleAdmin(_CURRENT_STUDENT, _ADMIN);
        _setRoleAdmin(_PREVIOUS_STUDENT, _ADMIN);
    }

    // Makes AccessControl play nice with ERC1155
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Receiver, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ------ Role Functions ------

    // Adds current student
    function addStudent(address[] calldata students) external virtual onlyRole(_ADMIN) {
        for(uint i = 0; i < students.length; i++) {
            grantRole(_CURRENT_STUDENT, students[i]);
        }
    }

    // Changes current student to previous student
    function expireStudent(address[] calldata students) external virtual onlyRole(_ADMIN) {
        for(uint i = 0; i < students.length; i++) {
            revokeRole(_CURRENT_STUDENT, students[i]);
            grantRole(_PREVIOUS_STUDENT, students[i]);
        }
    }

    // Completely removes student from system (used if student is added in error)
    function removeStudent(address[] calldata students) external virtual onlyRole(_ADMIN) {
        for(uint i = 0; i < students.length; i++) {
            revokeRole(_CURRENT_STUDENT, students[i]);
        }
    }

    // Adds marketplace admin
    function addAdmin(address[] calldata admins) external virtual onlyRole(_COOPER) {
        for(uint i = 0; i < admins.length; i++) {
            grantRole(_ADMIN, admins[i]);
        }
    }

    // Removes marketplace admin
    function removeAdmin(address[] calldata admins) external virtual onlyRole(_COOPER) {
        for(uint i = 0; i < admins.length; i++) {
            revokeRole(_ADMIN, admins[i]);
        }
    }

    // Change Cooper account
    function updateCooperRole(address newOwner) external virtual onlyRole(_COOPER) onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        grantRole(_COOPER, newOwner);

        revokeRole(_COOPER, _msgSender());
        revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // Gets account's role(s)
    function getContractRoles(address account) external view virtual returns (uint8) {
        // Roles are return as 4 bits
        // 1 in a given spot means account has been assigned that role
        // Roles, in order of bit, are: COOPER   ADMIN   CURRENT_STUDENT   PREVIOUS_STUDENT
        uint8 roles = 0;

        // Checks Cooper role
        if(hasRole(_COOPER, account)) {
            roles = roles | 8;
        }

        // Checks Admin role
        if(hasRole(_ADMIN, account)) {
            roles = roles | 4;
        }

        // Checks Current Student role
        if(hasRole(_CURRENT_STUDENT, account)) {
            roles = roles | 2;
        }

        // Checks Previous Student role
        if(hasRole(_PREVIOUS_STUDENT, account)) {
            roles = roles | 1;
        }

        return roles;
    }

    // ------ Marketplace Functions ------

    // Updates the listing fee of the contract
    function updateListingFee(uint _listingFee) external payable onlyRole(_COOPER) {
        listingFee = _listingFee;
    }

    // Returns the listing fee of the contract
    function getListingFee() external view returns (uint256) {
        return listingFee;
    }

    // Creates Market Item - Mints NFT & adds to system
    // If price is > 0 wei, will list also
    function mintAndCreateMarketItem(address nftOwner, uint256 tokenId, address royaltyRecipient, 
            uint96 royaltyValue, uint256 price, uint256 boughtTimestamp, uint256 listedTimeStamp) public onlyRole(_CURRENT_STUDENT) {
        // Mints token (gives ownership to marketplace, if being listed)
        CU_NFT(_nftContract).mint(price > 0 ? address(this) : nftOwner, tokenId, 1, royaltyRecipient, royaltyValue);
        
        // Determines if item is being listed
        if(price > 0) {
            // Lists on marketplace
            _createMarketItem(tokenId, _msgSender(), address(this), price, false, boughtTimestamp, listedTimeStamp);
        } else {
            // Adds token to system, but doesn't list
            _createMarketItem(tokenId, address(0), _msgSender(), 0, true, boughtTimestamp, 0);
            _itemsSold.increment();
        }
    }

    // Internal function to create market item (doesn't list)
    function _createMarketItem(
        uint256 tokenId, address seller, address owner, uint256 price, 
        bool isSold, uint256 boughtTimestamp, uint256 listedTimeStamp
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
                isSold,
                boughtTimestamp,
                listedTimeStamp
        );
        
        emit MarketItemCreated(
                itemId,
                tokenId,
                payable(seller),
                payable(owner),
                price,
                isSold,
                boughtTimestamp,
                listedTimeStamp
        );
    }

    // List marketplace item on marketplace
    function listMarketItem(uint256 marketItemId, uint256 tokenId, uint256 price, uint256 listedTimeStamp
    ) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");
        // Confirms item is being listed by seller
        require(idToMarketItem[marketItemId].owner == msg.sender, "Only item owner can perform this operation");

        // Gives marketplace approval to transfer token
        CU_NFT(_nftContract).setApproval(msg.sender);

        // Updates contract
        idToMarketItem[marketItemId].sold = false;
        idToMarketItem[marketItemId].price = price;
        idToMarketItem[marketItemId].seller = payable(msg.sender);
        idToMarketItem[marketItemId].owner = payable(address(this));
        idToMarketItem[marketItemId].timeListed = listedTimeStamp;
        _itemsSold.decrement();

        // Transfers token to marketplace
        IERC1155(_nftContract).safeTransferFrom(msg.sender, address(this), tokenId, 1, '');
    }

    // Edits market item listing
    function editMarketItemListing(uint256 marketItemId, uint256 tokenId, uint256 price, uint256 listedTimeStamp) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");
        // Confirms item is being edited by owner
        require(idToMarketItem[marketItemId].seller == msg.sender, "Only item owner can perform this operation");

        idToMarketItem[marketItemId].price = price;
        idToMarketItem[marketItemId].timeListed = listedTimeStamp;
    }

    // Unlists market item
    function unlistMarketItem(uint256 marketItemId, uint256 tokenId) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");
        // Confirms item is listed
        require(idToMarketItem[marketItemId].owner == address(this), "Item is not currently listed on marketplace");
        // Confirms item is being unlisted by owner
        require(idToMarketItem[marketItemId].seller == msg.sender, "Only item owner can perform this operation");

        // Updates contract
        idToMarketItem[marketItemId].owner = idToMarketItem[marketItemId].seller;
        idToMarketItem[marketItemId].sold = true;
        idToMarketItem[marketItemId].seller = payable(address(0));
        idToMarketItem[marketItemId].timeListed = 0;
        _itemsSold.increment();

        // Transfers ownership of NFT back to owner
        IERC1155(_nftContract).safeTransferFrom(address(this), idToMarketItem[marketItemId].owner, tokenId, 1, '');
    }

    // Creates sale
    function createMarketSale(uint256 marketItemId, uint256 tokenId, uint256 boughtTimeStamp) external payable {
        // Checks that Ids are correct
        require(idToMarketItem[marketItemId].tokenId == tokenId, "Ids do not match a listing");

        uint256 price = idToMarketItem[marketItemId].price;
        address seller = idToMarketItem[marketItemId].seller;
        // Confirms correct price was paid
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        
        // Pays listing fee to marketplace owner
        uint256 messageFunds = msg.value;
        uint fee = _calculateFee(price);
        payable(_feeRecipient).transfer(fee);
        messageFunds -= fee;
        // Pays royalties
        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(_nftContract).royaltyInfo(tokenId, price);
        payable(royaltyReceiver).transfer(royaltyAmount);
        messageFunds -= royaltyAmount;
        // Pays remaining money to seller
        payable(seller).transfer(messageFunds);
        // Transfers ownership of NFT to buyer
        IERC1155(_nftContract).safeTransferFrom(address(this), msg.sender, tokenId, 1, '');

        // Updates contract
        idToMarketItem[marketItemId].owner = payable(msg.sender);
        idToMarketItem[marketItemId].sold = true;
        idToMarketItem[marketItemId].seller = payable(address(0));
        idToMarketItem[marketItemId].timeBought = boughtTimeStamp;
        idToMarketItem[marketItemId].timeListed = 0;
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

    // Gets NFTs owned by user (listed & unlisted)
    function fetchMyNFTs() external view returns (MarketItem[] memory) {
        uint totalItemCount = _marketItemId.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender || idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender || idToMarketItem[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Gets single NFT by itemID
    function fetchNFTByItemId(uint256 itemId) external view returns (MarketItem memory) {
        uint totalItemCount = _marketItemId.current();
        
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i+1].itemId == itemId) {
                return idToMarketItem[i+1];
            }
        }

        // None found
        revert invalidItemId();
    }

    // Calculates listing fee given price
    function _calculateFee(uint256 price) internal view returns (uint256) {
        return ((listingFee / 10000) * price);
    }
}
