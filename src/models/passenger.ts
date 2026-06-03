import { Document, Schema, model } from "mongoose";
import validator from "validator";


export interface passengerDocumentInterface extends Document {
  fullName: string,
  documentId: string,
  nationality: string,
  certificationLevel: "none" | "orbital" | "lunar" | "planetary",
  medicalStatus: "fit" | "fit-with-restictions" | "unfit",
  complementedFlights: number,
  email: string
}

const passengerSchema = new Schema<passengerDocumentInterface> ({
  fullName: {
    type: String,
    requied: true,
    trim: true
  },
  documentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nationality: {
    type: String,
    requied: true,
    trim: true
  },
  certificationLevel: {
    type: String,
    requied: true,
    trim: true,
    enum: ["none", "orbital", "lunar", "planetary"]

  },
  medicalStatus: {
    type: String,
    requied: true,
    trim: true,
    enum: ["fit", "fit-with-restictions", "unfit"]
  },
  complementedFlights: {
    type: Number,
    required: true,
    min: 0
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate(value: string) {
      if (!validator.default.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    } 
  }

});

export const Passenger = model<passengerDocumentInterface>("Passenger", passengerSchema);