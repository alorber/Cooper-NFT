import LoadingText from '../LoadingText/LoadingText';
import react, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
import { BACKGROUND_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import {
    Box,
    Heading,
    HStack,
    Image,
    Link,
    Stack,
    useBreakpointValue
    } from '@chakra-ui/react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { Link as RouterLink } from 'react-router-dom';
import './imageCarousel.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export type CarouselNFT = {
    nftImage: string,
    nftPageUrl: string
}

export type ImageCarouselProps = {
    title: string
    nftsList: CarouselNFT[],
    isLoading?: boolean
};

const ImageCarousel = ({title, nftsList, isLoading = false}: ImageCarouselProps) => {
    const numImages = useBreakpointValue({base: 1, md: 2, lg: 3, xl: 4});
    const [carouselNFTsList, setCarouselNFTsList] = useState<CarouselNFT[]>([]);
    const sliderRef = useRef<Slider>(null);

    // // On load, appends list to itself to deal with looping.
    useEffect(() => {
        setCarouselNFTsList(nftsList);
    }, [nftsList]);
    
    return (
        <Stack spacing={4} style={{marginTop: '3em'}} p={10} backgroundColor={MID_SHADE_COLOR}>
            <Heading size={'lg'} color={BACKGROUND_COLOR} mb={4}>
                {title}
            </Heading>
            {isLoading ? (
                <LoadingText loadingText='Loading Recent NFTs' />
            ) : nftsList.length === 0 ? (
                <Heading size={'md'} color={BACKGROUND_COLOR} pr={2}>
                        Unable to Load Recent NFTs
                </Heading>
            ) : (
                <HStack w={'100%'} justifyContent='center'>
                <CarouselArrowButton type="Left" onClick={sliderRef.current?.slickPrev} />
                    <Box w={'80%'} overflow='hidden'>
                        <Slider slidesToShow={numImages} draggable={false} autoplay arrows={false} ref={sliderRef}>
                            {carouselNFTsList.map((nft) => 
                                <RouterLink to={`/nft/${nft.nftPageUrl}`} key={nft.nftPageUrl}>
                                    <Image src={nft.nftImage} maxH={'250px'} borderRadius={15} objectFit='contain' />
                                </RouterLink>  
                            )}
                        </Slider> 
                    </Box>
                    <CarouselArrowButton type={'Right'} onClick={sliderRef.current?.slickNext} />
                </HStack>
            )}
        </Stack>
    );
}

export default ImageCarousel;

/**
 * Arrow buttons for carousel
 */
type CarouselArrowButtonProps = {
    type: 'Right' | 'Left',
    onClick?: () => void
}

const CarouselArrowButton = ({type, onClick}: CarouselArrowButtonProps) => {
    return (
        <Link w='fit-content' onClick={onClick} m={4}>
            {type === 'Left' ? <BsChevronLeft size={24} color={BACKGROUND_COLOR} />: <BsChevronRight size={24} color={BACKGROUND_COLOR} />}
        </Link>
    );
}