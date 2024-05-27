import React from 'react';
import App from 'next/app';
import { ThemeProvider } from '@mui/material/styles';

import '@styles/main.css';

import { theme } from '@styles/theme';

class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props;
        return (
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
        );
    }
}

export default MyApp;
