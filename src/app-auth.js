import {LitElement, html, css} from 'lit-element';
import firebase from '@firebase/app';
import '@firebase/auth';
/* 
16 Juni 2020
Tidak bisa menggunakan FirebaseUI karena masalah Polymer 3 di ES6 import
*/

class appAuth extends LitElement {
    
    static get properties() {
        return {
            logoutRequest: Number
        };
    }
    
    render() {
        return html`
            <style>
                :host {
                    height: 100vh;
                    margin-top: 20vh;
                    display: flex;
                    justify-content: center;
                }

                #container {
                    width: 280px;
                }

                paper-button {
                    background-color: #1E88E5;
                    color: white;
                    margin: 10px 0 10px;
                    width: 280px;
                }
            </style>

            <div id="container" class="vertical layout">
                <iron-image style="width:280px; height:80px;" sizing="cover" src="./img/auth.png"></iron-image>
                <paper-button raised="" @click="${this._tapLoginGoogle}">Sign in with Google</paper-button>
                <paper-button raised="" @click="${this._tapLoginMicrosoft}">Sign in with Microsoft</paper-button>
                <span>Your privacy is very important to us. This app will not share your personal information.</span>
            </div>

            <paper-toast id="toast"></paper-toast>
        `;
    }

    constructor() {
        super();

        var config = {
            apiKey: "AIzaSyCAmpmMEFT9nbMaTjI4YDqAa1H1zufc9r0",
            authDomain: "deposit-ce46e.firebaseapp.com",
            databaseURL: "https://deposit-ce46e.firebaseio.com",
            storageBucket: "deposit-ce46e.appspot.com",
            messagingSenderId: "713372742623"
        }; 

        firebase.initializeApp(config);
        
        window.auth = firebase.auth();

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                var event = new CustomEvent('login-status-changed', {detail: 1});
                this.shadowRoot.getElementById('toast').close();
            }
            else {
                var event = new CustomEvent('login-status-changed', {detail: 0});
            }
            this.dispatchEvent(event);
        })
    }

    // If there is a logout request from the parent component
    updated(changedProps) {
        if (changedProps.has('logoutRequest')) {
            firebase.auth().signOut();
        }
    }

    _tapLoginGoogle() {
        this.shadowRoot.getElementById('toast').show({text: 'Logging in...', duration: 5000})
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
    }

    _tapLoginMicrosoft() {
        this.shadowRoot.getElementById('toast').show({text: 'Logging in...', duration: 5000})
        var provider = new firebase.auth.OAuthProvider('microsoft.com');
        firebase.auth().signInWithRedirect(provider);
    }
}

customElements.define('app-auth', appAuth);