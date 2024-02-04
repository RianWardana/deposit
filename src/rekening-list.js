import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';
import {firebase} from './firebase.js';

class rekeningList extends LitElement {
    
    static get properties() {
        // Harus tulis variabel di sini untuk muncul di updated(changedProps)
        return {
            data: {type: Array},
            saldo: {type: Number},
            keyDompet: Number,
            filteredData: {type: Array},
            dataMutasi: Array
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
                    <span>Saldo</span>
                    <span><b>Rp${this._formatSaldo(this.saldo)}</b></span>
                </paper-material>
                
                ${this.filteredData.map((item) => {
                    if (item.group != 0) return
                    return html`
                        <rekening-item 
                            waktu="${item.waktu}" 
                            nama="${item.nama}" 
                            debit="${item.debit}" 
                            kredit="${item.kredit}">
                        </rekening-item>
                    `
                })}

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
                // this.loadRekening();
                this.data = [];
                this.filteredData = [];
            }
            else {
                this.data = [];
                this.saldo = null;
            }
        });
    }

    // Triggered jika ada data dari atas yang berubah
    // Note: hanya berfungsi untuk variabel yang ada di static get properties()
    updated(changedProps) {
        if (changedProps.has('keyDompet')) {
            // Jika user klik tab dompet (bukan pengeluaran)
            if (this.keyDompet != -1) {
                this.filteredData = this.dataMutasi.filter(item => item.sumber == this.keyDompet)
                this.saldo = this.dataDompet[this.keyDompet].saldo
            }
        }

        if (changedProps.has('dataMutasi')) {
            this.filteredData = this.dataMutasi.filter(item => item.sumber == this.keyDompet)
            this.saldo = this.dataDompet[this.keyDompet].saldo
        }
    }

    _formatSaldo(dataSaldo) {
        if (isNaN(dataSaldo)) return 0;
        // else if (parseInt(dataSaldo) < 0) return 0
        else return parseInt(dataSaldo).toLocaleString('id-ID');
    }
}

customElements.define('rekening-list', rekeningList);