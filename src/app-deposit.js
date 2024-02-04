/*
To do:
- Tab dompet diurutkan berdasarkan nama
*/

import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import '@material/mwc-dialog/mwc-dialog.js';
import '@material/mwc-fab/mwc-fab.js';
import '@material/mwc-icon-button/mwc-icon-button.js';
import '@material/mwc-list/mwc-list.js';
import '@material/mwc-list/mwc-list-item.js';

// import '@polymer/paper-checkbox'; //sudah tidak pakai checkbox sejak tidak ada fitur salin ke Rekening 
import '@polymer/paper-dialog';

import '@vaadin/tabs/theme/material/vaadin-tabs.js';
import '@vaadin/combo-box/theme/material/vaadin-combo-box.js';
import '@vaadin/integer-field/theme/material/vaadin-integer-field.js';   

import './rekening-list.js';
import './rekening-item.js';
import './rekening-tambah.js';

import './tagihan-list.js';
import './tagihan-item.js';
import './tagihan-tambah.js';
import './tagihan-edit.js';

class appDeposit extends LitElement {
    static get properties() {
        return {
            tab_sekarang: String,
            uid: String,
            tabs: Array,
            dataEdit: Object,
            mutasiBaru: Object,
            keyDompet: Number,
            dataMutasi: Array
        }
    }

    static get styles() {
        return [styles, css`
            :host {
                display: block;
            }

            vaadin-tab {
                text-decoration: none;
                font-weight: normal;
                color: #fff;
            }

            vaadin-tab:focus {
                text-decoration: none;
                font-weight: normal;
                color: #fff;
            }

            vaadin-tab[selected] {
                box-shadow: inset 0 -2px 0 0 #fff;
            }

            app-header {
                background-color: var(--app-primary-color);
                color: #fff;
                position: sticky;
            }
        `];
    }

    render() {
        return html`
            <app-header-layout>
                <app-header id="app-header" fixed="" shadow="" slot="header">
                    <vaadin-tabs theme="equal-width-tabs" @selected-changed="${this.selectedChanged}">
                        <vaadin-tab>Pengeluaran</vaadin-tab>    

                        <!-- DAFTAR DOMPET -->
                        ${this.dompet.map((item) => html`
                            <vaadin-tab>${item.nama}</vaadin-tab>
                        `)}

                    </vaadin-tabs>
                </app-header>

                <!-- To do: ada padding-top 48px, hilang setelah klik halaman lain lalu balik lagi ke sini -->
                
                <div id="pengeluaran">
                    <tagihan-list .dataMutasi="${this.dataMutasi}" .dataDompet="${this.dompet}"></tagihan-list>
                    <tagihan-tambah @mutasi-baru="${this.onMutasiBaru}"></tagihan-tambah>
                    <tagihan-edit .dataEdit="${this.dataEdit}"></tagihan-edit>
                </div>

                <div id="rekening">
                    <rekening-list .dataMutasi="${this.dataMutasi}" .dataDompet="${this.dompet}" .keyDompet="${this.keyDompet}"></rekening-list>
                    <rekening-tambah .dataDompet="${this.dompet}" .keyDompet="${this.keyDompet}"></rekening-tambah>
                </div>

            </app-header-layout>
        `;
    }

