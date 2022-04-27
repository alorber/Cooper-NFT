import react, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { parseNFTPageURL } from '../../../services/nftUrls';

type NFTPageLayoutProps = {

}

const NFTPageLayout = ({}: NFTPageLayoutProps) => {
    // Gets NFT id from url
    const {ids} = useParams<'ids'>();
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [itemId, setItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        }
        
        setIsLoading(false);
    }, [ids]);

    return (
        <>Token ID: {tokenId}, itemId: {itemId}</>
    );
}

export default NFTPageLayout;