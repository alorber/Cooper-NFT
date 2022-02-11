import React, { useCallback, useState } from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

type FileUploaderProps = {

};

const FileUploader = ({}: FileUploaderProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Set up Dropzone
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles?.[0];

        if(!file) {
            return;
        }

        try {
            console.log(file);
            const file_url =URL.createObjectURL(file);
        } catch(err) {
            console.log(err);
        }

    }, []);
    const {getRootProps, getInputProps} = useDropzone({onDrop, maxFiles:1});

    return (
        <Flex bg="#dadada" w={250} h={250} justify="center" align="center"
            p={50} m={2} borderRadius={5} textAlign="center" {...getRootProps()}>
            <input {...getInputProps()} />
                {isLoading ? (
                    <Spinner size={'lg'} />
                ) : (
                    <Text>Upload your NFT</Text>
                )}
                
        </Flex>
    );
}

export default FileUploader;