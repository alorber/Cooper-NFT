import react, { useEffect, useState } from 'react';
import { ETH_PRECISION, listNFT } from '../../../services/marketplace_contract';
import {
    Flex,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    Tooltip,
    useDisclosure
    } from '@chakra-ui/react';
import { FormConfirmationModal, FormIconButton, FormNumberInput, FormSubmitButton } from '../StyledFormFields/StyledFormFields';
import { MdOutlineSell } from 'react-icons/md';

export type NFTCardListButtonProps = {
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void,
    listingInfo: {itemId: string, tokenId: string},
    updateNftList: () => void
}

const NFTCardListButton = ({ethToUsdRate, isLoadingEthRate, updateEthRate, listingInfo, updateNftList}: NFTCardListButtonProps) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    return (<>
        <Tooltip label={'List NFT on marketplace'} placement='top' hasArrow>
            <IconButton aria-label='List NFT' w='fit-content' borderRadius={'full'}
                icon={<MdOutlineSell />} boxShadow='sm' backgroundColor={'white'}
                _hover={{boxShadow: 'md'}} _active={{boxShadow: 'lg'}} 
                _focus={{outline: "none"}} onClick={onOpen} />
        </Tooltip>
        <NFTCardListModal isOpen={isOpen} onClose={onClose} ethToUsdRate={ethToUsdRate}
            isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate} listingInfo={listingInfo}
            updateNftList={updateNftList} />
    </>)
}

/**
 * Modal for listing NFT
 */
type NFTCardListModalProps = {
    isOpen: boolean,
    onClose: () => void,
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void,
    listingInfo: {itemId: string, tokenId: string},
    updateNftList: () => void
}
const NFTCardListModal = ({
    isOpen,
    onClose,
    ethToUsdRate,
    isLoadingEthRate,
    updateEthRate,
    listingInfo,
    updateNftList
}: NFTCardListModalProps) => {
    const [salePrice, setSalePrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Min value for price field
    const [minEth, setMinEth] = useState<number>(.00001);
    // Updates minimum possible ETH value (~ 1 cent)
    useEffect(() => {
        setMinEth(ethToUsdRate !== null ? (.015 / ethToUsdRate): .00001);
    }, [ethToUsdRate]);

    // Confirmation Modal
    const {
        isOpen: isConfirmationModalOpen,
        onOpen: onConfirmationModalOpen,
        onClose: onConfirmationModalClose
    } = useDisclosure();

    // Lists NFT
    const listNFTOnMarketplace = async () => {
        if(salePrice === null) {return}
        
        setIsLoading(true);
        const {itemId, tokenId} = listingInfo;
        await listNFT(itemId, tokenId, salePrice);
        setIsLoading(false);
        updateNftList();
    }

    return (<>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    List NFT on Marketplace
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody mb={6}>
                    <Stack>
                        {/* Price Field in ETH */}
                        <FormNumberInput value={salePrice} label={"Price"} type='ETH' step={.002} isRequired
                            onChange={(val) => {setSalePrice(typeof val === 'number' ?  val : parseInt(val))}} 
                            min={minEth} precision={ETH_PRECISION} />
                        {/* Conversion to USD */}
                        {salePrice != null && ethToUsdRate !== null && (
                            <Flex alignItems='center'>
                                <Text as='i' mr={2}>Roughly {salePrice * ethToUsdRate} USD</Text>
                                <FormIconButton iconType='Refresh' ariaLabel='ETH Refresh' message='Refresh ETH <-> USD Rate' 
                                    onClick={updateEthRate} isLoading={isLoadingEthRate} />
                            </Flex>
                        )}
                        <FormSubmitButton isLoading={isLoading} label={'List NFT'} isDisabled={salePrice === null}
                            onClick={() => {onClose(); onConfirmationModalOpen()}} />
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
        
        {/* Confirmation Modal */}
        <FormConfirmationModal isOpen={isConfirmationModalOpen} onClose={onConfirmationModalClose} header={'Confirm Submission'}
            confrimationDialog={'Once an NFT is listed, paying ETH will be required to unlist or edit.'} submitButtonOnClick={listNFTOnMarketplace} />
    </>);
}

export default NFTCardListButton;
