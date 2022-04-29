import react, { useEffect, useState } from 'react';
import { ETH_PRECISION } from '../../../services/marketplace_contract';
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
import { FormIconButton, FormNumberInput } from '../StyledFormFields/StyledFormFields';
import { MdOutlineSell } from 'react-icons/md';

export type NFTCardListButtonProps = {
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void
}

const NFTCardListButton = ({ethToUsdRate, isLoadingEthRate, updateEthRate}: NFTCardListButtonProps) => {
    const {isOpen, onOpen, onClose} = useDisclosure();

    return (<>
        <Tooltip label={'List NFT on marketplace'} placement='top' hasArrow>
            <IconButton aria-label='List NFT' w='fit-content' borderRadius={'full'}
                icon={<MdOutlineSell />} boxShadow='sm' backgroundColor={'white'}
                _hover={{boxShadow: 'md'}} _active={{boxShadow: 'lg'}} 
                _focus={{outline: "none"}} onClick={onOpen} />
        </Tooltip>
        <NFTCardListModal isOpen={isOpen} onClose={onClose} ethToUsdRate={ethToUsdRate}
            isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate} />
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
    updateEthRate: () => void
}
const NFTCardListModal = ({
    isOpen,
    onClose,
    ethToUsdRate,
    isLoadingEthRate,
    updateEthRate
}: NFTCardListModalProps) => {
    const [salePrice, setSalePrice] = useState<number | null>(null);

    // Min value for price field
    const [minEth, setMinEth] = useState<number>(.00001);
    // Updates minimum possible ETH value (~ 1 cent)
    useEffect(() => {
        setMinEth(ethToUsdRate !== null ? (.015 / ethToUsdRate): .00001);
    }, [ethToUsdRate]);

    return (
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
                </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default NFTCardListButton;
