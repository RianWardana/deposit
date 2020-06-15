import {PolymerElement, html} from '@polymer/polymer';

class tagihanList extends PolymerElement {
  static get template() {
    return html`
        <style include="iron-flex iron-flex-alignment shared-styles">
            paper-material#paperMaterialTagihan {
                margin-top: 32px;
                margin-bottom: 16px;
                background: #4CAF50;
                color: #f7f7f7;
                max-height: 50px;
                transition: max-height 0.5s ease-out;
            }

			paper-material#paperMaterialTagihan:hover {
				max-height: 500px;
				transition: max-height 0.5s ease-in;
			}

            paper-material#paper-material-batas {
                margin-top: 16px;
                margin-bottom: 32px;
                background: #FFAB00;
                color: #f7f7f7;
                max-height: 24px;
                transition: max-height 0.5s ease-out;
            }

            paper-material#paper-material-batas:hover {
                max-height: 500px;
                transition: max-height 0.5s ease-in;
            }

            paper-spinner {
                --paper-spinner-layer-1-color: #FF9800;
                --paper-spinner-layer-2-color: #1E88E5;
                --paper-spinner-layer-3-color: #FF9800;
                --paper-spinner-layer-4-color: #1E88E5;
                position: fixed;
                padding-top: calc(50vh - 120px);
            }

            paper-button {
            	color: white;
                background: #5cb860;
                padding: 10px 20px;
                font-weight: 500;
                margin: 0;
                width: 100%;
            }

			.detilPengeluaran {
				margin-top: 32px;
			}

            span[role="button"] { color: #FFAB00; margin: 10px; }
        </style>
        
        <div class="horizontal layout center-justified">
            <paper-spinner id="spinner" active=""></paper-spinner>
        </div>

        <div class="narrow" id="list">
            <!-- PENGELUARAN BULAN INI (HIJAU) -->
            <paper-material id="paperMaterialTagihan">
            	<paper-ripple recenters=""></paper-ripple>
                <div class="horizontal layout">
                    <span>Pengeluaran bulan ini</span>
                    <span class="flex"></span>
                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.total)}}</b></span>
                </div>
                <div class="horizontal layout">
                    <span>Pengeluaran hari ini</span>
                    <span class="flex"></span>
                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.today)}}</b></span>
                </div>
                <div class="detilPengeluaran">
                	<div class="horizontal layout">
	                    <span>Pengeluaran makan</span>
	                    <span class="flex"></span>
	                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.makan)}}</b></span>
	                </div>
	                <div class="horizontal layout">
	                    <span>Pengeluaran transportasi</span>
	                    <span class="flex"></span>
	                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.transportasi)}}</b></span>
                    </div>
                    <div class="horizontal layout">
	                    <span>Pengeluaran utilities</span>
	                    <span class="flex"></span>
	                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.utilities)}}</b></span>
	                </div>
	                <div class="horizontal layout">
	                    <span>Pengeluaran lainnya</span>
	                    <span class="flex"></span>
	                    <span><b>Rp{{formatTotalTagihan(totalPengeluaran.lainnya)}}</b></span>
	                </div>
                </div>
            </paper-material>
            
            <!-- BATAS PENGELUARAN (KUNING) -->
            <paper-material id="paper-material-batas">
            	<paper-ripple recenters=""></paper-ripple>
                <div class="horizontal layout">
                    <span>Batas pengeluaran harian</span>
                    <span class="flex"></span>
                    <span><b>Rp{{formatBatas(totalPengeluaran.total)}}</b></span>
                </div>
                <div class="detilPengeluaran">
                    <div class="horizontal layout">
                        <span>Sisa alokasi makan</span>
                        <span class="flex"></span>
                        <span><b>Rp{{formatSisaPengeluaran(totalPengeluaran.makan, "makan")}}</b></span>
                    </div>
                    <div class="horizontal layout">
                        <span>Sisa alokasi transportasi</span>
                        <span class="flex"></span>
                        <span><b>Rp{{formatSisaPengeluaran(totalPengeluaran.transportasi, "transport")}}</b></span>
                    </div>
                    <div class="horizontal layout">
                        <span>Sisa alokasi lainnya</span>
                        <span class="flex"></span>
                        <span><b>Rp{{formatSisaPengeluaran(totalPengeluaran.lainnya, "lainnya")}}</b></span>
                    </div>
                </div>
            </paper-material>

            <!-- <paper-material>
                <paper-progress value="800" min="100" max="1000" class="red"></paper-progress>
            </paper-material> -->

            <template is="dom-repeat" items="{{data}}" as="item">
                <tagihan-item key="{{item.key}}" waktu="{{item.waktu}}" nama="{{item.nama}}" jumlah="{{item.jumlah}}">
                </tagihan-item>
            </template>

            <paper-button raised="" on-tap="_tapLunas">Lunasi Semua</paper-button>
        </div>
		
		<paper-toast id="toastLunas" duration="5000" text="Entri pengeluaran akan terhapus.">
			<span role="button" on-tap="_tapLunasConfirm">Lanjut</span>
		</paper-toast>
`;
  }

