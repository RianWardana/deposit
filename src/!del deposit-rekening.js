import {PolymerElement, html} from '@polymer/polymer';

class depositRekening extends PolymerElement {
  static get template() {
    return html`     
        <!-- <rekening-data data-rekening="{{data}}" last-saldo="{{saldo}}" data-tambah="{{dataTambah}}"></rekening-data>
        <rekening-list data="{{data}}" saldo="{{saldo}}"></rekening-list>
        <rekening-tambah data-tambah="{{dataTambah}}"></rekening-tambah> -->
    `;
  }

  static get is() {
      return 'deposit-rekening';
  }
}

customElements.define(depositRekening.is, depositRekening);
