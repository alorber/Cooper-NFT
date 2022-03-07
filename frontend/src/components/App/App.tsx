import FunctionalityTestLayout from '../layouts/FunctionalityTestLayout/FunctionalityTestLayout';
import Navbar from '../sections/Navbar/Navbar';
import React, { useState } from 'react';
import SellPageLayout from '../layouts/SellPageLayout/SellPageLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Stack className='App' h={'100%'}>
        <Navbar isLoggedIn={isLoggedIn} />
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
