import React, { Component } from 'react';
import { Provider } from 'react-redux';
import io from 'socket.io-client';
import store from './store/store';
import Layout from './containers/Layout';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import { Palette } from './constants/Theme';

const muiTheme = getMuiTheme({
    palette: Palette
});

export default () => (
    <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
            <Layout />
        </Provider>
    </MuiThemeProvider>
);
