// Creates test data for NFT listings

import { NFTMarketItem } from "./marketplace_contract"

export const generateTestData = async (numEntries = 20) => {
    const nftList: NFTMarketItem[] = [];
    const randNum = Math.random();
    for(let i = 0; i < numEntries; i++) {
        nftList.push({
            name: `Cooper Union #${i}`,
            description: `Image of The Cooper Union #${i}`,
            file: await getTestFile(),
            itemId: `iid#${i}`,
            tokenId: `tid#${i}`,
            owner: `Cooper_Student`,
            isListed: true,
            price: Math.random() * (randNum > .75 ? 10 : randNum < .25 ? .1 : 1)
        })
    }
    return {nftList: nftList};
}

const getTestFile = async () => {
    const IMAGE_URL = "https://static01.nyt.com/images/2013/02/16/nyregion/JP-COOPER/JP-COOPER-superJumbo.jpg";
    const fileResp = await fetch(IMAGE_URL);
    const data = await fileResp.blob();
    return new File([data], 'Cooper_Image', {
        type: 'image/jpeg'
    });
}
