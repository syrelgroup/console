import { Router } from "express";
import * as Repo from "./repositories.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post("/kop/ocr", upload.single("file"), Repo.GETOCR);
router.post("/kop/summary", upload.single("file"), Repo.GETSUMMARY);

export default router;
