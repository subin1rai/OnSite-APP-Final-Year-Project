-- AlterTable
ALTER TABLE `Payment` MODIFY `status` ENUM('completed', 'pending', 'paid') NOT NULL DEFAULT 'pending';
