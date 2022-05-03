import react, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
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
import { getNFTbyItemId, NFTMarketItem, purchaseNFT } from '../../../services/marketplace_contract';
import { parseNFTPageURL, URL_TOKEN_ID_LENGTH } from '../../../services/nftUrls';
import { useParams } from 'react-router';

type NFTPageLayoutProps = {
    ethToUsdRate: number| null,
    address: string
}

const NFTPageLayout = ({ethToUsdRate, address}: NFTPageLayoutProps) => {
    // Gets NFT id from url
    const {ids} = useParams<'ids'>();
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [itemId, setItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nft, setNft] = useState<NFTMarketItem | null>(null);
    const [isPendingPurchase, setIsPendingPurchase] = useState(false);

    // Loads NFT
    const loadNFT = async (tokenId: string, itemId: string) => {
        const nftResp = await getNFTbyItemId(itemId);
        if(nftResp.status === "Success") {
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

    // Purchases NFT
    const submitPurchase = async () => {
        if(nft == null) {
            return;
        }

        setIsPendingPurchase(true);
        await purchaseNFT(nft.itemId, nft.tokenId, nft.price);
        setIsPendingPurchase(false);
    }

    return isLoading ? (
        <Heading>Loading...</Heading>
    ) : nft == null ? (
        <Heading>Unable to load NFT. Try again later.</Heading>
    ) : (
        <Grid templateColumns={'repeat(2,auto)'} w='100%' maxW={'2000px'} pt={14} px={6} pb={6}
                style={{marginLeft: 'auto', marginRight: 'auto'}}>
            {/* NFT Image */}
            <GridItem colSpan={[2,2,1,1]} justifySelf='center'>
                <Image borderRadius={5} src={URL.createObjectURL(nft.file)}
                    alt={nft.name} width={["20em","20em","24em", "35em", "40em"]} 
                    fit="contain" maxW={"1200px"} />
            </GridItem>

            {/* Title & Description */}
            <GridItem colSpan={[2,2,1,1]} justifySelf='center' px={10} pt={[6,6,0,0]}>
                <Stack alignItems={'center'} h='100%' justifyContent={'center'}
                        spacing={6}>
                    <Heading>
                        {nft.name}
                    </Heading>
                    <Heading size={'md'} display={{base: 'none', xl: 'block'}}>
                        {nft.description}
                    </Heading>
                </Stack>
            </GridItem>
            {/* Description on smaller screens */}
            <GridItem colSpan={2} justifySelf='center' display={{base: 'block', xl: 'none'}} px={10} pt={6}>
                <Heading size={'md'} textAlign={'justify'}>
                    {nft.description}
                </Heading>
            </GridItem>

            {/* Owner & Price */}
            <GridItem colSpan={2} pt={6}>
                <Stack spacing={6}>
                    <Text>
                        <b>{nft.isListed ? ('Listed By') : 'Owner'}:</b> {nft.owner}
                    </Text>
                    {nft.isListed && (
                       <Text textAlign='center' >
                            <b>Sale Price:</b> {nft.price} ETH {ethToUsdRate != null && 
                                (<i>(~ ${Math.round(nft.price * ethToUsdRate * 100) / 100})</i>)}
                        </Text> 
                    )}        
                </Stack>
            </GridItem>

            <GridItem colSpan={2} mt={6}>
                {/* Purchase Button */}
                {nft.isListed && nft.owner !== address && (
                    <Box w={'50%'} maxW={'600px'} mx={'auto'}>
                        <FormSubmitButton isLoading={isPendingPurchase} label={'Purchase'} 
                            onClick={submitPurchase} textHoverColor={BACKGROUND_COLOR} />
                    </Box>
                )}

                {/* List Button */}
                {!nft.isListed && nft.owner === address && (
                    <></>
                )}

                {/* Owner Edit Listing Button */}
                {nft.isListed && nft.owner === address && (
                    <></>
                )}
                
            </GridItem>
        </Grid>
    );
}

export default NFTPageLayout;