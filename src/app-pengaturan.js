import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class appPengaturan extends LitElement {
    static get properties() {
        return {

        }
    }

    constructor() {
        super()
        window.thisAppPeng = this
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadBatas()
            }
        })
    }

    static get styles() {
        return [styles, css`
            
        `];
    }

    render() {
        return html`
            <app-header-layout>
       
                <div class="narrow" style="margin-top: 30px">
                    <paper-material>
                        <div class="flexSpaceBetween">
                            <span>Batas Pengeluaran</span>
                            <vaadin-integer-field id="inputBatas" min="1" @input="${this.onChangeInput}" value="${this.batas}">
                                <div slot="prefix">Rp</div>
                            </vaadin-integer-field>
                            <paper-button id="btnSimpan" @click="${this._tapSimpan}">Simpan</paper-button>
                        </div>
                    </paper-material>
                </div>
            </app-header-layout>
        `;
    }

    loadBatas() {
        let dbBatasPengeluaran = firebase.database().ref(this.uid + "/batasPengeluaran")

        dbBatasPengeluaran.on('value', dataBatas => {
            this.batas = dataBatas.val()
        })

        // firebase.database().ref(this.uid).child("dompet").on('value', queryResult => {
        //     this.dompet = [];

        //     queryResult.forEach(namaDompet => {
        //         this.dompet = [...this.dompet, namaDompet.val()];
        //         console.log(this.dompet)
        //     })
        // })
    }

    _tapSimpan() { 
        let batasBaru = this.shadowRoot.getElementById('inputBatas').value;

        if ((batasBaru > 1) && (batasBaru != this.batas)) { 
            let dbBatasPengeluaran = firebase.database().ref(this.uid + "/batasPengeluaran")

            dbBatasPengeluaran.set(batasBaru).then(e => 
                console.log("Edit batas pengeluaran berhasil.")
            ).catch(e => console.log(e.message) );

        } else {
            console.log('kuntet')
        }
    }

}

customElements.define('app-pengaturan', appPengaturan);