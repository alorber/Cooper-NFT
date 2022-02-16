import { Box, Flex, Heading, Input, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { ContractRole, removeContractAdmin, removeContractStudent, setContractAdmin, setContractPreviousStudent, setContractStudent, TransactionResponse } from "../../../services/contracts";
import { FormErrorMessage, FormSubmitButton, FormSuccessMessage } from "../StyledFormFields/StyledFormFields";

type UpdateRolesFormProps = {
    accountContractRoles: ContractRole[]
};

type formOptions = {
    role: ContractRole | null,
    action: "Add" | "Remove" | null
}

const UpdateRolesForm = ({accountContractRoles}: UpdateRolesFormProps) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [rolesControlled, setRolesControlled] = useState<ContractRole[]>([]);
    const [formAddress, setFormAddress] = useState<string>("");
    const [selectedOptions, setSelectedOptions] = useState<formOptions>({role: null, action: null});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const determineControlledRoles = () => {
        if(accountContractRoles.includes(ContractRole.COOPER)) {
            setRolesControlled([ContractRole.ADMIN, ContractRole.CURRENT_STUDENT, ContractRole.PREVIOUS_STUDENT])
        } else if(accountContractRoles.includes(ContractRole.ADMIN)) {
            setRolesControlled([ContractRole.CURRENT_STUDENT, ContractRole.PREVIOUS_STUDENT])
        } else {
            setRolesControlled([]);
        }
    }

    useEffect(() => {
        determineControlledRoles();
    }, [accountContractRoles]);

    const onSubmit = async () => {
        setIsLoading(true);

        let resp: TransactionResponse | null = null;
        if(selectedOptions.role === ContractRole.ADMIN) {
            if(selectedOptions.action === 'Add') {
                resp = await setContractAdmin(formAddress);
            } else {
                resp = await removeContractAdmin(formAddress);
            }
        } else if(selectedOptions.role === ContractRole.CURRENT_STUDENT) {
            if(selectedOptions.action === 'Add') {
                resp = await setContractStudent(formAddress);
            } else {
                resp = await removeContractStudent(formAddress);
            }
        } else if(selectedOptions.role === ContractRole.PREVIOUS_STUDENT) {
            if(selectedOptions.action === "Add") {
                resp = await setContractPreviousStudent(formAddress);
            }
        }
        
        // Checks for errors
        if(resp === null) {
            setError("Invalid Options");
            setSuccess(false);
        } else if(resp.status === "Failure") {
            setError(resp.error);
            setSuccess(false);
        } else {
            setError(null);
            setSuccess(true);
        }

        setIsLoading(false);
    }

    return (
        <Stack w={'100%'} mx={8} mt={10}>
            <Heading mb={4}>Update Roles Test Form</Heading>
            <Flex width="full" style={{margin: '0'}} h={'100%'} justifyContent="center">
                <Box p={8} w={1000} h={'fit-content'} borderWidth={1} borderRadius={8} 
                        boxShadow="lg" borderColor="#b7e0ff ">
                    {rolesControlled.length > 0 ? (
                        <Stack spacing={4}>
                            {/* Error Message */}
                            {error !== null && <FormErrorMessage error={error} /> }

                            {/* Success Message */}
                            {success && <FormSuccessMessage message="SUCCESS" />}

                            {/* Role Selector */}
                            <Heading size={'md'}>Select Role</Heading>
                            <RadioGroup onChange={(r: ContractRole) => {setSelectedOptions({...selectedOptions, role: r})}}
                                    alignSelf='center'>
                                <Stack direction={"row"} spacing={4}>
                                    {rolesControlled.map(role => 
                                        <Radio value={role}>{role}</Radio>
                                    )}    
                                </Stack>
                            </RadioGroup>

                            {/* Action Selector */}
                            <Heading size={'md'}>Select Action</Heading>
                            <RadioGroup onChange={(a: "Add" | "Remove") => {setSelectedOptions({...selectedOptions, action: a})}}
                                    alignSelf='center'>
                                <Stack direction={'row'} spacing={4}>
                                    <Radio value={"Add"}>Add</Radio>
                                    <Radio value={"Remove"}>Remove</Radio>
                                </Stack>
                            </RadioGroup>

                            {/* Update Role */}
                            <Flex w='100%' justifyContent={'center'} mt={4}>
                                <Input type={'text'} placeholder={'Account Address'} aria-label={"Account Address"} 
                                    borderColor="#b7e0ff" _hover={{borderColor: "#2395FF"}} focusBorderColor="#2395ff"
                                    value={formAddress} onChange={e => setFormAddress(e.currentTarget.value)} />
                            </Flex>

                            <FormSubmitButton isLoading={isLoading} label={"Update Account"} onClick={onSubmit}
                                isDisabled={formAddress === '' || selectedOptions.action === null || selectedOptions.role === null} />
                        </Stack>
                    ) : (
                        <Heading size={'sm'}>
                            Role {accountContractRoles[0]} is unable to update other account's role
                        </Heading>
                    )}
                    
                </Box>
            </Flex>
            
        </Stack>
    );
}

export default UpdateRolesForm;
