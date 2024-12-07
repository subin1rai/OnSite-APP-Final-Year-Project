/*
  Warnings:

  - You are about to drop the column `name` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `transaction` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `vendor` table. All the data in the column will be lost.
  - Added the required column `builderId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TransactionName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VendorName` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `project` DROP COLUMN `name`,
    ADD COLUMN `builderId` INTEGER NOT NULL,
    ADD COLUMN `ownerName` VARCHAR(191) NOT NULL,
    ADD COLUMN `projectName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `name`,
    ADD COLUMN `TransactionName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `vendor` DROP COLUMN `name`,
    ADD COLUMN `VendorName` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_builderId_fkey` FOREIGN KEY (`builderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
