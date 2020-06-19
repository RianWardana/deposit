import {PolymerElement, html} from '@polymer/polymer';

class tagihanEdit extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">
            paper-button {
                color: #FFAB00;
            }
            
            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }

            paper-input[label="Nama"] { margin-right: 20px; }
        </style>

        <paper-dialog id="dialog" on-iron-overlay-closed="_dialogClosed">
            <h2>Edit Pengeluaran</h2>
            <div class="horizontal layout">
                <paper-input list="daftar-pengeluaran-edit" no-label-float="" label="Nama" value="{{nama}}" maxlength="64"></paper-input>
                <paper-input no-label-float="" type="number" value="{{jumlah}}" auto-validate="" pattern="[0-9]*" maxlength="8">
                    <div slot="prefix">Rp</div>
                </paper-input>
            </div>
            <div class="buttons">
                <paper-button dialog-confirm="">Batal</paper-button>
                <paper-button id="btnHapus" on-tap="_tapHapus">Hapus</paper-button>
                <paper-button id="btnTambah" on-tap="_tapSimpan">Simpan</paper-button>
            </div>
        </paper-dialog>

        <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
`;
  }

  static get is() {
      return 'tagihan-edit';
  }

  static get properties() {
      return {
          triggerEdit: {
              type: Boolean,
              observer: '_editTriggered'
          },

          dataEdit: {
              type: Object,
              notify: true
          },

          nama: String,
          jumlah: Number
      }
  }

  ready() {
      super.ready(); 
      window.thisTagEdit = this;
  }

  _editTriggered() {
      this.$.dialog.open()
  }

  _tapHapus() {
      this.$.dialog.close();
          this.dataEdit = {
              key: this.key,
              jumlah: 0
          }
  }

  _tapSimpan() {
      if ((this.nama != "") && (this.jumlah != "")) { 
          this.$.dialog.close();
          this.dataEdit = {
              key: this.key,
              nama: this.nama,
              jumlah: this.jumlah
          }
      } else {
          this.$.toastKosong.open()
      }
  }

  _dialogClosed() {
      window.onresize = null
  }
}
customElements.define(tagihanEdit.is, tagihanEdit);
