import FileUploader from '../../ui/FileUploader/FileUploader';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Select,
    Stack,
    Text,
    useDisclosure
    } from '@chakra-ui/react';
import { constants as etherConstants } from 'ethers';
import { createNFT, ETH_PRECISION } from '../../../services/marketplace_contract';
import {
    FormConfirmationModal,
    FormErrorMessage,
    FormIconButton,
    FormModal,
    FormNumberInput,
    FormSubmitButton,
    FormTextInput
    } from '../../ui/StyledFormFields/StyledFormFields';

export type FormValuesType = {
    name: string, 
    description: string, 
    disableRoyalties: boolean,
    royaltyAmount: number | null,
    royaltyRecipient: RoyaltyRecipients | null,
    royaltyRecipientOther: string,
    sellNFT: boolean,
    price: number | null
}

const enum RoyaltyRecipients {
    CURRENT_WALLET = "CURRENT_WALLET",
    COOPER_UNION = "COOPER_UNION",
    OTHER = "OTHER"
}

type NFTCreationFormProps = {
    address: string,
    ethToUsdRate: number | null,
    isLoadingETHRate: boolean,
    updateEthRate: () => void
};

const NFTCreationForm = ({address, ethToUsdRate, isLoadingETHRate, updateEthRate}: NFTCreationFormProps) => {
    const defaultForm = {
        name: '', 
        description: '', 
        disableRoyalties: false, 
        royaltyAmount: null, 
        royaltyRecipient: null,
        royaltyRecipientOther: '',
        sellNFT: false, 
        price: null
    };
    const [file, setFile] = useState<File | null>(null);
    const [formValues, setFormValues] = useState<FormValuesType>(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Min value for price field
    const [minEth, setMinEth] = useState<number>(.00001);
    // Updates minimum possible ETH value (~ 1 cent)
    useEffect(() => {
        setMinEth(ethToUsdRate !== null ? (.015 / ethToUsdRate): .00001);
    }, [ethToUsdRate]);

    const {isOpen: isConfirmationModalOpen, onOpen: onConfirmationModalOpen, onClose: onConfirmationModalClose} = useDisclosure();

    const clearForm = () => {setFormValues(defaultForm)}
    const updateForm = (field: keyof typeof formValues, value: string | number | boolean | null) => {
        setFormValues({...formValues, [field]: value});
    };

    const isFormInvalid = () => {
        const invalidRequiredFields = file === null || formValues.name === '' || formValues.description === '';
        const invalidRoyaltyInfo = !formValues.disableRoyalties && (formValues.royaltyAmount === null || formValues.royaltyAmount < 0.01 
            || formValues.royaltyRecipient === null || (formValues.royaltyRecipient === RoyaltyRecipients.OTHER && formValues.royaltyRecipientOther == null));
        const invalidSellInfo = formValues.sellNFT && (formValues.price === null || formValues.price < minEth);
        return invalidRequiredFields || invalidRoyaltyInfo || invalidSellInfo;
    }

    const onSubmit = async () => {
        if(file == null) {
            return;
        }

        setIsSubmitting(true);

        // Determines missing values
        const royaltyRecipientAddress = formValues.disableRoyalties ? (
            etherConstants.AddressZero
        ) : formValues.royaltyRecipient === RoyaltyRecipients.CURRENT_WALLET ? (
            address
        ) : formValues.royaltyRecipient === RoyaltyRecipients.COOPER_UNION ? (
            ''
        ) : formValues.royaltyRecipient === RoyaltyRecipients.OTHER ? (
            formValues.royaltyRecipientOther
        ) : (
            '0x0'
        )
        const royaltyAmount = formValues.disableRoyalties ? 0 : (formValues.royaltyAmount ?? 0) * 10;
        const price = formValues.sellNFT ? formValues.price ?? 0 : 0;

        await createNFT(file, formValues.name, formValues.description, royaltyAmount, royaltyRecipientAddress, price, address);

        showNewForm();

        setIsSubmitting(false);
    }

    const showNewForm = () => {
        clearForm();
        setFile(null);
    }

    // Gets exchange rate, when user wants to list item
    useEffect(() => {
        updateEthRate();
    }, [formValues.sellNFT]);

    return (
        <Flex width="full" style={{margin: '0'}} h={'100%'} justifyContent="center">
            <Box p={8} m={8} w={1000} h={'fit-content'} borderWidth={1} borderRadius={8} 
                    boxShadow="lg" borderColor="#b7e0ff ">
                <FormConfirmationModal header='Confirm Submission' isOpen={isConfirmationModalOpen} onClose={onConfirmationModalClose}
                        confrimationDialog='Once an NFT is minted, none of these values can be changed except sale price'
                        submitButtonText={formValues.sellNFT ? 'Mint & List NFT' : 'Mint NFT'} submitButtonOnClick={onSubmit} />
                <form onSubmit={e => {e.preventDefault(); onConfirmationModalOpen()}}>
                    <Stack spacing={4}>
                        {/* Error Message */}
                        {error !== null && <FormErrorMessage error={error} /> }

                        {/* NFT File Upload Field */}
                        <Flex w='100%' justifyContent={'center'}>
                            <FileUploader file={file} setFile={setFile} />  
                        </Flex>

                        {/* Name Field */}
                        <FormTextInput value={formValues.name} onChange={(val) => {updateForm('name', val)}}
                            label={"NFT Name"} type={"text"} placeholder={"My NFT"} ariaLabel={"NFT_Name"} />

                        {/* Description Field */}
                        <FormTextInput value={formValues.description} onChange={(val) => {updateForm('description', val)}}
                            label={"NFT Description"} type={"text"} placeholder={"About My NFT"} ariaLabel={"NFT_Description"} />

                        {/* Royalty Info */}
                        <FormModal launcherText='What are royalties?' modalHeader='NFT Royalties' modalText={royaltiesModalText}/>
                        <Checkbox size='lg' isChecked={formValues.disableRoyalties} onChange={(v) => {updateForm("disableRoyalties", v.target.checked)}}>
                            Disable royalties for this NFT
                        </Checkbox>
                        {!formValues.disableRoyalties && (<>
                            {/* Royalty Amount */}
                            <FormNumberInput value={formValues.royaltyAmount} label={"Royalty Percentage"} type='%' max={15}
                                onChange={(val) => {updateForm('royaltyAmount', val)}} isRequired={!formValues.disableRoyalties} 
                                tooltipMessage={"Royalties are generally between 5-10%"} />
                            
                            {/* Royalty Recipient */}
                            <FormControl isRequired={!formValues.disableRoyalties}>
                                <FormLabel>Royalty Recipient</FormLabel>
                                <Select placeholder='Select Royalty Recipient' size={'md'} value={formValues.royaltyRecipient ?? 0} 
                                        onChange={(v) => {updateForm('royaltyRecipient', v.target.value)}}>
                                    <option value={RoyaltyRecipients.CURRENT_WALLET}>Current Wallet: ${address}</option>
                                    <option value={RoyaltyRecipients.COOPER_UNION}>Cooper Union</option>
                                    <option value={RoyaltyRecipients.OTHER}>Other</option>
                                </Select>
                            </FormControl>
                            
                            {/* "Other" Address Input */}
                            {formValues.royaltyRecipient === RoyaltyRecipients.OTHER && (
                                <FormTextInput value={formValues.royaltyRecipientOther} onChange={(val) => {updateForm('royaltyRecipientOther', val)}}
                                    label={"Royalty Recipent Address"} placeholder="Wallet Address" type={"text"} ariaLabel={"Royalty Recipent Address"} 
                                    isRequired={!formValues.disableRoyalties && formValues.royaltyRecipient === RoyaltyRecipients.OTHER} 
                                    tooltipMessage="Ethereum addresses must be of form: '0x' followed by 40 characters." isAddress />
                            )}
                        </>)}

                        {/* List NFT Checkbox */}
                        <Checkbox size='lg' isChecked={formValues.sellNFT} onChange={(v) => {updateForm('sellNFT', v.target.checked)}}>
                            List NFT on Marketplace
                        </Checkbox>

                        {/* Listing Info */}
                        {formValues.sellNFT && (
                            <Stack>
                            {/* Price Field in ETH */}
                            <FormNumberInput value={formValues.price} label={"Price"} type='ETH' step={.002} isRequired={formValues.sellNFT}
                                onChange={(val) => {updateForm('price', val)}} min={minEth} 
                                precision={ETH_PRECISION} />
                            {/* Conversion to USD */}
                            {formValues.price != null && ethToUsdRate !== null && (
                                <Flex alignItems='center'>
                                    <Text as='i' mr={2}>Roughly {formValues.price * ethToUsdRate} USD</Text>
                                    <FormIconButton iconType='Refresh' ariaLabel='ETH Refresh' message='Refresh ETH <-> USD Rate' 
                                        onClick={updateEthRate} isLoading={isLoadingETHRate} />
                                </Flex>
                            )}
                            </Stack>
                        )}

                        {/* Submit Button */}
                        <FormSubmitButton isLoading={isSubmitting} label={"Submit"} isDisabled={isFormInvalid()} />
                    </Stack>
                </form>
            </Box>
        </Flex>
    );
}

export default NFTCreationForm;

const royaltiesModalText = "NFT royalties are automatic payments made to the original NFT minter (or specified wallet) during secondary " +
    "sales of the NFT. These payments are a percentage of the sale price each time the NFT is resold."