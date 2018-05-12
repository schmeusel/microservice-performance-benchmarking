import React from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import store from './store/store';
import Layout from './containers/Layout';
import { Palette } from './constants/Theme';

const muiTheme = getMuiTheme({
    palette: Palette,
});

export default () => (
    <MuiThemeProvider muiTheme={muiTheme}>
        <Provider store={store}>
            <Layout />
        </Provider>
    </MuiThemeProvider>
);
