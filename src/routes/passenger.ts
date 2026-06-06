import express from "express";

import { Passenger } from "../models/passenger.js";

export const passengerRouter = express.Router();

passengerRouter.post("/passengers", async (req, res) => {

  const passenger = new Passenger(req.body);

  try {
    await passenger.save();
    res.status(201).send(passenger);
  } catch (error) {
    res.status(501).send(error);
  }

});

passengerRouter.get("/passengers", async (req, res) => {
  let filter: { fullName?: string, documentId?: string  } = {};
  
  try {

    if(req.query.fullName){
      filter.fullName = req.query.fullName.toString();
    }
    
    if(req.query.documentId){
      filter.documentId = req.query.documentId.toString();
    }
    
    const passenger = await Passenger.find(filter);

    if(passenger.length !== 0){
      res.send(passenger);
    } else {
      res.status(404).send({
        error: "Passenger not found"
      });
    }

  } catch(error) {
    res.status(500).send(error);
  }

});

passengerRouter.get("/passengers/:id", async (req, res) => {
  
  try {
    const passenger = await Passenger.findById(req.params.id);
    if(!passenger) {
      res.status(404).send({
        error: "Passenger not found"
      });
    } else {
      res.send(passenger);
    }

  } catch(error) {
    res.status(505).send(error);
  }

});


passengerRouter.patch("/passengers", async (req, res) => {

  if(!req.query.documentId) {
    res.status(400).send({
      error: "A documentId must be provided",
    });
  } else {
    const allowedUpdates = ["fullName", "documentId", "nationality", "certificationLevel", "medicalStatus", "complementedFlights", "email"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isValidUpdate) {
      res.status(400).send({
        error: "Update is not permitted",
      });
    } else {
      try {
        const passenger = await Passenger.findOneAndUpdate(
          {
            documentId: req.query.documentId.toString(),
          },
          req.body,
          {
            returnDocument: 'after',
            runValidators: true,
          },
        );

        if (passenger) {
          res.send(passenger);
        } else {
          res.status(404).send({
            error: "User not found"
          });
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});


passengerRouter.delete("/passengers", async (req, res) => {
  if (!req.query.documentId) {
    return res.status(400).send({
      error: "A documentId must be provided",
    });
  }

  try {
    const passengerDeleted = await Passenger.findOneAndDelete({
      documentId: req.query.documentId.toString(),
    });

    if (!passengerDeleted) {
      return res.status(404).send({
        error: "Passenger not found",
      });
    }

    res.send(passengerDeleted);

  } catch (error) {
    res.status(500).send(error);
  }
}); 
