/*
  Warnings:

  - You are about to drop the column `name` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `DocumentFiles` table. All the data in the column will be lost.
  - Added the required column `name` to the `DocumentFiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Document` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `DocumentFiles` DROP COLUMN `images`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
