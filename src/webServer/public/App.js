import React, { Component } from 'react';
import { Provider } from 'react-redux';
import io from 'socket.io-client';
import store from './store/store';
import Layout from './containers/Layout';

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Layout />
            </Provider>
        );
    }
}
