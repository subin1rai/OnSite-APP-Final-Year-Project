/*
  Warnings:

  - You are about to alter the column `shifts` on the `worker` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `worker` MODIFY `shifts` DOUBLE NULL;
