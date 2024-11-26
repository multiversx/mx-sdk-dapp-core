import { css } from 'lit';

export const ledgerStyles = css`
  .modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
  }
  .modal-content {
    background-color: #ffffff;
    margin: 5% auto;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
  }
  .modal-header {
    text-align: center;
    margin-bottom: 20px;
  }
  .close {
    float: right;
    cursor: pointer;
    padding: 5px;
  }
  .account-list {
    width: 100%;
    min-height: 300px;
    position: relative;
  }
  .account-row {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
  }
  .account-row:hover {
    background-color: #f5f5f5;
  }
  .address {
    flex: 2;
    font-family: monospace;
  }
  .balance {
    flex: 1;
    text-align: right;
  }
  .index {
    flex: 0 0 30px;
    text-align: right;
  }
  .navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  .access-button {
    display: block;
    width: 200px;
    margin: 20px auto;
    padding: 12px;
    background-color: #1a56db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  .access-button:disabled {
    background-color: #a1a1a1; /* Muted gray */
    color: #e0e0e0; /* Lighter text color */
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
    transform: none;
  }
  .spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .spinner::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .ledger-confirm-address {
    text-align: center;
    padding: 48px 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  @media (min-width: 768px) {
    .ledger-confirm-address {
      padding: 48px 40px;
    }
  }

  .ledger-confirm-address-heading {
    font-weight: 500;
    font-size: 24px;
    line-height: 1;
    margin-bottom: 12px;
  }

  .ledger-confirm-address-section {
    line-height: 1.5;
    margin-top: 40px;
    font-size: 16px;
  }

  .ledger-confirm-address-section .ledger-confirm-address-description {
    color: variables.$gray-700;
  }

  .ledger-confirm-address-section .ledger-confirm-address-data {
    color: variables.$black;
    margin: 8px 0;
    word-break: break-word;
    background-color: variables.$gray-500;
    padding: 12px;
    border-radius: 8px;
  }

  .ledger-confirm-address-footer {
    font-size: 14px;
    color: variables.$gray-700;
    line-height: 1.5;
    position: relative;
    margin-top: 40px;
    padding-top: 40px;
  }

  .ledger-confirm-address-footer::before {
    height: 1px;
    content: '';
    left: 0;
    bottom: 100%;
    right: 0;
    position: absolute;
    background-color: variables.$gray-700;
  }

  .ledger-confirm-address-footer a {
    color: variables.$primary;
  }
`;
