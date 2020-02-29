import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/auth';

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
            <paper-input label="E-mail address" value="{{email}}" maxlength="64"></paper-input>
            <paper-input label="Password" type="password" value="{{password}}" maxlength="32"></paper-input>
            <paper-button raised="" on-tap="_tapLogin">Log in</paper-button>
            <!-- <paper-button raised on-tap="">Sign in with Google</paper-button> -->
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
}

customElements.define(appAuth.is, appAuth);
