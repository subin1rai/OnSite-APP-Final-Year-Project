/*
  Warnings:

  - Added the required column `pidx` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `pidx` VARCHAR(191) NOT NULL,
    ADD COLUMN `transactionId` VARCHAR(191) NOT NULL;
