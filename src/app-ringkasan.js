import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

class appRingkasan extends LitElement {
    
    static get properties() {
        return {
            pengeluaran: Object,
            total: Number,
            totalPerKategori: Object,
            kategoriPengeluaran: Array
        }
    }

    constructor() {
        super();
        let yearToday = (new Date()).getFullYear();
        let monthToday = (new Date()).getMonth();
        this.yearMonthLast = new Date(yearToday, monthToday+1).toISOString().slice(0,7);

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadKategoriPengeluaran();
                this.loadPengeluaran(yearToday, monthToday);
            }
        });
    }

    static get styles() {
        return [styles, css`
            app-toolbar {
                top: 64px;
                background-color: var(--app-primary-color);
                color: #fff;
                padding: 0;
            }

            #containerRingkasan {
                margin-top: 30px;
            }

            #inputBulan {
                background-color: #fff;
                border: 0;
                border-radius: 2px;
                font-family: 'Roboto', 'Noto', sans-serif;
                padding: 5px;
                width: 100%;
            }
        `];
    }

    render() {
        return html`
            <app-header-layout>
                <app-header slot="header">
                    <app-toolbar>
                        <input class="narrow" type="month" id="inputBulan" 
                            @change="${this.onChangedDate}"
                            min="2015-08" 
                            max="${this.yearMonthLast}" 
                            value="${this.yearMonthLast}"
                        >
                    </app-toolbar>
                </app-header>

                <div class="narrow" id="containerRingkasan">
                    
                    <!-- DAFTAR PENGELUARAN -->
                    <paper-material>
                        ${this._toArray(this.pengeluaran).map(item => {
                            return html`
                                <div class="flexSpaceBetween">
                                    <span>${item.nama}</span>
                                    <span>${this._formatJumlah(item.jumlah)}</span>
                                </div>
                            `;
                        })}
                    </paper-material>

                    <!-- TOTAL KATEGORI PENGELUARAN -->
                    <paper-material>
                        <!-- <base-chart id="chart" type="doughnut" .data="${this.totalPerKategori}" .optionsa="{chartOptions}"></base-chart> -->
                        ${this._toArray(this.totalPerKategori).map(item => {
                            return html`
                                <div class="flexSpaceBetween">
                                    <span>${item.nama}</span>
                                    <span>${this._formatJumlah(item.jumlah)}</span>
                                </div>
                            `;
                        })}
                    </paper-material>

                    <!-- TOTAL PENGELUARAN -->
                    <paper-material>
                        <div class="flexSpaceBetween">
                            <span>Total pengeluaran</span>
                            <span>${this._formatJumlah(this.total)}</span>
                        </div>
                    </paper-material>
                </div>
            </app-header-layout>
        `;
    }

    onChangedDate(e) {
        var year = (e.target.value).slice(0,4);
        var month = (e.target.value).slice(5,7);
        this.loadPengeluaran(year, month-1);
    }

    _toArray(obj) {
        let array = [];
        for (const prop in obj) {
            array.push({
                nama: prop,
                jumlah: obj[prop]
            })
        }
        return (array && array.length ? array : [{nama: 'Pengeluaran', jumlah: 0}]);
    }

    _formatJumlah(jumlah) {
        return 'Rp' + parseInt(jumlah).toLocaleString('id-ID')
    }

    // ini sudah ada di tagihan-tambah, harus cari cara bagaimana supaya di sini tidak dilakukan lagi
    // atau tidak apa-apa ya? karena di tagihan-edit juga ada dan sepertinya tidak memberatkan
    loadKategoriPengeluaran() {
        firebase.database().ref(this.uid).child("kategoriPengeluaran").on('value', queryResult => {
            this.kategoriPengeluaran = [];
            
            queryResult.forEach(objNamaPengeluaran => {
                this.kategoriPengeluaran = [...this.kategoriPengeluaran, objNamaPengeluaran.val()];
            });
        });
    }

    loadPengeluaran(year, month) {
        let startTime = new Date(year, month).getTime() / -1000; // pembagi negatif karena key di Firebase negatif
        let endTime = new Date(year, month+1).getTime() / -1000;

        let dbTagihan = firebase.database().ref(this.uid + "/tagihan");
        let dbTagihanMonth = dbTagihan.orderByKey().startAt(endTime.toString()).endAt(startTime.toString()); // dibalik antara endTime dan startTime karena key yang negatif
        
        dbTagihanMonth.once('value', entries => {
            let pengeluaran = {};
            let total = 0;
            let totalPerKategori = {};

            entries.forEach(entry => {
                let nama = entry.val()['nama'];
                let jumlah = entry.val()['jumlah'];

                if (pengeluaran[nama] > 0) pengeluaran[nama] += jumlah;
                else pengeluaran[nama] = jumlah;

                // Hitung total pengeluaran
                total += jumlah;

                // Hitung total pengeluaran per kategori
                for (let kategori of this.kategoriPengeluaran) {
                    if ( (kategori.entri.includes(nama)) || (kategori.nama == 'Lainnya') ) { // user tidak boleh bisa membuat kategori bernama "Lainnya"
                        let a = totalPerKategori[kategori.nama];
                        totalPerKategori[kategori.nama] = (isNaN(a) ? jumlah : a + jumlah);
                        break;
                    }
                }
            });

            this.total = total;

            // Pengeluaran diurut descending
            this.pengeluaran = Object.fromEntries(
                Object.entries(pengeluaran).sort(([,a],[,b]) => b-a)
            );

            // Total per kategori diurut descending
            this.totalPerKategori = Object.fromEntries(
                Object.entries(totalPerKategori).sort(([,a],[,b]) => b-a)
            );

        });   
    }
}

customElements.define('app-ringkasan', appRingkasan);