import NFTCreationForm from '../../ui/NFTCreationForm/NFTCreationForm';
import React, { useEffect, useState } from 'react';
import UpdateRolesForm from '../../ui/UpdateRolesForm/UpdateRolesForm';
import {
    Box,
    Button,
    ButtonGroup,
    Heading,
    Stack
    } from '@chakra-ui/react';
import { ContractRole } from '../../../services/nft_contract';
import { FormErrorMessage } from '../../ui/StyledFormFields/StyledFormFields';
import { loadUserWallet, watchMetaMask } from '../../../services/contracts';

type FunctionalityTestLayoutProps = {

};

const FunctionalityTestLayout = ({}: FunctionalityTestLayoutProps) => {
    const [address, setAddress] = useState<string | null>(null);
    const [metaMaskError, setMetaMaskError] = useState<string | null>(null);
    const [accountContractRoles, setAccountContractRoles] = useState<ContractRole[] | null>(null);
    const [selectedForm, setSelectedForm] = useState<'Roles' | 'Upload_NFT' | 'My_NFT'>('Upload_NFT');

    // Check for connected accounts
    useEffect(() => {
        loadUserWallet(false, setAddress, setMetaMaskError, setAccountContractRoles);
        watchMetaMask(setAddress, setAccountContractRoles, setMetaMaskError);
    }, [])

    return (
        <Stack spacing={8}>
            {/* Connect to MetaMask Button */}
            {address == null ? (
                <Stack mt={8}>
                    <Button w={200} alignSelf='center'
                            onClick={(e) => {e.preventDefault(); 
                                loadUserWallet(true, setAddress, setMetaMaskError, setAccountContractRoles)
                            }}>
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
            
            {accountContractRoles && address && (
                <Stack>
                    <ButtonGroup isAttached alignSelf='center' mb={6}>
                        <Button colorScheme={selectedForm === 'Roles' ? 'green' : 'gray'}
                                onClick={(e) => {e.preventDefault(); setSelectedForm('Roles')}}>
                            Update Roles
                        </Button>
                        <Button colorScheme={selectedForm === 'Upload_NFT' ? 'green' : 'gray'}
                                onClick={(e) => {e.preventDefault(); setSelectedForm('Upload_NFT')}}>
                            Upload NFT
                        </Button>
                    </ButtonGroup>    

                    {/* Update Roles Form */}
                    {selectedForm === 'Roles' &&
                        <UpdateRolesForm accountContractRoles={accountContractRoles} />
                    }

                    {/* NFT Upload Form */}
                    {selectedForm === 'Upload_NFT' && (
                        <Stack>
                            <Heading mb={4}>NFT Upload Test Form</Heading>
                            {accountContractRoles.includes(ContractRole.CURRENT_STUDENT) ? (
                                <NFTCreationForm address={address} />
                            ) : (
                                <Heading size={'sm'}>
                                    Must be a current student to create an NFT
                                </Heading>
                            )}
                        </Stack>
                    )}
                </Stack>
            )}
        </Stack>
    )
}

export default FunctionalityTestLayout;