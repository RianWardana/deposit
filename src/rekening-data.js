import {PolymerElement, html} from '@polymer/polymer';
import firebase from '@firebase/app';
import '@firebase/database';

class rekeningData extends PolymerElement {

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

        // coba gunakan customElements.whenDefined('app-auth').then(() => {})
        auth.onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadRekening()
                console.log("rekening-data knows if you are signed in and your UID is " + firebaseUser.uid)
            }
            else {
                this.dataRekening = [];
                this.lastSaldo = null;
                console.log("rekening-data knows if you are not signed in.");
            }
        });
    }

    loadRekening() {  
        console.log("loadRekening");

        this.dbRekening = firebase.database().ref(thisRekDat.uid + "/rekening");
        this.dbRekeningLimited = this.dbRekening.orderByKey().limitToFirst(10);

        // Tereksekusi setiap ada perubahaan di database 'rekening' //
        this.dbRekeningLimited.on('value', snap => {
            
            // User baru saja membuat akun
            if (snap.val() == null) thisRekDat.lastSaldo = 0;
            
            // Mencari nilai saldo pada entri awal //
            else { 
                var keys = Object.keys(snap.val());
                var lastKey = keys[0];
                this.lastSaldo = parseInt(snap.val()[lastKey].saldo);
            }
            
            // Tereksekusi untuk setiap entri di 'rekening' //
            this.dataRekening = [];
            snap.forEach(snapEach => {
                var dateObject = new Date(parseInt(snapEach.key)*(-1000));
                var tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate();
                var bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1);
                var tahun = dateObject.getYear() - 100;
                this.waktu = tanggal + "/" + bulan + "/" + tahun;
                this.nama = snapEach.val()['nama'];
                var debit = snapEach.val()['debit'];
                var kredit = snapEach.val()['kredit'];
                this.jumlah = (debit == 0 ? kredit : debit);
                this.jenis = (debit == 0 ? "kredit" : "debit");
                
                this.push('dataRekening', {
                    waktu: this.waktu,
                    nama: this.nama,
                    jumlah: this.jumlah,
                    jenis: this.jenis
                });
            })
        })
    }

    _dataTambahChanged() {
        var epoch = Math.floor(new Date() / -1000);
        var debit = parseInt(thisRekTam.dataTambahan['debit']);
        var kredit = parseInt(thisRekTam.dataTambahan['kredit']);
        var saldo = this.lastSaldo + (kredit - debit);
        
        var data = {
            nama: thisRekTam.dataTambahan['nama'],
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

customElements.define('rekening-data', rekeningData);