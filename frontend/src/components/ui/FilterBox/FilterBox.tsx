import react, { useEffect, useState } from 'react';
import {
    ButtonGroup,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Select,
    Stack,
    useDisclosure
    } from '@chakra-ui/react';
import { DARK_SHADE_COLOR, MID_SHADE_COLOR } from '../../../COLORS';
import { ETH_PRECISION, NFTMarketItem } from '../../../services/marketplace_contract';
import { FormIconButton, FormSubmitButton } from '../StyledFormFields/StyledFormFields';
import { SearchIcon } from '@chakra-ui/icons';
import { ThemedToggleButton } from '../ThemedButtons/ThemedButtons';

enum SortByOptions {
    RECENTLY_ADDED = "Recently Added",
    PRICE_ASC = "Price: Low to High",
    PRICE_DESC = "Price: High to Low"
    // MOST_VIEWED = "Most Viewed"
};

/**
 * Filter Box Component - Comprised of other filter components in this file
 */
type FilterBoxProps = {
    nftList: NFTMarketItem[],
    setNftList: (nfts: NFTMarketItem[]) => void,
    isMyNFTPage?: boolean,
    EthToUsdRate: number | null
}

const FilterBox = ({nftList, setNftList, isMyNFTPage = false, EthToUsdRate}: FilterBoxProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortByOptions>(SortByOptions.RECENTLY_ADDED);
    const [showListedNFTs, setShowListedNFTs] = useState(true);
    const [showUnlistedNFTs, setShowUnlistedNFTs] = useState(true);
    const [minMoneyFilter, setMinMoneyFilter] = useState<number | string>('');
    const [maxMoneyFilter, setMaxMoneyFilter] = useState<number | string>('');
    const [moneyFilterUnit, setMoneyFilterUnit] = useState<MoneyUnit>("ETH");

    // Loads list on load
    useEffect(() => {
        updateSearchResults();
    }, [sortKey, showListedNFTs, showUnlistedNFTs, minMoneyFilter, maxMoneyFilter, moneyFilterUnit]);

    // If both toggle buttons are off, turn both back on (don't show 0 results)
    useEffect(() => {
        if(!showListedNFTs && !showUnlistedNFTs) {
            setTimeout(() => {
                setShowListedNFTs(true);
                setShowUnlistedNFTs(true);
            }, 500);
        }
    }, [showListedNFTs, showUnlistedNFTs]);

    // Uses current search-term to update search results
    const updateSearchResults = (s: string | null = null) => {
        const search = s ?? searchTerm;

        /* HELPER FUNCTIONS */
        /* ----------------- */

        // Sorts NFTs alphabetically
        const sortByName = (nft1: NFTMarketItem, nft2: NFTMarketItem) => {
            return nft1.name > nft2.name ? 1 : -1;
        }

         // Sorts NFTs by sortBy value - Optional sortkey param
        const sortNFTs = (nft1: NFTMarketItem, nft2: NFTMarketItem): number => {
            if(sortKey === SortByOptions.RECENTLY_ADDED) {
                return isMyNFTPage ? (
                    nft1.timeBought > nft2.timeBought ? -1 : nft1.timeBought < nft2.timeBought ? 1 : sortByName(nft1,nft2)
                ) : (
                    nft1.timeListed > nft2.timeListed ? -1 : nft1.timeListed < nft2.timeListed ? 1 : sortByName(nft1,nft2)
                );
            } else if(sortKey === SortByOptions.PRICE_ASC) {
                return nft1.price > nft2.price ? 1 : nft1.price < nft2.price ? -1 : sortByName(nft1, nft2);
            } else if(sortKey === SortByOptions.PRICE_DESC) {
                return nft1.price > nft2.price ? -1 : nft1.price < nft2.price ? 1 : sortByName(nft1, nft2);
            }
            return 1;
        }

        /* ----------------------- */

        // Filters NFT List by search term
        let filteredList = nftList.filter(nft => nft.name.includes(search) || search === '')
        // If MyNFT page, filters based on toggle
        if(isMyNFTPage) {
            filteredList = filteredList.filter(nft => 
                (showListedNFTs && nft.isListed) || (showUnlistedNFTs && !nft.isListed)
            );
        }
        // Filters NFT list based on price
        filteredList = filteredList.filter(nft => 
            (minMoneyFilter === '' || EthToUsdRate == null || nft.price * (moneyFilterUnit === "USD" ? EthToUsdRate : 1) >= minMoneyFilter) 
            && (maxMoneyFilter === '' || EthToUsdRate == null || nft.price * (moneyFilterUnit === "USD" ? EthToUsdRate : 1) <= maxMoneyFilter)
        );
        // Sorts List
        filteredList.sort(sortNFTs)
        setNftList(filteredList);
    }

    // Resets filters
    const resetFilter = () => {
        setSearchTerm('');
        setShowListedNFTs(true);
        setShowUnlistedNFTs(true);
        setMinMoneyFilter('');
        setMaxMoneyFilter('');
        setMoneyFilterUnit("ETH");
    }

    return (
        <HStack px={12} w='100%' mt={6}>
            {/* Search Bar */}
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
                updateSearchResults={updateSearchResults} />
            <SortBy setSortKey={setSortKey} />
            <FiltersModal minMoney={minMoneyFilter} setMinMoney={setMinMoneyFilter} 
                maxMoney={maxMoneyFilter} setMaxMoney={setMaxMoneyFilter} moneyUnit={moneyFilterUnit}
                setMoneyUnit={setMoneyFilterUnit} isMyNFTPage={isMyNFTPage} showListedNFTs={showListedNFTs}
                setShowListedNFTs={setShowListedNFTs} showUnlistedNFTs={showUnlistedNFTs} setShowUnlistedNFTs={setShowUnlistedNFTs}  />
            <FormIconButton iconType='Refresh' ariaLabel='Reset Filters' onClick={resetFilter} borderRadius={10} message={'Reset Filters'} />
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
        <form onSubmit={e => {e.preventDefault(); updateSearchResults();}} style={{width: '100%'}}>
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
        <Select onChange={v => {setSortKey(getEnumValue(v.target.value))}} w={'15em'}>
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

/**
 * Filter Modal
 */
type FiltersModalProps = {
    minMoney: number | string,
    setMinMoney: (m: number | string) => void,
    maxMoney: number | string,
    setMaxMoney: (m: number | string) => void,
    moneyUnit: MoneyUnit,
    setMoneyUnit: (u: MoneyUnit) => void,
    isMyNFTPage: boolean,
    showListedNFTs: boolean,
    setShowListedNFTs: (v: boolean) => void,
    showUnlistedNFTs: boolean,
    setShowUnlistedNFTs: (v: boolean) => void
}
type MoneyUnit = 'USD' | 'ETH';
const FiltersModal = ({minMoney,
    setMinMoney,
    maxMoney,
    setMaxMoney,
    moneyUnit,
    setMoneyUnit,
    isMyNFTPage,
    showListedNFTs,
    setShowListedNFTs,
    showUnlistedNFTs,
    setShowUnlistedNFTs
}: FiltersModalProps) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [moneyUnitToggle, setMoneyUnitToggle] = useState<MoneyUnit>('ETH');
    const [minVal, setMinVal] = useState<number | string>('');
    const [maxVal, setMaxVal] = useState<number | string>('');
    const [showListedToggle, setShowListedToggle] = useState(false);
    const [showUnlistedToggle, setShowUnlistedToggle] = useState(false);

    // Resets values before showing modal
    const showModal = () => {
        setMinVal(minMoney);
        setMaxVal(maxMoney);
        setMoneyUnitToggle(moneyUnit);
        setShowListedToggle(showListedNFTs);
        setShowUnlistedToggle(showUnlistedNFTs);
        onOpen();
    }

    const applyFilters = () => {
        setMinMoney(minVal);
        setMaxMoney(maxVal);
        setMoneyUnit(moneyUnitToggle);
        setShowListedNFTs(showListedToggle);
        setShowUnlistedNFTs(showUnlistedToggle);
        onClose();
    }

    // Check is min / max fields have error
    const minMaxError = () => {
        return minVal !== '' && maxVal !== '' && minVal > maxVal;
    }

    // True if error in form
    const isSubmitDisabled = () => {
        return minMaxError();
    }

    return (<>
        <FormIconButton iconType='Filter' ariaLabel='Filter Modal' onClick={showModal} borderRadius={10} message={'More Filters'} />
    
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    Filters
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack>
                        {/* Price Filter */}
                        <HStack>
                            <Heading size={'sm'} pr={4}>
                                Price:
                            </Heading>
                            <ButtonGroup spacing={0}>
                                <ThemedToggleButton label='ETH' onClick={() => {setMoneyUnitToggle('ETH')}} 
                                    active={moneyUnitToggle === 'ETH'} locationInGroup={'Left'} />
                                <ThemedToggleButton label='USD' onClick={() => {setMoneyUnitToggle('USD')}} 
                                    active={moneyUnitToggle === 'USD'} locationInGroup={'Right'}/>
                            </ButtonGroup>
                            <NumberInput min={0} borderColor={MID_SHADE_COLOR} value={minVal} onChange={setMinVal}
                                _hover={{borderColor: DARK_SHADE_COLOR}} focusBorderColor={DARK_SHADE_COLOR} 
                                precision={moneyUnitToggle === 'ETH' ? ETH_PRECISION : 2} defaultValue={minMoney} 
                                isInvalid={minMaxError()} >
                                <NumberInputField placeholder='Min' />
                            </NumberInput>
                            <NumberInput min={0} borderColor={MID_SHADE_COLOR} value={maxVal} onChange={setMaxVal}
                                _hover={{borderColor: DARK_SHADE_COLOR}} focusBorderColor={DARK_SHADE_COLOR} 
                                precision={moneyUnitToggle === 'ETH' ? ETH_PRECISION : 2} defaultValue={maxMoney}
                                isInvalid={minMaxError()} >
                                <NumberInputField placeholder='Max' />
                            </NumberInput>
                        </HStack>

                        {/* Listed / Unlisted Toggle */}
                        {isMyNFTPage && (
                            <HStack pt={2}>
                                <Heading size='sm' pr={4}>
                                    Listing Status:
                                </Heading>           
                                <MyNFTPageToggle showListed={showListedToggle} toggleListed={() => {setShowListedToggle(!showListedToggle)}}
                                    showUnlisted={showUnlistedToggle} toggleUnlisted={() => {setShowUnlistedToggle(!showUnlistedToggle)}} />    
                            </HStack>
                        )}
                    </Stack>
                </ModalBody>
                <ModalFooter>
                    <FormSubmitButton isLoading={false} label='Apply' onClick={applyFilters} isDisabled={isSubmitDisabled()} />
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>)
}