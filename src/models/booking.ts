import { Document, Schema, Types, model } from "mongoose";
import { spaceCraftDocumentInterface } from "./spacecraft.js"
import { passengerDocumentInterface } from "./passenger.js";

interface BookingPassenger {
  passenger: passengerDocumentInterface,
  seatType: "tourist" | "tourist-plus" | "vip"
}

interface bookingDocumentInterface extends Document {
  spaceCraft: spaceCraftDocumentInterface,
  passengers: BookingPassenger[],
  departureDate: Date,
  destination: "low-orbit" | "orbital-station" | "lunar-orbit" | "mars-orbit",
  pricePerSeat: number,
  totalAmount: number,
  status: "confirmed" | "cancelled",
  createdAt: Date
}

const BookingSchema = new Schema<bookingDocumentInterface> ({
  spaceCraft: {
    type: Types.ObjectId,
    red: "SpaceCraft",
    required: true
  },
  passengers: [
    {
      passenger: {
        type: Types.ObjectId,
        ref: "Passenger",
        required: true
      },
      seatType: {
        type: String,
        required: true,
        enum: ["tourist", "tourist-plus", "vip"]
      }
    }
  ],
  departureDate: {
    type: Date,
    required: true
  },
  destination: {
    type: String,
    required: true,
    enum: ["low-orbit", "orbital-station", "lunar-orbit", "mars-orbit"]
  },
  pricePerSeat: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["confirmed", "cancelled"]
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export const Booking = model<bookingDocumentInterface>("Booking", BookingSchema);