-- CreateTable
CREATE TABLE "Meter" (
    "customer_code" TEXT NOT NULL,
    "measure_uuid" TEXT NOT NULL PRIMARY KEY,
    "measure_datetime" TEXT NOT NULL,
    "measure_value" INTEGER NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL,
    "image_url" TEXT NOT NULL
);
