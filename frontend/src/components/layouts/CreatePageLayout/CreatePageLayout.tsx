import LoadingText from '../../ui/LoadingText/LoadingText';
import NFTCreationForm from '../../ui/NFTCreationForm/NFTCreationForm';
import React, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR } from '../../../COLORS';
import { ContractRole } from '../../../services/nft_contract';
import {
    Flex,
    Heading,
    Stack,
    Text
    } from '@chakra-ui/react';
import { FormSubmitButton } from '../../ui/StyledFormFields/StyledFormFields';

type CreatePageLayoutProps = {
    metaMaskAddress: string | null,
    accountRoles: ContractRole[] | null,
    ethRateProps: {
        ethToUsdRate: number | null,
        isLoadingETHRate: boolean,
        updateEthRate: () => void
    }
}

const CreatePageLayout = ({metaMaskAddress, accountRoles, ethRateProps}: CreatePageLayoutProps) => {
    const [isStudent, setIsStudent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Checks if student on load
    useEffect(() => {
        setIsLoading(true);
        setIsStudent(accountRoles?.includes(ContractRole.CURRENT_STUDENT) ?? false);
        setIsLoading(false);
    }, [accountRoles]);

    return (
        <Stack spacing={8}>
            <Heading size={'xl'} mt={6}>Create a unique piece of digital artwork</Heading>
            <Heading size={'md'}>Turn your art into a one-of-a-kind NFT</Heading>

            {isLoading ? (
                <LoadingText loadingText='Determining Access...' textColor='black' textSize={'lg'} marginTop={4} />
            ) : isStudent && accountRoles !== null && metaMaskAddress !== null ? (
                <NFTCreationForm address={metaMaskAddress} {...ethRateProps} />
            ) : metaMaskAddress === null ? (
                <Text>You must be logged in to mint NFTs</Text>
            ) : (
                <Stack>
                    <Text>You must be a current student to mint NFTs.</Text>
                    <Text>If you believe you should have access, click the button below.</Text>
                    <Flex w={'30%'} alignSelf='center' pt={6}>
                        <FormSubmitButton isLoading={false} label={'Request Access'} onClick={() => {}} textHoverColor={BACKGROUND_COLOR} />
                    </Flex>
                    
                </Stack>
            )}
        </Stack>
    );
}

export default CreatePageLayout;