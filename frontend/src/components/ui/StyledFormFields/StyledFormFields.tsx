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
import { DARK_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';

/**
 * This file contains various form components with uniform styling.
 * Allows easy creation of forms.
 */

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
                aria-label={ariaLabel}  borderColor={MID_SHADE_COLOR} _hover={{borderColor: DARK_SHADE_COLOR}}
                onChange={e => onChange(e.currentTarget.value)} focusBorderColor={DARK_SHADE_COLOR}/>
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
        <FormControl isRequired>
            <FormLabel>{label}</FormLabel>
            <NumberInput onChange={(val) => onChange(parse(val))} value={format(value ?? '')} min={0.01} 
                    borderColor={MID_SHADE_COLOR} _hover={{borderColor: DARK_SHADE_COLOR}} focusBorderColor={DARK_SHADE_COLOR} 
                    precision={2} pattern={"\\$?[0-9]*(.[0-9]+)?"}>
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </FormControl>
    );
}

// Submit Button
export type FormSubmitButtonProps = {
    isLoading: boolean,
    label: string,
    onClick?: () => void,
    isDisabled?: boolean
}

export const FormSubmitButton = ({isLoading, label, onClick, isDisabled=false}: FormSubmitButtonProps) => {
    return (
        <Button width="full" type="submit" boxShadow='sm' isDisabled={isDisabled}
                backgroundColor={MID_SHADE_COLOR} _hover={{boxShadow: 'md'}}
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