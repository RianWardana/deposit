/*
To do:
- Hide/show saldo
*/

import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-textarea/mwc-textarea.js';

class appDompet extends LitElement {
    static get properties() {
        return {
            batas: Number,
            dompet: Array
        }
    }

    static get styles() {
        return [styles, css`
            a { 
                text-decoration: none;
            }

            span[role="button"] { 
                color: #FFAB00;
                margin-left: 10px;
            }

            h2 {
                margin: 0 8px 0;
            }

            p {
                margin: 8px
            }

            mwc-textfield {
                margin-top: 16px;
                width: 100%;
            }

            mwc-fab {
                --mdc-theme-secondary: var(--app-primary-color);
            }

            #fabShow {
                bottom: calc(5% + 76px);
            }

            paper-material {
                padding: 16px;
            }

            vaadin-integer-field {
                margin-top: 16px;
                max-width: 100%;
                width: 100%;
            }
        `];
    }

    render() {
        customElements.whenDefined('mwc-fab').then(() => {
            this.shadowRoot.getElementById('fabShow').addEventListener("touchstart", this._showSaldo.bind(this));
            this.shadowRoot.getElementById('fabShow').addEventListener("touchend", this._hideSaldo.bind(this));
        });

        return html`
            <app-header-layout>
                <div class="narrow" style="margin-top: 30px">

                    ${this.dompet.map(item => html `
                        <paper-material>
                            <div class="content">
                                <div class="flexSpaceBetween">
                                    <span>${item.nama}</span> 
                                    <span class="saldoHidden">Rp...</span>
                                    <span class="saldoShown" style="display:none">${this.formatJumlah(item.saldo)}</span>
                                </div>
                                <div class="flexSpaceBetween">
                                    <span style="color: #ccc">ID: dompet-${item.key}</span> 
                                    <a href="#">
                                        <span role="button" @click="${
                                            e => this._tapEdit(item.key, item.nama, item.saldo)
                                            }">Edit</span>
                                    </a>
                                </div>
                                
                            </div>
                        </paper-material>
                    `)}            

                </div>
            </app-header-layout>

            <mwc-dialog id="dialog" @closed="${this._dialogClosed}">
                <div>
                    <mwc-textfield id="inputNama" outlined label="Nama"></mwc-textfield>
                </div>

                <vaadin-integer-field label="Saldo (Rp)" id="inputSaldo" min="1" @input="${this.onChangeInput}">
                </vaadin-integer-field>

                <mwc-button slot="primaryAction" @click="${this._tapSimpan}">Simpan</mwc-button>
                <mwc-button slot="secondaryAction" dialogAction="cancel">Batal</mwc-button>
                <!-- tidak bisa hapus, karena kalau dompet dihapus maka error di bagian tagihan-list -->
                <!-- <mwc-button id="btnHapus" slot="secondaryAction" @click="${this._tapHapus}">Hapus</mwc-button> -->
            </mwc-dialog>

            <mwc-fab id="fabShow" icon="remove_red_eye"></mwc-fab>
            <mwc-fab id="fab" icon="add" @click="${this._tapAdd}"></mwc-fab>
            <paper-toast id="toastInvalid" text="Ada isian kosong atau isian invalid"></paper-toast>
        `;
    }

    constructor() {
        super()
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid;
                this.loadDompet();
            }
        })
    }

    // Identik dengan yang ada di app-deposit
    loadDompet() {
        firebase.database().ref(this.uid).child("dompet").on('value', queryResult => {
            console.log('app-dompet: loadDompet()')
            this.dompet = [];

            queryResult.forEach(objDompet => {
                this.dompet = [...this.dompet, {key: objDompet.key, nama: objDompet.val().nama, saldo: objDompet.val().saldo}];
            });

            // Mengurutkan berdasar nama
            this.dompet = this.dompet.sort((a,b) => {
                return ( (a.nama.toLowerCase() > b.nama.toLowerCase()) || (a.nama == 'Tunai') ) ? 1 : -1
            })
        });
    }

    formatJumlah(dataJumlah) {
        let dataJumlahInt = parseInt(dataJumlah);
        return "Rp" + dataJumlahInt.toLocaleString('id-ID');
    }

    _showSaldo() {
        this.shadowRoot.querySelectorAll('.saldoHidden').forEach(el => {el.style.display = 'none'});
        this.shadowRoot.querySelectorAll('.saldoShown').forEach(el => {el.style.display = 'block'});
    }

    _hideSaldo() {
        this.shadowRoot.querySelectorAll('.saldoHidden').forEach(el => {el.style.display = 'block'});
        this.shadowRoot.querySelectorAll('.saldoShown').forEach(el => {el.style.display = 'none'});
    }

    _tapEdit(a,b,c) {
        this.isEntriBaru = false //dipakai untuk _tapSimpan()
        this.keyEdit = a

        this.shadowRoot.getElementById('dialog').show()
        this.shadowRoot.getElementById('dialog').heading = 'Edit Kategori Pengeluaran'
        this.shadowRoot.getElementById('inputNama').value = b
        this.shadowRoot.getElementById('inputSaldo').value = c
        this.shadowRoot.getElementById('inputNama').removeAttribute('disabled')
        // this.shadowRoot.getElementById('btnHapus').removeAttribute('disabled')

        // 'Tunai' tidak dapat diedit atau dihapus
        if (a == 0) {
            this.shadowRoot.getElementById('inputNama').setAttribute('disabled', true)
            // this.shadowRoot.getElementById('btnHapus').setAttribute('disabled', true)
        }
    }

    _tapAdd() {
        this.isEntriBaru = true //dipakai untuk _tapSimpan()
        let allKeys = this.dompet.map(item => parseInt(item.key))
        this.keyEdit = 101

        // Cari angka key yang tersedia
        for(let i = 0; i < 100; i++) {
            if (!allKeys.includes(i)) {
                this.keyEdit = i;
                break;
            }
        }

        this.shadowRoot.getElementById('dialog').show()
        this.shadowRoot.getElementById('dialog').heading = 'Tambah Dompet'
        this.shadowRoot.getElementById('inputNama').value = ''
        this.shadowRoot.getElementById('inputSaldo').value = ''
        this.shadowRoot.getElementById('inputNama').removeAttribute('disabled')

        this.shadowRoot.getElementById('fab').style.display = 'none';
        // this.shadowRoot.getElementById('btnHapus').setAttribute('disabled', true)
    }

    _tapHapus() {
        this.shadowRoot.getElementById('dialog').close()
        // firebase.database().ref(this.uid).child("dompet").child(this.keyEdit).remove()
    }

    _tapSimpan() {
        let nama = this.shadowRoot.getElementById('inputNama').value;
        let saldo = this.shadowRoot.getElementById('inputSaldo').value;

        // Jika tambah baru, cek apakah nama tersebut sudah ada sebelumnya
        let entriBaru = this.isEntriBaru
        let namaDobel = this.dompet.find(item => item.nama.toLowerCase() == nama.toLowerCase())

        if ( (nama == "") || (saldo == "") || (entriBaru && namaDobel) ) {
            this.shadowRoot.getElementById('toastInvalid').open()
        } else {
            this.shadowRoot.getElementById('dialog').close();
            this.kirimData({nama, saldo});
        }
    }

    kirimData(data) {
        firebase.database().ref(this.uid).child("dompet").child(this.keyEdit).set(data)
        .then(e => {
            console.log("app-dompet: tambah/edit Dompet berhasil.")
        }).catch(e => 
            console.log(e.message));
    }

    _dialogClosed() {
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

}

customElements.define('app-dompet', appDompet);