import ListNFTModal from '../../ui/ListNFTModal/ListNFTModal';
import react, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
import {
    Box,
    ButtonGroup,
    Grid,
    GridItem,
    Heading,
    Image,
    Stack,
    Text,
    useDisclosure
    } from '@chakra-ui/react';
import { FormConfirmationModal, FormSubmitButton } from '../../ui/StyledFormFields/StyledFormFields';
import { getNFTbyItemId, NFTMarketItem, purchaseNFT } from '../../../services/marketplace_contract';
import { parseNFTPageURL, URL_TOKEN_ID_LENGTH } from '../../../services/nftUrls';
import { useParams } from 'react-router';

type NFTPageLayoutProps = {
    ethToUsdRate: number| null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void,
    address: string
}

const NFTPageLayout = ({
    ethToUsdRate,
    isLoadingEthRate,
    updateEthRate,
    address
}: NFTPageLayoutProps) => {
    // Gets NFT id from url
    const {ids} = useParams<'ids'>();
    const [isLoading, setIsLoading] = useState(false);
    const [nft, setNft] = useState<NFTMarketItem | null>(null);
    const [isPendingPurchase, setIsPendingPurchase] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    const {isOpen: isListModalOpen, onOpen: onListModalOpen, onClose: onListModalClose} = useDisclosure();
    const {isOpen: isUnlistConfirmModalOpen, onOpen: onUnlistConfirmModalOpen, onClose: onUnlistConfirmModalClose} = useDisclosure();

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
            loadNFT(parsedUrl.tokenId, parsedUrl.itemId);
        }
    }, [ids]);

    // Determines if user owns this NFT
    useEffect(() => {
        if(nft === null || address === null) {
            setIsOwned(false);
        } else {
            setIsOwned(nft.owner.toLowerCase() === address.toLowerCase());
        }
    }, [nft, address]);

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
            <GridItem colSpan={2} pt={6} pb={4}>
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
                {nft.isListed && !isOwned && (
                    <Box w={'50%'} maxW={'600px'} mx={'auto'}>
                        <FormSubmitButton isLoading={isPendingPurchase} label={'Purchase'} 
                            onClick={submitPurchase} textHoverColor={BACKGROUND_COLOR} />
                    </Box>
                )}

                {/* List Button */}
                {!nft.isListed && isOwned && (
                    <Box w={'50%'} maxW={'600px'} mx={'auto'}>
                        <FormSubmitButton isLoading={false} label={'List NFT'} 
                            onClick={onListModalOpen} textHoverColor={BACKGROUND_COLOR} />
                    </Box>
                )}

                {/* Owner Edit Listing Button */}
                {nft.isListed && isOwned && (
                    <ButtonGroup width={'80%'} maxW={'800px'} spacing={4}>
                        <FormSubmitButton isLoading={false} label={'Cancel Listing'} 
                                onClick={onUnlistConfirmModalOpen} textHoverColor={BACKGROUND_COLOR}
                                backgroundColor={'#FF6A4A'} />
                        <FormSubmitButton isLoading={false} label={'Edit Listing'} 
                            onClick={onListModalOpen} textHoverColor={BACKGROUND_COLOR} />
                    </ButtonGroup>
                )}
                
            </GridItem>
            
            {/* List Modal */}
            <ListNFTModal isOpen={isListModalOpen} onClose={onListModalClose} ethToUsdRate={ethToUsdRate}
                isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate} 
                listingInfo={{itemId: nft.itemId, tokenId: nft.tokenId}} />
            {/* Edit Modal */}
            <ListNFTModal isOpen={isListModalOpen} onClose={onListModalClose} ethToUsdRate={ethToUsdRate}
                isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate} isEditForm={true}
                listingInfo={{itemId: nft.itemId, tokenId: nft.tokenId}} defaultPrice={nft.price} />
            {/* Unlist Confirmation Modal */}
            <FormConfirmationModal isOpen={isUnlistConfirmModalOpen} onClose={onUnlistConfirmModalClose} 
                header={'Confirm Listing Removal'} submitButtonOnClick={() => {}}
                confrimationDialog={`Once an NFT is unlisted, paying ETH will be required to relist.`} />
        </Grid>
    );
}

export default NFTPageLayout;