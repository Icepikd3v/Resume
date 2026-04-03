import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { getMongoDb } from "@/lib/mongo-client";

type EmbeddedUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatarUrl?: string;
  subscriptionTier?: string;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
};

type ModelFile = {
  _id: string;
  name: string;
  filename: string;
  printer: string;
  status: string;
  ownerId: string;
  createdAt: string;
};

type PrintJob = {
  _id: string;
  filename: string;
  printer: string;
  status: string;
  ownerId: string;
  createdAt: string;
};

type CharacterSubmission = {
  _id: string;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
  location: string;
  contactEmail: string;
  imageUrl: string;
  ownerId: string;
  createdAt: string;
};

type UfcFighter = {
  _id: string;
  name: string;
  region: string;
  league: string;
  record: { wins: number; losses: number };
  ownerId: string;
  createdAt: string;
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashPassword(raw: string) {
  const secret = process.env.JWT_SECRET || "embedded-dev-jwt-secret";
  return createHash("sha256").update(`${secret}:${raw}`).digest("hex");
}

async function ensureSeedData() {
  const db = await getMongoDb();
  const users = db.collection<EmbeddedUser>("embedded_users");
  const fighters = db.collection<UfcFighter>("embedded_ufc_fighters");

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ id: 1 }, { unique: true });
  await db.collection("embedded_models").createIndex({ ownerId: 1 });
  await db.collection("embedded_print_jobs").createIndex({ ownerId: 1 });
  await db.collection("embedded_characters").createIndex({ ownerId: 1 });
  await fighters.createIndex({ ownerId: 1 });

  const existing = await users.findOne({ email: "icepikd3v@gmail.com" });
  if (!existing) {
    const seed: EmbeddedUser = {
      id: "u-seed-1",
      username: "Icepik Demo User",
      email: "icepikd3v@gmail.com",
      passwordHash: hashPassword("Admin12345!"),
      bio: "Demo profile running inside resume-site.",
      avatarUrl: "",
      subscriptionTier: "basic",
      isAdmin: false,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    await users.insertOne(seed);
  }

  const fighterCount = await fighters.countDocuments();
  if (!fighterCount) {
    await fighters.insertMany([
      {
        _id: "f-1",
        name: "Max Holloway",
        region: "USA",
        league: "Featherweight",
        record: { wins: 26, losses: 7 },
        ownerId: "seed",
        createdAt: nowIso()
      },
      {
        _id: "f-2",
        name: "Islam Makhachev",
        region: "Russia",
        league: "Lightweight",
        record: { wins: 26, losses: 1 },
        ownerId: "seed",
        createdAt: nowIso()
      }
    ]);
  }
}

export function issueToken(userId: string) {
  const secret = process.env.JWT_SECRET || "embedded-dev-jwt-secret";
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export async function getUserFromToken(token: string | null) {
  if (!token) return null;
  const secret = process.env.JWT_SECRET || "embedded-dev-jwt-secret";
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;

  let payload: { sub?: string; exp?: number } = {};
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload?.sub || typeof payload.sub !== "string") return null;
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;

  await ensureSeedData();
  const db = await getMongoDb();
  const user = await db.collection<EmbeddedUser>("embedded_users").findOne({ id: payload.sub });
  return user || null;
}

export function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;
  return authHeader.replace(/^Bearer\s+/i, "").trim() || null;
}

export async function findUserByEmail(email: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  return db.collection<EmbeddedUser>("embedded_users").findOne({ email: email.trim().toLowerCase() });
}

export async function verifyUserPassword(user: EmbeddedUser, rawPassword: string) {
  return user.passwordHash === hashPassword(rawPassword);
}

