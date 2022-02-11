import React from 'react';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    } from '@chakra-ui/react';

// Text Input
export type FormTextInputProps = {
    value: string,
    onChange: (v: string) => void,
    label: string,
    type: string,
    placeholder: string,
    ariaLabel: string
}

export const FormTextInput = ({value, onChange, label, type, placeholder, ariaLabel}: FormTextInputProps) => {
    return (
        <FormControl isRequired>
            <FormLabel>{label}</FormLabel>
            <Input type={type} placeholder={placeholder} value={value}
                aria-label={ariaLabel}  borderColor="#b7e0ff" _hover={{borderColor: "#2395FF"}}
                onChange={e => onChange(e.currentTarget.value)} focusBorderColor="#2395ff"/>
        </FormControl>
    );
}

// Number Input
export type FormNumberInputProps = {
    value: number | null,
    onChange: (v: number | string) => void,
    label: string,
}

export const FormNumberInput = ({value, onChange, label}: FormNumberInputProps) => {
    const format = (val: number | string) => `$` + val;
    const parse = (val: string) => val.replace(/^\$/, '');

    return (
        <NumberInput onChange={(val) => onChange(parse(val))} value={format(value ?? 1.32)} min={0.01} 
                borderColor="#b7e0ff" _hover={{borderColor: "#2395FF"}} focusBorderColor="#2395ff" 
                precision={2} pattern={"$?[0-9]*(.[0-9]+)?"}>
            <NumberInputField />
            <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
            </NumberInputStepper>
        </NumberInput>
    );
}

// Submit Button
export type FormSubmitButtonProps = {
    isLoading: boolean,
    label: string,
    onClick?: () => void
}

export const FormSubmitButton = ({isLoading, label, onClick}: FormSubmitButtonProps) => {
    return (
        <Button width="full" type="submit" boxShadow='sm' 
                backgroundColor={"#b7e0ff"} _hover={{boxShadow: 'md'}}
                _active={{boxShadow: 'lg'}} _focus={{outline: "none"}} 
                isLoading={isLoading} onClick={onClick} >
            {label}
        </Button>
    );
}

// Error Message
export type FormErrorMessageProps = {
    error: string,
    isLoggedIn?: boolean
}
export const FormErrorMessage = ({error, isLoggedIn = false}: FormErrorMessageProps) => {
    return (
      <Box my={4}>
        <Alert status={'error'} borderRadius={4}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
}

// Success Message
export type FormSuccessMessageProps = {
    message: string,
}

export const FormSuccessMessage = ({message}: FormSuccessMessageProps) => {

    return (
        <Box my={4}>
        <Alert status={'success'} borderRadius={4}>
          <AlertIcon />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </Box>
    );
}