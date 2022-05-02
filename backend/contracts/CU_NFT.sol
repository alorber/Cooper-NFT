// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "hardhat/console.sol";

contract CU_NFT is ERC1155, ERC2981, AccessControl {
    // ------ Token IDs ------
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // ------ Roles ------

    // Cooper: Can add / remove admins
    bytes32 public constant _COOPER = keccak256("_COOPER");
    // Admins: Can add / remove / expire students
    bytes32 public constant _ADMIN = keccak256("_ADMIN");
    // Current Students: Can mint tokens & list on marketplace
    bytes32 public constant _CURRENT_STUDENT = keccak256("_CURRENT_STUDENT");
    // Previous Students: Cannot list on marketplace, but can still get royalties
    bytes32 public constant _PREVIOUS_STUDENT = keccak256("_PREVIOUS_STUDENT");

    // Marketplace contract address and authorization modifier
    address private _marketplaceContract;

    modifier onlyMarketplace {
        require(_msgSender() == _marketplaceContract, "Mint can only be called by the marketplace");
        _;
    }

    constructor() ERC1155("ipfs://f0{id}") {
        // Sets role hierarchy
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(_COOPER, _msgSender());
        _setupRole(_ADMIN, _msgSender());
        _setRoleAdmin(_ADMIN, _COOPER);
        _setRoleAdmin(_CURRENT_STUDENT, _ADMIN);
        _setRoleAdmin(_PREVIOUS_STUDENT, _ADMIN);

        // Sets default royalty to be 5% to Cooper
        _setDefaultRoyalty(_msgSender(), 500);
    }

    // Makes AccessControl & ERC2981 play nice with ERC1155
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC2981, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Sets marketplace address
    function setMarketplaceAddress(address marketplace) external virtual onlyRole(_COOPER) {
        _marketplaceContract = marketplace;
    }

    // ------ Role Functions ------

    // Adds current student
    function addStudent(address student) external virtual onlyRole(_ADMIN) {
        grantRole(_CURRENT_STUDENT, student);
    }

    // Changes current student to previous student
    function expireStudent(address student) external virtual onlyRole(_ADMIN) {
        revokeRole(_CURRENT_STUDENT, student);
        grantRole(_PREVIOUS_STUDENT, student);
    }

    // Completely removes student from system
    function removeStudent(address student) external virtual onlyRole(_ADMIN) {
        revokeRole(_CURRENT_STUDENT, student);
    }

    // Adds marketplace admin
    function addAdmin(address admin) external virtual onlyRole(_COOPER) {
        grantRole(_ADMIN, admin);
    }

    // Removes marketplace admin
    function removeAdmin(address admin) external virtual onlyRole(_COOPER) {
        revokeRole(_ADMIN, admin);
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

    // ------ Overriding uri function for IPFS ------

    // From https://forum.openzeppelin.com/t/erc1155-uri-function-doesnt-use-the-tokenid/4500/24
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";
    function uint2hexstr(uint256 value) public pure returns (string memory) {
        uint length = 64;
        bytes memory bstr = new bytes(length+1);
        bstr[0] = 'f';

        for (uint256 i = length; i > 0; --i) {
            bstr[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(bstr);
    }

    function uri(uint256 _tokenID) override public pure returns (string memory) {
        string memory hexstringtokenID;
        hexstringtokenID = uint2hexstr(_tokenID);
    
        return string(hexstringtokenID);
    }

    // ------ Minting ------

    // Mints token and set royalty info
    // Royalty value is percentage of sale price (200 = 2%)
    function mint(address to, uint256 id, uint256 amount, address royaltyRecipient, 
            uint96 royaltyValue ) external virtual onlyMarketplace {
        _mint(to, id, amount, "");

        // Sets royalty (optional)
        if(royaltyRecipient != address(0)) {
            _setTokenRoyalty(id, royaltyRecipient, royaltyValue);
        }
    }

    // Gives marketplace approval to transfer tokens
    function setApproval(address ownerAddr) external virtual onlyMarketplace {
        _setApprovalForAll(ownerAddr, _marketplaceContract, true);
    }
}