import react, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    GridItem,
    Heading,
    Image,
    Stack,
    Text
    } from '@chakra-ui/react';
import { FormSubmitButton } from '../../ui/StyledFormFields/StyledFormFields';
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
        setIsLoading(false);
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
    }, [ids]);

    return isLoading ? (
        <Heading>Loading...</Heading>
    ) : nft == null ? (
        <Heading>Unable to load NFT. Try again later.</Heading>
    ) : (
        <Grid templateColumns={'repeat(2,auto)'} w='100%' mt={4} p={6}>
            {/* NFT Image */}
            <GridItem colSpan={[2,2,1,1]} justifySelf='center'>
                <Image borderRadius={5} src={URL.createObjectURL(nft.file)}
                    alt={nft.name} width={["20em","20em","24em", "30em", "40em"]} 
                    fit="contain" maxW={"1200px"} />
            </GridItem>

            {/* Title & Description */}
            <GridItem colSpan={[2,2,1,1]}>
                <Stack alignItems={'center'} h='100%' justifyContent={'center'}
                        spacing={6}>
                    <Heading>
                        {nft.name}
                    </Heading>
                    <Text>
                        {nft.description}
                    </Text>
                </Stack>
            </GridItem>

            {/* Owner */}
            <GridItem colSpan={[2,2,1,1]} mt={6}>
                <Text>
                    {nft.owner}
                </Text>
            </GridItem>

            {/* Price */}
            <GridItem colSpan={[2,2,1,1]} mt={6}>
                Price Here
            </GridItem>

            {/* Purchase Button */}
            <GridItem colSpan={2} mt={6}>
                <Box w={'50%'} maxW={'600px'} mx={'auto'}>
                    <FormSubmitButton isLoading={false} label={'Purchase'} />
                </Box>
            </GridItem>
        </Grid>
    );
}

export default NFTPageLayout;