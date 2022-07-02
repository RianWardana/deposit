import {LitElement, html, css} from 'lit-element';
import {firebase} from './firebase.js';

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
                    margin-top: 20vh;
                    display: flex;
                    justify-content: center;
                }

                #container {
                    width: 280px;
                }

                mwc-button {
                    background-color: #1E88E5;
                    color: white;
                    margin: 10px 0 10px;
                    width: 280px;
                }
            </style>

            <div id="container" class="vertical layout">
                <iron-image style="width:280px; height:80px;" sizing="cover" src="./img/auth.png"></iron-image>
                <mwc-button raised="" @click="${this._tapLoginGoogle}">Sign in with Google</mwc-button>
                <mwc-button raised="" @click="${this._tapLoginMicrosoft}">Sign in with Microsoft</mwc-button>
                <span>Your privacy is very important to us. This app will not share your personal information.</span>
            </div>

            <paper-toast id="toast"></paper-toast>
        `;
    }

    constructor() {
        super();
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                var event = new CustomEvent('login-status-changed', {detail: 1});
                this.shadowRoot.getElementById('toast').close();
                this.uid = firebaseUser.uid;
                this.checkUserData();
            }
            else {
                var event = new CustomEvent('login-status-changed', {detail: 0});
            }
            this.dispatchEvent(event);
        })
    }

    checkUserData() {
        let refKategoriPengeluaran = firebase.database().ref(this.uid + "/kategoriPengeluaran")
        let refNamaMutasi = firebase.database().ref(this.uid + "/namaMutasi")

        refKategoriPengeluaran.get().then(data => {
            if (!data.exists()) {
                refKategoriPengeluaran.set({
                    0: {nama: 'Makan', entri: ['Makan','Minum']},
                    1: {nama: 'Transportasi', entri: ['Bensin','Parkir']},
                    99: {nama: 'Lainnya', entri: ['Lainnya']}
                }).then(e => {
                    console.log("Penambahan kategori pengeluaran berhasil.")
                }).catch(e => 
                    console.log(e.message));
            }
        })

        refNamaMutasi.get().then(data => {
            if (!data.exists()) {
                refNamaMutasi.set({
                    0: {jenis: 'kredit', nama: 'Saldo Awal'}
                }).then(e => {
                    console.log("Penambahan nama mutasi berhasil.")
                }).catch(e => 
                    console.log(e.message));
            }
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