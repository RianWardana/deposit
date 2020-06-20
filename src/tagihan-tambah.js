import {PolymerElement, html} from '@polymer/polymer';

class tagihanTambah extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">
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
                  "Sereal",
                  "Go-Food",
                  "GrabFood",
                  "Transportasi",
                  "Parkir",
                  "e-Money",
                  "Go-Ride",
                  "Go-Car",
                  "Go-Jek Subs",
                  "GrabRide",
                  "GrabCar",
                  "Grab Subs",
                  "Higiene",
                  "Sabun",
                  "Tisu",
                  "Obat",
                  "Pulsa XL",
                  "Listrik",
                  "Laundry"
              ]
          },

          dataTambah: {
              type: Object,
              notify: true
          },

          nama: String,
          jumlah: Number
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

        // 拿费用名的数据从tagihan-data的页面
        // var 费用的名 = [];
        // dataTagihan.kategoriPengeluaran.map(费用的事情 => {
        //     费用的名 = [...费用的名, ...费用的事情.entri];
        // });

        customElements.whenDefined('vaadin-combo-box').then(() => {
            this.$.comboBox.items = this.daftarNamaPengeluaran;
            // this.$.comboBox.items = 费用的名;
        });
    }

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
  }

  _animationFinished() {
      if (this.$.dialog.opened) {
          this.$.fab.style.display = 'none';
      }
  }

  fabClick() {
      this.nama = "";
      this.jumlah = "";
      this.$.salinKeRekening.checked = false;
      this.$.dialog.open();
  }
}

customElements.define(tagihanTambah.is, tagihanTambah);