import {PolymerElement, html} from '@polymer/polymer';

class rekeningTambah extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment">
            paper-fab {
                background-color: var(--app-primary-color);
                position: fixed;
                right: 5%;
                bottom: 5%;
            }

            @media (max-height: 450px) {
                paper-dialog {
                    bottom: 0;
                }
            }

            paper-input[label="Nama"] { margin-right: 20px; }

            paper-toggle-button {
                --paper-toggle-button-unchecked-bar-color:  var(--paper-orange-500);
                --paper-toggle-button-unchecked-button-color:  var(--paper-orange-500);
                --paper-toggle-button-unchecked-ink-color: var(--paper-orange-500);
                --paper-toggle-button-checked-bar-color:  var(--paper-green-500);
                --paper-toggle-button-checked-button-color:  var(--paper-green-500);
                --paper-toggle-button-checked-ink-color: var(--paper-green-500);
              }
        </style>

        <paper-dialog id="dialog" on-iron-overlay-closed="_dialogClosed">
            <h2>Mutasi Rekening</h2>
            <div class="horizontal layout">
                <paper-input list="daftar-rekening" no-label-float="" label="Nama" value="{{nama}}" maxlength="64" on-change="_inputChanged"></paper-input>
                <datalist id="daftar-rekening">
                    <template is="dom-repeat" items="{{daftarNamaRekening}}" as="item">
                        <option value="{{item}}">
                    </option></template>
                </datalist>
                <paper-input no-label-float="" type="number" value="{{jumlah}}" auto-validate="" pattern="[0-9]*" maxlength="8" on-change="_inputChanged">
                    <div slot="prefix">Rp</div>
                </paper-input>
            </div>
            <div class="horizontal layout around-justified">
                <span>Debit</span>
                <paper-toggle-button id="toggleJenis" checked="{{jenis}}" noink=""></paper-toggle-button>
                <span>Kredit</span>
            </div>
            <div class="buttons">
                <paper-button dialog-confirm="">Batal</paper-button>
                <paper-button id="btnTambah" on-tap="tambah">Tambah</paper-button>
            </div>
        </paper-dialog>

        <paper-fab id="fab" icon="add" on-tap="fabClick"></paper-fab>
        <paper-toast id="toastKosong" text="Nama dan jumlah wajib diisi"></paper-toast>
`;
  }

  static get is() {
      return 'rekening-tambah';
  }

  static get properties() {
      return {
          trigger: {
              type: Number,
              observer: '_triggerBuka'
          },

          daftarNamaRekening: {
              type: Array,
              value: [
                  "Dana",
                  "e-Money",
                  "e-Toll",
                  "Go-Pay",
                  "OVO",
                  "Transferan",
                  "Tokopedia"
              ]
          },

          dataTambah: {
              type: Object,
              notify: true
          },

          nama: String,
          jumlah: Number,
          jenis: String,

          // animationConfig: {
          //     value: function() {
          //         return {
          //             'entry': [
          //                 {
          //                     name: 'fade-in-animation',
          //                     node: this.$.fab,
          //                     timing: {duration: 300}
          //                 }
          //             ],
          //             'exit': [
          //                 {
          //                     name: 'fade-out-animation',
          //                     node: this.$.fab,
          //                     timing: {duration: 300}
          //                 }
          //             ]
          //         }
          //     }
          // }
      };
  }

  ready() {  
      super.ready();
      this.addEventListener('neon-animation-finish', this._animationFinished);
      // this.$.dialog.animationConfig = {
      //     'entry': [
      //         {
      //             name: 'fade-in-animation',
      //             node: this.$.dialog,
      //             timing: {duration: 300}
      //         }
      //     ],
      //     'exit': [
      //         {
      //             name: 'fade-out-animation',
      //             node: this.$.dialog,
      //             timing: {duration: 300}
      //         }
      //     ]
      // }
  }

  tambah() {
      if ((this.nama != "") && (this.jumlah != "")) { 
          this.$.dialog.close();
          this.dataTambah = {
              nama: this.nama,
              debit: (this.jenis ? 0 : this.jumlah),
              kredit: (this.jenis ? this.jumlah : 0)
          }
      } else {
          this.$.toastKosong.open()
      }
  }

  // _triggerBuka() {
  //     this.nama = ""
  //     this.jumlah = ""
  //     this.jenis = false
  //     // this.$.btnTambah.disabled = true
  //     this.$.dialog.open()
  //     document.querySelector('paper-fab').style.display = 'none'
  // },

  _dialogClosed() {
      window.onresize = null
      this.$.fab.style.display = 'block'
      this.playAnimation('entry')
  }

  _animationFinished() {
      if (this.$.dialog.opened) {
          this.$.fab.style.display = 'none'
      }
  }

  _inputChanged() {
      // if ((this.nama != "") && (this.jumlah != "")) {
      //     this.$.btnTambah.disabled = false    
      // } else {
      //     this.$.btnTambah.disabled = true
      // }
  }

  fabClick() {
      this.playAnimation('exit')
      this.nama = ""
      this.jumlah = ""
      this.jenis = false
      this.$.dialog.open()
  }
}

customElements.define(rekeningTambah.is, rekeningTambah);
