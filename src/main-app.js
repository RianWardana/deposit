/* <link rel="import" href="../bower_components/platinum-sw/platinum-sw-register.html"> */
/* <link rel="import" href="../bower_components/platinum-sw/platinum-sw-cache.html"> */

import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-toolbar/app-toolbar';

import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@polymer/iron-icons/image-icons.js';
import '@polymer/iron-image';
import '@polymer/iron-pages';
import '@polymer/iron-selector/iron-selector';
// <link rel="import" href="../bower_components/iron-overlay-behavior/iron-overlay-behavior.html">

import '@polymer/neon-animation/neon-animated-pages';

import '@polymer/paper-button';    
import '@polymer/paper-checkbox';  
import '@polymer/paper-dialog';    
import '@polymer/paper-fab';       
import '@polymer/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item';
import '@polymer/paper-material';  
import '@polymer/paper-spinner/paper-spinner'; 
import '@polymer/paper-tabs';      
import '@polymer/paper-toast';
import '@polymer/paper-toggle-button';
// import '@material/mwc-tab-bar';
// import '@material/mwc-tab';
import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box.js';
import '@vaadin/vaadin-text-field/theme/material/vaadin-integer-field.js';    

import './shared-styles.js';
import './app-auth.js';
import './app-deposit.js';

// saat semua sudah convert ke LitElement, ganti bundler ke Parcel karena polymer-cli lama deploy-nya di GitHub Action

class mainApp extends PolymerElement {
    static get template() {
        return html`
            <style include="iron-flex iron-flex-alignment shared-styles">
                :host {
                    display: block;
                    --app-primary-color: #1E88E5; /*500 065A9F*/
                    --app-secondary-color: black;
                }

                app-drawer-layout:not([narrow]) [drawer-toggle] {
                    display: none;
                }

                app-header {
                    background-color: var(--app-primary-color);
                    color: #fff;
                }

                hr {
                    border: 0;
                    height: 1px;
                    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
                }

                iron-icon {
                    margin-right: 12px;
                }

                iron-selector > paper-item {
                    color: var(--app-primary-color);
                    font-weight: 500;
                    text-decoration: none;
                    outline-style:none;
                    box-shadow:none;
                    border-color:transparent;
                }

                iron-selector > paper-item.iron-selected {
                    background: #e3ecf6;
                    color: var(--app-primary-color);
                }

                iron-selector > paper-item#logout {
                    color: #c0392b;
                    font-weight: 500;
                }
            </style>

            <!-- litElement best practice: "properties down, events up" -->
            <neon-animated-pages selected="[[sudah_login]]">
                <app-auth 
                    on-login-status-changed="onLoginStatusChanged"
                    logout-request="{{triggerLogout}}">
                </app-auth>

                <app-drawer-layout id="appdrawerlayout" fullbleed="">
                    <app-drawer id="appdrawer" slot="drawer">
                        <iron-image style="width:256px; height:225px;" sizing="cover" src="./img/drawer.png"></iron-image>
                        <iron-selector attr-for-selected="halaman" selected="{{halaman_sekarang}}" on-iron-select="onMenuSelect"> <!-- saat sudah berhasil login dia tidak mau ke halaman "Deposit". Variabel {{halaman_sekarang}} iseng2 saya ganti asal. Eh bisa. saya ngga ngerti kenapa -->
                            <paper-item halaman="Deposit"><iron-icon icon="list"></iron-icon>Deposit</paper-item>
                            <paper-item halaman="Ringkasan"><iron-icon icon="timeline"></iron-icon>Ringkasan</paper-item>
                            <paper-item halaman="Dompet"><iron-icon icon="account-balance-wallet"></iron-icon>Dompet/Rekening</paper-item>
                            <paper-item halaman="Pengaturan"><iron-icon icon="image:tune"></iron-icon>Pengaturan</paper-item> <!-- icon "settings-ethernet" juga bagus -->
                            <hr>
                            <paper-item id="logout" on-tap="_tapLogOut"><iron-icon icon="exit-to-app"></iron-icon>Log out</paper-item>
                        </iron-selector>
                    </app-drawer>
                
                    <app-header-layout>
                        <app-header slot="header">
                            <app-toolbar>
                                <paper-icon-button icon="menu" drawer-toggle=""></paper-icon-button>
                                <div main-title="" style="margin-left: 10px">{{halaman_sekarang}}</div>
                            </app-toolbar>
                        </app-header>

                        <iron-pages attr-for-selected="halaman" selected="{{halaman_sekarang}}">
                            <app-deposit halaman="Deposit"></app-deposit>
                            
                            <div halaman="Ringkasan" id="spinnerRingkasan" class="horizontal layout center-justified">
                                <paper-spinner id="spinner" active=""></paper-spinner>
                            </div>
                            <app-ringkasan halaman="Ringkasan"></app-ringkasan>

                            <div halaman="Dompet" id="spinnerDompet" class="horizontal layout center-justified">
                                <paper-spinner id="spinner" active=""></paper-spinner>
                            </div>
                            <app-dompet halaman="Dompet"></app-dompet>
                            
                            <div halaman="Pengaturan" id="spinnerPengaturan" class="horizontal layout center-justified">
                                <paper-spinner id="spinner" active=""></paper-spinner>
                            </div>
                            <app-pengaturan halaman="Pengaturan"></app-pengaturan>
                        </iron-pages>
                
                        <div style="height: 120px"></div>
                    </app-header-layout>
                </app-drawer-layout>
            </neon-animated-pages>

            <platinum-sw-register auto-register="" clients-claim="" skip-waiting="" on-service-worker-installed="_swInstalled">
                <platinum-sw-cache default-cache-strategy="networkFirst">
                </platinum-sw-cache>
            </platinum-sw-register>
        `;
    }

