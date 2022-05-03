import ModalForm from '../ModalForm/ModalForm';
import react, { useEffect, useState } from 'react';
import { ETH_PRECISION, listNFT } from '../../../services/marketplace_contract';
import {
    Flex,
    Modal,
    Stack,
    Text,
    useDisclosure
    } from '@chakra-ui/react';
import {
    FormConfirmationModal,
    FormIconButton,
    FormNumberInput,
    FormSubmitButton
    } from '../StyledFormFields/StyledFormFields';

export type ListNFTModalProps = {
    isOpen: boolean,
    onClose: () => void,
    ethToUsdRate: number | null,
    isLoadingEthRate: boolean,
    updateEthRate: () => void,
    listingInfo: {itemId: string, tokenId: string},
    updateNftList: () => void
}

const ListNFTModal = ({
    isOpen,
    onClose,
    ethToUsdRate,
    isLoadingEthRate,
    updateEthRate,
    listingInfo,
    updateNftList
}: ListNFTModalProps) => {
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
        <ModalForm isOpen={isOpen} onClose={onClose} headerText={'List NFT on Marketplace'}
            modalBody={
                <Stack>
                    {/* Price Field in ETH */}
                    <FormNumberInput value={salePrice} label={"Price"} type='ETH' step={.002} isRequired
                        onChange={(val) => {setSalePrice(typeof val === 'number' ?  val : parseFloat(val))}} 
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
            } isCentered={true} modalFooter={
                <FormSubmitButton isLoading={isLoading} label={'List NFT'} isDisabled={salePrice === null}
                    onClick={() => {onClose(); onConfirmationModalOpen()}} />
            } />
        {/* Confirmation Modal */}
        <FormConfirmationModal isOpen={isConfirmationModalOpen} onClose={onConfirmationModalClose} header={'Confirm Submission'}
            confrimationDialog={'Once an NFT is listed, paying ETH will be required to unlist or edit.'} submitButtonOnClick={listNFTOnMarketplace} />
    </>);
}

export default ListNFTModal;