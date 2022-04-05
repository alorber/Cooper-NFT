import FileUploader from '../../ui/FileUploader/FileUploader';
import React, { useState } from 'react';
import {
    Box,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Select,
    Stack
    } from '@chakra-ui/react';
import {
    FormErrorMessage,
    FormModal,
    FormNumberInput,
    FormSubmitButton,
    FormTextInput
    } from '../../ui/StyledFormFields/StyledFormFields';
import { createNFT } from '../../../services/marketplace_contract';

type NFTCreationFormProps = {
    address: string,
};

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

const NFTCreationForm = ({address}: NFTCreationFormProps) => {
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearForm = () => {setFormValues(defaultForm)}
    const updateForm = (field: keyof typeof formValues, value: string | number | boolean | null) => {
        setFormValues({...formValues, [field]: value});
    };

    const isFormInvalid = () => {
        const invalidRequiredFields = file === null || formValues.name === '' || formValues.description === '';
        const invalidRoyaltyInfo = !formValues.disableRoyalties && (formValues.royaltyAmount === null || formValues.royaltyAmount < 0.01 
            || formValues.royaltyRecipient === null || (formValues.royaltyRecipient === RoyaltyRecipients.OTHER && formValues.royaltyRecipientOther == null));
        const invalidSellInfo = formValues.sellNFT && (formValues.price === null || formValues.price < 0.01);
        return invalidRequiredFields || invalidRoyaltyInfo || invalidSellInfo;
    }

    const onSubmit = async () => {
        if(file == null) {
            return;
        }

        setIsLoading(true);

        // Determines missing values
        const royaltyRecipientAddress = formValues.disableRoyalties ? (
            '0x0000000000000000000000000000000000000000'
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

        createNFT(file, formValues.name, formValues.description, royaltyAmount, royaltyRecipientAddress, price, address);

        setIsLoading(false);
    }

    const showNewForm = () => {
        clearForm();
        setFile(null);
    }

    return (
        <Flex width="full" style={{margin: '0'}} h={'100%'} justifyContent="center">
            <Box p={8} m={8} w={1000} h={'fit-content'} borderWidth={1} borderRadius={8} 
                    boxShadow="lg" borderColor="#b7e0ff ">
                <form onSubmit={e => {e.preventDefault(); onSubmit()}}>
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
                            /* Price Field */
                            <FormNumberInput value={formValues.price} label={"Price"} type='$'
                                onChange={(val) => {updateForm('price', val)}} isRequired={formValues.sellNFT} />
                        )}

                        {/* Submit Button */}
                        <FormSubmitButton isLoading={isLoading} label={"Submit"} isDisabled={isFormInvalid()} />
                    </Stack>
                </form>
            </Box>
        </Flex>
    );
}

export default NFTCreationForm;

const royaltiesModalText = "NFT royalties are automatic payments made to the original NFT minter (or specified wallet) during secondary " +
    "sales of the NFT. These payments are a percentage of the sale price each time the NFT is resold."