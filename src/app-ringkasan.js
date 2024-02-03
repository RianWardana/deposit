import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {firebase} from './firebase.js';

import { Chart, registerables } from 'chart.js';

class appRingkasan extends LitElement {
    
    static get properties() {
        return {
            pengeluaran: Object,
            total: Number,
            totalPerKategori: Object,
            kategoriPengeluaran: Array,
            topKategori: Array,
            objKategoriPengeluaran: Object
        }
    }

    constructor() {
        super();
        let yearToday = (new Date()).getFullYear();
        let monthToday = (new Date()).getMonth();
        this.yearMonthLast = new Date(yearToday, monthToday+1).toISOString().slice(0,7);

        // Perlu mendefinisikan variabel yang digunakan di render() agar tidak ada warning
        this.totalPerKategori = {}
        this.totalPerKategori[0] = {}
        this.topKategori = []
        this.objKategoriPengeluaran = {}

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

            canvas {
                max-height: 400px;
            }

            h3 {
                margin: 0 0 10px;
            }

            h4 {
                margin: 0 0 10px;
                color: #FFAB00;
            }

            paper-material {
                padding: 16px;
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
                    
                    <!-- TOTAL PENGELUARAN -->
                    <paper-material>
                        <h4>Total Pengeluaran</h4>
                        <h3>${this._formatJumlah(this.total)}</h3>
                        <canvas id="chart2"></canvas>
                    </paper-material>

                    <!-- TOTAL KATEGORI PENGELUARAN -->
                    <paper-material>
                        <h4>Pengeluaran per Kategori</h4>
                        <canvas id="chart1"></canvas>
                        ${this._toArray(this.totalPerKategori[0]).map(item => {
                            return html`
                                <div class="flexSpaceBetween">
                                    <span>${item.nama}</span>
                                    <span>${this._formatJumlah(item.jumlah)}</span>
                                </div>
                            `;
                        })}
                    </paper-material>

                    <!-- DAFTAR PENGELUARAN -->
                    <!-- <paper-material>
                        <h4>Pengeluaran</h4>
                        ${this._toArray(this.pengeluaran).map(item => {
                            return html`
                                <div class="flexSpaceBetween">
                                    <span>${item.nama}</span>
                                    <span>${this._formatJumlah(item.jumlah)}</span>
                                </div>
                            `;
                        })}
                    </paper-material> -->

                    <!-- DAFTAR KATEGORI (top [maxQtyKategori]) -->
                    ${this._toArray(this.totalPerKategori[0]).map(kategori => {
                        return html `
                            <paper-material>
                            <h4>Kategori: ${kategori.nama}</h4>
                            ${this._toArray(this.pengeluaran).map(item => {
                                // Lewatkan iterasi kalau objKategoriPengeluaran belum selesai loaded
                                if (this.objKategoriPengeluaran[kategori.nama] == undefined) return

                                // Tulis item pengeluaran kalau pengeluaran tersebut termasuk dalam kategori iterasi ini
                                if (this.objKategoriPengeluaran[kategori.nama].includes(item.nama)) {
                                    return html `
                                        <div class="flexSpaceBetween">
                                            <span>${item.nama}</span>
                                            <span>${this._formatJumlah(item.jumlah)}</span>
                                        </div>
                                    `
                                }
                            })}
                            </paper-material>
                        `
                    })}

                    <!-- KATEGORI LAIN -->
                    <!-- <paper-material>
                        <h4>Kategori: Kategori Lain</h4>
                        ${this._toArray(this.pengeluaran).map(item => {
                            let entriTopKategori = []

                            this.topKategori.forEach(tk => {
                                entriTopKategori = [...entriTopKategori, ...this.objKategoriPengeluaran[tk]]
                            })

                            if (!entriTopKategori.includes(item.nama)) {
                                return html `
                                    <div class="flexSpaceBetween">
                                        <span>${item.nama}</span>
                                        <span>${this._formatJumlah(item.jumlah)}</span>
                                    </div>
                                `
                            }
                        })}
                    </paper-material> -->
                </div>
            </app-header-layout>
        `;
    }

    firstUpdated() {
        Chart.register(...registerables)
    }

    onChangedDate(e) {
        var year = (e.target.value).slice(0,4);
        var month = (e.target.value).slice(5,7);
        this.loadPengeluaran(year, month-1);
        this.chart1.destroy()
        this.chart2.destroy()
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
            this.kategoriPengeluaran = []
            this.objKategoriPengeluaran = {}
            
            queryResult.forEach(objNamaPengeluaran => {
                this.kategoriPengeluaran = [...this.kategoriPengeluaran, objNamaPengeluaran.val()]
                this.objKategoriPengeluaran[objNamaPengeluaran.val().nama] = objNamaPengeluaran.val().entri
            });
        });
    }

    loadPengeluaran(year, month) {
        // Akan load data dari beberapa bulan sebelumnya
        let berapaBulanSebelum = 5

        let startTime = new Date(year, month - berapaBulanSebelum).getTime() / -1000; // pembagi negatif karena key di Firebase negatif
        let endTime = new Date(year, month+1).getTime() / -1000;

        let dbTagihan = firebase.database().ref(this.uid + "/tagihan");
        let dbTagihanMonth = dbTagihan.orderByKey().startAt(endTime.toString()).endAt(startTime.toString()); // dibalik antara endTime dan startTime karena key yang negatif
        
        dbTagihanMonth.once('value', entries => {
            let pengeluaran = {};
            let total = 0;
            let totalPerKategori = {};

            for(let i = 0; i <= berapaBulanSebelum; i++) {
                totalPerKategori[i] = {}
            }
            
            entries.forEach(entry => {
                let nama = entry.val()['nama'];
                let jumlah = entry.val()['jumlah'];

                // Jika tidak ada jumlah (berarti mutasi non-pengeluaran)
                if (jumlah < 1) return;

                // Menghasilkan selisih bulan entry dengan bulan saat ini (bulan yang dipilih user)
                const inputDate = new Date(year, month);
                const entryDate = new Date( parseInt(entry.key) * -1000 );
                let inputYear = inputDate.getFullYear();
                let inputMonth = inputDate.getMonth();
                let entryYear = entryDate.getFullYear();
                let entryMonth = entryDate.getMonth();
                let monthDifference = (inputYear - entryYear) * 12 + (inputMonth - entryMonth);

                // Hanya hitung total dan total per item untuk entry di bulan yang dipilih user
                if (monthDifference == 0) {
                    // Hitung total per item
                    if (pengeluaran[nama] > 0) pengeluaran[nama] += jumlah;
                    else pengeluaran[nama] = jumlah;

                    // Hitung total pengeluaran
                    total += jumlah;
                }

                // Hitung total pengeluaran per kategori
                for (let kategori of this.kategoriPengeluaran) {
                    if ( (kategori.entri.includes(nama)) || (kategori.nama == 'Lainnya') ) { // user tidak boleh bisa membuat kategori bernama "Lainnya"
                        let a = totalPerKategori[monthDifference][kategori.nama];
                        totalPerKategori[monthDifference][kategori.nama] = (isNaN(a) ? jumlah : a + jumlah);
                        break;
                    }
                }
            });

            this.total = total;

            // Pengeluaran diurut descending
            this.pengeluaran = Object.fromEntries(
                Object.entries(pengeluaran).sort(([,a],[,b]) => b-a)
            );

            // Total per kategori (beberapa bulan sebelum sampai bulan yang dipilih user) diurut descending
            for (let i = 0; i <= berapaBulanSebelum; i++) {
                this.totalPerKategori[i] = Object.fromEntries(
                    Object.entries(totalPerKategori[i]).sort(([,a],[,b]) => b-a)
                );
            }

            this.loadChart1();
            this.loadChart2(year, month, berapaBulanSebelum);
        });
    }

    loadChart1() {
        let index = 0
        let maxQtyKategori = 4

        let labels = []
        let data = []
        let jumlahSisanya = 0
        
        this._toArray(this.totalPerKategori[0]).forEach(kategori => {
            if (index < maxQtyKategori) {
                labels.push(kategori.nama)
                data.push(kategori.jumlah)
            } else {
                jumlahSisanya += kategori.jumlah
            }
            index++
        })

        // Berisi sebanyak [maxQtyKategori] dengan jumlah terbanyak
        this.topKategori = labels

        let colors = [
            'rgba(243, 156, 18, 1.0)',
            'rgba(52, 152, 219, 1.0)',
            'rgba(46, 204, 113, 1.0)',
            'rgba(26, 188, 156, 1.0)',
            'rgba(149, 165, 166, 1.0)'
        ]

        const ctx = this.shadowRoot.getElementById('chart1').getContext('2d');

        this.chart1 = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [...labels, 'Kategori Lain'],
                datasets: [
                {
                    label: 'Rp',
                    data: [...data, jumlahSisanya],
                    backgroundColor: colors,
                },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            } 
        });

        // this.chart1.data.labels = []
        // this.chart1.data.datasets = []
        // let index = 0

        // this._toArray(this.totalPerKategori).forEach(kategori => {
        //     this.chart1.data.labels.push(kategori.nama)
        //     this.chart1.data.datasets.data.push(kategori.jumlah)
        //     this.chart1.data.datasets.backgroundColor.push(colors[index])
        //     index++
        // })

        // this.chart1.update()
    }

    loadChart2(year, month, berapaBulanSebelum) {
        let maxQtyKategori = 4
        let chartLabels = this.getPreviousMonths(year, month, berapaBulanSebelum)
        let chartData = []

        let colors = [
            'rgba(243, 156, 18, 1.0)',
            'rgba(52, 152, 219, 1.0)',
            'rgba(46, 204, 113, 1.0)',
            'rgba(26, 188, 156, 1.0)',
            'rgba(149, 165, 166, 1.0)'
        ]

        // Kategori yang ditampilkan adalah top [maxQtyKategori] dari kategori yang ada di bulan yang dipilih user
        let kategoriDitampilkan = Object.keys(this.totalPerKategori[0]).slice(0,maxQtyKategori)

        // Hitung kategori lain (kategiri di luar kategori yang ditampilkan)
        let totalKategoriLain = []

        for(let i = berapaBulanSebelum; i >= 0; i--) {
            Object.keys(this.totalPerKategori[i]).forEach(kat => {
                if ( !kategoriDitampilkan.includes(kat) ) {
                    if (totalKategoriLain[berapaBulanSebelum - i] == null) {
                        totalKategoriLain[berapaBulanSebelum - i] = parseInt(this.totalPerKategori[i][kat])
                    }
                    else {
                        totalKategoriLain[berapaBulanSebelum - i] += parseInt(this.totalPerKategori[i][kat])
                    }
                }
            })
        }

        kategoriDitampilkan.forEach((namaKategori, index) => {
            let data = chartLabels.map((x,index) => this.totalPerKategori[berapaBulanSebelum-index][namaKategori])
            chartData.push({
                label: namaKategori,
                data: data,
                backgroundColor: colors[index]
            })
        })

        // Untuk masukkan 'Kategori Lain' ke chart
        chartData.push({
            label: 'Kategori Lain',
            data: totalKategoriLain,
            backgroundColor: colors[maxQtyKategori]
        })

        const ctx = this.shadowRoot.getElementById('chart2').getContext('2d');

        this.chart2 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: chartData,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {position: 'bottom'}
                },
                scales: {
                    x: {stacked: true},
                    y: {stacked: true}
                },
            },
        });
    }

    getPreviousMonths(year, month, count) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const result = [];
      
        // Decrement month and year until count becomes zero
        while (count >= 0) {
          
          if (month < 0) {
            // If month becomes negative, wrap around to December and decrement the year
            month = 11;
            year--;
          }
      
          // Add the formatted month and year to the result array
          result.unshift(`${months[month]} ${year}`);
          count--;
          month--;
        }

        return result;
      }
}

customElements.define('app-ringkasan', appRingkasan);