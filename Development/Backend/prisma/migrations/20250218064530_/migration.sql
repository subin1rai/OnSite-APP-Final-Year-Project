/*
  Warnings:

  - Added the required column `image` to the `threeDModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `threedmodel` ADD COLUMN `image` VARCHAR(191) NOT NULL;
