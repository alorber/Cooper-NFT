import NavbarLink from '../../ui/NavbarLink/NavbarLink';
import NavbarToggleButton from '../../ui/NavbarToggleButton/NavbarToggleButton';
import React, { useEffect, useState } from 'react';
import { BACKGROUND_COLOR, DARK_SHADE_COLOR, NAVBAR_BORDER_COLOR } from '../../../COLORS';
import {
    Box,
    Collapse,
    Flex,
    Icon,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Stack,
    useDisclosure
    } from '@chakra-ui/react';
import { ContractRole } from '../../../services/contractRoles';
import { FaUserCircle } from 'react-icons/fa';
import { NAVBAR_ITEMS, NavbarItem } from './NavbarItems';
import { ThemedLinkButton } from '../../ui/ThemedButtons/ThemedButtons';

/**
 * Navbar
 * 
 * Two separate inner functions depending on desktop or mobile
 */

type NavbarProps = {
    isLoggedIn: boolean,
    accountRoles: ContractRole[] | null
};

const Navbar = ({isLoggedIn, accountRoles}: NavbarProps) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const { isOpen: isNavbarOpen, onToggle: toggleNavbar, onClose: closeNavbar } = useDisclosure();

    // Determines admin status
    useEffect(() => {
        setIsAdmin(accountRoles?.includes(ContractRole.ADMIN || ContractRole.COOPER) ?? false);
    },[accountRoles]);

    return (
        <Box>
            <Flex w={'fill'} minH={'60px'} py={{ base: 2 }} px={{ base: 4 }} borderBottom={`solid ${NAVBAR_BORDER_COLOR} .5px`}
                    backgroundColor={BACKGROUND_COLOR} align={'center'}>
                {/* Hamburger Menu (Mobile) */}
                <Flex  display={{ base: 'flex', md: 'none' }}>
                    <NavbarToggleButton isNavbarOpen={isNavbarOpen} toggleNavbar={toggleNavbar} />
                </Flex>
                
                {/* Logo / Home Button */}
                <Flex justifyContent={{ base: 'center', md: 'left' }} w='full' alignSelf='center'>
                    <NavbarLink linkTo={"/"} onPageChange={closeNavbar}>
                        {/* !!!!!!!!!!!!!! TODO: ADD LOGO !!!!!!!!!!!!!! */}
                        CU Marketplace
                    </NavbarLink>
                </Flex>

                {/* Desktop Links */}
                <Flex ml='auto' display={{ base: 'none', md: 'flex' }} h='fill'>
                    <DesktopNavbarItems isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
                </Flex>

                {/* Sign In Button on Mobile */}
                {!isLoggedIn && (
                    <Flex alignItems='center' ml='auto' display={{base: 'flex', md: 'none'}}>
                        <ThemedLinkButton label={'Sign In'} routeTo={'/login'} onClick={closeNavbar} />
                    </Flex>
                )}
            </Flex>
  
            {/* Mobile Dropdown Menu */}
            <Collapse in={isNavbarOpen} animateOpacity>
                <MobileNavbarItems closeNavbar={closeNavbar} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
            </Collapse>
      </Box>
    );    
}

/**
 * Navbar items for desktop
 */
