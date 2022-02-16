import React, { useEffect, useState } from 'react';
import UploadForm from '../../ui/UploadForm/UploadForm';
import {
    Box,
    Button,
    Flex,
    Heading,
    Stack,
    Text
    } from '@chakra-ui/react';
import {
    ContractRole,
    getContractRole,
    getMetaMaskWallet,
    watchMetaMask
    } from '../../../services/contracts';
import { FormErrorMessage } from '../../ui/StyledFormFields/StyledFormFields';

type FunctionalityTestLayoutProps = {

};

const FunctionalityTestLayout = ({}: FunctionalityTestLayoutProps) => {
    const [address, setAddress] = useState<string | null>(null);
    const [metaMaskError, setMetaMaskError] = useState<string | null>(null);
    const [accountContractRoles, setAccountContractRoles] = useState<ContractRole[] | null>(null);

    const loadWallet = async (request: boolean = true) => {
        const resp = await getMetaMaskWallet(request);

        if(resp.status === "Success") {
            // Address Found
            if(resp.address != null) {
                setAddress(resp.address);
                setMetaMaskError(null);

                // Get Account Role(s)
                const rolesResp = await getContractRole(resp.address);
                if(rolesResp.status === "Success") {
                    setAccountContractRoles(rolesResp.roles);
                }
            }
        } else {
            setMetaMaskError(resp.error);
        }
    }

    // Check for connected accounts
    useEffect(() => {
        loadWallet(false);
        watchMetaMask(setAddress);
    }, [])

    return (
        <Stack spacing={8}>
            {/* Connect to MetaMask Button */}
            {address == null ? (
                <Stack mt={8}>
                    <Button w={200} alignSelf='center'
                            onClick={(e) => {e.preventDefault(); loadWallet(true)}}>
                        Connect to MetaMask
                    </Button>
                    
                    {metaMaskError != null &&
                        <Box w={'fit-content'} alignSelf='center'>
                            <FormErrorMessage error={metaMaskError} />
                        </Box>
                    }
                </Stack>
            ) : (
                <Heading size='md' mt={8} float='left'>
                    Connected to MetaMask wallet address: {address}
                </Heading>
            )}
            
            {/* NFT Upload Form */}
            <UploadForm />
        </Stack>
    )
}

export default FunctionalityTestLayout;