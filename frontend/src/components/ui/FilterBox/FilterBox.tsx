import react, { useEffect, useState } from 'react';
import {
    Grid,
    GridItem,
    Input,
    InputGroup,
    InputLeftElement
    } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { NFTMarketItem } from '../../../services/marketplace_contract';

type FilterBoxProps = {
    nftList: NFTMarketItem[],
    setNftList: (nfts: NFTMarketItem[]) => void
}

const FilterBox = ({nftList, setNftList}: FilterBoxProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Loads list on load
    useEffect(() => {
        updateSearchResults();
    }, []);

    // Uses current search-term to update search results
    const updateSearchResults = (s: string | null = null) => {
        const search = s ?? searchTerm;

        // Filters NFT List
        setNftList(nftList.filter(nft => nft.name.includes(search) || search === ''));
    } 

    return (
        <Grid w='80%' templateColumns={'2fr repeat(2,1fr)'} px={6}>
            {/* Search Bar */}
            <GridItem>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                    updateSearchResults={updateSearchResults} />
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
    )
}
