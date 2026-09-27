// Penyimpanan data sederhana berbasis berkas JSON, sinkron.
// Cocok untuk satu instalasi/satu proses server (lihat Batasan #2 di PRD.md).
"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function filePathFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function all(collection) {
  ensureDataDir();
  const file = filePathFor(collection);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]\n", "utf8");
    return [];
  }
  const raw = fs.readFileSync(file, "utf8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Gagal membaca data/${collection}.json: ${err.message}`);
  }
}

function saveAll(collection, records) {
  ensureDataDir();
  const file = filePathFor(collection);
  fs.writeFileSync(file, JSON.stringify(records, null, 2) + "\n", "utf8");
  return records;
}

function find(collection, id) {
  return all(collection).find((row) => row.id === id) || null;
}

function query(collection, predicate) {
  const rows = all(collection);
  return predicate ? rows.filter(predicate) : rows;
}

function insert(collection, record) {
  const rows = all(collection);
  rows.push(record);
  saveAll(collection, rows);
  return record;
}

function update(collection, id, patch) {
  const rows = all(collection);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return null;
  rows[idx] = Object.assign({}, rows[idx], patch);
  saveAll(collection, rows);
  return rows[idx];
}

function remove(collection, id) {
  const rows = all(collection);
  const idx = rows.findIndex((row) => row.id === id);
  if (idx === -1) return false;
  rows.splice(idx, 1);
  saveAll(collection, rows);
  return true;
}

module.exports = { all, saveAll, find, query, insert, update, remove };
