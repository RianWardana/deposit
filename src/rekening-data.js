import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/database';

class rekeningData extends PolymerElement {
  static get is() {
      return 'rekening-data';
  }

  static get properties() {
      return {
          dataRekening: { 
              type: Array,
              notify: true
          },
          lastSaldo: {
              type: Number,
              notify: true
          },
          dataTambah: {
              type: Object,
              observer: '_dataTambahChanged'
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
      window.thisRekDat = this;
      console.log("[READY] rekening-data");

      auth.onAuthStateChanged(firebaseUser => {
          if (firebaseUser) {
              thisRekDat.uid = firebaseUser.uid
              thisRekDat.loadRekening()
              console.log("rekening-data knows if you are signed in and your UID is " + firebaseUser.uid)
          }
          else {
              thisRekDat.dataRekening = [];
              thisRekDat.lastSaldo = null;
              console.log("rekening-data knows if you are not signed in.");
          }
      })
  }

  loadRekening() {  
    console.log("loadRekening");

    this.dbRekening = firebase.database().ref(thisRekDat.uid + "/rekening");
    this.dbRekeningLimited = this.dbRekening.orderByKey().limitToFirst(10);

    // Tereksekusi setiap ada perubahaan di database 'rekening' //
    this.dbRekeningLimited.on('value', snap => {
      // Mencari nilai saldo pada entri awal //
      var keys = Object.keys(snap.val());
      var lastKey = keys[0];
      thisRekDat.lastSaldo = parseInt(snap.val()[lastKey].saldo);

      // Tereksekusi untuk setiap entri di 'rekening' //
      thisRekDat.dataRekening = [];
      snap.forEach(snapEach => {
        var dateObject = new Date(parseInt(snapEach.key)*(-1000));
        var tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate();
        var bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1);
        var tahun = dateObject.getYear() - 100;
        thisRekDat.waktu = tanggal + "/" + bulan + "/" + tahun;
        thisRekDat.nama = snapEach.val()['nama'];
        var debit = snapEach.val()['debit'];
        var kredit = snapEach.val()['kredit'];
        thisRekDat.jumlah = (debit == 0 ? kredit : debit);
        thisRekDat.jenis = (debit == 0 ? "kredit" : "debit");
        
        thisRekDat.push('dataRekening', {
          waktu: thisRekDat.waktu,
          nama: thisRekDat.nama,
          jumlah: thisRekDat.jumlah,
          jenis: thisRekDat.jenis
        })
      })
    })
  }

  _dataTambahChanged() {
      var ini = this;

      var epoch = Math.floor(new Date() / -1000);
      var debit = parseInt(ini.dataTambah['debit']);
      var kredit = parseInt(ini.dataTambah['kredit']);
      var saldo = ini.lastSaldo + (kredit - debit);
      
      var data = {
          nama: ini.dataTambah['nama'],
          debit: debit,
          kredit: kredit,
          saldo: saldo,
      }

      var kirimData = this.dbRekening.child(epoch).set(data)
      kirimData.then(e => {
          console.log("Penambahan berhasil.")
      })
      kirimData.catch(e => console.log(e.message))
  }
}

customElements.define(rekeningData.is, rekeningData);
