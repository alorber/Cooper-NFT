import ImageCarousel, { CarouselNFT } from '../../ui/ImageCarousel/ImageCarousel';
import react, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
import { Box, Heading, Stack } from '@chakra-ui/react';
import { generateNFTPageURL } from '../../../services/nftUrls';
import { generateTestData } from '../../../services/testData';
import { ThemedLinkButton } from '../../ui/ThemedButtons/ThemedButtons';

type HomePageLayoutProps = {

}
const HomePageLayout = ({}: HomePageLayoutProps) => {
    const [nftList, setNftList] = useState<CarouselNFT[]>([]);

    const getNFTs = async () => {
        const testData = await generateTestData();
        const carouselList: CarouselNFT[] = testData.nftList.map((nft) => ({
            nftImage: URL.createObjectURL(nft.file),
            nftPageUrl: generateNFTPageURL(nft.tokenId, nft.itemId)
        }));
        setNftList(carouselList);
    }

    useEffect(() => {
        getNFTs()
    }, []);

    return (
        <Stack pt={6}>
            <Heading>
                For the Advancement of Science and Art
            </Heading>
            <Heading size='lg' pt={6}>
                Explore the Cooper Union Student-Made NFT Collection
            </Heading>
            <Box w='100%' justifyContent={'center'} pt={6}>
                <ThemedLinkButton label={'Discover New Art'} routeTo='/explore' 
                    width={['fit-content', 'fit-content', '20%']} borderRadius={20} 
                    maxWidth={'270px'} hoverTextColor={BACKGROUND_COLOR} />
            </Box>
            <ImageCarousel title='Recent Listing' nftsList={nftList} />
        </Stack>
    );
}

export default HomePageLayout;