import React, { Component, PropTypes } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import OfflineFirstAPI from 'react-native-offline-api';
import styles from 'app/src/styles';

const NativeModules = require('NativeModules');

const API_OPTIONS = {
    domains: { default: 'https://icanhazdadjoke.com' },
    prefixes: { default: '' },
    middlewares: [setHeadersMiddleware],
    debugAPI: false,
    printNetworkRequests: true
};

const API_SERVICES = {
    random: { path: '', expiration: 5 * 1000 },
    search: { path: 'search' }
};

const api = new OfflineFirstAPI(API_OPTIONS, API_SERVICES);

async function setHeadersMiddleware () {
    // This doesn't need a middleware, it's just an example
    console.info('Headers middleware fired !');
    return { headers: { 'Accept': 'application/json' } };
}

export default class Demo extends Component {

    constructor (props) {
        super(props);
        this.state = {};
        this._fetchRandomJoke = this._fetchRandomJoke.bind(this);
        this._searchJoke = this._searchJoke.bind(this);
    }

    async _fetchRandomJoke () {
        try {
            this.setState({ randomJokeStatus: 1, searchJokeStatus: 0, fetchStart: Date.now() });
            const req = await api.fetch('random');

            if (req.status === 200) {
                this.setState({ randomJokeStatus: 2, randomJoke: req, fetchEnd: Date.now() });
            } else {
                this._onError();
            }
        } catch (err) {
            this._onError(err);
        }
    }

    async _searchJoke (term) {
        try {
            this.setState({ searchJokeStatus: 1, randomJokeStatus: 0, fetchStart: Date.now() });
            const req = await api.fetch('search', { queryParameters: { term } });

            if (req.status === 200 && req.results && req.results.length) {
                this.setState({ searchJokeStatus: 2, searchedJokes: req.results, fetchEnd: Date.now() });
            } else {
                this._onError();
            }
        } catch (err) {
            this._onError(err);
        }
    }

    _clearCache () {
        api.clearCache();
    }

    _onError (err) {
        this.setState({ searchJokeStatus: 3 });
        err && console.warn(err);
    }

    btn (func, label, style = {}) {
        return (
            <TouchableOpacity onPress={func} style={[styles.btn, style]}>
                <Text style={styles.btnLabel}>{ label }</Text>
            </TouchableOpacity>
        );
    }

    get btns () {
        return (
            <View style={styles.btnsContainer}>
                { this.btn(this._fetchRandomJoke, 'Fetch a random dad joke', styles.fetchBtn) }
                { this.btn(() => { this._searchJoke('dogs') }, 'Look for a joke about dogs', styles.fetchBtn) }
                { this.btn(this._clearCache, 'Clear cache', styles.clearBtn) }
            </View>
        );
    }

    get randomJoke () {
        const { randomJokeStatus, randomJoke, fetchEnd, fetchStart } = this.state;

        if (!randomJokeStatus) {
            return false;
        }
        let content;
        if (randomJokeStatus === 1) {
            content = (
                <Text>Loading the dadliest dad joke...</Text>
            );
        } else if (randomJokeStatus === 2 && randomJoke ) {
            const { id, joke } = randomJoke;
            content = (
                <View style={styles.jokeContainer}>
                    <Text>Joke id : { id}</Text>
                    <Text>Joke fetched in { fetchEnd - fetchStart } ms</Text>
                    <Text>{ joke }</Text>
                </View>
            );
        } else if (randomJokeStatus === 3) {
            content = (
                <Text>Error while fetching a dad joke :(</Text>
            );
        }
        return (
            <ScrollView contentContainerStyle={styles.randomJokeContainer}>
                { content }
            </ScrollView>
        );
    }

    get searchedJokes () {
        const { searchJokeStatus, searchedJokes, fetchEnd, fetchStart } = this.state;

        if (!searchJokeStatus) {
            return false;
        }
        let content;
        if (searchJokeStatus === 1) {
            content = (
                <Text>Looking for dad jokes...</Text>
            );
        } else if (searchJokeStatus === 2 && searchedJokes ) {
            content = searchedJokes.map((result, index) => {
                const { id, joke } = result;
                return (
                    <View style={styles.jokeContainer} key={`key-${index}`}>
                        <Text>Joke id : { id}</Text>
                        <Text>Joke fetched in { fetchEnd - fetchStart } ms</Text>
                        <Text>{ joke }</Text>
                    </View>
                );
            });
        } else if (searchJokeStatus === 3) {
            content = (
                <Text>Error while looking for dad jokes :(</Text>
            );
        }
        return (
            <ScrollView contentContainerStyle={styles.randomJokeContainer}>
                { content }
            </ScrollView>
        );
    }

    render () {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>react-native-offline-api</Text>
                { this.btns }
                { this.randomJoke }
                { this.searchedJokes }
            </View>
        );
    }
}
