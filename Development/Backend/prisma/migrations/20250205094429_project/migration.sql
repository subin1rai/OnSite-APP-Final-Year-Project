/*
  Warnings:

  - You are about to drop the `_projecttoworker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_projecttoworker` DROP FOREIGN KEY `_ProjectToWorker_A_fkey`;

-- DropForeignKey
ALTER TABLE `_projecttoworker` DROP FOREIGN KEY `_ProjectToWorker_B_fkey`;

-- DropTable
DROP TABLE `_projecttoworker`;

-- CreateTable
CREATE TABLE `ProjectWorker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `workerId` INTEGER NOT NULL,
    `attendance` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectWorker` ADD CONSTRAINT `ProjectWorker_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectWorker` ADD CONSTRAINT `ProjectWorker_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `Worker`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
