import {LitElement, html, css} from 'lit-element';

//打算用这个页面对试试一下Lit-Element
//但是Lit-Element没有两个街道的关系
//需要用Redux如果想有两个街道的关系
//此也没有shared-styles

class rekeningItem extends LitElement {
    static get styles() {
        return css`
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

            paper-material {
                background: white;
                border-radius: 2px;
                height: 100%;
                margin-bottom: 16px;
                padding: 16px 0 16px 0;
            }

            @media (min-width: 801px) {
                paper-material {
                    padding-left: 30px;
                    padding-right: 30px;
                }

                .narrow {
                    margin-left: auto;
                    margin-right: auto;
                    max-width: 500px;
                }
            }

            @media (max-width: 800px) {
                paper-material {
                    padding-left: 16px;
                    padding-right: 16px;
                }

                .narrow {
                    margin-left: 16px;
                    margin-right: 16px;
                }
            }
        `;
    }

    render() {
        return html`  
            <paper-material>
                <paper-ripple recenters=""></paper-ripple>
                <div class="banner ${this.jenis}"></div>
                <div class="content">
                    <div class="horizontal layout">
                        <span>${this.nama}</span> 
                        <span class="flex"></span>
                        <span>${this.formatJumlah(this.jenis, this.jumlah)}</span>
                    </div>
                    <div class="horizontal layout">
                        <span>${this.waktu}</span> 
                        <span class="flex"></span>
                    </div>
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
