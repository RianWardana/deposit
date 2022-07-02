import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-textarea/mwc-textarea.js';

class appPengaturan extends LitElement {
    static get properties() {
        return {
            batas: Number,
            kategoriPengeluaran: Array
        }
    }

    constructor() {
        super()
        this.batas = 5000000
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
            mwc-textfield {
                margin-top: 16px;
                width: 100%;
            }

            mwc-textarea {
                margin-top: 16px;
                height: 150px;
                width: 100%;
            }

            paper-fab {
                background-color: var(--app-primary-color);
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
                        <div>Batas Pengeluaran</div>
                        <div class="">
                            <vaadin-integer-field id="inputBatas" min="1" @input="${this.onChangeInput}" value="${this.batas}">
                                <div slot="prefix">Rp</div>
                            </vaadin-integer-field>
                        </div>
                        <mwc-button id="btnSimpan" @click="${this._tapSimpan}">Simpan</mwc-button>
                    </paper-material>
                
                    ${this.kategoriPengeluaran.map(item => {
                        return html `
                            <paper-material>
                                <div>${item.nama}</div>
                                <div>
                                    ${item.entri.map(item2 => { return html `
                                        <li>${item2}</li>
                                    ` })}
                                </div>

                                <mwc-button @click="${
                                    () => this._tapEdit(item.key, item.nama, item.entri)
                                }">Edit</mwc-button>

                            </paper-material>
                        `
                    })}

                </div>
            </app-header-layout>

            <mwc-dialog id="dialog" heading="Yups">
                <div>
                    <mwc-textfield id="inputKategori" outlined label="Nama Kategori"></mwc-textfield>
                </div>
                <div>
                    <mwc-textarea id="inputEntri" outlined label="Pengeluaran dalam Kategori Ini"></mwc-textarea>
                </div>
                <mwc-button slot="primaryAction" dialogAction="discard">Simpan</mwc-button>

                <mwc-button slot="secondaryAction" dialogAction="cancel">Batal</mwc-button>
                <mwc-button slot="secondaryAction" dialogAction="cancel">Hapus</mwc-button>
            </mwc-dialog>

            <paper-fab id="fab" icon="add" @click="${this.onFabClick}"></paper-fab>
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

            console.log(this.kategoriPengeluaran)
        });
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

    _tapEdit(a,b,c) {
        console.log(`${a}: ${b}`)
        let entriString = c.toString().replace(/ *, */g, '\n');

        this.shadowRoot.getElementById('dialog').show()
        this.shadowRoot.getElementById('dialog').heading = 'Edit Kategori Pengeluaran'
        this.shadowRoot.getElementById('inputKategori').value = b
        this.shadowRoot.getElementById('inputEntri').value = entriString
    }

}

customElements.define('app-pengaturan', appPengaturan);