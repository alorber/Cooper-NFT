import ImageCarousel, { CarouselNFT } from '../../ui/ImageCarousel/ImageCarousel';
import react, { useEffect, useState } from 'react';
import { AiOutlinePicture } from 'react-icons/ai';
import {
    Box,
    ButtonGroup,
    Heading,
    Stack,
    Text
    } from '@chakra-ui/react';
import { generateNFTPageURL } from '../../../services/nftUrls';
import { getRecentNFTListings } from '../../../services/marketplace_contract';
import { IoStorefront } from 'react-icons/io5';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { MID_SHADE_COLOR } from '../../../COLORS';
import { ThemedLinkButton, ThemedToggleButton } from '../../ui/ThemedButtons/ThemedButtons';

const CENTER_STYLING = {marginLeft: 'auto', marginRight: 'auto'};

type HomePageLayoutProps = {

}
const HomePageLayout = ({}: HomePageLayoutProps) => {
    const [nftList, setNftList] = useState<CarouselNFT[]>([]);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

    const getNFTs = async () => {
        setIsLoadingNFTs(true);
        const recentNFTsResp = await getRecentNFTListings();
        if(recentNFTsResp.status === "Success") {
            const carouselList: CarouselNFT[] = recentNFTsResp.nftMarketItems.map((nft) => ({
                nftImage: URL.createObjectURL(nft.file),
                nftPageUrl: generateNFTPageURL(nft.tokenId, nft.itemId)
            }));
            setNftList(carouselList);
        }
        setIsLoadingNFTs(false);
    }

    useEffect(() => {
        getNFTs();
    }, []);

    return (
        <Stack pt={6} pb={20}>
            <Heading>
                For the Advancement of Science and Art
            </Heading>
            <Heading size='lg' pt={6}>
                Explore the Cooper Union Student-Made NFT Collection
            </Heading>
            <Box w='100%' justifyContent={'center'} pt={6}>
                <ThemedLinkButton label={'Discover New Art'} routeTo='/explore' 
                    width={['fit-content', 'fit-content', '20%']} borderRadius={20} maxWidth={'270px'} />
            </Box>
            <ImageCarousel title='Recent Listing' nftsList={nftList} isLoading={isLoadingNFTs} />
            <HowItWorksSection />
        </Stack>
    );
}

export default HomePageLayout;

const iconProps = {color: MID_SHADE_COLOR, size: '2em', style: CENTER_STYLING};
const HowItWorksSection = () => {
    const [userTypeToggle, setUserTypeToggle] = useState<"Student" | "Buyer">("Student");

    return (
        <Stack pt={8} spacing={6}>
            <Heading size={'lg'}>
                How It Works
            </Heading>
            <ButtonGroup spacing={0} style={CENTER_STYLING} w={'12em'}>
                <ThemedToggleButton label='Student' onClick={() => {setUserTypeToggle('Student')}} width='50%'
                    active={userTypeToggle === 'Student'} locationInGroup={'Left'} buttonRounding='2xl'/>
                <ThemedToggleButton label='Buyer' onClick={() => {setUserTypeToggle('Buyer')}} width='50%'
                    active={userTypeToggle === 'Buyer'} locationInGroup={'Right'} buttonRounding='2xl'/>
            </ButtonGroup>
            <Stack maxW={1300} w={'100%'} style={CENTER_STYLING} spacing={6} direction={{base: 'column', md: 'row'}}>
                <SubtitledIcon subtitle='Connect Your MetaMask Wallet' 
                    icon={<MdAccountBalanceWallet {...iconProps} />} />
                <SubtitledIcon icon={<AiOutlinePicture {...iconProps} />}
                    subtitle={userTypeToggle === "Student" ? 'Create NFTs from your artwork' : 
                        'Browse student-made NFTs' }/>
                <SubtitledIcon icon={<IoStorefront {...iconProps} />}
                    subtitle={userTypeToggle === "Student" ? 'List your NFTs on the marketplace' : 
                        'Purchase an NFT from the marketplace'  } />
            </Stack>
        </Stack>
    )
}

// How It Works Step - Icon & Text Group
type SubtitledIconProps = {
    icon: React.ReactNode,
    subtitle: string
}
const SubtitledIcon = ({icon, subtitle}: SubtitledIconProps) => {
    return (
        <Stack style={CENTER_STYLING} w="33.33%">
            {icon}
            <Text>
                {subtitle}
            </Text>
        </Stack>
    );
}