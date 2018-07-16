import React, { Component } from 'react';
import Link from 'next/link';
import api from '../services/index';

export default class Demo extends Component {

    constructor (props) {
        super(props);
        this.state = {};
        this._fetchRandomJoke = this._fetchRandomJoke.bind(this);
        this._searchJoke = this._searchJoke.bind(this);
    }

    static async getInitialProps () {
        const randomJokeFromServer = await api.get('random');
        console.info('randomJokeFromServer', randomJokeFromServer);
        return { randomJokeFromServer };
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

    btn (func, label) {
        return (
            <div onClick={func} style={{ alignSelf: 'center', justifyContent: 'center', height: '50px' }}>
                <span style={{ textAlign: 'center', fontSize: '16px', color: 'blue', textDecoration: 'underline' }}>{ label }</span>
            </div>
        );
    }

    get description () {
      return (
        <div>
          <p>This demo showcases a very basic usage of the plugin on the browser. It uses <a href={'https://github.com/localForage/localForage'}>localforage</a> as its cache driver.</p>
          <p>Two endpoints are registered as services (random & search). Both are using the GET method.</p>
          <p>You can see how fast the cache resolution is once your request has already been fired and when its cached data is fresh...</p>
          <p>Check out the logs in the console to see how easily you've implemented a caching logic in your web application !</p>
        </div>
      );
    }

    get fetchedFromServer () {
        return (
            <div>
                <hr />
                <h2>Fetch from the server</h2>
                <p>You can use <em>seacu</em> both on the browser and the server. The following data has been fetched before the page was actually displayed.</p>
                <p>To see how you can set up the wrapper in an isomorphic environement, check out <em>services/index.js</em> or the documentation.</p>
                <pre>{ JSON.stringify(this.props.randomJokeFromServer) }</pre>
            </div>
        );
    }

    get btns () {
        return (
            <div style={{  }}>
                <hr />
                <h2>Fetch from the client</h2>
                { this.btn(this._fetchRandomJoke, 'Fetch a random dad joke \n (cache expires after 5sec)') }
                { this.btn(() => { this._searchJoke('dogs') }, "Look for a joke about dogs \n (default 5' expiration)") }
                { this.btn(this._clearCache, 'Clear cache') }
            </div>
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
                <span>Loading the dadliest dad joke...</span>
            );
        } else if (randomJokeStatus === 2 && randomJoke ) {
            const { id, joke, timestamp } = randomJoke;
            content = (
                <div style={{  }}>
                    <p>Joke id : { id}</p>
                    <p>Joke fetched in { fetchEnd - fetchStart } ms</p>
                    <p>Joke parsed at date : { timestamp } (added to response through responseMiddleware)</p>
                    <p>{ joke }</p>
                    <p>Raw data :</p>
                    <pre>{ JSON.stringify(randomJoke) }</pre>
                </div>
            );
        } else if (randomJokeStatus === 3) {
            content = (
                <span>Error while fetching a dad joke :(</span>
            );
        }
        return content;
    }

    get searchedJokes () {
        const { searchJokeStatus, searchedJokes, fetchEnd, fetchStart } = this.state;

        if (!searchJokeStatus) {
            return false;
        }
        let content;
        if (searchJokeStatus === 1) {
            content = (
                <span>Looking for dad jokes...</span>
            );
        } else if (searchJokeStatus === 2 && searchedJokes ) {
            content = searchedJokes.map((result, index) => {
                const { id, joke, timestamp } = result;
                return (
                    <div style={{  }} key={`key-${index}`}>
                        <p>Joke id : { id}</p>
                        <p>Joke fetched in { fetchEnd - fetchStart } ms</p>
                        <p>Joke parsed at date : { timestamp } (added to response through responseMiddleware)</p>
                        <p>{ joke }</p>
                    </div>
                );
            });
        } else if (searchJokeStatus === 3) {
            content = (
                <span>Error while looking for dad jokes :(</span>
            );
        }
        return (
            <div style={{ }}>
                { content }
                <p>Raw data :</p>
                <pre>{ JSON.stringify(searchedJokes) }</pre>
            </div>
        );
    }

    render () {
        return (
            <div>
                <h1>SEACU</h1>
                <h2><em>Super Easy Api Caching Utility</em></h2>
                { this.description }
                { this.fetchedFromServer }
                { this.btns }
                { this.randomJoke }
                { this.searchedJokes }
            </div>
        );
    }
}
