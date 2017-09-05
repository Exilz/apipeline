import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import Demo from 'app/src/Demo';

export default class OfflineApiDemo extends Component {
    render() {
        return <Demo />;
    }
}

AppRegistry.registerComponent('OfflineApiDemo', () => OfflineApiDemo);
