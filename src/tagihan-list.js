import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';

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
        const items = new Promise(resolve => {
            if (typeof this.data == 'undefined') return;
            let load = this.data.map(item => html`
                <tagihan-item 
                    key="${item.key}"
                    waktu="${item.waktu}" 
                    nama="${item.nama}" 
                    jumlah="${item.jumlah}">
                </tagihan-item>
            `)
            this.shadowRoot.getElementById('buttonArsipkan').removeAttribute('hidden');
            resolve(load);
        });

        const spinner = html`
            <div class="spinnerContainer">
                <paper-spinner active></paper-spinner>
            </div>
        `;

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

                <!-- PENGELUARAN -->
                ${until(items, spinner)}

                <paper-button id="buttonArsipkan" hidden raised @click="${this.onClick}">Arsipkan Pengeluaran</paper-button>
            </div>
            
            <paper-toast id="toastLunas" duration="5000" text="Entri pengeluaran akan diarsipkan.">
                <span role="button" @click="${this.onClickConfirm}">Lanjut</span>
            </paper-toast>
        `;
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

    onClickConfirm() {
        thisTagDat.lunasiSemua();
        this.shadowRoot.getElementById('toastLunas').close();
    }
}

customElements.define('tagihan-list', tagihanList);