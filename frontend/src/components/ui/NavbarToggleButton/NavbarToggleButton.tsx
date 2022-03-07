import React from 'react';
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { DARK_SHADE_COLOR, LIGHT_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import { IconButton } from '@chakra-ui/react';

/**
 * Hamburger menu button for mobile navbar
 */

type NavbarToggleButtonProps = {
    isNavbarOpen: boolean,
    toggleNavbar: () => void
};

const NavbarToggleButton = ({isNavbarOpen, toggleNavbar}: NavbarToggleButtonProps) => {
    return (
        <IconButton onClick={toggleNavbar} _focus={{ outline: "none" }}
            icon={isNavbarOpen ? (
                <CloseIcon boxSize={4} />
            ) : (
                <HamburgerIcon boxSize={6} color={DARK_SHADE_COLOR} />
            )}
            aria-label={'Navbar Toggle'} backgroundColor={LIGHT_SHADE_COLOR}
            _hover={{ backgroundColor: MID_SHADE_COLOR }}
        />
    );
}

export default NavbarToggleButton;