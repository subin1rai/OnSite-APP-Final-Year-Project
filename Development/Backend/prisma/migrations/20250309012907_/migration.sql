/*
  Warnings:

  - You are about to drop the column `documentId` on the `DocumentFiles` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `projectId` to the `DocumentFiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `DocumentFiles` DROP FOREIGN KEY `DocumentFiles_documentId_fkey`;

-- AlterTable
ALTER TABLE `DocumentFiles` DROP COLUMN `documentId`,
    ADD COLUMN `projectId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Document`;

-- AddForeignKey
ALTER TABLE `DocumentFiles` ADD CONSTRAINT `DocumentFiles_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
