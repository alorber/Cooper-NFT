import react, { useEffect, useState } from 'react';
import { getNFTbyItemId, NFTMarketItem } from '../../../services/marketplace_contract';
import { parseNFTPageURL, URL_TOKEN_ID_LENGTH } from '../../../services/nftUrls';
import { useParams } from 'react-router';

type NFTPageLayoutProps = {

}

const NFTPageLayout = ({}: NFTPageLayoutProps) => {
    // Gets NFT id from url
    const {ids} = useParams<'ids'>();
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [itemId, setItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nft, setNft] = useState<NFTMarketItem | null>(null);

    // Loads NFT
    const loadNFT = async (tokenId: string, itemId: string) => {
        const nftResp = await getNFTbyItemId(itemId);
        if(nftResp.status === "Success") {
            console.log(nftResp.nftMarketItem)
            // Confirms that token Ids match
            if(nftResp.nftMarketItem.tokenId.substring(2, 2 + URL_TOKEN_ID_LENGTH) !== tokenId) {
                console.log('ERROR: Token Ids Do Not Match');
            } else {
                setNft(nftResp.nftMarketItem);
            }
        } else {
            console.log("ERROR: ", nftResp.error);
        }
    }

    // Parses url on load
    useEffect(() => {
        setIsLoading(true);

        if(ids == null) {
            // TODO: Redirect to error page
            console.log('Could not load nft');
        } else {
            const parsedUrl = parseNFTPageURL(ids);
            setTokenId(parsedUrl.tokenId);
            setItemId(parsedUrl.itemId);
            
            loadNFT(parsedUrl.tokenId, parsedUrl.itemId);
        }
        
        setIsLoading(false);
    }, [ids]);

    return (
        <>Token ID: {tokenId}, itemId: {itemId}</>
    );
}

export default NFTPageLayout;