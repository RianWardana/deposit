import {PolymerElement, html} from '@polymer/polymer';

class appDeposit extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment">
            :host {
                display: block;
                --paper-tabs-selection-bar-color: #83ADCF; /*200*/
                --paper-tab-ink: #043F71;
            }

            paper-tab:focus {
                text-decoration: none;
                font-weight: normal;
            }

            app-header {
                background-color: var(--app-primary-color);
                color: #fff;
                /*width: 100%;*/
            }
            
            @media (max-width: 800px) {
                iron-pages#iron-pages-deposit {
                    padding: 0px 16px;
                }
            }

            @media (min-width: 801px) {
                iron-pages#iron-pages-deposit {
                    /*padding: 48px 62px 0;*/
                    padding: 5% 20% 0;
                }
            }
        </style>

        <app-header-layout>
            <app-header id="appHeader" fixed="" shadow="" slot="header">
                <paper-tabs attr-for-selected="tab" selected="{{tab_sekarang}}" noink="">
                    <paper-tab tab="rekening">REKENING</paper-tab>
                    <paper-tab tab="tagihan">PENGELUARAN</paper-tab>
                    <paper-tab tab="tunai">AKUN-AKUN</paper-tab>
                </paper-tabs>
            </app-header>
            
            <iron-pages id="iron-pages-deposit" attr-for-selected="tab" selected="{{tab_sekarang}}">
                <div tab="rekening">
                  <rekening-data data-rekening="{{dataRekening}}" last-saldo="{{saldo}}" data-tambah="{{mutasiRekening}}"></rekening-data>
                  <rekening-list data="{{dataRekening}}" saldo="{{saldo}}"></rekening-list>
                  <rekening-tambah data-tambah="{{mutasiRekening}}"></rekening-tambah>
                </div>
                <div tab="tagihan">
                  <tagihan-data data-tagihan="{{data}}" total-pengeluaran="{{pengeluaranTotal}}" data-tambah="{{dataTambah}}" data-edit="{{dataEdit}}"></tagihan-data>
                  <tagihan-list data="{{data}}" total-pengeluaran="{{pengeluaranTotal}}"></tagihan-list>
                  <tagihan-tambah data-tambah="{{dataTambah}}"></tagihan-tambah>
                  <tagihan-edit data-edit="{{dataEdit}}"></tagihan-edit>
                </div>
                <!-- <deposit-tunai tab="tunai"></deposit-tunai> -->
            </iron-pages>
        </app-header-layout>
`;
  }

  static get is() {
      return 'app-deposit';
  }

  static get properties() {
      return {
          tab_sekarang: { type: String, value: 'tagihan' },
          uid: String
      };
  }

  ready() {
      super.ready();
      this.setupToolbar();   
  }

  setupToolbar() {
      this.$.appHeader.style.top = '64px';
      window.that = this;
      window.addEventListener('scroll', function() {
          that.$.appHeader.style.top = (window.pageYOffset <= 64 ? (64 - window.pageYOffset) : 0) + 'px';
      });
  }
}

customElements.define(appDeposit.is, appDeposit);
