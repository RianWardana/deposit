// To-do: 
// 1. Ubah material polymer menjadi vaadin atau mwc
// 2. Ganti bundler ke Parcel karena polymer-cli lama deploy-nya di GitHub Action

import {LitElement, html, css} from 'lit-element';
import {styles} from './lit-styles.js';

import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-toolbar/app-toolbar';

import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-image';

import '@material/mwc-button/mwc-button.js';
import '@material/mwc-icon/mwc-icon.js';

import '@polymer/paper-material';  
import '@polymer/paper-spinner/paper-spinner'; 
import '@polymer/paper-toast';
import '@polymer/paper-toggle-button';

import './app-auth.js';

class mainApp extends LitElement {
    static get styles() {
        return [styles, css`
            :host {
                display: block;
                --app-primary-color: #1E88E5; /*500 065A9F*/
                --app-secondary-color: black;
                --mdc-theme-primary: #1E88E5;
            }

            app-drawer-layout:not([narrow]) [drawer-toggle] {
                display: none;
            }

            app-header {
                background-color: var(--app-primary-color);
                color: #fff;
            }

            div#pages > * {
                position: absolute;
                width: 100%;
            }

            /* iron-icon {
                margin-right: 12px;
            } */

            mwc-list-item, mwc-icon {
                color: var(--app-primary-color);
                font-weight: 500;
            }

            iron-selector > paper-item.iron-selected {
                background: #e3ecf6;
                color: var(--app-primary-color);
            }

            mwc-list-item#logout, mwc-list-item#logout > mwc-icon {
                color: #c0392b;
                font-weight: 500;
            }
        `]
    }

    render() {
        return html`
            <!-- litElement best practice: "properties down, events up" -->
            <div id="container">
                <app-auth 
                    @login-status-changed="${this.onLoginStatusChanged}"
                    .logoutRequest="${this.triggerLogout}">
                </app-auth>

                <div id="spinnerDeposit" class="spinnerContainer">
                    <paper-spinner id="spinner" active=""></paper-spinner>
                </div>

                <app-drawer-layout id="appdrawerlayout" fullbleed="">
                    <app-drawer id="appdrawer" slot="drawer">
                        <iron-image style="width:256px; height:225px;" sizing="cover" src="./img/drawer.png"></iron-image>
                        <mwc-list id="menuList" activatable @selected="${this._menuSelected}">
                            <mwc-list-item selected activated graphic="icon">
                                <slot>Deposit</slot>
                                <mwc-icon slot="graphic">format_list_bulleted</mwc-icon>
                            </mwc-list-item>
                            <mwc-list-item graphic="icon">
                                <slot>Ringkasan</slot>
                                <mwc-icon slot="graphic">insights</mwc-icon>
                            </mwc-list-item>
                            <mwc-list-item graphic="icon">
                                <slot>Pengaturan</slot>
                                <mwc-icon slot="graphic">tune</mwc-icon>
                            </mwc-list-item>
                            <hr>
                            <mwc-list-item id="logout" graphic="icon" @click="${this._tapLogOut}">
                                <slot>Log Out</slot>
                                <mwc-icon slot="graphic">logout</mwc-icon>
                            </mwc-list-item>
                        </mwc-list>
                    </app-drawer>
                
                    <app-header-layout>
                        <app-header slot="header">
                            <app-toolbar>
                                <mwc-icon-button icon="menu" drawer-toggle=""></mwc-icon-button>
                                <div main-title="" style="margin-left: 10px">${this.halaman_sekarang}</div>
                            </app-toolbar>
                        </app-header>

                        <div id="pages">
                            <app-deposit></app-deposit>
                            
                            <div>
                                <div id="spinnerRingkasan" class="horizontal layout center-justified">
                                    <paper-spinner id="spinner" active=""></paper-spinner>
                                </div>
                                <app-ringkasan></app-ringkasan>
                            </div>
                                
                            <!-- <div halaman="Dompet" id="spinnerDompet" class="horizontal layout center-justified">
                                <paper-spinner id="spinner" active=""></paper-spinner>
                            </div>
                            <app-dompet halaman="Dompet"></app-dompet> -->
                            
                            <div>
                                <div id="spinnerPengaturan" class="horizontal layout center-justified">
                                    <paper-spinner id="spinner" active=""></paper-spinner>
                                </div>
                                <app-pengaturan></app-pengaturan>
                            </div>
                        </div>
                
                        <div style="height: 120px"></div>
                    </app-header-layout>
                </app-drawer-layout>
            </div>
        `
    }

