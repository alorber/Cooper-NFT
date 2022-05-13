import React from 'react';
import {
    Box,
    Button,
    Heading,
    Stack,
    Text
    } from '@chakra-ui/react';
import { FormErrorMessage } from '../../ui/StyledFormFields/StyledFormFields';
import { isMetaMaskInstalled } from '../../../services/contracts';
import { Link } from '@chakra-ui/react';

type LoginPageLayoutProps = {
    loadWallet: (r: boolean) => void;
    metaMaskError: string | null,
}

const LoginPageLayout = ({loadWallet, metaMaskError}: LoginPageLayoutProps) => {
    return (
        <Stack spacing={8}>
            <Heading mt={8} mx={4}>Join a community of artists, architects, and engineers!</Heading>
            <Heading size={'md'}>Connect your Ethereum wallet to begin buying and selling one-of-a-kind artwork! </Heading>
            {isMetaMaskInstalled() ? (
                <MetaMaskInstalledView loadWallet={loadWallet} metaMaskError={metaMaskError} />
            ) : (
                <MetaMaskNotInstalledView />
            )}
        </Stack>
    );
}

const MetaMaskInstalledView = ({loadWallet, metaMaskError}: LoginPageLayoutProps) => {
    return (
        <Stack mt={8}>
            <Button w={200} alignSelf='center'
                onClick={(e) => {
                    e.preventDefault();
                    loadWallet(true)
                }}>
                Connect to MetaMask
            </Button>

            {metaMaskError != null &&
                <Box w={'fit-content'} alignSelf='center'>
                    <FormErrorMessage error={metaMaskError} />
                </Box>
            }
        </Stack>
    );
}

const MetaMaskNotInstalledView = () => {
    return (
        <Stack spacing={8}>
            <Button w={'fit-content'} alignSelf={'center'} as={Link} style={{textDecoration: "none"}}
                href="https://metamask.io/download/" _focus={{outline: "none"}}
            >
                Download the MetaMask Extension
            </Button>
            <Text px={4}>
            Available as a browser extension and as a mobile app, MetaMask equips you with a key vault, secure login, token wallet, and token exchange—everything you need to manage your digital assets.
            </Text>
        </Stack>
    );
}

export default LoginPageLayout;