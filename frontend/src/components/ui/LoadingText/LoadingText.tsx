import react from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
import { Heading, HStack, Spinner } from '@chakra-ui/react';

type LoadingTextProps = {
    textColor?: string
}
const LoadingText = ({textColor}: LoadingTextProps) => {
    return (
        <HStack w={'100%'} justifyContent={'center'}>
            <Heading size={'md'} color={textColor || BACKGROUND_COLOR} pr={2}>
                Loading Recent NFTs
            </Heading>
            <Spinner color={textColor || BACKGROUND_COLOR} />
        </HStack>
    )
}

export default LoadingText;