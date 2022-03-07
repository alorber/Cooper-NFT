import * as React from 'react';
import { BACKGROUND_COLOR, DARK_SHADE_COLOR } from '../../../COLORS';
import {
    Box,
    ComponentWithAs,
    Flex,
    Icon,
    IconProps,
    Stack,
    Text
    } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

/**
 * Styled Navbar List Item
 * 
 * Two types:
 *   1) Top level (can open dropdown menu)
 *   2) Dropdown Menu Item
 */

type StyledListItemProps = {
    isItemDropdown?: boolean,  // Does this list item open another list
    showDropdownIcon?: boolean,  // Used by Navbar
    isDropdownOpen?: boolean, // Used if isItemDropdown is true
    hoverIconType?: ComponentWithAs<"svg", IconProps>,  // Icon to slide in on hover
    children: React.ReactNode
};

const StyledListItem = ({isItemDropdown = false, showDropdownIcon = false, isDropdownOpen = false, 
                        hoverIconType = ChevronRightIcon, children}: StyledListItemProps) => {
    return isItemDropdown ? (
        <Stack direction='row'>
            {/* Link Label */}
            <Text display="block" mr='auto'>
                {children}
            </Text>
            {/* Arrow Icon for Dropdown Menu */}
            {showDropdownIcon && (
                <Icon as={ChevronDownIcon} transition={'transform .25s ease-in-out'}
                    transform={isDropdownOpen ? 'rotate(180deg)' : ''} w={6} h={6} />
            )}
        </Stack>
    ) : (
        <Stack direction={'row'} align={'center'}>
            {/* Link Label */}
            <Box>
                <Text transition={'all .3s ease'} _groupHover={
                            {color: hoverIconType !== ChevronRightIcon ? BACKGROUND_COLOR : DARK_SHADE_COLOR}
                        } fontWeight={500}>
                    {children}
                </Text>
            </Box>
            {/* Arrow Icon */}
            <Flex transition={'all .3s ease'} transform={'translateX(-10px)'} opacity={0}
                    _groupHover={{opacity: '100%', transform: "translateX(0)"}} justify={'flex-end'}
                    align={'center'} flex={1}>
                <Icon color={hoverIconType !== ChevronRightIcon ? BACKGROUND_COLOR : DARK_SHADE_COLOR} 
                        w={5} h={5} as={hoverIconType} />
            </Flex>
        </Stack>
    );
}

export default StyledListItem;