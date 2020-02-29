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
                margin: 0 auto 21px;
                padding: 16px 0 16px 0;
                /*max-width: 600px;*/
            }

            div.banner {
                margin: 0;
                height: 5px;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
            }

            @media (min-width: 601px) {
                paper-material {
                    margin-bottom: 16px;
                    padding-left: 30px;
                    padding-right: 30px;
                }
            }

            @media (max-width: 600px) {
                paper-material {
                    --menu-container-display: none;
                    padding-left: 16px;
                    padding-right: 16px;
                }
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
