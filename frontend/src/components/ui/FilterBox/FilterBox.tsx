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

    // Updates search term as typed - includes empty string check
    const updateSearchTerm = (search: string) => {
        if(search === '') {
            updateSearchResults('');
        }
        setSearchTerm(search);
    }

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
                <form onSubmit={e => {e.preventDefault(); updateSearchResults();}}>
                    <InputGroup>
                        <InputLeftElement pointerEvents={'none'} children={<SearchIcon />} />
                        <Input type='search' placeholder='Search' value={searchTerm} 
                            onChange={(v)=>{updateSearchTerm(v.target.value)}} />
                    </InputGroup>
                </form>
            </GridItem>
        </Grid>
    )
}

export default FilterBox;