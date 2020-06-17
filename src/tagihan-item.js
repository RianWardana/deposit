import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

class tagihanItem extends LitElement {
    static get styles() {
        return [styles, css`
            a { 
                text-decoration: none;
            }

            span[role="button"] { 
                color: #FFAB00;
                margin-left: 10px;
            }
        `];
    }

    render() {
        return html`
            <paper-material>
                <paper-ripple recenters=""></paper-ripple>
                <div class="content">
                    <div class="flex-space-between">
                        <span>${this.nama}</span> 
                        <span>${this.formatJumlah(this.jumlah)}</span>
                    </div>
                    <div class="flex-space-between">
                        <span>${this.waktu}</span> 
                        <a href="#">
                            <span role="button" @click="${
                                e => this._tapEdit(this.key, this.nama, this.jumlah)
                            }">Edit</span>
                        </a>
                    </div>
                </div>
            </paper-material>
        `;
    }

    static get properties() {
        return {
            key: String,
            waktu: String,
            nama: String,
            jumlah: Number
        }
    }

    formatJumlah(dataJumlah) {
        var dataJumlahInt = parseInt(dataJumlah);
        return "Rp" + dataJumlahInt.toLocaleString('id-ID');
    }

    _tapEdit(a, b, c) {
        thisTagEdit.key = a;
        thisTagEdit.nama = b;
        thisTagEdit.jumlah = c;
        thisTagEdit.triggerEdit = (thisTagEdit.triggerEdit ? false : true);
    }
}

customElements.define('tagihan-item', tagihanItem);