import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';
// import '@material/mwc-tab-bar';
// import '@material/mwc-tab';


class appPengaturan extends LitElement {
  static get properties() {
    return {
        
      }
  }

  constructor() {
    super()
    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        this.uid = firebaseUser.uid
        this.loadDompet()
      }
    })
  }

  render() {
    return html`
      Pengaturan page loaded successfully.
    `;
  }

  loadDompet() {
    firebase.database().ref(this.uid).child("dompet").on('value', queryResult => {
        this.dompet = [];
        
        queryResult.forEach(namaDompet => {
          this.dompet = [...this.dompet, namaDompet.val()];
          console.log(this.dompet)
        })
    })
  }

}

customElements.define('app-pengaturan', appPengaturan);