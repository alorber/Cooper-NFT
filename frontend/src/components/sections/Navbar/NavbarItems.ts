/**
 * List of Navbar Items
 * 
 * The Navbar will be populated using this list.
 * The Navbar can have one submenu per item place in the "children" array.
 */

export type NavbarItem = {
    label: string;
    children?: Array<NavbarItem>;
    href?: string;
}

export const NAVBAR_ITEMS: Array<NavbarItem> = [
    {
        label: 'About',
        href: '/about'
    },
    {
        label: 'Explore',
        href: '/explore'
    },
    {
        label: 'Create',
        href: '/create'
    },
    {
        label: 'My Account',
        children: [
            {
                label: 'Profile',
                href: '/profile'
            },
            {
                label: 'Watch List',
                href: '/watch_list'
            },
            {
                label: 'My NFTs',
                href: '/my_nfts'
            },
            {
                label: 'Settings',
                href: '/settings'
            }
        ]
    }
] 