    static get properties() {
        return {
            halaman_sekarang: { 
                type: String, 
                value: 'Deposit',
                observer: '_halamanChanged'
            },
            
            triggerLogout: {
                type: Number
            }
        };
    }

    ready() {
        super.ready();
        window.thisMainApp = this;
        console.log("[READY] main-app");
    }

    onLoginStatusChanged(e) {
        this.sudah_login = e.detail;
    }

    // Lazy-loading halaman non-esensial
    // Pakai until(content,<spinner>) lebih keren, nanti ya pas pakai LitElement
    _halamanChanged() {
        if (this.halaman_sekarang == 'Ringkasan') {
            if (!this.isRingkasanLoaded) {
                import('./app-ringkasan.js').then(() => {
                    console.log("[LOADED] app-ringkasan");
                    this.isRingkasanLoaded = true;
                    this.$.spinnerRingkasan.remove();
                }).catch((reason) => {
                    console.log("app-ringkasan failed to load.", reason);
                });
            }
        }

        else if (this.halaman_sekarang == 'Dompet') {
            if (!this.isDompetLoaded) {
                import('./app-dompet.js').then(() => {
                    console.log("[LOADED] app-dompet");
                    this.isDompetLoaded = true;
                    this.$.spinnerDompet.remove();
                }).catch((reason) => {
                    console.log("app-dompet failed to load.", reason);
                });
            }
        }

        else if (this.halaman_sekarang == 'Pengaturan') {
            if (!this.isPengaturanLoaded) {
                import('./app-pengaturan.js').then(() => {
                    console.log("[LOADED] app-pengaturan");
                    this.isPengaturanLoaded = true;
                    this.$.spinnerPengaturan.remove();
                }).catch((reason) => {
                    console.log("app-pengaturan failed to load.", reason);
                });
            }
        }
    }

    _tapLogOut() {
        this.triggerLogout = Math.random();
    }

    _swInstalled() {
        console.log("SW Installed")
    }

    onMenuSelect() {
        if (this.$.appdrawerlayout.narrow) 
            this.$.appdrawer.close();
    }
}

customElements.define('main-app', mainApp);