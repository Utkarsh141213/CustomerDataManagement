// src/components/EntryModal.js

import React, { useState } from "react";
import axios from "axios";

const EntryModal = ({ customer, onClose, API_URL, token }) => {
  const [milkQty, setMilkQty] = useState(""); // just quantity now
  const [milkType, setMilkType] = useState("Cow"); // optional, can hardcode or skip
  const [extras, setExtras] = useState([{ name: "", rate: "" }]);

  const submitEntry = async () => {
    try {
      const payload = {
        date: new Date(),
        milk: milkQty ? [{ type: milkType, qty: Number(milkQty) }] : [],
        extras: extras
          .filter((e) => e.name && e.rate)
          .map((e) => ({ name: e.name, rate: Number(e.rate) })),
      };

      await axios.post(
        `${API_URL}/api/customers/${customer._id}/entries`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Entry added successfully.");
      onClose();
    } catch (err) {
      console.error("Error submitting entry", err);
      alert("Failed to submit entry.");
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Add Entry for {customer.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Milk Section */}
            <h6>Milk Entry</h6>
            <div className="mb-3">
              <label className="form-label">Milk Quantity (litres)</label>
              <input
                type="number"
                className="form-control"
                value={milkQty}
                onChange={(e) => setMilkQty(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {/* Optional: Select type (Cow/Buffalo) */}
            <div className="mb-4">
              <label className="form-label">Milk Type</label>
              <select
                className="form-select"
                value={milkType}
                onChange={(e) => setMilkType(e.target.value)}
              >
                <option value="Cow">Cow</option>
                <option value="Buffalo">Buffalo</option>
              </select>
            </div>

            {/* Extras Section */}
            <h6>Extras</h6>
            {extras.map((extra, index) => (
              <div className="row mb-2" key={index}>
                <div className="col">
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="form-control"
                    value={extra.name}
                    onChange={(e) => {
                      const newExtras = [...extras];
                      newExtras[index].name = e.target.value;
                      setExtras(newExtras);
                    }}
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    placeholder="Price"
                    className="form-control"
                    value={extra.rate}
                    onChange={(e) => {
                      const newExtras = [...extras];
                      newExtras[index].rate = e.target.value;
                      setExtras(newExtras);
                    }}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      const newExtras = extras.filter((_, i) => i !== index);
                      setExtras(newExtras);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setExtras([...extras, { name: "", rate: "" }])}
            >
              + Add Extra
            </button>
          </div>

          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={submitEntry} className="btn btn-success">
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;
