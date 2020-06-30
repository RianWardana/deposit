import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';
import {firebase} from './firebase.js';

class tagihanList extends LitElement {
    
    static get properties() {
        return {
            data: Object,
            totalPengeluaran: Object
        };
    }

    static get styles() {
        return [styles, css`
            paper-material#paperMaterialTagihan {
                margin-top: 32px;
                margin-bottom: 16px;
                background: #4CAF50;
                color: #f7f7f7;
                max-height: 50px;
                transition: max-height 0.5s ease-out;
            }

            paper-material#paper-material-batas {
                margin-top: 16px;
                margin-bottom: 32px;
                background: #FFAB00;
                color: #f7f7f7;
                max-height: 24px;
                transition: max-height 0.5s ease-out;
            }

            paper-button {
                color: white;
                background: #5cb860;
                padding: 10px 20px;
                font-weight: 500;
                margin: 0;
                width: 100%;
            }

            span[role="button"] { color: #FFAB00; margin: 10px; }
        `];
    }
    
    render() {
        if (typeof this.data == 'undefined') {
            this.totalPengeluaran = {total: 0, today: 0};
        }

        return html`
            <div class="narrow" id="list">
                <!-- PENGELUARAN BULAN INI (HIJAU) -->
                <paper-material id="paperMaterialTagihan">
                    <paper-ripple recenters></paper-ripple>
                    <div class="flexSpaceBetween">
                        <span>Pengeluaran bulan ini</span>
                        <span><b>Rp${this.formatTotalTagihan(this.totalPengeluaran.total)}</b></span>
                    </div>
                    <div class="flexSpaceBetween">
                        <span>Pengeluaran hari ini</span>
                        <span><b>Rp${this.formatTotalTagihan(this.totalPengeluaran.today)}</b></span>
                    </div>
                </paper-material>
                
                <!-- BATAS PENGELUARAN (KUNING) -->
                <paper-material id="paper-material-batas">
                    <paper-ripple recenters></paper-ripple>
                    <div class="flexSpaceBetween">
                        <span>Batas pengeluaran harian</span>
                        <span><b>Rp${this.formatBatas(this.totalPengeluaran.total)}</b></span>
                    </div>
                </paper-material>

                <!-- DAFTAR PENGELUARAN -->
                ${until(
                    new Promise(resolve => {
                        if (typeof this.data == 'undefined') return;
                        let pengeluaran = this.data.map(item => html`
                            <tagihan-item 
                                key="${item.key}"
                                waktu="${item.waktu}" 
                                nama="${item.nama}" 
                                jumlah="${item.jumlah}">
                            </tagihan-item>
                        `);

                        let button = html`
                            <paper-button id="buttonArsipkan" raised @click="${this.onClick}">Arsipkan Pengeluaran</paper-button>
                        `;
                        resolve(html`${pengeluaran} ${button}`);
                    })
                , 
                    html`
                        <div class="spinnerContainer">
                            <paper-spinner active></paper-spinner>
                        </div>
                    `
                )}
            </div>
            
            <paper-toast id="toastLunas" duration="5000" text="Entri pengeluaran akan diarsipkan.">
                <span role="button" @click="${this.lunasiSemua}">Lanjut</span>
            </paper-toast>
        `;
    }

    constructor() {
        super();
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid;
                this.loadPengeluaran();
            }
            else {
                this.data = [];
            }
        });
    }

    loadPengeluaran() {
        console.log('loadPengeluaran')

        this.dbTagihan = firebase.database().ref(this.uid + "/tagihan");
        let dbTagihanLimited = this.dbTagihan.orderByChild('lunas').equalTo(0);

        var dateObjectToday = new Date();
        var tanggalToday = (dateObjectToday.getDate() < 10 ? "0" : "") + dateObjectToday.getDate();
        var bulanToday = (dateObjectToday.getMonth() < 9 ? "0" : "") + (dateObjectToday.getMonth() + 1);

        // Tereksekusi setiap ada perubahaan di database 'tagihan' //
        dbTagihanLimited.on('value', dataPengeluaran => {
            this.data = [];
            var total = 0;
            var today = 0;
            
            // Tereksekusi untuk setiap entri di 'tagihan' //
            dataPengeluaran.forEach(pengeluaran => {
                var dateObject = new Date(parseInt(pengeluaran.key)*(-1000));
                var tanggal = (dateObject.getDate() < 10 ? "0" : "") + dateObject.getDate();
                var bulan = (dateObject.getMonth() < 9 ? "0" : "") + (dateObject.getMonth() + 1);
                var tahun = dateObject.getYear() - 100;
                var waktu = tanggal + "/" + bulan + "/" + tahun;
                var nama = pengeluaran.val()['nama'];
                var jumlah = pengeluaran.val()['jumlah'];

                // Jika terdapat pengeluaran bulan sebelumnya
                if (bulan != bulanToday)
                return;

                // Hitung total pengeluaran
                total += jumlah

                // Hitung pengeluaran hari ini
                if ((tanggal == tanggalToday) && (bulan == bulanToday))
                    today += jumlah

                // Because this.push('data', {}) does not work
                this.data = [...this.data, {
                    key: pengeluaran.key,
                    waktu: waktu,
                    nama: nama,
                    jumlah: jumlah
                }];
            });

            this.totalPengeluaran = {
                today: today,
                total: total
            };
        });
    }

    lunasiSemua() {
        this.shadowRoot.getElementById('toastLunas').close();
        this.data.forEach(pengeluaran => {
            console.log(pengeluaran.key);
            this.dbTagihan.child(pengeluaran.key).update({lunas: 1});
        })
    }

    formatTotalTagihan(total) {
        if (isNaN(total)) return 0;
        else return parseInt(total).toLocaleString('id-ID');
    }

    formatBatas(total) {
        var dateObject = new Date();
        var tanggal = dateObject.getDate();
        var hariTerakhir = new Date(dateObject.getFullYear(), dateObject.getMonth()+1, 0).getDate();
        var selisihHari = (hariTerakhir-tanggal < 1 ? 1 : hariTerakhir-tanggal);
        return parseFloat(((2250000-total) / selisihHari).toFixed(0)).toLocaleString('id-ID');
    }

    onClick() {
        this.shadowRoot.getElementById('toastLunas').open();
    }
}

customElements.define('tagihan-list', tagihanList);