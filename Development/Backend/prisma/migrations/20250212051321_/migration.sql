/*
  Warnings:

  - You are about to drop the column `type` on the `budget` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `budget` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `inHand` on the `budget` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `budget` DROP COLUMN `type`,
    MODIFY `amount` DOUBLE NOT NULL,
    MODIFY `inHand` DOUBLE NULL;
