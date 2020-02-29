import {PolymerElement, html} from '@polymer/polymer';

class depositTagihan extends PolymerElement {
  static get template() {
    return html`
      <!-- <tagihan-data data-tagihan="{{data}}" total-pengeluaran="{{pengeluaranTotal}}" data-tambah="{{dataTambah}}" data-edit="{{dataEdit}}"></tagihan-data>
      <tagihan-list data="{{data}}" total-pengeluaran="{{pengeluaranTotal}}"></tagihan-list>
      <tagihan-tambah data-tambah="{{dataTambah}}"></tagihan-tambah>
      <tagihan-edit data-edit="{{dataEdit}}"></tagihan-edit> -->
    `;
  }

  static get is() {
    return 'deposit-tagihan';
  }
}

customElements.define(depositTagihan.is, depositTagihan);
