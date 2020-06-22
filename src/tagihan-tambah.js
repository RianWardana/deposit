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
            paper-button {
                color: #FFAB00;
            }

            paper-button[disabled] {
                color: #a8a8a8;
            }

            paper-checkbox {
                --paper-checkbox-checked-color: #4CAF50;
                --paper-checkbox-checked-ink-color: #4CAF50;
            }

            paper-fab {
                background-color: #4CAF50;
                position: fixed;
                right: 5%;
                bottom: 5%;
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
                    <paper-button dialog-confirm>Batal</paper-button>
                    <paper-button id="btnTambah" disabled @click="${this.tambah}">Tambah</paper-button>
                </div>
            </paper-dialog>

            <paper-fab id="fab" icon="add" @click="${this.onFabClick}"></paper-fab>
            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    constructor() {
        super();
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadNamaPengeluaran();
            }
        });

        // this.kategoriPengeluaran = [
        //     {nama: "Makan", entri: ["Makan", "Minum", "Go-Food", "GrabFood", "Sereal"]},
        //     {nama: "Transportasi", entri: ["Transportasi", "e-Money", "Parkir", "Go-Jek Subs", "Grab Subs", "Go-Ride", "GrabRide", "Go-Car", "GrabCar"]},
        //     {nama: "Utilities", entri: ["Listrik", "FirstMedia", "Pulsa XL"]},
        //     {nama: "Higiene", entri: ["Higiene", "Sabun", "Tisu", "Laundry"]},
        //     {nama: "Lainnya", entri: ["Lainnya", "Obat"]}
        // ]
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
            jumlah: parseInt(data.jumlah),
            lunas: 0
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

    // onFabClick() {
    //     let db = firebase.database().ref(this.uid).child("kategoriPengeluaran");
    //     db.set(this.kategoriPengeluaran);
    // }

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