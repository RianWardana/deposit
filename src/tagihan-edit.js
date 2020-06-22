import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class tagihanEdit extends LitElement {

    static get properties() {
        return {
            triggerEdit: Boolean,
            dataEdit: Object,
            key: String,
            nama: String,
            jumlah: Number
        }
    }

    static get styles() {
        return [styles, css`
            paper-button {
                color: #FFAB00;
            }

            paper-button[disabled] {
                color: #a8a8a8;
            }
            
            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }

            paper-input[label="Nama"] { margin-right: 20px; }
        `];
    }

    render() {
        customElements.whenDefined('vaadin-combo-box').then(() => {
            this.shadowRoot.getElementById('comboBox').items = this.loadNamaPengeluaran();
        });
        
        return html`
            <paper-dialog id="dialog" @iron-overlay-closed="${this._dialogClosed}">
                <h2>Edit Pengeluaran</h2>
                <div class="flexSpaceBetween">
                    <vaadin-combo-box id="comboBox" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                    <vaadin-integer-field id="inputJumlah" min="1" @input="${this.onChangeInput}">
                        <div slot="prefix">Rp</div>
                    </vaadin-integer-field>
                </div>
                <div class="buttons">
                    <paper-button dialog-confirm>Batal</paper-button>
                    <paper-button id="btnHapus" @click="${this._tapHapus}">Hapus</paper-button>
                    <paper-button id="btnSimpan" @click="${this._tapSimpan}">Simpan</paper-button>
                </div>
            </paper-dialog>

            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    constructor() {
        super(); 

        // untuk tagihan-item, harus cari cara lain karena ini anti-pattern
        window.thisTagEdit = this;

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) this.uid = firebaseUser.uid
        });
    }

    // If edit button was pressed
    updated(changedProps) {
        if (changedProps.has('triggerEdit')) {
            this.shadowRoot.getElementById('dialog').open();
            this.shadowRoot.getElementById('comboBox').value = this.nama;
            this.shadowRoot.getElementById('inputJumlah').value = this.jumlah;
        }
    }

    loadNamaPengeluaran() {
        let daftarNamaPengeluaran = [];

        // anti-pattern, cari cara lain selain menggunakan thisTagDat
        thisTagDat.kategoriPengeluaran.map(费用的事情 => {
            daftarNamaPengeluaran = [...daftarNamaPengeluaran, ...费用的事情.entri];
        });

        return daftarNamaPengeluaran;
    }

    _tapHapus() {
        this.shadowRoot.getElementById('dialog').close();
        this.kirimData({
            key: this.key,
            jumlah: 0
        })
    }

    _tapSimpan() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();
            this.kirimData({
                key: this.key,
                nama: inputNama,
                jumlah: inputJumlah
            });
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }
    }

    kirimData(data) {
        let dbTagihan = firebase.database().ref(this.uid + "/tagihan");

        // Hapus entri jika jumlah == 0
        if (data.jumlah == 0) {
            dbTagihan.child(data.key).remove();
            return;
        }

        // Set entri
        dbTagihan.child(data.key).set({
            nama: data.nama,
            jumlah: parseInt(data.jumlah),
            lunas: 0
        }).then(e => {
            console.log("Edit pengeluaran berhasil.");
        }).catch(e => 
            console.log(e.message));
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnSimpan').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnSimpan').setAttribute('disabled', true);
    }
}

customElements.define('tagihan-edit', tagihanEdit);