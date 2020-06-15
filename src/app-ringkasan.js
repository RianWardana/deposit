import {PolymerElement, html} from '@polymer/polymer';
import './ringkasan-data.js';

class appRingkasan extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">
            :host {
                display: block;
                --paper-tabs-selection-bar-color: #83ADCF; /*200*/
                --paper-tab-ink: #043F71;
            }

            app-toolbar {
                top: 64px;
                background-color: var(--app-primary-color);
                color: #fff;
                padding: 0;
            }

            #containerRingkasan {
                margin-top: 30px;
            }

            #inputBulan {
                background-color: #fff;
                border: 0;
                border-radius: 2px;
                font-family: 'Roboto', 'Noto', sans-serif;
                padding: 5px;
                width: 100%;
            }
        </style>

        <app-header-layout>
            <app-header slot="header">
                <app-toolbar>
                    <input class="narrow" type="month" id="inputBulan" 
                        on-change="_tapSearch"
                        min="2015-08" 
                        max="{{yearMonthLast}}" 
                        value="{{yearMonthLast}}"
                    >
                </app-toolbar>
            </app-header>

            <div class="narrow" id="containerRingkasan">
                <!-- DAFTAR PENGELUARAN -->
                <paper-material>
                    <template is="dom-repeat" items="{{_toArray(pengeluaran)}}" as="item">
                        <div class="horizontal layout">
                            <span>{{item.0}}</span>
                            <span class="flex"></span>
                            <span>{{_formatJumlah(item.1)}}</span>
                        </div>
                    </template>
                </paper-material>

                <!-- TOTAL KATEGORI PENGELUARAN -->
                <paper-material>
                    <template is="dom-repeat" items="{{_toArray(totalPerKategori)}}" as="item">
                        <div class="horizontal layout">
                            <span>{{item.0}}</span>
                            <span class="flex"></span>
                            <span>{{_formatJumlah(item.1)}}</span>
                        </div>
                    </template>
                </paper-material>

                <!-- TOTAL PENGELUARAN -->
                <paper-material>
                    <div class="horizontal layout">
                        <span>Total pengeluaran</span>
                        <span class="flex"></span>
                        <span>{{_formatJumlah(total)}}</span>
                    </div>
                </paper-material>
            </div>
            
        </app-header-layout>
    
        <ringkasan-data 
            pengeluaran="{{pengeluaran}}" 
            total="{{total}}" 
            total-per-kategori="{{totalPerKategori}}" >
        </ringkasan-data>
    `;
  }

  static get is() {
      return 'app-ringkasan';
  }

  ready() {
      super.ready();
      console.log("[READY] app-ringkasan");
      var yearToday = (new Date()).getFullYear();
      var monthToday = (new Date()).getMonth();
      this.yearMonthLast = new Date(yearToday, monthToday+1).toISOString().slice(0,7);
  }

  _toArray(object) {
      if (Object.keys(object) < 1) return [['Pengeluaran', 0]];
      return Object.entries(object);
  }

  _formatJumlah(jumlah) {
      return 'Rp' + parseInt(jumlah).toLocaleString('id-ID')
  }

  _tapSearch() {
      var year = (this.$.inputBulan.value).slice(0,4);
      var month = (this.$.inputBulan.value).slice(5,7);
      thisRingDat.loadPengeluaran(year, month-1);
  }
}

customElements.define(appRingkasan.is, appRingkasan);