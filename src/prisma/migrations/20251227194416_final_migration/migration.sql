/*
  Warnings:

  - Added the required column `invitedById` to the `ProjectInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `ProjectInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectInvite" ADD COLUMN     "invitedById" TEXT NOT NULL,
ADD COLUMN     "role" "ProjectRole" NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
