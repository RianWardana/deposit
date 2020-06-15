import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/database';

class ringkasanData extends PolymerElement {
  static get is() {
    return 'ringkasan-data';
  }

  static get properties() {
    return {
      pengeluaran: {
        type: Object,
        notify: true
      },

      total: {
        type: Number,
        notify: true
      },

      totalPerKategori: {
        type: Object,
        value: {},
        notify: true
      },

      kategoriPengeluaran: {
        type: Array,
        notify: true,
        value: [
            {nama: "Makan", entri: ["Makan", "Minum", "Go-Food", "GrabFood", "Sereal"]},
            {nama: "Transportasi", entri: ["Transportasi", "e-Money", "Parkir", "Go-Jek Subs", "Grab Subs", "Go-Ride", "GrabRide", "Go-Car", "GrabCar"]},
            {nama: "Utilities", entri: ["Listrik", "FirstMedia", "Pulsa XL"]},
            {nama: "Lainnya", entri: ["Lainnya"]}
        ]
      }
    }
  }

  ready() {
    super.ready();
    window.thisRingDat = this;

    var dateObjectToday = new Date();
    var yearToday = dateObjectToday.getFullYear();
    var monthToday = dateObjectToday.getMonth();
    thisRingDat.loadPengeluaran(yearToday, monthToday);
  }

  loadPengeluaran(year, month) {
    console.log('ringkasan-data: loadPengeluaran');
    var startTime = new Date(year, month).getTime() / -1000; // pembagi negatif karena key yang negatif
    var endTime = new Date(year, month+1).getTime() / -1000;

    // Selanjutnya jangan minta uid dari thisRekDat, cari cara lain
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

            total += jumlah;

            // Hitung total per kategori
            var stopLoop = false;
            for (let kategori of this.kategoriPengeluaran) {
                if (stopLoop) break;
                for (let entriEach of kategori.entri) {
                    if ( (nama == entriEach) || (entriEach == "Lainnya") ) { // pastikan user tidak membuat entri "Lainnya" di kategori lain
                        var a = totalPerKategori[kategori.nama];
                        totalPerKategori[kategori.nama] = (isNaN(a) ? jumlah : a + jumlah);
                        stopLoop = true;
                        break;
                    }
                }
            }
        });
        
        thisRingDat.pengeluaran = pengeluaran;
        thisRingDat.total = total;
        thisRingDat.totalPerKategori = totalPerKategori;
    });   
  }
}

customElements.define('ringkasan-data', ringkasanData);