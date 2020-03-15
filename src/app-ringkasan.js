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
            }

            paper-material {
                margin: 16px;
            }

            @media (max-width: 800px) {
                paper-material {
                    margin: 16px 16px;
                }
            }

            @media (min-width: 801px) {
                paper-material {
                    margin: 16px 20% 0;
                }
            }

            #inputBulan {
                background-color: #fff;
                border: 0;
                border-radius: 2px;
                font-family: 'Roboto', 'Noto', sans-serif;
                padding: 5px;
                width: 240px;
            }
        </style>

        <app-header-layout>
            <app-header slot="header">
                <app-toolbar>
                    <input type="month" id="inputBulan" min="2015-08" max="{{yearMonthLast+1}}" value="{{yearMonthLast}}">
                    <span class="flex"></span>
                    <paper-icon-button icon="search" on-tap="_tapSearch"></paper-icon-button>
                </app-toolbar>
            </app-header>

            <paper-material>
                <template is="dom-repeat" items="{{_toArray(pengeluaran)}}" as="item">
                    <div class="horizontal layout">
                        <span>{{item.0}}</span>
                        <span class="flex"></span>
                        <span>{{_formatJumlah(item.1)}}</span>
                    </div>
                </template>
            </paper-material>

            <paper-material>
                <div class="horizontal layout">
                    <span>Total pengeluaran</span>
                    <span class="flex"></span>
                    <span>{{_formatJumlah(total)}}</span>
                </div>
            </paper-material>
            
        </app-header-layout>
        
        <ringkasan-data pengeluaran="{{pengeluaran}}" total="{{total}}"></ringkasan-data>
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
      this.yearMonthLast = new Date(yearToday, monthToday).toISOString().slice(0,7);
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