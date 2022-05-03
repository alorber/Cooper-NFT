import ListNFTModal from '../ListNFTModal/ListNFTModal';
import react from 'react';
import { IconButton, Tooltip, useDisclosure } from '@chakra-ui/react';
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
        <ListNFTModal isOpen={isOpen} onClose={onClose} ethToUsdRate={ethToUsdRate}
            isLoadingEthRate={isLoadingEthRate} updateEthRate={updateEthRate} listingInfo={listingInfo}
            updateNftList={updateNftList} />
    </>)
}

export default NFTCardListButton;