    constructor() {
        super();
        console.log("[LOADED] app-deposit");
        this.tabs = ['pengeluaran', 'rekening'];
        this.dompet = [];

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) this.uid = firebaseUser.uid;
        });
    }

    firstUpdated() {
        this.setupToolbar(); 
        this.loadDompet();
        this.loadMutasi();

        // Jika ada event 'tagihan-edit' (sumbernya dari tagihan-list >> tagihan-item)
        this.addEventListener('tagihan-edit', e => {
            this.dataEdit = e.detail;
        })
    }

    setupToolbar() {
        this.shadowRoot.getElementById('app-header').style.top = '64px'
        window.that = this;
        window.addEventListener('scroll', function() {
            that.shadowRoot.getElementById('app-header').style.top = (window.pageYOffset <= 64 ? (64 - window.pageYOffset) : 0) + 'px';
        });
    }

    selectedChanged(e) {
        console.log('app-deposit: selectedChanged')
        let selected = e.detail.value;
        this.keyDompet = selected - 1;
        
        if (selected == 0) {
            this.shadowRoot.getElementById('pengeluaran').style.display = 'block'
            this.shadowRoot.getElementById('rekening').style.display = 'none'
        } else {
            this.shadowRoot.getElementById('pengeluaran').style.display = 'none'
            this.shadowRoot.getElementById('rekening').style.display = 'block'
        }
    }

    // hanya untuk handle salin pengeluaran ke rekening
    onMutasiBaru(e) {
        this.mutasiBaru = e.detail;
    }

    loadDompet() {
        firebase.database().ref(this.uid).child("dompet").on('value', queryResult => {
            console.log('app-deposit: loadDompet()')
            this.dompet = [];

            queryResult.forEach(objDompet => {
                this.dompet = [...this.dompet, {key: objDompet.key, nama: objDompet.val().nama, saldo: objDompet.val().saldo}];
            });

            // Ini kalau dihapus error, tidak tahu kenapa, padahal tidak dipakai
            this.tabs = ['pengeluaran', 'rekening', ...this.dompet.map(item => item.nama)]

            // Mengurutkan berdasar nama --> belum bisa dilakukan karena konten mengikuti urutan, dan asumsinya key=urutan tampil
            // this.dompet = this.dompet.sort((a,b) => {
            //     return ( (a.nama.toLowerCase() > b.nama.toLowerCase()) || (a.nama == 'Tunai') ) ? 1 : -1
            // })
        });
    }

    // Load mutasi untuk bulan ini
    loadMutasi() {
        let dateObjectToday = new Date();
        let startTime = (new Date(dateObjectToday.getFullYear(), dateObjectToday.getMonth(), 1)).getTime() / -1000;

        this.refMutasi = firebase.database().ref(this.uid + "/tagihan")
        let refMutasiThisMonth = this.refMutasi.orderByKey().endAt(startTime.toString())
        
        // Tereksekusi setiap ada perubahaan di database 'tagihan' //
        refMutasiThisMonth.on('value', snapshot => {
            console.log(`app-deposit: loadMutasi()`)
            this.dataMutasi = [];
            
            // Tereksekusi untuk setiap entri di 'tagihan' //
            snapshot.forEach(pengeluaran => {
                var dateObject = new Date(parseInt(pengeluaran.key)*(-1000));
                var tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate();
                var bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1);
                var tahun = dateObject.getYear() - 100;

                // Kredit, Debit, Sumber, Saldo, Group di-0-kan kalau belum ada
                let kredit = (typeof pengeluaran.val()['kredit'] == 'undefined' ? 0 : pengeluaran.val()['kredit'])
                let debit = (pengeluaran.val()['jumlah'] > 0 ? pengeluaran.val()['jumlah'] : pengeluaran.val()['debit'])
                let sumber = (typeof pengeluaran.val()['sumber'] == 'undefined' ? 0 : pengeluaran.val()['sumber'])
                let saldo = (typeof pengeluaran.val()['saldo'] == 'undefined' ? 0 : pengeluaran.val()['saldo'])
                let group = (typeof pengeluaran.val()['group'] == 'undefined' ? 0 : pengeluaran.val()['group'])

                this.dataMutasi.push({
                    key: pengeluaran.key,
                    waktu: tanggal + "/" + bulan + "/" + tahun,
                    nama: pengeluaran.val()['nama'],
                    jumlah: pengeluaran.val()['jumlah'],
                    kredit: kredit,
                    debit: debit,
                    sumber: sumber,
                    saldo: saldo,
                    group: group
                })
            });
        });

    }
}

customElements.define('app-deposit', appDeposit);