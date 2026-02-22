import { Router, type Request, type Response } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { parseFile, SUPPORTED_MIMETYPES } from "../services/parser.js";

export const uploadRouter: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (SUPPORTED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word (.docx), and text files are allowed"));
    }
  },
});

uploadRouter.post("/", authMiddleware, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const text = await parseFile(req.file.buffer, req.file.mimetype);
    res.json({
      filename: req.file.originalname,
      content: text,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to parse file",
    });
  }
});
