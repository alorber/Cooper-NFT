// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CU_NFT is ERC1155, AccessControl {
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

    constructor() ERC1155("ipfs://f0{id}") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(_COOPER, _msgSender());
        _setupRole(_ADMIN, _msgSender());
        _setRoleAdmin(_ADMIN, _COOPER);
        _setRoleAdmin(_CURRENT_STUDENT, _ADMIN);
        _setRoleAdmin(_PREVIOUS_STUDENT, _ADMIN);
    }

    // Makes AccessControl play nice with ERC1155
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // ------ Role Functions ------

    // Adds current student
    function addStudent(address student) public virtual {
        require(hasRole(_ADMIN, _msgSender()), "Must be an marketplace admin to set student role");

        grantRole(_CURRENT_STUDENT, student);
    }

    // Changes current student to previous student
    function expireStudent(address student) public virtual {
        require(hasRole(_ADMIN, _msgSender()), "Must be an marketplace admin to set student role");

        revokeRole(_CURRENT_STUDENT, student);
        grantRole(_PREVIOUS_STUDENT, student);
    }

    // Completely removes student from system
    function removeStudent(address student) public virtual {
        require(hasRole(_ADMIN, _msgSender()), "Must be an marketplace admin to set student role");

        revokeRole(_CURRENT_STUDENT, student);
    }

    // Adds marketplace admin
    function addAdmin(address admin) public virtual {
        require(hasRole(_COOPER, _msgSender()), "Must be an admin to set admin role");

        grantRole(_ADMIN, admin);
    }

    // Removes marketplace admin
    function removeAdmin(address admin) public virtual {
        require(hasRole(_COOPER, _msgSender()), "Must be an admin to set admin role");

        revokeRole(_ADMIN, admin);
    }

    // Change Cooper account
    function updateCooperRole(address newOwner) public virtual {
        require(hasRole(_COOPER, _msgSender()), "Must be Cooper to transfer marketplace ownership");
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "Must be marketplace owner to transfer ownership");

        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        grantRole(_COOPER, newOwner);

        revokeRole(_COOPER, _msgSender());
        revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    // ------ Overriding uri function for IPFS ------

    // From https://forum.openzeppelin.com/t/erc1155-uri-function-doesnt-use-the-tokenid/4500/24
    bytes16 private constant _HEX_SYMBOLS = "0123456789abcdef";
    function uint2hexstr(uint256 value) public pure returns (string memory) {
        uint length = 64;
        bytes memory bstr = new bytes(length+2);

        for (uint256 i = length + 1; i > 1; --i) {
            bstr[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(bstr);
    }

    function uri(uint256 _tokenID) override public view returns (string memory) {
    
        string memory hexstringtokenID;
        hexstringtokenID = uint2hexstr(_tokenID);
    
        return string(
            abi.encodePacked(
                "ipfs://f0",
                hexstringtokenID,
                ".json"
            )
        );
    }

    // ------ Minting ------

    function mint(address to, uint256 id, uint256 amount) public virtual {
        require(hasRole(_CURRENT_STUDENT, _msgSender()), "Must be a current student to mint");

        _mint(to, id, amount, "");
    }

    

}