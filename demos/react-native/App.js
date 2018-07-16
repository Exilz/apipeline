import React, { Component } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, AsyncStorage } from 'react-native';
import OfflineFirstAPI from 'react-native-offline-api';

const API_OPTIONS = {
    fetchMethod: fetch, // use react native's fetch
    domains: { default: 'https://icanhazdadjoke.com' },
    prefixes: { default: '' },
    middlewares: [setHeadersMiddleware],
    debugAPI: true,
    printNetworkRequests: true
};

const API_SERVICES = {
    random: { path: '', expiration: 5 * 1000, responseMiddleware: (res) => ({ ...res, timestamp: Date.now() }) },
    search: {
        path: 'search',
        responseMiddleware: (res) => (
            {
                ...res,
                results: res.results.map((result) => ({ ...result, timestamp: Date.now()} ))
            }
        )
    }
};

const api = new OfflineFirstAPI(API_OPTIONS, API_SERVICES, AsyncStorage);

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
            const req = await api.get('random');

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
            const req = await api.get('search', { queryParameters: { term } });

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

    get description () {
      return (
        <ScrollView style={styles.descriptionContainer}>
          <Text style={styles.desc}>This demo showcases a very basic usage of the plugin. It uses the default cache driver (AsyncStorage).</Text>
          <Text style={styles.desc}>Two endpoints are registered as services (random & search). Both are using the GET method.</Text>
          <Text style={styles.desc}>You can see how fast the cache resolution is once your request has already been fired and when its cached data is fresh...</Text>
          <Text style={styles.desc}>Restart this application with your phone in offline mode to see how easy it is to make your app offline-first !</Text>
        </ScrollView>
      );
    }

    get btns () {
        return (
            <View style={styles.btnsContainer}>
                { this.btn(this._fetchRandomJoke, 'Fetch a random dad joke \n (cache expires after 5sec)', styles.fetchBtn) }
                { this.btn(() => { this._searchJoke('dogs') }, "Look for a joke about dogs \n (default 5' expiration)", styles.fetchBtn) }
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
            const { id, joke, timestamp } = randomJoke;
            content = (
                <View style={styles.jokeContainer}>
                    <Text>Joke id : { id}</Text>
                    <Text>Joke fetched in { fetchEnd - fetchStart } ms</Text>
                    <Text>Joke parsed at date : { timestamp } (added to response through responseMiddleware)</Text>
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
                const { id, joke, timestamp } = result;
                return (
                    <View style={styles.jokeContainer} key={`key-${index}`}>
                        <Text>Joke id : { id}</Text>
                        <Text>Joke fetched in { fetchEnd - fetchStart } ms</Text>
                        <Text>Joke parsed at date : { timestamp } (added to response through responseMiddleware)</Text>
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
            <ScrollView style={styles.randomJokeContainer}>
                { content }
            </ScrollView>
        );
    }

    render () {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>SEACU</Text>
                { this.description }
                { this.btns }
                { this.randomJoke }
                { this.searchedJokes }
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#ACCFCC',
      padding: 40
  },
  title: {
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: 18,
      marginBottom: 10
  },
  descriptionContainer: {
      flex: 1
  },
  desc: {
    marginBottom: 5
  },
  btnsContainer: {
      flex: 1,
      marginVertical: 10
  },
  btn: {
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      width: '75%',
      height: 50,
      marginVertical: 10
  },
  btnLabel: {
      textAlign: 'center',
      color: '#FFFFFF',
      fontSize: 15
  },
  clearBtn: {
      backgroundColor: '#8A0917'
  },
  fetchBtn: {
      backgroundColor: '#595241'
  },
  randomJokeContainer: {
      flex: 1,
      marginTop: 30
  },
  jokeContainer: {
      flex: 1,
      padding: 5,
      marginBottom: 10
  }
});
