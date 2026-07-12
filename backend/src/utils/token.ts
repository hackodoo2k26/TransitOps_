import crypto from "crypto";

export const generateRandomToken = () => crypto.randomBytes(48).toString("hex");
export const hashToken = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

