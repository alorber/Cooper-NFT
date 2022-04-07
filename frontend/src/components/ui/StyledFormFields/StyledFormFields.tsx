import React from 'react';
import { DARK_SHADE_COLOR, LIGHT_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import { IconButton, Link } from '@chakra-ui/react';
import { QuestionIcon, RepeatIcon } from '@chakra-ui/icons';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Text,
    Tooltip,
    useDisclosure,
} from '@chakra-ui/react';

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
    isRequired?: boolean,
    tooltipMessage?: string,
    isAddress?: boolean
}

export const FormTextInput = ({
    value, 
    onChange, 
    label, 
    type, 
    placeholder, 
    ariaLabel, 
    isRequired = true, 
    tooltipMessage,
    isAddress
}: FormTextInputProps) => {
    return (
        <FormControl isRequired={isRequired}>
            <Flex>
                <FormLabel>{label}</FormLabel>
                {tooltipMessage && (
                    <FormTooltip message={tooltipMessage} />     
                )}
            </Flex>
            <Input type={type} placeholder={placeholder} value={value}
                aria-label={ariaLabel}  borderColor={MID_SHADE_COLOR} _hover={{borderColor: DARK_SHADE_COLOR}}
                onChange={e => onChange(e.currentTarget.value)} focusBorderColor={DARK_SHADE_COLOR} 
                pattern={isAddress ? "/^0x[a-fA-F0-9]{40}$/" : undefined}/>
        </FormControl>
    );
}

// Number Input
export type FormNumberInputProps = {
    value: number | null,
    onChange: (v: number | string) => void,
    label: string,
    type: '$' | '%' | 'ETH'
    isRequired?: boolean,
    precision?: number,
    min?: number,
    max?: number,
    tooltipMessage?: string,
    step?: number
}

export const FormNumberInput = ({
    value, 
    onChange, 
    label, 
    type, 
    isRequired = true,
    precision = 2,
    min = .01, 
    max = Number.MAX_VALUE / (10**precision), 
    tooltipMessage, 
    step
}: FormNumberInputProps) => {
    const format = type === '$' ? (
        (val: number | string) => `$` + val
    ) : type === '%' ? (
        (val: number | string) => val + `%`
    ) : (
        (val: number | string) => val + ` ETH`
    );
    const parse = type === '$' ? (
        (val: string) => val.replace(/^\$/, '')
    ) : type === '%' ? (
        (val: string) => val.replace(/%$/, '')
    ) : (
        (val: string) => val.replaceAll(/\sETH|E/g, '')
    );
    
    return (
        <FormControl isRequired={isRequired}>
            <Flex>
                <FormLabel>{label}</FormLabel>
                {tooltipMessage && (
                    <FormTooltip message={tooltipMessage} />     
                )}
            </Flex>
            <NumberInput onChange={onChange} format={format} parse={parse} value={value ?? ''} min={min} 
                    borderColor={MID_SHADE_COLOR} _hover={{borderColor: DARK_SHADE_COLOR}} focusBorderColor={DARK_SHADE_COLOR} 
                    precision={precision} pattern={"\\$?[0-9]*(.[0-9]+)?%?( ETH)?"} max={max} step={step}>
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

// Tooltip
export type FormTooltipProps = {
    message: string
}

export const FormTooltip = ({message}: FormTooltipProps) => {
    return (
        <Tooltip label={message} placement='top' hasArrow>
            <QuestionIcon color='grey' mb={2} alignSelf={'center'}/>
        </Tooltip>
    )
}

// Modal
export type FormModalProps = {
    launcherText: string
    modalHeader: string
    modalText: string
}

export const FormModal = ({launcherText, modalHeader, modalText}: FormModalProps) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (<>  
        <Flex w='fit-content' display={'block'}>
            <Text as={Link} _hover={{textDecoration: "none", color: DARK_SHADE_COLOR}} 
                    color={MID_SHADE_COLOR} onClick={onOpen} fontWeight={500}>
                {launcherText}
            </Text>
        </Flex>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {modalHeader}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody mb={6} textAlign='justify' >
                    {modalText}
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

// Icon Button
export type FormIconButtonProps = {
    iconType: "Refresh",
    ariaLabel: string,
    message: string,
    onClick: () => void,
    isLoading?: boolean
}

export const FormIconButton = ({iconType, ariaLabel, message, onClick, isLoading = false}: FormIconButtonProps) => {
    const icon = iconType === "Refresh" ? <RepeatIcon /> : undefined;
    return (
        <Tooltip label={message} placement='top' hasArrow>
            <IconButton variant={'outline'} aria-label={ariaLabel} icon={icon}
                onClick={onClick} isLoading={isLoading} borderRadius={100} />
        </Tooltip>
    );
}