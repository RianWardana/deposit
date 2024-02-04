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

            div.flexSpaceBetween {
                margin-top: 0;
            }

            #bt_add {
                margin-top: 10px;
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

                <vaadin-combo-box id="comboDompet" placeholder="Sumber Dana" @input="${this.onChangeInput}"></vaadin-combo-box> 

                <div id="pengeluaranInputs">
                    <div id="pengeluaranInput" class="flexSpaceBetween">
                        <vaadin-combo-box id="comboBox" class="inputNama" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                        <vaadin-integer-field id="inputJumlah" class="inputJumlah" min="1" @input="${this.onChangeInput}">
                            <div slot="prefix">Rp</div>
                        </vaadin-integer-field>
                    </div>
                </div>

                <mwc-button id="bt_add" icon="add" @click="${this.onAddMore}">Add more</mwc-button>
        
                <div class="buttons">
                    <mwc-button dialog-confirm>Batal</mwc-button>
                    <mwc-button id="btnTambah" @click="${this.tambah}">Tambah</mwc-button>
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
                this.loadComboBox()
                this.cloneInputNode()
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

    async cloneInputNode() {
        await this.delay(100)
        this.defaultInputPengeluaran = this.shadowRoot.getElementById('pengeluaranInput').cloneNode(true)
    }

    onAddMore() {
        const pengeluaranInputs = this.shadowRoot.getElementById('pengeluaranInputs')
        const newInputPengeluaran = this.defaultInputPengeluaran.cloneNode(true)
        pengeluaranInputs.appendChild(newInputPengeluaran)

        this.shadowRoot.querySelectorAll('.inputNama').forEach(input => {
            input.items = this.namaPengeluaran.sort();
        })
    }

    async tambah() {
        let inputDompet = this.shadowRoot.getElementById('comboDompet').value
        let inputNama = this.shadowRoot.querySelectorAll('.inputNama')
        let inputJumlah = this.shadowRoot.querySelectorAll('.inputJumlah')

        let dataToSend = []
        let objDompet = this.dompet.find(item => item.nama == inputDompet)
        let keyDompet = objDompet.key
        let saldoDompet = objDompet.saldo
        let saldo = saldoDompet

        inputNama.forEach((inputNamaPengeluaran,index) => {
            let nama = inputNamaPengeluaran.value
            let jumlah = inputJumlah[index].value

            // Lewati kalau baris input (either nama atau jumlah) dikosongkan user
            if ((nama == '') || (jumlah == '')) return

            saldo -= jumlah

            dataToSend.push({
                nama: nama,
                debit: parseInt(jumlah),
                kredit: 0,
                jumlah: parseInt(jumlah),
                sumber: keyDompet,
                saldo: parseInt(saldo)
            })
        })

        // Hentikan ekseskusi fungsi ini jika semua isian kosong
        if (dataToSend.length < 1) {
            this.shadowRoot.getElementById('toastKosong').open()
            return
        } else {
            this.shadowRoot.getElementById('dialog').close();
        }

        if (dataToSend.length == 1) {
            this.kirimData(dataToSend[0])
        } else {
            // Jika 1 transaksi terdiri dari >1 pengeluaran
            let groupID = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1)

            dataToSend.forEach(async (data,index) => {
                let d = data
                d['group'] = index+1
                // bagian ini ga berjalan
                this.kirimData(d)
                // await this.delay(100)
                console.log(d)
            })

            // Kirim data agregat (transaksi)
            let jumlahTotal = saldoDompet - saldo
            let namaAgregat = dataToSend[0].nama + ", etc"

            this.kirimData({
                nama: namaAgregat,
                debit: parseInt(jumlahTotal),
                kredit: 0,
                jumlah: 0,
                sumber: keyDompet,
                saldo: parseInt(saldo)
            })
        }

        // Update saldo dompet
        this.updateSaldoDompet({
            key: keyDompet,
            saldo: parseInt(saldo)
        })

        // let inputNama = this.shadowRoot.getElementById('comboBox').value;
        // let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        /*if ((inputNama != "") && (inputJumlah != "") && (inputDompet != "")) { 
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
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }*/
    }

    kirimData(data) {
        let dbTagihan = firebase.database().ref(this.uid + "/tagihan")
        let epoch = Math.floor(new Date() / -1000)

        // Buat unique identifier untuk group transaction
        let i = (data.group != undefined ? Math.round(data.group)*2 : 0)

        dbTagihan.child(epoch+i).set(data).then(e => {
            console.log(`Penambahan pengeluaran '${data.nama}' sebesar ${data.debit}`)
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
        // Hapus semua dalam pengeluaranInputs kemudian tambah 1 baris input pengeluaran
        this.shadowRoot.getElementById('pengeluaranInputs').innerHTML = ''
        this.onAddMore()

        this.shadowRoot.getElementById('dialog').open();
        this.shadowRoot.getElementById('fab').style.display = 'none';
        // this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnTambah').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }

    delay(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }
}

customElements.define('tagihan-tambah', tagihanTambah);