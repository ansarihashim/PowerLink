import app from './app.js';
import { connectMongo } from './db/mongoose.js';
import { config } from './config/env.js';
import { Worker } from './models/Worker.js';
import { Loan } from './models/Loan.js';

async function backfillWorkers(){
  // Generate a pseudo Aadhaar: 12 digits starting with 6-9
  function genAadhaar(){
    const first = String(Math.floor(Math.random()*4)+6); // 6-9
    let rest=''; for(let i=0;i<11;i++) rest += Math.floor(Math.random()*10);
    return first+rest;
  }
  const defaults = {
    photo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="16" fill="%2310b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="60" fill="white">W</text></svg>'
  };
  const toUpdate = await Worker.find({ $or: [ { aadhaarNumber: { $exists:false } }, { aadhaarNumber: '' }, { photo: { $exists:false } }, { photo: '' } ] }).limit(500).exec();
  if(!toUpdate.length) return;
  const seen = new Set(await Worker.find({},{ aadhaarNumber:1, _id:0 }).then(d=> d.map(x=>x.aadhaarNumber).filter(Boolean)));
  const bulk = [];
  for(const w of toUpdate){
    const patch = {};
    if(!w.photo) patch.photo = defaults.photo;
    if(!w.aadhaarNumber){
      let a; do { a = genAadhaar(); } while(seen.has(a));
      seen.add(a); patch.aadhaarNumber = a;
    }
    if(Object.keys(patch).length) bulk.push({ updateOne: { filter:{ _id: w._id }, update:{ $set: patch } } });
  }
  if(bulk.length) await Worker.bulkWrite(bulk);
  console.log(`Backfilled ${bulk.length} workers with default photo / Aadhaar.`);
}

async function backfillLoanDueDates(){
  // Assign dueDate = loanDate + 30 days for any loan missing dueDate
  const toFix = await Loan.find({ $or:[ { dueDate: { $exists:false } }, { dueDate: null } ] }).limit(1000).exec();
  if(!toFix.length) return;
  const ops = toFix.map(l => {
    const base = l.loanDate ? new Date(l.loanDate) : new Date();
    const due = new Date(base.getTime() + 30*24*60*60*1000);
    return { updateOne: { filter:{ _id: l._id }, update:{ $set:{ dueDate: due } } } };
  });
  if(ops.length) await Loan.bulkWrite(ops);
  console.log(`Backfilled dueDate for ${ops.length} loans.`);
}

(async () => {
  try {
    await connectMongo();
    await backfillWorkers();
    await backfillLoanDueDates();
  app.listen(config.port, () => console.log(`API listening on :${config.port}`));
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
})();
