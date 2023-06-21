import express from "express";
import intelipost from "./intelipostRoutes.js";
import cors from "cors";

const routes = (app) => {
  app.route('/').get((req, res) => {
    res.status(200).send({titulo: "API Miligrama"})
  })

  app.use( 
    cors({
      origin: '*'
    }),
    express.json(),
    express.urlencoded(),
    intelipost
  )
}

export default routes;