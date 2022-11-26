import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class tagihanTambah extends LitElement {
    
    static get properties() {
        return {
            // kategoriPengeluaran: Array,
            namaPengeluaran: Array
        };
    }

    static get styles() {
        return [styles, css`
            mwc-button {
                color: #FFAB00;
            }

            mwc-button[disabled] {
                color: #a8a8a8;
            }

            paper-checkbox {
                --paper-checkbox-checked-color: #4CAF50;
                --paper-checkbox-checked-ink-color: #4CAF50;
            }

            mwc-fab {
                --mdc-theme-secondary: #4CAF50;
            }

            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }
        `];
    }
    
    render() {
         return html`
            <paper-dialog id="dialog" @iron-overlay-closed="${this.onDialogClosed}">
                <h2>Tambah Pengeluaran</h2>
                <div class="flexSpaceBetween">
                    <vaadin-combo-box id="comboBox" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                    <vaadin-integer-field id="inputJumlah" min="1" @input="${this.onChangeInput}">
                        <div slot="prefix">Rp</div>
                    </vaadin-integer-field>
                </div>
                <paper-checkbox id="inputSalin">Salin ke rekening</paper-checkbox>
                <div class="buttons">
                    <mwc-button dialog-confirm>Batal</mwc-button>
                    <mwc-button id="btnTambah" disabled @click="${this.tambah}">Tambah</mwc-button>
                </div>
            </paper-dialog>

            <mwc-fab id="fab" icon="add" @click="${this.onFabClick}"></mwc-fab>
            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    constructor() {
        super();
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadKategoriPengeluaran();
            }
        });
    }

    loadKategoriPengeluaran() {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").on('value', queryResult => {
            this.namaPengeluaran = [];
            
            queryResult.forEach(objNamaPengeluaran => {
                this.namaPengeluaran = [...this.namaPengeluaran, ...objNamaPengeluaran.val().entri];
            });

            this.shadowRoot.getElementById('comboBox').items = this.namaPengeluaran.sort();
        });
    }

    tambah() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;
        let inputSalin = this.shadowRoot.getElementById('inputSalin').checked;

        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();

            this.kirimData({
                nama:inputNama,
                jumlah: inputJumlah
            });

            // Salin pengeluaran ke rekening //
            if (inputSalin) {
                let event = new CustomEvent('mutasi-baru', {detail: {
                    nama: inputNama,
                    debit: inputJumlah,
                    kredit: 0
                }});
                this.dispatchEvent(event);
            }
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }
    }

    kirimData(data) {
        let dbTagihan = firebase.database().ref(this.uid + "/tagihan");
        let epoch = Math.floor(new Date() / -1000);

        dbTagihan.child(epoch).set({
            nama: data.nama,
            jumlah: parseInt(data.jumlah)
        }).then(e => {
            console.log("Penambahan pengeluaran berhasil.")
        }).catch(e => 
            console.log(e.message));
    }

    onDialogClosed() {
        window.onresize = null;
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

    onFabClick() {
        this.shadowRoot.getElementById('comboBox').value = '';
        this.shadowRoot.getElementById('inputJumlah').value = '';
        this.shadowRoot.getElementById('inputSalin').checked = false;
        this.shadowRoot.getElementById('dialog').open();
        this.shadowRoot.getElementById('fab').style.display = 'none';
        this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnTambah').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }
}

customElements.define('tagihan-tambah', tagihanTambah);