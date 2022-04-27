import react, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getNFTbyItemId } from '../../../services/marketplace_contract';
import { parseNFTPageURL } from '../../../services/nftUrls';

type NFTPageLayoutProps = {

}

const NFTPageLayout = ({}: NFTPageLayoutProps) => {
    // Gets NFT id from url
    const {ids} = useParams<'ids'>();
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [itemId, setItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const printNft = async (itemId: string) => {
        const nftResp = await getNFTbyItemId(itemId);
        if(nftResp.status === "Failure") {
            console.log("ERROR: ", nftResp.error);
        } else {
            console.log(nftResp.nftMarketItem);
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
            
            printNft(parsedUrl.itemId);
        }
        
        setIsLoading(false);
    }, [ids]);

    return (
        <>Token ID: {tokenId}, itemId: {itemId}</>
    );
}

export default NFTPageLayout;