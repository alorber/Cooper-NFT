import { Button, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import UploadForm from '../../ui/UploadForm/UploadForm';
import {getMetaMaskWallet, watchMetaMask} from '../../../services/contracts';

type SellPageLayoutProps = {

}

const SellPageLayout = ({}: SellPageLayoutProps) => {
    const [address, setAddress] = useState<string | null>(null);

    const loadWallet = async (request: boolean = true) => {
        const resp = await getMetaMaskWallet(request);

        if(resp.status === "Success") {
            console.log(resp.address)

            if(resp.address != null) {
                setAddress(resp.address);
            }
        }
    }

    // Check for connected accounts
    useEffect(() => {
        loadWallet(false);
        watchMetaMask(setAddress);
    }, [])

    return (<>
        {address == null ? (
            <Button w={200} alignSelf='center' my={4} 
                    onClick={(e) => {e.preventDefault(); loadWallet(true)}}>
                Connect to MetaMask
            </Button>
        ) : (
            <Text>Connected to MetaMask wallet address: {address}</Text>
        )}
        
        <UploadForm />
    </>);
}

export default SellPageLayout;