  static get is() {
      return 'tagihan-list';
  }

  static get properties() {
      return {
          data: { 
              type: Object,
              notify: true,
              observer: '_dataChanged'
          },

          defisitCarry: {
              type: Number,
              value: 0
          },

          totalPengeluaran: {
              type: Object
          }
      };
  }

  ready() {
      super.ready();
      this.addEventListener('neon-animation-finish', this._animationFinished);
      this.dataChangedCount = 0

      auth.onAuthStateChanged(firebaseUser => {
          if (firebaseUser) {
              this.dataChangedCount = 0
              this.$.spinner.style.display = 'block'
              this.$.list.style.display = 'none'  
          }
          else {
              this.dataChangedCount = -1
          }
      })
  }

  _dataChanged() {
      // Animation yang dijalankan saat awal //
      if (this.dataChangedCount == 0) {
          // this.playAnimation('exitSpinner')
          this.$.list.style.display = 'block';
          this.$.spinner.style.display = 'none';
          // this.playAnimation('entryList')
      }
      // Animation yang dijalankan saat ada perubahan data // 
      else {
          
      }
      
      this.dataChangedCount++
  }

  _animationFinished() {
      this.$.spinner.style.display = 'none';
  }

  formatTotalTagihan(total) {
      if (isNaN(total)) return 0;
      else return parseInt(total).toLocaleString('id-ID');
  }

  formatBatas(total) {
      var dateObject = new Date();
      var tanggal = dateObject.getDate();
      var hariTerakhir = new Date(dateObject.getFullYear(), dateObject.getMonth()+1, 0).getDate();
      var selisihHari = (hariTerakhir-tanggal < 1 ? 1 : hariTerakhir-tanggal);
      return parseFloat(((2250000-total) / selisihHari).toFixed(0)).toLocaleString('id-ID');
  }

  formatSisaPengeluaran(jumlah, jenis) {
      if (jenis == "makan") var alokasi = 912000;
      else if (jenis == "transport") var alokasi = 990000;
      else var alokasi = 348000;

      var sisaPengeluaran = alokasi - jumlah - this.defisitCarry;
      this.defisitCarry = (sisaPengeluaran > 0 ? 0 : Math.abs(sisaPengeluaran));
      return parseFloat((sisaPengeluaran > 0 ? sisaPengeluaran : 0)).toLocaleString('id-ID');
  }

  _tapLunas() {
      this.$.toastLunas.open();
  }

  _tapLunasConfirm() {
      thisTagDat.lunasiSemua();
      this.$.toastLunas.close();
      //this.playAnimation('exitList');
  }
}

customElements.define(tagihanList.is, tagihanList);