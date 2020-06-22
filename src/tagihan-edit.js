import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class tagihanEdit extends LitElement {

    static get properties() {
        return {
            dataEdit: Object,
            namaPengeluaran: Array
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

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadNamaPengeluaran()
            }
        });
    }

    // If edit button was pressed
    updated(changedProps) {
        if (changedProps.has('dataEdit')) {
            this.shadowRoot.getElementById('dialog').open();
            this.shadowRoot.getElementById('comboBox').value = this.dataEdit.nama;
            this.shadowRoot.getElementById('inputJumlah').value = this.dataEdit.jumlah;
        }
    }

    loadNamaPengeluaran() {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").on('value', queryResult => {
            this.namaPengeluaran = [];
            
            queryResult.forEach(objNamaPengeluaran => {
                this.namaPengeluaran = [...this.namaPengeluaran, ...objNamaPengeluaran.val().entri];
            });

            this.shadowRoot.getElementById('comboBox').items = this.namaPengeluaran;
        });
    }

    _tapHapus() {
        this.shadowRoot.getElementById('dialog').close();
        this.kirimData({
            key: this.dataEdit.key,
            jumlah: 0
        })
    }

    _tapSimpan() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();
            this.kirimData({
                key: this.dataEdit.key,
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