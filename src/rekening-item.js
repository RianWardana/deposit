import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

//打算用这个页面对试试一下Lit-Element
//但是Lit-Element没有两个街道的关系
//需要用Redux如果想有两个街道的关系

class rekeningItem extends LitElement {
    static get styles() {
        return [styles, css`
            #namaJumlah {
                display: flex;
                justify-content: space-between;
            }

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
                <paper-ripple recenters=""></paper-ripple>
                <div class="banner ${this.jenis}"></div>
                <div class="content">
                    <div id="namaJumlah">
                        <span>${this.nama}</span>
                        <span>${this.formatJumlah(this.jenis, this.jumlah)}</span>
                    </div>
                    <span>${this.waktu}</span>
                </div>
            </paper-material>
        `;
    }

    static get properties() {
        return {
            waktu: String,
            nama: String,
            jenis: String,
            jumlah: Number
        };
    }

    formatJumlah(dataJenis, dataJumlah) {
        var dataJumlahInt = parseInt(dataJumlah);
        return (dataJenis == 'kredit' ? '+ Rp' : '- Rp') + dataJumlahInt.toLocaleString('id-ID');
    }
}

customElements.define('rekening-item', rekeningItem);
