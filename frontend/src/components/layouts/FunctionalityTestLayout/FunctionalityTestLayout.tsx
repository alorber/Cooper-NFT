import React, { useEffect, useState } from 'react';
import UpdateRolesForm from '../../ui/UpdateRolesForm/UpdateRolesForm';
import UploadForm from '../../ui/UploadForm/UploadForm';
import {
    Box,
    Button,
    ButtonGroup,
    Heading,
    Stack,
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
    const [selectedForm, setSelectedForm] = useState<'Roles' | 'Upload_NFT' | 'My_NFT'>('Upload_NFT');

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
        watchMetaMask(setAddress, setAccountContractRoles, setMetaMaskError);
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
                    {selectedForm === 'Upload_NFT' && <UploadForm roles={accountContractRoles} />}
                </Stack>
            )}
        </Stack>
    )
}

export default FunctionalityTestLayout;