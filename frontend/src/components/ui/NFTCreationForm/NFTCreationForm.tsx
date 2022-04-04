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
    FormNumberInput,
    FormSubmitButton,
    FormTextInput
    } from '../../ui/StyledFormFields/StyledFormFields';

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
        return file === null || formValues.name === '' || formValues.description === '' || formValues.price === null || 
            Number(formValues.price) < 0.01;
    }

    const onSubmit = async () => {
        if(file === null) {
            return;
        }

        setIsLoading(true);


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
                        <Checkbox size='lg' isChecked={formValues.disableRoyalties} onChange={(v) => {updateForm("disableRoyalties", v.target.checked)}}>
                            Disable royalties for this NFT
                        </Checkbox>
                        {!formValues.disableRoyalties && (<>
                            {/* Royalty Amount */}
                            <FormNumberInput value={formValues.royaltyAmount} label={"Royalty Percentage"} 
                                onChange={(val) => {updateForm('royaltyAmount', val)}} />
                            {/* Royalty Recipient */}
                            <FormControl>
                                <FormLabel>Royalty Recipient</FormLabel>
                                <Select placeholder='Select Royalty Recipient' size={'md'} value={formValues.royaltyRecipient ?? 0} 
                                        onChange={(v) => {updateForm('royaltyRecipient', v.target.value)}}>
                                    <option value={RoyaltyRecipients.CURRENT_WALLET}>Current Wallet: ${address}</option>
                                    <option value={RoyaltyRecipients.COOPER_UNION}>Cooper Union</option>
                                    <option value={RoyaltyRecipients.OTHER}>Other</option>
                                </Select>
                            </FormControl>
                            
                            {/* "Other" Field Input */}
                            {formValues.royaltyRecipient === RoyaltyRecipients.OTHER && (
                                <FormTextInput value={formValues.royaltyRecipientOther} onChange={(val) => {updateForm('royaltyRecipientOther', val)}}
                                    label={"Royalty Recipent Address"} placeholder="Wallet Address" type={"text"} ariaLabel={"Royalty Recipent Address"} />
                            )}
                        </>)}

                        {/* List NFT Checkbox */}
                        <Checkbox size='lg' isChecked={formValues.sellNFT} onChange={(v) => {updateForm('sellNFT', v.target.checked)}}>
                            List NFT on Marketplace
                        </Checkbox>

                        {/* Listing Info */}
                        {formValues.sellNFT && (
                            /* Price Field */
                            <FormNumberInput value={formValues.price} label={"Price"} 
                                onChange={(val) => {updateForm('price', val)}} />
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