    static get properties() {
        return {
            halaman_sekarang: String,
            triggerLogout: Number
        };
    }

    constructor() {
        super();
        // window.thisMainApp = this;
        console.log("[READY] main-app");
    }

    firstUpdated() {
        this.updateContainerPage(1);
    }

    updateContainerPage(selectedPage) {
        let container = this.shadowRoot.getElementById('container')
        Array.from(container.children).forEach(child => child.style.display = 'none') 
        container.children[selectedPage].style.display = 'grid'
    }

    _menuSelected(e) {
        let index = e.detail.index
        this.updateMainPage(index)

        if (this.shadowRoot.getElementById('appdrawerlayout').narrow) 
            this.shadowRoot.getElementById('appdrawer').close();
    }

    updateMainPage(selectedPage) {
        let menuList = this.shadowRoot.getElementById('menuList')
        let pageTitle = menuList.children[selectedPage].children[0].innerHTML
        this.halaman_sekarang = pageTitle
        let pages = this.shadowRoot.getElementById('pages')

        // To-do: kalau pakai display: none scrollnya tidak luber tapi app-header 
        // di app-deposit hilang setiap import page baru (lazy load).
        // Kalau window berubah size, penyakit hilang
        Array.from(pages.children).forEach(child => child.style.display = 'none') 
        pages.children[selectedPage].style.display = 'block'

        // Lazy-loading halaman non-esensial
        // Apakah bisa pakai until(content,<spinner>)?
        if (pageTitle == 'Ringkasan') {
            if (!this.isRingkasanLoaded) {
                import('./app-ringkasan.js').then(() => {
                    console.log("[LOADED] app-ringkasan");
                    this.isRingkasanLoaded = true;
                    this.shadowRoot.getElementById('spinnerRingkasan').style.display = 'none';
                }).catch((reason) => {
                    console.log("app-ringkasan failed to load.", reason);
                });
            }
        }

        else if (pageTitle == 'Pengaturan') {
            if (!this.isPengaturanLoaded) {
                import('./app-pengaturan.js').then(() => {
                    console.log("[LOADED] app-pengaturan");
                    this.isPengaturanLoaded = true;
                    this.shadowRoot.getElementById('spinnerPengaturan').style.display = 'none';
                }).catch((reason) => {
                    console.log("app-pengaturan failed to load.", reason);
                });
            }
        }

        // else if (this.halaman_sekarang == 'Dompet') {
        //     if (!this.isDompetLoaded) {
        //         import('./app-dompet.js').then(() => {
        //             console.log("[LOADED] app-dompet");
        //             this.isDompetLoaded = true;
        //             this.$.spinnerDompet.remove();
        //         }).catch((reason) => {
        //             console.log("app-dompet failed to load.", reason);
        //         });
        //     }
        // }
    }

    onLoginStatusChanged(e) {
        this.updateContainerPage(e.detail)

        if (e.detail == 1) {
            import('./app-deposit.js').then(() => {
                this.updateContainerPage(2)
            }).catch((reason) => {
                console.log("app-deposit failed to load.", reason);
            });
        }
    }

    _tapLogOut() {
        this.triggerLogout = Math.random();
    }

    
}

customElements.define('main-app', mainApp);