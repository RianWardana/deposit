import {PolymerElement, html} from '@polymer/polymer';
import {firebase} from './firebase.js';

// akan convert ke LitElement saat kirimDataEdit dan kirimDataTambah pindah ke component masing-masing
// atau bisa juga tagihan-data digabung dengan tagihan-list

class tagihanData extends PolymerElement {

    static get properties() {
        return {
            dataTagihan: { 
                type: Array,
                notify: true
            },

            kategoriPengeluaran: {
                type: Array,
                notify: true,
                value: [
                    {nama: "Makan", entri: ["Makan", "Minum", "Go-Food", "GrabFood", "Sereal"]},
                    {nama: "Transportasi", entri: ["Transportasi", "e-Money", "Parkir", "Go-Jek Subs", "Grab Subs", "Go-Ride", "GrabRide", "Go-Car", "GrabCar"]},
                    {nama: "Utilities", entri: ["Listrik", "FirstMedia", "Pulsa XL"]},
                    {nama: "Higiene", entri: ["Higiene", "Sabun", "Tisu", "Laundry"]},
                    {nama: "Lainnya", entri: ["Lainnya", "Obat"]}
                ]
            },

            totalPengeluaran: {
                type: Object,
                value: {total: 0, today: 0},
                notify: true
            }
        };
    }

    ready() {
        super.ready();
        window.thisTagDat = this;

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadTagihan()
            }
            else {
                this.dataTagihan = []
            }
        })
    }

    loadTagihan() {
        console.log('loadTagihan')

        this.dbTagihan = firebase.database().ref(this.uid + "/tagihan")
        this.dbTagihanLimited = this.dbTagihan.orderByChild('lunas').equalTo(0)

        var dateObjectToday = new Date()
        var tanggalToday = (dateObjectToday.getDate() < 10 ? "0" : "") + dateObjectToday.getDate();
        var bulanToday = (dateObjectToday.getMonth() < 9 ? "0" : "") + (dateObjectToday.getMonth() + 1);

        // Tereksekusi setiap ada perubahaan di database 'tagihan' //
        this.dbTagihanLimited.on('value', snap => {
            this.dataTagihan = [];
            var total = 0;
            var today = 0;
            
            // Tereksekusi untuk setiap entri di 'tagihan' //
            snap.forEach(snapEach => {
                var dateObject = new Date(parseInt(snapEach.key)*(-1000))
                var tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate()
                var bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1)
                var tahun = dateObject.getYear() - 100
                var waktu = tanggal + "/" + bulan + "/" + tahun
                var nama = snapEach.val()['nama']
                var jumlah = snapEach.val()['jumlah']

                // Jika terdapat pengeluaran bulan sebelumnya
                if (bulan != bulanToday)
                return;

                // Perhitungan
                total += jumlah

                if ((tanggal == tanggalToday) && (bulan == bulanToday))
                    today += jumlah

                this.push('dataTagihan', {
                    key: snapEach.key,
                    waktu: waktu,
                    nama: nama,
                    jumlah: jumlah
                })
            });

            this.totalPengeluaran = {
                today: today,
                total: total
            }
        });
    }

    lunasiSemua() {
        this.dataTagihan.forEach(tagihan => {
            console.log(tagihan.key)
            this.dbTagihan.child(tagihan.key).update({lunas: 1})
        })
    }
}

customElements.define('tagihan-data', tagihanData);