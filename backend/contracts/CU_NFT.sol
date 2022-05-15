// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./NFT_Marketplace.sol";

contract CU_NFT is ERC1155, ERC2981 {
    // ------ Token IDs ------
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Marketplace contract address and authorization modifier
    address private _marketplaceContract;

    modifier onlyMarketplace {
        require(_msgSender() == _marketplaceContract, "Mint can only be called by the marketplace");
        _;
    }

    modifier onlyCooper {
        if(_marketplaceContract != address(0)) {
            require((NFT_Marketplace(_marketplaceContract).getContractRoles(_msgSender()) & 8) == 8,
                "Must be Cooper Union to access this functionality"); 
        }        
        _;
    }

    constructor() ERC1155("ipfs://f0{id}") {
        // Sets default royalty to be 5% to Cooper
        _setDefaultRoyalty(_msgSender(), 500);
    }

    // Makes EIP2981 play nice with ERC1155
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Sets marketplace address
    function setMarketplaceAddress(address marketplace) external virtual onlyCooper {
        _marketplaceContract = marketplace;
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