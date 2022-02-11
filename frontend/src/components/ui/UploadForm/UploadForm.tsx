import FileUploader from '../../ui/FileUploader/FileUploader';
import React, { useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Stack,
    Text
    } from '@chakra-ui/react';
import {
    FormErrorMessage,
    FormNumberInput,
    FormSubmitButton,
    FormTextInput
    } from '../../ui/StyledFormFields/StyledFormFields';

type UploadFormProps = {

};

type formValuesType = {
    name: string, 
    description: string, 
    price: number | null
}

const UploadForm = ({}: UploadFormProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [formValues, setFormValues] = useState<formValuesType>({name: '', description: '', price: null})
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearForm = () => {setFormValues({name: '', description: '', price: null})}
    const updateForm = (field: keyof typeof formValues, value: string | number | null) => {
        setFormValues({...formValues, [field]: value});
    };

    const isFormInvalid = () => {
        return file === null || formValues.name === '' || formValues.description === '' || formValues.price === null || 
            Number(formValues.price) < 0.01;
    }

    const onSubmit = () => {

    }

    return (
        <Stack w={'100%'} mx={8} mt={10}>
            <Heading mb={4}>NFT Upload Test Form</Heading>
            <Flex width="full" style={{margin: '0'}} h={'100%'} justifyContent="center">
                <Box p={8} w={1000} h={'fit-content'} borderWidth={1} borderRadius={8} 
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

                            {/* Price Field */}
                            <FormNumberInput value={formValues.price} label={"Price"} 
                                onChange={(val) => {updateForm('price', val)}} />

                            {/* Submit Button */}
                            <FormSubmitButton isLoading={isLoading} label={"Submit"} isDisabled={isFormInvalid()} />
                        </Stack>
                    </form>
                </Box>
            </Flex>
            
        </Stack>
    );
}

export default UploadForm;