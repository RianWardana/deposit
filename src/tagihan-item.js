import {PolymerElement, html} from '@polymer/polymer';

class tagihanItem extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">  
            a { 
                text-decoration: none;
            }

            span[role="button"] { 
                color: #FFAB00;
                margin-left: 10px;
            }
        </style>

        <paper-material>
            <paper-ripple recenters=""></paper-ripple>
            <div class="content">
                <div class="horizontal layout">
                    <span>[[nama]]</span> 
                    <span class="flex"></span>
                    <span>[[formatJumlah(jumlah)]]</span>
                </div>
                <div class="horizontal layout">
                    <span>[[waktu]]</span> 
                    <span class="flex"></span>
                    <a href="#"><span role="button" on-tap="_tapEdit" key="[[key]]" nama="[[nama]]" jumlah="[[jumlah]]">Edit</span></a>
                </div>
            </div>
        </paper-material>
`;
  }

  static get is() {
      return 'tagihan-item';
  }

  static get properties() {
      return {
          key: String,
          waktu: String,
          nama: String,
          jumlah: Number
      }
  }

  formatJumlah(dataJumlah) {
      var dataJumlahInt = parseInt(dataJumlah);
      return "Rp" + dataJumlahInt.toLocaleString('id-ID');
  }

  // Selanjutnya gunakanlah this.dispatch atau apalah gitu, intinya dia bikin event yang bisa di-listen
  _tapEdit(e) {
      thisTagEdit.key = e.target.key;
      thisTagEdit.nama = e.target.nama;
      thisTagEdit.jumlah = e.target.jumlah;
      thisTagEdit.triggerEdit = (thisTagEdit.triggerEdit ? false : true);
  }
}

customElements.define(tagihanItem.is, tagihanItem);
