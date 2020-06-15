import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/database';

class tagihanData extends PolymerElement {

  static get is() {
      return 'tagihan-data';
  }

  static get properties() {
      return {
          dataTagihan: { 
              type: Array,
              notify: true
          },

          /* Perhitungan total per kategori dipindah ke ringkasan, 
          tapi yg disini blm didelete jaga2 berubah pikiran */
        //   kategoriPengeluaran: {
        //     type: Array,
        //     notify: true,
        //     value: [
        //         {nama: "Makan", entri: ["Makan", "Minum", "Go-Food", "GrabFood", "Sereal"]},
        //         {nama: "Transportasi", entri: ["Transportasi", "e-Money", "Parkir", "Go-Jek Subs", "Grab Subs", "Go-Ride", "GrabRide", "Go-Car", "GrabCar"]},
        //         {nama: "Utilities", entri: ["Listrik", "FirstMedia", "Pulsa XL"]},
        //         {nama: "Lainnya", entri: ["Lainnya"]}
        //     ]
        //   },

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

            // Hitung total per kategori
            // var stopLoop = false;
            // for (let kategori of this.kategoriPengeluaran) {
            //     if (stopLoop) break;
            //     for (let entriEach of kategori.entri) {
            //         if ( (nama == entriEach) || (entriEach == "Lainnya") ) { // pastikan user tidak membuat entri "Lainnya" di kategori lain
            //             var a = this.totalPengeluaran[kategori.nama];
            //             this.totalPengeluaran[kategori.nama] = (isNaN(a) ? jumlah : a + jumlah);
            //             stopLoop = true;
            //             break;
            //         }
            //     }
            // }

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
      var ini = this

      var epoch = Math.floor(new Date() / -1000)
      
      var data = {
          nama: ini.dataTambah['nama'],
          jumlah: parseInt(ini.dataTambah['jumlah']),
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

customElements.define(tagihanData.is, tagihanData);