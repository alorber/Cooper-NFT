import react, { useEffect, useState } from 'react';
import {
    ButtonGroup,
    Grid,
    GridItem,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select
    } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';
import { SearchIcon } from '@chakra-ui/icons';
import { ThemedToggleButton } from '../ThemedButtons/ThemedButtons';

enum SortByOptions {
    RECENTLY_ADDED = "Recently Added",
    PRICE_ASC = "Price: Low to High",
    PRICE_DESC = "Price: High to Low"
    // MOST_VIEWED = "Most Viewed"
};

type FilterBoxProps = {
    nftList: NFTMarketItem[],
    setNftList: (nfts: NFTMarketItem[]) => void,
    isMyNFTPage?: boolean
}

const FilterBox = ({nftList, setNftList, isMyNFTPage = false}: FilterBoxProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortByOptions>(SortByOptions.RECENTLY_ADDED);
    const [showListedNFTs, setShowListedNFTs] = useState(true);
    const [showUnlistedNFTs, setShowUnlistedNFTs] = useState(true);

    // Loads list on load
    useEffect(() => {
        updateSearchResults();
    }, [sortKey]);

    // Uses current search-term to update search results
    const updateSearchResults = (s: string | null = null) => {
        const search = s ?? searchTerm;

        // Sorts NFTs alphabetically
        const sortByName = (nft1: NFTMarketItem, nft2: NFTMarketItem) => {
            return nft1.name > nft2.name ? 1 : -1;
        }

         // Sorts NFTs by sortBy value - Optional sortkey param
        const sortNFTs = (nft1: NFTMarketItem, nft2: NFTMarketItem): number => {
            if(sortKey === SortByOptions.RECENTLY_ADDED) {
                // TODO
            } else if(sortKey === SortByOptions.PRICE_ASC) {
                return nft1.price > nft2.price ? 1 : nft1.price < nft2.price ? -1 : sortByName(nft1, nft2);
            } else if(sortKey === SortByOptions.PRICE_DESC) {
                return nft1.price > nft2.price ? -1 : nft1.price < nft2.price ? 1 : sortByName(nft1, nft2);
            }
            return 1;
        }

        // Filters NFT List
        const filteredList = nftList.filter(nft => nft.name.includes(search) || search === '')
        // Sorts List
        filteredList.sort(sortNFTs)
        setNftList(filteredList);
    }

    return (
        <HStack w='80%' px={6}>
            {/* Search Bar */}
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                updateSearchResults={updateSearchResults} />
            <SortBy setSortKey={setSortKey} />
            {isMyNFTPage && (
                <MyNFTPageToggle showListed={showListedNFTs} toggleListed={() => {setShowListedNFTs(!showListedNFTs)}}
                    showUnlisted={showUnlistedNFTs} toggleUnlisted={() => {setShowUnlistedNFTs(!showUnlistedNFTs)}} />
            )}
        </HStack>
    );
}

export default FilterBox;

/*
 * Search Bar Component
 */
type SearchBarProps = {
    searchTerm: string,
    setSearchTerm: (s: string) => void,
    updateSearchResults: (s?: string|null) => void
}

const SearchBar = ({searchTerm, setSearchTerm, updateSearchResults}: SearchBarProps) => {
    // Updates search term as typed - includes empty string check
    const updateSearchTerm = (search: string) => {
        if(search === '') {
            updateSearchResults('');
        }
        setSearchTerm(search);
    }

    return (
        <form onSubmit={e => {e.preventDefault(); updateSearchResults();}}>
            <InputGroup>
                <InputLeftElement pointerEvents={'none'} children={<SearchIcon />} />
                <Input type='search' placeholder='Search' value={searchTerm} 
                    onChange={(v)=>{updateSearchTerm(v.target.value)}} />
            </InputGroup>
        </form>
    );
}

/*
 * Sort-By Selector Component
 */ 
type SortByProps = {
    setSortKey: (s: SortByOptions) => void
}

const SortBy = ({setSortKey}: SortByProps) => {

    // Gets SortByOptions enum value from selector value
    const getEnumValue = (v: string) => {
        const enumIndex = Object.keys(SortByOptions).indexOf(v);
        return Object.values(SortByOptions)[enumIndex];
    }

    return (
        <Select onChange={v => {setSortKey(getEnumValue(v.target.value))}} w={180}>
            {(Object.keys(SortByOptions) as Array<keyof typeof SortByOptions>).map(sortOption => 
                <option value={sortOption} key={sortOption}>
                    {SortByOptions[sortOption]}
                </option>
            )}
        </Select>
    );
}

/*
 * Toggle buttons for listed / unlisted NFTs on MyNFT page
 */

type MyNFTPageToggleProps = {
    showListed: boolean,
    toggleListed: () => void,
    showUnlisted: boolean,
    toggleUnlisted: () => void
}

const MyNFTPageToggle = ({showListed, toggleListed, showUnlisted, toggleUnlisted}: MyNFTPageToggleProps) => {

    return (
        <ButtonGroup spacing={0}>
            <ThemedToggleButton label='Listed' onClick={toggleListed} active={showListed} locationInGroup={'Left'} />
            <ThemedToggleButton label='Unlisted' onClick={toggleUnlisted} active={showUnlisted} locationInGroup={'Right'}/>
        </ButtonGroup>
    )
}