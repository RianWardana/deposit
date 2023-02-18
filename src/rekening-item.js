import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

class rekeningItem extends LitElement {
    
    static get properties() {
        return {
            waktu: String,
            nama: String,
            kredit: Number,
            debit: Number
        };
    }
    
    static get styles() {
        return [styles, css`
            div.banner.kredit { background-color: #4CAF50; }
            div.banner.debit { background-color: #FF9800; }

            div.banner {
                margin: 0;
                height: 5px;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }
        `];
    }

    render() {
        return html`  
            <paper-material>
                <!-- <paper-ripple recenters=""></paper-ripple> -->
                <div class="banner ${(this.kredit > 0 ? 'kredit' : 'debit')}"></div>
                <div class="content">
                    <div class="flexSpaceBetween">
                        <span>${this.nama}</span>
                        <span>${this.formatJumlah(this.debit, this.kredit)}</span>
                    </div>
                    <span>${this.waktu}</span>
                </div>
            </paper-material>
        `;
    }

    formatJumlah(debit, kredit) {
        let dataJumlahInt = parseInt(debit) + parseInt(kredit);
        return (kredit > 0 ? '+ Rp' : '- Rp') + dataJumlahInt.toLocaleString('id-ID');
    }
}

customElements.define('rekening-item', rekeningItem);