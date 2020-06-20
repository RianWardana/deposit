import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';
import {until} from 'lit-html/directives/until.js';

class rekeningList extends LitElement {
    
    static get properties() {
        return {
            data: { 
                type: Array,
                notify: true
            },

            saldo: {
                type: Number
            }
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

            .spinnerContainer {
                display: flex;
                justify-content: center;
            }
        `];
    }
    
    render() {
        const items = new Promise(resolve => {
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
        });

        const spinner = html`
            <div class="spinnerContainer">
                <paper-spinner active></paper-spinner>
            </div>
        `;

        return html`
            <div class="narrow" id="list">
                <paper-material id="paper-material-saldo" class="flexSpaceBetween">
                    <span>Saldo di rekening</span>
                    <span><b>Rp${this.formatSaldo(this.saldo)}</b></span>
                </paper-material>
                
                ${until(items, spinner)}
            </div>
        `;
    }

    formatSaldo(dataSaldo) {
        if (isNaN(dataSaldo)) return 0;
        else return parseInt(dataSaldo).toLocaleString('id-ID');
    }
}

customElements.define('rekening-list', rekeningList);