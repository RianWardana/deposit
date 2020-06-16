import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/auth';
/* 
16 Juni 2020
Tidak bisa menggunakan FirebaseUI karena masalah Polymer 3 di ES6 import
*/

class appAuth extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment">
            :host {
                position:fixed;
                display: block;
                height: 100vh;
            }

            #container {
                width: 280px;
            }

            paper-button {
                background-color: #1E88E5;
                color: white;
                margin: 30px 0 0;
                width: 100%;
            }
        </style>


        <div id="container" class="vertical layout">
            <iron-image style="width:280px; height:80px;" sizing="cover" src="./img/auth.png"></iron-image>
            <!-- Sign in with email and password is disabled -->
            <!-- <paper-input label="E-mail address" value="{{email}}" maxlength="64"></paper-input>
            <paper-input label="Password" type="password" value="{{password}}" maxlength="32"></paper-input>
            <paper-button raised="" on-tap="_tapLogin">Sign in</paper-button> -->
            <paper-button raised="" on-tap="_tapLoginGoogle">Sign in with Google</paper-button>
            <paper-button raised="" on-tap="_tapLoginMicrosoft">Sign in with Microsoft</paper-button>
        </div>

        <paper-toast id="toast"></paper-toast>
    `;
  }

  static get is() {
      return 'app-auth';
  }

  static get properties() {
      return {
          loginStatus: {
              type: Number,
              notify: true
          },

          trigger: {
              type: Number,
              observer: '_triggerLogout'
          },

          email: {
              type: String
          },

          password: {
              type: String
          },

          uid: {
              type: String
          }
      };
  }

    ready() {
        super.ready();
        this.$.container.style.marginTop = (window.innerHeight - 280)/2 - 100 + 'px'
        this.$.container.style.marginLeft = (window.innerWidth - 280)/2 + 'px'

        var config = {
            apiKey: "AIzaSyCAmpmMEFT9nbMaTjI4YDqAa1H1zufc9r0",
            authDomain: "deposit-ce46e.firebaseapp.com",
            databaseURL: "https://deposit-ce46e.firebaseio.com",
            storageBucket: "deposit-ce46e.appspot.com",
            messagingSenderId: "713372742623"
        }; 
        firebase.initializeApp(config);

        window.auth = firebase.auth();

        auth.onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid;
                this.loginStatus = 1;
                this.email = "";
                this.password = "";
                this.$.toast.close();
            }
            else {
                this.loginStatus = 0;
            }
        })
    }

    _triggerLogout() {
        auth.signOut();
    }

    _tapLogin() {
        var ini = this
        this.$.toast.show({text: 'Logging in...', duration: 5000})
        window.promise = auth.signInWithEmailAndPassword(this.email, this.password)
        promise.catch(e => {
            ini.$.toast.close()
            ini.$.toast.show(e.message)
        })
    }

    _tapLoginGoogle() {
        this.$.toast.show({text: 'Logging in...', duration: 5000})
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
    }

    _tapLoginMicrosoft() {
        this.$.toast.show({text: 'Logging in...', duration: 5000})
        var provider = new firebase.auth.OAuthProvider('microsoft.com');
        firebase.auth().signInWithRedirect(provider);
    }
}

customElements.define(appAuth.is, appAuth);
