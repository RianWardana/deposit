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
        type: Object,
        notify: true
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
        entries.forEach(entry => {
            var nama = entry.val()['nama'];
            var jumlah = entry.val()['jumlah'];

            if (pengeluaran[nama] > 0) pengeluaran[nama] += jumlah;
            else pengeluaran[nama] = jumlah;

            total += jumlah;
        });
        thisRingDat.pengeluaran = pengeluaran;
        thisRingDat.total = total;
    });   
  }
}

customElements.define('ringkasan-data', ringkasanData);