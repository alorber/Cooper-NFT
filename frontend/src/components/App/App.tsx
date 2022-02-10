import logo from './logo.svg';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Stack } from '@chakra-ui/react';
import './App.css';

const App = () => {

  return (
    <BrowserRouter>
      <Stack className='App' h={'100%'}>
        <Routes>
          <Route path='/' element={<></>} />
          <Route path='/sell' element={<></>} />
        </Routes>
      </Stack>
    </BrowserRouter>
  );
}

export default App;
