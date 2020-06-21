import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

class tagihanTambah extends LitElement {
    
    static get properties() {
        return {

        };
    }

    static get styles() {
        return [styles, css`
            paper-button {
                color: #FFAB00;
            }

            paper-button[disabled] {
                color: #a8a8a8;
            }

            paper-checkbox {
                --paper-checkbox-checked-color: #4CAF50;
                --paper-checkbox-checked-ink-color: #4CAF50;
            }

            paper-fab {
                background-color: #4CAF50;
                position: fixed;
                right: 5%;
                bottom: 5%;
            }

            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }
        `];
    }
    
    render() {
        customElements.whenDefined('vaadin-combo-box').then(() => {
            this.shadowRoot.getElementById('comboBox').items = this.loadNamaPengeluaran();
        });

        return html`
            <paper-dialog id="dialog" @iron-overlay-closed="${this.onDialogClosed}">
                <h2>Tambah Pengeluaran</h2>
                <div class="flexSpaceBetween">
                    <vaadin-combo-box id="comboBox" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                    <vaadin-integer-field id="inputJumlah" min="1" @input="${this.onChangeInput}">
                        <div slot="prefix">Rp</div>
                    </vaadin-integer-field>
                </div>
                <paper-checkbox id="inputSalin">Salin ke rekening</paper-checkbox>
                <div class="buttons">
                    <paper-button dialog-confirm>Batal</paper-button>
                    <paper-button id="btnTambah" disabled @click="${this.tambah}">Tambah</paper-button>
                </div>
            </paper-dialog>

            <paper-fab id="fab" icon="add" @click="${this.onFabClick}"></paper-fab>
            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    loadNamaPengeluaran() {
        let daftarNamaPengeluaran = [];
        thisTagDat.kategoriPengeluaran.map(费用的事情 => {
            daftarNamaPengeluaran = [...daftarNamaPengeluaran, ...费用的事情.entri];
        });
        return daftarNamaPengeluaran;
    }

    tambah() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;
        let inputSalin = this.shadowRoot.getElementById('inputSalin').checked;

        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();

            // Passing data to the parent component using CustomEvent
            let event = new CustomEvent('pengeluaran-baru', {detail: {
                nama: inputNama,
                jumlah: inputJumlah
            }});
            this.dispatchEvent(event);

            // Salin pengeluaran ke rekening //
            if (inputSalin) {
                let event = new CustomEvent('mutasi-baru', {detail: {
                    nama: inputNama,
                    debit: inputJumlah,
                    kredit: 0
                }});
                this.dispatchEvent(event);
            }
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }
    }

    onDialogClosed() {
        window.onresize = null;
        this.shadowRoot.getElementById('fab').style.display = 'block';
    }

    onFabClick() {
        this.shadowRoot.getElementById('comboBox').value = '';
        this.shadowRoot.getElementById('inputJumlah').value = '';
        this.shadowRoot.getElementById('inputSalin').checked = false;
        this.shadowRoot.getElementById('dialog').open();
        this.shadowRoot.getElementById('fab').style.display = 'none';
        this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnTambah').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnTambah').setAttribute('disabled', true);
    }
}

customElements.define('tagihan-tambah', tagihanTambah);