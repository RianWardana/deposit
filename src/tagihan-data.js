import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/database';

class tagihanData extends PolymerElement {

    static get properties() {
        return {
            dataTagihan: { 
                type: Array,
                notify: true
            },

            /* Perhitungan total per kategori dipindah ke ringkasan, 
            tapi yg disini blm didelete jaga2 berubah pikiran */
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
            },

            dataTambah: {
                type: Object,
                observer: 'kirimDataTambah'
            },

            dataEdit: {
                type: Object,
                observer: 'kirimDataEdit'
            },

            waktu: String,
            nama: String,
            jumlah: String,

            uid: {
                type: String
            }
        };
    }

    ready() {
        super.ready();
        window.thisTagDat = this;

        auth.onAuthStateChanged(firebaseUser => {
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

        window.dbTagihan = firebase.database().ref(this.uid + "/tagihan")
        this.dbTagihanLimited = dbTagihan.orderByChild('lunas').equalTo(0)

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

    kirimDataTambah() {
        var epoch = Math.floor(new Date() / -1000)
        
        var data = {
            nama: this.dataTambah['nama'],
            jumlah: parseInt(this.dataTambah['jumlah']),
            lunas: 0
        }

        var submission = dbTagihan.child(epoch).set(data)
        submission.then(e => {
            console.log("Penambahan berhasil.")
        })
        submission.catch(e => console.log(e.message))
    }

    kirimDataEdit() {
        var ini = this
        
        var data = {
            nama: ini.dataEdit['nama'],
            jumlah: parseInt(ini.dataEdit['jumlah']),
            lunas: 0
        }

        if (ini.dataEdit['jumlah'] == 0) dbTagihan.child(ini.dataEdit['key']).remove()
        else {
            var submission = dbTagihan.child(ini.dataEdit['key']).set(data)
            submission.then(e => {
                console.log("Edit berhasil.")
            })
            submission.catch(e => console.log(e.message))
        }  
    }

    lunasiSemua() {
        this.dataTagihan.forEach(tagihan => {
            console.log(tagihan.key)
            dbTagihan.child(tagihan.key).update({lunas: 1})
        })
    }
}

customElements.define('tagihan-data', tagihanData);