type DesktopNavbarItemsProps = {
    isLoggedIn: boolean,
    isAdmin: boolean
}
const DesktopNavbarItems = ({ isLoggedIn, isAdmin }: DesktopNavbarItemsProps) => {
    return (
        <Stack spacing={[4, 4, 10, 20]} align="center" justify={"flex-end"}
                direction={"row"} pr={4}>
            {/* Shows navbar items - Only shows "My Account" if logged in */}
            {NAVBAR_ITEMS.filter(n => (isLoggedIn || n.label !== "My Account"))
            .map((navbarItem: NavbarItem) => (
                <Box key={navbarItem.label}>
                    <Popover trigger={'hover'} placement={'bottom-start'}>
                        {/* Navbar Item */}
                        <PopoverTrigger>
                            <div>
                                {/* If 'My Account', replace with profile icon */}
                                {navbarItem.label === 'My Account' ? (
                                    <NavbarLink linkTo={navbarItem.href ?? '#'}>
                                        <Icon color={DARK_SHADE_COLOR} w={6} h={6} as={FaUserCircle} mt={1.5} />
                                    </NavbarLink>
                                ) : (
                                    <NavbarLink linkTo={navbarItem.href ?? '#'}>{navbarItem.label}</NavbarLink> 
                                )}
                            </div>
                        </PopoverTrigger>

                        {/* Subnav (if item has children) */}
                        {navbarItem.children && (
                            <PopoverContent border={`1px solid ${NAVBAR_BORDER_COLOR}`} boxShadow={'xl'} p={4} rounded={'xl'} minW={'sm'} 
                                    backgroundColor={BACKGROUND_COLOR}>
                                <Stack>
                                    {/* Only shows "Admin Settings" if admin */}
                                    {navbarItem.children.filter(n => (isAdmin || n.label !== 'Admin Settings'))
                                    .map((child) => (
                                        <NavbarLink key={child.label} linkTo={child.href ?? '#'} isSubNav={true}>
                                            {child.label}
                                        </NavbarLink>
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
            
            {/* If not logged in, shows login button */}
            {!isLoggedIn && (
                <ThemedLinkButton label={'Sign In'} routeTo={'/login'} />
            )}
        </Stack>
    );
}
  
/**
 * Navbar items for mobile
 */
 type MobileNavbarItemsProps = {
    closeNavbar: () => void,
    isLoggedIn: boolean,
    isAdmin: boolean
}
const MobileNavbarItems = ({ closeNavbar, isLoggedIn, isAdmin }: MobileNavbarItemsProps) => (
    <Stack p={4} display={{ md: 'none' }}>
        {/* Only shows "My Account" if logged in */}
        {NAVBAR_ITEMS.filter(n => (isLoggedIn || n.label !== "My Account"))
        .map((navbarItem: NavbarItem) => (
            <MobileNavbarItem key={navbarItem.label} navbarItem={navbarItem} 
                closeNavbar={closeNavbar} isAdmin={isAdmin} />
        ))}
    </Stack>
)

/**
 * Navbar items for mobile
 * 
 * Needs separate inner component for useDisclosure()
 */
 type MobileNavbarItemProps = {
    navbarItem: NavbarItem,
    closeNavbar: () => void,
    isAdmin: boolean
}
const MobileNavbarItem = ({ navbarItem, closeNavbar, isAdmin }: MobileNavbarItemProps) => {
    const { isOpen, onToggle, onClose: closeSubmenu } = useDisclosure();
    const hasChildren = (navbarItem.children ?? []).length > 0;

    return (<>
        {/* Navbar Item */}
        <Stack spacing={4} onClick={navbarItem.children && onToggle}>
            <NavbarLink linkTo={navbarItem.href ?? '#'} showDropdownIcon={hasChildren}
                    isDropdownOpen={isOpen} onPageChange={hasChildren ? () => { } : () => { closeNavbar(); closeSubmenu() }}>
                {navbarItem.label}
            </NavbarLink>
        </Stack>

        {/* Dropdown Menu */}
        <Collapse in={isOpen} animateOpacity>
            <Stack pl={4} borderLeft={`solid ${NAVBAR_BORDER_COLOR} .5px`} align='start'>
                {navbarItem.children && (
                    /* Only shows "Admin Settings" if admin */
                    navbarItem.children.filter(n => (isAdmin || n.label !== 'Admin Settings'))
                    .map((child) => (
                        <NavbarLink key={child.label} linkTo={child.href ?? '#'} isSubNav={true} 
                                onPageChange={() => { closeNavbar(); closeSubmenu() }}>
                            {child.label}
                        </NavbarLink>
                    ))
                )}
            </Stack>
        </Collapse>
    </>)
}

export default Navbar;