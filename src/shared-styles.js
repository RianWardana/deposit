const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="shared-styles">
    <template>
        <style>
            div.banner.kredit { background-color: #4CAF50; }
            div.banner.debit { background-color: #FF9800; }

            /* UNTUK PAPER-MATERIAL */
            paper-material {
                background: white;
                border-radius: 2px;
                height: 100%;
                margin-bottom: 16px;
                padding: 16px 0 16px 0;
            }

            paper-spinner {
                --paper-spinner-layer-1-color: #FF9800;
                --paper-spinner-layer-2-color: #1E88E5;
                --paper-spinner-layer-3-color: #FF9800;
                --paper-spinner-layer-4-color: #1E88E5;
                position: fixed;
                padding-top: calc(50vh - 120px);
            }

            div.banner {
                margin: 0;
                height: 5px;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }

            @media (min-width: 641px) {
                paper-dialog {
                    left: 268px; /* it works but not optimal */
                }

                paper-toast {
                    margin-left: 268px;
                }
            }

            @media (min-width: 801px) {
                paper-material {
                    padding-left: 30px;
                    padding-right: 30px;
                }

                .narrow {
                    margin-left: 20%;
                    margin-right: 20%;
                }
            }

            @media (max-width: 800px) {
                paper-material {
                    padding-left: 16px;
                    padding-right: 16px;
                }

                .narrow {
                    // margin: 0px 16px;
                    margin-left: 16px;
                    margin-right: 16px;
                }
            }

            vaadin-combo-box { 
                margin-right: 20px;
                max-width: calc(60% - 10px);
            }

            vaadin-integer-field {
                max-width: calc(40% - 10px);
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
