/*
  Warnings:

  - A unique constraint covering the columns `[shareid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `User_shareid_key` ON `User`(`shareid`);
