import react from 'react';
import {
    Grid,
    GridItem,
    Input,
    InputGroup,
    InputLeftElement
    } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

type FilterBoxProps = {

}

const FilterBox = ({}: FilterBoxProps) => {

    return (
        <Grid w='100%' templateColumns={'2fr repeat(2,1fr)'}>
            {/* Search Bar */}
            <GridItem>
                <InputGroup>
                    <InputLeftElement pointerEvents={'none'} children={<SearchIcon />} />
                    <Input type='search' placeholder='Search' />
                </InputGroup>
            </GridItem>
        </Grid>
    )
}

export default FilterBox;