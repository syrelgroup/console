import { Router } from "express";
import * as Controller from "./repositories.js";

const router = Router();

router.get("/activities", Controller.GETACTIVITIES);
router.get("/request", Controller.GETREQUEST);

export default router;
