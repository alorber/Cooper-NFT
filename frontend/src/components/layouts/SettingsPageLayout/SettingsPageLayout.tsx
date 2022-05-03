import react from 'react';
import { Divider, Heading, Stack } from '@chakra-ui/react';

export type SettingsPageLayoutProps = {

}

const SettingsPageLayout = ({}: SettingsPageLayoutProps) => {

    return (
        <Stack align={'center'}>
            <Heading size={'lg'}>
                Admin Settings
            </Heading>
        </Stack>
    );
}

export default SettingsPageLayout;
