const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Entry = require('../models/Entry');
const Payment = require('../models/Payment');
const puppeteer = require('puppeteer');

// generate single-customer invoice PDF for a month
router.get('/invoice/:customerId', async (req,res)=>{
  const {customerId} = req.params;
  const month = req.query.month; // YYYY-MM
  // fetch summary (reuse logic) - simple here
  const start = new Date(month + '-01');
  const end = new Date(start); end.setMonth(end.getMonth()+1);
  const customer = await Customer.findById(customerId);
  const entries = await Entry.find({customerId, date: {$gte:start, $lt:end}}).sort({date:1});
  const payments = await Payment.find({customerId, date: {$gte:start, $lt:end}}).sort({date:1});
  const totalCharges = entries.reduce((s,e)=> s + (e.total||0), 0);
  const totalPaid = payments.reduce((s,p)=> s + p.amount, 0);
  const due = totalCharges - totalPaid;

  // Render a simple HTML invoice
  const html = `
  <html><body>
    <h1>Invoice for ${customer.name} — ${month}</h1>
    <p>Phone: ${customer.phone}</p>
    <table border=1 cellpadding=6 cellspacing=0>
      <tr><th>Date</th><th>Details</th><th>Total</th></tr>
      ${entries.map(en=> `<tr><td>${en.date.toISOString().slice(0,10)}</td><td>${JSON.stringify(en.milk)} ${JSON.stringify(en.extras)}</td><td>${en.total}</td></tr>`).join('')}
    </table>
    <p>Total: ${totalCharges}</p>
    <p>Paid: ${totalPaid}</p>
    <p>Due: ${due}</p>
  </body></html>`;

  // create PDF via Puppeteer
  (async ()=>{
    const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.setContent(html, {waitUntil:'networkidle0'});
    const pdfBuffer = await page.pdf({format:'A4'});
    await browser.close();
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
    res.send(pdfBuffer);
  })();
});

// manual notifications trigger (stub) -> returns CSV body so admin can copy
router.post('/notify/manual', async (req,res)=>{
  const {month} = req.body; // YYYY-MM
  const start = new Date(month + '-01');
  const end = new Date(start); end.setMonth(end.getMonth()+1);
  const customers = await Customer.find();
  const rows = [];
  for(const c of customers){
    const entries = await Entry.find({customerId:c._id, date:{$gte:start, $lt:end}});
    const payments = await Payment.find({customerId:c._id, date:{$gte:start, $lt:end}});
    const totalCharges = entries.reduce((s,e)=> s + (e.total||0), 0);
    const totalPaid = payments.reduce((s,p)=> s + p.amount, 0);
    const due = totalCharges - totalPaid;
    const message = `Namaste ${c.name}, aapka ${month} bill ${totalCharges} Rs. Due: ${due}. Invoice: ${process.env.BASE_URL}/api/admin/invoice/${c._id}?month=${month}`;
    rows.push({phone:c.phone, message});
  }
  // return CSV-like text
  const csv = rows.map(r=> `${r.phone},"${r.message}"`).join('\n');
  res.set('Content-Type','text/plain').send(csv);
});

module.exports = router;
