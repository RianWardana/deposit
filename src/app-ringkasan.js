import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import firebase from '@firebase/app';
import '@firebase/database';

class appRingkasan extends LitElement {
    
    static get properties() {
        return {
            pengeluaran: {type: Object},
            total: {type: Number},
            totalPerKategori: {type: Object},
            kategoriPengeluaran: {type: Array}
        }
    }

    constructor() {
        super();
        let yearToday = (new Date()).getFullYear();
        let monthToday = (new Date()).getMonth();
        this.yearMonthLast = new Date(yearToday, monthToday+1).toISOString().slice(0,7);
        this.loadPengeluaran(yearToday, monthToday);

        this.kategoriPengeluaran = thisTagDat.kategoriPengeluaran;
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

    loadPengeluaran(year, month) {
        var startTime = new Date(year, month).getTime() / -1000; // pembagi negatif karena key di Firebase negatif
        var endTime = new Date(year, month+1).getTime() / -1000;

        // Selanjutnya jangan minta uid dari thisRekDat, cari cara lain, firebase.js mungkin (firebase.js export uid)
        // Lit-Element bisa load global variables, tapi ga bisa store
        window.dbTagihan = firebase.database().ref(thisRekDat.uid + "/tagihan");
        window.dbTagihanMonth = dbTagihan.orderByKey().startAt(endTime.toString()).endAt(startTime.toString()); // dibalik antara endTime dan startTime karena key yang negatif
        
        dbTagihanMonth.once('value', entries => {
            var pengeluaran = {};
            var total = 0;
            var totalPerKategori = {};

            entries.forEach(entry => {
                var nama = entry.val()['nama'];
                var jumlah = entry.val()['jumlah'];

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
            
            this.pengeluaran = pengeluaran;
            this.total = total;
            this.totalPerKategori = totalPerKategori;
        });   
    }
}

customElements.define('app-ringkasan', appRingkasan);