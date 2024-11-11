import { css } from 'lit';

export const ledgerStyles = css`
  .modal {
    display: none;
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
`;
