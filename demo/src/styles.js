import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ACCFCC',
        padding: 40
    },
    title: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 18
    },
    btnsContainer: {
        marginTop: 50
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
        marginTop: 30
    },
    jokeContainer: {
        padding: 5,
        marginBottom: 10
    }
});
