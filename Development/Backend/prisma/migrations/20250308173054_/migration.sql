/*
  Warnings:

  - Added the required column `name` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Document` ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DocumentFiles` MODIFY `name` VARCHAR(191) NULL;
