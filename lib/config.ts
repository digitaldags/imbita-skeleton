import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const filePath = path.join(process.cwd(), "wedding.config.yaml");
const raw = fs.readFileSync(filePath, "utf8");

export const config = yaml.load(raw) as WeddingConfig;

export type WeddingConfig = {
  couple: {
    partner1: string;
    partner2: string;
    date: string;
    location: string;
  };
  rsvpDeadline: string;
  hero: {
    images: string[];
  };
  sections: {
    ceremony: boolean;
    reception: boolean;
    attire: boolean;
    faq: boolean;
    rsvp: boolean;
  };
  ceremony: {
    name: string;
    address: string;
    date: string;
    time: string;
    note: string;
    mapsUrl: string;
    image: string;
  };
  reception: {
    name: string;
    address: string;
    time: string;
    note: string;
    mapsUrl: string;
    image: string;
  };
  attire: {
    dress: string;
    male: string;
    female: string;
    note: string;
    images: {
      male: string;
      female: string;
    };
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  email: {
    senderName: string;
    senderAddress: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
};
