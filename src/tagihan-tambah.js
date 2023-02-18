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
                <vaadin-combo-box id="comboDompet" placeholder="Sumber Dana" @input="${this.onChangeInput}"></vaadin-combo-box>
                <!-- <paper-checkbox id="inputSalin">Salin ke rekening</paper-checkbox> -->
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
                this.loadComboBox();
            }
        });
    }

    loadComboBox() {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").on('value', queryResult => {
            this.namaPengeluaran = [];
            
            queryResult.forEach(objNamaPengeluaran => {
                this.namaPengeluaran = [...this.namaPengeluaran, ...objNamaPengeluaran.val().entri];
            });

            this.shadowRoot.getElementById('comboBox').items = this.namaPengeluaran.sort();
        });

        firebase.database().ref(this.uid).child("dompet").on('value', queryResult => {
            this.dompet = [];
            this.namaDompet = [];
            
            queryResult.forEach(objDompet => {
                this.dompet = [...this.dompet, {key: objDompet.key, nama: objDompet.val().nama, saldo: objDompet.val().saldo}];
                this.namaDompet = [...this.namaDompet, objDompet.val().nama];
            });
            
            this.shadowRoot.getElementById('comboDompet').items = this.namaDompet.sort();
            this.shadowRoot.getElementById('comboDompet').value = 'Tunai';
        });
    }

    tambah() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;
        let inputDompet = this.shadowRoot.getElementById('comboDompet').value;
        // let inputSalin = this.shadowRoot.getElementById('inputSalin').checked;

        if ((inputNama != "") && (inputJumlah != "") && (inputDompet != "")) { 
            this.shadowRoot.getElementById('dialog').close();

            let objDompet = this.dompet.find(item => item.nama == inputDompet)
            let keyDompet = objDompet.key
            let saldoDompet = objDompet.saldo
            let saldo = saldoDompet - inputJumlah

            this.kirimData({
                nama:inputNama,
                debit: parseInt(inputJumlah),
                kredit: 0,
                jumlah: parseInt(inputJumlah),
                sumber: keyDompet,
                saldo: parseInt(saldo)
            });

            this.updateSaldoDompet({
                key: keyDompet,
                saldo: parseInt(saldo)
            })

            // Salin pengeluaran ke rekening //
            // if (inputSalin) {
            //     let event = new CustomEvent('mutasi-baru', {detail: {
            //         nama: inputNama,
            //         debit: inputJumlah,
            //         kredit: 0
            //     }});
            //     this.dispatchEvent(event);
            // }
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }
    }

    kirimData(data) {
        let dbTagihan = firebase.database().ref(this.uid + "/tagihan");
        let epoch = Math.floor(new Date() / -1000);

        dbTagihan.child(epoch).set(data).then(e => {
            console.log("Penambahan pengeluaran berhasil.")
        }).catch(e => 
            console.log(e.message));
    }

    updateSaldoDompet(data) {
        let ref = firebase.database().ref(`${this.uid}/dompet/${data.key}/saldo`);
        ref.set(data.saldo).then(() => console.log('Saldo dompet updated.')).catch(e => {
            console.log(e.message)
        });
    }

    onDialogClosed() {
        window.onresize = null;
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

    onFabClick() {
        this.shadowRoot.getElementById('comboBox').value = '';
        this.shadowRoot.getElementById('inputJumlah').value = '';
        // this.shadowRoot.getElementById('inputSalin').checked = false;
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