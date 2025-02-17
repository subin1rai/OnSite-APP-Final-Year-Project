/*
  Warnings:

  - Added the required column `builderId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `builderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Vendor` ADD CONSTRAINT `Vendor_builderId_fkey` FOREIGN KEY (`builderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
