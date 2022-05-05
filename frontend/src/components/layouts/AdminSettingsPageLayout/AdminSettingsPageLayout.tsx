import react, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR, DARK_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import {
    Box,
    Flex,
    FormControl,
    FormHelperText,
    FormLabel,
    Heading,
    HStack,
    Input,
    Select,
    Stack,
    useDisclosure
    } from '@chakra-ui/react';
import {
    ContractRole,
    getCommonRoles,
    removeContractAdmin,
    removeContractStudent,
    setContractAdmin,
    setContractPreviousStudent,
    setContractStudent
    } from '../../../services/nft_contract';
import {
    FormConfirmationModal,
    FormErrorMessage,
    FormIconButton,
    FormSubmitButton,
    FormSuccessMessage,
    FormTooltip
    } from '../../ui/StyledFormFields/StyledFormFields';
import { isValidAddress } from '../../../services/marketplace_contract';
import { TransactionResponse } from '../../../services/contracts';

export type AdminSettingsPageLayoutProps = {
    accountRoles: ContractRole[] | null
}

const AdminSettingsPageLayout = ({accountRoles}: AdminSettingsPageLayoutProps) => {
    const [isCooper, setIsCooper] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    

    // Determines admin status
    useEffect(() => {
        setIsAdmin(accountRoles?.includes(ContractRole.ADMIN || ContractRole.COOPER) ?? false);
        setIsCooper(accountRoles?.includes(ContractRole.COOPER) ?? false);
    },[accountRoles]);

    return (
        <Stack align={'center'} pt={10}>
            <Heading size={'lg'} pb={6}>
                Admin Settings
            </Heading>
            {!isAdmin ? (
                <Heading size={'md'} pt={6}>
                    You must be an admin to access this page
                </Heading>
            ) : (
                <ChangeRoleForm isCooper={isCooper} />
            )}
        </Stack>
    );
}

export default AdminSettingsPageLayout;

enum RoleChangeAction {
    ADD_STUDENT_ROLE = "Add Student Role",
    REMOVE_STUDENT_ROLE = "Remove Student Role",
    CHANGE_STUDENT_TO_ALUM = "Change Student to Alum",
    ADD_ADMIN = "Add Admin",
    REMOVE_ADMIN = "Remove Admin"
}

// Mapping of actions to functions
const formActionsToFncs: Record<RoleChangeAction, ((address: string[]) => Promise<TransactionResponse>)> = {
    "Add Student Role": setContractStudent,
    "Remove Student Role": removeContractStudent,
    "Change Student to Alum": setContractPreviousStudent,
    "Add Admin": setContractAdmin,
    "Remove Admin": removeContractAdmin
}

// Form for changing account roles
type ChangeRoleFormProps = {
    isCooper: boolean
}