export async function createUser(input: { username?: string; email: string; password: string }) {
  await ensureSeedData();
  const db = await getMongoDb();
  const email = input.email.trim().toLowerCase();
  const user: EmbeddedUser = {
    id: id("u"),
    username: input.username?.trim() || email.split("@")[0] || "user",
    email,
    passwordHash: hashPassword(input.password),
    bio: "",
    avatarUrl: "",
    subscriptionTier: "basic",
    isAdmin: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  await db.collection<EmbeddedUser>("embedded_users").insertOne(user);
  return user;
}

export async function updateUser(userId: string, patch: Partial<EmbeddedUser>) {
  await ensureSeedData();
  const db = await getMongoDb();
  const update = {
    ...patch,
    updatedAt: nowIso()
  };
  await db.collection<EmbeddedUser>("embedded_users").updateOne({ id: userId }, { $set: update });
  return db.collection<EmbeddedUser>("embedded_users").findOne({ id: userId });
}

export async function listModels(ownerId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  return db
    .collection<ModelFile>("embedded_models")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function addModel(input: { ownerId: string; filename: string; printer: string }) {
  await ensureSeedData();
  const db = await getMongoDb();
  const model: ModelFile = {
    _id: id("m"),
    name: input.filename,
    filename: input.filename,
    printer: input.printer || "EnderDirect",
    status: "uploaded",
    ownerId: input.ownerId,
    createdAt: nowIso()
  };
  await db.collection<ModelFile>("embedded_models").insertOne(model);
  return model;
}

export async function removeModel(ownerId: string, modelId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  const result = await db.collection<ModelFile>("embedded_models").deleteOne({ ownerId, _id: modelId });
  return result.deletedCount > 0;
}

export async function addPrintJob(input: { ownerId: string; filename: string; printer: string; status?: string }) {
  await ensureSeedData();
  const db = await getMongoDb();
  const job: PrintJob = {
    _id: id("p"),
    filename: input.filename,
    printer: input.printer,
    status: input.status || "Queued",
    ownerId: input.ownerId,
    createdAt: nowIso()
  };
  await db.collection<PrintJob>("embedded_print_jobs").insertOne(job);
  return job;
}

export async function listPrintJobs(ownerId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  return db
    .collection<PrintJob>("embedded_print_jobs")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function listCharacterSubmissions(ownerId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  return db
    .collection<CharacterSubmission>("embedded_characters")
    .find({ ownerId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function addCharacterSubmission(
  ownerId: string,
  input: {
    name: string;
    status: string;
    species: string;
    gender: string;
    origin: string;
    location: string;
    email: string;
    imageUrl?: string;
  }
) {
  await ensureSeedData();
  const db = await getMongoDb();
  const submission: CharacterSubmission = {
    _id: id("c"),
    name: input.name,
    status: input.status,
    species: input.species,
    gender: input.gender,
    origin: input.origin,
    location: input.location,
    contactEmail: input.email,
    imageUrl: input.imageUrl || "",
    ownerId,
    createdAt: nowIso()
  };
  await db.collection<CharacterSubmission>("embedded_characters").insertOne(submission);
  return submission;
}

export async function removeCharacterSubmission(ownerId: string, submissionId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  const result = await db.collection<CharacterSubmission>("embedded_characters").deleteOne({ ownerId, _id: submissionId });
  return result.deletedCount > 0;
}

export async function listUfcFighters() {
  await ensureSeedData();
  const db = await getMongoDb();
  return db
    .collection<UfcFighter>("embedded_ufc_fighters")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getUfcFighterById(fighterId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  return db.collection<UfcFighter>("embedded_ufc_fighters").findOne({ _id: fighterId });
}

export async function addUfcFighter(input: Omit<UfcFighter, "_id" | "createdAt"> & { _id?: string }) {
  await ensureSeedData();
  const db = await getMongoDb();
  const fighter: UfcFighter = {
    _id: input._id || id("f"),
    name: input.name,
    region: input.region,
    league: input.league,
    record: input.record,
    ownerId: input.ownerId,
    createdAt: nowIso()
  };
  await db.collection<UfcFighter>("embedded_ufc_fighters").insertOne(fighter);
  return fighter;
}

export async function updateUfcFighter(fighterId: string, patch: Partial<UfcFighter>) {
  await ensureSeedData();
  const db = await getMongoDb();
  await db.collection<UfcFighter>("embedded_ufc_fighters").updateOne({ _id: fighterId }, { $set: patch });
  return db.collection<UfcFighter>("embedded_ufc_fighters").findOne({ _id: fighterId });
}

export async function removeUfcFighter(fighterId: string) {
  await ensureSeedData();
  const db = await getMongoDb();
  const result = await db.collection<UfcFighter>("embedded_ufc_fighters").deleteOne({ _id: fighterId });
  return result.deletedCount > 0;
}
