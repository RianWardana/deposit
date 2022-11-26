import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

import '@material/mwc-dialog/mwc-dialog.js';
import '@material/mwc-fab/mwc-fab.js';
import '@material/mwc-icon-button/mwc-icon-button.js';
import '@material/mwc-list/mwc-list.js';
import '@material/mwc-list/mwc-list-item.js';

import '@polymer/paper-checkbox';  
import '@polymer/paper-dialog';

import '@vaadin/tabs/theme/material/vaadin-tabs.js';
import '@vaadin/combo-box/theme/material/vaadin-combo-box.js';
import '@vaadin/integer-field/theme/material/vaadin-integer-field.js';   

import './rekening-list.js';
import './rekening-item.js';
import './rekening-tambah.js';

import './tagihan-list.js';
import './tagihan-item.js';
import './tagihan-tambah.js';
import './tagihan-edit.js';

class appDeposit extends LitElement {
    static get properties() {
        return {
            tab_sekarang: String,
            uid: String,
            tabs: Array,
            dataEdit: Object,
            mutasiBaru: Object
        }
    }

    static get styles() {
        return [styles, css`
            :host {
                display: block;
            }

            vaadin-tab {
                text-decoration: none;
                font-weight: normal;
                color: #fff;
            }

            vaadin-tab:focus {
                text-decoration: none;
                font-weight: normal;
                color: #fff;
            }

            vaadin-tab[selected] {
                box-shadow: inset 0 -2px 0 0 #fff;
            }

            app-header {
                background-color: var(--app-primary-color);
                color: #fff;
                position: sticky;
            }
        `];
    }

    render() {
        return html`
            <app-header-layout>
                <app-header id="app-header" fixed="" shadow="" slot="header">
                    <vaadin-tabs theme="equal-width-tabs" @selected-changed="${this.selectedChanged}">
                        <vaadin-tab>Pengeluaran</vaadin-tab>    
                        <vaadin-tab>Rekening</vaadin-tab>
                    </vaadin-tabs>
                </app-header>

                <!-- To do: ada padding-top 48px, hilang setelah klik halaman lain dulu -->
                
                <div id="pengeluaran">
                    <tagihan-list></tagihan-list>
                    <tagihan-tambah @mutasi-baru="${this.onMutasiBaru}"></tagihan-tambah>
                    <tagihan-edit .dataEdit="${this.dataEdit}"></tagihan-edit>
                </div>

                <div id="rekening">
                    <rekening-list></rekening-list>
                    <rekening-tambah .salinanPengeluaran="${this.mutasiBaru}"></rekening-tambah>
                </div>

            </app-header-layout>
        `;
    }

    constructor() {
        super();
        console.log("[LOADED] app-deposit");
        this.tabs = ['pengeluaran', 'rekening']
    }

    firstUpdated() {
        this.setupToolbar(); 

        this.addEventListener('tagihan-edit', e => {
            this.dataEdit = e.detail;
        })
    }

    setupToolbar() {
        this.shadowRoot.getElementById('app-header').style.top = '64px'
        window.that = this;
        window.addEventListener('scroll', function() {
            that.shadowRoot.getElementById('app-header').style.top = (window.pageYOffset <= 64 ? (64 - window.pageYOffset) : 0) + 'px';
        });
    }

    selectedChanged(e) {
        let selected = e.detail.value;

        // Hide semua page
        this.tabs.map(tab => {
            this.shadowRoot.getElementById(tab).style.display = 'none'
        })

        // Hanya show page yang dipilih
        this.shadowRoot.getElementById(this.tabs[selected]).style.display = 'block'
    }

    // hanya untuk handle salin pengeluaran ke rekening
    onMutasiBaru(e) {
        this.mutasiBaru = e.detail;
    }
}

customElements.define('app-deposit', appDeposit);