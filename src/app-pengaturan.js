/*
To do:

*/

import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-textarea/mwc-textarea.js';

class appPengaturan extends LitElement {
    static get properties() {
        return {
            batas: Number,
            kategoriPengeluaran: Array,
            keyEdit: Number,
            isEntriBaru: Boolean
        }
    }

    constructor() {
        super()
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadBatas()
                this.loadKategoriPengeluaran()
            }
        })
    }

    static get styles() {
        return [styles, css`
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

            mwc-textarea {
                margin-top: 16px;
                height: 150px;
                width: 100%;
            }

            mwc-fab {
                --mdc-theme-secondary: var(--app-primary-color);
            }

            paper-material {
                padding: 16px;
            }

            vaadin-integer-field {
                max-width: 100%;
                width: 100%;
            }
        `];
    }

    render() {
        return html`
            <app-header-layout>
                <div class="narrow" style="margin-top: 30px">
                    <paper-material>
                        <h2>Batas Pengeluaran</h2>
                        <div style="margin-left: 8px">
                            <vaadin-integer-field id="inputBatas" min="1" @input="${this.onChangeInput}" value="${this.batas}">
                                <div slot="prefix">Rp</div>
                            </vaadin-integer-field>
                        </div>
                        <mwc-button id="btnSimpan" @click="${this._tapSimpanBatas}">Simpan</mwc-button>
                    </paper-material>
                
                    <hr style="margin: 32px 0px 32px">
                    <h3>Kategori Pengeluaran</h3>

                    ${this.kategoriPengeluaran.map(item => {
                        return html `
                            <paper-material>
                                <h2>${item.nama}</h2>
                                <p>
                                    ${item.entri.map((item2,index) => { 
                                        let koma = (index == 0 ? '' : ', ')
                                        return html `${koma}${item2}` 
                                    })}
                                </p>

                                <mwc-button @click="${
                                    () => this._tapEdit(item.key, item.nama, item.entri)
                                }">Edit</mwc-button>

                            </paper-material>
                        `
                    })}

                </div>
            </app-header-layout>

            <mwc-dialog id="dialog" @closed="${this._dialogClosed}">
                <div>
                    <mwc-textfield id="inputKategori" outlined label="Nama Kategori"></mwc-textfield>
                </div>
                <div>
                    <mwc-textarea id="inputEntri" outlined label="Pengeluaran dalam Kategori Ini"></mwc-textarea>
                </div>
                <mwc-button slot="primaryAction" @click="${this._tapSimpan}">Simpan</mwc-button>
                <mwc-button slot="secondaryAction" dialogAction="cancel">Batal</mwc-button>
                <mwc-button id="btnHapus" slot="secondaryAction" @click="${this._tapHapus}">Hapus</mwc-button>
            </mwc-dialog>

            <mwc-fab id="fab" icon="add" @click="${this._tapAdd}"></mwc-fab>
            <paper-toast id="toastInvalid" text="Ada isian kosong atau isian invalid"></paper-toast>
        `;
    }

    firstUpdated() {
        
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

    // ini sudah ada di tagihan-tambah, harus cari cara bagaimana supaya di sini tidak dilakukan lagi
    // atau tidak apa-apa ya? karena di tagihan-edit juga ada dan sepertinya tidak memberatkan
    loadKategoriPengeluaran() {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").on('value', queryResult => {
            this.kategoriPengeluaran = [];
            
            queryResult.forEach(objNamaPengeluaran => {
                // Mengurutkan anggota kategori
                let sortedEntries = objNamaPengeluaran.val().entri.sort((a,b) => {
                    return a.toLowerCase() > b.toLowerCase()  ? 1 : -1
                })

                this.kategoriPengeluaran = [...this.kategoriPengeluaran, 
                    { key: objNamaPengeluaran.key, nama: objNamaPengeluaran.val().nama, entri: sortedEntries }
                ];
            });

            // Mengurutkan berdasar nama kategori
            this.kategoriPengeluaran = this.kategoriPengeluaran.sort((a,b) => {
                return ( (a.nama.toLowerCase() > b. nama.toLowerCase()) || (a.nama == 'Lainnya') ) ? 1 : -1
            })
        });
    }

    _tapSimpanBatas() { 
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

    _tapEdit(a,b,c) {
        this.isEntriBaru = false //dipakai untuk _tapSimpan()
        this.keyEdit = a
        let entriString = c.toString().replace(/ *, */g, '\n');

        this.shadowRoot.getElementById('dialog').show()
        this.shadowRoot.getElementById('dialog').heading = 'Edit Kategori Pengeluaran'
        this.shadowRoot.getElementById('inputKategori').value = b
        this.shadowRoot.getElementById('inputEntri').value = entriString
        this.shadowRoot.getElementById('inputKategori').removeAttribute('disabled')
        this.shadowRoot.getElementById('btnHapus').removeAttribute('disabled')

        // Kategori 'Lainnya' tidak dapat diedit atau dihapus
        if (a == 99) {
            this.shadowRoot.getElementById('inputKategori').setAttribute('disabled', true)
            this.shadowRoot.getElementById('btnHapus').setAttribute('disabled', true)
        }
    }

    _tapAdd() {
        this.isEntriBaru = true //dipakai untuk _tapSimpan()
        let allKeys = this.kategoriPengeluaran.map(kategori => parseInt(kategori.key))
        this.keyEdit = 101

        // Cari angka key yang tersedia
        for(let i = 0; i < 100; i++) {
            if (!allKeys.includes(i)) {
                this.keyEdit = i;
                break;
            }
        }

        this.shadowRoot.getElementById('dialog').show()
        this.shadowRoot.getElementById('dialog').heading = 'Tambah Kategori Pengeluaran'
        this.shadowRoot.getElementById('inputKategori').value = ''
        this.shadowRoot.getElementById('inputEntri').value = ''
        this.shadowRoot.getElementById('inputKategori').removeAttribute('disabled')

        this.shadowRoot.getElementById('fab').style.display = 'none';
        this.shadowRoot.getElementById('btnHapus').setAttribute('disabled', true)
    }

    _tapHapus() {
        this.shadowRoot.getElementById('dialog').close()
        firebase.database().ref(this.uid).child("kategoriPengeluaran").child(this.keyEdit).remove()
    }

    _tapSimpan() {
        let nama = this.shadowRoot.getElementById('inputKategori').value;
        let entri = this.shadowRoot.getElementById('inputEntri').value.split('\n').filter(n => n);

        // Jika kategori baru, cek apakah Nama Kategori sudah ada sebelumnya
        let entriBaru = this.isEntriBaru
        let namaDobel = this.kategoriPengeluaran.find(kategori => kategori.nama.toLowerCase() == nama.toLowerCase())

        if ( (nama == "") || (entri == "") || (entriBaru && namaDobel) ) {
            this.shadowRoot.getElementById('toastInvalid').open()
        } else {
            this.shadowRoot.getElementById('dialog').close();
            this.kirimData({nama, entri});
        }
    }

    kirimData(data) {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").child(this.keyEdit).set(data)
        .then(e => {
            console.log("Edit berhasil.")
        }).catch(e => 
            console.log(e.message));
    }

    _dialogClosed() {
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

}

customElements.define('app-pengaturan', appPengaturan);