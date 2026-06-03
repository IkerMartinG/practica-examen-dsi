import express from "express";
import "./db/mongoose.js";


// import { medicationRouter } from "./routes/medication.js";
// import { patientRouter } from "./routes/patient.js";
// import { staffRouter } from "./routes/staff.js"
// import { recordRouter } from "./routes/record.js"
// import { defaultRouter } from "./routes/default.js";


export const app = express();

app.use(express.json());


// app.use(medicationRouter);
// app.use(patientRouter);
// app.use(staffRouter);
// app.use(recordRouter);
// app.use(defaultRouter);

