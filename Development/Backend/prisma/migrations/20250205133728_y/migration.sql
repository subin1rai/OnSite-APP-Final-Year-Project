/*
  Warnings:

  - You are about to drop the column `attendance` on the `projectworker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `projectworker` DROP COLUMN `attendance`;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectWorkerId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_projectWorkerId_fkey` FOREIGN KEY (`projectWorkerId`) REFERENCES `ProjectWorker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
