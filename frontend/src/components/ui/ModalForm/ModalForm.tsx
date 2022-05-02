import react from 'react';
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay
    } from '@chakra-ui/react';

export type ModalFormProps = {
    isOpen: boolean,
    onClose: () => void,
    headerText: string,
    modalBody: React.ReactNode,
    isCentered?: boolean
    modalFooter?: React.ReactNode
}

const ModalForm = ({
    isOpen,
    onClose,
    headerText,
    modalBody,
    isCentered = false,
    modalFooter
}: ModalFormProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered={isCentered}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {headerText}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody mb={6}>
                    {modalBody}
                </ModalBody>
                {modalFooter && (
                    <ModalFooter>
                        {modalFooter}
                    </ModalFooter> 
                )}
            </ModalContent>
        </Modal>
    );
}

export default ModalForm;