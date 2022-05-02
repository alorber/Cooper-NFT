import LoadingText from '../../ui/LoadingText/LoadingText';
import ModalForm from '../../ui/ModalForm/ModalForm';
import NFTCreationForm from '../../ui/NFTCreationForm/NFTCreationForm';
import React, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR, DARK_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import {
    Box,
    Flex,
    Heading,
    Link,
    Stack,
    Text,
    useDisclosure
    } from '@chakra-ui/react';
import { ContractRole } from '../../../services/nft_contract';
import { FormSubmitButton, FormTextInput } from '../../ui/StyledFormFields/StyledFormFields';
import { ThemedLinkButton } from '../../ui/ThemedButtons/ThemedButtons';

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

    const {isOpen, onOpen, onClose} = useDisclosure();

    return (
        <Stack spacing={8}>
            <Heading size={'xl'} mt={6}>Create a unique piece of digital artwork</Heading>
            <Heading size={'md'}>Turn your art into a one-of-a-kind NFT</Heading>

            {isLoading ? (
                <LoadingText loadingText='Determining Access...' textColor='black' textSize={'lg'} marginTop={4} />
            ) : isStudent && accountRoles !== null && metaMaskAddress !== null ? (
                <NFTCreationForm address={metaMaskAddress} {...ethRateProps} />
            ) : metaMaskAddress === null ? (
                <Stack width={'100%'}>
                    <Text>You must be logged in to mint NFTs</Text>
                    <Box justifySelf={'center'} pt={4}>
                        <ThemedLinkButton label={'Sign In'} routeTo={'/login'} 
                            width={['fit-content', 'fit-content', '20%']} maxWidth={'270px'} />
                    </Box>
                </Stack>
            ) : (
                <Stack>
                    <Text>You must be a current student to mint NFTs.</Text>
                    <Text>If you believe you should have access, click the button below.</Text>
                    <Flex w={'30%'} alignSelf='center' pt={6}>
                        <FormSubmitButton isLoading={false} label={'Request Access'} onClick={onOpen} textHoverColor={BACKGROUND_COLOR} />
                    </Flex>
                    <RequestAccessModal isOpen={isOpen} onClose={onClose} address={metaMaskAddress} />
                </Stack>
            )}
        </Stack>
    );
}

export default CreatePageLayout;

// Request Access Modal
type RequestFormValuesType = {
    firstName: string,
    lastName: string,
    idNumber: string,
    cooperEmail: string,
    walletAddr: string
}
type RequestAccessModalProps = {
    isOpen: boolean,
    onClose: () => void,
    address: string | null
}
const RequestAccessModal = ({isOpen, onClose, address}: RequestAccessModalProps) => {
    const defaultForm = {
        firstName: '',
        lastName: '',
        idNumber: '',
        cooperEmail: '',
        walletAddr: ''
    };
    const [isLoading, setIsLoading] = useState(false);
    const [formValues, setFormValues] = useState<RequestFormValuesType>(defaultForm);

    const clearForm = () => {setFormValues(defaultForm)}
    const updateForm = (field: keyof typeof formValues, value: string) => {
        setFormValues({...formValues, [field]: value});
    };
    const isFormInvalid = () => {
        return formValues.firstName == '' || formValues.lastName == '' 
            || formValues.idNumber.length < 7 
            || !(/^[\w\.]+@cooper\.edu$/.test(formValues.cooperEmail)) 
            || !(/^0x[a-fA-F0-9]{40}$/.test(formValues.walletAddr));
    }
    
    return (<>
        <ModalForm isOpen={isOpen} onClose={onClose} headerText={'Request Student Access'}
            modalBody={
                <form onSubmit={e => {e.preventDefault(); onClose();}}>
                    <Stack>
                        {/* First Name Field */}
                        <FormTextInput value={formValues.firstName} onChange={(val) => {updateForm('firstName', val)}}
                                label={"First Name"} type={"text"} placeholder={"Peter"} ariaLabel={"firstName"} />

                        {/* Last Name Field */}
                        <FormTextInput value={formValues.lastName} onChange={(val) => {updateForm('lastName', val)}}
                                label={"Last Name"} type={"text"} placeholder={"Cooper"} ariaLabel={"lastName"} />

                        {/* ID Number Field */}
                        <FormTextInput value={formValues.idNumber} onChange={(val) => {updateForm('idNumber', val)}}
                                label={"Cooper ID Number"} type={"text"} placeholder={"xxxxxxx"} ariaLabel={"idNumber"} />

                        {/* Email Field */}
                        <FormTextInput value={formValues.cooperEmail} onChange={(val) => {updateForm('cooperEmail', val)}}
                                label={"Cooper Email"} type={"email"} placeholder={"peter.cooper@cooper.edu"} ariaLabel={"cooperEmail"} />

                        {/* Wallet Address Field */}
                        <FormTextInput value={formValues.walletAddr} onChange={(val) => {updateForm('walletAddr', val)}}
                                label={"Wallet Address"} type={"text"} placeholder={"0x0"} ariaLabel={"walletAddr"}
                                tooltipMessage="Ethereum addresses must be of form: '0x' followed by 40 characters." />
                        {address != null && (
                            <Flex w='fit-content' display={'block'}>
                                <Text as={Link} _hover={{textDecoration: "none", color: DARK_SHADE_COLOR}} fontWeight={500} 
                                        color={MID_SHADE_COLOR} onClick={()=>{updateForm('walletAddr', address)}}>
                                    Autofill Current Wallet
                                </Text>
                            </Flex>
                        )}

                        {/* Submit Button */}
                        <Box pt={2}>
                            <FormSubmitButton isLoading={isLoading} label={'Submit Request'} isDisabled={isFormInvalid()}
                                textHoverColor={BACKGROUND_COLOR} />
                        </Box>
                    </Stack>
                </form>
            } isCentered={true} />
        </>);
}