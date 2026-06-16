import type { Tool } from "./types";
import UnixTimeConverter from "./unix-time/UnixTimeConverter";
import JwtTool from "./jwt/JwtTool";
import Base64Tool from "./base64/Base64Tool";
import UuidTool from "./uuid/UuidTool";
import RandomStringTool from "./random-string/RandomStringTool";
import JsonBeautify from "./json/JsonBeautify";
import HashGenerator from "./hash-generator/HashGenerator";

/**
 * The single source of truth for all tools.
 *
 * To add a new tool:
 *   1. Create `src/tools/<name>/<Name>.tsx` exporting a default React component.
 *   2. Add one entry to this array.
 * The sidebar nav and the router both read from here automatically.
 */
export const tools: Tool[] = [
  {
    id: "unix-time",
    name: "Unix Time",
    description: "Convert between epoch timestamps and human dates",
    path: "/unix-time",
    component: UnixTimeConverter,
  },
  {
    id: "jwt",
    name: "JWT",
    description: "Decode and encode JSON Web Tokens",
    path: "/jwt",
    component: JwtTool,
  },
  {
    id: "base64",
    name: "Base64",
    description: "Encode and decode Base64 (UTF-8 safe)",
    path: "/base64",
    component: Base64Tool,
  },
  {
    id: "uuid",
    name: "UUID v4",
    description: "Generate RFC-4122 v4 UUIDs",
    path: "/uuid",
    component: UuidTool,
  },
  {
    id: "random-string",
    name: "Random String",
    description: "Generate random strings with custom charset and length",
    path: "/random-string",
    component: RandomStringTool,
  },
  {
    id: "json",
    name: "JSON Beautify",
    description: "Format, indent and minify JSON",
    path: "/json",
    component: JsonBeautify,
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes",
    path: "/hash-generator",
    component: HashGenerator,
  },
];
