/*
  Warnings:

  - Added the required column `builderId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `worker` ADD COLUMN `builderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Worker` ADD CONSTRAINT `Worker_builderId_fkey` FOREIGN KEY (`builderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
