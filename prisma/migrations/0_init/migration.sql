-- CreateTable
CREATE TABLE `results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invNumber` VARCHAR(255) NULL,
    `total` VARCHAR(255) NULL,
    `originalContent` TEXT NULL,
    `nasLocation` VARCHAR(255) NULL,
    `imagePath` VARCHAR(255) NULL,
    `status` VARCHAR(50) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

