// src/components/SummaryModal.js

import React, { useEffect, useState } from "react";
import axios from "axios";

function SummaryModal({ customer, onClose, API_URL, token }) {
  const [summary, setSummary] = useState(null);
  const [month, setMonth] = useState("");

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers/${customer._id}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { month: month || undefined },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary", err);
    }
  };

  useEffect(() => {
    if (customer) fetchSummary();
  }, [customer, month]);

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Customer Summary: {customer.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="month" className="form-label">
                Select Month
              </label>
              <input
                type="month"
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="form-control"
              />
            </div>

            {summary ? (
              <div>
                <h6>Entries</h6>
                <ul>
                  {summary.entries.map((entry) => (
                    <li key={entry._id}>
                      {new Date(entry.date).toLocaleDateString()} - Milk:{" "}
                      {entry.milk.map((m) => (
                        <span key={m.type}>
                          {m.type}: {m.qty} liters @ ₹{m.ratePerLitre} per L,
                        </span>
                      ))}
                      {entry.extras.map((extra) => (
                        <span key={extra.name}>
                          Extra {extra.name}: {extra.qty} units @ ₹{extra.rate}
                        </span>
                      ))}
                      <br />
                      Total: ₹{entry.total}
                    </li>
                  ))}
                </ul>

                <h6>Payments</h6>
                <ul>
                  {summary.payments.map((payment) => (
                    <li key={payment._id}>
                      {new Date(payment.date).toLocaleDateString()} - ₹{payment.amount} - {payment.method}
                    </li>
                  ))}
                </ul>

                <h6>Total Charges: ₹{summary.totalCharges}</h6>
                <h6>Total Paid: ₹{summary.totalPaid}</h6>
                <h6>Due: ₹{summary.due}</h6>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryModal;
