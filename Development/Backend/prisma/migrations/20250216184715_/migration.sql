-- CreateTable
CREATE TABLE `threeDModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelName` VARCHAR(191) NOT NULL,
    `modelUrl` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `threeDModel` ADD CONSTRAINT `threeDModel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `threeDModel` ADD CONSTRAINT `threeDModel_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
