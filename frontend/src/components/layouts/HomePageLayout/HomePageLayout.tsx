import react from 'react';
import { Box, Heading, Stack } from '@chakra-ui/react';
import { ThemedLinkButton } from '../../ui/ThemedButtons/ThemedButtons';

type HomePageLayoutProps = {

}
const HomePageLayout = ({}: HomePageLayoutProps) => {

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
                    maxWidth={'270px'}/>
            </Box>
        </Stack>
    );
}

export default HomePageLayout;