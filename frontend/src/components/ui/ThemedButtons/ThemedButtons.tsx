import React from 'react';
import { Button } from '@chakra-ui/react';
import { LIGHT_SHADE_COLOR, MID_SHADE_COLOR, NAVBAR_BORDER_COLOR } from '../../../COLORS';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Themed button to link pages
 */

export type ThemedLinkButtonProps = {
    label: string,
    routeTo: string,
    onClick?: () => void
    width?: string | number | (string | number)[],
    maxWidth?: string
    borderRadius?: number
};

export const ThemedLinkButton = ({label, routeTo, onClick, width, maxWidth, borderRadius}:  ThemedLinkButtonProps) => {

    return (
        <Button as={RouterLink} to={routeTo} onClick={onClick} boxShadow='sm' backgroundColor={MID_SHADE_COLOR} 
                _hover={{boxShadow: 'md'}} _active={{boxShadow: 'lg'}} _focus={{outline: "none"}}
                width={width} borderRadius={borderRadius} maxWidth={maxWidth}>
            {label}
        </Button>
    );
}

/**
 * Regular themed button
 */

 export type ThemedToggleButtonProps = {
    label: string,
    onClick?: () => void,
    active?: boolean,
    width?: string | number
    locationInGroup?: 'Left' | 'Right'  /* Will remove border rounding to connect buttons in group */
};

export const ThemedToggleButton = ({label, onClick, active = true, width, locationInGroup}:  ThemedToggleButtonProps) => {

    return (
        <Button onClick={onClick} boxShadow='sm' backgroundColor={active ? MID_SHADE_COLOR : LIGHT_SHADE_COLOR} 
                _hover={{boxShadow: 'md'}} _active={{boxShadow: 'lg'}} _focus={{outline: "none"}}
                width={width} roundedTopLeft={locationInGroup === 'Right' ? 'none' : 'base'} 
                roundedTopRight={locationInGroup === 'Left' ? 'none' : 'base'} 
                roundedBottomLeft={locationInGroup === 'Right' ? 'none' : 'base'} 
                roundedBottomRight={locationInGroup === 'Left' ? 'none' : 'base'}
                borderRight={locationInGroup === 'Left' ? `.5px solid ${NAVBAR_BORDER_COLOR}` : 'none'}>
            {label}
        </Button>
    );
}