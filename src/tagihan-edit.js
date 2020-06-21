import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

class tagihanEdit extends LitElement {

    static get properties() {
        return {
            triggerEdit: Boolean,
            dataEdit: Object,
            key: String,
            nama: String,
            jumlah: Number
        }
    }

    static get styles() {
        return [styles, css`
            paper-button {
                color: #FFAB00;
            }

            paper-button[disabled] {
                color: #a8a8a8;
            }
            
            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }

            paper-input[label="Nama"] { margin-right: 20px; }
        `];
    }

    render() {
        return html`
            <paper-dialog id="dialog" @iron-overlay-closed="${this._dialogClosed}">
                <h2>Edit Pengeluaran</h2>
                <div class="flexSpaceBetween">
                    <vaadin-combo-box id="comboBox" placeholder="Nama" @input="${this.onChangeInput}" allow-custom-value></vaadin-combo-box>
                    <vaadin-integer-field id="inputJumlah" min="1" @input="${this.onChangeInput}">
                        <div slot="prefix">Rp</div>
                    </vaadin-integer-field>
                </div>
                <div class="buttons">
                    <paper-button dialog-confirm>Batal</paper-button>
                    <paper-button id="btnHapus" @click="${this._tapHapus}">Hapus</paper-button>
                    <paper-button id="btnSimpan" @click="${this._tapSimpan}">Simpan</paper-button>
                </div>
            </paper-dialog>

            <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
        `;
    }

    constructor() {
        super(); 
        window.thisTagEdit = this;
    }

    // If edit button was pressed
    updated(changedProps) {
        if (changedProps.has('triggerEdit')) {
            this.shadowRoot.getElementById('dialog').open();
            this.shadowRoot.getElementById('comboBox').value = this.nama;
            this.shadowRoot.getElementById('inputJumlah').value = this.jumlah;
        }
    }

    _tapHapus() {
        this.shadowRoot.getElementById('dialog').close();
        let event = new CustomEvent('edit-pengeluaran', {detail: {
            key: this.key,
            jumlah: 0
        }});
        this.dispatchEvent(event);
    }

    _tapSimpan() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != "")) { 
            this.shadowRoot.getElementById('dialog').close();
            let event = new CustomEvent('edit-pengeluaran', {detail: {
                key: this.key,
                nama: inputNama,
                jumlah: inputJumlah
            }});
            this.dispatchEvent(event);
        } else {
            this.shadowRoot.getElementById('toastKosong').open()
        }
    }

    onChangeInput() {
        let inputNama = this.shadowRoot.getElementById('comboBox').value;
        let inputJumlah = this.shadowRoot.getElementById('inputJumlah').value;

        if ((inputNama != "") && (inputJumlah != ""))
            this.shadowRoot.getElementById('btnSimpan').removeAttribute('disabled');
        else 
            this.shadowRoot.getElementById('btnSimpan').setAttribute('disabled', true);
    }
}

customElements.define('tagihan-edit', tagihanEdit);