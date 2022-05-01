import react, { useEffect, useRef, useState } from 'react';
import Slider from 'react-slick';
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
    nftsList: CarouselNFT[]
};

const ImageCarousel = ({title, nftsList}: ImageCarouselProps) => {
    const numImages = useBreakpointValue({base: 1, md: 2, lg: 3, xl: 4});
    const [carouselNFTsList, setCarouselNFTsList] = useState<CarouselNFT[]>([]);
    const sliderRef = useRef<Slider>(null);

    // // On load, appends list to itself to deal with looping.
    useEffect(() => {
        setCarouselNFTsList(nftsList);
    }, [nftsList]);
    
    return (
        <Stack spacing={8} pt={12}>
            <Heading size={'lg'}>
                {title}
            </Heading>
            <HStack w={'100%'} justifyContent='center'>
                <CarouselArrowButton type="Left" onClick={sliderRef.current?.slickPrev} />
                <Box w={'80%'} overflow='hidden'>
                    <Slider slidesToShow={numImages} draggable={false} arrows={false} autoplay ref={sliderRef}>
                        {carouselNFTsList.map((nft) => 
                            <RouterLink to={nft.nftPageUrl} key={nft.nftPageUrl}>
                                <Image src={nft.nftImage} maxH={'250px'} borderRadius={15} objectFit='contain' />
                            </RouterLink>  
                        )}
                    </Slider> 
                </Box>
                <CarouselArrowButton type={'Right'} onClick={sliderRef.current?.slickNext} />
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
    onClick?: () => void
}

const CarouselArrowButton = ({type, onClick}: CarouselArrowButtonProps) => {
    return (
        <Link w='fit-content' onClick={onClick} m={4}>
            {type === 'Left' ? <BsChevronLeft size={24} />: <BsChevronRight size={24}/>}
        </Link>
    );
}