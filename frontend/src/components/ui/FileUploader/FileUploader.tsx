import React, { useCallback, useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import {
    Flex,
    IconButton,
    Image,
    Spinner,
    Stack,
    Text
    } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

type FileUploaderProps = {
    file: File | null,
    setFile: (f: File | null) => void
};

const FileUploader = ({file, setFile}: FileUploaderProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Set up Dropzone
    const onDrop = useCallback((acceptedFiles) => {
        setIsLoading(true);

        const uploadedFile: File = acceptedFiles?.[0];

        if(!uploadedFile) {
            setIsLoading(false);
            return;
        }        

        try {
            // Set up file reader
            const reader = new FileReader();
            reader.onload = () => {
                if(reader.result) {
                    const blob = new Blob([reader.result], {type: uploadedFile.type});
                    const newFile = new File([blob], uploadedFile.name, {type: uploadedFile.type});
                    setFile(newFile);
                }
                setIsLoading(false);
            }
            reader.readAsArrayBuffer(uploadedFile);
        } catch(err) {
            console.log(err);
            setIsLoading(false);
        }
    }, [setFile]);
    const {getRootProps, getInputProps} = useDropzone({onDrop, maxFiles:1});

    const deleteFile = () => {
        setFile(null);
    }

    return (
        <Stack>
            {file ? (<>
                <Image src={URL.createObjectURL(file)} maxH={250} maxW={250} m={2} 
                    borderRadius={5} objectFit='contain' />
                <Flex dir='hor' m={2}>
                    <IconButton aria-label='Delete File' icon={<CloseIcon />} 
                        onClick={deleteFile} ml={2} />
                    <Text ml={4} alignSelf={'center'}>{file.name}</Text>
                </Flex>
            </>
            ) : (
                <Flex bg="#dadada" w={250} h={250} justify="center" align="center"
                        p={50} m={2} borderRadius={5} textAlign="center" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <Spinner size={'lg'} />
                    ) : (
                        <Text>Upload your NFT</Text>
                    )}
                </Flex> 
            )}
        </Stack>
    );
}

export default FileUploader;