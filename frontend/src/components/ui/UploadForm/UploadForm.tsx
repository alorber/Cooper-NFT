import FileUploader from '../../ui/FileUploader/FileUploader';
import React, { useState } from 'react';
import testNFTSubmission from '../../../services/testNFTSubmission';
import {
    Box,
    Flex,
    Heading,
    Image,
    Stack
    } from '@chakra-ui/react';
import { ContractRole } from '../../../services/contracts';
import {
    FormErrorMessage,
    FormNumberInput,
    FormSubmitButton,
    FormTextInput
    } from '../../ui/StyledFormFields/StyledFormFields';

type UploadFormProps = {
    roles: ContractRole[],
    address: string,
};

export type FormValuesType = {
    name: string, 
    description: string, 
    price: number | null
}

const UploadForm = ({roles, address}: UploadFormProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [formValues, setFormValues] = useState<FormValuesType>({name: '', description: '', price: null})
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [retrievedNFT, setRetrievedNFT] = useState<boolean>(false);

    const clearForm = () => {setFormValues({name: '', description: '', price: null})}
    const updateForm = (field: keyof typeof formValues, value: string | number | null) => {
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

        await testNFTSubmission(file, formValues, address, setUrl);

        setIsLoading(false);
        setRetrievedNFT(true);
    }

    const showNewForm = () => {
        clearForm();
        setUrl(null);
        setRetrievedNFT(false);
    }

    return (
        <Stack w={'100%'} mx={8} mt={10}>
            <Heading mb={4}>NFT Upload Test Form</Heading>
            <Flex width="full" style={{margin: '0'}} h={'100%'} justifyContent="center">
                <Box p={8} w={1000} h={'fit-content'} borderWidth={1} borderRadius={8} 
                        boxShadow="lg" borderColor="#b7e0ff ">
                    {roles.includes(ContractRole.CURRENT_STUDENT) ?
                        retrievedNFT ? (
                            <Stack spacing={4} my={2}>
                                <Heading size='md' mb={4}>
                                    Retrieved file from IPFS
                                </Heading>
                                <Image src={url ?? ''} w={400} alignSelf='center' />
                                <FormSubmitButton isLoading={false} label={"Create Another NFT"} onClick={showNewForm} />
                            </Stack>
                        ) : (
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

                                    {/* Price Field */}
                                    <FormNumberInput value={formValues.price} label={"Price"} 
                                        onChange={(val) => {updateForm('price', val)}} />

                                    {/* Submit Button */}
                                    <FormSubmitButton isLoading={isLoading} label={"Submit"} isDisabled={isFormInvalid()} />
                                </Stack>
                            </form>
                    ) : (
                        <Heading size={'sm'}>
                            Must be a current student to create an NFT
                        </Heading>
                    )}
                </Box>
            </Flex>
            
        </Stack>
    );
}

export default UploadForm;