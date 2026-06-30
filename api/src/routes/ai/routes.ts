import { Router } from "express";
import * as Repo from "./repositories.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const router = Router();

// router.post("/kop/ocr", upload.single("file"), Repo.GETOCR);
// router.post("/kop/summary", upload.single("file"), Repo.GETVERIFYSUMMARY);
router.post("/bank/slik", upload.single("file"), Repo.GETSLIKSUMMARY);

export default router;
