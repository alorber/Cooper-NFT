import React from 'react';
import {
    Box,
    Heading,
    HStack,
    Image,
    Stack,
    Text
    } from '@chakra-ui/react';

type NFTCardLayoutProps = {

}

const NFTCard = ({}: NFTCardLayoutProps) => {
    return (
        <Box w="300px" rounded="20px" overflow="hidden" 
                bg={ "gray.200" } mt={10}>
            <Image src= "https://static01.nyt.com/images/2013/02/16/nyregion/JP-COOPER/JP-COOPER-superJumbo.jpg" 
                boxSize="300px" objectFit={'contain'} backgroundColor='gray.400' />
            <Box p={5}>
                <Stack>
                    <Heading size={'md'} textAlign='center'>
                        Title
                    </Heading>
                    <Text as='i' textAlign='center' >
                        Creator
                    </Text> 
                </Stack>
                <HStack alignSelf={'flex-start'} mt={2} mb={6}>
                    <Stack w='50%' alignSelf={'flex-start'} >
                        <Text textAlign='start' >
                            100 ETH
                        </Text>
                        <Text textAlign='start' >
                            Roughly $300
                        </Text>
                    </Stack>
                    <Stack w='50%' alignSelf={'center'}>
                        <Text textAlign='center' pl={10}>
                            Favorite Icon Here
                        </Text>
                    </Stack>
                </HStack>
            </Box>
        </Box>
    );
}

export default NFTCard;