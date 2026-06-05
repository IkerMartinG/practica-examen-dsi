import express from "express";

import { SpaceCraft } from "../models/spacecraft.js";

interface SpaceCraftFilter {
  name?: string;
  status?: string;
}

export const SpaceCraftRouter = express.Router();

SpaceCraftRouter.post("/spacecraft", async (req, res) => {
  
  try {
    const spacecraft = new SpaceCraft(req.body);
    await spacecraft.save();

    res.status(201).send(spacecraft);
  } catch(error) {
    res.status(501).send(error);
  }
});

SpaceCraftRouter.get("/spacecraft", async (req, res) => {
  try {
    // Buscar por name
    if (req.query.name) {
      const spacecraft = await SpaceCraft.find({
        name: req.query.name.toString(),
      });

      if (spacecraft.length === 0) {
        return res.status(404).send({ error: "Spacecraft not found" });
      }

      return res.send(spacecraft);
    }

    // Buscar por status
    if (req.query.status) {
      const spacecraft = await SpaceCraft.find({
        status: req.query.status as "avaible" | "maintenance" | "in-flight" | "retired",
      });

      if (spacecraft.length === 0) {
        return res.status(404).send({ error: "Spacecraft not found" });
      }

      return res.send(spacecraft);
    }

    // Si no hay query → devolver todos
    const all = await SpaceCraft.find();
    res.send(all);

  } catch (error) {
    res.status(500).send(error);
  }
});

SpaceCraftRouter.get("/spacecraft/:id", async (req, res) => {
  try {
    const spacecraft = await SpaceCraft.findById(req.params.id);
    if(spacecraft) {
      res.status(201).send(spacecraft);
    } else {
      res.status(404).send({
        error : "Sacecrafts not found"
      });
    }

  } catch (error) {
    res.status(500).send(error);
  }
});

SpaceCraftRouter.patch("/spacecraft", async (req, res) => {
  try {
    // 1. Validar que viene name en query
    if (!req.query.name) {
      return res.status(400).send({
        error: "A spacecraft name must be provided",
      });
    }

    // 2. Buscar la nave
    const spacecraft = await SpaceCraft.findOne({
      name: req.query.name.toString(),
    });

    if (!spacecraft) {
      return res.status(404).send({
        error: "Spacecraft not found",
      });
    }

    // 3. Validar campos permitidos
    const allowedUpdates = [
      "name",
      "registration",
      "model",
      "capacity",
      "availableSeats",
      "status",
      "certificationLevel",
    ];

    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      return res.status(400).send({
        error: "Update is not permitted",
      });
    }

    // 4. Actualizar
    const updatedSpacecraft = await SpaceCraft.findOneAndUpdate(
      { name: req.query.name.toString() },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    // 5. Responder
    res.send(updatedSpacecraft);

  } catch (error) {
    res.status(500).send(error);
  }
});

SpaceCraftRouter.delete("/spacecraft", async (req, res) => {

  if (!req.query.name) {
    return res.status(400).send({
      error: "A spacecraft name must be provided",
    });
  }
  try{
    // 2. Buscar la nave
    const spacecraft = await SpaceCraft.findOne({
      name: req.query.name.toString(),
    });

    if (!spacecraft) {
      return res.status(404).send({
        error: "Spacecraft not found",
      });
    }

    const deleteSpaceCraft = await SpaceCraft.findOneAndDelete({name: req.query.name.toString()});
    if(deleteSpaceCraft){
      res.send(spacecraft);
    }
  } catch (error){
    res.status(500).send(error);
  }

});