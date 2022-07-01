import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import {MDCChipSet} from '@material/chips';
// const chipset = new MDCChipSet(document.querySelector('.mdc-evolution-chip-set'));

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
            paper-button {
                color: #3f3f3f;
                background: #ebebeb;
                padding: 0 16px 0;
                font-weight: 500;
                margin: 0;
                height: 36px
            }

            paper-fab {
                background-color: var(--app-primary-color);
            }

            paper-material {
                padding: 16px
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
                        <paper-button id="btnSimpan" @click="${this._tapSimpan}">Simpan</paper-button>
                    </paper-material>
                
                    ${this.kategoriPengeluaran.map(item => {
                        return html `
                            <paper-material>
                                <div>${item.nama}</div>
                                <div>
                                    ${item.entri.map(item2 => { return html `
                                        <span>${item2}</span>
                                    ` })}
                                </div>
                                <span class="mdc-evolution-chip__text-label">Chip two</span>
                                <paper-button @click="${
                                    e => this._tapEdit(this.key, this.nama, this.jumlah)
                                }">Edit</paper-button>
                            </paper-material>
                        `
                    })}

                </div>
            </app-header-layout>

            <paper-fab id="fab" icon="add" @click="${this.onFabClick}"></paper-fab>
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

}

customElements.define('app-pengaturan', appPengaturan);