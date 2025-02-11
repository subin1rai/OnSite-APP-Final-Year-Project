/*
  Warnings:

  - You are about to drop the column `shifts` on the `worker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `projectworker` ADD COLUMN `shifts` DOUBLE NULL;

-- AlterTable
ALTER TABLE `worker` DROP COLUMN `shifts`;
