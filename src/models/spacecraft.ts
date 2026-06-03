import { Document, Schema, model } from "mongoose";
import validator from "validator";


export interface spaceCraftDocumentInterface extends Document {
  name: string,
  registration: string,
  craftModel: string,
  capacity: number,
  avaibleSeats: number,
  status: "avaible" | "maintenance" | "in-flight" | "retired",
  certificationLevel: "orbital" | "lunar" | "planetary",
}

const SpaceCraftSchema = new Schema<spaceCraftDocumentInterface>({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: (value: string) => {
      if (!value.match(/^[A-Z]/)) {
        throw new Error('Note title must start with a capital letter');
      }
    }
  },
  registration: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  craftModel: {
    type: String,
    required: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    trim: true,
    min: 1
  },
  avaibleSeats: {
    type: Number,
    required: true,
    min: 0,
    validate(value: number){
      if(value > this.capacity){
        throw new Error("availableSeats cannot exceed capacity");
      }
    }
  },
  status: {
    type: String,
    required: true,
    trim: true,
    enum: ["available", "maintenance", "in-flight", "retired"]
  },
  certificationLevel: {
    type: String,
    required: true,
    enum: ["orbital", "lunar", "planetary"]
  }
});

export const SpaceCraft = model<spaceCraftDocumentInterface>(
  "SpaceCraft",
  SpaceCraftSchema
);