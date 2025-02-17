/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vendor` DROP COLUMN `imageUrl`,
    ADD COLUMN `companyName` VARCHAR(191) NULL;
