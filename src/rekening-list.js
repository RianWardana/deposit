import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';
import {firebase} from './firebase.js';

class rekeningList extends LitElement {
    
    static get properties() {
        return {
            data: {type: Array},
            saldo: {type: Number}
        };
    }
    
    static get styles() {
        return [styles, css`
            paper-material#paper-material-saldo {
                margin-top: 32px;
                margin-bottom: 32px;
                background: var(--app-primary-color);
                color: white;
            }
        `];
    }
    
    render() {
        return html`
            <div class="narrow" id="list">
                <paper-material id="paper-material-saldo" class="flexSpaceBetween">
                    <span>Saldo di rekening</span>
                    <span><b>Rp${this._formatSaldo(this.saldo)}</b></span>
                </paper-material>
                
                ${this.data.map((item) => html`
                    <rekening-item 
                        waktu="${item.waktu}" 
                        nama="${item.nama}" 
                        jumlah="${item.jumlah}" 
                        jenis="${item.jenis}">
                    </rekening-item>
                `)}

                <!-- ${until(
                    new Promise(resolve => {
                        if (typeof this.data == 'undefined') return;
                        let load = this.data.map(item => html`
                            <rekening-item 
                                waktu="${item.waktu}" 
                                nama="${item.nama}" 
                                jumlah="${item.jumlah}" 
                                jenis="${item.jenis}">
                            </rekening-item>
                        `)
                        resolve(load);
                    })
                , 
                    html`
                        <div class="spinnerContainer">
                            <paper-spinner active></paper-spinner>
                        </div>
                    `
                )} -->
            </div>
        `;
    }

    constructor() {
        super();
        window.Rekening = this;

        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid
                this.loadRekening();
            }
            else {
                this.data = [];
                this.saldo = null;
            }
        });
    }

    _formatSaldo(dataSaldo) {
        if (isNaN(dataSaldo)) return 0;
        else return parseInt(dataSaldo).toLocaleString('id-ID');
    }

    loadRekening() {  
        console.log("loadRekening di rekening-list");

        let dbRekening = firebase.database().ref(this.uid + "/rekening");
        let dbRekeningLimited = dbRekening.orderByKey().limitToFirst(10);

        // Tereksekusi setiap ada perubahaan di database 'rekening' //
        dbRekeningLimited.on('value', snap => {
            
            // User baru saja membuat akun
            if (snap.val() == null) this.saldo = 0;
            
            // Mencari nilai saldo pada entri awal
            else { 
                let keys = Object.keys(snap.val());
                let lastKey = keys[0];
                this.saldo = parseInt(snap.val()[lastKey].saldo);
            }
            
            // Tereksekusi untuk setiap entri di 'rekening' //
            this.data = [];
            snap.forEach(snapEach => {
                let dateObject = new Date(parseInt(snapEach.key)*(-1000));
                let tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate();
                let bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1);
                let tahun = dateObject.getYear() - 100;
                let ddmmyy = tanggal + "/" + bulan + "/" + tahun;
                let nama = snapEach.val()['nama'];
                let debit = snapEach.val()['debit'];
                let kredit = snapEach.val()['kredit'];
                let jumlah = (debit == 0 ? kredit : debit);
                let jenis = (debit == 0 ? "kredit" : "debit");

                // Because this.push('data', {}) does not work
                this.data = [...this.data, {
                    waktu: ddmmyy,
                    nama: nama,
                    jumlah: jumlah,
                    jenis: jenis
                }];
            });
        });
    }
}

customElements.define('rekening-list', rekeningList);