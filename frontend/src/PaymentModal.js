// src/components/PaymentModal.js

import React, { useState } from "react";
import axios from "axios";

function PaymentModal({ customer, onClose, API_URL, token, onPaymentSuccess }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [ref, setRef] = useState("");

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/customers/${customer._id}/payments`,
        {
          amount: Number(amount),
          method,
          ref,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh customer list on success
      onPaymentSuccess();
      onClose();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to record payment.");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Record Payment for {customer.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <input
              type="number"
              placeholder="Amount Received"
              className="form-control mb-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="form-select mb-3"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Reference (optional)"
              className="form-control"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSubmit}>
              Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
