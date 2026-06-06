import express from "express";

import { Booking } from "../models/booking.js";
import { Passenger } from "../models/passenger.js";
import { SpaceCraft } from "../models/spacecraft.js"

export const bookingRouter = express.Router();


bookingRouter.get("/bookings", async (req, res) => {
  try {
    let filter: any
     = {};

    // 1. Buscar por documentId del pasajero
    if (req.query.documentId) {
      const passenger = await Passenger.findOne({
        documentId: req.query.documentId.toString(),
      });

      if (!passenger) {
        return res.status(404).send({ error: "Passenger not found" });
      }

      filter["passengers.passenger"] = passenger._id;
    }

    // 2. Buscar por rango de fechas
    if (req.query.from && req.query.to) {
      const from = Number(req.query.from);
      const to = Number(req.query.to);

      filter.departureDate = { $gte: from, $lte: to };
    }

    // 3. Si no se ha pasado ningún filtro → error
    if (Object.keys(filter).length === 0) {
      return res.status(400).send({
        error: "You must provide a passenger documentId or a date range (from & to)",
      });
    }

    // 4. Buscar reservas con populate
    const bookings = await Booking.find(filter)
      .populate("spacecraft")
      .populate("passengers.passenger");

    if (bookings.length === 0) {
      return res.status(404).send({ error: "Booking not found" });
    }

    res.send(bookings);

  } catch (error) {
    res.status(500).send(error);
  }
});


bookingRouter.post("/bookings", async (req, res) => {
  try {
    const { registration, passengers, departureDate, destination, pricePerSeat } = req.body;

    // 1. Verificar que la nave existe y está available
    const spacecraft = await SpaceCraft.findOne({ registration });
    if (!spacecraft) {
      return res.status(404).send({ error: "Spacecraft not found" });
    }
    if (spacecraft.status !== "avaible") {
      return res.status(400).send({ error: "Spacecraft is not available" });
    }

    // 2. Comprobar plazas disponibles
    if (passengers.length > spacecraft.avaibleSeats) {
      return res.status(400).send({ error: "Not enough available seats" });
    }

    // 3. Verificar pasajeros y medicalStatus
    const passengerIds: Types.ObjectId[] = [];

    for (const p of passengers) {
      const passenger = await Passenger.findOne({ documentId: p.documentId });

      if (!passenger) {
        return res.status(404).send({ error: `Passenger ${p.documentId} not found` });
      }

      if (passenger.medicalStatus === "unfit") {
        return res.status(400).send({ error: `Passenger ${p.documentId} is unfit` });
      }

      passengerIds.push(passenger._id);
    }

    // 4. Descontar plazas
    spacecraft.avaibleSeats -= passengers.length;
    await spacecraft.save();

    // 5. Calcular totalAmount
    let totalAmount = 0;
    for (const p of passengers) {
      let factor = 1;
      if (p.seatType === "tourist-plus") factor = 1.5;
      if (p.seatType === "vip") factor = 2.5;
      totalAmount += pricePerSeat * factor;
    }

    // 6. Crear reserva
    const booking = new Booking({
      spacecraft: spacecraft._id,
      passengers: passengers.map((p, i) => ({
        passenger: passengerIds[i],
        seatType: p.seatType
      })),
      departureDate,
      destination,
      pricePerSeat,
      totalAmount,
      status: "confirmed",
      createdAt: new Date()
    });

    await booking.save();
    res.status(201).send(booking);

  } catch (error) {
    res.status(500).send(error);
  }
});


bookingRouter.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("spacecraft")
      .populate("passengers.passenger");

    if (!booking) {
      return res.status(404).send({ error: "Booking not found" });
    }

    res.send(booking);

  } catch (error) {
    res.status(500).send(error);
  }
});


bookingRouter.patch("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).send({ error: "Booking not found" });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).send({ error: "Only confirmed bookings can be modified" });
    }

    // Si se cancela → restaurar plazas
    if (req.body.status === "cancelled") {
      const spacecraft = await SpaceCraft.findById(booking.spaceCraft);
      spacecraft.avaibleSeats += booking.passengers.length;
      await spacecraft.save();

      booking.status = "cancelled";
      await booking.save();
      return res.send(booking);
    }

    // Aplicar cambios
    Object.assign(booking, req.body);

    // Recalcular totalAmount si cambian pasajeros o pricePerSeat
    if (req.body.passengers || req.body.pricePerSeat) {
      let total = 0;
      for (const p of booking.passengers) {
        let factor = 1;
        if (p.seatType === "tourist-plus") factor = 1.5;
        if (p.seatType === "vip") factor = 2.5;
        total += booking.pricePerSeat * factor;
      }
      booking.totalAmount = total;
    }

    await booking.save();
    res.send(booking);

  } catch (error) {
    res.status(500).send(error);
  }
});


bookingRouter.delete("/bookings", async (req, res) => {

});