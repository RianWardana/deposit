import {css} from 'lit-element';

// semacam shared-styles.js tapi untuk lit-element, keduanya harus sinkron
export const styles = css`
    .flexSpaceBetween {
        display: flex;
        justify-content: space-between;
    }

    .spinnerContainer {
        display: flex;
        justify-content: center;
    }

    hr {
        border: 0;
        height: 1px;
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
    }

    paper-dialog {
        margin: 20px;
    }

    mwc-fab {
        color: #4CAF50;
        position: fixed;
        right: 5%;
        bottom: 5%;
    }

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
        top: calc(50vh - 20px);
        left: calc(50vw - 20px);
    }

    @media (min-width: 641px) {
        paper-dialog {
            left: calc(50vw + 108px - 194px);
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
            margin-left: auto;
            margin-right: auto;
            max-width: 500px;
        }
    }

    @media (max-width: 800px) {
        paper-material {
            padding-left: 16px;
            padding-right: 16px;
        }

        .narrow {
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
`; 