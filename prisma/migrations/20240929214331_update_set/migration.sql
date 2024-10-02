/*
  Warnings:

  - Added the required column `measure_month` to the `Meter` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meter" (
    "customer_code" TEXT NOT NULL,
    "measure_uuid" TEXT NOT NULL PRIMARY KEY,
    "measure_datetime" TEXT NOT NULL,
    "measure_value" INTEGER NOT NULL,
    "measure_month" INTEGER NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN,
    "image_url" TEXT NOT NULL
);
INSERT INTO "new_Meter" ("customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid", "measure_value") SELECT "customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid", "measure_value" FROM "Meter";
DROP TABLE "Meter";
ALTER TABLE "new_Meter" RENAME TO "Meter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
