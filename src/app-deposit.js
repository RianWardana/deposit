import {PolymerElement, html} from '@polymer/polymer';

import './rekening-list.js';
import './rekening-item.js';
import './rekening-tambah.js';

import './tagihan-data.js';
import './tagihan-list.js';
import './tagihan-item.js';
import './tagihan-tambah.js';
import './tagihan-edit.js';

// akan convert ke LitElement saat tagihan-data digabung dengan tagihan-list

class appDeposit extends PolymerElement {
    static get template() {
        return html`
            <style>
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
                }
            </style>

            <app-header-layout>
                <app-header id="appHeader" fixed="" shadow="" slot="header">
                    <paper-tabs attr-for-selected="tab" selected="{{tab_sekarang}}" noink="">
                        <paper-tab tab="rekening">REKENING</paper-tab>
                        <paper-tab tab="pengeluaran">PENGELUARAN</paper-tab>
                        <paper-tab tab="tunai">AKUN-AKUN</paper-tab>
                    </paper-tabs>
                </app-header>
                
                <iron-pages id="iron-pages-deposit" attr-for-selected="tab" selected="[[tab_sekarang]]">
                    <div tab="rekening">
                        <rekening-list></rekening-list>
                        <rekening-tambah salinan-pengeluaran="[[mutasiBaru]]"></rekening-tambah>
                    </div>
                    <div tab="pengeluaran">
                        <tagihan-data data-tagihan="{{data}}" total-pengeluaran="{{pengeluaranTotal}}" data-edit="[[dataEdit]]"></tagihan-data>
                        <tagihan-list data="[[data]]" total-pengeluaran="[[pengeluaranTotal]]"></tagihan-list>
                        <tagihan-tambah on-mutasi-baru="onMutasiBaru"></tagihan-tambah>
                        <tagihan-edit on-edit-pengeluaran="onEditPengeluaran"></tagihan-edit>
                    </div>
                </iron-pages>
            </app-header-layout>
        `;
    }

    static get properties() {
        return {
            tab_sekarang: { type: String, value: 'pengeluaran' },
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

    // hanya untuk handle salin pengeluaran ke rekening
    onMutasiBaru(e) {
        this.mutasiBaru = e.detail;
    }

    onEditPengeluaran(e) {
        this.dataEdit = e.detail;
    }
}

customElements.define('app-deposit', appDeposit);