import react from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { MdOutlineSell } from 'react-icons/md';

export type NFTCardListButtonProps = {

}

const NFTCardListButton = ({}: NFTCardListButtonProps) => {

    return (
        <Tooltip label={'List NFT on marketplace'} placement='top' hasArrow>
            <IconButton aria-label='List NFT' w='fit-content' borderRadius={'full'}
                icon={<MdOutlineSell />} boxShadow='sm' backgroundColor={'white'}
                _hover={{boxShadow: 'md'}} _active={{boxShadow: 'lg'}} 
                _focus={{outline: "none"}} />
        </Tooltip>
    )
}

export default NFTCardListButton;
