import { BigNumber } from 'ethers';

/**
 * Functions to generate and decode individual NFT page URLs
 */


/**
 * URLs will be the first URL_TOKEN_ID_LENGTH characters of the base16
 *   tokenId followed by the base16 itemId.
 * 
 * ItemIds are all unique, but adding the tokenId will add a layer of error detection.
 */
export const URL_TOKEN_ID_LENGTH = 12

// Generates link to individual NFT page
export const generateNFTPageURL = (tokenId: string, itemId: string) =>{
    const encodedTokenId = BigNumber.from(tokenId)._hex.substring(2, 3 + URL_TOKEN_ID_LENGTH);
    const encodedItemId = BigNumber.from(itemId)._hex.substring(2);
    const url = `${encodedTokenId}${encodedItemId}`;
    return url;
}

// Splits URL into Ids
export const parseNFTPageURL = (url: string) => {
    const tokenId = url.substring(0, URL_TOKEN_ID_LENGTH);
    const itemId = url.substring(URL_TOKEN_ID_LENGTH);
    return {tokenId: tokenId, itemId: itemId};
}