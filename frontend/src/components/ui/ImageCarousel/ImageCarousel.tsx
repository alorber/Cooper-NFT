import react, { useEffect, useState } from 'react';
import {
    Heading,
    HStack,
    Image,
    Stack,
    useBreakpointValue
    } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export type CarouselNFT = {
    nftImage: string,
    nftPageUrl: string
}

export type ImageCarouselProps = {
    title: string
    carouselNFTsList: CarouselNFT[]
};

const ImageCarousel = ({title, carouselNFTsList}: ImageCarouselProps) => {
    const numImages = useBreakpointValue({base: 1, md: 2, lg: 3, xl: 4});
    const [nftStartInd, setNftStartInd] = useState(0);
    const [nftEndInd, setNftEndInd] = useState(numImages);

    // Updates number images
    useEffect(() => {
        setNftEndInd(nftStartInd + (numImages || 1));
    }, [numImages]);
    
    return (
        <Stack spacing={8} pt={12}>
            <Heading size={'lg'}>
                {title}
            </Heading>
            <HStack w='100%' justifyContent={'center'}>
                <HStack w='80%' justifyContent='center' alignContent={'center'}>
                    {carouselNFTsList.slice(nftStartInd, nftEndInd).map((nft) => 
                        <RouterLink to={nft.nftPageUrl}>
                            <Image src={nft.nftImage} maxW={300} borderRadius={5} objectFit='contain' key={nft.nftPageUrl} />
                        </RouterLink>  
                    )}
                </HStack>
            </HStack>
        </Stack>
    );
}

export default ImageCarousel;