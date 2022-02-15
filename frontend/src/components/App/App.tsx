import React from 'react';
import SellPageLayout from '../layouts/SellPageLayout/SellPageLayout';
import FunctionalityTestLayout from '../layouts/FunctionalityTestLayout/FunctionalityTestLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {

  return (
    <BrowserRouter>
      <Stack className='App' h={'100%'}>
        <Routes>
          <Route path='/' element={<>Home Page</>} />
          <Route path='/sell' element={<SellPageLayout />} />
          <Route path='/test' element={<FunctionalityTestLayout />} />
        </Routes>
      </Stack>
    </BrowserRouter>
  );
}

export default App;
