import react, { useEffect, useState } from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import {
    Heading,
    HStack,
    Image,
    Link,
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
    nftsList: CarouselNFT[]
};

const ImageCarousel = ({title, nftsList}: ImageCarouselProps) => {
    const numImages = useBreakpointValue({base: 1, md: 2, lg: 3, xl: 4});
    const [nftStartInd, setNftStartInd] = useState(0);
    const [nftEndInd, setNftEndInd] = useState(numImages ?? 1);
    const [carouselNFTsList, setCarouselNFTsList] = useState<CarouselNFT[]>([]);

    // On load, appends list to itself to deal with looping.
    useEffect(() => {
        setCarouselNFTsList(nftsList.concat(nftsList));
    }, [nftsList]);

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
                <CarouselArrowButton type='Left' startInd={nftStartInd} endInd={nftEndInd}
                    setStartInd={setNftStartInd} setEndInd={setNftEndInd} numNFTs={nftsList.length} />
                <HStack w='80%' justifyContent='center' alignContent={'center'}>
                    {carouselNFTsList.slice(nftStartInd, nftEndInd).map((nft) => 
                        <RouterLink to={nft.nftPageUrl} key={nft.nftPageUrl}>
                            <Image src={nft.nftImage} maxW={300} borderRadius={5} objectFit='contain' />
                        </RouterLink>  
                    )}
                </HStack>
                <CarouselArrowButton type='Right' startInd={nftStartInd} endInd={nftEndInd}
                    setStartInd={setNftStartInd} setEndInd={setNftEndInd} numNFTs={nftsList.length} />
            </HStack>
        </Stack>
    );
}

export default ImageCarousel;

/**
 * Arrow buttons for carousel
 */
type CarouselArrowButtonProps = {
    type: 'Right' | 'Left',
    startInd: number,
    endInd: number,
    setStartInd: (i: number) => void,
    setEndInd: (i: number) => void,
    numNFTs: number
}

const CarouselArrowButton = ({type, startInd, endInd, setStartInd, setEndInd, numNFTs}: CarouselArrowButtonProps) => {

    const leftMove = () => {
        let newStartInd = startInd - 1;
        let newEndInd = endInd - 1;

        if(newStartInd < 0) {
            newStartInd += numNFTs;
            newEndInd += numNFTs;
        }

        setStartInd(newStartInd);
        setEndInd(newEndInd);
    }

    const rightMove = () => {
        let newStartInd = startInd + 1;
        let newEndInd = endInd + 1;

        if(newStartInd > numNFTs) {
            newStartInd -= numNFTs;
            newEndInd -= numNFTs;
        }

        setStartInd(newStartInd);
        setEndInd(newEndInd);
    }

    return (
        <Link w='fit-content' onClick={type === 'Left' ? leftMove : rightMove}>
            {type === 'Left' ? <BsChevronLeft size={24} />: <BsChevronRight size={24}/>}
        </Link>
    );
}