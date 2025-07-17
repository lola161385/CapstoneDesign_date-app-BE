import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ColorModeProvider } from './contexts/ColorModeContext';
import Router from './Router';

const App: React.FC = () => {
    return (
        <ColorModeProvider>
            <BrowserRouter>
                <Router />
            </BrowserRouter>
        </ColorModeProvider>
    );
};

export default App;
