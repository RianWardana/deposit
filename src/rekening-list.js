import {PolymerElement, html} from '@polymer/polymer';

class rekeningList extends PolymerElement {
  // nanti pakai ${ until(content, <spinner/>) }
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">
            paper-material#paper-material-saldo {
                margin-top: 32px;
                margin-bottom: 32px;
                background: var(--app-primary-color);
                color: white;
            }

            paper-spinner {
                --paper-spinner-layer-1-color: #FF9800;
                --paper-spinner-layer-2-color: #1E88E5;
                --paper-spinner-layer-3-color: #FF9800;
                --paper-spinner-layer-4-color: #1E88E5;
                position: fixed;
                padding-top: calc(50vh - 120px);
                /*z-index: 999;*/
            }
        </style>
        
        <div class="horizontal layout center-justified">
            <paper-spinner id="spinner" active=""></paper-spinner>
        </div>

        <div class="narrow" id="list">
            <paper-material id="paper-material-saldo">
                <div class="horizontal layout">
                    <span>Saldo di rekening</span>
                    <span class="flex"></span>
                    <span><b>Rp{{formatSaldo(saldo)}}</b></span>
                </div>
            </paper-material>
            
            <template is="dom-repeat" items="{{data}}" as="item">
                <rekening-item waktu="{{item.waktu}}" nama="{{item.nama}}" jumlah="{{item.jumlah}}" jenis="{{item.jenis}}">
                </rekening-item>
            </template>
        </div>
`;
  }

  static get is() {
      return 'rekening-list';
  }

  static get properties() {
      return {
          data: { 
              type: Object,
              notify: true,
              observer: '_dataChanged'
          },

          // persistedData: { 
          //     type: Object,
          //     notify: true,
          //     observer: '_dataChanged'
          // },

          saldo: {
              type: Number,
              value: 0
          },

          daftarHari: {
              type: Array,
              value: [
                  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
              ]
          },

          daftarBulan: {
              type: Array,
              value: [
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ]
          }
      };
  }

  ready() {
      super.ready();
      this.dataChangedCount = 0;
      this.animationFinishedCount = 0;

      auth.onAuthStateChanged(firebaseUser => {
          if (firebaseUser) {
              this.dataChangedCount = 0;
              this.animationFinishedCount = 0;
              this.$.spinner.style.display = 'block';
              this.$.list.style.display = 'none';
          }
          else {
              this.dataChangedCount = -1;
          }
      })
  }

  _dataChanged() {
      console.log("_dataChanged number " + this.dataChangedCount + " is called.");
      // this.playAnimation('exitSpinner');
      this.$.list.style.display = 'block';
      this.$.spinner.style.display = 'none';
      // this.playAnimation('entryList');
      this.dataChangedCount++;
  }

  _animationFinished() {
      if (this.animationFinishedCount == 0) {
          this.$.spinner.style.display = 'none';
          // this.$.list.style.display = 'block';
          // this.playAnimation('entryList');
          this.animationFinishedCount++;
      }
  }

  formatSaldo(dataSaldo) {
      if (isNaN(dataSaldo)) return 0;
      else return parseInt(dataSaldo).toLocaleString('id-ID');
  }
}

customElements.define(rekeningList.is, rekeningList);