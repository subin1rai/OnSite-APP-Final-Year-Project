/*
  Warnings:

  - You are about to drop the column `shifts` on the `projectworker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendance` ADD COLUMN `shifts` DOUBLE NULL;

-- AlterTable
ALTER TABLE `projectworker` DROP COLUMN `shifts`;
