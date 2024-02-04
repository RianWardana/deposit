import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';
import {firebase} from './firebase.js';

class tagihanList extends LitElement {
    
    static get properties() {
        return {
            data: Array,
            totalPengeluaran: Object,
            dataMutasi: Array,
            dataDompet: Array
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

            mwc-button {
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
        // Ga berfungsi dan ga ada gunanya
        // if (typeof this.data == 'undefined') {
        //     this.totalPengeluaran = {total: 0, today: 0};
        //     this.dataMutasi = []
        // }

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
                        <span><b id="batas-pengeluaran">${this.formatBatas(this.totalPengeluaran.total)}</b></span>
                        <!-- <span><b id="batas-pengeluaran">Rp0</b></span> -->
                    </div>
                </paper-material>

                <!-- DAFTAR PENGELUARAN -->
                ${this.data.map((item) => html`
                    <tagihan-item 
                        key="${item.key}"
                        waktu="${item.waktu}" 
                        nama="${item.nama}" 
                        jumlah="${item.jumlah}"
                        sumber="${this.dataDompet[item.sumber].nama}">
                    </tagihan-item>
                `)}

                <!-- ${until(
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
                            <mwc-button id="buttonArsipkan" raised @click="${this.onClick}">Arsipkan Pengeluaran</mwc-button>
                        `;

                        resolve(html`${pengeluaran} ${button}`);
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
        firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.uid = firebaseUser.uid;
                this.data = []
                
                this.totalPengeluaran = {
                    today: 0,
                    total: 0
                };
            }
        });
    }

    updated(changedProps) {
        if (changedProps.has('dataMutasi')) {
            let tanggalToday = ((new Date()).getDate() < 10 ? "0" : "") + (new Date()).getDate()
            
            let pengeluaran = this.dataMutasi.filter(item => item.jumlah > 0)
            let pengeluaranToday = pengeluaran.filter(item => item.waktu.substring(0,2) == tanggalToday)

            let total = pengeluaran.reduce((sum, item) => sum + parseInt(item.jumlah), 0)
            let totalToday = pengeluaranToday.reduce((sum, item) => sum + parseInt(item.jumlah), 0)

            this.data = pengeluaran
            this.totalPengeluaran.total = total
            this.totalPengeluaran.today = totalToday
        }
    }

    formatTotalTagihan(total) {
        if (isNaN(total)) return 0;
        else return parseInt(total).toLocaleString('id-ID');
    }

    formatBatas(total) {
        this.dbBatasPengeluaran = firebase.database().ref(this.uid + "/batasPengeluaran")
        this.dbBatasPengeluaran.on('value', dataBatas => {
            let batas = dataBatas.val()

            let dateObject = new Date()
            let tanggal = dateObject.getDate()
            let hariTerakhir = new Date(dateObject.getFullYear(), dateObject.getMonth()+1, 0).getDate()
            let selisihHari = (hariTerakhir-tanggal < 1 ? 1 : hariTerakhir-tanggal)

            let batasDOM = this.shadowRoot.getElementById('batas-pengeluaran')
            batasDOM.innerHTML = 'Rp' + parseFloat(((batas-total) / selisihHari).toFixed(0)).toLocaleString('id-ID')
        })
    }

    onClick() {
        this.shadowRoot.getElementById('toastLunas').open();
    }
}

customElements.define('tagihan-list', tagihanList);