const ChangeRoleForm = ({isCooper}: ChangeRoleFormProps) => {
    const [formAddresses, setFormAddresses] = useState<string[]>(['']);
    const [formActions, setFormActions] = useState<RoleChangeAction[]>([]);
    const [selectedAction, setSelectedAction] = useState<RoleChangeAction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const {isOpen: isConfirmationModalOpen, onOpen: onConfirmationModalOpen, onClose: onConfirmationModalClose} = useDisclosure();


    // Determines possible actions when addresses are changed
    useEffect(() => {
        if(formAddresses.every((a: string) => isValidAddress(a))) {
            getPossibleActions(); 
        } else {
            setFormActions([]);
        }
    },[formAddresses]);

    // Determines possible role-changing actions for all addresses
    const getPossibleActions = async () => {
        const commonRolesResp = await getCommonRoles(formAddresses);
        if(commonRolesResp.status === "Failure") {
            console.log(commonRolesResp.error);
            setFormActions([]);
            setError(commonRolesResp.error);
            setShowSuccess(false);
            return;
        }

        const commonRoles = commonRolesResp.commonRoles;
        const commonNonRoles = commonRolesResp.commonNonRoles;
        const newActions: RoleChangeAction[] = [];

        // Add Student
        if(commonNonRoles.includes(ContractRole.CURRENT_STUDENT)) {
            newActions.push(RoleChangeAction.ADD_STUDENT_ROLE);
        }

        // Remove Student
        if(commonRoles.includes(ContractRole.CURRENT_STUDENT)) {
            newActions.push(RoleChangeAction.REMOVE_STUDENT_ROLE);
        }

        // Change Student to Previous Student
        if(commonRoles.includes(ContractRole.CURRENT_STUDENT) && commonNonRoles.includes(ContractRole.PREVIOUS_STUDENT)) {
            newActions.push(RoleChangeAction.CHANGE_STUDENT_TO_ALUM);
        }

        // Add Admin
        if(isCooper && commonNonRoles.includes(ContractRole.ADMIN)) {
            newActions.push(RoleChangeAction.ADD_ADMIN);
        }

        // Remove Admin
        if(isCooper && commonRoles.includes(ContractRole.ADMIN)) {
            newActions.push(RoleChangeAction.REMOVE_ADMIN);
        }

        setFormActions(newActions);
    }

    // Address form helper functions
    const addFormAddress = () => {
        const newAddresses = formAddresses.slice();
        newAddresses.push('');
        setFormAddresses(newAddresses);
        setSelectedAction(null);
    }
    const deleteFormAddress = (index: number) => {
        const newAddresses = formAddresses.slice().filter((v,ind) => ind !== index);
        setFormAddresses(newAddresses);
        setSelectedAction(null);
    }
    const updateFormAddress = (index: number, newAddress: string) => {
        const newAddresses = formAddresses.slice();
        newAddresses[index] = newAddress;
        setFormAddresses(newAddresses);
        setSelectedAction(null);
    }

    // Gets enum value from selector value
    const getEnumValue = (v: string) => {
        const enumIndex = Object.values(RoleChangeAction).indexOf((v as RoleChangeAction));
        return Object.values(RoleChangeAction)[enumIndex];
    }

    // Checks if form is valid
    const isFormValid = () => {
        return formAddresses.every((a: string) => isValidAddress(a)) && selectedAction !== null
            && (new Set(formAddresses).size === formAddresses.length);
    }

    // Submits form
    const submitChange = async () => {
        if(selectedAction === null) {
            return;
        }
        setIsLoading(true);
        const changeFunction = formActionsToFncs[selectedAction];
        const changeResp = await changeFunction(formAddresses);
        if(changeResp.status === "Failure") {
            setError(changeResp.error);
            console.log(changeResp.error);
            setShowSuccess(false);
        } else {
            setShowSuccess(true);
        }
        setIsLoading(false);
    }

    return (
        <Box alignSelf="center" p={8} pt={4} maxW={'1200px'} minW={300} w={'50%'} borderWidth={1} 
                borderRadius={8} boxShadow="lg" borderColor={MID_SHADE_COLOR}>
            <Stack>
                <Heading size={'md'} pb={2}>
                    Update Roles
                </Heading>
                <form onSubmit={e => {e.preventDefault(); onConfirmationModalOpen()}}>
                    <Stack>
                        {/* Error Message */}
                        {error !== null && <FormErrorMessage error={error} /> }

                        {/* Success Message */}
                        {showSuccess && (
                            <FormSuccessMessage message={'Success'} />
                        )}
                        
                        {/* Wallet Addresses Field */}
                        <FormControl isRequired>
                            <Flex>
                                <FormLabel>Wallet Addresses</FormLabel>
                                <FormTooltip message={"Ethereum addresses must be of form: '0x' followed by 40 characters."} />
                            </Flex>
                            <FormHelperText textAlign='left'>
                                Add all ETH wallet addresses you would like to update.
                            </FormHelperText>
                            <FormHelperText textAlign='left'>
                                The same action must be able to be done to each.
                            </FormHelperText>
                            {formAddresses.map((address, ind) => (
                                <HStack key={ind} mt={2}>
                                    <Input type={"text"} placeholder={"0x0"} value={address} aria-label={`walletAddr#${ind+1}`}  
                                        borderColor={MID_SHADE_COLOR} _hover={{borderColor: DARK_SHADE_COLOR}}
                                        onChange={(val) => {updateFormAddress(ind, val.currentTarget.value)}} 
                                        focusBorderColor={DARK_SHADE_COLOR} isInvalid={address.length > 0 && !isValidAddress(address)} />
                                        {formAddresses.length > 1 && (
                                            <FormIconButton iconType='Delete' ariaLabel='Remove Address' message={'Remove wallet address'}
                                                onClick={() => {deleteFormAddress(ind);}} borderRadius={8} />
                                        )}
                                </HStack>
                            ))}
                        </FormControl>
                                
                        {/* Add Address Button */}
                        <FormIconButton iconType='Add' ariaLabel='Add Address' message={'Add wallet address'}
                            onClick={addFormAddress} borderRadius={8} />
                                
                        {/* Action Selector */}
                        <FormControl isRequired pt={4}>  
                            <FormLabel>Update Action</FormLabel>
                            {formActions.length === 0 && formAddresses.length > 1 && (
                                <FormHelperText textAlign={'left'}>
                                    All addresses must have the same action available to them in order for it to be an option below
                                </FormHelperText>
                            )}
                            <Select placeholder='Select an action' size='md' borderColor={MID_SHADE_COLOR} 
                                    _hover={{borderColor: DARK_SHADE_COLOR}} focusBorderColor={DARK_SHADE_COLOR} mt={2}
                                    onChange={(a) => {setSelectedAction(getEnumValue(a.target.value))}}>
                                {formActions.map((action) => (
                                    <option value={action} key={action}>{action}</option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Submit Button */}
                        <Box pt={4}>
                           <FormSubmitButton isLoading={isLoading} label={"Submit Update"} isDisabled={!isFormValid()}
                                textHoverColor={BACKGROUND_COLOR} /> 
                        </Box>
                    </Stack>
                </form>
                <FormConfirmationModal header='Confirm Changes' isOpen={isConfirmationModalOpen} onClose={onConfirmationModalClose}
                        confrimationDialog="Once submitted, these accounts will have access to this role's functionality. ETH will be required to revert these changes."
                        submitButtonText={'Confirm Changes'} submitButtonOnClick={submitChange} />
            </Stack>
        </Box>
    );
}