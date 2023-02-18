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
                <!-- <paper-ripple recenters=""></paper-ripple> -->
                <div class="content">
                    <div class="flexSpaceBetween">
                        <span>${this.nama}</span> 
                        <span>${this.formatJumlah(this.jumlah)}</span>
                    </div>
                    <div class="flexSpaceBetween">
                        <span>${this.waktu}</span> 
                        <!-- <a href="#">
                            <span role="button" @click="${
                                e => this._tapEdit(this.key, this.nama, this.jumlah)
                            }">Edit</span>
                        </a> -->
                        <span style="color: #ccc">${this.sumber}</span> 
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
            jumlah: Number,
            sumber: String
        }
    }

    formatJumlah(dataJumlah) {
        var dataJumlahInt = parseInt(dataJumlah);
        return "Rp" + dataJumlahInt.toLocaleString('id-ID');
    }

    _tapEdit(a, b, c, d, e) {
        // This event bubbles up to app-deposit
        let event = new CustomEvent('tagihan-edit', {
            bubbles: true,
            composed: true,
            detail: {
                key: a,
                nama: b,
                jumlah: c,
                sumber: d,
                saldo: e
            },
        });

        this.dispatchEvent(event);
    }
}

customElements.define('tagihan-item', tagihanItem);