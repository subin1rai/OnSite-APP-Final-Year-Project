-- AlterTable
ALTER TABLE `project` ADD COLUMN `clientName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `otp` VARCHAR(191) NULL,
    ADD COLUMN `otp_expiry` DATETIME(3) NULL;
