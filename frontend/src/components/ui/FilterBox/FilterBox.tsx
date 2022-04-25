import react, { useEffect, useState } from 'react';
import {
    Grid,
    GridItem,
    Input,
    InputGroup,
    InputLeftElement,
    Select
    } from '@chakra-ui/react';
import { NFTMarketItem } from '../../../services/marketplace_contract';
import { SearchIcon } from '@chakra-ui/icons';

enum SortByOptions {
    RECENTLY_ADDED = "Recently Added",
    PRICE_ASC = "Price: Low to High",
    PRICE_DESC = "Price: High to Low"
    // MOST_VIEWED = "Most Viewed"
};

type FilterBoxProps = {
    nftList: NFTMarketItem[],
    setNftList: (nfts: NFTMarketItem[]) => void
}

const FilterBox = ({nftList, setNftList}: FilterBoxProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortByOptions>(SortByOptions.RECENTLY_ADDED);

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
        <Grid w='80%' templateColumns={'2fr repeat(2,1fr)'} px={6}>
            {/* Search Bar */}
            <GridItem>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                    updateSearchResults={updateSearchResults} />
            </GridItem>
            <GridItem>
                <SortBy setSortKey={setSortKey} />
            </GridItem>
        </Grid>
    )
}

export default FilterBox;

// Search Bar Component
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

// Sort-By Selector Component
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

