CREATE DATABASE supplychain_passport
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'scp_user'@'localhost' IDENTIFIED BY 'scp_password';

GRANT ALL PRIVILEGES ON supplychain_passport.* TO 'scp_user'@'localhost';
FLUSH PRIVILEGES;