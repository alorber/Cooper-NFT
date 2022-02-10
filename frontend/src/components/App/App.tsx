import logo from './logo.svg';
import React from 'react';
import SellPageLayout from '../layouts/SellPageLayout/SellPageLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {

  return (
    <BrowserRouter>
      <Stack className='App' h={'100%'}>
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/sell' element={<SellPageLayout />} />
        </Routes>
      </Stack>
    </BrowserRouter>
  );
}

export default App;
