import { Router, type Request, type Response } from "express";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware } from "../middleware/auth.js";
import type { ThemeConfig } from "@resume-gen/shared";
import { LAYOUTS, COLOR_SCHEMES, FONT_FAMILIES, DEFAULT_THEME } from "@resume-gen/shared";

export const extractThemeRouter: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, PNG, JPEG, and WebP files are allowed"));
    }
  },
});

const anthropic = new Anthropic();

extractThemeRouter.post(
  "/",
  authMiddleware,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const base64 = req.file.buffer.toString("base64");

      // Determine media type for Claude Vision
      let mediaType: "image/png" | "image/jpeg" | "image/webp" | "application/pdf";
      if (req.file.mimetype === "image/png") mediaType = "image/png";
      else if (req.file.mimetype === "image/jpeg") mediaType = "image/jpeg";
      else if (req.file.mimetype === "image/webp") mediaType = "image/webp";
      else mediaType = "application/pdf";

      const layoutOptions = LAYOUTS.map((l) => `"${l.id}" (${l.description})`).join(", ");
      const colorOptions = COLOR_SCHEMES.map((c) => `"${c.id}" (${c.description}, primary: ${c.palette.primary})`).join(", ");
      const fontOptions = FONT_FAMILIES.map((f) => `"${f.id}" (${f.description})`).join(", ");

      const contentBlock: any = req.file.mimetype === "application/pdf"
        ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
        : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              {
                type: "text",
                text: `Analyze this resume's visual style and pick the closest match from these options.

Layout options: ${layoutOptions}
Color scheme options: ${colorOptions}
Font options: ${fontOptions}

Respond with ONLY a JSON object: {"layout": "...", "colorScheme": "...", "fontFamily": "..."}`,
              },
            ],
          },
        ],
      });

      const text = message.content[0].type === "text" ? message.content[0].text : "";
      const jsonMatch = text.match(/\{[^}]+\}/);
      if (!jsonMatch) {
        res.json(DEFAULT_THEME);
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const themeConfig: ThemeConfig = {
        layout: LAYOUTS.some((l) => l.id === parsed.layout) ? parsed.layout : "modern",
        colorScheme: COLOR_SCHEMES.some((c) => c.id === parsed.colorScheme) ? parsed.colorScheme : "coral",
        fontFamily: FONT_FAMILIES.some((f) => f.id === parsed.fontFamily) ? parsed.fontFamily : "sans",
      };

      res.json(themeConfig);
    } catch (error) {
      console.error("Theme extraction error:", error);
      res.status(500).json({ message: "Failed to extract theme" });
    }
  }
);
