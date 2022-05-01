import react from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
import { Heading, HStack, Spinner } from '@chakra-ui/react';

type LoadingTextProps = {
    loadingText: string,
    textColor?: string,
    textSize?: 'xl' | 'lg' | 'md'
    marginTop?: number
}
const LoadingText = ({loadingText, textColor, textSize, marginTop}: LoadingTextProps) => {
    return (
        <HStack w={'100%'} justifyContent={'center'} mt={marginTop}>
            <Heading size={textSize || 'md'} color={textColor || BACKGROUND_COLOR} pr={2}>
                {loadingText}
            </Heading>
            <Spinner color={textColor || BACKGROUND_COLOR} />
        </HStack>
    )
}

export default LoadingText;