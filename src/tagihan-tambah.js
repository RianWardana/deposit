import {PolymerElement, html} from '@polymer/polymer';

class tagihanTambah extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment">
            paper-button {
                color: #FFAB00;
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

            vaadin-combo-box { margin-right: 20px; }
        </style>

        <paper-dialog id="dialog" on-iron-overlay-closed="_dialogClosed">
            <h2>Tambah Pengeluaran</h2>
            <div class="horizontal layout">
                <vaadin-combo-box id="comboBox" placeholder="Nama" value="{{nama}}" allow-custom-value></vaadin-combo-box>
                <vaadin-integer-field min="1" value="{{jumlah}}">
                  <div slot="prefix">Rp</div>
                </vaadin-integer-field>
            </div>
            <paper-checkbox id="salinKeRekening">Salin ke rekening</paper-checkbox>
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
      return 'tagihan-tambah';
  }

  static get properties() {
      return {
          daftarNamaPengeluaran: {
              type: Array,
              value: [
                  "Makan",
                  "Minum",
                  "Go-Food",
                  "GrabFood",
                  "Transportasi",
                  "Go-Ride",
                  "Go-Car",
                  "Go-Jek Subs",
                  "GrabRide",
                  "GrabCar",
                  "Grab Subs",
                  "Sereal",
                  "Sabun",
                  "Parkir",
                  "e-Money"
              ]
          },

          dataTambah: {
              type: Object,
              notify: true
          },

          nama: String,
          jumlah: Number,

          // animationConfig: {
          //     value() {
          //         return {
          //             'entry': [
          //                 {
          //                     name: 'fade-in-animation',
          //                     node: this,
          //                     timing: {duration: 300}
          //                 }
          //             ],
          //             'fabExit': [
          //                 {
          //                     name: 'fade-out-animation',
          //                     node: this,
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

      this.$.dialog.animationConfig = {
          'entry': [
              {
                  name: 'fade-in-animation',
                  node: this.$.dialog,
                  timing: {duration: 300}
              }
          ],
          'exit': [
              {
                  name: 'fade-out-animation',
                  node: this.$.dialog,
                  timing: {duration: 300}
              }
          ]
      }

      customElements.whenDefined('vaadin-combo-box').then(() => {
        this.$.comboBox.items = this.daftarNamaPengeluaran;
      });
  }

  // show() {
  //     console.log("tagTambah here showed");
  //     this.playAnimation();
  //     this.$.fab.animate([
  //         {transform:'translateY(0)', opacity: 1, easing: 'ease-out'},
  //         {transform:'translateY(100%)', opacity: 1, easing: 'ease-in'},
  //         {transform:'translateY(100%)', opacity: 0 }
  //     ],
  //     {
  //         duration: 1500,
  //     });
  // }

  tambah() {
      if ((this.nama != "") && (this.jumlah != "")) { 
          this.$.dialog.close();

          this.dataTambah = {
              nama: this.nama,
              jumlah: this.jumlah
          }

          // Tambah ke rekening //
          if (this.$.salinKeRekening.checked) {
              thisRekDat.dataTambah = {
                  nama: this.nama,
                  debit: this.jumlah,
                  kredit: 0
              }
          }
      } else {
          this.$.toastKosong.open()
      }
  }

  _dialogClosed() {
      window.onresize = null;
      this.$.fab.style.display = 'block';
      // this.playAnimation('entry');
  }

  _animationFinished() {
      if (this.$.dialog.opened) {
          this.$.fab.style.display = 'none';
      }
  }

  fabClick() {
      // thisTagTambah.playAnimation('fabExit')
      this.nama = "";
      this.jumlah = "";
      this.$.salinKeRekening.checked = false;
      this.$.dialog.open();
  }
}

customElements.define(tagihanTambah.is, tagihanTambah);